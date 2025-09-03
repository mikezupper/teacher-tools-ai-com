// components/step4-prompts.js
import { LitElement, html, css } from 'lit';
import { generatePrompts } from '../api/generatePrompts.js';
import {
    savePrompts,
    getStoryById,
    getPromptsByStoryId, getStoryById$
} from '../db/StoryAppDB.js';
import { createAbortableOperation } from '../utils/abortable.js';

class Step4Prompts extends LitElement {
    static properties = {
        storyId: { type: Number, attribute: 'story-id' },
        story: { type: Object, state: true },
        prompts: { type: Array, state: true },
        selectedCount: { type: Number, state: true },
        showInput: { type: Boolean, state: true },
        showPreview: { type: Boolean, state: true },
        statusMessage: { type: String, state: true },
        statusType: { type: String, state: true },
        isGenerating: { type: Boolean, state: true },
        isInitialized: { type: Boolean, state: true }
    };

    constructor() {
        super();
        this.story = null;
        this.prompts = [];
        this.selectedCount = 0;
        this.showInput = false;
        this.showPreview = false;
        this.statusMessage = '';
        this.statusType = 'info';
        this.isGenerating = false;
        this.isInitialized = false;
        this.operation = null;
    }
    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    async updated(changed) {
        super.updated(changed);
        if (changed.has('storyId') && this.storyId) {
            this._storySub = getStoryById$(this.storyId)
                .subscribe({
                    next: async story => {
                        this.story = story;
                        const existing = await getPromptsByStoryId(story.id);
                        if (existing.length > 0) {
                            this.prompts = existing.map(p => p.promptText);
                            this.selectedCount = existing.length;
                            this.showExistingPrompts();
                        } else {
                            this.showPromptOptions();
                        }
                        this.isInitialized = true;

                        this.requestUpdate();
                    },
                    error: err => console.error('liveQuery error:', err),
                });
        }
    }
    showPromptOptions() {
        this.showInput = true;
        this.showPreview = false;
        this.showStatus('Configure your thinking prompts.', 'info');
    }
    showExistingPrompts() {
        this.showInput = true;
        this.showPreview = true;
        this.showStatus('Prompts already generated. You can regenerate or continue.', 'success');
    }
    showErrorState(msg) {
        this.showStatus(msg, 'error');
        setTimeout(() => this.redirectToStep0(), 3000);
    }

    redirectToStep0() {
        this.dispatchEvent(new CustomEvent('go-to-step', {
            detail: { stepIndex: 0 }, bubbles: true, composed: true
        }));
        gtag('event', 'go-to-step', {
            'event_category': 'Engagement',
            'event_label': 'Redirect to Step',
            'value': 0
        });
    }

    handleCountChange(e) {
        this.selectedCount = parseInt(e.target.value, 10);
    }

    async handleGenerate() {
        if (this.isGenerating) {
            this.operation?.cancel();
            this.isGenerating = false;
            return;
        }
        if (!this.validateStoryData()) return;
        if (this.selectedCount === 0) {
            await this.handleSkip();
            return;
        }
        await this.performGeneration();
    }
    async handleRegenerate() {
        if (this.isGenerating) {
            this.operation?.cancel();
            this.isGenerating = false;
            return;
        }
        if (!this.validateStoryData()) return;
        await this.performGeneration();
    }

    async performGeneration() {
        this.operation = createAbortableOperation();
        this.isGenerating = true;
        this.showStatus('Generating prompts…', 'loading');
        try {
            const prompts = await this.operation.execute(
                generatePrompts,
                this.story,
                this.selectedCount
            );
            this.prompts = prompts;
            await savePrompts(this.storyId, prompts);
            this.showPreview = true;
            this.showStatus('Prompts generated successfully!', 'success');
        } catch (err) {
            if (err.name === 'AbortError') {
                this.showStatus('Generation cancelled.', 'info');
            } else {
                console.error(err);
                this.showStatus('Error generating prompts. Try again.', 'error');
            }
        } finally {
            this.isGenerating = false;
            this.operation = null;
        }
    }

    async handleSkip() {
        if (!this.validateStoryData()) return;
        try {
            this.showStatus('Skipping prompts…', 'loading');
            await savePrompts(this.story.id, []);
            this.showStatus('Prompts skipped. Moving to final step…', 'info');
            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 4 }, bubbles: true, composed: true
            }))
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Skip to Step',
                'value': 4
            });
        } catch (err) {
            console.error(err);
            this.showStatus('Error skipping prompts. Please try again.', 'error');
        }
    }

    async handleContinue() {
        if (!this.validateStoryData()) return;
        try {
            this.showStatus('Saving prompts…', 'loading');
            await savePrompts(this.story.id, this.prompts);
            this.showStatus('Prompts saved. Moving to final step…', 'success');
            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 4 }, bubbles: true, composed: true
            }))
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Continue to Step',
                'value': 4
            });
        } catch (err) {
            console.error(err);
            this.showStatus('Error saving prompts. Please try again.', 'error');
        }
    }

    validateStoryData() {
        if (!this.story?.id || !this.story.content || !this.story.title) {
            this.showErrorState('Story content is required before generating prompts.');
            return false;
        }
        return true;
    }

    showStatus(message, type = 'info') {
        this.statusMessage = message;
        this.statusType = type;
    }

    render() {
        // loading
        if (!this.isInitialized && this.storyId) {
            return html`
                <div class="step4-prompts-root">
                <h2
                        class="step4-prompts-header"
                        title="Step 4: Thinking Prompts"
                        aria-label="Step 4: Thinking Prompts"
                >
                    Step 4: Thinking Prompts
                </h2>
                <div class="step4-prompts-status loading">
                    Loading story data…
                </div>
                </div>
            `;
        }
        // no story
        if (!this.story) {
            return html`
                <div class="step4-prompts-root">
                <h2
                        class="step4-prompts-header"
                        title="Step 4: Thinking Prompts"
                >
                    Step 4: Thinking Prompts
                </h2>
                <div
                        class="step4-prompts-error-section"
                        title="Story content is required before generating prompts"
                >
                    <p>Story content is required before generating prompts.</p>
                </div>
                </div>
            `;
        }
        // main
        return html`
            <div class="step4-prompts-root">
            <h2
                    class="step4-prompts-header"
                    title="Step 4: Thinking Prompts"
                    aria-label="Step 4: Thinking Prompts"
            >
                Step 4: Thinking Prompts
            </h2>

            ${this.renderStatus()}
            ${this.renderInputSection()}
            ${this.showPreview ? this.renderPreviewSection() : ''}
            </div>
        `;
    }

    renderInputSection() {
        if (!this.showInput) return '';
        return html`
            <div
                    class="step4-prompts-input-section"
                    title="Configure how many prompts to generate"
                    aria-label="Prompt options"
            >
                <p title="Choose number of prompts">
                    How many thinking prompts would you like to generate?
                </p>

                <select
                        class="step4-prompts-count-select"
                        .value=${this.selectedCount}
                        @change=${this.handleCountChange}
                        title="Select number of prompts"
                >
                    <option value="0">No prompts</option>
                    <option value="1">1 Prompt</option>
                    <option value="2">2 Prompts</option>
                    <option value="3">3 Prompts</option>
                </select>

                <div class="step4-prompts-actions" aria-label="Actions">
                    <button
                            class="step4-prompts-btn-generate"
                            @click=${this.handleGenerate}
                            ?disabled=${this.isGenerating}
                            title="Generate thinking prompts"
                    >
                        ${this.isGenerating ? 'Generating…' : 'Generate Prompts'}
                    </button>
                    ${this.isGenerating ? html`
                        <button
                                class="step4-prompts-btn-cancel"
                                @click=${this.handleGenerate}
                                title="Cancel prompts generation"
                        >
                            Cancel
                        </button>
                    ` : ''}
                    <button
                            class="step4-prompts-btn-skip"
                            @click=${this.handleSkip}
                            ?disabled=${this.isGenerating}
                            title="Skip thinking prompts"
                    >
                        Skip Prompts
                    </button>
                </div>
            </div>
        `;
    }

    renderPreviewSection() {
        if (this.prompts.length === 0) {
            return html`
                <div class="step4-prompts-preview-section" title="No prompts generated">
                    <div class="step4-prompts-no-message">
                        No thinking prompts were generated.
                    </div>
                </div>
            `;
        }
        return html`
            <div
                    class="step4-prompts-preview-section"
                    title="Generated thinking prompts"
                    aria-label="Prompts preview"
            >
                <ul class="step4-prompts-list">
                    ${this.prompts.map((p, i) => html`
                        <li class="step4-prompts-item" title="${p}">
                            <div class="step4-prompts-number">Prompt ${i+1}</div>
                            <div class="step4-prompts-text">${p}</div>
                        </li>
                    `)}
                </ul>
                <div class="step4-prompts-actions--preview" aria-label="Preview actions">
                    <button
                            class="step4-prompts-btn-regenerate"
                            @click=${this.handleRegenerate}
                            ?disabled=${this.isGenerating}
                            title="Regenerate prompts"
                    >
                        ${this.isGenerating ? 'Generating…' : 'Regenerate Prompts'}
                    </button>
                    <button
                            class="step4-prompts-btn-continue"
                            @click=${this.handleContinue}
                            ?disabled=${this.isGenerating}
                            title="Continue with these prompts"
                    >
                        Continue with These Prompts
                    </button>
                </div>
            </div>
        `;
    }

    renderStatus() {
        if (!this.statusMessage) return '';
        return html`
            <div
                    class="step4-prompts-status ${this.statusType}"
                    title="${this.statusMessage}"
                    aria-live="polite"
            >
                ${this.statusMessage}
            </div>
        `;
    }
}

customElements.define('step4-prompts', Step4Prompts);
