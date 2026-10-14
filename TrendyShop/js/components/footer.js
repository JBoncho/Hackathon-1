/**
 * TrendyShop - Footer Component
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
     * Adjusts paths in footer according to current directory depth.
     */
    function postProcessFooter(container) {
        const basePath = getBasePath();

        // 1. Fix logo image source
        const logoImg = container.querySelector('#footer-logo-img');
        if (logoImg) {
            logoImg.src = `${basePath}assets/images/logo-icon.png`;
        }

        // 2. Fix links
        const logoLink = container.querySelector('#footer-logo-link');
        if (logoLink) {
            logoLink.href = `${basePath}index.html`;
        }

        const contactLink = container.querySelector('#footer-contact-link');
        if (contactLink) {
            contactLink.href = `${basePath}contactanos/index.html`;
        }

        const aboutLink = container.querySelector('#footer-about-link');
        if (aboutLink) {
            aboutLink.href = `${basePath}quienes-somos/index.html`;
        }
    }

    /**
     * Loads and renders the footer component from components/footer.html into the target container.
     */
    async function loadFooter(targetSelector = '#pie del sitio') {
        let container = null;
        if (targetSelector.startsWith('#')) {
            const id = targetSelector.slice(1);
            container = document.getElementById(id);
        } else {
            container = document.querySelector(targetSelector);
        }

        if (!container) {
            container = document.querySelector('.pie') || document.querySelector('footer');
        }

        if (!container) {
            console.warn('[FooterComponent] Target container not found:', targetSelector);
            return;
        }

        const basePath = getBasePath();

        try {
            const response = await fetch(`${basePath}components/footer.html`);
            if (!response.ok) {
                throw new Error(`Failed to load footer component: ${response.status} ${response.statusText}`);
            }
            const html = await response.text();
            container.innerHTML = html;
            postProcessFooter(container);
        } catch (err) {
            console.error('[FooterComponent] Error fetching components/footer.html:', err);
        }
    }

    // Auto-initialize when DOM is ready
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => loadFooter());
        } else {
            loadFooter();
        }
    }

    // Expose component to global window
    global.FooterComponent = {
        loadFooter,
        getBasePath
    };

})(typeof window !== 'undefined' ? window : this);
