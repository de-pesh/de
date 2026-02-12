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
        // Offset Calculation:
        // We want the CENTER of "Real Item 1" (which is effectively Index 0 of real items) to be at CENTER of Window.
        // Current coordinate system: 0 is Start of Viewport/Track.
        // Screen Center X relative to Track Start = CenteringOffset.
        // Real Item 1 Start X relative to Track Start = 2 * cardWidth.
        // Real Item 1 Center X = (2 * cardWidth) + (cardVisualWidth / 2).
        // We want: Translate + Real Item 1 Center X = Screen Center X (relative to wrap/window?).
        // Actually simpler:
        // We want Real Item 1 to sit at CenteringOffset.
        // Our "CenteringOffset" variable is calculated as the Translate value needed to put Index 0 at Center.

        // So Initial Translate = CenteringOffset.
        // But wait, setupClones adds 2 items BEFORE.
        // So the "Index 0" logic in touchEnd assumes we are talking about relative index.
        // Let's refine:
        // offset = CenteringOffset - (2 * cardWidth).
        // This puts "Real Item 1" (which is at +2*W position) at the Centering spot.

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

            // Universal Centering Math
            // We want the card to be centered on the WINDOW.
            // Screen Center = window.innerWidth / 2.
            // Wrapper Start = this.wrap.getBoundingClientRect().left.
            // Target Center relative to Wrapper = (window.innerWidth / 2) - Wrapper Start.
            // Center of Card needs to align with Target Center.
            // Left of Card = Target Center - (card.offsetWidth / 2).
            // CenteringOffset = The translation X that places "Item 0" (Start of track) such that... wait.
            // CenteringOffset is the "Start Position of the Item Slot 0" relative to wrapper?
            // "centeringOffset" usually effectively means: "The left margin required to center an item".

            // So: centeringOffset = TargetCenter - (card.offsetWidth / 2).
            // This is the X position (relative to wrap) where the card SHOULD start.

            const wrapRect = this.wrap.getBoundingClientRect();
            // Use window width for center point
            const screenCenter = window.innerWidth / 2;
            const targetCenterInWrap = screenCenter - wrapRect.left;

            this.centeringOffset = targetCenterInWrap - (card.offsetWidth / 2);
        }
    }

    touchStart(event) {
        this.isDragging = true;
        this.startX = getPositionX(event);
        this.animationID = requestAnimationFrame(this.animation.bind(this));
        this.viewport.style.cursor = 'grabbing';
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

        // Aggressive Snap: Always land on a specific card CENTER
        // Logic:
        // We want TargetTranslate to equal: CenteringOffset - (Index * CardWidth)
        // Current "Relative Position" of the track start vs the "Center Slot" is:
        // Diff = CenteringOffset - TargetTranslate.
        // Index = Diff / CardWidth.

        const relativePos = this.centeringOffset - this.targetTranslate;
        const indexFloat = relativePos / this.cardWidth;
        const nearestIndex = Math.round(indexFloat);

        // Force target to exactly that card center
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

        const totalW = this.totalOriginals * this.cardWidth;

        // Real start point in px space (Where Index 0 sits)
        const realStartPx = this.centeringOffset - (2 * this.cardWidth);

        // Diff of current pos relative to that start
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

        // Note: The thresholds might need slight tuning if clones are visible
        // but for standard infinite loop this "teleport" strategy works well.
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


// Contact Form Handling (AJAX)
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;

        // Loading State
        submitBtn.disabled = true;
        submitBtn.innerHTML = 'Sending...';

        const formData = new FormData(contactForm);

        fetch("https://formsubmit.co/ajax/deepesh1379@gmail.com", {
            method: "POST",
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                if (data.success === "true" || data.success === true) {
                    // Success UI
                    contactForm.style.display = 'none';
                    const successMessage = document.getElementById('success-message');
                    if (successMessage) {
                        successMessage.style.display = 'block';
                        successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                } else {
                    // Error from FormSubmit
                    alert("Something went wrong. Please try again or email me directly.");
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = originalBtnText;
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("Network error. Please check your connection.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            });
    });
}
