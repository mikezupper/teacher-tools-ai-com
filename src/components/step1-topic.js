// components/step1-topic.js
import { LitElement, html, css } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { marked } from 'marked';
import { toast } from './toast-component.js';
import { generateStory } from '../api/generateStory.js';
import { generateRandomStoryInput } from '../story-gen-pipeline/randomizer.js';
import {saveStory, getStoryById$} from '../db/StoryAppDB.js';
import { createAbortableOperation } from '../utils/abortable.js';
import {extractStoryContent} from "../api/util.js";

class Step1Topic extends LitElement {
    static properties = {
        storyId:        { type: Number, attribute: 'story-id' },
        theme:          { type: String, state: true },
        gradeLevel:     { type: String, state: true },
        phonicSkill:    { type: String, state: true },
        length:         { type: String, state: true },
        genre:          { type: String, state: true },
        currentStory:   { type: Object, state: true },
        showPreview:    { type: Boolean, state: true },
        isGenerating:   { type: Boolean, state: true },
        isEditMode:     { type: Boolean, state: true },
        currentAction:  { type: String, state: true }
    };

    createRenderRoot() {
        // Render into the light DOM instead of attaching a shadow root
        return this;
    }

    constructor() {
        super();
        this.theme = '';
        this.gradeLevel = '';
        this.phonicSkill = '';
        this.length = '';
        this.genre = '';
        this.currentStory = null;
        this.showPreview = false;
        this.isGenerating = false;
        this.isEditMode = false;
        this.operation = null;
        this.loadingToastId = null;
        this.currentAction = null;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this._storySub?.unsubscribe();
    }

    async updated(changedProps) {
        super.updated(changedProps);
        if (changedProps.has('storyId') && this.storyId) {

            this._storySub?.unsubscribe();
            this._storySub = getStoryById$(this.storyId)
                .subscribe({
                    next: story => {
                        this.story = story;
                        this.theme        = story.theme        || '';
                        this.gradeLevel   = story.gradeLevel   || '';
                        this.phonicSkill  = story.phonicSkill  || '';
                        this.length       = story.length       || '';
                        this.genre        = story.genre        || '';

                        this.currentStory = story;

                        this.showPreview = this.hasStoryContent(story) && story.title;
                        console.log("updated storyId: ", this.story,this.showPreview,story);
                        this.requestUpdate();
                    },
                    error: err => console.error('liveQuery error:', err),
                });

        }
    }

    handleThemeInput(e) {
        this.theme = e.target.value;
    }

    handleGradeLevelChange(e) {
        this.gradeLevel = e.target.value;
    }

    handlePhonicSkillChange(e) {
        this.phonicSkill = e.target.value;
    }

    handleLengthChange(e) {
        this.length = e.target.value;
    }

    handleGenreChange(e) {
        this.genre = e.target.value;
    }

    validateInputs() {
        const errors = [];

        if (!this.theme.trim()) {
            errors.push('Theme is required');
        }

        if (!this.gradeLevel || this.gradeLevel === '') {
            errors.push('Grade level is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }
    handleKeyPress(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.handleGenerate();
        }
    }

    hasStoryContent(story) {
        console.log("hasStoryContent",story)
        // Check new structured format
        if (story?.paragraphs && Array.isArray(story.paragraphs) && story.paragraphs.length > 0) {
            return story.paragraphs.some(paragraph =>
                paragraph.sentences &&
                Array.isArray(paragraph.sentences) &&
                paragraph.sentences.length > 0
            );
        }

        // Check legacy format
        return !!(story?.content || story?.story);
    }

    async handleRandomize() {
        console.log('🎲 handleRandomize called');
        if (!this.gradeLevel || this.gradeLevel === '') {
            toast.error('Please select a grade level first.');
            return;
        }
        this.operation = createAbortableOperation();
        console.log('🎲 Created abort operation:', this.operation);

        this.currentAction = 'Generating random parameters...';
        this.isGenerating = true;
        console.log('🎲 Set isGenerating to true');

        this.loadingToastId = toast.loading('Generating random parameters...');

        try {
            console.log('🎲 About to call operation.execute...');

            // FIX: Use a wrapper function that properly passes the signal
            const randomParams = await this.operation.execute((signal) => {
                return generateRandomStoryInput({
                    gradeLevel: this.gradeLevel || undefined,
                    signal: signal
                });
            });

            console.log('🎲 Randomization completed successfully:', randomParams);

            this.theme = randomParams.theme;
            this.genre = randomParams.genre;
            this.phonicSkill = randomParams.phonicSkill;
            this.length = randomParams.length;
            this.gradeLevel = randomParams.gradeLevel;

            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }
            toast.success('Random story parameters generated!');
        } catch (error) {
            console.log('🎲 Randomization error caught:', error);
            console.log('🎲 Error name:', error.name);
            console.log('🎲 Error message:', error.message);

            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }

            if (error.name === 'AbortError') {
                console.log('🎲 Detected AbortError - showing cancelled message');
                toast.info('Randomization cancelled.');
            } else {
                console.error('Randomization failed:', error);
                toast.error('Failed to generate random parameters');
            }
        } finally {
            console.log('🎲 handleRandomize finally block');
            this.isGenerating = false;
            this.currentAction = null;
            this.operation = null;
            console.log('🎲 Reset isGenerating to false');
        }
    }

    async handleGenerate() {
        const validation = this.validateInputs();
        if (!validation.isValid) {
            toast.error(validation.errors.join(', '));
            return;
        }
        await this.performGeneration();
    }

    async performGeneration() {
        this.operation = createAbortableOperation();
        this.currentAction = 'Generating your story...';
        this.isGenerating = true;
        this.loadingToastId = toast.loading('Generating your story...');

        try {
            const formData = {
                theme: this.theme,
                gradeLevel: this.gradeLevel,
                phonicSkill: this.phonicSkill,
                length: this.length,
                genre: this.genre
            };
            const newStory = await this.operation.execute(generateStory, formData);
            if (this.isEditMode && this.currentStory?.id) {
                newStory.id = this.currentStory.id;
            }
            const storyContent = extractStoryContent(newStory);

            this.currentStory = {
                ...formData,
                title: newStory.title,
                content: storyContent,
                storyMarkdown: newStory.storyMarkdown,
                id: newStory.id,
                paragraphs: newStory.paragraphs,
                educationalAnalysis: newStory.educationalAnalysis,
                finalReport: newStory.finalReport,
                pipelineGenerated: newStory.pipelineGenerated,
                generatedAt: newStory.generatedAt,
            };
            this.showPreview = true;

            // Hide loading toast and show success
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }
            toast.success('Story generated successfully!');
        } catch (err) {
            // Hide loading toast
            if (this.loadingToastId) {
                toast.hide(this.loadingToastId);
                this.loadingToastId = null;
            }

            if (err.name === 'AbortError') {
                toast.info('Generation cancelled.');
            } else {
                console.error('Story generation failed:', err);
                toast.error('Failed to generate story');
            }
        } finally {
            this.isGenerating = false;
            this.currentAction = null;
            this.operation = null;
        }
    }

    async handleSave() {
        if (!this.currentStory?.title || !this.currentStory?.content) {
            toast.error('Story title and content are required.');
            return;
        }

        const savingToastId = toast.loading('Saving story...');
        try {
            const storyToSave = {
                ...this.currentStory,
                theme: this.theme,
                gradeLevel: this.gradeLevel,
                phonicSkill: this.phonicSkill,
                length: this.length,
                genre: this.genre,
                updatedAt: new Date().toISOString()
            };
            const storyId = await saveStory(storyToSave);
            this.currentStory.id = storyId;
            this.dispatchEvent(new CustomEvent('story-created', {
                detail:   { storyId },
                bubbles:  true,
                composed: true
            }));
                // Hide saving toast and show success
                toast.hide(savingToastId);
                toast.success('Story saved! Moving to image generation...');

            this.dispatchEvent(new CustomEvent('go-to-step', {
                detail:   { stepIndex: 1 },
                bubbles:  true,
                composed: true
            }));
            gtag('event', 'go-to-step', {
                'event_category': 'Engagement',
                'event_label': 'Go to Step',
                'value': 1
            });
        } catch (err) {
            console.error('Error saving story:', err);
            toast.hide(savingToastId);
            toast.error('Error saving story. Please try again.');
        }
    }

    handleCancel() {
        console.log('❌ handleCancel called');
        console.log('❌ Current operation:', this.operation);
        console.log('❌ isGenerating:', this.isGenerating);

        if (this.operation) {
            console.log('❌ Calling operation.cancel()');
            this.operation.cancel();
            console.log('❌ operation.cancel() completed');
        } else {
            console.log('❌ No operation to cancel');
        }
    }

    renderFormFields() {
        return html`
            <div class="form-container">
                <div class="form-row">
                    <div class="form-group">
                        <label for="theme">Story Theme or Topic *</label>
                        <textarea
                                id="theme"
                                .value=${this.theme}
                                @input=${this.handleThemeInput}
                                @keypress=${this.handleKeyPress}
                                placeholder="Describe your story theme, e.g., 'A brave knight who learns about friendship'"
                                required
                        ></textarea>
                    </div>

                    <div class="form-group">
                        <label for="gradeLevel">Grade Level *</label>
                        <select
                                id="gradeLevel"
                                .value=${this.gradeLevel}
                                @change=${this.handleGradeLevelChange}
                                required
                                class="${!this.gradeLevel ? 'required-field' : ''}"
                        >
                            <option value="">Select Grade Level *</option>
                            <option value="Kindergarten">Kindergarten</option>
                            <option value="1st Grade">1st Grade</option>
                            <option value="2nd Grade">2nd Grade</option>
                            <option value="3rd Grade">3rd Grade</option>
                            <option value="4th Grade">4th Grade</option>
                            <option value="5th Grade">5th Grade</option>
                            <option value="6th Grade">6th Grade</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="phonicSkill">Phonic Skill Focus</label>
                        <input
                                type="text"
                                id="phonicSkill"
                                .value=${this.phonicSkill}
                                @input=${this.handlePhonicSkillChange}
                                placeholder="e.g., Short vowels, Consonant blends"
                        />
                    </div>

                    <div class="form-group">
                        <label for="genre">Story Genre</label>
                        <input
                                type="text"
                                id="genre"
                                .value=${this.genre}
                                @input=${this.handleGenreChange}
                                placeholder="e.g., Adventure, Fantasy, Animal Story"
                        />
                    </div>

                    <div class="form-group">
                        <label for="length">Story Length</label>
                        <input
                                type="number"
                                id="length"
                                .value=${this.length}
                                @input=${this.handleLengthChange}
                                placeholder="Number of sentences"
                                min="3"
                                max="20"
                        />
                    </div>
                </div>

                <div class="form-actions">
                    ${this.isGenerating ? html`
                        <!-- Show cancel button when generating -->
                        <div class="generating-state">
                        <span class="generating-text">
                            ${this.currentAction || 'Processing...'}
                        </span>
                            <button
                                    type="button"
                                    class="btn-cancel"
                                    @click=${this.handleCancel}
                                    title="Cancel current operation"
                            >
                                ⏹️ Cancel
                            </button>
                        </div>
                    ` : html`
                        <!-- Show action buttons when not generating -->
                        <button
                                type="button"
                                class="btn-secondary"
                                @click=${this.handleRandomize}
                                title="Generate random story parameters"
                        >
                            🎲 Randomize
                        </button>
                        <button
                                type="button"
                                class="btn-primary"
                                @click=${this.handleGenerate}
                                title="Generate story with current settings"
                        >
                            ✨ Generate Story
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    renderStoryPreview() {
        if (!this.currentStory) return '';
        return html`
            <div class="story-preview">
                <h3>Story Preview</h3>
                <div class="story-content">
                    <h4>${this.currentStory.title}</h4>
                    ${this.renderStructuredStory()}
                </div>
                <div class="preview-actions">
                    <button
                            type="button"
                            class="btn-regenerate"
                            @click=${this.handleRegenerate}
                            ?disabled=${this.isGenerating}
                            title="Generate a new story with the same settings"
                    >
                        🔄 ${this.isGenerating ? 'Regenerating...' : 'Regenerate Story'}
                    </button>
                    <button
                            type="button"
                            class="btn-primary"
                            @click=${this.handleSave}
                            ?disabled=${this.isGenerating}
                            title="Save this story and continue"
                    >
                        💾 Continue with Story
                    </button>
                </div>
            </div>
        `;
    }

    async handleRegenerate() {
        // Simply call the same performGeneration method that the Generate Story button uses
        await this.performGeneration();
    }

    renderStructuredStory() {
        if (!this.currentStory?.paragraphs || !Array.isArray(this.currentStory.paragraphs)) {
            return '';
        }

        return html`
            <div class="structured-story">
                ${this.currentStory.paragraphs.map((paragraph, pIdx) => html`
                    <div class="paragraph" data-paragraph="${pIdx + 1}">
                        ${paragraph.sentences ? paragraph.sentences.map((sentenceObj, sIdx) => {
                            const sentence = typeof sentenceObj === 'string' ? sentenceObj : sentenceObj.sentence;
                            const phonicsWords = sentenceObj.phonicsWords || [];
                            return html`
                                <span class="sentence" data-sentence="${sIdx + 1}">
                                    ${sentence}
                                    ${phonicsWords.length > 0 ? html`
                                        <span class="phonics-highlight" title="Phonics words: ${phonicsWords.join(', ')}">
                                            ${phonicsWords.length}
                                        </span>
                                    ` : ''}
                                </span>
                            `;
                        }) : ''}
                    </div>
                `)}
            </div>
        `;
    }

    renderEducationalQuality() {
        if (!this.currentStory) return '';

        // Only show if we have pipeline data
        if (!this.currentStory.educationalAnalysis && !this.currentStory.finalReport) {
            return '';
        }

        const finalReport = this.currentStory.finalReport || {};
        const educationalAnalysis = this.currentStory.educationalAnalysis || {};

        return html`
        <div class="step5-complete-summary-section step5-complete-quality-section">
            <h3 title="Educational Quality Report">📊 Educational Quality Report</h3>
            
            ${this.renderQualityOverview(finalReport)}
            ${this.renderQualityScores(finalReport)}
            ${this.renderPhonicsAnalysis(educationalAnalysis)}
            ${this.renderGradeLevelAnalysis(educationalAnalysis)}
            ${this.renderEducationalRecommendations(finalReport, educationalAnalysis)}
        </div>
    `;
    }

    renderQualityOverview(finalReport) {
        const overallScore = finalReport.overallScore || 0;
        const overallAssessment = finalReport.overallAssessment || 'UNKNOWN';
        const meetsThreshold = finalReport.meetsThreshold || false;
        const readyForInstruction = finalReport.summary?.readyForInstruction || false;

        return html`
        <div class="quality-overview">
            <div class="quality-overall-score">
                <div class="score-circle ${this.getScoreClass(overallScore)}">
                    <span class="score-value">${Math.round(overallScore * 100)}</span>
                    <span class="score-suffix">%</span>
                </div>
                <div class="score-details">
                    <div class="score-assessment">${overallAssessment}</div>
                    <div class="score-status">
                        <span class="status-item ${meetsThreshold ? 'status-good' : 'status-warning'}">
                            ${meetsThreshold ? '✅' : '⚠️'} Quality Threshold
                        </span>
                        <span class="status-item ${readyForInstruction ? 'status-good' : 'status-warning'}">
                            ${readyForInstruction ? '✅' : '⚠️'} Classroom Ready
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
    }

    renderQualityScores(finalReport) {
        const qualityBreakdown = finalReport.qualityBreakdown || {};

        const scores = [
            {
                label: 'Developmental Appropriateness',
                value: qualityBreakdown.developmentalAppropriateness || 0,
                icon: '👶',
                description: 'Age and grade-level appropriateness'
            },
            {
                label: 'Phonics Integration',
                value: qualityBreakdown.phonicsIntegration || 0,
                icon: '🔤',
                description: 'Natural phonics pattern integration'
            },
            {
                label: 'Story Quality',
                value: qualityBreakdown.storyQuality || 0,
                icon: '📖',
                description: 'Narrative structure and engagement'
            },
            {
                label: 'Instructional Readiness',
                value: qualityBreakdown.instructionalReadiness || 0,
                icon: '🎓',
                description: 'Ready for classroom use'
            }
        ];

        return html`
        <div class="quality-scores">
            <h4>Educational Component Scores</h4>
            <div class="scores-grid">
                ${scores.map(score => html`
                    <div class="score-item">
                        <div class="score-header">
                            <span class="score-icon">${score.icon}</span>
                            <span class="score-label">${score.label}</span>
                        </div>
                        <div class="score-bar-container">
                            <div class="score-bar">
                                <div 
                                    class="score-fill ${this.getScoreClass(score.value)}" 
                                    style="width: ${Math.round(score.value * 100)}%"
                                ></div>
                            </div>
                            <span class="score-percentage">${Math.round(score.value * 100)}%</span>
                        </div>
                        <div class="score-description">${score.description}</div>
                    </div>
                `)}
            </div>
        </div>
    `;
    }

    renderPhonicsAnalysis(educationalAnalysis) {
        const phonics = educationalAnalysis.phonics || {};

        if (!phonics.pattern) return '';

        return html`
        <div class="phonics-analysis">
            <h4>🔤 Phonics Analysis</h4>
            <div class="phonics-details">
                <div class="phonics-item">
                    <span class="phonics-label">Target Pattern:</span>
                    <span class="phonics-value phonics-pattern">${phonics.pattern}</span>
                </div>
                <div class="phonics-item">
                    <span class="phonics-label">Words Found:</span>
                    <span class="phonics-value">${phonics.totalWords || 0}</span>
                </div>
                <div class="phonics-item">
                    <span class="phonics-label">Integration:</span>
                    <span class="phonics-value phonics-integration ${this.getIntegrationClass(phonics.integration)}">
                        ${phonics.integration || 'Unknown'}
                    </span>
                </div>
                ${phonics.wordsFound && phonics.wordsFound.length > 0 ? html`
                    <div class="phonics-words">
                        <span class="phonics-label">Phonics Words:</span>
                        <div class="phonics-word-list">
                            ${phonics.wordsFound.map(word => html`
                                <span class="phonics-word">${word}</span>
                            `)}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }

    renderGradeLevelAnalysis(educationalAnalysis) {
        const gradeLevel = educationalAnalysis.gradeLevel || {};

        return html`
        <div class="grade-level-analysis">
            <h4>📏 Grade Level Analysis</h4>
            <div class="grade-analysis-grid">
                ${gradeLevel.developmentalAlignment ? html`
                    <div class="analysis-item">
                        <span class="analysis-label">Developmental Alignment:</span>
                        <span class="analysis-value">${gradeLevel.developmentalAlignment}</span>
                    </div>
                ` : ''}
                ${gradeLevel.readabilityScore ? html`
                    <div class="analysis-item">
                        <span class="analysis-label">Readability Score:</span>
                        <span class="analysis-value">${gradeLevel.readabilityScore}</span>
                    </div>
                ` : ''}
                ${gradeLevel.sentenceComplexityIssues && gradeLevel.sentenceComplexityIssues.length > 0 ? html`
                    <div class="analysis-item">
                        <span class="analysis-label">Complexity Issues:</span>
                        <div class="analysis-list">
                            ${gradeLevel.sentenceComplexityIssues.map(issue => html`
                                <span class="analysis-issue">⚠️ ${issue}</span>
                            `)}
                        </div>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
    }

    renderEducationalRecommendations(finalReport, educationalAnalysis) {
        const recommendations = finalReport.recommendations || [];
        const criticalIssues = finalReport.criticalIssues || [];
        const educationalStrengths = finalReport.educationalStrengths || [];

        if (recommendations.length === 0 && criticalIssues.length === 0 && educationalStrengths.length === 0) {
            return '';
        }

        return html`
        <div class="educational-recommendations">
            <h4>💡 Educational Insights</h4>
            
            ${educationalStrengths.length > 0 ? html`
                <div class="insights-section strengths">
                    <h5>✅ Educational Strengths</h5>
                    <ul>
                        ${educationalStrengths.map(strength => html`
                            <li class="strength-item">${strength}</li>
                        `)}
                    </ul>
                </div>
            ` : ''}
            
            ${criticalIssues.length > 0 ? html`
                <div class="insights-section issues">
                    <h5>⚠️ Areas for Improvement</h5>
                    <ul>
                        ${criticalIssues.map(issue => html`
                            <li class="issue-item">${issue}</li>
                        `)}
                    </ul>
                </div>
            ` : ''}
            
            ${recommendations.length > 0 ? html`
                <div class="insights-section recommendations">
                    <h5>💡 Recommendations</h5>
                    <ul>
                        ${recommendations.map(rec => html`
                            <li class="recommendation-item">${rec}</li>
                        `)}
                    </ul>
                </div>
            ` : ''}
        </div>
    `;
    }

// Helper methods
    getScoreClass(score) {
        if (score >= 0.85) return 'score-excellent';
        if (score >= 0.75) return 'score-good';
        if (score >= 0.65) return 'score-acceptable';
        return 'score-needs-improvement';
    }

    getIntegrationClass(integration) {
        switch(integration?.toLowerCase()) {
            case 'natural': return 'integration-natural';
            case 'forced': return 'integration-forced';
            case 'insufficient': return 'integration-insufficient';
            default: return 'integration-unknown';
        }
    }

    render() {
        return html`
            <div class="step1-container">
                <h2>Step 1: Story Requirements</h2>
                ${this.renderFormFields()}
                ${this.renderStoryPreview()}
                ${this.renderEducationalQuality()}
            </div>
        `;
    }
}

customElements.define('step1-topic', Step1Topic);
