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
    animatedElements.forEach(el => observer.observe(el));

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
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        menuBtn.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }

    function closeDrawer() {
        if (!drawer || !overlay || !menuBtn) return;
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        overlay.hidden = true;
    }

    if (menuBtn && drawer && overlay) {
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
            if (e.key === 'Escape') closeDrawer();
        });
    }
});
