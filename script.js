/**
 * Rezoan Iqbal - Portfolio JavaScript
 * Handles typing animation, theme switching, mobile navigation,
 * scroll observations, form validation, and copy-to-clipboard interactions.
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // 1. Theme Toggle (Dark & Light Mode)
    // -------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Check saved preference or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            showToast(`Switched to ${newTheme} mode`);
        });
    }

    // -------------------------------------------------------------
    // 2. Mobile Menu Toggle
    // -------------------------------------------------------------
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navMenu.classList.toggle('open');
            menuToggle.classList.toggle('active', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen);
        });

        // Close menu on link click
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
            });
        });

        // Close menu on click outside
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !menuToggle.contains(e.target) && navMenu.classList.contains('open')) {
                navMenu.classList.remove('open');
                menuToggle.classList.remove('active');
            }
        });
    }

    // -------------------------------------------------------------
    // 3. Typing Effect in Hero Section
    // -------------------------------------------------------------
    const typingElement = document.getElementById('typing-text');
    const roles = [
        'Senior Web Developer',
        'Creative Web Designer',
        'Illustrator & Artist',
        'Graphics Specialist',
        'Programming Enthusiast'
    ];

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const delayBetweenWords = 1800;

    function typeEffect() {
        if (!typingElement) return;

        const currentRole = roles[roleIndex];

        if (isDeleting) {
            typingElement.textContent = currentRole.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingElement.textContent = currentRole.substring(0, charIndex + 1);
            charIndex++;
        }

        let speed = isDeleting ? deletingSpeed : typingSpeed;

        if (!isDeleting && charIndex === currentRole.length) {
            speed = delayBetweenWords;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            speed = 400;
        }

        setTimeout(typeEffect, speed);
    }

    typeEffect();

    // -------------------------------------------------------------
    // 4. Navbar Background & Active Nav Link on Scroll
    // -------------------------------------------------------------
    const navbar = document.getElementById('navbar');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section[id]');

    function handleScroll() {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        // Sticky Navbar shadow
        if (navbar) {
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Back to top button visibility
        if (backToTopBtn) {
            if (scrollY > 400) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        }

        // Highlight active navigation section
        sections.forEach(current => {
            const sectionHeight = current.offsetHeight;
            const sectionTop = current.offsetTop - 120;
            const sectionId = current.getAttribute('id');
            const correspondingLink = document.querySelector(`.nav-link[href*="${sectionId}"]`);

            if (correspondingLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    correspondingLink.classList.add('active');
                } else {
                    correspondingLink.classList.remove('active');
                }
            }
        });
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    // Back to top click
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // -------------------------------------------------------------
    // 5. Animated Skill Progress Bars (Observer)
    // -------------------------------------------------------------
    const skillCards = document.querySelectorAll('.skill-card');
    if ('IntersectionObserver' in window) {
        const skillsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const progressBar = entry.target.querySelector('.progress-fill');
                    if (progressBar) {
                        const targetWidth = progressBar.style.width;
                        progressBar.style.width = '0%';
                        setTimeout(() => {
                            progressBar.style.width = targetWidth;
                        }, 100);
                    }
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.25 });

        skillCards.forEach(card => skillsObserver.observe(card));
    }

    // -------------------------------------------------------------
    // 6. Copy to Clipboard Functionality
    // -------------------------------------------------------------
    const copyButtons = document.querySelectorAll('.copy-btn');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', async () => {
            const textToCopy = btn.getAttribute('data-copy');
            if (!textToCopy) return;

            try {
                await navigator.clipboard.writeText(textToCopy);
                showToast(`Copied "${textToCopy}" to clipboard!`);
            } catch (err) {
                // Fallback for older browsers
                const textarea = document.createElement('textarea');
                textarea.value = textToCopy;
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    showToast(`Copied "${textToCopy}" to clipboard!`);
                } catch (fallbackErr) {
                    showToast('Failed to copy');
                }
                document.body.removeChild(textarea);
            }
        });
    });

    // -------------------------------------------------------------
    // 7. Toast Notification Handler
    // -------------------------------------------------------------
    const toast = document.getElementById('toast');
    let toastTimeout;

    function showToast(message) {
        if (!toast) return;
        const messageEl = toast.querySelector('.toast-message');
        if (messageEl) messageEl.textContent = message;

        toast.classList.add('show');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 2800);
    }

    // -------------------------------------------------------------
    // 8. Contact Form Client-side Validation & Mock Submission
    // -------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = document.getElementById('submit-btn');

    if (contactForm) {
        const nameInput = document.getElementById('name');
        const emailInput = document.getElementById('email');
        const subjectInput = document.getElementById('subject');
        const messageInput = document.getElementById('message');

        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(String(email).toLowerCase());
        }

        function clearErrors() {
            document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');
            document.querySelectorAll('.form-group').forEach(el => el.classList.remove('has-error'));
            if (formStatus) {
                formStatus.className = 'form-status';
                formStatus.textContent = '';
                formStatus.style.display = 'none';
            }
        }

        function setFieldError(field, errorId, message) {
            const errorElement = document.getElementById(errorId);
            if (errorElement) errorElement.textContent = message;
            field.closest('.form-group')?.classList.add('has-error');
        }

        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            let isValid = true;

            // Validate Name
            if (!nameInput.value.trim()) {
                setFieldError(nameInput, 'name-error', 'Please enter your name.');
                isValid = false;
            } else if (nameInput.value.trim().length < 2) {
                setFieldError(nameInput, 'name-error', 'Name must be at least 2 characters.');
                isValid = false;
            }

            // Validate Email
            if (!emailInput.value.trim()) {
                setFieldError(emailInput, 'email-error', 'Please enter your email address.');
                isValid = false;
            } else if (!validateEmail(emailInput.value.trim())) {
                setFieldError(emailInput, 'email-error', 'Please enter a valid email address.');
                isValid = false;
            }

            // Validate Subject
            if (!subjectInput.value.trim()) {
                setFieldError(subjectInput, 'subject-error', 'Please enter a subject.');
                isValid = false;
            } else if (subjectInput.value.trim().length < 3) {
                setFieldError(subjectInput, 'subject-error', 'Subject must be at least 3 characters.');
                isValid = false;
            }

            // Validate Message
            if (!messageInput.value.trim()) {
                setFieldError(messageInput, 'message-error', 'Please enter your message.');
                isValid = false;
            } else if (messageInput.value.trim().length < 10) {
                setFieldError(messageInput, 'message-error', 'Message should be at least 10 characters.');
                isValid = false;
            }

            if (!isValid) {
                return;
            }

            // Processing UI
            const originalBtnHtml = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span> <i class="fa-solid fa-spinner fa-spin"></i>`;

            // Simulate form submission delay
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;

                if (formStatus) {
                    formStatus.className = 'form-status success';
                    formStatus.textContent = `Thank you, ${nameInput.value.trim()}! Your message has been sent successfully. I will get back to you soon.`;
                    formStatus.style.display = 'block';
                }

                showToast('Message sent successfully!');
                contactForm.reset();
            }, 1200);
        });

        // Clear individual errors on input
        [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
            if (input) {
                input.addEventListener('input', () => {
                    input.closest('.form-group')?.classList.remove('has-error');
                    const errorElement = input.closest('.form-group')?.querySelector('.error-msg');
                    if (errorElement) errorElement.textContent = '';
                });
            }
        });
    }
});
