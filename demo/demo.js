/* ─────────────────────────────────────────────────────────────────
 *  Sorta marketing /demo — 3 interactive acts, 100% client-side.
 *  No fetch(), no XHR, no third-party APIs. Drop a PDF and we don't
 *  even parse it — we just play the animation. Everything is mock.
 * ───────────────────────────────────────────────────────────────── */
(function () {
  'use strict';

  const TOTAL_SCREENS = 5;
  let currentScreen = 1;

  // ── Screen navigation ────────────────────────────────────
  function updateProgress(n) {
    const pct = ((n - 1) / (TOTAL_SCREENS - 1)) * 100;
    const fill = document.getElementById('progressFill');
    const counter = document.getElementById('stepCounter');
    if (fill) fill.style.width = pct + '%';
    if (counter) counter.textContent = 'Step ' + n + ' of ' + TOTAL_SCREENS;
  }

  function goToScreen(n) {
    if (n < 1 || n > TOTAL_SCREENS) return;

    const old = document.getElementById('screen-' + currentScreen);
    if (old) old.classList.add('fade-out');

    setTimeout(function () {
      if (old) {
        old.classList.remove('active', 'fade-out');
        old.style.display = 'none';
      }
      currentScreen = n;
      const next = document.getElementById('screen-' + n);
      if (!next) return;
      next.style.display = 'flex';
      void next.offsetWidth;
      next.classList.add('active');
      updateProgress(n);
      onScreenEnter(n);
    }, 300);
  }

  function onScreenEnter(n) {
    if (n === 2) initAct1();
    if (n === 3) initAct2();
    if (n === 4) initAct3();
  }

  // ═════════════════════════════════════════════════════════
  //  ACT 1 — Drop a PDF, watch it "learn" the form
  // ═════════════════════════════════════════════════════════
  let act1Started = false;
  let act1ResetTimers = [];

  function initAct1() {
    const dz = document.getElementById('dropzone');
    if (!dz) return;

    // Click anywhere on dropzone (when empty) to start
    if (!dz.dataset.bound) {
      dz.dataset.bound = '1';
      dz.addEventListener('click', () => {
        if (!act1Started) runAct1Sequence();
      });
      dz.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !act1Started) {
          e.preventDefault();
          runAct1Sequence();
        }
      });

      // Drag-and-drop wiring — we accept the drop event but do NOT
      // upload, parse, or read the file content. The drop is purely
      // a UI trigger for the playback animation.
      ['dragenter', 'dragover'].forEach(ev => {
        dz.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dz.classList.add('dragging');
        });
      });
      ['dragleave', 'dragend'].forEach(ev => {
        dz.addEventListener(ev, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dz.classList.remove('dragging');
        });
      });
      dz.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dz.classList.remove('dragging');
        if (!act1Started) runAct1Sequence();
      });
    }
  }

  function runAct1Sequence() {
    if (act1Started) return;
    act1Started = true;

    const empty = document.getElementById('dropzoneEmpty');
    const busy = document.getElementById('dropzoneBusy');
    const done = document.getElementById('dropzoneDone');
    const statusLine = document.getElementById('statusLine');
    const statusFill = document.getElementById('statusProgressFill');
    const steps = document.querySelectorAll('#statusSteps li');
    const rects = document.querySelectorAll('.pdf-field-rect');

    empty.hidden = true;
    busy.hidden = false;
    done.hidden = true;

    // Reset state
    rects.forEach(r => r.classList.remove('show', 'final'));
    steps.forEach(s => s.classList.remove('done', 'active'));
    statusFill.style.width = '0%';

    const sequence = [
      { text: 'AcroForm scan…',                  stepIdx: 0, progress: 18, rectsBatch: [1, 2] },
      { text: 'Reducto extracting fields…',      stepIdx: 1, progress: 50, rectsBatch: [3, 4, 5] },
      { text: 'Gemini 2.5 Pro validating layout…', stepIdx: 2, progress: 78, rectsBatch: [6, 7] },
      { text: 'GPT-4 cleaning field labels…',    stepIdx: 3, progress: 100, rectsBatch: [8] },
    ];

    let i = 0;
    function nextStep() {
      if (i >= sequence.length) {
        // Final flourish — rectangles flip to "final" color
        document.querySelectorAll('.pdf-field-rect.show').forEach(r => r.classList.add('final'));
        act1ResetTimers.push(setTimeout(() => {
          busy.hidden = true;
          done.hidden = false;
        }, 700));
        return;
      }
      const s = sequence[i];
      statusLine.textContent = s.text;
      statusFill.style.width = s.progress + '%';
      steps.forEach((el, idx) => {
        el.classList.remove('active');
        if (idx < s.stepIdx) el.classList.add('done');
        if (idx === s.stepIdx) el.classList.add('active');
      });
      s.rectsBatch.forEach((n, k) => {
        act1ResetTimers.push(setTimeout(() => {
          const rect = document.querySelector(`.pdf-field-rect[data-rect="${n}"]`);
          if (rect) rect.classList.add('show');
        }, k * 120));
      });
      i++;
      act1ResetTimers.push(setTimeout(nextStep, 1100));
    }
    nextStep();
  }

  function resetAct1() {
    act1ResetTimers.forEach(t => clearTimeout(t));
    act1ResetTimers = [];
    act1Started = false;
    document.getElementById('dropzoneEmpty').hidden = false;
    document.getElementById('dropzoneBusy').hidden = true;
    document.getElementById('dropzoneDone').hidden = true;
  }

  // ═════════════════════════════════════════════════════════
  //  ACT 2 — Type once, three forms update (semantic sync)
  // ═════════════════════════════════════════════════════════
  function initAct2() {
    const name = document.getElementById('syncInputName');
    const dob = document.getElementById('syncInputDob');
    if (!name || !dob) return;

    // Pre-seed for the impatient
    if (!name.value && !dob.value) {
      name.value = 'Maria Gonzalez';
      dob.value = '03/12/1985';
      applySync(name.value, dob.value, false);
    }

    if (!name.dataset.bound) {
      name.dataset.bound = '1';
      dob.dataset.bound = '1';
      name.addEventListener('input', () => applySync(name.value, dob.value, true));
      dob.addEventListener('input', () => applySync(name.value, dob.value, true));
    }
  }

  function applySync(fullName, dobStr, flash) {
    const parts = (fullName || '').trim().split(/\s+/);
    const first = parts[0] || '';
    const last = parts.slice(1).join(' ');
    const map = {
      firstName: first || '—',
      lastName: last || '—',
      fullName: fullName.trim() || '—',
      dob: dobStr || '—',
    };
    Object.keys(map).forEach(key => {
      document.querySelectorAll(`.sf-val[data-sync="${key}"]`).forEach(el => {
        const newVal = map[key];
        if (el.textContent !== newVal) {
          el.textContent = newVal;
          if (flash) {
            el.classList.remove('synced-flash');
            void el.offsetWidth;
            el.classList.add('synced-flash');
          }
        }
      });
    });
  }

  // ═════════════════════════════════════════════════════════
  //  ACT 3 — Staff ↔ Patient view toggle
  // ═════════════════════════════════════════════════════════
  let act3FilledFields = 0;
  let act3CurrentForm = 1;
  const ACT3_TOTAL_FIELDS = 3; // mocked

  function initAct3() {
    // Reset
    act3FilledFields = 0;
    act3CurrentForm = 1;
    const queue = document.getElementById('staffQueue');
    if (queue) queue.hidden = true;
    const phoneScreen = document.getElementById('phoneScreen');
    if (phoneScreen) {
      ['phStepInbox', 'phStepForm', 'phStepDone'].forEach((id, i) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.hidden = i !== 0;
        el.classList.toggle('active', i === 0);
      });
    }
    // Reset phone form field clicks
    document.querySelectorAll('.phone-input-fake').forEach(el => el.classList.remove('filled'));
    updatePhoneProgress();
    switchView('staff');
  }

  function switchView(which) {
    const staffBtn = document.getElementById('vtStaff');
    const patientBtn = document.getElementById('vtPatient');
    const staffPane = document.getElementById('paneStaff');
    const patientPane = document.getElementById('panePatient');
    if (!staffBtn || !patientBtn || !staffPane || !patientPane) return;

    if (which === 'staff') {
      staffBtn.classList.add('active');
      patientBtn.classList.remove('active');
      staffBtn.setAttribute('aria-selected', 'true');
      patientBtn.setAttribute('aria-selected', 'false');
      staffPane.hidden = false;
      staffPane.classList.add('active');
      patientPane.hidden = true;
      patientPane.classList.remove('active');
    } else {
      patientBtn.classList.add('active');
      staffBtn.classList.remove('active');
      patientBtn.setAttribute('aria-selected', 'true');
      staffBtn.setAttribute('aria-selected', 'false');
      patientPane.hidden = false;
      patientPane.classList.add('active');
      staffPane.hidden = true;
      staffPane.classList.remove('active');
    }
  }

  function setChannel(kind) {
    const sms = document.getElementById('chSms');
    const email = document.getElementById('chEmail');
    const label = document.getElementById('contactLabel');
    const input = document.getElementById('contactInput');
    if (!sms || !email || !label || !input) return;
    if (kind === 'sms') {
      sms.classList.add('active');
      email.classList.remove('active');
      label.textContent = 'Patient phone';
      input.placeholder = '(555) 555-0142';
      input.type = 'tel';
    } else {
      email.classList.add('active');
      sms.classList.remove('active');
      label.textContent = 'Patient email';
      input.placeholder = 'maria@example.com';
      input.type = 'email';
    }
    input.value = '';
  }

  function sendLinkMock() {
    // Pure UI feedback — no SMS, no email, no fetch().
    const queue = document.getElementById('staffQueue');
    if (queue) queue.hidden = false;
    // Auto-flip to patient view so visitor sees what the patient sees
    setTimeout(() => switchView('patient'), 600);
    // Cycle the staff queue text in the background
    const row = document.getElementById('sqRow');
    if (row) {
      const text = row.querySelector('.sq-text');
      const dot = row.querySelector('.sq-dot');
      if (text && dot) {
        setTimeout(() => { text.textContent = 'Patient opened the link'; dot.classList.add('blink'); }, 4000);
        setTimeout(() => { text.textContent = 'Filling out Patient Intake…'; }, 6500);
        setTimeout(() => { text.textContent = 'Packet complete — snapshot saved'; dot.classList.remove('blink'); dot.classList.add('done'); }, 11000);
      }
    }
  }

  function phoneStep(which) {
    const map = { inbox: 'phStepInbox', form: 'phStepForm', done: 'phStepDone' };
    Object.keys(map).forEach(k => {
      const el = document.getElementById(map[k]);
      if (!el) return;
      el.hidden = k !== which;
      el.classList.toggle('active', k === which);
    });
    if (which === 'done') {
      const stamp = document.getElementById('phStamp');
      if (stamp) {
        const now = new Date();
        stamp.textContent = 'Saved · ' + now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
      }
    }
  }

  function phoneFillField(field) {
    const el = document.querySelector(`.phone-input-fake[data-fld="${field}"]`);
    if (!el || el.classList.contains('filled')) return;
    el.classList.add('filled');
    act3FilledFields++;
    showPhoneSavePill();
    updatePhoneProgress();
  }

  function showPhoneSavePill() {
    const pill = document.getElementById('phSavePill');
    if (!pill) return;
    pill.classList.add('saving');
    pill.textContent = 'Saving…';
    setTimeout(() => {
      pill.classList.remove('saving');
      pill.classList.add('saved');
      pill.textContent = 'Saved';
    }, 500);
  }

  function updatePhoneProgress() {
    const pct = Math.round((act3FilledFields / ACT3_TOTAL_FIELDS) * 100);
    const fill = document.getElementById('phProgressFill');
    const label = document.getElementById('phProgressPct');
    if (fill) fill.style.width = pct + '%';
    if (label) label.textContent = pct + '%';
  }

  // ── Expose to inline handlers ────────────────────────────
  window.goToScreen = goToScreen;
  window.resetAct1 = resetAct1;
  window.switchView = switchView;
  window.setChannel = setChannel;
  window.sendLinkMock = sendLinkMock;
  window.phoneStep = phoneStep;
  window.phoneFillField = phoneFillField;

  // ── Init ─────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    const s1 = document.getElementById('screen-1');
    if (s1) {
      s1.style.display = 'flex';
      void s1.offsetWidth;
      s1.classList.add('active');
    }
    updateProgress(1);
  });
})();
