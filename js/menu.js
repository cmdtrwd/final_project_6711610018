// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Initial state - check session storage to avoid repeating loader
const hasLoaded = sessionStorage.getItem('hasLoaded');

if (hasLoaded) {
    document.body.classList.add('loaded'); // Skip showing the loader
    const loader = document.getElementById('loader');
    if (loader) loader.style.display = 'none'; // Instant hide, bypassing CSS transition
} else {
    document.body.classList.add('loading');
}

// Loading Sequence Logic
window.addEventListener('load', () => {
    // Reveal everything immediately if already loaded in this session
    if (hasLoaded) {
        document.body.classList.add('start-tail-anim');
        gsap.to('.hero-title, .hero-subtitle, .scroll-indicator', {
            opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: "power3.out", delay: 0
        });
        gsap.to('.filter-btn', {
            opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: "back.out(1.7)", delay: 0.1
        });
        setupFiltering();
        initScrollAnimations();
        return;
    }

    // Normal first-time loading sequence
    sessionStorage.setItem('hasLoaded', 'true');
    
    setTimeout(() => {
        document.body.classList.add('start-tail-anim');
    }, 400); // Reduced from 800ms

    // Simulate load time for demonstration of loader
    setTimeout(() => {
        document.body.classList.remove('loading');
        document.body.classList.add('loaded');
        
        // Trigger generic animations for main content elements
        gsap.to('.hero-title, .hero-subtitle, .scroll-indicator', {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: "power3.out",
            delay: 0 // Removed delay
        });
        
        // Staggered entrance for filter buttons
        gsap.to('.filter-btn', {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: "back.out(1.7)",
            delay: 0.3
        });
        
        setupFiltering();
        initScrollAnimations();
    }, 4000); // Increased from 2500ms to allow full cat animation and ear wiggle
});

// 1. Custom Cursor Logic
const cursor = document.getElementById('custom-cursor');
const trail = document.getElementById('cursor-trail');
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let trailX = window.innerWidth / 2;
let trailY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    
    // Smooth immediate movement for main cursor dot
    gsap.to(cursor, {
        x: mouseX,
        y: mouseY,
        duration: 0.1,
        ease: "power2.out"
    });
});

// Update trail with a slight easing delay
gsap.ticker.add(() => {
    trailX += (mouseX - trailX) * 0.15;
    trailY += (mouseY - trailY) * 0.15;
    
    gsap.set(trail, {
        x: trailX,
        y: trailY
    });
});

// Expand cursor on interactive elements (links, buttons)
const attachCursorEvents = () => {
    const interactiveElements = document.querySelectorAll('a, button, .interactive, .gallery-item, model-viewer');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            gsap.to(cursor, { scale: 1.5, duration: 0.3 });
            gsap.to(trail, { scale: 1.5, borderColor: 'var(--secondary-glow)', duration: 0.3 });
        });
        el.addEventListener('mouseleave', () => {
            gsap.to(cursor, { scale: 1, duration: 0.3 });
            gsap.to(trail, { scale: 1, borderColor: 'var(--accent-color)', duration: 0.3 });
        });
    });
};
attachCursorEvents();

// Gallery Filtering Logic & 3D Model Resets
function setupFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const models = document.querySelectorAll('model-viewer');

    // 3D Model Return Logic 
    models.forEach(model => {
        let timeout;
        model.addEventListener('camera-change', (event) => {
            if (event.detail.source === 'user-interaction') {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    // Smoothly return to front view and center position
                    model.cameraOrbit = "0deg 75deg auto";
                    model.cameraTarget = "auto auto auto";
                }, 3000); // 3 seconds of stillness
            }
        });
    });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active button state
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');
                
                // Remove fade-in class for reflow
                item.classList.remove('fade-in');

                if (filterValue === 'all' || itemCategory === filterValue) {
                    item.classList.remove('hidden');
                    // Small timeout to allow display:block to apply before animation
                    setTimeout(() => {
                        item.classList.add('fade-in');
                    }, 50);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// 2. Particle Background Logic
const canvas = document.getElementById('bg-canvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', initCanvas);
initCanvas();

class Particle {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 1.5 + 0.1;
        this.speedX = Math.random() * 0.5 - 0.25;
        this.speedY = Math.random() * 0.5 - 0.25;
        this.opacity = Math.random() * 0.5;
    }
    update() {
        this.x += this.speedX;
        this.y -= this.speedY; // move mostly slightly upwards/random
        
        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }
    draw() {
        ctx.fillStyle = `rgba(150, 150, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

for(let i = 0; i < 80; i++) {
    particles.push(new Particle());
}

function animateParticles() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
        p.update();
        p.draw();
    });
    requestAnimationFrame(animateParticles);
}

animateParticles();

// Scroll Animations List (Parallax & Fade Ins)
function initScrollAnimations() {
    // Gallery Items
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach((item, i) => {
        gsap.fromTo(item, 
            { opacity: 0, y: 40 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.8,
                ease: "power2.out",
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                    toggleActions: "play none none none"
                }
            }
        );
    });

    // Premium About section reveal
    const aboutTl = gsap.timeline({
        scrollTrigger: {
            trigger: '.about-section',
            start: "top 75%",
            toggleActions: "play none none none"
        }
    });

    aboutTl.from('.about-image img', {
        scale: 0.95,
        opacity: 0,
        duration: 1.2,
        ease: "power3.out"
    })
    .from('.about-section h2', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.8")
    .from('.about-text p', {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out"
    }, "-=0.4");

    // Contact section fade in
    gsap.from('.contact-section h2, .contact-section p, .contact-btn', {
        opacity: 0,
        y: 30,
        stagger: 0.2,
        duration: 1,
        scrollTrigger: {
            trigger: '.contact-section',
            start: "top 80%"
        }
    });
}

// Navbar Toggle Logic
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const navLinksItems = document.querySelectorAll('.nav-links a');

// Navbar Scroll Effect
function initNavbarScroll() {
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

if (hamburger) {
    initNavbarScroll();
    
    // Logo should always trigger the loader (user request)
    const logo = document.querySelector('.nav-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            sessionStorage.removeItem('hasLoaded');
        });
    }

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Handle internal navigation for smooth scroll and filter reset
    navLinksItems.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            
            // Close mobile menu
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');

            // If navigating to artwork, ensure 'All' filter is active
            if (href === '#gallery-filter' || href === 'index.html#gallery-filter') {
                const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
                if (allBtn) allBtn.click();
            }

            // Smooth scroll to target if internal
            if (href.startsWith('#') || (href.startsWith('index.html#') && window.location.pathname.endsWith('index.html'))) {
                e.preventDefault();
                const targetId = href.includes('#') ? href.split('#')[1] : null;
                const target = document.getElementById(targetId);
                
                if (target) {
                    const navHeight = document.querySelector('.navbar').offsetHeight || 80;
                    const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 30; // 30px extra breathing room
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    initSkillsStar();
}

function initSkillsStar() {
    const star = document.getElementById('skills-star');
    const container = document.getElementById('skills-container');
    const icons = document.querySelectorAll('.skill-icon');
    const hint = document.getElementById('skills-hint');
    let isActive = false;
    let orbitTween;

    if (!star) return;

    // Magnetic Focus Effect
    icons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            if (!isActive) return;
            
            gsap.to(icon, { 
                scale: 2.2, // Extra large for focus
                duration: 0.3, 
                backgroundColor: "transparent", // No tinting
                boxShadow: "none", // No bleeding glow
                borderColor: "#fff", // Simple thin outline
                borderWidth: "2px",
                ease: "back.out(1.5)",
                overwrite: true
            });
            
            // No image filters at all

            icons.forEach(other => {
                if (other !== icon) {
                    gsap.to(other, { 
                        scale: 0.8, // Slightly smaller
                        opacity: 1, // NO OPACITY DROP - Keep full colors
                        duration: 0.3, 
                        ease: "power2.out",
                        overwrite: true
                    });
                    // No color-dropping filters here
                }
            });
        });
        icon.addEventListener('mouseleave', () => {
            if (!isActive) return;
            
            // Keeping it natural

            icons.forEach(i => {
                gsap.to(i, { 
                    scale: 1, 
                    opacity: 1, 
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.1)",
                    borderWidth: "1px",
                    boxShadow: "none",
                    duration: 0.3, 
                    ease: "power2.out",
                    overwrite: true
                });
                // No filters to clear
            });
        });
    });

    star.addEventListener('click', (e) => {
        e.stopPropagation();
        isActive = !isActive;
        star.classList.toggle('active', isActive);
        
        if (isActive) {
            revealSkills();
            expandSpace();
        } else {
            hideSkills();
            collapseSpace();
        }
    });

    // Reset when clicking anywhere else
    document.addEventListener('click', (e) => {
        if (isActive && !container.contains(e.target)) {
            isActive = false;
            star.classList.remove('active');
            hideSkills();
            collapseSpace();
        }
    });

    function expandSpace() {
        gsap.killTweensOf(hint);
        const section = document.querySelector('.skills-showcase');
        gsap.to(section, {
            paddingTop: "6rem",
            paddingBottom: "8rem",
            duration: 0.8,
            ease: "power3.out"
        });
        gsap.to(container, {
            height: "500px",
            width: "500px",
            duration: 0.8,
            ease: "back.out(1.2)"
        });
        // Move star and orbital container down together
        gsap.to([star, ".skills-orbital"], {
            y: 40,
            duration: 0.8,
            ease: "power3.out"
        });

        // Hide hint with ID and visibility
        gsap.to(hint, {
            opacity: 0,
            y: 20,
            duration: 0.5,
            visibility: "hidden", // Definitive hidden
            ease: "power2.out"
        });
    }

    function collapseSpace() {
        gsap.killTweensOf(hint);
        const section = document.querySelector('.skills-showcase');
        gsap.to(section, {
            paddingTop: "0rem",
            paddingBottom: "0rem",
            duration: 0.6,
            ease: "power2.inOut"
        });
        gsap.to(container, {
            height: "320px",
            width: "320px",
            duration: 0.6,
            ease: "power2.inOut"
        });
        // Move star and orbital back up
        gsap.to([star, ".skills-orbital"], {
            y: 0,
            duration: 0.6,
            ease: "power2.inOut"
        });
        // Experience summary stays permanent

        // Show hint with ID and visibility - Slower and with delay for smoother feel
        gsap.to(hint, {
            opacity: 0.9,
            y: 0,
            duration: 1.2,
            delay: 0.4, // Wait for star to start shrinking
            visibility: "visible", // ENSURE VISIBILITY RETURNS
            ease: "power2.out"
        });
    }

    function revealSkills() {
        gsap.killTweensOf(icons); // Reset any ongoing animations
        const radius = 160; // Fixed radius for all devices as requested
        const total = icons.length;

        icons.forEach((icon, i) => {
            const angle = (i / total) * Math.PI * 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;

            gsap.to(icon, {
                opacity: 1,
                scale: 1,
                x: x,
                y: y,
                duration: 0.6,
                delay: i * 0.05,
                ease: "back.out(1.7)"
            });

            // Experience summary is now permanent, no reveal needed here
            
            // Ensure icons are full color on reveal
            const img = icon.querySelector('img');
            if (img) {
                gsap.to(img, {
                    filter: "grayscale(0%) brightness(1)",
                    duration: 0.6
                });
            }
        });

        gsap.to(star.querySelector('svg'), {
            rotate: 180,
            scale: 0.8,
            duration: 0.4
        });

        // Start continuous orbiting animation
        startOrbitAnimation();
    }

    function startOrbitAnimation() {
        if (orbitTween) orbitTween.kill();
        
        let orbit = { angle: 0 };
        const total = icons.length;
        
        orbitTween = gsap.to(orbit, {
            angle: Math.PI * 2,
            duration: 40, // Nice slow orbit
            repeat: -1,
            ease: "none",
            onUpdate: () => {
                const radius = 160; // Fixed radius for all devices
                icons.forEach((icon, i) => {
                    const baseAngle = (i / total) * Math.PI * 2;
                    const currentAngle = baseAngle + orbit.angle;
                    const x = Math.cos(currentAngle) * radius;
                    const y = Math.sin(currentAngle) * radius;
                    
                    // Update position only, leaving rotation at 0
                    gsap.set(icon, { x: x, y: y });
                });
            }
        });
    }

    function hideSkills() {
        if (orbitTween) orbitTween.kill();
        gsap.killTweensOf(icons);
        
        icons.forEach((icon, i) => {
            gsap.to(icon, {
                opacity: 0,
                scale: 0,
                x: 0,
                y: 0,
                duration: 0.4,
                ease: "power2.in"
            });
        });

        gsap.to(star.querySelector('svg'), {
            rotate: 0,
            scale: 1,
            duration: 0.4
        });
    }
}
