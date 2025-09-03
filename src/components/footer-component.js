// components/footer-component.js
import { LitElement, html, css } from 'lit';

class FooterComponent extends LitElement {
    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    render() {
        const isLanding = window.location.pathname === '/' || window.location.pathname.endsWith('/index.html');
        if (!isLanding) return html``;

        return html`
            <footer class="footer-root-main-footer"
                    aria-label="Site footer"
                    title="About Teachers Story Tool and useful links"
            >
                <div class="footer-root-container">
                    <div class="footer-root-content">
                        <div class="footer-root-brand">
                            <h3 class="footer-root-logo">📚 Teachers Story Tool</h3>
                            <p class="footer-root-tagline">
                                Empowering educators with AI-powered story creation
                            </p>
                        </div>
                        <div class="footer-root-links">
                            <div class="footer-root-section">
                                <h4 class="footer-root-heading">Product</h4>
                                <ul class="footer-root-list">
                                    <li><a href="#features" class="footer-root-link">Features</a></li>
                                    <li><a href="#how-it-works" class="footer-root-link">How It Works</a></li>
                                    <li><a href="/dashboard.html" class="footer-root-link">Dashboard</a></li>
                                </ul>
                            </div>
                            <div class="footer-root-section">
                                <h4 class="footer-root-heading">Support</h4>
                                <ul class="footer-root-list">
                                    <li><a href="#" class="footer-root-link">Help Center</a></li>
                                    <li><a href="#" class="footer-root-link">Contact Us</a></li>
                                    <li><a href="#" class="footer-root-link">Tutorials</a></li>
                                </ul>
                            </div>
                            <div class="footer-root-section">
                                <h4 class="footer-root-heading">Legal</h4>
                                <ul class="footer-root-list">
                                    <li><a href="#" class="footer-root-link">Privacy Policy</a></li>
                                    <li><a href="#" class="footer-root-link">Terms of Service</a></li>
                                    <li><a href="#" class="footer-root-link">Cookie Policy</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="footer-root-bottom">
                        <p class="footer-root-copyright">
                            © 2024 Teachers Story Tool. All rights reserved. Made with ❤️ for educators everywhere.
                        </p>
                    </div>
                </div>
            </footer>
        `;
    }
}

customElements.define('footer-component', FooterComponent);
