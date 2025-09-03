# What is Port Killer Monitor?

**Port Killer Monitor** is a simple, cross-platform desktop app that helps you monitor and manage processes using network ports on your computer.

## What does it do?
- **Scans your system** for processes using ports in the range 2000–10000.
- **Shows a list** of these processes in the app window and in a tray menu.
- **Lets you kill** individual processes or all processes using these ports with a single click.
- **Updates automatically** every few seconds to show the latest status.
- **Tray icon color** changes based on how many processes are found (green, red, orange).
- **Works on macOS, Linux, and Windows.**

## How does it work?
- Uses system commands (`lsof` on macOS/Linux, `netstat` on Windows) to find which processes are using ports 2000–10000.
- Groups and deduplicates processes by port.
- Lets you interact via the tray icon or the main app window.
- Communicates between the user interface and the backend using Electron's IPC system.

## Why would I use this?
- To quickly find and stop processes that are blocking important ports.
- To troubleshoot port conflicts for development or server work.
- To easily manage network resources without using the command line.

## How do I use it?
1. **Download and install** the app for your platform.
2. **Launch the app**. It will appear in your system tray.
3. **Click the tray icon** to see which processes are using ports 2000–10000.
4. **Kill processes** individually or all at once as needed.
5. **Open the main window** for a more detailed view if desired.

---

For more details, see the README or visit the [GitHub repository](https://github.com/robertocemeri/port-killer-monitor).
