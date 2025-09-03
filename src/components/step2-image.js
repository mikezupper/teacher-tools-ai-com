// components/step2-image.js
import { LitElement, html, css } from 'lit';
import { toast } from './toast-component.js';
import { generateImage } from '../api/generateImage.js';
import {
    saveStoryImage,
    skipStoryImage,
    getStoryById$
} from '../db/StoryAppDB.js';
import { createAbortableOperation } from '../utils/abortable.js';

class Step2Image extends LitElement {
    static properties = {
        storyId:       { type: Number, attribute: 'story-id' },
        story:         { type: Object, state: true },
        imageUrl:      { type: String, state: true },
        showInput:     { type: Boolean, state: true },
        showPreview:   { type: Boolean, state: true },
        isGenerating:  { type: Boolean, state: true },
        isInitialized: { type: Boolean, state: true }
    };

    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    constructor() {
        super();
        this.story = null;
        this.imageUrl = '';
        this.showInput = false;
        this.showPreview = false;
        this.isGenerating = false;
        this.isInitialized = false;
        this.operation = null;
        this.loadingToastId = null;
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
            this._storySub = getStoryById$(this.storyId)
                .subscribe({
                    next: story => {
                        this.story = story;
                        if (story.imageBlob) {
                            this.imageUrl = URL.createObjectURL(story.imageBlob);
                            toast.success('Image already generated. You can regenerate or continue.');
                        } else {
                            toast.info('Do you want to generate an image for your story?');
                        }
                        this.showInput = true;
                        this.showPreview = !!story.imageBlob;
                        this.isInitialized = true;

                        this.requestUpdate();
                    },
                    error: err => {
                        console.error('liveQuery error:', err);
                        toast.error('Error loading story data.');
                    },
                });
        }
    }

    redirectToStep0() {
        this.dispatchEvent(new CustomEvent('go-to-step', {
            detail: { stepIndex: 0 },
            bubbles: true,
            composed: true
        }));
        gtag('event', 'go-to-step', {
            'event_category': 'Engagement',
            'event_label': 'Redirect to Step',
            'value': 0
        });
    }

    async handleGenerate() {
        if (this.isGenerating) {
            this.operation?.cancel();
            this.isGenerating = false;
            // Hide loading toast if canceling
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }
            return;
        }
        if (!this.story) return;
        await this.performGeneration();
    }

    async performGeneration() {
        this.operation = createAbortableOperation();
        this.isGenerating = true;
        this.loadingToastId = toast.loading('Generating image…');

        try {
            const result = await this.operation.execute(generateImage, this.story.content);
            console.log("step2 image.js: Generated image result:", result);

            if(result?.imageBlob){
                this.showPreview = true;
                await saveStoryImage(this.story.id, result.imageBlob);
                this.imageUrl = URL.createObjectURL(result.imageBlob);

                // Hide loading toast and show success
                if (this.loadingToastId) {
                    toast.hide(this.loadingToastId);
                    this.loadingToastId = null;
                }
                toast.success('Image generated successfully!');
            }
        } catch (err) {
            // Hide loading toast
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }

            if (err.name === 'AbortError') {
                toast.info('Image generation cancelled.');
            } else {
                console.error(err);
                toast.error('Error generating image. Please try again.');
            }
        } finally {
            this.isGenerating = false;
            this.operation = null;
        }
    }

    async handleSkip() {
        if (!this.story) return;

        const savingToastId = toast.loading('Skipping image…');
        try {
            await skipStoryImage(this.story.id);
            toast.hide(savingToastId);
            toast.success('Image skipped. Moving to next step…');

            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 2 }, bubbles: true, composed: true
            }));
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Skip to Step',
                'value': 2
            });
        } catch (err) {
            console.error(err);
            toast.hide(savingToastId);
            toast.error('Error skipping image. Please try again.');
        }
    }

    async handleContinue() {
        if (!this.story) return;

        const savingToastId = toast.loading('Saving image…');
        try {
            toast.hide(savingToastId);
            toast.success('Image saved. Moving to next step…');

            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail: { stepIndex: 2 }, bubbles: true, composed: true
            }));
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Continue to Step',
                'value': 2
            });
        } catch (err) {
            console.error(err);
            toast.hide(savingToastId);
            toast.error('Error saving image. Please try again.');
        }
    }

    showErrorState(message) {
        toast.error(message);
        setTimeout(() => this.redirectToStep0(), 3000);
    }

    render() {
        // loading
        if (!this.isInitialized && this.storyId) {
            return html`
                <div class="step2-image-root">
                    <h2
                        class="step2-image-header"
                        title="Step 2: Story Image"
                        aria-label="Step 2: Story Image"
                    >
                        Step 2: Story Image
                    </h2>
                    <div class="step2-image-status loading">
                        Loading story data…
                    </div>
                </div>
            `;
        }

        // error/no story
        if (!this.story) {
            return html`
                <div class="step2-image-root">
                    <h2
                        class="step2-image-header"
                        title="Step 2: Story Image"
                    >
                        Step 2: Story Image
                    </h2>
                    <div
                        class="step2-image-error-section"
                        title="Story content is required before generating an image."
                    >
                        <p>Story content is required before generating an image.</p>
                        <button
                            class="step2-image-error-btn"
                            @click=${this.redirectToStep0}
                            title="Return to Step 1"
                        >
                            Return to Step 1
                        </button>
                    </div>
                </div>
            `;
        }

        // normal
        return html`
            <div class="step2-image-root">
                <h2
                    class="step2-image-header"
                    title="Step 2: Story Image"
                >
                    Step 2: Story Image
                </h2>
                ${this.renderInputSection()}
                ${this.showPreview ? this.renderPreviewSection() : ''}
            </div>
        `;
    }

    renderInputSection() {
        if (!this.showInput) return '';
        return html`
            <div
                    class="step2-image-input-section"
                    title="Choose to generate or skip an image"
            >
                <p title="Generate an AI image illustrating your story">
                    Do you want to generate an image for your story?
                </p>
                <div
                        class="step2-image-actions"
                        aria-label="Image actions"
                >
                    <button
                            class="step2-image-btn-generate"
                            @click=${this.handleGenerate}
                            ?disabled=${this.isGenerating}
                            title="Generate an AI image based on your story"
                    >
                        ${this.isGenerating ? 'Generating…' : 'Generate Image'}
                    </button>
                    ${this.isGenerating
                            ? html`
                            <button
                                class="step2-image-btn-cancel"
                                @click=${this.handleGenerate}
                                title="Cancel image generation"
                            >
                                Cancel
                            </button>
                        `
                            : ''}
                    <button
                            class="step2-image-btn-skip"
                            @click=${this.handleSkip}
                            ?disabled=${this.isGenerating}
                            title="Skip image generation"
                    >
                        Skip Image
                    </button>
                </div>
            </div>
        `;
    }

    renderPreviewSection() {
        return html`
            <div
                    class="step2-image-preview-section"
                    title="Preview of generated image"
                    aria-label="Image preview"
            >
                <img
                        class="step2-image-img"
                        src=${this.imageUrl}
                        alt="Generated story image"
                        title="Generated story image"
                />
                <div
                        class="step2-image-actions"
                        aria-label="Image actions"
                >
                    <button
                            class="step2-image-btn-regenerate"
                            @click=${this.performGeneration}
                            ?disabled=${this.isGenerating}
                            title="Regenerate image"
                    >
                        ${this.isGenerating ? 'Generating…' : 'Regenerate Image'}
                    </button>
                    ${this.isGenerating
                            ? html`
                                <button
                                        class="step2-image-btn-cancel"
                                        @click=${this.handleGenerate}
                                        title="Cancel image regeneration"
                                >
                                    Cancel
                                </button>
                            `
                            : ''}
                    <button
                            class="step2-image-btn-continue"
                            @click=${this.handleContinue}
                            ?disabled=${this.isGenerating}
                            title="Continue to the next step"
                    >
                        Continue with This Image
                    </button>
                </div>
            </div>
        `;
    }
}

customElements.define('step2-image', Step2Image);
