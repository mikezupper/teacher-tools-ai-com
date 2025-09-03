// api/generateStory.js - Updated to support AbortController
import { runPipeline } from "../story-gen-pipeline/index.js";
import {extractStoryContent} from "./util.js";

/**
 * Generate educational story using the robust pipeline
 * @param {Object} storyData - Form data from UI
 * @param {AbortSignal} signal - AbortController signal for cancellation
 * @returns {Object} - Pipeline story result adapted for UI
 */
export const generateStory = async (storyData, signal) => {
    console.log('Generating story with pipeline approach:', storyData);

    // Map form parameters to pipeline input format
    const inputParams = {
        theme: storyData.theme,           // topic -> theme
        genre: storyData.genre,
        phonicSkill: storyData.phonicSkill, // skill -> phonicSkill
        length: storyData.length,
        gradeLevel: storyData.gradeLevel
    };

    // Pipeline options for educational quality - INCLUDE SIGNAL
    const options = {
        qualityThreshold: 0.75,
        maxRevisionCycles: 2,
        strictPhonics: true,
        educationalFocus: true,
        signal // Pass the abort signal to the pipeline
    };

    try {
        // Use the robust pipeline to generate story
        const pipelineResult = await runPipeline(inputParams, options);

        // Extract story content from structured format for questions/prompts/images
        const storyContent = extractStoryContent(pipelineResult);

        // Return adapted format that UI expects
        return {
            // Pipeline data (structured)
            title: pipelineResult.title,
            paragraphs: pipelineResult.paragraphs,
            educationalAnalysis: pipelineResult.educationalAnalysis,
            finalReport: pipelineResult.finalReport,

            // Legacy format for questions/prompts/images
            story: storyContent,              // Plain text content
            storyMarkdown: pipelineResult.storyMarkdown || storyContent,

            // Preserve original parameters with new names
            theme: inputParams.theme,
            genre: inputParams.genre,
            phonicSkill: inputParams.phonicSkill,
            length: inputParams.length,
            gradeLevel: inputParams.gradeLevel,

            // Additional pipeline metadata
            pipelineGenerated: true,
            generatedAt: new Date().toISOString()
        };

    } catch (error) {
        console.error('Pipeline story generation failed:', error);

        // Re-throw AbortError to maintain cancellation behavior
        if (error.name === 'AbortError') {
            throw error;
        }

        throw new Error(`Story generation failed: ${error.message}`);
    }
};
