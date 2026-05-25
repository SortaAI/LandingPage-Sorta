(function () {
  'use strict';

  const TOTAL_SCREENS = 6;
  let currentScreen = 1;
  let animationsDone = {};

  // ── Config ──────────────────────────────────────────────
  function loadConfig() {
    try {
      const raw = localStorage.getItem('sorta_demo_config');
      return raw ? JSON.parse(raw) : null;
    } catch (_) { return null; }
  }

  const config = loadConfig() || {
    clinicName: 'El Paso Eye Center',
    activeForms: { intake: true, insurance: true, consent: true }
  };

  // ── Progress Bar ────────────────────────────────────────
  function updateProgress(n) {
    const pct = ((n - 1) / (TOTAL_SCREENS - 1)) * 100;
    document.getElementById('progressFill').style.width = pct + '%';
    document.getElementById('stepCounter').textContent = 'Step ' + n + ' of ' + TOTAL_SCREENS;
  }

  // ── Screen Navigation ────────────────────────────────────
  function goToScreen(n) {
    if (n < 1 || n > TOTAL_SCREENS) return;

    const old = document.getElementById('screen-' + currentScreen);
    old.classList.add('fade-out');

    setTimeout(function () {
      old.classList.remove('active', 'fade-out');
      old.style.display = 'none';

      currentScreen = n;
      const next = document.getElementById('screen-' + n);
      next.style.display = 'flex';

      // Force reflow so transition plays
      void next.offsetWidth;
      next.classList.add('active');

      updateProgress(n);
      onScreenEnter(n);
    }, 300);
  }

  // ── Per-screen init ──────────────────────────────────────
  function onScreenEnter(n) {
    if (n === 3) initScreen3();
    if (n === 4) initScreen4();
    if (n === 5) initScreen5();
  }

  // Screen 3 — inject clinic name + animate fields
  function initScreen3() {
    const el = document.getElementById('clinicNameDisplay');
    if (el) el.textContent = config.clinicName;

    if (animationsDone[3]) return;
    animationsDone[3] = true;

    const fields = document.querySelectorAll('#screen-3 .animated-field');
    fields.forEach(function (f) {
      // Slight extra delay so display:flex has settled
      setTimeout(function () { f.classList.add('field-visible'); }, 50);
    });
  }

  // Screen 4 — fill form cards sequentially
  function initScreen4() {
    const forms = config.activeForms || { intake: true, insurance: true, consent: true };

    // Hide disabled cards
    ['intake', 'insurance', 'consent'].forEach(function (key) {
      const card = document.getElementById('card-' + key);
      if (card) card.style.display = forms[key] ? '' : 'none';
    });

    if (animationsDone[4]) return;
    animationsDone[4] = true;

    const today = new Date().toLocaleDateString('en-US');

    const sequence = [
      {
        key: 'intake',
        fields: {
          'fi-name': 'Maria Gonzalez',
          'fi-dob': '03/12/1985',
          'fi-ins': 'Blue Cross Blue Shield',
          'fi-pol': 'BCX-4892710'
        }
      },
      {
        key: 'insurance',
        fields: {
          'fv-name': 'Maria Gonzalez',
          'fv-ins': 'Blue Cross Blue Shield',
          'fv-pol': 'BCX-4892710',
          'fv-dob': '03/12/1985'
        }
      },
      {
        key: 'consent',
        fields: {
          'fc-name': 'Maria Gonzalez',
          'fc-dob': '03/12/1985',
          'fc-ins': 'BCBS',
          'fc-date': today
        }
      }
    ];

    sequence.forEach(function (item, i) {
      if (!forms[item.key]) return;
      setTimeout(function () {
        Object.keys(item.fields).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.textContent = item.fields[id];
        });
        var card = document.getElementById('card-' + item.key);
        if (card) card.classList.add('filled');
      }, 400 + i * 500);
    });
  }

  // Screen 5 — timestamp + clinic name
  function initScreen5() {
    var now = new Date();
    var timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    var dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    var ts = document.getElementById('pdfTimestamp');
    if (ts) ts.textContent = 'Generated: ' + dateStr + ' · ' + timeStr;

    var cn = document.getElementById('pdfClinicName');
    if (cn) cn.textContent = config.clinicName;

    var cr = document.getElementById('pdfClinicRow');
    if (cr) cr.textContent = config.clinicName;

    var vd = document.getElementById('pdfVisitDate');
    if (vd) vd.textContent = dateStr;
  }

  // ── Init ─────────────────────────────────────────────────
  window.goToScreen = goToScreen;

  // Show screen 1 properly on load
  document.addEventListener('DOMContentLoaded', function () {
    var s1 = document.getElementById('screen-1');
    s1.style.display = 'flex';
    void s1.offsetWidth;
    s1.classList.add('active');
    updateProgress(1);
  });
})();
