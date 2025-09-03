// analytics.js - REVISED: Simplified analytics focused on educational pipeline tracking

/**
 * Console-based analytics for educational story pipeline
 * Tracks key educational metrics and pipeline performance
 */
export class ConsoleAnalytics {
    constructor() {
        this.startTime = performance.now();
        this.events = [];
        this.educationalMetrics = {
            storiesGenerated: 0,
            revisionCycles: 0,
            phonicsIntegrations: 0,
            gradeLevelValidations: 0,
            educationalAssessments: 0
        };
    }

    /**
     * Track an educational pipeline event
     * @param {Object} event - Event data
     */
    onEvent(event) {
        this.events.push({
            ...event,
            timestamp: performance.now() - this.startTime
        });

        // Track educational-specific metrics
        this.updateEducationalMetrics(event);

        // Display event with educational context
        this.displayEvent(event);
    }

    /**
     * Update educational metrics based on event
     * @param {Object} event - Event data
     */
    updateEducationalMetrics(event) {
        switch (event.name) {
            case 'story-generation':
                if (event.ok) this.educationalMetrics.storiesGenerated++;
                break;
            case 'story-evaluation':
                if (event.ok) this.educationalMetrics.educationalAssessments++;
                break;
            case 'targeted-revisions':
                if (event.ok) this.educationalMetrics.revisionCycles++;
                break;
            case 'phonics-analysis':
                if (event.ok) this.educationalMetrics.phonicsIntegrations++;
                break;
            case 'grade-validation':
                if (event.ok) this.educationalMetrics.gradeLevelValidations++;
                break;
        }
    }

    /**
     * Display event with educational focus
     * @param {Object} event - Event data
     */
    displayEvent(event) {
        const status = event.ok ? '✓' : '✗';
        const duration = event.durationMs.toFixed(1);

        // Educational-focused logging
        switch (event.name) {
            case 'story-generation':
                console.log(`${status} [${event.pass}] Generated educational story in ${duration}ms`);
                if (event.meta?.title) {
                    console.log(`    Title: "${event.meta.title}"`);
                }
                if (event.meta?.phonicsTarget) {
                    console.log(`    Phonics: ${event.meta.phonicsTarget}`);
                }
                if (event.meta?.sentences) {
                    console.log(`    Length: ${event.meta.sentences} sentences`);
                }
                break;

            case 'story-evaluation':
                console.log(`${status} [${event.pass}] Educational assessment in ${duration}ms`);
                if (event.meta?.overallScore) {
                    console.log(`    Score: ${event.meta.overallScore.toFixed(3)}`);
                }
                if (event.meta?.meetsStandards !== undefined) {
                    console.log(`    Standards: ${event.meta.meetsStandards ? 'Met' : 'Needs work'}`);
                }
                if (event.meta?.criticalIssues !== undefined) {
                    console.log(`    Issues: ${event.meta.criticalIssues} critical`);
                }
                break;

            case 'targeted-revisions':
                console.log(`${status} [${event.pass}] Educational revisions in ${duration}ms`);
                if (event.meta?.criticalRevisions !== undefined) {
                    console.log(`    Critical revisions: ${event.meta.criticalRevisions}`);
                }
                if (event.meta?.revisionsApplied !== undefined) {
                    console.log(`    Applied: ${event.meta.revisionsApplied}`);
                }
                break;

            default:
                // Generic event display
                console.log(`${status} [${event.pass}] ${event.name} in ${duration}ms`);
                if (event.meta && Object.keys(event.meta).length > 0) {
                    const metaStr = Object.entries(event.meta)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ');
                    console.log(`    ${metaStr}`);
                }
        }
    }

    /**
     * Generate educational pipeline summary
     * @returns {Object} - Summary of educational metrics
     */
    getEducationalSummary() {
        const totalTime = performance.now() - this.startTime;
        const successfulEvents = this.events.filter(e => e.ok).length;
        const failedEvents = this.events.filter(e => !e.ok).length;

        return {
            pipelineMetrics: {
                totalTimeMs: Math.round(totalTime),
                totalEvents: this.events.length,
                successfulEvents,
                failedEvents,
                successRate: this.events.length > 0 ? Math.round((successfulEvents / this.events.length) * 100) : 0
            },
            educationalMetrics: { ...this.educationalMetrics },
            performance: {
                avgEventTime: this.events.length > 0
                    ? Math.round(this.events.reduce((sum, e) => sum + e.durationMs, 0) / this.events.length)
                    : 0,
                slowestEvent: this.events.length > 0
                    ? Math.max(...this.events.map(e => e.durationMs))
                    : 0,
                fastestEvent: this.events.length > 0
                    ? Math.min(...this.events.map(e => e.durationMs))
                    : 0
            }
        };
    }

    /**
     * Display educational pipeline summary
     */
    displaySummary() {
        const summary = this.getEducationalSummary();

        console.log('\nEducational Pipeline Summary:');
        console.log(`  Total Time: ${summary.pipelineMetrics.totalTimeMs}ms`);
        console.log(`  Success Rate: ${summary.pipelineMetrics.successRate}%`);
        console.log(`  Stories Generated: ${summary.educationalMetrics.storiesGenerated}`);
        console.log(`  Revision Cycles: ${summary.educationalMetrics.revisionCycles}`);
        console.log(`  Educational Assessments: ${summary.educationalMetrics.educationalAssessments}`);

        if (summary.performance.avgEventTime > 0) {
            console.log(`  Avg Event Time: ${summary.performance.avgEventTime}ms`);
        }
    }
}

/**
 * Create a timing wrapper for educational pipeline events
 * @param {string} name - Event name
 * @param {number} pass - Pipeline pass number
 * @param {Object} sink - Analytics sink (optional)
 * @returns {Object} - Timing object with end function
 */
export function withTiming(name, pass, sink) {
    const start = performance.now();

    return {
        end(ok, meta = {}) {
            const durationMs = performance.now() - start;

            if (sink && typeof sink.onEvent === 'function') {
                sink.onEvent({
                    name,
                    pass,
                    ok: ok !== false, // Default to true if not explicitly false
                    durationMs,
                    meta
                });
            }
        }
    };
}

/**
 * Specialized analytics for educational content creation
 * Tracks content quality and educational effectiveness
 */
export class EducationalAnalytics extends ConsoleAnalytics {
    constructor() {
        super();
        this.contentMetrics = {
            totalSentences: 0,
            totalPhonicsWords: 0,
            averageWordLength: 0,
            gradeAppropriateStories: 0,
            phonicsSuccessRate: 0
        };
    }

    /**
     * Track educational content metrics
     * @param {Object} story - Generated story
     * @param {Object} evaluation - Story evaluation
     */
    trackStoryMetrics(story, evaluation) {
        if (!story || !evaluation) return;

        // Count sentences
        const sentenceCount = this.countSentences(story);
        this.contentMetrics.totalSentences += sentenceCount;

        // Track phonics words
        if (evaluation.phonicsAssessment?.totalCount) {
            this.contentMetrics.totalPhonicsWords += evaluation.phonicsAssessment.totalCount;
        }

        // Track grade appropriateness
        if (evaluation.meetsEducationalStandards) {
            this.contentMetrics.gradeAppropriateStories++;
        }

        // Calculate phonics success rate
        const phonicsEffective = evaluation.phonicsAssessment?.naturalness === 'natural';
        if (phonicsEffective) {
            this.contentMetrics.phonicsSuccessRate =
                ((this.contentMetrics.phonicsSuccessRate * (this.educationalMetrics.storiesGenerated - 1)) + 1)
                / this.educationalMetrics.storiesGenerated;
        }

        console.log(`Educational Content Tracked: ${sentenceCount} sentences, phonics effectiveness: ${phonicsEffective ? 'good' : 'needs work'}`);
    }

    /**
     * Count sentences in a story
     * @param {Object} story - Story object
     * @returns {number} - Total sentence count
     */
    countSentences(story) {
        if (!story.paragraphs) return 0;

        return story.paragraphs.reduce((total, paragraph) => {
            return total + (paragraph.sentences?.length || 0);
        }, 0);
    }

    /**
     * Get comprehensive educational summary
     * @returns {Object} - Educational summary with content metrics
     */
    getEducationalSummary() {
        const baseSummary = super.getEducationalSummary();

        return {
            ...baseSummary,
            contentMetrics: { ...this.contentMetrics },
            educationalEffectiveness: {
                averageSentencesPerStory: this.educationalMetrics.storiesGenerated > 0
                    ? Math.round(this.contentMetrics.totalSentences / this.educationalMetrics.storiesGenerated)
                    : 0,
                averagePhonicsWordsPerStory: this.educationalMetrics.storiesGenerated > 0
                    ? Math.round(this.contentMetrics.totalPhonicsWords / this.educationalMetrics.storiesGenerated)
                    : 0,
                gradeAppropriateRate: this.educationalMetrics.storiesGenerated > 0
                    ? Math.round((this.contentMetrics.gradeAppropriateStories / this.educationalMetrics.storiesGenerated) * 100)
                    : 0,
                phonicsSuccessRate: Math.round(this.contentMetrics.phonicsSuccessRate * 100)
            }
        };
    }

    /**
     * Display enhanced educational summary
     */
    displaySummary() {
        super.displaySummary();

        const summary = this.getEducationalSummary();

        console.log('\nEducational Effectiveness:');
        console.log(`  Grade Appropriate Rate: ${summary.educationalEffectiveness.gradeAppropriateRate}%`);
        console.log(`  Phonics Success Rate: ${summary.educationalEffectiveness.phonicsSuccessRate}%`);
        console.log(`  Avg Sentences/Story: ${summary.educationalEffectiveness.averageSentencesPerStory}`);
        console.log(`  Avg Phonics Words/Story: ${summary.educationalEffectiveness.averagePhonicsWordsPerStory}`);
    }
}

/**
 * Simple timing utility for quick measurements
 * @param {Function} fn - Function to time
 * @param {string} label - Label for timing
 * @returns {*} - Function result
 */
export async function timeFunction(fn, label = 'Function') {
    const start = performance.now();

    try {
        const result = await fn();
        const duration = performance.now() - start;
        console.log(`${label} completed in ${duration.toFixed(1)}ms`);
        return result;
    } catch (error) {
        const duration = performance.now() - start;
        console.log(`${label} failed after ${duration.toFixed(1)}ms: ${error.message}`);
        throw error;
    }
}

/**
 * Create a simple performance logger
 * @param {string} context - Context name
 * @returns {Function} - Logger function
 */
export function createPerformanceLogger(context) {
    const logs = [];

    return {
        log: (event, duration, details = {}) => {
            logs.push({ event, duration, details, timestamp: Date.now() });
            console.log(`[${context}] ${event}: ${duration.toFixed(1)}ms`, details);
        },

        summary: () => {
            if (logs.length === 0) return;

            const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0);
            const avgDuration = totalDuration / logs.length;

            console.log(`\n[${context}] Performance Summary:`);
            console.log(`  Total Events: ${logs.length}`);
            console.log(`  Total Time: ${totalDuration.toFixed(1)}ms`);
            console.log(`  Average Time: ${avgDuration.toFixed(1)}ms`);

            // Show top 3 slowest events
            const slowest = [...logs].sort((a, b) => b.duration - a.duration).slice(0, 3);
            if (slowest.length > 0) {
                console.log('  Slowest Events:');
                slowest.forEach((log, i) => {
                    console.log(`    ${i + 1}. ${log.event}: ${log.duration.toFixed(1)}ms`);
                });
            }
        },

        getLogs: () => [...logs]
    };
}
