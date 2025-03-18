const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');

// Function to create the main application window
function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    // Load the Express server's URL
    win.loadURL('http://localhost:8888');
}

// Start the Express server
exec('node server.js', (error, stdout, stderr) => {
    if (error) {
        console.error(`Error starting server: ${error}`);
        return;
    }
    console.log(stdout);
});

// Create the window when Electron is ready
app.whenReady().then(createWindow);

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Recreate a window on macOS if the dock icon is clicked and no other windows are open
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
