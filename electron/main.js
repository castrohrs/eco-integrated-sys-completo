
const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store();
let mainWindow;
let tray;

// Configuração de ícone (tenta usar o da build ou fallback)
const iconPath = process.env.NODE_ENV === 'development'
  ? path.join(__dirname, '../public/vite.svg') 
  : path.join(process.resourcesPath, 'icon.png');

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
    show: false, // 👈 NÃO MOSTRA AO INICIAR (Inicia minimizado/oculto)
    autoHideMenuBar: true,
    icon: iconPath,
    backgroundColor: '#0f172a',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    }
  });

  // Carrega URL de dev ou arquivo de produção
  const startUrl = process.env.ELECTRON_START_URL || 'http://localhost:5173';
  mainWindow.loadURL(startUrl);

  // Comportamento de fechar: Esconder ao invés de matar (Tray pattern)
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // 🧠 CONFIGURAÇÃO DE AUTO-START
    const autoStart = store.get('autoStart', true);
    
    app.setLoginItemSettings({
      openAtLogin: autoStart,
      openAsHidden: true, // Importante para Windows
      path: app.getPath('exe')
    });

    createWindow();

    // 🧠 TRAY SETUP
    const icon = nativeImage.createFromPath(iconPath);
    tray = new Tray(icon);
    tray.setToolTip('ECO.LOG - Operational Intelligence');

    const contextMenu = Menu.buildFromTemplate([
      { 
        label: 'Abrir EcoLog', 
        click: () => mainWindow.show() 
      },
      { type: 'separator' },
      { 
        label: 'Sair', 
        click: () => {
          app.isQuitting = true;
          app.quit();
        } 
      }
    ]);

    tray.setContextMenu(contextMenu);
    
    // Duplo clique no tray abre o app
    tray.on('double-click', () => mainWindow.show());
  });
}

// IPC: Controle de Auto-Start vindo do Frontend
ipcMain.on('set-auto-start', (event, enable) => {
  store.set('autoStart', enable);
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: true,
    path: app.getPath('exe')
  });
});

// IPC: Mostrar App (caso chamado programaticamente)
ipcMain.on('show-app', () => {
  if (mainWindow) mainWindow.show();
});
