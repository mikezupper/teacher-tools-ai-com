// components/header-component.js
import { LitElement, html, css } from 'lit';

class HeaderComponent extends LitElement {
    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    static properties = {
        currentPage:    { type: String, state: true },
        isLanding:      { type: Boolean, state: true },
        isDashboard:    { type: Boolean, state: true },
        isWizard:       { type: Boolean, state: true },
        mobileMenuOpen: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.mobileMenuOpen = false;
        this._determinePage();
    }

    _determinePage() {
        const p = window.location.pathname;
        this.isLanding   = p === '/' || p.endsWith('/index.html');
        this.isDashboard = p.includes('dashboard');
        this.isWizard    = p.includes('wizard');
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    render() {
        return this.isLanding
            ? this._renderLandingNav()
            : this._renderAppNav();
    }

    _renderLandingNav() {
        return html`
            <nav
                    class="header-root-main-nav"
                    aria-label="Landing page navigation"
                    title="Navigate features and get started"
            >
                <div class="header-root-nav-container">
                    <div class="header-root-nav-brand" title="Teachers Story Tool home">
                        <h1 class="header-root-brand-logo">📚 Teachers Story Tool</h1>
                    </div>
                    <div class="header-root-nav-links ${this.mobileMenuOpen ? 'active' : ''}">
                        <a href="#features" class="header-root-nav-link" title="Learn about features">Features</a>
                        <a href="#how-it-works" class="header-root-nav-link" title="See how it works">How It Works</a>
                        <a href="#benefits" class="header-root-nav-link" title="Discover benefits">Benefits</a>
                        <a href="/dashboard.html"
                           class="header-root-nav-cta"
                           title="Get started free—go to Dashboard"
                        >Get Started Free</a>
                    </div>
                    <button
                            class="header-root-mobile-toggle"
                            aria-label="Toggle mobile menu"
                            title="Open or close menu"
                            @click=${this.toggleMobileMenu}
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
        `;
    }

    _renderAppNav() {
        return html`
            <nav
                    class="header-root-app-nav"
                    aria-label="App navigation"
                    title="Navigate home or dashboard"
            >
                <div class="header-root-nav-container">
                    <div class="header-root-nav-brand" title="Go to home page">
                        <a href="/public" class="header-root-brand-logo" title="Teachers Story Tool home">
                            📚 Teachers Story Tool
                        </a>
                    </div>
                    <div class="header-root-nav-links ${this.mobileMenuOpen ? 'active' : ''}">
                        <a href="/index.html"
                           class="header-root-nav-button ${this.isDashboard ? '' : ''}"
                           title="Go to home"
                        >
                            <span class="header-root-nav-icon">🏠</span>
                            <span>Home</span>
                        </a>
                        <a href="/dashboard.html"
                           class="header-root-nav-button ${this.isDashboard ? 'active' : ''}"
                           title="Go to your dashboard"
                        >
                            <span class="header-root-nav-icon">📋</span>
                            <span>Dashboard</span>
                        </a>
                    </div>
                    <button
                            class="header-root-mobile-toggle"
                            aria-label="Toggle mobile menu"
                            title="Open or close menu"
                            @click=${this.toggleMobileMenu}
                    >
                        <span></span><span></span><span></span>
                    </button>
                </div>
            </nav>
        `;
    }
}

customElements.define('header-component', HeaderComponent);
