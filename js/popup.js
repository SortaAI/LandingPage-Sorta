/**
 * popup.js — Sorta Demo Request Popup
 * Handles open/close, form submission, and analytics for the popup form.
 * Form submission logic mirrors analytics.js but targets sorta-popup-form.
 */

(function () {
  'use strict';

  var overlay = null;
  var modal   = null;

  function track(eventName, params) {
    params = params || {};
    if (typeof gtag === 'function') gtag('event', eventName, params);
    if (typeof window.clarity === 'function') window.clarity('event', eventName);
  }

  /* ── Open / Close ── */

  function openPopup() {
    if (!overlay) return;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    setTimeout(function () { overlay.classList.add('popup-visible'); }, 10);
    // Focus first input for accessibility
    var firstInput = modal.querySelector('input:not([type="hidden"])');
    if (firstInput) setTimeout(function () { firstInput.focus(); }, 120);
    track('popup_opened');
  }

  function closePopup() {
    if (!overlay) return;
    overlay.classList.remove('popup-visible');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 280);
  }

  /* ── Init ── */

  document.addEventListener('DOMContentLoaded', function () {
    overlay = document.getElementById('demo-popup-overlay');
    modal   = document.getElementById('demo-popup-modal');

    if (!overlay || !modal) return;

    /* Open triggers — any element with data-popup-trigger */
    document.addEventListener('click', function (e) {
      var raw = e.target;
      var el = raw && raw.nodeType === 1 ? raw : raw && raw.parentElement;
      if (!el || typeof el.closest !== 'function') return;
      if (el.closest('[data-popup-trigger]')) {
        e.preventDefault();
        openPopup();
      }
    });

    /* Close — overlay click, close button, Escape key */
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePopup();
    });

    var closeBtn = document.getElementById('popup-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', closePopup);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closePopup();
    });

    /* ── Form Submission ── */
    var popupForm = document.getElementById('sorta-popup-form');
    if (!popupForm) return;

    popupForm.addEventListener('submit', function (e) {
      e.preventDefault();

      var name    = (document.getElementById('pf-name')   || {}).value || '';
      var clinic  = (document.getElementById('pf-clinic') || {}).value || '';
      var email   = (document.getElementById('pf-email')  || {}).value || '';
      var phone   = (document.getElementById('pf-phone')  || {}).value || '';
      var source  = (popupForm.querySelector('[name="source"]') || {}).value || '';

      var submitBtn   = popupForm.querySelector('.popup-submit-btn');
      var labelSpan   = submitBtn ? submitBtn.querySelector('.submit-label')   : null;
      var sendingSpan = submitBtn ? submitBtn.querySelector('.submit-sending') : null;
      var sentSpan    = submitBtn ? submitBtn.querySelector('.submit-sent')    : null;
      var successMsg  = document.getElementById('pf-success');
      var errorMsg    = document.getElementById('pf-error');

      /* Basic validation */
      if (!name.trim() || !clinic.trim() || !email.trim()) return;
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return;
      if (submitBtn && submitBtn.classList.contains('is-sending')) return;

      /* Reset state */
      if (errorMsg)   errorMsg.classList.add('hidden');
      if (successMsg) successMsg.classList.add('hidden');
      if (submitBtn)  { submitBtn.classList.remove('is-sent', 'is-sending'); }
      if (sentSpan)    sentSpan.hidden = true;
      if (sendingSpan) sendingSpan.hidden = false;
      if (submitBtn)   submitBtn.classList.add('is-sending');
      popupForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });

      track('demo_form_submitted', {
        form_location: 'popup',
        source_page: source || window.location.pathname,
        has_phone: phone.length > 0 ? 'yes' : 'no'
      });

      var minDelay = new Promise(function (resolve) { setTimeout(resolve, 650); });

      var payload = {
        name:     name.trim(),
        clinic:   clinic.trim(),
        email:    email.trim(),
        phone:    phone.trim(),
        source:   source || window.location.pathname,
        _replyto: email.trim(),
        _subject: 'Sorta demo request (' + (source || window.location.pathname) + ')'
      };

      Promise.all([
        minDelay,
        fetch('/api/contact', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body:    JSON.stringify(payload)
        })
      ]).then(function (results) {
        var resp = results[1];
        if (!resp || !resp.ok) throw new Error('bad response');

        if (sendingSpan) sendingSpan.hidden = true;
        if (sentSpan)    sentSpan.hidden = false;
        if (submitBtn)   {
          submitBtn.classList.remove('is-sending');
          submitBtn.classList.add('is-sent', 'confetti');
          setTimeout(function () {
            try { submitBtn.classList.remove('confetti'); } catch(err) {}
          }, 950);
        }
        if (successMsg) successMsg.classList.remove('hidden');

      }).catch(function () {
        popupForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = false; });
        if (submitBtn)   submitBtn.classList.remove('is-sending');
        if (sendingSpan) sendingSpan.hidden = true;
        if (sentSpan)    sentSpan.hidden = true;
        if (errorMsg)    errorMsg.classList.remove('hidden');
      });
    });
  });

})();
