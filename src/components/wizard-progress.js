// components/wizard-progress.js
import { LitElement, html, css } from 'lit';

class WizardProgress extends LitElement {
    static properties = {
        currentStep: { type: Number },
        totalSteps:  { type: Number },
        isCompleted: { type: Boolean }
    };
    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    constructor() {
        super();
        this.currentStep = 0;
        this.totalSteps  = 5;
        this.isCompleted = false;
        this.steps       = [
            { name: 'Story Details',     description: 'Create your story'     },
            { name: 'Add Images',        description: 'Generate visuals'       },
            { name: 'Add Questions',     description: 'Comprehension questions'},
            { name: 'Thinking Prompts',  description: 'Reflection prompts'    },
            { name: 'Preview',           description: 'Final review'          }
        ];
    }

    /**
     * Called by parent wizard to update which step is current
     * and whether we've completed the entire flow.
     */
    setStepStatus(step, completed) {
        this.currentStep = step;
        this.isCompleted = completed;
    }

    getCompletionPercentage() {
        return this.isCompleted
            ? 100
            : Math.round((this.currentStep / this.totalSteps) * 100);
    }

    getStepCardClass(idx) {
        const base = 'wizard-progress-step-card';
        const clickable = idx <= this.currentStep ? `${base}--clickable` : '';

        let statusClass = '';
        if (this.isCompleted || idx < this.currentStep) {
            statusClass = `${base}--completed`;
        } else if (idx === this.currentStep) {
            statusClass = `${base}--current`;
        } else {
            statusClass = `${base}--upcoming`;
        }

        return `${base} ${clickable} ${statusClass}`.trim();
    }

    handleStepClick(stepIndex) {
        // Only allow clicking on current step or completed steps
        // if (stepIndex <= this.currentStep) {
            this.dispatchEvent(new CustomEvent('step-click', {
                detail: { stepIndex },
                bubbles: true,
                composed: true
            }));
        // }
    }

    render() {
        const completion = this.getCompletionPercentage();
        return html`
      <div
        class="wizard-progress-root"
        aria-label="Story creation progress"
        title="Your overall progress through the wizard"
      >
        <div class="wizard-progress-header">
          <h1 class="wizard-progress-title">Story Creation Wizard</h1>
          <p class="wizard-progress-subtitle">Complete each step to generate your custom story</p>
        </div>
        <div class="wizard-progress-bar" title="Overall completion: ${completion}%">
          <div class="wizard-progress-fill" style="width: ${completion}%"></div>
        </div>
        <div class="wizard-progress-info">
          <span class="wizard-progress-step-text">Step ${this.currentStep + 1} of ${this.totalSteps}</span>
          <span class="wizard-progress-completion-text">${completion}% Complete${this.isCompleted ? ' ✓' : ''}</span>
        </div>
        <div class="wizard-progress-cards">
          ${this.steps.map((step, i) => html`
            <div 
              class="${this.getStepCardClass(i)}" 
              title="${step.description}"
              @click=${() => this.handleStepClick(i)}
            >
              <div class="wizard-progress-step-number">${i + 1}</div>
              <div class="wizard-progress-step-content">
                <div class="wizard-progress-step-name">${step.name}</div>
                <div class="wizard-progress-step-description">${step.description}</div>
              </div>
              ${this.isCompleted || i < this.currentStep ? html`
                <div class="wizard-progress-step-check">✓</div>
              ` : ''}
            </div>
          `)}
        </div>
      </div>
    `;
    }
}

customElements.define('wizard-progress', WizardProgress);
