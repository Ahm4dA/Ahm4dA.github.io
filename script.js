// Respect the user's motion preference everywhere
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function () {
    initNavigation();
    initScrollAnimations();
    initTypingAnimation();
    initContactForm();
    enhanceFormValidation();
});

// Navigation Functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section[id]');

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        });
    });

    // Escape key closes the mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.focus();
        }
    });

    // Single rAF-throttled scroll handler for navbar style + active link
    let ticking = false;
    function onScroll() {
        // Navbar background
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }

        // Active navigation highlighting
        let current = '';
        sections.forEach(section => {
            if (window.pageYOffset >= section.offsetTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(item => {
            item.classList.toggle('active', item.getAttribute('href') === `#${current}`);
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            ticking = true;
            requestAnimationFrame(onScroll);
        }
    }, { passive: true });

    onScroll();
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll(
        '.timeline-item, .project-card, .skill-category, .stat-item, .highlight-item, .education-item'
    );

    if (prefersReducedMotion) {
        // Show everything immediately, but still trigger counters
        document.querySelectorAll('.stat-number').forEach(el => el.setAttribute('data-animated', 'true'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;

            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';

            if (entry.target.classList.contains('stat-item') && !entry.target.hasAttribute('data-animated')) {
                entry.target.setAttribute('data-animated', 'true');
                animateCounter(entry.target.querySelector('.stat-number'));
            }

            observer.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Counter Animation
function animateCounter(element) {
    if (!element) return;

    const originalText = element.textContent.trim();
    const hasPlus = originalText.includes('+');
    const target = parseInt(originalText.replace(/[^0-9]/g, ''), 10);

    if (isNaN(target)) return;

    let current = 0;
    const duration = 2000;
    const stepTime = 50;
    const increment = target / (duration / stepTime);

    element.textContent = '0' + (hasPlus ? '+' : '');

    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + (hasPlus ? '+' : '');
    }, stepTime);
}

// Typing Animation
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-animation');
    if (!typingElement) return;

    if (prefersReducedMotion) {
        typingElement.style.borderRight = 'none';
        return;
    }

    const text = typingElement.textContent;
    typingElement.textContent = '';
    typingElement.setAttribute('aria-label', text);

    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 90);
        } else {
            setInterval(() => {
                typingElement.style.borderRightColor =
                    typingElement.style.borderRightColor === 'transparent'
                        ? ''
                        : 'transparent';
            }, 600);
        }
    };

    setTimeout(typeWriter, 600);
}

// Contact Form Functionality
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;

        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';

        try {
            const formAction = form.getAttribute('action');
            if (formAction && formAction.includes('formspree.io')) {
                await sendFormspree(form, formAction);
            } else {
                throw new Error('No form backend configured');
            }

            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #27ca3f 0%, #00b868 100%)';
            form.reset();
            showNotification('Message sent successfully!', 'success');
        } catch (error) {
            submitBtn.textContent = 'Failed to Send';
            submitBtn.style.background = 'linear-gradient(135deg, #ff5f56 0%, #ff3333 100%)';
            showNotification('Message failed to send. Email me directly at ahmadadnan2003aaa@gmail.com.', 'error');
        }

        setTimeout(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.style.background = '';
        }, 3000);
    });
}

// Formspree AJAX submission
async function sendFormspree(form, action) {
    const formData = new FormData(form);

    const response = await fetch(action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to send message');
    }

    return response.json();
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'status');
    notification.textContent = message;

    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: min(360px, calc(100vw - 40px));
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(120%);
        transition: transform 0.3s ease-out;
        ${type === 'success' ? 'background: linear-gradient(135deg, #27ca3f, #00b868);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ff5f56, #ff3333);' : ''}
    `;

    document.body.appendChild(notification);

    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });

    setTimeout(() => {
        notification.style.transform = 'translateX(120%)';
        setTimeout(() => notification.remove(), 300);
    }, 4500);
}

// Contact Form Validation Enhancement
function enhanceFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    const inputs = form.querySelectorAll('input, textarea');

    inputs.forEach(input => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', () => {
            if (input.classList.contains('invalid')) {
                validateField(input);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }

    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Enter a valid email address';
        }
    }

    if (isValid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
        removeErrorMessage(field);
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
        showErrorMessage(field, errorMessage);
    }

    return isValid;
}

function showErrorMessage(field, message) {
    removeErrorMessage(field);

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = `
        color: #ff5f56;
        font-size: 0.8rem;
        margin-top: 5px;
    `;

    field.parentNode.appendChild(errorDiv);
    field.setAttribute('aria-invalid', 'true');
}

function removeErrorMessage(field) {
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) errorMessage.remove();
    field.removeAttribute('aria-invalid');
}

// Validation styles
const validationStyles = document.createElement('style');
validationStyles.textContent = `
    .form-group input.invalid,
    .form-group textarea.invalid {
        border-color: #ff5f56;
        box-shadow: 0 0 0 3px rgba(255, 95, 86, 0.1);
    }

    .form-group input.valid,
    .form-group textarea.valid {
        border-color: #27ca3f;
        box-shadow: 0 0 0 3px rgba(39, 202, 63, 0.1);
    }
`;
document.head.appendChild(validationStyles);
