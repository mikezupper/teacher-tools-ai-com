/**
 * Status adapter for image generation process
 * Shows detailed status messages during image creation
 */
export class ImageGenerationStatusAdapter {
    constructor(statusUpdateCallback) {
        this.statusUpdateCallback = statusUpdateCallback;
    }

    /**
     * Update status during different phases of image generation
     * @param {string} phase - Generation phase
     * @param {Object} meta - Optional metadata
     */
    updateStatus(phase, meta = {}) {
        if (!this.statusUpdateCallback) return;

        let statusMessage = '';

        switch (phase) {
            case 'preparing':
                statusMessage = '🎨 Preparing image generation...';
                break;
            case 'analyzing':
                statusMessage = '📖 Analyzing story content...';
                break;
            case 'generating':
                statusMessage = '🖼️ Creating your illustration...';
                break;
            case 'processing':
                statusMessage = '⚙️ Processing generated image...';
                break;
            case 'optimizing':
                statusMessage = '✨ Optimizing image quality...';
                break;
            case 'saving':
                statusMessage = '💾 Saving your image...';
                break;
            case 'complete':
                statusMessage = '✅ Image generation complete!';
                break;
            case 'error':
                statusMessage = '❌ Image generation encountered an issue...';
                break;
            default:
                statusMessage = `🔄 ${phase}...`;
        }

        this.statusUpdateCallback(statusMessage);
    }
}
