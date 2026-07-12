// ===== Portofoliu tip desktop — window manager + i18n =====

const desktop = document.getElementById('desktop');
const taskbarWindows = document.getElementById('taskbar-windows');
const startButton = document.getElementById('start-button');
const clock = document.getElementById('taskbar-clock');
const trayToggle = document.getElementById('tray-toggle');
const trayMenu = document.getElementById('tray-menu');
const trayLangToggle = document.getElementById('tray-lang-toggle');
const langOptions = document.getElementById('lang-options');
const trayFullscreen = document.getElementById('tray-fullscreen');

let zIndexCounter = 10;

// ---- Traduceri ----

const translations = {
  ro: {
    locale: 'ro-RO',
    'about': 'Despre mine',
    'projects': 'Proiectele mele',
    'contact': 'Contact',
    'bibl': 'bibl.ceiti.md',
    'about.subtitle': 'Web Developer în devenire',
    'about.p1': 'Salut! Sunt Sorin, pasionat de dezvoltare web. Lucrez cu HTML, CSS și JavaScript și învăț în fiecare zi ceva nou. Acest site este el însuși un proiect: un portofoliu static, construit fără niciun framework.',
    'skills': 'Competențe',
    'projects.hint': '1 proiect · mai multe în curând…',
    'bibl.title': 'Biblioteca CEITI',
    'bibl.subtitle': 'Primul meu proiect web',
    'bibl.p1': 'Site-ul bibliotecii Centrului de Excelență în Informatică și Tehnologii Informaționale (CEITI). Primul proiect real la care am lucrat — o platformă web pentru biblioteca instituției.',
    'tech': 'Tehnologii',
    'bibl.visit': 'Vizitează bibl.ceiti.md',
    'contact.title': 'Hai să vorbim',
    'contact.p': 'Mă găsești la:',
    'tray.lang': 'Limbă',
    'tray.fullscreen': 'Ecran complet',
  },
  en: {
    locale: 'en-GB',
    'about': 'About me',
    'projects': 'My projects',
    'contact': 'Contact',
    'bibl': 'bibl.ceiti.md',
    'about.subtitle': 'Aspiring Web Developer',
    'about.p1': "Hi! I'm Sorin, passionate about web development. I work with HTML, CSS and JavaScript and I learn something new every day. This site is a project in itself: a static portfolio, built without any framework.",
    'skills': 'Skills',
    'projects.hint': '1 project · more coming soon…',
    'bibl.title': 'CEITI Library',
    'bibl.subtitle': 'My first web project',
    'bibl.p1': 'The library website of the Center of Excellence in Informatics and Information Technologies (CEITI). The first real project I worked on — a web platform for the institution\'s library.',
    'tech': 'Technologies',
    'bibl.visit': 'Visit bibl.ceiti.md',
    'contact.title': "Let's talk",
    'contact.p': 'You can find me at:',
    'tray.lang': 'Language',
    'tray.fullscreen': 'Fullscreen',
  },
  it: {
    locale: 'it-IT',
    'about': 'Chi sono',
    'projects': 'I miei progetti',
    'contact': 'Contatti',
    'bibl': 'bibl.ceiti.md',
    'about.subtitle': 'Web Developer in erba',
    'about.p1': 'Ciao! Sono Sorin, appassionato di sviluppo web. Lavoro con HTML, CSS e JavaScript e imparo qualcosa di nuovo ogni giorno. Questo sito è esso stesso un progetto: un portfolio statico, costruito senza alcun framework.',
    'skills': 'Competenze',
    'projects.hint': '1 progetto · altri in arrivo…',
    'bibl.title': 'Biblioteca CEITI',
    'bibl.subtitle': 'Il mio primo progetto web',
    'bibl.p1': "Il sito della biblioteca del Centro di Eccellenza in Informatica e Tecnologie dell'Informazione (CEITI). Il primo progetto reale a cui ho lavorato — una piattaforma web per la biblioteca dell'istituto.",
    'tech': 'Tecnologie',
    'bibl.visit': 'Visita bibl.ceiti.md',
    'contact.title': 'Parliamone',
    'contact.p': 'Mi trovi su:',
    'tray.lang': 'Lingua',
    'tray.fullscreen': 'Schermo intero',
  },
};

let currentLang = localStorage.getItem('lang') || 'ro';
if (!translations[currentLang]) currentLang = 'ro';

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  document.documentElement.lang = lang;

  const t = translations[lang];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const text = t[el.dataset.i18n];
    if (text) el.textContent = text;
  });

  // opțiunile de limbă din tray
  langOptions.querySelectorAll('button').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // titlurile din taskbar
  taskbarWindows.querySelectorAll('.taskbar-item').forEach(item => {
    const win = document.getElementById(item.dataset.for);
    item.textContent = t[win.dataset.titleKey];
  });

  updateClock();
}

// ---- Deschidere / închidere / focus ----

function openWindow(id) {
  const win = document.getElementById(id);
  if (!win) return;
  if (!win.classList.contains('open')) {
    win.classList.add('open');
    addTaskbarItem(win);
  }
  focusWindow(win);
  clampToDesktop(win);
}

// Aduce fereastra înapoi în ecran dacă poziția ei salvată nu mai încape
function clampToDesktop(win) {
  if (win.classList.contains('maximized')) return;
  const maxX = Math.max(0, desktop.clientWidth - win.offsetWidth);
  const maxY = Math.max(0, desktop.clientHeight - win.offsetHeight);
  if (win.offsetLeft > maxX) win.style.left = maxX + 'px';
  if (win.offsetTop > maxY) win.style.top = maxY + 'px';
}

function closeWindow(win) {
  win.classList.remove('open', 'focused', 'maximized');
  removeTaskbarItem(win);
}

function minimizeWindow(win) {
  win.classList.remove('open', 'focused');
  updateTaskbar();
}

function toggleMaximize(win) {
  win.classList.toggle('maximized');
  const btn = win.querySelector('.btn-maximize');
  btn.textContent = win.classList.contains('maximized') ? '❐' : '□';
  focusWindow(win);
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
  item.textContent = translations[currentLang][win.dataset.titleKey];
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
    if (win.classList.contains('maximized')) return; // în fullscreen nu se trage
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
  win.querySelector('.btn-maximize').addEventListener('click', () => toggleMaximize(win));
  // dublu-click pe bara de titlu = fullscreen
  win.querySelector('.window-titlebar').addEventListener('dblclick', (e) => {
    if (e.target.closest('button')) return;
    toggleMaximize(win);
  });
});

document.querySelectorAll('.icon').forEach(icon => {
  icon.addEventListener('click', () => openWindow(icon.dataset.window));
});

startButton.addEventListener('click', () => openWindow('win-despre'));

// ---- Tray: meniul din colțul dreapta jos ----

function closeTray() {
  trayMenu.hidden = true;
  langOptions.hidden = true;
  trayToggle.classList.remove('open');
}

trayToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  const isOpen = !trayMenu.hidden;
  if (isOpen) {
    closeTray();
  } else {
    trayMenu.hidden = false;
    trayToggle.classList.add('open');
  }
});

trayLangToggle.addEventListener('click', () => {
  langOptions.hidden = !langOptions.hidden;
});

langOptions.querySelectorAll('button').forEach(btn => {
  btn.addEventListener('click', () => {
    setLanguage(btn.dataset.lang);
    closeTray();
  });
});

trayFullscreen.addEventListener('click', () => {
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    document.documentElement.requestFullscreen();
  }
  closeTray();
});

// click în afara meniului = închidere
document.addEventListener('click', (e) => {
  if (!trayMenu.hidden && !e.target.closest('.tray')) closeTray();
});

// ---- Ceas: ziua săptămânii, ziua, luna · ora ----

const compactClock = window.matchMedia('(max-width: 600px)');

function updateClock() {
  const now = new Date();
  const locale = translations[currentLang].locale;
  const compact = compactClock.matches;
  const date = now.toLocaleDateString(locale, {
    weekday: compact ? 'short' : 'long',
    day: 'numeric',
    month: compact ? 'short' : 'long',
  });
  const time = now.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
  clock.textContent = `${date} · ${time}`;
}
updateClock();
setInterval(updateClock, 10000);
compactClock.addEventListener('change', updateClock);

// la redimensionarea browserului, ferestrele deschise rămân în ecran
window.addEventListener('resize', () => {
  document.querySelectorAll('.window.open').forEach(clampToDesktop);
});

// ---- Pornire ----

setLanguage(currentLang);
openWindow('win-despre');
