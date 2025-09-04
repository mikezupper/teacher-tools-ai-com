// components/step5-complete.js
import { LitElement, html, css } from 'lit';
import { toast } from './toast-component.js';
import {
    getFullStory$,
    getPromptsByStoryId,
    getQuestionsByStoryId,
    getStoryById, getStoryById$,
    markStoryCompleted
} from '../db/StoryAppDB.js';

class Step5Complete extends LitElement {
    static properties = {
        storyId:      { type: Number, attribute: 'story-id' },
        isLoading:    { type: Boolean, state: true },
        hasError:     { type: Boolean, state: true },
        isInitialized:{ type: Boolean, state: true }
    };

    constructor() {
        super();
        this.story    = null;
        this.isLoading    = false;
        this.hasError     = false;
        this.isInitialized= false;
        this.loadingToastId = null;
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

    async updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('storyId') && this.storyId) {
            this._storySub = getFullStory$(this.storyId)
                .subscribe({
                    next: async full => {
                        this.story    = full;
                        if(full.imageBlob){
                            this.imageUrl= URL.createObjectURL(full.imageBlob);
                        }

                        this.questions = full.questions || [];
                        this.prompts   = full.prompts || [];
                        this.isLoading = false;
                        this.hasError = false;
                        this.isInitialized = true;
                        this.requestUpdate();
                    },
                    error: err => {
                        console.error('liveQuery error:', err);
                        this.hasError = true;
                        this.isLoading = false;
                        toast.error('Error loading story data. Please try refreshing the page.');
                    },
                });
        }
    }

    handlePrint() {
        if (this.story) {
            try {
                window.open(`./print.html?storyId=${this.story.id}`, '_blank');
                toast.success('Print worksheet opened in new tab.');
            } catch (error) {
                console.error('Error opening print window:', error);
                toast.error('Unable to open print window. Please check if popups are blocked.');
            }
        } else {
            toast.error('Story data not available for printing.');
        }
    }

    async handleFinish() {
        if (!this.story?.id) {
            toast.error('Story data not available.');
            return;
        }

        const savingToastId = toast.loading('Finishing and saving your story...');
        try {
            await markStoryCompleted(this.story.id);
            toast.hide(savingToastId);
            toast.success('Story completed and saved! Redirecting to dashboard...');

            // Slight delay to let user see the success message
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 500);
        } catch (error) {
            console.error('Error marking story complete:', error);
            toast.hide(savingToastId);
            toast.error('Error saving story completion. Redirecting anyway...');

            // Still redirect even if there's an error
            setTimeout(() => {
                window.location.href = '/dashboard.html';
            }, 500);
        }
    }

    render() {
        if (this.isLoading || !this.isInitialized) {
            return html`
                <div class="step5-complete-root">
                    <h2
                        class="step5-complete-header"
                        title="Story Creation Complete"
                        aria-label="Step 5: Completion"
                    >
                        🎉 Story Creation Complete!
                    </h2>
                    <div
                        class="step5-complete-loading-message"
                        title="Loading your story..."
                    >
                        <div class="step5-complete-loading-spinner"></div>
                        <p>Loading your story...</p>
                    </div>
                </div>
            `;
        }

        if (this.hasError) {
            return html`
                <div class="step5-complete-root">
                    <h2
                        class="step5-complete-header"
                        title="Story Creation Complete"
                        aria-label="Step 5: Completion"
                    >
                        🎉 Story Creation Complete!
                    </h2>
                    <div
                        class="step5-complete-error-message"
                        title="Error loading story"
                    >
                        There was an error loading your story. Please try refreshing the page.
                    </div>
                </div>
            `;
        }

        if (!this.story) {
            return html`
                <div class="step5-complete-root">
                    <h2
                        class="step5-complete-header"
                        title="Story Creation Complete"
                        aria-label="Step 5: Completion"
                    >
                        🎉 Story Creation Complete!
                    </h2>
                    <div
                        class="step5-complete-error-message"
                        title="No story data available."
                    >
                        No story data available.
                    </div>
                </div>
            `;
        }

        return html`
            <div class="step5-complete-root">
                <h2
                        class="step5-complete-header"
                        title="Story Creation Complete"
                        aria-label="Step 5: Completion"
                >
                    🎉 Story Creation Complete!
                </h2>
                <p
                        class="step5-complete-completion-message"
                        title="Your story is ready"
                >
                    Your educational story is ready! Here's a summary of everything you've created:
                </p>

                <div
                        class="step5-complete-actions"
                        title="Go back to thinking prompts step"
                >
                </div>

                <div
                        class="step5-complete-summary"
                        title="Summary of your story"
                >
                    ${this.renderStoryDetails()}
                    ${this.renderStoryContent()}
                    ${this.renderQuestionsSummary()}
                    ${this.renderPromptsSummary()}
                </div>

                <div
                        class="step5-complete-action-buttons"
                        title="Finalize your story"
                >
                    <button
                            class="step5-complete-btn-print"
                            @click=${this.handlePrint}
                            title="Print your worksheet"
                    >
                        Print Worksheet
                    </button>
                    <button
                            class="step5-complete-btn-finish"
                            @click=${this.handleFinish}
                            title="Finish & return to dashboard"
                    >
                        Finish & Return to Dashboard
                    </button>
                </div>
            </div>
        `;
    }

    renderStoryDetails() {
        return html`
            <div
                    class="step5-complete-summary-section"
                    title="Story Details"
            >
                <h3 title="Story Details">📚 Story Details</h3>
                <div class="step5-complete-detail-item">
                    <span class="step5-complete-detail-label">Theme:</span>
                    <span class="step5-complete-detail-value">
                        ${this.story.theme || 'Unknown Theme'}
                    </span>
                </div>
                <div class="step5-complete-detail-item">
                    <span class="step5-complete-detail-label">Title:</span>
                    <span class="step5-complete-detail-value">
                        ${this.story.title}
                    </span>
                </div>
                ${this.story.gradeLevel ? html`
                    <div class="step5-complete-detail-item">
                        <span class="step5-complete-detail-label">Grade:</span>
                        <span class="step5-complete-detail-value">
                            ${this.story.gradeLevel}
                        </span>
                    </div>
                ` : ''}
                ${this.story.genre ? html`
                    <div class="step5-complete-detail-item">
                        <span class="step5-complete-detail-label">Genre:</span>
                        <span class="step5-complete-detail-value">
                            ${this.story.genre}
                        </span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderStoryContent() {
        return html`
            <div class="step5-complete-summary-section">
                <h3>📖 Story Content</h3>

                <!-- Story Text First -->
                <div class="step5-complete-story-text-section">
                    <div class="step5-complete-content-header">Story Text</div>
                    <div class="step5-complete-story-content-preview">${this.story.content}</div>
                </div>

                <!-- Story Image Second -->
                <div class="step5-complete-story-image-section">
                    <div class="step5-complete-content-header">Story Illustration</div>
                    <div class="step5-complete-image-container">
                        ${this.imageUrl ? html`
                            <img
                                class="step5-complete-image-preview"
                                src=${this.imageUrl}
                                alt="Story illustration"
                            />
                            <div class="step5-complete-image-status step5-complete-status-included">
                                ✅ Image included
                            </div>
                        ` : html`
                            <div class="step5-complete-no-image-placeholder">
                                <div style="font-size: 2rem; margin-bottom: var(--spacing-sm);">📄</div>
                                <div>No image generated</div>
                            </div>
                            <div class="step5-complete-image-status step5-complete-status-missing">
                                ❌ No image generated
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    renderQuestionsSummary() {
        return html`
            <div
                    class="step5-complete-summary-section"
                    title="Comprehension Questions"
                    aria-label="Comprehension Questions"
            >
                <h3 title="Comprehension Questions">❓ Comprehension Questions</h3>
                <div class="step5-complete-section-header">
                <span
                        class="step5-complete-questions-count"
                        title="Number of questions"
                >
                    ${this.questions.length} question${this.questions.length !== 1 ? 's' : ''}
                </span>
                </div>
                <div class="step5-complete-questions-preview">
                    ${this.questions.length === 0 ? html`
                        <div
                                class="step5-complete-no-content-message"
                                title="No questions generated"
                        >
                            No comprehension questions were generated.
                        </div>
                    ` : html`
                        ${this.questions.map((q, i) => html`
                            <div
                                    class="step5-complete-question-item"
                                    title="Question ${i+1}"
                            >
                                <div
                                        class="step5-complete-question-number"
                                        title="Question number"
                                >
                                    ${i+1}
                                </div>
                                <div
                                        class="step5-complete-question-content"
                                        title="${q.questionText || q.text}"
                                >
                                    <div class="step5-complete-question-text">
                                        ${q.questionText || q.text}
                                    </div>
                                    <div
                                            class="step5-complete-question-type"
                                            title="Question type"
                                    >
                                            (${q.type})
                                    </div>

                                    ${q.type === 'Multiple Choice' && q.options && q.options.length > 0 ? html`
                                    <div class="step5-complete-question-options">
                                        <div class="step5-complete-options-label">Answer Choices:</div>
                                        <ul class="step5-complete-options-list">
                                            ${q.options.map((option, optIndex) => html`
                                                <li class="step5-complete-option-item">
                                                    <span class="step5-complete-option-letter">${String.fromCharCode(65 + optIndex)}.</span>
                                                    <span class="step5-complete-option-text">${option}</span>
                                                </li>
                                            `)}
                                        </ul>
                                    </div>
                                ` : ''}

                                    ${q.type === 'True/False' ? html`
                                    <div class="step5-complete-question-options">
                                        <div class="step5-complete-options-label">Answer Choices:</div>
                                        <ul class="step5-complete-options-list">
                                            <li class="step5-complete-option-item">
                                                <span class="step5-complete-option-letter">A.</span>
                                                <span class="step5-complete-option-text">True</span>
                                            </li>
                                            <li class="step5-complete-option-item">
                                                <span class="step5-complete-option-letter">B.</span>
                                                <span class="step5-complete-option-text">False</span>
                                            </li>
                                        </ul>
                                    </div>
                                ` : ''}
                                </div>
                            </div>
                        `)}
                    `}
                </div>
            </div>
        `;
    }

    renderPromptsSummary() {
        return html`
            <div
                class="step5-complete-summary-section"
                title="Thinking Prompts"
                aria-label="Thinking Prompts"
            >
                <h3 title="Thinking Prompts">💭 Thinking Prompts</h3>
                <div class="step5-complete-section-header">
                    <span
                        class="step5-complete-prompts-count"
                        title="Number of prompts"
                    >
                        ${this.prompts.length} prompt${this.prompts.length !== 1 ? 's' : ''}
                    </span>
                </div>
                <div class="step5-complete-prompts-preview">
                    ${this.prompts.length === 0 ? html`
                        <div
                            class="step5-complete-no-content-message"
                            title="No prompts generated"
                        >
                            No thinking prompts were generated.
                        </div>
                    ` : html`
                        ${this.prompts.map((p, i) => html`
                            <div
                                class="step5-complete-prompt-item"
                                title="Prompt ${i+1}"
                            >
                                <div
                                    class="step5-complete-prompt-number"
                                    title="Prompt number"
                                >
                                    Prompt ${i+1}
                                </div>
                                <div class="step5-complete-prompt-text">
                                    ${p.promptText || p}
                                </div>
                            </div>
                        `)}
                    `}
                </div>
            </div>
        `;
    }
}

customElements.define('step5-complete', Step5Complete);
