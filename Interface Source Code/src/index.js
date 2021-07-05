const { app, globalShortcut, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({

    //linux
    width: 600,
    height: 300,
    
    minWidth: 600,
    minHeight: 300,
    maxWidth: 600,
    maxHeight: 300,

    //windows
    /* width: 600,
    height: 300,
    
    minWidth: 600,
    minHeight: 358,
    maxWidth: 600,
    maxHeight: 358, */

    webPreferences: {
      nodeIntegration: true,
    }
  });

  // we dont like menus
  mainWindow.removeMenu();

  //web console
  /* mainWindow.webContents.openDevTools(); */

  // load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
