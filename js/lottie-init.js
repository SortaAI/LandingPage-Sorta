/* Fetch JSON for http(s); on file:// browsers block fetch — load js/lottie-embed-data.js once. Regenerate that file after editing assets/lotties/*.json. */
(function () {
    var embedPromise = null;
    var instanceByEl = new WeakMap();
    var prefersReducedMotion = false;
    var canHover = true;

    try {
        prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        // Treat phones/tablets as "no hover" (tap-only). This covers iOS Safari well.
        canHover = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    } catch (e) {
        // Defaults above are fine.
    }

    var viewportObserver = null;
    if (!canHover && !prefersReducedMotion && typeof IntersectionObserver !== 'undefined') {
        viewportObserver = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                var el = entry.target;
                var i = instanceByEl.get(el);
                if (!i) return;

                try {
                    if (entry.isIntersecting) {
                        i.play();
                    } else {
                        i.stop();
                        i.goToAndStop(0, true);
                    }
                } catch (_) {}
            });
        }, { threshold: 0.35 });
    }

    function loadEmbedScript() {
        if (!embedPromise) {
            embedPromise = new Promise(function (resolve, reject) {
                if (window.__SORTA_LOTTIE__) {
                    resolve(window.__SORTA_LOTTIE__);
                    return;
                }
                var s = document.createElement('script');
                s.async = true;
                s.src = 'js/lottie-embed-data.js';
                s.onload = function () {
                    resolve(window.__SORTA_LOTTIE__ || {});
                };
                s.onerror = function () {
                    reject(new Error('Could not load lottie-embed-data.js'));
                };
                document.head.appendChild(s);
            });
        }
        return embedPromise;
    }

    function loadJson(src) {
        var url = new URL(src, window.location.href).href;
        return fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error('HTTP ' + r.status);
                return r.json();
            })
            .catch(function () {
                if (location.protocol === 'file:') {
                    return loadEmbedScript().then(function (bundle) {
                        var data = bundle[src];
                        if (!data) throw new Error('Missing embedded Lottie: ' + src);
                        return data;
                    });
                }
                throw new Error('fetch failed');
            });
    }

    function mount(el) {
        var src = el.getAttribute('data-lottie-src');
        if (!src || typeof lottie === 'undefined') return;

        loadJson(src)
            .then(function (animationData) {
                el.innerHTML = '';
                var instance = lottie.loadAnimation({
                    container: el,
                    renderer: 'svg',
                    loop: true,
                    autoplay: false,
                    animationData: animationData
                });
                instanceByEl.set(el, instance);

                // Desktop: play on hover. Mobile/touch: play when in viewport.
                if (prefersReducedMotion) {
                    // Do nothing (stays on first frame).
                    return;
                }

                if (canHover) {
                    el.addEventListener('mouseenter', function () {
                        var i = instanceByEl.get(el);
                        if (!i) return;
                        try { i.play(); } catch (_) {}
                    });
                    el.addEventListener('mouseleave', function () {
                        var i = instanceByEl.get(el);
                        if (!i) return;
                        try {
                            i.stop();
                            i.goToAndStop(0, true);
                        } catch (_) {}
                    });
                } else if (viewportObserver) {
                    viewportObserver.observe(el);
                }
            })
            .catch(function () {
                el.classList.add('lottie-failed');
            });
    }

    document.addEventListener('DOMContentLoaded', function () {
        document.querySelectorAll('[data-lottie-src]').forEach(mount);
    });
})();
