import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import path from 'path';
import { registerIpcHandlers, setStorageDirectory, getStorageDirectory } from '../main/ipc/handlers';

// Forge webpack magic constants
declare const MAIN_WINDOW_WEBPACK_ENTRY: string;
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const mainColor = '#1a49ba';
const secondaryColor = '#418edb';
const backgroundColor = 'rgb(24, 25, 26)';

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    show: false,
    backgroundColor: backgroundColor,

    height: 800,
    width: 1000,

    minHeight: 400,
    minWidth: 600,


    autoHideMenuBar: false,

    icon: path.join(app.getAppPath(), 'src/assets/images/icons/scratchlogo.ico'),

    titleBarOverlay: {
      color: backgroundColor,
      symbolColor: secondaryColor,
    },

    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  });

  const menu = new Menu();

  const file = new MenuItem({
    label: '&File',
    submenu: [
      {
        label: 'Import', submenu: [
          { label: 'Song' },
          { label: 'Playlist' },
          { label: 'Album' },
        ],
      },
      {
        label: 'Set Storage Directory',
        click() { setStorageDirectory(); },
      },
      { label: 'Exit', role: 'quit' },
    ],
  });

  const testing = new MenuItem({
    label: '&Dev Testing',
    submenu: [
      {
        label: 'Dev Tools',
        click() { mainWindow.webContents.openDevTools(); },
      },
      {
        label: 'Print Storage Dir',
        click() { console.log(getStorageDirectory()); },
      },
    ],
  });

  menu.append(file);
  menu.append(testing);
  Menu.setApplicationMenu(menu);

  mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });
};

app.on('ready', () => {
  registerIpcHandlers();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
