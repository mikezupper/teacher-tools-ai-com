// index.js - REVISED: Simplified main entry point leveraging LLM intelligence

import { runPipelineCore } from "./pipeline.js";
import { ConsoleAnalytics } from "./analytics.js";
import { analyzePhonicsInStory } from "./phonicsUtils.js";
import { validateStoryGradeLevel } from "./gradeConstraints.js";

/**
 * Main pipeline function - simplified to focus on educational effectiveness
 * @param {Object} input - Story generation parameters
 * @param {Object} options - Pipeline options
 * @returns {Object} - Complete story with educational analysis
 */
export async function runPipeline(input, options = {}) {
    // Set educational-focused defaults
    const enhancedOptions = {
        analytics: options.analytics ?? new ConsoleAnalytics(),
        qualityThreshold: options.qualityThreshold ?? 0.75, // Realistic threshold based on research
        maxRevisionCycles: options.maxRevisionCycles ?? 2,   // Focused revisions
        strictPhonics: options.strictPhonics ?? true,        // Enforce phonics requirements
        educationalFocus: true,                              // New flag for education-first approach
        ...options
    };

    // Validate input parameters
    const validationResult = validateInputParameters(input);
    if (!validationResult.isValid) {
        throw new Error(`Invalid input: ${validationResult.errors.join(', ')}`);
    }

    console.log(`Starting educational story pipeline for ${getGradeDisplay(input.gradeLevel)}...`);
    console.log(`Target: ${input.phonicSkill} | Theme: ${input.theme} | Length: ${input.length} sentences`);

    try {
        // Run the core educational pipeline
        const story = await runPipelineCore(input, enhancedOptions);

        // Add comprehensive educational analysis
        const educationalAnalysis = await performEducationalAnalysis(story, input);
        story.educationalAnalysis = educationalAnalysis;

        // Generate final report
        const finalReport = generateEducationalReport(story, input, enhancedOptions);
        story.finalReport = finalReport;

        console.log(`\nPipeline completed: ${finalReport.overallAssessment}`);
        return story;

    } catch (error) {
        console.error(`Pipeline failed: ${error.message}`);
        throw error;
    }
}

/**
 * Validate input parameters for educational appropriateness
 * @param {Object} input - Input parameters to validate
 * @returns {Object} - Validation result
 */
function validateInputParameters(input) {
    const errors = [];

    // Required fields
    // if (!input.genre) errors.push('Genre is required');
    if (!input.theme) errors.push('Theme is required');
    // if (!input.phonicSkill) errors.push('Phonics skill is required');
    // if (typeof input.gradeLevel === 'undefined') errors.push('Grade level is required');
    // if (!input.length || input.length < 3) errors.push('Story length must be at least 3 sentences');

    // Grade level validation
    // const validGrades = ['K', 0, 1, 2, 3, 4, 5, 6];
    // if (!validGrades.includes(input.gradeLevel)) {
    //     errors.push('Grade level must be K, 0, 1, 2, 3, 4, 5, or 6');
    // }

    // Length validation by grade (research-based)
    // const maxLengthByGrade = {
    //     'K': 4, 0: 4, 1: 5, 2: 6, 3: 8, 4: 10, 5: 12, 6: 15
    // };
    // const maxLength = maxLengthByGrade[input.gradeLevel] || 8;
    // if (input.length > maxLength) {
    //     errors.push(`Story length (${input.length}) exceeds research-based maximum for grade ${input.gradeLevel} (${maxLength})`);
    // }

    // Phonics skill validation
    // if (!input.phonicSkill.trim()) {
    //     errors.push('Phonics skill cannot be empty');
    // }

    return {
        isValid: errors.length === 0,
        errors
    };
}

/**
 * Perform comprehensive educational analysis of the completed story
 * @param {Object} story - Generated story
 * @param {Object} input - Original input parameters
 * @returns {Object} - Educational analysis results
 */
async function performEducationalAnalysis(story, input) {
    console.log('Performing educational analysis...');

    // Phonics analysis
    const phonicsAnalysis = analyzePhonicsInStory(story, input.phonicSkill);

    // Grade-level validation
    const gradeLevelValidation = validateStoryGradeLevel(story, input.gradeLevel);

    // Extract key metrics from LLM evaluation
    const llmEvaluation = story.pipeline?.finalEvaluation || {};

    // Combine analyses for comprehensive view
    const comprehensiveAnalysis = {
        phonics: {
            pattern: llmEvaluation.phonicsAnalysis?.targetPattern || phonicsAnalysis.pattern,
            totalWords: llmEvaluation.phonicsAnalysis?.wordCount || phonicsAnalysis.totalWords,
            uniqueWords: llmEvaluation.phonicsAnalysis?.wordsFound || phonicsAnalysis.uniqueWords,
            integration: llmEvaluation.phonicsAnalysis?.integration || phonicsAnalysis.integration,
            meetsRequirements: (llmEvaluation.phonicsAnalysis?.wordCount || phonicsAnalysis.totalWords) >= 3,
            effectiveness: llmEvaluation.phonicsAnalysis?.integration || phonicsAnalysis.integration,
            educationalValue: llmEvaluation.phonicsAnalysis?.educationalEffectiveness || 'unknown'
        },
        gradeLevel: {
            ...gradeLevelValidation,
            developmentalAlignment: assessDevelopmentalAlignment(gradeLevelValidation, input.gradeLevel),
            readabilityScore: calculateReadabilityScore(story, input.gradeLevel)
        },
        instructional: {
            classroomReady: assessClassroomReadiness(story, llmEvaluation, input),
            teacherNotes: generateTeacherNotes(story, input),
            extensionActivities: suggestExtensionActivities(story, input)
        },
        overall: {
            educationalEffectiveness: llmEvaluation.overallEducationalScore || 0,
            recommendedUse: determineRecommendedUse(story, input, llmEvaluation),
            strengthsAndConcerns: extractStrengthsAndConcerns(llmEvaluation)
        }
    };

    return comprehensiveAnalysis;
}

/**
 * Generate a comprehensive educational report
 * @param {Object} story - Complete story with analysis
 * @param {Object} input - Original input parameters
 * @param {Object} options - Pipeline options
 * @returns {Object} - Educational report
 */
function generateEducationalReport(story, input, options) {
    const analysis = story.educationalAnalysis;
    const evaluation = story.pipeline?.finalEvaluation || {};

    const overallScore = evaluation.overallScore || evaluation.overallEducationalScore || 0;
    const meetsThreshold = overallScore >= options.qualityThreshold;

    // DECLARE overallAssessment BEFORE using it
    let overallAssessment = 'NEEDS IMPROVEMENT';
    if (overallScore >= 0.85) overallAssessment = 'EXCELLENT';
    else if (overallScore >= 0.75) overallAssessment = 'GOOD';
    else if (overallScore >= 0.65) overallAssessment = 'ACCEPTABLE';

    const report = {
        overallAssessment, // Now this variable exists
        overallScore: Math.round(overallScore * 1000) / 1000,
        meetsThreshold,
        gradeLevel: input.gradeLevel,
        summary: {
            totalSentences: getTotalSentenceCount(story),
            phonicsWords: analysis?.phonics?.totalWords || 0,
            phonicsPattern: analysis?.phonics?.pattern || 'unknown',
            readyForInstruction: overallScore >= options.qualityThreshold
        },
        educationalStrengths: evaluation.educationalStrengths || [],
        criticalIssues: evaluation.criticalIssues || [],
        recommendations: evaluation.improvementPriorities || [],
        teacherGuidance: analysis?.instructional?.teacherNotes || '',
        qualityBreakdown: {
            developmentalAppropriateness: evaluation.gradeAppropriateScore || 0,
            phonicsIntegration: evaluation.phonicsScore || 0,
            storyQuality: evaluation.storyQualityScore || 0,
            instructionalReadiness: evaluation.overallScore || 0
        }
    };

    return report;
}
// Utility functions for educational analysis
function calculatePhonicsEducationalValue(phonicsAnalysis, gradeLevel) {
    if (!phonicsAnalysis || phonicsAnalysis.totalWords < 2) return 'insufficient';
    if (phonicsAnalysis.totalWords >= 4 && phonicsAnalysis.integration === 'natural') return 'excellent';
    if (phonicsAnalysis.totalWords >= 3 && phonicsAnalysis.integration !== 'forced') return 'good';
    return 'adequate';
}

function assessDevelopmentalAlignment(gradeLevelValidation, gradeLevel) {
    if (!gradeLevelValidation) return 'unknown';
    if (gradeLevelValidation.isValid) return 'appropriate';

    const issueCount = gradeLevelValidation.issues?.length || 0;
    if (issueCount <= 2) return 'mostly appropriate';
    if (issueCount <= 5) return 'some concerns';
    return 'inappropriate';
}

function calculateReadabilityScore(story, gradeLevel) {
    // Simple readability estimation based on sentence and word complexity
    let totalWords = 0;
    let totalSentences = 0;
    let complexWords = 0;

    story.paragraphs?.forEach(paragraph => {
        paragraph.sentences?.forEach(sentenceObj => {
            totalSentences++;
            const words = sentenceObj.sentence.split(/\s+/).filter(w => w.length > 0);
            totalWords += words.length;

            // Count words with 3+ syllables as complex (rough estimation)
            complexWords += words.filter(word => estimateSyllables(word) >= 3).length;
        });
    });

    const avgWordsPerSentence = totalSentences > 0 ? totalWords / totalSentences : 0;
    const complexWordRatio = totalWords > 0 ? complexWords / totalWords : 0;

    // Simple readability score (lower is easier)
    const readabilityScore = avgWordsPerSentence + (complexWordRatio * 100);

    return Math.round(readabilityScore * 10) / 10;
}

function assessClassroomReadiness(story, evaluation, input) {
    if (!evaluation) return false;

    return evaluation.readyForInstruction === true ||
        (evaluation.meetsEducationalStandards &&
            evaluation.overallEducationalScore >= 0.7);
}

function generateTeacherNotes(story, input) {
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    return `This story is designed for ${gradeDisplay} phonics instruction focusing on "${input.phonicSkill}". ` +
        `Use for guided reading, independent practice, or phonics reinforcement. ` +
        `Encourage students to identify and discuss the target phonics pattern throughout the story.`;
}

function suggestExtensionActivities(story, input) {
    return [
        `Have students find and circle all words with the ${input.phonicSkill} pattern`,
        `Ask students to draw their favorite scene from the story`,
        `Discuss the story's theme: ${input.theme}`,
        `Create new sentences using the same phonics pattern`,
        `Act out the story with classmates`
    ];
}

function determineRecommendedUse(story, input, evaluation) {
    if (!evaluation || evaluation.overallEducationalScore < 0.65) {
        return 'Needs revision before classroom use';
    }

    if (evaluation.overallEducationalScore >= 0.85) {
        return 'Excellent for independent and guided reading';
    }

    if (evaluation.overallEducationalScore >= 0.75) {
        return 'Good for guided reading with teacher support';
    }

    return 'Suitable for phonics practice with modifications';
}

function extractStrengthsAndConcerns(evaluation) {
    return {
        strengths: evaluation.educationalStrengths || evaluation.instructionalStrengths || [],
        concerns: evaluation.criticalIssues || evaluation.pedagogicalConcerns || []
    };
}

function getTotalSentenceCount(story) {
    if (!story.paragraphs) return 0;
    return story.paragraphs.reduce((total, paragraph) =>
        total + (paragraph.sentences?.length || 0), 0);
}

function getGradeDisplay(gradeLevel) {
    if (gradeLevel === 0 || gradeLevel === 'K') return 'Kindergarten';
    return `Grade ${gradeLevel}`;
}

// Simple syllable estimation (from gradeConstraints.js)
function estimateSyllables(word) {
    if (word.length <= 3) return 1;

    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length === 0) return 1;

    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
        const isVowel = 'aeiouy'.includes(word[i]);
        if (isVowel && !previousWasVowel) {
            syllables++;
        }
        previousWasVowel = isVowel;
    }

    if (word.endsWith('e') && syllables > 1) {
        syllables--;
    }

    if (word.endsWith('le') && word.length > 2 && !'aeiou'.includes(word[word.length - 3])) {
        syllables++;
    }

    return Math.max(1, syllables);
}
