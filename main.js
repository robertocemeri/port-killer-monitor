const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const { exec } = require('child_process');

let win;
let tray;
let processes = [];

// ----- Create main window -----
function createWindow() {

  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, 'icons', 'app-icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Port Killer Monitor',
  });

  // Set the dock name and icon for macOS
  if (process.platform === 'darwin') {
    app.dock.setIcon(path.join(__dirname, 'icons', 'app-icon.png'));
  }

  win.loadFile('index.html');
  win.setTitle('Port Killer Monitor');

  // Override default close → hide instead of quit
  win.on('close', (event) => {
    if (!app.isQuitting) {
      event.preventDefault();
      win.hide();
    }
  });
}

// ----- Kill with SIGTERM → SIGKILL fallback -----
function killProcess(pid) {
  try {
    process.kill(pid, 'SIGTERM');
    setTimeout(() => {
      try { process.kill(pid, 'SIGKILL'); } catch {}
    }, 2000);
  } catch {}
}

// Kill all PIDs in array
function killProcesses(pids) {
  pids.forEach(pid => killProcess(pid));
}

// ----- Scan ports 2000–10000 and deduplicate by port -----
function scanPorts() {
  const cmd = process.platform === 'win32'
    ? 'netstat -ano'
    : 'lsof -i -P -n';

  exec(cmd, (err, stdout) => {
    if (err) return;

    const lines = stdout.split('\n').slice(1);
    const found = [];

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (process.platform === 'win32') {
        if (parts.length >= 5) {
          const local = parts[1];
          const portMatch = local.split(':').pop();
          const port = parseInt(portMatch, 10);
          if (port >= 2000 && port <= 10000) {
            found.push({
              pid: parts[4],
              proto: parts[0],
              local,
              state: parts[3],
              port
            });
          }
        }
      } else {
        if (parts.length >= 9) {
          const name = parts[8];
          const portMatch = name.match(/:(\d+)->?/);
          const port = portMatch ? parseInt(portMatch[1], 10) : null;
          if (port && port >= 2000 && port <= 10000) {
            found.push({
              command: parts[0],
              pid: parts[1],
              user: parts[2],
              name,
              port
            });
          }
        }
      }
    });

    // Group by port
    const portMap = new Map();
    for (const proc of found) {
      if (!portMap.has(proc.port)) portMap.set(proc.port, []);
      portMap.get(proc.port).push(proc);
    }

    // Flatten for renderer
    processes = [];
    for (const [port, procs] of portMap.entries()) {
      processes.push({ port, procs });
    }

    // Send update to window
    if (win && !win.isDestroyed()) {
      win.webContents.send('process-update', processes);
    }
  });
}

// ----- Update tray menu -----
function updateMenu() {
  const items = [];

  if (processes.length === 0) {
    items.push({ label: "No processes in 2000-10000", enabled: false });
  } else {
    processes.forEach(group => {
      // Deduplicate PIDs for this port
      const uniquePIDs = [...new Set(group.procs.map(p => p.pid))];
      
      const label = `Port ${group.port} (${uniquePIDs.length} process${uniquePIDs.length > 1 ? 'es' : ''})`;

      items.push({
        label: label,
        submenu: uniquePIDs.map(pid => ({
          label: `${pid} | Kill`,
          click: () => killProcess(pid)
        }))
      });
    });
  }

  items.push({ type: 'separator' });
  items.push({ label: "Open Window", click: () => { if (win) win.show(); } });
  items.push({ label: "Kill All", click: () => {
    processes.forEach(group => {
      const uniquePIDs = [...new Set(group.procs.map(p => p.pid))];
      killProcesses(uniquePIDs);
    });
  }});

  // Quit → actually exit app
  items.push({ 
    label: "Quit", 
    click: () => {
      app.isQuitting = true;
      app.quit();
    } 
  });

  tray.setContextMenu(Menu.buildFromTemplate(items));

  // ----- Update tray icon color -----
  let count = 0;
  processes.forEach(group => {
    const uniquePIDs = [...new Set(group.procs.map(p => p.pid))];
    count += uniquePIDs.length;
  });

  let icon = "green.png";
  if (count >= 1 && count <= 9) icon = "red.png";
  if (count >= 10) icon = "orange.png";

  tray.setImage(path.join(__dirname, "icons", icon));
}

// ----- IPC handlers for window -----
ipcMain.handle('list-processes', async () => processes);

ipcMain.handle('kill-process', async (event, pid) => {
  killProcess(pid);
  return `Process ${pid} terminated`;
});

ipcMain.handle('kill-all', async () => {
  processes.forEach(group => killProcesses(group.procs.map(p => p.pid)));
  return "All processes terminated";
});

ipcMain.handle('manual-refresh', async () => {
  scanPorts();
  return processes;
});

// ----- Electron lifecycle -----
app.on('ready', () => {
  createWindow();

  tray = new Tray(path.join(__dirname, 'icons', 'green.png'));
  tray.setToolTip('Port Killer Monitor');
  tray.setTitle && tray.setTitle('Port Killer Monitor'); // For macOS

  setInterval(scanPorts, 5000);   // scan every 5s
  setInterval(updateMenu, 3000);  // update tray menu every 3s
});


