// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all functionality
    initNavigation();
    initScrollAnimations();
    initTypingAnimation();
    initContactForm();
    initSmoothScrolling();
    initParallaxEffects();
});

// Navigation Functionality
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle mobile menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 10, 0.98)';
            navbar.style.backdropFilter = 'blur(15px)';
        } else {
            navbar.style.background = 'rgba(10, 10, 10, 0.95)';
            navbar.style.backdropFilter = 'blur(10px)';
        }
    });

    // Active navigation highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${current}`) {
                item.classList.add('active');
            }
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-up');
                
                // Special animations for specific elements
                if (entry.target.classList.contains('stat-item') && !entry.target.hasAttribute('data-animated')) {
                    entry.target.setAttribute('data-animated', 'true');
                    animateCounter(entry.target.querySelector('.stat-number'));
                }
                
                if (entry.target.classList.contains('skill-item')) {
                    setTimeout(() => {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }, Math.random() * 300);
                }
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(
        '.timeline-item, .project-card, .skill-category, .stat-item, .highlight-item, .education-item'
    );
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s ease-out';
        observer.observe(el);
    });
}

// Counter Animation
function animateCounter(element) {
    const originalText = element.textContent.trim();
    const hasPlus = originalText.includes('+');
    
    // Extract the numeric value - handle cases like "2+", "15+", "1200+"
    let target = parseInt(originalText.replace(/[^0-9]/g, ''));
    
    // Ensure we have a valid target
    if (isNaN(target)) {
        console.warn('Invalid target for counter animation:', originalText);
        return;
    }
    
    let current = 0;
    const duration = 2000; // 2 seconds
    const stepTime = 50; // Update every 50ms
    const increment = target / (duration / stepTime);
    
    // Reset element to 0 before starting animation
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

// Typing Animation Enhancement
function initTypingAnimation() {
    const typingElement = document.querySelector('.typing-animation');
    if (!typingElement) return;

    const text = typingElement.textContent;
    typingElement.textContent = '';
    typingElement.style.borderRight = '3px solid var(--primary-color)';
    
    let i = 0;
    const typeWriter = () => {
        if (i < text.length) {
            typingElement.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
        } else {
            // Blinking cursor effect
            setInterval(() => {
                typingElement.style.borderRight = 
                    typingElement.style.borderRight === '3px solid transparent' 
                        ? '3px solid var(--primary-color)' 
                        : '3px solid transparent';
            }, 1000);
        }
    };
    
    setTimeout(typeWriter, 1000);
}

// Contact Form Functionality
function initContactForm() {
    const form = document.querySelector('.contact-form');
    if (!form) return;

    // Always prevent default form submission to handle it with AJAX
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        
        // Loading state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        
        try {
            // Check if using Formspree
            const formAction = form.getAttribute('action');
            if (formAction && formAction.includes('formspree.io')) {
                await sendFormspree(form, formAction);
            } else if (window.emailjs) {
                await sendEmailJS(form);
            } else {
                await simulateFormSubmission();
            }
            
            // Success state
            submitBtn.textContent = 'Message Sent!';
            submitBtn.style.background = 'linear-gradient(135deg, #27ca3f 0%, #00cc6a 100%)';
            
            // Reset form
            form.reset();
            
            // Show success message
            showNotification('Message sent successfully!', 'success');
            
        } catch (error) {
            // Error state
            submitBtn.textContent = 'Failed to Send';
            submitBtn.style.background = 'linear-gradient(135deg, #ff5f56 0%, #ff3333 100%)';
            showNotification('Failed to send message. Please try again.', 'error');
        }
        
        // Reset button after 3 seconds
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
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
    }
    
    return response.json();
}

// EmailJS Integration
async function sendEmailJS(form) {
    const formData = new FormData(form);
    const templateParams = {
        from_name: formData.get('name'),
        from_email: formData.get('email'),
        subject: formData.get('subject'),
        message: formData.get('message'),
        to_email: 'ahmadadnan2003aaa@gmail.com'
    };
    
    return emailjs.send(
        'YOUR_SERVICE_ID',    // Replace with your EmailJS service ID
        'YOUR_TEMPLATE_ID',   // Replace with your EmailJS template ID
        templateParams,
        'YOUR_PUBLIC_KEY'     // Replace with your EmailJS public key
    );
}

// Simulate form submission
function simulateFormSubmission() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate success (90% success rate)
            if (Math.random() > 0.1) {
                resolve();
            } else {
                reject(new Error('Network error'));
            }
        }, 2000);
    });
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease-out;
        ${type === 'success' ? 'background: linear-gradient(135deg, #27ca3f, #00cc6a);' : ''}
        ${type === 'error' ? 'background: linear-gradient(135deg, #ff5f56, #ff3333);' : ''}
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Smooth Scrolling Enhancement
function initSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 70; // Account for fixed navbar
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Parallax Effects
function initParallaxEffects() {
    const parallaxElements = document.querySelectorAll('.code-block, .hero::before');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.3;
        
        parallaxElements.forEach(element => {
            if (element.classList.contains('code-block')) {
                element.style.transform = `translateY(${rate * 0.5}px) perspective(1000px) rotateY(-5deg) rotateX(5deg)`;
            }
        });
    });
}

// Project Card Interactions
document.addEventListener('DOMContentLoaded', () => {
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) {
                placeholder.style.transform = 'scale(1.1) rotate(5deg)';
                placeholder.style.transition = 'all 0.3s ease';
            }
        });
        
        card.addEventListener('mouseleave', () => {
            const placeholder = card.querySelector('.project-placeholder');
            if (placeholder) {
                placeholder.style.transform = 'scale(1) rotate(0deg)';
            }
        });
    });
});

// Skill Items Hover Effects
document.addEventListener('DOMContentLoaded', () => {
    const skillItems = document.querySelectorAll('.skill-item');
    
    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            // Create ripple effect
            const ripple = document.createElement('div');
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(0, 255, 136, 0.3);
                pointer-events: none;
                transform: scale(0);
                animation: ripple 0.6s linear;
                top: 50%;
                left: 50%;
                width: 100px;
                height: 100px;
                margin-top: -50px;
                margin-left: -50px;
            `;
            
            item.style.position = 'relative';
            item.appendChild(ripple);
            
            setTimeout(() => {
                item.removeChild(ripple);
            }, 600);
        });
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Timeline Item Stagger Animation
function staggerTimelineItems() {
    const timelineItems = document.querySelectorAll('.timeline-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 200);
            }
        });
    }, { threshold: 0.1 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(50px)';
        item.style.transition = 'all 0.6s ease-out';
        observer.observe(item);
    });
}

// Initialize stagger animation
document.addEventListener('DOMContentLoaded', staggerTimelineItems);

// Theme Toggle (Future Enhancement)
function initThemeToggle() {
    // This can be extended for light/dark theme toggle
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('light-theme');
            localStorage.setItem('theme', 
                document.body.classList.contains('light-theme') ? 'light' : 'dark'
            );
        });
    }
    
    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
    }
}

// Performance Optimization
function optimizePerformance() {
    // Lazy load images when they come into view
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', optimizePerformance);

// Keyboard Navigation Enhancement
document.addEventListener('DOMContentLoaded', () => {
    // Focus management for accessibility
    const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );
    
    // Escape key to close mobile menu
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (navMenu.classList.contains('active')) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        }
    });
});

// Contact Form Validation Enhancement
function enhanceFormValidation() {
    const form = document.querySelector('.contact-form');
    if (!form) return;
    
    const inputs = form.querySelectorAll('input, textarea');
    
    inputs.forEach(input => {
        // Real-time validation
        input.addEventListener('blur', () => {
            validateField(input);
        });
        
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
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    }
    
    // Email validation
    if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    }
    
    // Update field styling
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
        animation: slideDown 0.3s ease-out;
    `;
    
    field.parentNode.appendChild(errorDiv);
}

function removeErrorMessage(field) {
    const errorMessage = field.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
}

// Add form validation styles
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
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(validationStyles);

// Initialize enhanced form validation
document.addEventListener('DOMContentLoaded', enhanceFormValidation);
