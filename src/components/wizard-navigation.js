// components/wizard-navigation.js
import { LitElement, html, css } from 'lit';

class WizardNavigation extends LitElement {
    static properties = {
        currentStep: { type: Number },
        totalSteps:  { type: Number }
    };
    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    constructor() {
        super();
        this.currentStep = 0;
        this.totalSteps  = 5;
    }
 /**
       * Called by parent wizard to update which buttons should be shown/enabled.
       */
 updateStep(current, total) {
           this.currentStep = current;
           this.totalSteps  = total;
         }
    render() {
        return html`
      <div
        class="wizard-navigation-root"
        aria-label="Wizard navigation Steps"
        title="Show the number of the current step and the total number of steps"
      >

        <div
          class="wizard-navigation-step-indicator"
          title="Step ${this.currentStep + 1} of ${this.totalSteps}"
        >
          Step ${this.currentStep + 1} of ${this.totalSteps}
        </div>

      </div>
    `;
    }
}

customElements.define('wizard-navigation', WizardNavigation);
