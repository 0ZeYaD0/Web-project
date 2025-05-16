// script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log("Page loaded and initialized.");
    
    // Apply saved theme immediately to avoid flashing default theme
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = savedTheme;
    console.log(`Applied saved theme: ${savedTheme}`);
    
    hidePageLoader();
    document.body.classList.add('fade-in');
    
    // Attempt to fix any card visibility issues early.
    // Ideally, this would be solved with CSS, but this function provides a JS-based override.
    fixCardVisibility();

    // Initialize core functionalities
    const setupFunctions = [
        setupThemeToggle,
        setupMobileMenu, // Renamed from setupSideMenu for clarity
        setupHeroSlideshow, // Renamed from setupSlideshow
        initializeContentCardLinks, // Replace initializeMangaCardLinks with generic version
        handleImageLoading, // Consolidated image handling
        setupScrollableSections, // Renamed and clarified from setupHorizontalScrolling
        setupBackToTopButton, // Renamed
        initializeCardInteractions, // Renamed
    ];

    setupFunctions.forEach(func => {
        if (typeof func === 'function') {
            func();
        }
    });

    // Initialize form validation if relevant forms are present
    const signupForm = document.querySelector('.signup-form form');
    const loginForm = document.querySelector('.login-form form');

    if (signupForm || loginForm) {
        initializeFormValidation(); // Consolidated
    }

    const mainTitle = document.querySelector('main h1');
    if (mainTitle) {
        mainTitle.classList.add('floating');
    }
    
    // Delay animation setup slightly to ensure DOM is fully ready
    setTimeout(() => {
        initializeScrollAnimations(); // Consolidated from setupAnimations and setupScrollEffects
    }, 150); // Fixed small delay

    initializePasswordStrengthMeter(); // Call password strength meter initialization
});

function hidePageLoader() {
    const loaderDelay = 700; // Slightly reduced
    setTimeout(() => {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.classList.add('loaded');
            // Remove from DOM after fade-out animation completes
            setTimeout(() => loader.remove(), 500);
        }
    }, loaderDelay);
}

function setupBackToTopButton() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (!backToTopBtn) return;
    
    const scrollThreshold = 300; // Fixed threshold

    const toggleVisibility = () => {
        if (window.scrollY > scrollThreshold) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    };
    
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                toggleVisibility();
                ticking = false;
            });
            ticking = true;
        }
    });
    
    backToTopBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    toggleVisibility(); // Initial check
}

function fixCardVisibility() {
    // This function attempts to forcibly ensure cards and their contents are visible.
    // It's a workaround for potential CSS conflicts or specificity issues.
    const allCards = document.querySelectorAll('.card');
    if (!allCards.length) return;
    
    console.log(`Applying visibility overrides to ${allCards.length} cards.`);
    
    allCards.forEach(card => {
        card.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
        // card.classList.remove('card-animated'); // If this class is problematic
        
        const content = card.querySelector('.content');
        if (content) {
            content.style.cssText = 'display: flex !important; opacity: 1 !important; visibility: visible !important;';
            const title = content.querySelector('h2');
            if (title) title.style.cssText = 'opacity: 1 !important; color: white !important; visibility: visible !important;';
            content.querySelectorAll('p').forEach(p => {
                p.style.cssText = 'opacity: 0.8 !important; color: white !important; visibility: visible !important;';
            });
        }

        const imgBox = card.querySelector('.image-box');
        if (imgBox) {
            imgBox.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
            const img = imgBox.querySelector('img');
            if (img) img.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
        }
    });

    const popularElements = document.querySelectorAll('.popular-list, .popular-section');
    popularElements.forEach(el => {
        el.style.cssText = 'display: block !important; opacity: 1 !important; visibility: visible !important;';
    });
}


function setupScrollableSections() {
    console.log("Initializing hover effects for cards in scrollable sections.");
    const sections = document.querySelectorAll('.popular-section');
    
    sections.forEach(section => {
        const list = section.querySelector('.popular-list');
        if (!list) return;
        
        const cards = list.querySelectorAll('.card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = `0 10px 25px rgba(98, 0, 234, 0.25)`; // Adjusted shadow
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = `0 4px 15px rgba(0,0,0,0.2)`; // Consistent default
            });
        });
        initializeHorizontalScrollButtons(section, list); // Added call here
    });
}


function getPotentialImagePaths(imgElement) {
    const imgTitle = imgElement.alt || imgElement.getAttribute('data-alt') || 'Image';
    const cleanName = imgTitle.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9-]/g, '').toLowerCase();

    const isAnime = imgElement.closest('[data-content-type="anime"]') || 
                  window.location.pathname.endsWith('anime.html') || 
                  window.location.pathname.endsWith('anime-detail.html') || 
                  imgElement.src.toLowerCase().includes('animepics');
                  
    const isManga = imgElement.closest('[data-content-type="manga"]') || 
                  window.location.pathname.endsWith('manga.html') || 
                  window.location.pathname.endsWith('manga-detail.html') || 
                  imgElement.src.toLowerCase().includes('mangapics');
    let imageTypeFolder = 'unknown';
    if (isAnime) imageTypeFolder = 'Animepics';
    else if (isManga) imageTypeFolder = 'Mangapics';

    const paths = [];
    const commonNames = ['demon', 'AOT', 'Attackanime', 'Berserk', 'EVA', 'Note', 'SoloLvl', 'Soloanime', 'Vagapond', 'one punch man'];

    // Original name based on type
    if (imageTypeFolder !== 'unknown') {
        paths.push(`../Res/${imageTypeFolder}/${imgTitle}.jpg`);
        paths.push(`../Res/${imageTypeFolder}/${cleanName}.jpg`);
    }
    // Try both folders with clean name
    paths.push(`../Res/Animepics/${cleanName}.jpg`);
    paths.push(`../Res/Mangapics/${cleanName}.jpg`);

    // Specific known images
    commonNames.forEach(name => {
        paths.push(`../Res/Animepics/${name}.jpg`);
        paths.push(`../Res/Mangapics/${name}.jpg`);
    });
    
    // Relative paths
    if (imageTypeFolder !== 'unknown') {
        paths.push(`./Res/${imageTypeFolder}/${cleanName}.jpg`);
        paths.push(`/Res/${imageTypeFolder}/${cleanName}.jpg`);
    }

    // Ensure placeholder is last and unique
    const placeholder = `https://via.placeholder.com/300x450/6200ea/ffffff?text=${encodeURIComponent(imgTitle)}`;
    if (!paths.includes(placeholder)) {
        paths.push(placeholder);
    }
    
    // Deduplicate paths
    return [...new Set(paths)];
}

function attemptLoadImage(imgElement, paths, currentIndex = 0) {
    if (currentIndex >= paths.length) {
        console.warn(`All fallback paths failed for: ${imgElement.alt || imgElement.src}`);
        // Final fallback: display error indication
        const imgBox = imgElement.closest('.image-box');
        if (imgBox) {
            imgBox.classList.add('img-error');
            if (!imgBox.querySelector('.img-fallback-text')) {
                 const fallbackText = document.createElement('div');
                 fallbackText.className = 'img-fallback-text';
                 fallbackText.textContent = imgElement.alt || 'Image not found';
                 imgBox.appendChild(fallbackText);
            }
        }
        imgElement.style.display = 'none'; // Hide broken image icon
        return;
    }

        const testImg = new Image();
    const currentPath = paths[currentIndex];

    testImg.onload = () => {
        imgElement.src = currentPath;
        imgElement.style.display = 'block';
        const imgBox = imgElement.closest('.image-box');
        if (imgBox) {
            imgBox.classList.remove('img-error');
            const fallbackText = imgBox.querySelector('.img-fallback-text');
            if (fallbackText) fallbackText.remove();
        }
        console.log(`Successfully loaded image ${imgElement.alt} with path: ${currentPath}`);
    };

    testImg.onerror = () => {
        attemptLoadImage(imgElement, paths, currentIndex + 1);
    };

    testImg.src = currentPath;
}

function handleImageLoading() {
    const images = document.querySelectorAll('img');
    if (!images.length) return;
    
    console.log(`Processing ${images.length} images for loading and fallbacks.`);

    // Ensure fallback styles are available
    if (!document.getElementById('image-fallback-styles')) {
            const styleSheet = document.createElement('style');
        styleSheet.id = 'image-fallback-styles';
            styleSheet.textContent = `
                .img-error {
                    position: relative;
                    overflow: hidden;
                border: 1px solid rgba(98, 0, 234, 0.3);
                    background: rgba(98, 0, 234, 0.05);
                    border-radius: 5px;
                min-height: 200px; /* Ensure space for fallback text */
                }
                .img-fallback-text {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    width: 100%;
                    position: absolute;
                    top: 0;
                    left: 0;
                    background: rgba(98, 0, 234, 0.1);
                    color: white;
                    text-align: center;
                    padding: 10px;
                    font-size: 14px;
                    border-radius: 5px;
            }
            img.error-img { /* Legacy, but good to have if used elsewhere */
                display: none; 
                }
            `;
            document.head.appendChild(styleSheet);
        }
        
    images.forEach(img => {
        // If already loaded (e.g. from cache) and not broken, skip
        if (img.complete && img.naturalWidth > 0) {
            return;
        }

        const originalSrc = img.src;
        console.log(`Processing image: ${originalSrc}`);

        const imgBox = img.closest('.image-box');
        if (imgBox) {
            imgBox.dataset.title = img.alt || 'Image';
            if (window.getComputedStyle(imgBox).position === 'static') {
                imgBox.style.position = 'relative'; // For fallback text positioning
            }
        }

        img.onerror = function() {
            // Prevent infinite loops if the placeholder itself fails or if src is reset to original
            if (this.dataset.fallbackAttempted === originalSrc || this.src.startsWith('https://via.placeholder.com')) {
                attemptLoadImage(this, [ `https://via.placeholder.com/300x450/6200ea/ffffff?text=${encodeURIComponent(this.alt || 'Error')}` ]); // Force a generic placeholder
                return;
            }
            this.dataset.fallbackAttempted = originalSrc; // Mark that we've tried for this original src

            console.warn(`Initial load failed for: ${this.alt} (src: ${originalSrc}). Attempting fallbacks.`);
            const potentialPaths = getPotentialImagePaths(this);
            attemptLoadImage(this, potentialPaths);
        };
        
        img.onload = function() {
            const imgBox = this.closest('.image-box');
            if (imgBox) {
                imgBox.classList.remove('img-error');
                const fallbackText = imgBox.querySelector('.img-fallback-text');
                if (fallbackText) fallbackText.remove();
            }
            this.style.display = 'block';
        }

        // If src is empty or invalid, trigger onerror immediately for fallbacks
        if (!img.src || img.src === window.location.href) { // Check for empty or self-referential src
             img.src = "invalid-trigger.jpg"; // Force onerror
        } else if (img.complete && img.naturalWidth === 0) { // Already loaded but broken
            img.dispatchEvent(new Event('error'));
        }
    });
}


function initializeScrollAnimations() {
    const animatedElements = document.querySelectorAll('.card, .popular-section h2, .popular-section');
    if (!animatedElements.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Set opacity directly as well, in case CSS animation doesn't handle it or is delayed
                entry.target.style.opacity = '1';
                observer.unobserve(entry.target);
            }
        });
    }, { 
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' // Trigger a bit before fully in view
    });

    animatedElements.forEach((el, index) => {
        // Initial state (opacity 0 is often handled by CSS for the animation class)
        // el.style.opacity = '0'; // Set by CSS for .animate-in pre-animation state

        if (el.classList.contains('card')) {
            el.classList.add('card-animated'); // Base class for transition
            el.style.transitionDelay = `${index * 0.05}s`; // Stagger card animations
        } else if (el.tagName === 'H2' && el.closest('.popular-section')) {
            el.classList.add('slide-in-left');
        } else if (el.classList.contains('popular-section')) {
            // Alternate slide-in directions for sections
            el.classList.add(index % 2 === 0 ? 'slide-in-left' : 'slide-in-right');
        }
        observer.observe(el);
    });
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;

    const themes = ['light', 'dark', 'kawaii']; // Available themes
    let currentTheme = localStorage.getItem('theme') || 'dark';
    document.body.dataset.theme = currentTheme;
    updateThemeIcon(currentTheme);

    function updateThemeIcon(theme) {
        document.querySelectorAll('.theme-icon').forEach(icon => icon.classList.remove('active'));
        const activeIcon = document.querySelector(`.theme-icon.${theme}`);
        if (activeIcon) activeIcon.classList.add('active');
    }
    
        themeToggle.addEventListener('click', () => {
        let currentIndex = themes.indexOf(currentTheme);
        currentIndex = (currentIndex + 1) % themes.length;
        currentTheme = themes[currentIndex];

        document.body.dataset.theme = currentTheme;
        localStorage.setItem('theme', currentTheme);
        updateThemeIcon(currentTheme);
        console.log(`Theme switched to: ${currentTheme}`);
    });
}

function setupMobileMenu() {
    const nav = document.querySelector('nav');
    if (!nav) return;

    const hamburger = document.createElement('div');
    hamburger.className = 'hamburger';
    hamburger.innerHTML = `<span></span><span></span><span></span>`;
    hamburger.setAttribute('aria-label', 'Toggle menu');
    hamburger.setAttribute('aria-expanded', 'false');
    nav.prepend(hamburger);
    
    const sideMenu = document.createElement('div');
    sideMenu.className = 'side-menu';
    sideMenu.innerHTML = `
        <div class="side-menu-content">
            <button class="close-menu" aria-label="Close menu">×</button>
            <h2>Animanga</h2>
            <ul>
                <li><a href="index.html">Home</a></li>
                <li><a href="anime.html">Anime</a></li>
                <li><a href="manga.html">Manga</a></li>
                <li><a href="login.html">Login</a></li>
                <li><a href="signup.html">Signup</a></li>
                <li class="menu-divider"></li>
                <li><a href="#">Top Series</a></li>
                <li><a href="#">New Releases</a></li>
                <li><a href="#">Community</a></li>
            </ul>
        </div>
    `;
    document.body.appendChild(sideMenu);
    
    const closeBtn = sideMenu.querySelector('.close-menu');

    const openMenu = () => {
        sideMenu.classList.add('open');
        document.body.classList.add('menu-open');
        hamburger.setAttribute('aria-expanded', 'true');
    };
    
    const closeMenu = () => {
        sideMenu.classList.remove('open');
        document.body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
    };
    
    hamburger.addEventListener('click', openMenu);
    closeBtn.addEventListener('click', closeMenu);
    sideMenu.addEventListener('click', (e) => {
        if (e.target === sideMenu) { // Click on overlay
            closeMenu();
        }
    });
}

function setupHeroSlideshow() {
    // Only create on homepage (adjust path checks as needed for your structure)
    const isHomepage = window.location.pathname.endsWith('/') ||
                       window.location.pathname.endsWith('index.html') ||
                       window.location.pathname.endsWith('/src/'); // Added for local dev structure
    if (!isHomepage) return;

    const mainElement = document.querySelector('main');
    const mainHeading = mainElement ? mainElement.querySelector('h1') : null;
    if (!mainHeading) {
        console.warn("Slideshow setup skipped: main heading not found.");
        return;
    }
    
    // Define slide data (centralize for easier management)
    const slidesData = [
        { src: 'Animepics/demon.jpg', alt: 'Demon Slayer', title: 'Demon Slayer', desc: 'The epic journey of Tanjiro to avenge his family' },
        { src: 'Mangapics/Berserk.jpg', alt: 'Berserk', title: 'Berserk', desc: 'The dark fantasy masterpiece' },
        { src: 'Mangapics/SoloLvl.jpg', alt: 'Solo Leveling', title: 'Solo Leveling', desc: 'Rise from the weakest to the strongest' }
    ];

    // Helper to construct image paths consistently
    const getImagePath = (relativePath) => `../Res/${relativePath}`;

    const slideshowContainer = document.createElement('div');
    slideshowContainer.className = 'slideshow';
    
    let slidesHTML = slidesData.map((slide, index) => `
        <div class="slide${index === 0 ? ' active' : ''}">
            <img src="${getImagePath(slide.src)}" alt="${slide.alt}">
                <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.desc}</p>
                </div>
            </div>
    `).join('');

    slideshowContainer.innerHTML = `
        <div class="slides">${slidesHTML}</div>
        <button class="slide-btn prev" aria-label="Previous slide">❮</button>
        <button class="slide-btn next" aria-label="Next slide">❯</button>
        <div class="slide-dots"></div>
    `;
    mainHeading.insertAdjacentElement('afterend', slideshowContainer);
    
    const slides = slideshowContainer.querySelectorAll('.slide');
    const dotsContainer = slideshowContainer.querySelector('.slide-dots');
    const slideImages = slideshowContainer.querySelectorAll('.slide img');
    
    slideImages.forEach(img => {
        img.onerror = function() {
            this.src = 'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400"%3E%3Crect width="800" height="400" fill="%23ccc"/%3E%3Ctext x="400" y="200" font-family="Arial" font-size="40" fill="%23666" text-anchor="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
            console.warn(`Slideshow image failed to load: ${this.alt}`);
        };
    });
    
    slides.forEach((_, index) => {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (index === 0) dot.classList.add('active');
        dot.dataset.index = index;
        dotsContainer.appendChild(dot);
    });
    
    let currentSlide = 0;
    const slidesCount = slides.length;
    let slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    
    function goToSlide(index) {
        slides[currentSlide].classList.remove('active');
        dotsContainer.children[currentSlide].classList.remove('active');

        currentSlide = (index + slidesCount) % slidesCount; // Wraps around

        slides[currentSlide].classList.add('active');
        dotsContainer.children[currentSlide].classList.add('active');
    }
    
    function resetInterval() {
        clearInterval(slideInterval);
        slideInterval = setInterval(() => goToSlide(currentSlide + 1), 5000);
    }

    slideshowContainer.querySelector('.prev').addEventListener('click', () => {
        goToSlide(currentSlide - 1);
        resetInterval();
    });
    slideshowContainer.querySelector('.next').addEventListener('click', () => {
        goToSlide(currentSlide + 1);
        resetInterval();
    });
    dotsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('dot')) {
            goToSlide(parseInt(e.target.dataset.index));
            resetInterval();
        }
    });
}


function initializeFormValidation() {
    const signupForm = document.querySelector('.signup-form form');
    const loginForm = document.querySelector('.login-form form');
    
    if (signupForm) setupForm(signupForm, 'signup');
    if (loginForm) setupForm(loginForm, 'login');
}

function setupForm(form, formType) {
    const inputs = form.querySelectorAll('input:not([type="checkbox"]):not([type="submit"])');
    const submitBtn = form.querySelector('button[type="submit"], button:not([type="button"])'); // Allow for both

    if (submitBtn && submitBtn.getAttribute('onclick')) {
        submitBtn.removeAttribute('onclick'); // Remove inline JS
    }
    if(submitBtn) submitBtn.type = 'submit';


    inputs.forEach(input => {
        // Ensure error span exists
        let errorSpan = input.parentElement.querySelector('.error-message');
        if (!errorSpan) {
            errorSpan = document.createElement('span');
        errorSpan.className = 'error-message';
        input.parentElement.appendChild(errorSpan);
        }

        input.addEventListener('input', () => validateInput(input, formType)); // Validate on input
        input.addEventListener('blur', () => validateInput(input, formType));  // Also on blur

            const label = input.parentElement.querySelector('label');
            if (label) {
            input.addEventListener('focus', () => label.classList.add('focused-label'));
            input.addEventListener('blur', () => {
                if (!input.value) label.classList.remove('focused-label');
            });
        }
    });

    if (formType === 'signup') {
        const passwordInput = form.querySelector('#password');
        if (passwordInput) {
            createPasswordStrengthMeter(passwordInput);
            passwordInput.addEventListener('input', () => {
                updatePasswordStrength(passwordInput.value);
                validateInput(passwordInput, formType); // Re-validate password for strength
            });
        }
    }
    
    if (submitBtn) {
        submitBtn.addEventListener('mouseenter', () => submitBtn.classList.add('pulse'));
        submitBtn.addEventListener('mouseleave', () => submitBtn.classList.remove('pulse'));
    }


    form.addEventListener('submit', (e) => {
        e.preventDefault();
        let isValid = true;
        inputs.forEach(input => {
            if (!validateInput(input, formType)) isValid = false;
        });

        if (formType === 'signup') {
            const termsCheckbox = form.querySelector('#terms');
            const termsLabel = termsCheckbox ? termsCheckbox.parentElement : null;
            if (termsCheckbox && !termsCheckbox.checked) {
                isValid = false;
                if (termsLabel) termsLabel.classList.add('error'); // Visual cue for terms
            } else if (termsLabel) {
                termsLabel.classList.remove('error');
            }
        }

        if (isValid) {
            console.log(`${formType} form submitted successfully.`);
            // Simulate submission:
            alert(`${formType === 'signup' ? 'Signup' : 'Login'} successful! Redirecting...`);
            window.location.href = 'index.html';
        } else {
            console.log(`${formType} form validation failed.`);
        }
    });
}

function validateInput(input, formType) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    let message = '';
    let isValid = true;
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (input.id) {
        case 'name':
            if (value === '') message = 'Name is required.';
            else if (value.length < 3) message = 'Name must be at least 3 characters.';
            break;
        case 'email':
            if (value === '') message = 'Email is required.';
            else if (!emailRegex.test(value)) message = 'Please enter a valid email.';
            break;
        case 'password':
            if (value === '') {
                message = 'Password is required.';
                if (formType === 'signup') updatePasswordStrength(0); // Reset strength meter
            } else if (formType === 'signup') {
                if (value.length < 8) message = 'Password must be at least 8 characters.';
                else {
                    const strength = calculatePasswordStrength(value);
                    updatePasswordStrength(strength); // Update meter
                    if (strength < 3) message = 'Password is too weak.';
                }
            }
            break;
        case 'confirm-password':
            if (formType === 'signup') {
                const password = document.getElementById('password').value;
                if (value === '') message = 'Please confirm your password.';
                else if (value !== password) message = 'Passwords do not match.';
            }
            break;
    }

    if (message) isValid = false;
    errorSpan.textContent = message;
    input.classList.toggle('input-error', !isValid); // Add/remove error class on input
    return isValid;
}

function createPasswordStrengthMeter(passwordInput) {
    const passwordGroup = passwordInput.parentElement;
    let strengthMeterContainer = passwordGroup.querySelector('.password-strength');
    if (strengthMeterContainer) return; // Already exists

    strengthMeterContainer = document.createElement('div');
    strengthMeterContainer.className = 'password-strength';
    strengthMeterContainer.innerHTML = `
        <div class="strength-meter">
            <div class="strength-meter-fill" style="width: 0%"></div>
        </div>
        <div class="strength-text">Password strength: <span>Empty</span></div>
    `;
    passwordGroup.appendChild(strengthMeterContainer);
    
    // Add responsive CSS directly to ensure it works
    const meterStyles = document.createElement('style');
    meterStyles.textContent = `
        .password-strength {
            width: 100%;
            margin-top: 8px;
            margin-bottom: 15px;
        }
        .strength-meter {
            height: 6px;
            background-color: #e0e0e0;
            border-radius: 3px;
            position: relative;
            overflow: hidden;
            transition: height 0.2s ease;
        }
        .strength-meter-fill {
            height: 100%;
            border-radius: 3px;
            transition: width 0.5s ease-out, background-color 0.5s ease;
            width: 0%;
            background-color: #ddd;
        }
        .strength-text {
            font-size: 12px;
            margin-top: 5px;
            color: #888;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .strength-text span {
            font-weight: bold;
        }
        @media (max-width: 576px) {
            .strength-meter {
                height: 5px;
            }
            .strength-text {
                font-size: 11px;
            }
        }
    `;
    document.head.appendChild(meterStyles);
    
    updatePasswordStrength(0); // Initialize with empty state
}

function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let strength = 0;
    
    // Length check (improved)
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 0.5;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) strength += 1; // Uppercase
    if (/[a-z]/.test(password)) strength += 1; // Lowercase
    if (/[0-9]/.test(password)) strength += 1; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 1; // Special characters
    
    // Extra points for mixed character types
    const hasMultipleTypes = 
        (/[A-Z]/.test(password) ? 1 : 0) +
        (/[a-z]/.test(password) ? 1 : 0) +
        (/[0-9]/.test(password) ? 1 : 0) +
        (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
        
    if (hasMultipleTypes >= 3) strength += 0.5;
    
    // Cap at 5
    return Math.min(5, strength);
}

function updatePasswordStrength(strengthValue) {
    let strength = typeof strengthValue === 'string' ? 
        calculatePasswordStrength(strengthValue) : strengthValue;
    
    const strengthFill = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');
    if (!strengthFill || !strengthText) return;

    // Calculate percentage for visual fill (rounded to nearest 5%)
    const percentage = Math.round((strength / 5) * 100 / 5) * 5;
    
    // Set width with animation
    strengthFill.style.width = `${percentage}%`;

    // Define text and colors
    let text, color;
    if (strength === 0) { 
        text = 'Empty'; 
        color = '#ddd'; 
    } else if (strength <= 2) { 
        text = 'Weak'; 
        color = '#e74c3c'; // Red
    } else if (strength <= 3) { 
        text = 'Medium'; 
        color = '#f39c12'; // Orange
    } else if (strength <= 4) { 
        text = 'Good'; 
        color = '#3498db'; // Blue
    } else { 
        text = 'Strong'; 
        color = '#2ecc71'; // Green
    }
    
    // Apply styles and text
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = text;
    strengthText.style.color = color;
    
    // Add subtle animation
    strengthFill.style.transition = 'width 0.5s ease-out, background-color 0.5s ease';
    setTimeout(() => {
        strengthFill.classList.add('animated');
    }, 10);
}

function validateInput(input, formType) {
    const errorSpan = input.parentElement.querySelector('.error-message');
    let message = '';
    let isValid = true;
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    switch (input.id) {
        case 'name':
            if (value === '') message = 'Name is required.';
            else if (value.length < 3) message = 'Name must be at least 3 characters.';
            break;
        case 'email':
            if (value === '') message = 'Email is required.';
            else if (!emailRegex.test(value)) message = 'Please enter a valid email.';
            break;
        case 'password':
            if (value === '') {
                message = 'Password is required.';
                if (formType === 'signup') updatePasswordStrength(0); // Reset strength meter
            } else if (formType === 'signup') {
                if (value.length < 8) message = 'Password must be at least 8 characters.';
                else {
                    const strength = calculatePasswordStrength(value);
                    updatePasswordStrength(strength); // Update meter
                    if (strength < 3) message = 'Password is too weak. Add numbers, symbols or uppercase letters.';
                }
            }
            break;
        case 'confirm-password':
            if (formType === 'signup') {
                const password = document.getElementById('password').value;
                if (value === '') message = 'Please confirm your password.';
                else if (value !== password) message = 'Passwords do not match.';
            }
            break;
    }

    if (message) isValid = false;
    errorSpan.textContent = message;
    input.classList.toggle('input-error', !isValid);
    return isValid;
}

function calculatePasswordStrength(password) {
    let strength = 0;
    if (!password) return 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++; // Special character
    return strength;
}

function updatePasswordStrength(strengthValue) { // Can be password string or strength number
    let strength = typeof strengthValue === 'string' ? calculatePasswordStrength(strengthValue) : strengthValue;
    
    const strengthFill = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');
    if (!strengthFill || !strengthText) return;

    const percentage = (strength / 5) * 100;
    strengthFill.style.width = `${percentage}%`;

    let text = 'Empty';
    let color = '#ddd'; // Default for empty
    if (strength === 0) { /* Handled by default */ }
    else if (strength <= 2) { text = 'Weak'; color = '#e74c3c'; } // Red
    else if (strength <= 3) { text = 'Medium'; color = '#f39c12'; } // Orange
    else { text = 'Strong'; color = '#2ecc71'; } // Green
    
    strengthFill.style.backgroundColor = color;
    strengthText.textContent = text;
}


function initializeContentCardLinks() {
    document.querySelectorAll('.card').forEach(card => {
        const titleElement = card.querySelector('h2');
        if (!titleElement) return;
        
        const title = titleElement.textContent.trim();
        
        // Determine if it's anime or manga through multiple methods
        const isAnimeCard = 
            card.closest('[data-type="anime"]') || 
            card.closest('[data-content-type="anime"]') ||
            card.closest('.anime-page-content') || 
            window.location.pathname.toLowerCase().endsWith('anime.html') ||
            card.querySelector('.image-box img')?.src.toLowerCase().includes('animepics');
            
        const isMangaCard = 
            card.closest('[data-type="manga"]') || 
            card.closest('[data-content-type="manga"]') ||
            card.closest('.manga-page-content') || 
            window.location.pathname.toLowerCase().endsWith('manga.html') ||
            card.querySelector('.image-box img')?.src.toLowerCase().includes('mangapics');

        card.style.cursor = 'pointer';
        
        console.log(`Card "${title}" - isAnime: ${isAnimeCard}, isManga: ${isMangaCard}`);
        
        card.addEventListener('click', (e) => {
            // Prevent click if a button/link inside the card was clicked
            if (e.target.closest('a, button')) return;
            
            if (isAnimeCard) {
                console.log(`Anime card clicked: ${title}`);
                window.location.href = `anime-detail.html?title=${encodeURIComponent(title)}`;
            } else if (isMangaCard) {
                console.log(`Manga card clicked: ${title}`);
                window.location.href = `manga-detail.html?title=${encodeURIComponent(title)}`;
            } else {
                // Default to manga if we can't determine
                console.log(`Undetermined card type clicked: ${title}, defaulting to manga`);
                window.location.href = `manga-detail.html?title=${encodeURIComponent(title)}`;
            }
        });
    });
}

// Data for manga details - ideally from an API or separate JSON file
const mangaDetailsData = {
    'Attack on Titan': { title: 'Attack on Titan', rating: 9.5, genre: 'Adventure, Fantasy, Horror', image: '../Res/Mangapics/AOT.jpg', synopsis: 'In a world where humanity lives within cities surrounded by enormous walls due to the Titans...', status: 'Completed', volumes: 34, chapterCount: 141, published: '2009 - 2021', author: 'Hajime Isayama', chapters: [{number: 141, title: 'Toward the Tree on That Hill', date: 'April 9, 2021'}, {number: 140, title: 'The Final Battle', date: 'March 9, 2021'}], related: ['Berserk', 'Vinland Saga'] },
    'Attack on Titan: Final': { title: 'Attack on Titan: Final', rating: 9.6, genre: 'Action, Drama, Fantasy', image: '../Res/Mangapics/AOT.jpg', synopsis: 'The thrilling conclusion to the epic Attack on Titan saga...', status: 'Completed', volumes: 34, chapterCount: 141, published: '2009 - 2021', author: 'Hajime Isayama', chapters: [{number: 141, title: 'Toward the Tree on That Hill', date: 'April 9, 2021'}], related: ['Berserk', 'Vinland Saga'] },
    'Berserk': { title: 'Berserk', rating: 9.8, genre: 'Dark Fantasy, Horror, Action', image: '../Res/Mangapics/Berserk.jpg', synopsis: 'Guts, a former mercenary now known as the "Black Swordsman," is out for revenge...', status: 'Ongoing', volumes: 41, chapterCount: 363, published: '1989 - Present', author: 'Kentaro Miura (RIP)', chapters: [{number: 363, title: 'Reunion on the Hill of Swords', date: 'January 22, 2021'}], related: ['Vagabond', 'Vinland Saga'] },
    'Solo Leveling': { title: 'Solo Leveling', rating: 9.2, genre: 'Action, Adventure, Fantasy', image: '../Res/Mangapics/SoloLvl.jpg', synopsis: 'In a world where hunters - humans who possess magical abilities - must battle deadly monsters...', status: 'Completed', volumes: 14, chapterCount: 179, published: '2018 - 2021', author: 'Chugong (Story), DUBU (Art)', chapters: [{number: 179, title: 'Epilogue', date: 'December 29, 2021'}], related: ['The Beginning After The End', 'Omniscient Reader'] },
    'One Punch Man': { title: 'One Punch Man', rating: 8.9, genre: 'Comedy, Action, Superhero', image: '../Res/Mangapics/one punch man.jpg', synopsis: 'Saitama has become too powerful and can defeat his enemies with a single punch...', status: 'Ongoing', volumes: 26, chapterCount: 180, published: '2012 - Present', author: 'ONE (Story), Yusuke Murata (Art)', chapters: [{number: 180, title: 'Absolute Evil', date: 'March 23, 2023'}], related: ['Mob Psycho 100', 'My Hero Academia'] },
    'Vagabond': { title: 'Vagabond', rating: 9.5, genre: 'Historical, Action, Drama', image: '../Res/Mangapics/Vagapond.jpg', synopsis: 'Vagabond is a Japanese manga series that portrays a fictionalized account of the life of Japanese swordsman Musashi Miyamoto...', status: 'On Hiatus', volumes: 37, chapterCount: 327, published: '1998 - 2015', author: 'Takehiko Inoue', chapters: [{number: 327, title: 'Final Duel Preview', date: 'May 15, 2015'}], related: ['Berserk', 'Kingdom'] }
};
const defaultMangaData = (title) => ({ title: title, rating: 0, genre: 'N/A', image: '../Res/Mangapics/placeholder.jpg', synopsis: 'No detailed information available.', status: 'Unknown', volumes: 'N/A', chapterCount: 'N/A', published: 'Unknown', author: 'Unknown', chapters: [], related: [] });

function displayMangaDetails(title) {
    const manga = mangaDetailsData[title] || defaultMangaData(title);

    const mangaHeader = document.querySelector('.manga-header');
    if (mangaHeader) mangaHeader.style.backgroundImage = `url('${manga.image}')`;
    
    document.getElementById('manga-title').textContent = manga.title;
    document.getElementById('manga-rating').textContent = manga.rating > 0 ? `⭐ ${manga.rating}` : 'N/A';
    document.getElementById('manga-genre').textContent = manga.genre;
    document.getElementById('manga-image').src = manga.image;
    document.getElementById('manga-image').alt = manga.title;
    document.getElementById('manga-synopsis').textContent = manga.synopsis;
    // ... (update other elements: status, volumes, etc.)
    document.getElementById('manga-status').textContent = manga.status;
    document.getElementById('manga-volumes').textContent = manga.volumes;
    document.getElementById('manga-chapters').textContent = manga.chapterCount;
    document.getElementById('manga-published').textContent = manga.published;
    document.getElementById('manga-author').textContent = manga.author;
    
    
    document.getElementById('manga-image').classList.add('floating'); // Assuming 'floating' class exists
    
    const chapterList = document.getElementById('chapter-list');
    chapterList.innerHTML = ''; // Clear previous
    if (manga.chapters && manga.chapters.length > 0) {
        manga.chapters.forEach((chapter, index) => {
            const li = document.createElement('li');
            li.className = 'chapter-item';
            // Apply staggered animation if desired (requires CSS for .animate-in-item or similar)
            li.style.animationDelay = `${index * 0.05}s`;
            li.classList.add('animate-in-item'); // Add class for CSS animation
            li.innerHTML = `
                <span class="chapter-number">Chapter ${chapter.number}</span>
                <span class="chapter-title">${chapter.title}</span>
                <span class="chapter-date">${chapter.date}</span>
                <a href="#" class="read-chapter-btn">Read</a>
            `;
            chapterList.appendChild(li);
        });
    } else {
        chapterList.innerHTML = `<li class="no-chapters">No chapters available.</li>`;
    }
    
    const relatedContainer = document.getElementById('related-manga');
    relatedContainer.innerHTML = '';
    if (manga.related && manga.related.length > 0) {
        manga.related.forEach((relatedTitle, index) => {
            const relatedData = mangaDetailsData[relatedTitle] || { title: relatedTitle, image: defaultMangaData('').image };
            const card = document.createElement('div');
            card.className = 'related-card animate-in-item'; // Add animation class
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="related-image">
                    <img src="${relatedData.image}" alt="${relatedData.title}">
                    <h4>${relatedData.title}</h4>
                </div>`;
            card.addEventListener('click', () => {
                window.location.href = `manga-detail.html?title=${encodeURIComponent(relatedData.title)}`;
            });
            relatedContainer.appendChild(card);
        });
    } else {
        relatedContainer.innerHTML = `<p>No related manga found.</p>`;
    }
    
    document.title = `Animanga - ${manga.title}`;
    document.body.classList.add('fade-in'); // Ensure fade-in if navigating here directly
}

// Specific logic for manga-detail.html page
if (window.location.pathname.includes('manga-detail.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Apply saved theme again specifically for detail pages
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.dataset.theme = savedTheme;
        
        const urlParams = new URLSearchParams(window.location.search);
        const mangaTitle = urlParams.get('title');
        if (mangaTitle) {
            displayMangaDetails(mangaTitle);
        } else {
            console.warn('Manga title missing in URL. Redirecting to manga list.');
            window.location.href = 'manga.html'; // Or your main manga listing page
        }
    });
}


function initializeHorizontalScrollButtons(sectionElement, listElement) {
        const leftBtn = document.createElement('button');
        leftBtn.className = 'scroll-nav scroll-left';
    leftBtn.innerHTML = '❮';
        leftBtn.setAttribute('aria-label', 'Scroll left');
        
        const rightBtn = document.createElement('button');
        rightBtn.className = 'scroll-nav scroll-right';
    rightBtn.innerHTML = '❯';
        rightBtn.setAttribute('aria-label', 'Scroll right');
        
    sectionElement.appendChild(leftBtn);
    sectionElement.appendChild(rightBtn);

    const scrollAmount = () => {
        const firstCard = listElement.querySelector('.card');
        return firstCard ? firstCard.offsetWidth + 20 : 300; // Card width + gap, or default
    }
    

    leftBtn.addEventListener('click', () => listElement.scrollBy({ left: -scrollAmount(), behavior: 'smooth' }));
    rightBtn.addEventListener('click', () => listElement.scrollBy({ left: scrollAmount(), behavior: 'smooth' }));

    const updateButtonVisibility = () => {
        const currentScroll = listElement.scrollLeft;
        const maxScroll = listElement.scrollWidth - listElement.clientWidth;

        leftBtn.style.opacity = currentScroll > 0 ? '0.8' : '0.3'; // Use opacity for visibility
        leftBtn.style.pointerEvents = currentScroll > 0 ? 'auto' : 'none';

        rightBtn.style.opacity = currentScroll < maxScroll - 5 ? '0.8' : '0.3'; // -5 for small tolerance
        rightBtn.style.pointerEvents = currentScroll < maxScroll - 5 ? 'auto' : 'none';
    };
    
    // Debounce resize updates
    let resizeTimeout;
        window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(updateButtonVisibility, 150);
    });
    listElement.addEventListener('scroll', updateButtonVisibility);
    
    // Initial check after content might have loaded
    setTimeout(updateButtonVisibility, 200); // A bit of delay for layout to settle
    // Also consider calling after images have loaded if cards change size
    window.addEventListener('load', () => setTimeout(updateButtonVisibility, 300));
}


function initializeCardInteractions() {
    const cards = document.querySelectorAll('.card');
    const tiltMax = 5; // Max tilt angle in degrees
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.1s ease-out, box-shadow 0.1s ease-out';
        });
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left; // x position within the element.
            const y = e.clientY - rect.top;  // y position within the element.

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * tiltMax;
            const rotateY = -((x - centerX) / centerX) * tiltMax; // Negative for natural feel

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
            // Dynamic shadow based on tilt (optional, can be subtle)
            // card.style.boxShadow = `${rotateY * -0.5}px ${rotateX * 0.5}px 20px rgba(0,0,0,0.25)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s ease-in-out, box-shadow 0.4s ease-in-out';
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
            // card.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)'; // Reset to default or CSS defined
        });
    });
}

// Add anime details data
const animeDetailsData = {
    'Neon Genesis Evangelion': {
        title: 'Neon Genesis Evangelion', 
        rating: 8.5, 
        genre: 'Mecha, Drama, Psychological',
        image: '../Res/Animepics/EVA.jpg',
        synopsis: 'In a world beset by giant alien creatures known as Angels, young Shinji Ikari is recruited by his estranged father to pilot a giant bio-machine called an Evangelion to combat them.',
        status: 'Completed', 
        episodes: 26, 
        aired: '1995-1996', 
        studio: 'Gainax, Tatsunoko',
        episodeList: [
            { number: 1, title: 'Angel Attack', airDate: 'Oct 4, 1995' },
            { number: 2, title: 'The Beast', airDate: 'Oct 11, 1995' },
            { number: 3, title: 'A Transfer', airDate: 'Oct 18, 1995' },
            { number: 4, title: 'Hedgehog\'s Dilemma', airDate: 'Oct 25, 1995' }
        ],
        related: ['Demon Slayer', 'Attack on Titan', 'Death Note']
    },
    'Demon Slayer': {
        title: 'Demon Slayer', 
        rating: 8.6, 
        genre: 'Action, Fantasy, Supernatural',
        image: '../Res/Animepics/demon.jpg',
        synopsis: 'Tanjiro Kamado joins the Demon Slayer Corps to restore his sister\'s humanity and avenge his family.',
        status: 'Ongoing', 
        episodes: 44, 
        aired: '2019-Present', 
        studio: 'ufotable',
        episodeList: [
            { number: 1, title: 'Cruelty', airDate: 'Apr 6, 2019' },
            { number: 2, title: 'Trainer Sakonji Urokodaki', airDate: 'Apr 13, 2019' }
        ],
        related: ['Neon Genesis Evangelion', 'Attack on Titan', 'Solo Leveling S2']
    },
    'Death Note': {
        title: 'Death Note', 
        rating: 9.0, 
        genre: 'Mystery, Thriller, Supernatural',
        image: '../Res/Animepics/Note.jpg',
        synopsis: 'A high school student discovers a supernatural notebook that gives him the power to kill anyone by writing their name in it.',
        status: 'Completed', 
        episodes: 37, 
        aired: '2006-2007', 
        studio: 'Madhouse',
        episodeList: [
            { number: 1, title: 'Rebirth', airDate: 'Oct 3, 2006' },
            { number: 2, title: 'Confrontation', airDate: 'Oct 10, 2006' }
        ],
        related: ['Neon Genesis Evangelion', 'Full Metal Alchemist']
    },
    'Solo Leveling S2': {
        title: 'Solo Leveling S2', 
        rating: 9.1, 
        genre: 'Action, Adventure, Fantasy',
        image: '../Res/Animepics/SoloLvl.jpg',
        synopsis: 'Second season of the hit anime following Sung Jin-Woo as he continues his journey from being the weakest hunter to the strongest solo leveler.',
        status: 'Ongoing', 
        episodes: 12, 
        aired: '2024-Present', 
        studio: 'A-1 Pictures',
        episodeList: [
            { number: 13, title: 'Return of the King', airDate: 'Jan 7, 2024' },
            { number: 14, title: 'The Nation-Level Hunter', airDate: 'Jan 14, 2024' }
        ],
        related: ['Demon Slayer', 'Attack on Titan']
    },
    'Attack on Titan': {
        title: 'Attack on Titan', 
        rating: 9.1, 
        genre: 'Action, Drama, Dark Fantasy',
        image: '../Res/Animepics/titan.jpg',
        synopsis: 'Humanity fights for survival against man-eating giants called Titans as they threaten to destroy the last of mankind.',
        status: 'Completed', 
        episodes: 87, 
        aired: '2013-2023', 
        studio: 'Wit Studio, MAPPA',
        episodeList: [
            { number: 1, title: 'To You, 2000 Years From Now', airDate: 'Apr 7, 2013' },
            { number: 2, title: 'That Day', airDate: 'Apr 14, 2013' }
        ],
        related: ['Neon Genesis Evangelion', 'Death Note']
    },
    'Dragon Ball Z': {
        title: 'Dragon Ball Z', 
        rating: 8.7, 
        genre: 'Action, Adventure, Fantasy',
        image: '../Res/Animepics/dbz.jpg',
        synopsis: 'The adventures of Goku and his friends as they defend Earth against powerful fighters and alien threats.',
        status: 'Completed', 
        episodes: 291, 
        aired: '1989-1996', 
        studio: 'Toei Animation',
        episodeList: [
            { number: 1, title: 'The New Threat', airDate: 'Apr 26, 1989' },
            { number: 2, title: 'Reunions', airDate: 'May 3, 1989' }
        ],
        related: ['Naruto', 'Full Metal Alchemist']
    },
    'Naruto': {
        title: 'Naruto', 
        rating: 8.3, 
        genre: 'Action, Adventure, Fantasy',
        image: '../Res/Animepics/naruto.jpg',
        synopsis: 'Naruto Uzumaki, a mischievous adolescent ninja, struggles as he searches for recognition and dreams of becoming the Hokage.',
        status: 'Completed', 
        episodes: 220, 
        aired: '2002-2007', 
        studio: 'Pierrot',
        episodeList: [
            { number: 1, title: 'Enter: Naruto Uzumaki!', airDate: 'Oct 3, 2002' },
            { number: 2, title: 'My Name is Konohamaru!', airDate: 'Oct 10, 2002' }
        ],
        related: ['Dragon Ball Z', 'Full Metal Alchemist']
    },
    'Full Metal Alchemist': {
        title: 'Full Metal Alchemist', 
        rating: 9.2, 
        genre: 'Action, Adventure, Fantasy',
        image: '../Res/Animepics/fma.jpg',
        synopsis: 'Two brothers search for the Philosopher\'s Stone to restore their bodies after a failed alchemical ritual.',
        status: 'Completed', 
        episodes: 64, 
        aired: '2009-2010', 
        studio: 'Bones',
        episodeList: [
            { number: 1, title: 'Fullmetal Alchemist', airDate: 'Apr 5, 2009' },
            { number: 2, title: 'The First Day', airDate: 'Apr 12, 2009' }
        ],
        related: ['Death Note', 'Naruto', 'Dragon Ball Z']
    }
};

const defaultAnimeData = (title) => ({ 
    title: title, 
    rating: 0, 
    genre: 'N/A', 
    image: '../Res/Animepics/EVA.jpg', 
    synopsis: 'No detailed information available.', 
    status: 'Unknown', 
    episodes: 'N/A', 
    aired: 'Unknown', 
    studio: 'Unknown', 
    episodeList: [], 
    related: [] 
});

function displayAnimeDetails(title) {
    console.log(`Attempting to display details for anime title: "${title}"`);
    console.log(`Available anime keys: ${Object.keys(animeDetailsData)}`);
    
    const anime = animeDetailsData[title] || defaultAnimeData(title);
    
    if (!animeDetailsData[title]) {
        console.warn(`No exact match found for title: "${title}", using default data.`);
    }

    // Selectors for anime-detail.html
    const animeHeader = document.querySelector('.anime-header');
    if (animeHeader) animeHeader.style.backgroundImage = `url('${anime.image}')`;

    document.getElementById('anime-title').textContent = anime.title;
    document.getElementById('anime-rating').textContent = anime.rating > 0 ? `⭐ ${anime.rating}` : 'N/A';
    document.getElementById('anime-genre').textContent = anime.genre;
    document.getElementById('anime-image').src = anime.image;
    document.getElementById('anime-image').alt = anime.title;
    document.getElementById('anime-synopsis').textContent = anime.synopsis;
    document.getElementById('anime-status').textContent = anime.status;
    document.getElementById('anime-episodes').textContent = anime.episodes;
    document.getElementById('anime-aired').textContent = anime.aired;
    document.getElementById('anime-studio').textContent = anime.studio;

    document.getElementById('anime-image').classList.add('floating');

    const episodeListEl = document.getElementById('episode-list');
    episodeListEl.innerHTML = '';
    if (anime.episodeList && anime.episodeList.length > 0) {
        anime.episodeList.forEach((ep, index) => {
            const li = document.createElement('li');
            li.className = 'episode-item';
            li.style.animationDelay = `${index * 0.05}s`;
            li.classList.add('animate-in-item');
            li.innerHTML = `
                <span class="episode-number">Episode ${ep.number}</span>
                <span class="episode-title">${ep.title}</span>
                <span class="episode-date">${ep.airDate}</span>
                <a href="#" class="watch-episode-btn">Watch</a>
            `;
            episodeListEl.appendChild(li);
        });
    } else {
        episodeListEl.innerHTML = `<li class="no-episodes">No episode information available.</li>`;
    }

    const relatedContainer = document.getElementById('related-anime');
    relatedContainer.innerHTML = '';
    if (anime.related && anime.related.length > 0) {
        anime.related.forEach((relatedTitle, index) => {
            const relatedData = animeDetailsData[relatedTitle] || { title: relatedTitle, image: defaultAnimeData('').image };
            const card = document.createElement('div');
            card.className = 'related-card animate-in-item';
            card.style.animationDelay = `${index * 0.05}s`;
            card.innerHTML = `
                <div class="related-image">
                    <img src="${relatedData.image}" alt="${relatedData.title}">
                    <h4>${relatedData.title}</h4>
                </div>`;
            card.addEventListener('click', () => {
                window.location.href = `anime-detail.html?title=${encodeURIComponent(relatedData.title)}`;
            });
            relatedContainer.appendChild(card);
        });
    } else {
        relatedContainer.innerHTML = `<p>No related anime found.</p>`;
    }

    document.title = `Animanga - ${anime.title}`;
    document.body.classList.add('fade-in');
}

// Logic for anime-detail.html page
if (window.location.pathname.includes('anime-detail.html')) {
    document.addEventListener('DOMContentLoaded', () => {
        // Apply saved theme again specifically for detail pages
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.dataset.theme = savedTheme;
        
        const urlParams = new URLSearchParams(window.location.search);
        const animeTitle = urlParams.get('title');
        if (animeTitle) {
            displayAnimeDetails(animeTitle);
        } else {
            console.warn('Anime title missing in URL. Redirecting to anime list.');
            window.location.href = 'anime.html';
        }
    });
}

function initializePasswordStrengthMeter() {
    const passwordInput = document.getElementById('password');
    if (!passwordInput) return;
    
    // Create strength meter elements if they don't exist
    const passwordContainer = passwordInput.parentElement;
    let meterContainer = document.querySelector('.strength-meter-container');
    
    if (!meterContainer) {
        // Create the meter container and elements
        meterContainer = document.createElement('div');
        meterContainer.className = 'strength-meter-container';
        
        meterContainer.innerHTML = `
            <div class="strength-meter">
                <div class="strength-meter-fill"></div>
            </div>
            <div class="strength-text">Password strength: <span>Empty</span></div>
        `;
        
        // Insert after the password input
        passwordInput.insertAdjacentElement('afterend', meterContainer);
        
        // Add necessary CSS directly to ensure it works
        const style = document.createElement('style');
        style.textContent = `
            .strength-meter-container {
                width: 100%;
                margin-top: 8px;
                margin-bottom: 16px;
            }
            .strength-meter {
                height: 6px;
                background-color: #e0e0e0;
                border-radius: 3px;
                overflow: hidden;
                margin-bottom: 5px;
            }
            .strength-meter-fill {
                height: 100%;
                width: 0%;
                border-radius: 3px;
                transition: width 0.3s ease, background-color 0.3s ease;
            }
            .strength-text {
                font-size: 14px;
                color: #666;
            }
            .strength-text span {
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add event listener for password input
    passwordInput.addEventListener('input', function() {
        updatePasswordStrength(this.value);
    });
    
    // Initial state
    updatePasswordStrength('');
}

function calculatePasswordStrength(password) {
    if (!password) return 0;
    
    let score = 0;
    
    // Length check
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    
    // Character type checks
    if (/[A-Z]/.test(password)) score += 15;  // Uppercase
    if (/[a-z]/.test(password)) score += 10;  // Lowercase
    if (/[0-9]/.test(password)) score += 15;  // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Special chars
    
    return Math.min(100, score);
}

function updatePasswordStrength(password) {
    const strengthMeterFill = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');
    
    if (!strengthMeterFill || !strengthText) return;
    
    const score = calculatePasswordStrength(password);
    
    // Update the meter fill width
    strengthMeterFill.style.width = `${score}%`;
    
    // Determine text and color based on score
    let text, color;
    
    if (password === '') {
        text = 'Empty';
        color = '#ccc';
    } else if (score < 40) {
        text = 'Weak';
        color = '#ff4d4d'; // Red
    } else if (score < 70) {
        text = 'Medium';
        color = '#ffa64d'; // Orange
    } else if (score < 85) {
        text = 'Good';
        color = '#2db7f5'; // Blue
    } else {
        text = 'Strong';
        color = '#4caf50'; // Green
    }
    
    // Update text and color
    strengthText.textContent = text;
    strengthText.style.color = color;
    strengthMeterFill.style.backgroundColor = color;
    
    console.log(`Password strength updated: ${score}%, ${text}`); // Debug
}

// Call this function when the page loads
document.addEventListener('DOMContentLoaded', function() {
    initializePasswordStrengthMeter();
    
    // Also make sure to call it explicitly for the signup page
    if (document.querySelector('#signup-form')) {
        initializePasswordStrengthMeter();
    }
});