
const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'sites.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) {
    const initial = [
        { id: '1', name: 'PortosRio', url: 'https://www.portosrio.gov.br', category: 'RJ', icon: '⚓', order: 1 },
        { id: '2', name: 'Santos (SPA)', url: 'https://www.portodesantos.com.br', category: 'Santos', icon: '🚢', order: 2 },
        { id: '3', name: 'BTP', url: 'https://www.btp.com.br', category: 'Santos', icon: '🏗️', order: 3 },
        { id: '4', name: 'Embraport', url: 'https://www.embraportonline.com.br', category: 'Santos', icon: '🏗️', order: 4 },
        { id: '5', name: 'MSC Track', url: 'https://www.msc.com/track-a-shipment', category: 'Armador', icon: '📦', order: 5 },
        { id: '6', name: 'Maersk', url: 'https://www.maersk.com/tracking', category: 'Armador', icon: '📦', order: 6 },
        { id: '7', name: 'Siscomex', url: 'https://portalunico.siscomex.gov.br', category: 'Comex', icon: '🌐', order: 7 },
        { id: '8', name: 'e-CAC', url: 'https://cav.receita.fazenda.gov.br', category: 'Docs', icon: '📜', order: 8 },
        { id: '9', name: 'Maps', url: 'https://maps.google.com', category: 'Mapas', icon: '🗺️', order: 9 },
        { id: '10', name: 'WhatsApp', url: 'https://web.whatsapp.com', category: 'Comex', icon: '💬', order: 10 }
    ];
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
}

let win;
function createWindow() {
    win = new BrowserWindow({
        width: 1000, height: 700,
        backgroundColor: '#1e293b',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            webviewTag: true
        }
    });
    win.setMenuBarVisibility(false);
    win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('get-sites', () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]'));
ipcMain.handle('save-sites', (e, sites) => {
    fs.writeFileSync(DATA_FILE, JSON.stringify(sites, null, 2));
    return true;
});
ipcMain.on('open-external', (e, url) => shell.openExternal(url));
