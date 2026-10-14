/**
 * TrendyShop - Header Component
 */
(function (global) {
    'use strict';

    /**
     * Calculates base relative path depending on whether the current page is in a subfolder.
     */
    function getBasePath() {
        const pathname = window.location.pathname.replace(/\\/g, '/');
        const subfolders = ['catalogo', 'quienes-somos', 'contactanos', 'carrito'];
        for (let i = 0; i < subfolders.length; i++) {
            if (pathname.includes('/' + subfolders[i] + '/')) {
                return '../';
            }
        }
        return '';
    }

    /**
     * Identifies the current active page for navigation highlight.
     */
    function getCurrentPage() {
        const pathname = window.location.pathname.replace(/\\/g, '/');
        if (pathname.includes('/catalogo/')) return 'catalogo';
        if (pathname.includes('/quienes-somos/')) return 'quienes-somos';
        if (pathname.includes('/contactanos/')) return 'contactanos';
        if (pathname.includes('/carrito/')) return 'carrito';
        return 'inicio';
    }

    /**
     * Updates cart count badge from localStorage or provided count.
     */
    function updateCartBadge(count) {
        const badge = document.getElementById('header-cart-count');
        if (!badge) return;

        if (count !== undefined) {
            badge.textContent = count;
            return;
        }

        try {
            const storedCart = localStorage.getItem('trendy_cart') || localStorage.getItem('cart');
            if (storedCart) {
                const parsed = JSON.parse(storedCart);
                const totalItems = Array.isArray(parsed)
                    ? parsed.reduce((sum, item) => sum + (item.quantity || 1), 0)
                    : 0;
                badge.textContent = totalItems;
            } else {
                badge.textContent = '0';
            }
        } catch (e) {
            badge.textContent = '0';
        }
    }

    /**
     * Adjusts paths in header according to current directory depth and sets active link.
     */
    function postProcessHeader(container) {
        const basePath = getBasePath();
        const currentPage = getCurrentPage();

        // 1. Fix image source
        const logoImg = container.querySelector('#header-logo-img');
        if (logoImg) {
            logoImg.src = `${basePath}assets/images/logo-icon.png`;
        }

        // 2. Fix links
        const logoLink = container.querySelector('#header-logo-link');
        if (logoLink) {
            logoLink.href = `${basePath}index.html`;
        }

        const cartLink = container.querySelector('#header-cart-btn');
        if (cartLink) {
            cartLink.href = `${basePath}carrito/index.html`;
        }

        const navLinks = container.querySelectorAll('.header-link');
        navLinks.forEach(link => {
            const page = link.getAttribute('data-page');
            if (page === 'inicio') {
                link.href = `${basePath}index.html`;
            } else {
                link.href = `${basePath}${page}/index.html`;
            }

            if (page === currentPage) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });

        // 3. Search form handler
        const searchForm = container.querySelector('#header-search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const input = container.querySelector('#header-search-input');
                const query = input ? input.value.trim() : '';
                if (query) {
                    window.location.href = `${basePath}catalogo/index.html?search=${encodeURIComponent(query)}`;
                }
            });
        }

        // 4. Update cart badge count
        updateCartBadge();
    }

    /**
     * Loads and renders the header component from components/header.html into the target container.
     */
    async function loadHeader(targetSelector = '#encabezado del sitio') {
        let container = null;
        if (targetSelector.startsWith('#')) {
            const id = targetSelector.slice(1);
            container = document.getElementById(id);
        } else {
            container = document.querySelector(targetSelector);
        }

        if (!container) {
            container = document.querySelector('.cabecera') || document.querySelector('header');
        }

        if (!container) {
            console.warn('[HeaderComponent] Target container not found:', targetSelector);
            return;
        }

        const basePath = getBasePath();

        try {
            const response = await fetch(`${basePath}components/header.html`);
            if (!response.ok) {
                throw new Error(`Failed to load header component: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            postProcessHeader(container);
        } catch (err) {
            console.error('[HeaderComponent] Error fetching components/header.html:', err);
        }
    }

    // Auto-initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => loadHeader());
        } else {
            loadHeader();
        }

        window.addEventListener('trendy:cart-updated', (e) => {
            updateCartBadge(e.detail ? e.detail.count : undefined);
        });
    }

    // Expose component to global window
    global.HeaderComponent = {
        loadHeader,
        updateCartBadge,
        getBasePath,
        getCurrentPage
    };

})(typeof window !== 'undefined' ? window : this);