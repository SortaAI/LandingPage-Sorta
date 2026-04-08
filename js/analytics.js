/**
 * analytics.js — Sorta Landing Page Analytics
 * ─────────────────────────────────────────────
 * Covers:
 *   1. CTA click events          (all data-track buttons/links)
 *   2. Section visibility        (scroll depth milestones)
 *   3. Outbound link tracking    (getsorta.io clicks)
 *   4. Time-on-page milestone    (30s / 60s / 120s engagement signals)
 *   5. Pricing section view      (key conversion signal)
 *
 * Fires to GA4 via gtag() and to Clarity via window.clarity().
 * Both are no-ops if the scripts haven't loaded (graceful degradation).
 */

(function () {
    'use strict';

    /* ─── Helpers ──────────────────────────────────────────── */

    /** Send one event to both GA4 and Clarity */
    function track(eventName, params) {
        params = params || {};

        // GA4
        if (typeof gtag === 'function') {
            gtag('event', eventName, params);
        }

        // Microsoft Clarity custom event (string tag only)
        if (typeof window.clarity === 'function') {
            window.clarity('event', eventName);
        }
    }

    /* ─── 1. CTA Click Tracking ─────────────────────────────
       Any element with data-track="event_name" fires automatically.
    ──────────────────────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        var el = e.target.closest('[data-track]');
        if (!el) return;

        var eventName = el.getAttribute('data-track');
        track('cta_click', {
            event_label: eventName,
            element_text: el.innerText.trim().slice(0, 80)
        });
    });

    /* ─── 2. Section Scroll Depth Milestones ────────────────
       Fires once per section when 60% of it enters the viewport.
    ──────────────────────────────────────────────────────── */
    var sectionMap = {
        'how':       'section_how_it_works',
        'features':  'section_features',
        'faq':       'section_faq',
        'pricing':   'section_pricing',
        'demo-form': 'section_demo_form',
        'origin':    'section_origin'
    };

    // Also track unnamed sections by position
    var sectionsSeen = new Set();

    var sectionObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;

            var id = entry.target.id || entry.target.className.split(' ')[0];
            if (sectionsSeen.has(id)) return;
            sectionsSeen.add(id);

            var eventLabel = sectionMap[entry.target.id] || ('section_' + id);
            track('section_view', { section: eventLabel });
        });
    }, { threshold: 0.6 });

    document.querySelectorAll('section').forEach(function (section) {
        sectionObserver.observe(section);
    });

    /* ─── 3. Outbound Link Tracking ─────────────────────────
       Catches any click leaving to an external domain.
    ──────────────────────────────────────────────────────── */
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (!link) return;

        var href = link.getAttribute('href');
        if (!href) return;
        if (href.startsWith('#') || href.startsWith('/') || href.startsWith('javascript')) return;

        try {
            var url = new URL(href, window.location.href);
            if (url.hostname !== window.location.hostname) {
                track('outbound_click', {
                    destination_url: url.hostname + url.pathname,
                    link_text: link.innerText.trim().slice(0, 80)
                });
            }
        } catch (err) { /* malformed href — skip */ }
    });

    /* ─── 4. Time-on-Page Engagement Milestones ─────────────
       Signals whether visitors are actually reading vs. bouncing.
    ──────────────────────────────────────────────────────── */
    var engagementFired = {};

    function scheduleEngagement(seconds) {
        setTimeout(function () {
            if (engagementFired[seconds]) return;
            engagementFired[seconds] = true;

            // Only fire if tab is still active
            if (document.hidden) return;
            track('engagement_time', { seconds_on_page: seconds });
        }, seconds * 1000);
    }

    [30, 60, 120].forEach(scheduleEngagement);

    /* ─── 5. Pricing Section — High-Intent Signal ───────────
       A dedicated, named event makes it easy to build a GA4
       conversion funnel: landing → pricing_view → CTA click.
    ──────────────────────────────────────────────────────── */
    var pricingSection = document.getElementById('pricing');
    if (pricingSection) {
        var pricingObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    track('pricing_section_view', { intent_signal: 'high' });
                    pricingObserver.disconnect(); // fire once
                }
            });
        }, { threshold: 0.5 });
        pricingObserver.observe(pricingSection);
    }

    /* ─── Demo Form Submission Tracking ─────────────────── */
    var demoForm = document.getElementById('sorta-demo-form');
    if (demoForm) {
        demoForm.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = (document.getElementById('df-name') || {}).value || '';
            var clinic = (document.getElementById('df-clinic') || {}).value || '';
            var email = (document.getElementById('df-email') || {}).value || '';
            var phone = (document.getElementById('df-phone') || {}).value || '';
            var submitBtn = demoForm.querySelector('.demo-submit-btn');
            var labelSpan = submitBtn ? submitBtn.querySelector('.submit-label') : null;
            var sendingSpan = submitBtn ? submitBtn.querySelector('.submit-sending') : null;
            var sentSpan = submitBtn ? submitBtn.querySelector('.submit-sent') : null;
            var successMsg = document.getElementById('df-success');
            var errorMsg = document.getElementById('df-error');

            if (!name.trim() || !clinic.trim() || !email.trim()) {
                return;
            }
            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
            if (!emailOk) {
                return;
            }

            // Prevent spam double-submits and show clear feedback.
            if (submitBtn && submitBtn.classList.contains('is-sending')) return;
            if (errorMsg) errorMsg.classList.add('hidden');
            if (successMsg) successMsg.classList.add('hidden');
            if (submitBtn) {
                submitBtn.classList.remove('is-sent');
                submitBtn.classList.add('is-sending');
            }
            if (sendingSpan) sendingSpan.hidden = false;
            if (sentSpan) sentSpan.hidden = true;
            demoForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = true; });

            // GA4 conversion event
            track('demo_form_submitted', {
                form_location: 'hero_below',
                has_phone: phone.length > 0 ? 'yes' : 'no'
            });

            // Google Ads conversion (placeholder — add gtag_send_to when Ads is set up)
            // if (typeof gtag === 'function') {
            //     gtag('event', 'conversion', { 'send_to': 'AW-XXXXXXXXXX/XXXXXXXXXXXXXXXXXX' });
            // }

            var minDelay = new Promise(function (resolve) { setTimeout(resolve, 650); });

            Promise.all([
                minDelay,
                fetch(demoForm.action, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                    body: JSON.stringify({ name: name.trim(), clinic: clinic.trim(), email: email.trim(), phone: phone.trim() })
                })
            ]).then(function (results) {
                var resp = results[1];
                if (!resp || !resp.ok) throw new Error('bad response');

                if (submitBtn) {
                    submitBtn.classList.remove('is-sending');
                    submitBtn.classList.add('is-sent');
                    submitBtn.classList.add('confetti');
                    setTimeout(function () {
                        try { submitBtn.classList.remove('confetti'); } catch (e) {}
                    }, 950);
                }
                if (sendingSpan) sendingSpan.hidden = true;
                if (sentSpan) sentSpan.hidden = false;
                if (successMsg) successMsg.classList.remove('hidden');
            }).catch(function () {
                // Re-enable inputs so user can retry.
                demoForm.querySelectorAll('input, button').forEach(function (el) { el.disabled = false; });
                if (submitBtn) submitBtn.classList.remove('is-sending');
                if (sendingSpan) sendingSpan.hidden = true;
                if (sentSpan) sentSpan.hidden = true;
                if (errorMsg) errorMsg.classList.remove('hidden');
            });
        });
    }

})();
