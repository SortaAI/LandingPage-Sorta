(function () {
  'use strict';

  const PASSWORD = 'sorta2026';
  const STORAGE_KEY = 'sorta_demo_config';

  const DEFAULTS = {
    clinicName: 'El Paso Eye Center',
    activeForms: { intake: true, insurance: true, consent: true }
  };

  // ── Password Gate ────────────────────────────────────────
  window.checkPassword = function (e) {
    e.preventDefault();
    var input = document.getElementById('passwordInput').value;
    var errEl = document.getElementById('gateError');
    if (input === PASSWORD) {
      document.getElementById('passwordGate').classList.add('hidden');
      document.getElementById('adminPanel').classList.remove('hidden');
      loadConfigIntoPanel();
    } else {
      errEl.classList.add('show');
      document.getElementById('passwordInput').value = '';
      document.getElementById('passwordInput').focus();
    }
  };

  // ── Load config into form ────────────────────────────────
  function loadConfigIntoPanel() {
    var config = readConfig();
    document.getElementById('clinicNameInput').value = config.clinicName;
    document.getElementById('cbIntake').checked = config.activeForms.intake;
    document.getElementById('cbInsurance').checked = config.activeForms.insurance;
    document.getElementById('cbConsent').checked = config.activeForms.consent;
  }

  function readConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(DEFAULTS));
    } catch (_) {
      return JSON.parse(JSON.stringify(DEFAULTS));
    }
  }

  // ── Save ─────────────────────────────────────────────────
  window.saveConfig = function () {
    var config = {
      clinicName: document.getElementById('clinicNameInput').value.trim() || DEFAULTS.clinicName,
      activeForms: {
        intake: document.getElementById('cbIntake').checked,
        insurance: document.getElementById('cbInsurance').checked,
        consent: document.getElementById('cbConsent').checked
      }
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    showNotice();
  };

  // ── Reset ────────────────────────────────────────────────
  window.resetDefaults = function () {
    localStorage.removeItem(STORAGE_KEY);
    document.getElementById('clinicNameInput').value = DEFAULTS.clinicName;
    document.getElementById('cbIntake').checked = true;
    document.getElementById('cbInsurance').checked = true;
    document.getElementById('cbConsent').checked = true;
    showNotice();
  };

  // ── Notice ───────────────────────────────────────────────
  function showNotice() {
    var el = document.getElementById('saveNotice');
    el.classList.remove('hidden');
    setTimeout(function () { el.classList.add('hidden'); }, 2800);
  }

  // ── Allow Enter key on password field ────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('passwordInput').focus();
  });
})();
