// Intersection Observer for scroll animations
document.addEventListener('DOMContentLoaded', () => {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: stop observing once it's visible
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    // Immediately show elements already in the viewport — fixes Lighthouse NO_FCP
    // (IntersectionObserver fires async; this synchronous check ensures above-fold
    // content is visible before the first paint is measured)
    animatedElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom >= 0) {
            el.classList.add('visible');
        }
        observer.observe(el);
    });

    // Sticky CTA — show after hero section scrolls out of view
    const stickyCta = document.getElementById('sticky-cta');
    const heroSection = document.querySelector('.hero-section');
    if (stickyCta && heroSection) {
        const stickyObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    stickyCta.classList.remove('hidden');
                    stickyCta.setAttribute('aria-hidden', 'false');
                } else {
                    stickyCta.classList.add('hidden');
                    stickyCta.setAttribute('aria-hidden', 'true');
                }
            });
        }, { threshold: 0 });
        stickyObserver.observe(heroSection);
    }

    // Mobile drawer nav
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const drawer = document.getElementById('mobile-drawer');
    const overlay = document.getElementById('mobile-drawer-overlay');
    const closeBtn = document.querySelector('.mobile-drawer-close');

    function openDrawer() {
        if (!drawer || !overlay || !menuBtn) return;
        overlay.hidden = false;
        drawer.inert = false;
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
        closeBtn?.focus();
    }

    function closeDrawer() {
        if (!drawer || !overlay || !menuBtn) return;
        const wasOpen = drawer.classList.contains('open');
        drawer.classList.remove('open');
        drawer.inert = true;
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        overlay.hidden = true;
        if (wasOpen) menuBtn.focus();
    }

    if (menuBtn && drawer && overlay) {
        drawer.inert = true;
        menuBtn.addEventListener('click', () => {
            if (drawer.classList.contains('open')) closeDrawer();
            else openDrawer();
        });
        overlay.addEventListener('click', closeDrawer);
        if (closeBtn) closeBtn.addEventListener('click', closeDrawer);

        drawer.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', closeDrawer);
        });

        document.addEventListener('keydown', (e) => {
            if (!drawer.classList.contains('open')) return;
            if (e.key === 'Escape') closeDrawer();
            if (e.key === 'Tab') {
                const items = [...drawer.querySelectorAll('a[href], button:not([disabled])')].filter(el => el.getClientRects().length);
                const first = items[0], last = items[items.length - 1];
                if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
                else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
            }
        });
    }
});
