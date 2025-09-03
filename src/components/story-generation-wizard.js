// components/story-generation-wizard.js
import { LitElement, html, css } from 'lit';
import { getStoryById, getCurrentStep, isStoryCompleted, saveMetadata } from '../db/StoryAppDB.js';

class StoryGenerationWizard extends LitElement {
    static properties = {
        storyId:     { type: Number, attribute: 'story-id' },
        currentStep: { type: Number, attribute: 'current-step' },
        totalSteps:  { type: Number },
        isAnimating: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.storyId = null;
        this.currentStep = 0;
        this.totalSteps = 5;
        this.isAnimating = false;
    }

    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    async connectedCallback() {
        super.connectedCallback();
        await this.initializeFromUrl();
        this.setupEventListeners();
        // Force initial step display after everything is set up
        await this.updateComplete;
        await this.updateStepDisplay();
    }

    async firstUpdated() {
        await super.firstUpdated();
        // Ensure initial step display is correct
        await this.updateStepDisplay();
    }

    async initializeFromUrl() {
        const params = new URLSearchParams(window.location.search);
        const storyIdParam = params.get('storyId');
        const stepParam = params.get('step');

        try {
            if (storyIdParam) {
                const storyId = parseInt(storyIdParam, 10);
                const story = await getStoryById(storyId);

                if (!story) {
                    this.showError(`Story with ID ${storyId} not found.`);
                    return;
                }

                this.storyId = storyId;

                // Set story-id attribute on all step components
                this.setStoryIdOnSteps(storyId);

                // Determine step
                if (stepParam !== null && !isNaN(parseInt(stepParam, 10))) {
                    const requestedStep = Math.min(Math.max(parseInt(stepParam, 10), 0), this.totalSteps - 1);
                    const validStep = await this.validateStepAccess(requestedStep, story);
                    this.currentStep = validStep;

                    if (validStep !== requestedStep) {
                        console.warn(`Requested step ${requestedStep} not accessible, redirected to step ${validStep}`);
                        this.updateUrl();
                    }
                } else {
                    const savedStep = await getCurrentStep(storyId) || 0;
                    this.currentStep = Math.min(Math.max(savedStep, 0), this.totalSteps - 1);
                }
            } else {
                this.currentStep = 0;
                this.storyId = null;
            }
        } catch (error) {
            console.error('Error handling URL state:', error);
            this.showError('An error occurred while loading the story.');
        }

        await this.updateComplete;
        this.updateStepDisplay();
    }

    setStoryIdOnSteps(storyId) {
        const steps = this.querySelectorAll('[data-step]');
        steps.forEach(step => {
            step.setAttribute('story-id', storyId.toString());
        });
    }

    async validateStepAccess(requestedStep, story) {
        if (requestedStep === 0) return 0;
        if (!story || !story.content || !story.title) return 0;
        return requestedStep;
    }

    setupEventListeners() {
        // Listen for navigation events from steps
        this.addEventListener('go-to-step', this.handleStepNavigation.bind(this));
        this.addEventListener('story-created', this.handleStoryCreated.bind(this));
        this.addEventListener('wizard-finished', this.handleWizardFinished.bind(this));

        // Listen for navigation from wizard-navigation component
        this.addEventListener('navigate', this.handleNavigation.bind(this));
        this.addEventListener('step-click', (e) => {
            const { stepIndex } = e.detail;
            this.goToStep(stepIndex);
        });
    }

    handleStepNavigation(e) {
        const { stepIndex } = e.detail;
        this.goToStep(stepIndex);
    }

    handleStoryCreated(e) {
        const { storyId } = e.detail;
        this.storyId = storyId;
        this.setStoryIdOnSteps(storyId);
        this.updateUrl();
        this.saveCurrentStep();
    }

    handleWizardFinished() {
        window.location.href = '/dashboard.html';
    }

    handleNavigation(e) {
        const { direction, saveData } = e.detail;

        if (direction === -1) {
            this.goToPreviousStep();
        } else if (direction === 1) {
            this.goToNextStep();
        }
    }

    async goToStep(stepIndex) {
        if (this.isAnimating || stepIndex < 0 || stepIndex >= this.totalSteps || stepIndex === this.currentStep) {
            return;
        }

        this.currentStep = stepIndex;
        await this.updateStepDisplay();
    }

    async goToNextStep() {
        if (this.isAnimating || this.currentStep >= this.totalSteps - 1) return;
        this.currentStep++;
        await this.updateStepDisplay();
    }

    async goToPreviousStep() {
        if (this.isAnimating || this.currentStep <= 0) return;
        this.currentStep--;
        await this.updateStepDisplay();
    }

    async updateStepDisplay() {
        this.isAnimating = true;

        // Hide all steps first
        const steps = this.querySelectorAll('[data-step]');
        let activeStep = null;

        steps.forEach((step, index) => {
            if (index === this.currentStep) {
                step.style.display = 'flex';
                step.classList.add('active');
                activeStep = step;
            } else {
                step.style.display = 'none';
                step.classList.remove('active');
            }
        });

        // Update other components
        const progressComponent = this.querySelector('[slot="progress"]');
        if (progressComponent && this.storyId) {
            const isCompleted = await isStoryCompleted(this.storyId);
            if (progressComponent.setStepStatus) {
                progressComponent.setStepStatus(this.currentStep, isCompleted);
            }
        }

        const navigationComponent = this.querySelector('[slot="navigation"]');
        if (navigationComponent && navigationComponent.updateStep) {
            navigationComponent.updateStep(this.currentStep, this.totalSteps);
        }

        // Update URL and save step
        this.updateUrl();
        await this.saveCurrentStep();

        // Refresh data for new step
        if (activeStep?.refreshData) {
            await activeStep.refreshData();
        }

        // Scroll active step into view after a short delay to ensure rendering is complete
        setTimeout(() => {
            if (activeStep) {
                activeStep.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);

        // Reset animation flag
        setTimeout(() => {
            this.isAnimating = false;
        }, 300);
    }

    updateUrl() {
        const params = new URLSearchParams();

        if (this.storyId) {
            params.set('storyId', this.storyId.toString());
        }

        if (this.currentStep > 0 || this.storyId) {
            params.set('step', this.currentStep.toString());
        }

        const newUrl = params.toString() ?
            `${window.location.pathname}?${params.toString()}` :
            window.location.pathname;

        window.history.replaceState({}, '', newUrl);
    }

    async saveCurrentStep() {
        if (this.storyId) {
            try {
                await saveMetadata(`currentStep:${this.storyId}`, this.currentStep);
            } catch (error) {
                console.error('Error saving current step:', error);
            }
        }
    }

    showError(message) {
        const errorOverlay = document.createElement('div');
        errorOverlay.className = 'error-overlay';
        errorOverlay.innerHTML = `
      <div class="error-content">
        <h2>⚠️ Error</h2>
        <p>${message}</p>
        <button class="btn-return-dashboard">Return to Dashboard</button>
      </div>
    `;

        errorOverlay.querySelector('.btn-return-dashboard').addEventListener('click', () => {
            window.location.href = '/dashboard.html';
        });

        document.body.appendChild(errorOverlay);
    }

    handleScrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    render() {
        return html`
            <!-- Progress Section -->
            <slot name="progress"></slot>

            <!-- Steps - will be hidden/shown via updateStepDisplay -->
            <slot name="step"></slot>

            <!-- Navigation Section -->
            <slot name="navigation"></slot>

            <!-- Toast Section -->
            <slot name="toast"></slot>

            <!-- Scroll to top button -->
            <button
                    id="scroll-to-top"
                    class="scroll-to-top-btn"
                    @click="${this.handleScrollToTop}"
                    title="Scroll back to the top of the page"
                    aria-label="Scroll to top"
            >
                ↑
            </button>
        `;
    }
}

customElements.define('story-generation-wizard', StoryGenerationWizard);
