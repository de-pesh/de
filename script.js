// Modern Portfolio Interactions

console.log("System Online");

// Initialize icons
if (window.lucide) {
    window.lucide.createIcons();
}

// ---------------------------------------------------------
// 1. Scroll Entrance Animations (Intersection Observer)
// ---------------------------------------------------------
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // Only animate once
        }
    });
}, observerOptions);

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));


// ---------------------------------------------------------
// 2. Infinite Draggable Carousel (Webflow-style) & Centering
// ---------------------------------------------------------
class InfiniteCarousel {
    constructor(viewportSelector, wrapSelector) {
        this.viewport = document.querySelector(viewportSelector);
        this.wrap = document.querySelector(wrapSelector);

        if (!this.viewport || !this.wrap) return;

        this.isDragging = false;
        this.startX = 0;
        this.currentTranslate = 0;
        this.prevTranslate = 0;
        this.animationID = 0;
        this.currentIndex = 0;

        // Physics
        this.targetTranslate = 0;
        this.interpolationFactor = 0.1;
        this.velocity = 0;

        this.cardWidth = 0;
        this.centeringOffset = 0;
        this.offset = 0;

        // Setup functionality
        this.init();
    }

    init() {
        // 1. Measure dimensions (card width + gap)
        this.updateDimensions();

        // 2. Setup Clones (prepend 2, append 2)
        this.setupClones();

        // 3. Set Initial Position (Center real item 1)
        // We have 2 clones at start.
        // Index 0 (Real Item 1) starts at 2 * cardWidth.
        // We want that point to be at centeringOffset.
        // So TranslateX = centeringOffset - (2 * cardWidth).
        this.offset = this.centeringOffset - (2 * this.cardWidth);

        this.currentTranslate = this.offset;
        this.targetTranslate = this.offset;
        this.setSliderPosition();

        // Resize Listener
        window.addEventListener('resize', () => {
            this.updateDimensions();
            // Reset to center on resize for stability
            this.offset = this.centeringOffset - (2 * this.cardWidth);
            this.currentTranslate = this.offset;
            this.targetTranslate = this.offset;
            this.setSliderPosition();
        });

        // Event Listeners
        // Mouse
        this.viewport.addEventListener('mousedown', this.touchStart.bind(this));
        this.viewport.addEventListener('mouseup', this.touchEnd.bind(this));
        this.viewport.addEventListener('mouseleave', this.touchEnd.bind(this));
        this.viewport.addEventListener('mousemove', this.touchMove.bind(this));

        // Touch
        this.viewport.addEventListener('touchstart', this.touchStart.bind(this));
        this.viewport.addEventListener('touchend', this.touchEnd.bind(this));
        this.viewport.addEventListener('touchmove', this.touchMove.bind(this));

        // Buttons
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        if (prevBtn) prevBtn.addEventListener('click', () => this.snapTo(1));
        if (nextBtn) nextBtn.addEventListener('click', () => this.snapTo(-1));

        // Start Animation Loop
        this.animationLoop();
    }

    setupClones() {
        const children = [...this.viewport.children];
        // prevent double cloning if re-run
        if (this.viewport.querySelectorAll('.clone').length > 0) return;

        this.totalOriginals = children.length;
        // Prepend clones of the end
        children.slice(-2).reverse().forEach(child => {
            const clone = child.cloneNode(true);
            clone.classList.add('clone');
            this.viewport.insertBefore(clone, this.viewport.firstChild);
        });

        // Append clones of the start
        children.slice(0, 2).forEach(child => {
            const clone = child.cloneNode(true);
            clone.classList.add('clone');
            this.viewport.appendChild(clone);
        });
    }

    updateDimensions() {
        const card = this.viewport.querySelector('.project-card');
        if (card) {
            // Get computed style for accurate gap
            const style = window.getComputedStyle(this.viewport);
            const gap = parseFloat(style.gap) || 24;
            this.cardWidth = card.offsetWidth + gap;

            // Viewport/Window width calculation
            const viewportW = this.wrap.offsetWidth;
            // Center position = (Container Width - Card Width) / 2
            // Note: Card width here includes gap, visually we center the card element itself.
            // So we use card.offsetWidth for the visual centering math.
            this.centeringOffset = (viewportW - card.offsetWidth) / 2;
        }
    }

    touchStart(index) {
        return (event) => {
            this.isDragging = true;
            this.startX = getPositionX(event);
            this.animationID = requestAnimationFrame(this.animation.bind(this));
            this.viewport.style.cursor = 'grabbing';
        }
    }

    touchMove(event) {
        if (this.isDragging) {
            const currentX = getPositionX(event);
            const diff = currentX - this.startX;
            this.targetTranslate += diff * 1.5;
            this.startX = currentX;
        }
    }

    touchEnd() {
        this.isDragging = false;
        this.viewport.style.cursor = 'grab';

        // Optional: Snap to nearest card on release
        const relativePos = this.targetTranslate - this.centeringOffset;
        const indexFloat = -relativePos / this.cardWidth;
        const nearestIndex = Math.round(indexFloat);

        // This snap feels "sticky", maybe user wants free scroll?
        // Let's implement basic momentum decay instead of hard snap for now, 
        // or a soft snap to nearest. Soft snap is better for "one card in middle".

        this.targetTranslate = this.centeringOffset - (nearestIndex * this.cardWidth);
    }

    snapTo(direction) {
        // direction: 1 = left (prev), -1 = right (next)
        // We want to move exactly one cardWidth
        this.targetTranslate += direction * this.cardWidth;
    }

    animation() {
        this.setSliderPosition();
        if (this.isDragging) requestAnimationFrame(this.animation.bind(this));
    }

    animationLoop() {
        this.currentTranslate += (this.targetTranslate - this.currentTranslate) * this.interpolationFactor;

        this.checkInfinite();
        this.setSliderPosition();

        requestAnimationFrame(this.animationLoop.bind(this));
    }

    checkInfinite() {
        // We have 2 clones at start.
        // Total items = 2 + totalOriginals + 2.
        // Real items start index = 2 (0-based).

        // Logic: Keep "virtual index" within [2, 2 + totalOriginals - 1]
        // But simpler: just teleport if we drift too far.

        const totalW = this.totalOriginals * this.cardWidth;

        // Calculate "effective position" relative to the "start point" of real items
        // Real start point in px space = centeringOffset - (2 * cardWidth)
        const realStartPx = this.centeringOffset - (2 * this.cardWidth);
        const diff = this.currentTranslate - realStartPx;

        // If diff > cardWidth * 0.5 (moved right past first item), jump to end
        if (diff > this.cardWidth * 0.5) {
            this.currentTranslate -= totalW;
            this.targetTranslate -= totalW;
        }

        // If diff < -(totalW + cardWidth * 0.5) (moved left past last item), jump to start
        if (diff < -(totalW - this.cardWidth * 0.5)) {
            this.currentTranslate += totalW;
            this.targetTranslate += totalW;
        }
    }

    setSliderPosition() {
        this.viewport.style.transform = `translateX(${this.currentTranslate}px)`;
    }
}

function getPositionX(event) {
    return event.type.includes('mouse') ? event.pageX : event.touches[0].clientX;
}

// Initialize Carousel with safety delay for layout stability
function initCarousel() {
    const carousel = new InfiniteCarousel('.carousel-viewport', '.carousel-wrap');
}

if (document.readyState === 'complete') {
    setTimeout(initCarousel, 100);
} else {
    window.addEventListener('load', () => setTimeout(initCarousel, 100));
}

// Initialize Marquee Hover
const marquee = document.querySelector('.marquee-content');
if (marquee) {
    marquee.addEventListener('mouseenter', () => marquee.style.animationPlayState = 'paused');
    marquee.addEventListener('mouseleave', () => marquee.style.animationPlayState = 'running');
}
