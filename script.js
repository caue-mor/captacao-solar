// ============================================
// VORTEXX - CAPTACAO SOLAR AGRESSIVA
// Interactive JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initParticles();
    initScrollAnimations();
    initCalculator();
    initSmoothScroll();
});

// ============================================
// PARTICLES BACKGROUND
// ============================================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 40;

    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    const size = Math.random() * 4 + 1;
    const opacity = Math.random() * 0.4 + 0.1;

    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: rgba(255, 214, 0, ${opacity});
        border-radius: 50%;
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation: particleFloat ${Math.random() * 15 + 10}s linear infinite;
        animation-delay: ${Math.random() * 5}s;
        pointer-events: none;
    `;
    container.appendChild(particle);
}

// Add particle animation to stylesheet
const particleStyle = document.createElement('style');
particleStyle.textContent = `
    @keyframes particleFloat {
        0% {
            transform: translateY(0) translateX(0) scale(1);
            opacity: 0;
        }
        10% {
            opacity: 1;
        }
        90% {
            opacity: 1;
        }
        100% {
            transform: translateY(-100vh) translateX(${Math.random() * 100 - 50}px) scale(0.5);
            opacity: 0;
        }
    }
`;
document.head.appendChild(particleStyle);

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Add staggered delay for multiple items
                const delay = index * 100;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe reveal elements
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach(el => observer.observe(el));

    // Observe timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    timelineItems.forEach(el => observer.observe(el));

    // Observe result items
    const resultItems = document.querySelectorAll('.result-item');
    resultItems.forEach(el => observer.observe(el));

    // Observe deliverable list items
    const deliverableItems = document.querySelectorAll('.deliverable-list li');
    const deliverableObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, index * 100);
                deliverableObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);
    deliverableItems.forEach(el => deliverableObserver.observe(el));
}

// ============================================
// SMOOTH SCROLL
// ============================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);

            if (target) {
                const targetPosition = target.offsetTop - 20;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ============================================
// ROI CALCULATOR
// ============================================
function initCalculator() {
    const ROI_MULTIPLIER = 66.67; // R$ 900 -> R$ 60.000

    const investmentInput = document.getElementById('investmentInput');
    const investmentSlider = document.getElementById('investmentSlider');
    const dailyValue = document.getElementById('dailyValue');
    const revenueValue = document.getElementById('revenueValue');
    const roiValue = document.getElementById('roiValue');
    const profitValue = document.getElementById('profitValue');

    if (!investmentInput || !investmentSlider) return;

    // Format currency
    function formatCurrency(value) {
        return 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    // Update slider background
    function updateSliderBackground(value) {
        const min = 300;
        const max = 10000;
        const progress = ((value - min) / (max - min)) * 100;
        investmentSlider.style.setProperty('--progress', progress + '%');
    }

    // Calculate and update values
    function updateCalculations(investment) {
        const daily = investment / 30;
        const revenue = investment * ROI_MULTIPLIER;
        const profit = revenue - investment;
        const roi = Math.round(revenue / investment);

        // Animate value changes
        animateValue(dailyValue, 'R$ ' + daily.toFixed(2).replace('.', ','));
        animateValue(revenueValue, formatCurrency(revenue));
        animateValue(roiValue, roi + 'x');
        animateValue(profitValue, formatCurrency(profit));

        updateSliderBackground(investment);
        updateChart(investment);
    }

    // Animate value change
    function animateValue(element, newValue) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease';
        setTimeout(() => {
            element.textContent = newValue;
            element.style.transform = 'scale(1)';
        }, 100);
    }

    // Sync input and slider
    investmentInput.addEventListener('input', function() {
        let value = parseInt(this.value) || 300;
        value = Math.max(300, Math.min(10000, value));
        investmentSlider.value = value;
        updateCalculations(value);
    });

    investmentSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        investmentInput.value = value;
        updateCalculations(value);
    });

    // Initialize chart
    initChart();

    // Initialize calculations
    updateCalculations(900);
}

// ============================================
// CHART.JS SETUP
// ============================================
let roiChart = null;

function initChart() {
    const ctx = document.getElementById('roiChart');
    if (!ctx) return;

    const ROI_MULTIPLIER = 66.67;
    const investments = [300, 500, 900, 1500, 2500, 4000, 6000, 8000, 10000];
    const revenues = investments.map(inv => inv * ROI_MULTIPLIER);

    const initialData = generateChartData(900);

    roiChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: investments.map(v => 'R$ ' + v.toLocaleString('pt-BR')),
            datasets: [{
                label: 'Faturamento Estimado',
                data: revenues,
                backgroundColor: initialData.backgroundColors,
                borderColor: initialData.borderColors,
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: '#0a0a0a',
                    titleFont: {
                        family: 'Inter',
                        size: 12,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '700'
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        title: function(context) {
                            return 'Investimento: ' + context[0].label;
                        },
                        label: function(context) {
                            return 'Faturamento: R$ ' + context.raw.toLocaleString('pt-BR');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 10
                        },
                        color: '#666'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: '#f0f0f0'
                    },
                    ticks: {
                        font: {
                            family: 'Inter',
                            size: 11
                        },
                        color: '#666',
                        callback: function(value) {
                            if (value >= 1000) {
                                return 'R$ ' + (value / 1000) + 'k';
                            }
                            return 'R$ ' + value;
                        }
                    }
                }
            }
        }
    });
}

function generateChartData(highlightValue) {
    const investments = [300, 500, 900, 1500, 2500, 4000, 6000, 8000, 10000];

    // Find closest value in chart
    let closest = investments[0];
    let minDiff = Math.abs(highlightValue - investments[0]);

    investments.forEach(inv => {
        const diff = Math.abs(highlightValue - inv);
        if (diff < minDiff) {
            minDiff = diff;
            closest = inv;
        }
    });

    const backgroundColors = investments.map(inv =>
        inv === closest ? '#FFD600' : 'rgba(255, 214, 0, 0.3)'
    );

    const borderColors = investments.map(inv =>
        inv === closest ? '#e6c200' : 'rgba(255, 214, 0, 0.5)'
    );

    return { investments, backgroundColors, borderColors };
}

function updateChart(highlightValue) {
    if (!roiChart) return;

    const newData = generateChartData(highlightValue);
    roiChart.data.datasets[0].backgroundColor = newData.backgroundColors;
    roiChart.data.datasets[0].borderColor = newData.borderColors;
    roiChart.update('none');
}

// ============================================
// COUNTER ANIMATION FOR RESULTS
// ============================================
function initCounters() {
    const counters = document.querySelectorAll('.result-item h3[data-count]');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const prefix = element.getAttribute('data-prefix') || '';
    const suffix = element.getAttribute('data-suffix') || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
        current += step;
        if (current < target) {
            element.textContent = prefix + Math.floor(current).toLocaleString('pt-BR') + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
        }
    };

    updateCounter();
}

// ============================================
// HOVER EFFECTS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Add hover sound effect placeholder (optional)
    const cards = document.querySelectorAll('.segment-card, .timeline-card, .testimonial-card, .for-who-card');

    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        });
    });
});

// ============================================
// PERFORMANCE: Throttle scroll events
// ============================================
function throttle(func, wait) {
    let waiting = false;
    return function() {
        if (!waiting) {
            func.apply(this, arguments);
            waiting = true;
            setTimeout(() => {
                waiting = false;
            }, wait);
        }
    };
}

// Apply throttle to scroll events
const throttledScroll = throttle(() => {
    // Any scroll-dependent animations can be added here
}, 100);

window.addEventListener('scroll', throttledScroll, { passive: true });

// ============================================
// PRELOADER (Optional)
// ============================================
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger hero animations after load
    const heroElements = document.querySelectorAll('.hero-tag, .hero h1, .hero-subtitle, .hero-proof, .hero-cta');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.1}s`;
    });
});

// ============================================
// LAZY LOADING IMAGES
// ============================================
if ('IntersectionObserver' in window) {
    const lazyImages = document.querySelectorAll('img[data-src]');

    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                imageObserver.unobserve(img);
            }
        });
    });

    lazyImages.forEach(img => imageObserver.observe(img));
}

// ============================================
// MOBILE MENU (if needed)
// ============================================
function initMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

// ============================================
// FORM VALIDATION (for future use)
// ============================================
function validateForm(formElement) {
    const inputs = formElement.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    });

    return isValid;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Console welcome message
console.log('%c Vortexx - Captacao Solar Agressiva ', 'background: #FFD600; color: #0a0a0a; padding: 10px 20px; font-size: 16px; font-weight: bold;');
console.log('%c Domine o trafego pago para energia solar! ', 'color: #666; font-size: 12px;');
