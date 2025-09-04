// UIStatusAdapter.js - Lightweight status message adapter for UI updates

/**
 * Lightweight status adapter that updates UI status messages during pipeline execution
 * No analytics, metrics, or logging - just real-time status updates for the user
 */
export class StoryGenerationStatusAdapter {
    constructor(statusUpdateCallback) {
        this.statusUpdateCallback = statusUpdateCallback;
    }

    /**
     * Handle pipeline events and update UI status
     * @param {Object} event - Event data from pipeline
     */
    onEvent(event) {
        if (!this.statusUpdateCallback) return;

        let statusMessage = '';

        switch (event.name) {
            case 'story-generation':
                if (event.ok) {
                    statusMessage = `✨ Generated story: "${event.meta?.title || 'Untitled'}"`;
                } else {
                    statusMessage = '⚠️ Story generation encountered an issue...';
                }
                break;

            case 'story-evaluation':
                statusMessage = `📋 Evaluating story quality... (Pass ${event.pass})`;
                if (event.ok && event.meta?.overallScore) {
                    const score = Math.round(event.meta.overallScore * 100);
                    statusMessage = `📊 Quality Score: ${score}% - ${event.meta.meetsStandards ? 'Standards Met' : 'Needs Improvement'}`;
                }
                break;

            case 'targeted-revisions':
                const revisionNum = event.pass - 2;
                if (event.meta?.criticalRevisions > 0) {
                    statusMessage = `🔧 Applying revisions (Round ${revisionNum})...`;
                } else {
                    statusMessage = `✅ Revisions completed (Round ${revisionNum})`;
                }
                break;

            case 'phonics-analysis':
                statusMessage = '🔤 Analyzing phonics patterns...';
                if (event.ok && event.meta?.phonicsTarget) {
                    statusMessage = `🎯 Validated phonics: ${event.meta.phonicsTarget}`;
                }
                break;

            case 'grade-validation':
                statusMessage = '📚 Validating grade-level appropriateness...';
                if (event.ok) {
                    statusMessage = `✓ Grade validation complete`;
                }
                break;

            default:
                // Generic event handling for any other pipeline events
                if (event.name && event.pass) {
                    const eventName = event.name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    statusMessage = `⚙️ ${eventName} (Step ${event.pass})...`;
                }
        }

        // Update the UI status if we have a meaningful message
        if (statusMessage) {
            this.statusUpdateCallback(statusMessage);
        }
    }
}
