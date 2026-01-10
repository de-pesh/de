// Minimal interactions for the clean theme

console.log("Modern System Online");

// Initialize icons if Lucide is present
if (window.lucide) {
    window.lucide.createIcons();
}

// Marquee hover pause (for the tech stack marquee)
const marquee = document.querySelector('.marquee-content');
if (marquee) {
    marquee.addEventListener('mouseenter', () => {
        marquee.style.animationPlayState = 'paused';
    });
    marquee.addEventListener('mouseleave', () => {
        marquee.style.animationPlayState = 'running';
    });
}

// Carousel Navigation
const viewport = document.querySelector('.carousel-viewport');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

if (viewport && prevBtn && nextBtn) {
    const scrollAmount = 924; // Card width (900) + Gap (24)

    function triggerSpring(direction) {
        viewport.classList.remove('bump-left', 'bump-right');
        void viewport.offsetWidth; // Trigger reflow
        viewport.classList.add(direction === 'left' ? 'bump-left' : 'bump-right');

        // Clean up class after animation
        setTimeout(() => {
            viewport.classList.remove('bump-left', 'bump-right');
        }, 400);
    }

    prevBtn.addEventListener('click', () => {
        // Check if we are near the start (with small tolerance)
        if (viewport.scrollLeft <= 10) {
            triggerSpring('left');
        } else {
            viewport.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        }
    });

    nextBtn.addEventListener('click', () => {
        // Check if we are near the end
        const maxScroll = viewport.scrollWidth - viewport.clientWidth;
        if (viewport.scrollLeft >= maxScroll - 10) {
            triggerSpring('right');
        } else {
            viewport.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    });
}
