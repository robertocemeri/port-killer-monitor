# Port Killer Monitor

Port Killer Monitor is a cross-platform Electron app to monitor and kill processes using ports 2000–10000.

## Features
- Scan and display processes using ports 2000–10000
- Kill individual processes or all at once
- Tray icon with status color
- Custom app icon and name
- Cross-platform builds (macOS, Linux, Windows)

## Installation
Download the latest installer for your platform from the [GitHub Releases](https://github.com/robertocemeri/port-killer-monitor/releases) page.

## Usage
- Launch the app from your Applications folder or extracted location.
- Use the tray icon to view and kill processes.

## Development
1. Clone the repo
2. Install dependencies: `npm install`
3. Start in dev mode: `npm start`

## Build
- macOS/Linux: `npm run dist -- -ml`
- Windows: `npm run dist -- -w` (requires Wine on macOS/Linux)