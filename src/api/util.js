
/**
 * Extract plain text story content from structured pipeline format
 * @param {Object} pipelineStory - Structured story from pipeline
 * @returns {string} - Plain text story content
 */
export function extractStoryContent(pipelineStory) {
    if (!pipelineStory.paragraphs || !Array.isArray(pipelineStory.paragraphs)) {
        return '';
    }

    const paragraphTexts = pipelineStory.paragraphs.map(paragraph => {
        if (!paragraph.sentences || !Array.isArray(paragraph.sentences)) {
            return '';
        }

        const sentences = paragraph.sentences.map(sentenceObj => {
            // Handle both string and object formats
            return typeof sentenceObj === 'string' ? sentenceObj : sentenceObj.sentence;
        }).filter(Boolean);

        return sentences.join(' ');
    }).filter(Boolean);

    return paragraphTexts.join('\n\n');
}
