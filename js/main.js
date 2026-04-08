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
});
