// components/step3-questions.js
import { LitElement, html, css } from 'lit';
import { toast } from './toast-component.js';
import { generateQuestions } from '../api/generateQuestions.js';
import {
    saveQuestions,
    getStoryById,
    getQuestionsByStoryId,getStoryAndQuestions$
} from '../db/StoryAppDB.js';
import { createAbortableOperation } from '../utils/abortable.js';

class Step3Questions extends LitElement {
    static properties = {
        storyId:       { type: Number, attribute: 'story-id' },
        story:         { type: Object, state: true },
        questions:     { type: Array,  state: true },
        selectedCount: { type: Number, state: true },
        showInput:     { type: Boolean, state: true },
        showPreview:   { type: Boolean, state: true },
        isGenerating:  { type: Boolean, state: true },
        isInitialized: { type: Boolean, state: true },
        questionTypes: { type: Array,  state: true },
        currentAction:  { type: String, state: true }
    };

    constructor() {
        super();
        this.story = null;
        this.questions = [];
        this.selectedCount = 0;
        this.showInput = false;
        this.showPreview = false;
        this.isGenerating = false;
        this.isInitialized = false;
        this.operation = null;
        this.questionTypes = [];
        this.loadingToastId = null;
        this.currentAction = null;
    }

    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._storySub?.unsubscribe();
        // Clean up any active toast
        if (this.loadingToastId) {
            toast.hide(this.loadingToastId);
        }
    }

    async updated(changed) {
        super.updated(changed);
        if (changed.has('storyId') && this.storyId) {
            this._storySub = getStoryAndQuestions$(this.storyId)
                .subscribe({
                    next: (story) => {
                        this.story = story;
                        let existing = story.questions || [];
                        if (existing.length) {
                            this.questions = existing;
                            this.selectedCount = existing.length;
                            this.showExistingQuestions();
                        } else {
                            this.showQuestionOptions();
                        }
                        this.isInitialized = true;
                        this.requestUpdate();
                    },
                    error: err => {
                        console.error('liveQuery error:', err);
                        toast.error('Error loading story data.');
                    },
                });
        }

        if (changed.has('selectedCount')) {
            this.updateQuestionTypes();
        }
    }

    showQuestionOptions() {
        this.showInput = true;
        this.showPreview = false;
        toast.info('Configure your comprehension questions.');
    }

    showExistingQuestions() {
        this.showInput = true;
        this.showPreview = true;
        toast.success('Questions already generated. You can regenerate or continue.');
    }

    showErrorState(msg) {
        toast.error(msg);
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

    updateQuestionTypes() {
        // Only reset if we're starting fresh (empty array) or growing significantly
        if (this.questionTypes.length === 0 || this.selectedCount > this.questionTypes.length) {
            // Preserve existing types if we have any
            const existingTypes = [...this.questionTypes];

            // Fill up to the new count
            this.questionTypes = [];
            for (let i = 0; i < this.selectedCount; i++) {
                if (i < existingTypes.length) {
                    // Keep existing type
                    this.questionTypes.push({ ...existingTypes[i], index: i });
                } else {
                    // Add new default type
                    this.questionTypes.push({ index: i, type: 'Open-ended' });
                }
            }
        } else if (this.selectedCount < this.questionTypes.length) {
            // Just trim the array if we need fewer questions
            this.questionTypes = this.questionTypes.slice(0, this.selectedCount);
            // Update indices
            this.questionTypes.forEach((qt, i) => qt.index = i);
        }
    }

    handleTypeChange(i, type) {
        this.questionTypes[i] = { ...this.questionTypes[i], type };
        this.requestUpdate();
    }


    handleCancel() {
        console.log('❓ handleCancel called');
        console.log('❓ Current operation:', this.operation);
        console.log('❓ isGenerating:', this.isGenerating);

        if (this.operation) {
            console.log('❓ Calling operation.cancel()');
            this.operation.cancel();
            console.log('❓ operation.cancel() completed');
        } else {
            console.log('❓ No operation to cancel');
        }
    }

    async handleGenerate() {
        if (!this.validateStoryData()) return;
        if (this.selectedCount === 0) {
            await this.handleSkip();
            return;
        }
        await this.performGeneration();
    }

    async handleRegenerate() {
        if (!this.validateStoryData()) return;
        await this.performGeneration();
    }

    async performGeneration() {
        const types = this.questionTypes.map(qt => qt.type);

        this.operation = createAbortableOperation();
        this.currentAction = 'Preparing question generation...';
        this.isGenerating = true;
        this.loadingToastId = toast.loading('Generating questions…');

        try {
            // Update status during generation
            this.currentAction = '❓ Creating comprehension questions...';
            this.requestUpdate();

            const storyWithTypes = {
                ...this.story,
                questionTypes: types
            };

            const questions = await this.operation.execute((signal) => {
                // Update status for different question types
                if (types.includes('Multiple Choice')) {
                    this.currentAction = '📝 Generating multiple choice questions...';
                    this.requestUpdate();
                } else if (types.includes('True/False')) {
                    this.currentAction = '✅ Creating true/false questions...';
                    this.requestUpdate();
                } else {
                    this.currentAction = '💭 Crafting open-ended questions...';
                    this.requestUpdate();
                }

                return generateQuestions(storyWithTypes, this.selectedCount, signal);
            });

            this.currentAction = '💾 Saving generated questions...';
            this.requestUpdate();

            this.questions = questions;
            await saveQuestions(this.storyId, questions);
            this.showPreview = true;

            // Hide loading toast and show success
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }
            toast.success('Questions generated successfully!');

        } catch (err) {
            // Hide loading toast
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }

            if (err.name === 'AbortError') {
                toast.info('Question generation cancelled.');
                this.currentAction = 'Question generation cancelled';
            } else {
                console.error(err);
                toast.error('Error generating questions. Try again.');
                this.currentAction = 'Question generation failed';
            }
        } finally {
            this.isGenerating = false;
            this.currentAction = null;
            this.operation = null;
        }
    }

    async handleSkip() {
        if (!this.validateStoryData()) return;

        const savingToastId = toast.loading('Skipping questions…');
        try {
            await saveQuestions(this.story.id, []);
            toast.hide(savingToastId);
            toast.success('Questions skipped. Moving to next step…');

            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 3 }, bubbles: true, composed: true
            }));
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Skip to Step',
                'value': 3
            });
        } catch (err) {
            console.error(err);
            toast.hide(savingToastId);
            toast.error('Error skipping questions. Please try again.');
        }
    }

    async handleContinue() {
        if (!this.validateStoryData()) return;

        const savingToastId = toast.loading('Saving questions…');
        try {
            await saveQuestions(this.story.id, this.questions);
            toast.hide(savingToastId);
            toast.success('Questions saved. Moving to next step…');

            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 3 }, bubbles: true, composed: true
            }));
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Continue to Step',
                'value': 3
            });
        } catch (err) {
            console.error(err);
            toast.hide(savingToastId);
            toast.error('Error saving questions. Please try again.');
        }
    }

    validateStoryData() {
        if (!this.story?.id || !this.story.content || !this.story.title) {
            this.showErrorState('Story content is required before generating questions.');
            return false;
        }
        return true;
    }

    render() {
        // Loading
        if (!this.isInitialized && this.storyId) {
            return html`
                <div class="step3-questions-root">
                    <h2
                        class="step3-questions-header"
                        title="Step 3: Comprehension Questions"
                        aria-label="Step 3: Comprehension Questions"
                    >
                        Step 3: Comprehension Questions
                    </h2>
                    <div class="step3-questions-status loading">
                        Loading story data…
                    </div>
                </div>
            `;
        }

        // No story
        if (!this.story) {
            return html`
                <div class="step3-questions-root">
                    <h2 class="step3-questions-header">Step 3: Comprehension Questions</h2>
                    <div
                        class="step3-questions-error-section"
                        title="Story content is required before generating questions"
                    >
                        <p>Story content is required before generating questions.</p>
                        <button
                            @click=${this.redirectToStep0}
                            title="Return to Step 1"
                        >
                            Return to Step 1
                        </button>
                    </div>
                </div>
            `;
        }

        // Main
        return html`
            <div class="step3-questions-root">
                <h2
                    class="step3-questions-header"
                    title="Step 3: Comprehension Questions"
                    aria-label="Step 3: Comprehension Questions"
                >
                    Step 3: Comprehension Questions
                </h2>

                ${this.renderInputSection()}
                ${this.showPreview ? this.renderPreviewSection() : ''}
            </div>
        `;
    }

    renderInputSection() {
        if (!this.showInput) return '';
        return html`
            <div class="step3-questions-input-section" 
                 title="Configure how many and which types of questions to generate"
                 aria-label="Question options">
                <p title="Choose number of questions">How many questions would you like to generate?</p>
                <div class="step3-questions-count-options">
                    ${[0,1,2,3].map(count => html`
                        <div class="step3-questions-count-option">
                            <input
                                type="radio"
                                id="count-${count}"
                                name="questionCount"
                                .value=${count}
                                .checked=${this.selectedCount === count}
                                @change=${this.handleCountChange}
                                title="${count} ${count===0?'No':'Question'}${count>1?'s':''}"
                            />
                            <label
                                for="count-${count}"
                                title="${count===0?'No questions':`${count} Question${count>1?'s':''}`}"
                            >
                                ${count===0?'No questions':`${count} Question${count>1?'s':''}`}
                            </label>
                        </div>
                    `)}
                </div>
                ${this.selectedCount > 0 ? this.renderQuestionTypes() : ''}

                <div class="step3-questions-actions" aria-label="Actions">
                    ${this.isGenerating ? html`
                        <!-- Show status and cancel when generating -->
                        <div class="generating-state">
                            <span class="generating-text">
                                ${this.currentAction || 'Processing...'}
                            </span>
                            <button
                                type="button"
                                class="btn-cancel"
                                @click=${this.handleCancel}
                                title="Cancel question generation"
                            >
                                Cancel
                            </button>
                        </div>
                    ` : html`
                        <!-- Show normal buttons when not generating -->
                        <button
                            class="step3-questions-btn-generate"
                            @click=${this.handleGenerate}
                            title="Generate questions"
                        >
                            Generate Questions
                        </button>
                        <button
                            class="step3-questions-btn-skip"
                            @click=${this.handleSkip}
                            title="Skip questions and continue"
                        >
                            Skip Questions
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderQuestionTypes() {
        return html`
            <div
                class="step3-questions-types-container"
                title="Select question types"
                aria-label="Question types"
            >
                <h4 title="Question Types">Question Types:</h4>
                ${this.questionTypes.map((qt, i) => html`
                    <div class="step3-questions-type-row">
                        <span class="step3-questions-type-label">Question ${i+1}:</span>
                        <select
                            class="step3-questions-type-select"
                            .value=${qt.type}
                            @change=${e => this.handleTypeChange(i, e.target.value)}
                            title="Type for question ${i+1}"
                        >
                            <option>Open-ended</option>
                            <option>Multiple Choice</option>
                            <option>True/False</option>
                        </select>
                    </div>
                `)}
            </div>
        `;
    }

    // Update the renderPreviewSection method in step3-questions.js

    renderPreviewSection() {
        return html`
            <div class="step3-questions-preview-section"
                 title="Preview of generated questions"
                 aria-label="Questions preview">
                <ul class="step3-questions-list">
                    ${this.questions.map((q, i) => html`
                        <li class="step3-questions-item" title="${q.text}">
                            <div class="step3-questions-item-header">Q${i+1}</div>
                            <div class="step3-questions-item-text">${q.text || q.questionText}</div>
                            <div class="step3-questions-item-type">(${q.type})</div>

                            ${q.type === 'Multiple Choice' && q.options && q.options.length > 0 ? html`
                                <div class="step3-questions-item-options">
                                    <div class="step3-questions-options-label">Answer Choices:</div>
                                    <ul class="step3-questions-options-list">
                                        ${q.options.map((option, optIndex) => html`
                                            <li class="step3-questions-option-item">
                                                <span class="step3-questions-option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                                                <span class="step3-questions-option-text">${option}</span>
                                            </li>
                                        `)}
                                    </ul>
                                </div>
                            ` : ''}

                            ${q.type === 'True/False' ? html`
                                <div class="step3-questions-item-options">
                                    <div class="step3-questions-options-label">Answer Choices:</div>
                                    <ul class="step3-questions-options-list">
                                        <li class="step3-questions-option-item">
                                            <span class="step3-questions-option-letter">A.</span>
                                            <span class="step3-questions-option-text">True</span>
                                        </li>
                                        <li class="step3-questions-option-item">
                                            <span class="step3-questions-option-letter">B.</span>
                                            <span class="step3-questions-option-text">False</span>
                                        </li>
                                    </ul>
                                </div>
                            ` : ''}
                        </li>
                    `)}
                </ul>
                <div class="step3-questions-actions" aria-label="Preview actions">
                    ${this.isGenerating ? html`
                        <!-- Show status and cancel when regenerating -->
                        <div class="generating-state">
                            <span class="generating-text">
                                ${this.currentAction || 'Processing...'}
                            </span>
                            <button
                                type="button"
                                class="btn-cancel"
                                @click=${this.handleCancel}
                                title="Cancel question regeneration"
                            >
                                Cancel
                            </button>
                        </div>
                    ` : html`
                        <!-- Show normal buttons when not generating -->
                        <button
                            class="step3-questions-btn-regenerate"
                            @click=${this.handleRegenerate}
                            title="Regenerate questions"
                        >
                            Regenerate Questions
                        </button>
                        <button
                            class="step3-questions-btn-continue"
                            @click=${this.handleContinue}
                            title="Continue with these questions"
                        >
                            Continue with These Questions
                        </button>
                    `}
                </div>
            </div>
        `;
    }
}

customElements.define('step3-questions', Step3Questions);
