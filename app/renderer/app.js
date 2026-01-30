
let sites = [], isEditing = false, filter = 'all', webview = null;

// Init
window.api.getSites().then(data => {
    sites = data;
    render();
});

// DOM
const grid = document.getElementById('grid');
const browser = document.getElementById('browser');
const mount = document.getElementById('webviewMount');
const modal = document.getElementById('modal');
const form = document.getElementById('form');

// Actions
document.getElementById('btnAdd').onclick = () => openModal();
document.getElementById('btnEdit').onclick = () => {
    isEditing = !isEditing;
    document.getElementById('btnEdit').classList.toggle('active');
    render();
};
document.getElementById('closeModal').onclick = () => modal.classList.add('hidden');
document.getElementById('closeBrowser').onclick = () => {
    browser.classList.add('hidden');
    mount.innerHTML = ''; 
    webview = null;
};
document.getElementById('zoomIn').onclick = () => webview && webview.setZoomLevel(webview.getZoomLevel() + 0.5);
document.getElementById('zoomOut').onclick = () => webview && webview.setZoomLevel(webview.getZoomLevel() - 0.5);
document.getElementById('zoomReset').onclick = () => webview && webview.setZoomLevel(0);
document.getElementById('openExt').onclick = () => webview && window.api.openExternal(webview.src);

// Filter
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.onclick = () => {
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        filter = btn.dataset.cat;
        render();
    };
});

// Render
function render() {
    grid.innerHTML = '';
    const list = filter === 'all' ? sites : sites.filter(s => s.category === filter);
    
    list.sort((a,b) => a.order - b.order).forEach(site => {
        const el = document.createElement('div');
        el.className = `card ${isEditing ? 'editing' : ''}`;
        el.innerHTML = `
            <div class="card-icon">${site.icon}</div>
            <div class="card-name">${site.name}</div>
            <div class="card-tag">${site.category}</div>
            ${isEditing ? `
            <div class="card-controls">
                <button class="mini-btn btn-edit" onclick="edit('${site.id}')"><i class="fas fa-pen"></i></button>
                <button class="mini-btn btn-del" onclick="del('${site.id}')"><i class="fas fa-times"></i></button>
            </div>` : ''}
        `;
        
        if (isEditing) {
            el.draggable = true;
            el.ondragstart = e => e.dataTransfer.setData('id', site.id);
            el.ondragover = e => e.preventDefault();
            el.ondrop = e => handleDrop(e, site.id);
        } else {
            el.onclick = () => openSite(site);
        }
        grid.appendChild(el);
    });
}

// Logic
function openSite(site) {
    browser.classList.remove('hidden');
    document.getElementById('browserTitle').innerText = site.name;
    mount.innerHTML = '';
    webview = document.createElement('webview');
    webview.src = site.url;
    webview.setAttribute('allowpopups', 'true');
    mount.appendChild(webview);
}

function handleDrop(e, targetId) {
    const srcId = e.dataTransfer.getData('id');
    if (srcId === targetId) return;
    const sIdx = sites.findIndex(s => s.id === srcId);
    const tIdx = sites.findIndex(s => s.id === targetId);
    [sites[sIdx].order, sites[tIdx].order] = [sites[tIdx].order, sites[sIdx].order];
    save();
}

window.del = (id) => {
    if(confirm('Deletar?')) {
        sites = sites.filter(s => s.id !== id);
        save();
    }
    event.stopPropagation();
};

window.edit = (id) => {
    event.stopPropagation();
    openModal(sites.find(s => s.id === id));
};

function openModal(site = null) {
    form.reset();
    document.getElementById('id').value = site ? site.id : '';
    if (site) {
        document.getElementById('name').value = site.name;
        document.getElementById('url').value = site.url;
        document.getElementById('icon').value = site.icon;
        document.getElementById('category').value = site.category;
    }
    modal.classList.remove('hidden');
}

form.onsubmit = (e) => {
    e.preventDefault();
    const id = document.getElementById('id').value;
    const data = {
        name: document.getElementById('name').value,
        url: document.getElementById('url').value,
        icon: document.getElementById('icon').value || '🌐',
        category: document.getElementById('category').value,
    };

    if (id) {
        const idx = sites.findIndex(s => s.id === id);
        sites[idx] = { ...sites[idx], ...data };
    } else {
        sites.push({ id: Date.now().toString(), ...data, order: sites.length + 1 });
    }
    save();
    modal.classList.add('hidden');
};

function save() {
    window.api.saveSites(sites);
    render();
}
