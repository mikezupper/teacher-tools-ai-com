// components/toast-component.js
import { LitElement, html } from 'lit';

class ToastComponent extends LitElement {
    static properties = {
        message: { type: String },
        type: { type: String }, // 'success', 'error', 'warning', 'info', 'loading'
        duration: { type: Number },
        visible: { type: Boolean, state: true },
        position: { type: String } // 'top-right', 'top-left', 'bottom-right', 'bottom-left', 'top-center', 'bottom-center'
    };

    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    constructor() {
        super();
        this.message = '';
        this.type = 'info';
        this.duration = 5000; // 5 seconds default
        this.visible = false;
        this.position = 'top-right';
        this.timeoutId = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    show(message, type = 'info', duration = 5000) {
        this.message = message;
        this.type = type;
        this.duration = duration;
        this.visible = true;

        // Clear any existing timeout
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }

        // Auto-hide after duration (unless it's a loading toast)
        if (type !== 'loading' && duration > 0) {
            this.timeoutId = setTimeout(() => {
                this.hide();
            }, duration);
        }

        this.requestUpdate();
    }

    hide() {
        this.visible = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.requestUpdate();
    }

    handleClose() {
        this.hide();
    }

    getIcon() {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ',
            loading: '⟳'
        };
        return icons[this.type] || icons.info;
    }

    render() {
        if (!this.visible || !this.message) {
            return html``;
        }

        return html`
            <div class="toast-container toast-${this.position}">
                <div class="toast toast-${this.type} ${this.visible ? 'toast-visible' : ''}" role="alert" aria-live="polite">
                    <div class="toast-content">
                        <span class="toast-icon ${this.type === 'loading' ? 'toast-icon-spinning' : ''}">${this.getIcon()}</span>
                        <span class="toast-message">${this.message}</span>
                    </div>
                    ${this.type !== 'loading' ? html`
                        <button 
                            class="toast-close" 
                            @click=${this.handleClose}
                            aria-label="Close notification"
                            title="Close"
                        >
                            ×
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
}

// Toast Manager - Global singleton for managing toasts
class ToastManager {
    constructor() {
        this.toastContainer = null;
        this.toasts = new Map();
        this.nextId = 1;
        this.ensureContainer();
    }

    ensureContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.className = 'toast-manager-container';
            document.body.appendChild(this.toastContainer);
        }
    }

    show(message, type = 'info', duration = 5000, position = 'top-right') {
        this.ensureContainer();

        const id = this.nextId++;
        const toast = document.createElement('toast-component');
        toast.setAttribute('data-toast-id', id);

        this.toastContainer.appendChild(toast);
        this.toasts.set(id, toast);

        // Show the toast
        toast.show(message, type, duration);

        // Auto-remove from DOM after animation
        setTimeout(() => {
            this.remove(id);
        }, duration + 1000); // Extra time for exit animation

        return id;
    }

    hide(id) {
        const toast = this.toasts.get(id);
        if (toast) {
            toast.hide();
            setTimeout(() => {
                this.remove(id);
            }, 500); // Wait for exit animation
        }
    }

    remove(id) {
        const toast = this.toasts.get(id);
        if (toast && toast.parentNode) {
            toast.parentNode.removeChild(toast);
            this.toasts.delete(id);
        }
    }

    // Convenience methods
    success(message, duration = 4000) {
        return this.show(message, 'success', duration);
    }

    error(message, duration = 6000) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration = 5000) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration = 4000) {
        return this.show(message, 'info', duration);
    }

    loading(message) {
        return this.show(message, 'loading', 0); // 0 duration = manual hide
    }

    // Clear all toasts
    clear() {
        this.toasts.forEach((toast, id) => {
            this.remove(id);
        });
    }
}

// Global instance
window.toastManager = window.toastManager || new ToastManager();

customElements.define('toast-component', ToastComponent);

// Export for use in modules
export { ToastComponent, ToastManager };
export const toast = window.toastManager;
