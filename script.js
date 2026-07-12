// ===== Portofoliu tip desktop — window manager simplu =====

const desktop = document.getElementById('desktop');
const taskbarWindows = document.getElementById('taskbar-windows');
const startButton = document.getElementById('start-button');
const clock = document.getElementById('taskbar-clock');

let zIndexCounter = 10;

// ---- Deschidere / închidere / focus ----

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (!win.classList.contains('open')) {
    win.classList.add('open');
    addTaskbarItem(win);
  }
  focusWindow(win);
}

function closeWindow(win) {
  win.classList.remove('open', 'focused');
  removeTaskbarItem(win);
}

function minimizeWindow(win) {
  win.classList.remove('open', 'focused');
  updateTaskbar();
}

function focusWindow(win) {
  document.querySelectorAll('.window').forEach(w => w.classList.remove('focused'));
  win.classList.add('focused');
  win.style.zIndex = ++zIndexCounter;
  updateTaskbar();
}

// ---- Taskbar ----

function addTaskbarItem(win) {
  if (taskbarWindows.querySelector(`[data-for="${win.id}"]`)) return;
  const item = document.createElement('button');
  item.className = 'taskbar-item';
  item.dataset.for = win.id;
  item.textContent = win.dataset.title;
  item.addEventListener('click', () => {
    if (win.classList.contains('open') && win.classList.contains('focused')) {
      minimizeWindow(win);
    } else {
      win.classList.add('open');
      focusWindow(win);
    }
  });
  taskbarWindows.appendChild(item);
  updateTaskbar();
}

function removeTaskbarItem(win) {
  const item = taskbarWindows.querySelector(`[data-for="${win.id}"]`);
  if (item) item.remove();
}

function updateTaskbar() {
  taskbarWindows.querySelectorAll('.taskbar-item').forEach(item => {
    const win = document.getElementById(item.dataset.for);
    const isActive = win.classList.contains('open') && win.classList.contains('focused');
    item.classList.toggle('active', isActive);
  });
}

// ---- Drag pe bara de titlu ----

function makeDraggable(win) {
  const titlebar = win.querySelector('.window-titlebar');
  let offsetX = 0;
  let offsetY = 0;

  titlebar.addEventListener('pointerdown', (e) => {
    if (e.target.closest('button')) return; // nu tragem din butoanele de control
    focusWindow(win);
    offsetX = e.clientX - win.offsetLeft;
    offsetY = e.clientY - win.offsetTop;
    titlebar.setPointerCapture(e.pointerId);
    titlebar.addEventListener('pointermove', onMove);
    titlebar.addEventListener('pointerup', onUp, { once: true });
  });

  function onMove(e) {
    const maxX = desktop.clientWidth - 60;
    const maxY = desktop.clientHeight - 40;
    win.style.left = Math.min(Math.max(e.clientX - offsetX, -win.offsetWidth + 80), maxX) + 'px';
    win.style.top = Math.min(Math.max(e.clientY - offsetY, 0), maxY) + 'px';
  }

  function onUp() {
    titlebar.removeEventListener('pointermove', onMove);
  }
}

// ---- Inițializare ----

document.querySelectorAll('.window').forEach(win => {
  makeDraggable(win);
  win.addEventListener('pointerdown', () => focusWindow(win));
  win.querySelector('.btn-close').addEventListener('click', () => closeWindow(win));
  win.querySelector('.btn-minimize').addEventListener('click', () => minimizeWindow(win));
});

document.querySelectorAll('.icon').forEach(icon => {
  icon.addEventListener('click', () => openWindow(icon.dataset.window));
});

// Start: deschide fereastra "Despre mine"
startButton.addEventListener('click', () => openWindow('win-despre'));

// ---- Ceas ----

function updateClock() {
  const now = new Date();
  clock.textContent = now.toLocaleTimeString('ro-RO', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
updateClock();
setInterval(updateClock, 10000);

// La încărcare, deschidem automat "Despre mine"
openWindow('win-despre');
