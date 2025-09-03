// randomizer.js - Creative LLM Generation with Research-Based Grade Constraints

import { chatJson } from "./aiClient.js";
import { getGradeConstraints } from "./gradeConstraints.js";

/**
 * Generate completely creative story parameters using LLM with proper grade-level constraints
 * NO hard-coded fallbacks, but WITH educational research requirements
 * @param {Object} options - Randomization options
 * @returns {Object} - Generated input parameters
 */
export async function generateRandomStoryInput(options = {}) {
    const {
        gradeLevel = randomChoice([0, 1, 2, 3, 4, 5, 6]),
        signal = null
    } = options;

    console.log('🎯 generateRandomStoryInput called - CREATIVE with GRADE CONSTRAINTS');
    console.log('🎯 Grade Level:', gradeLevel);
    console.log('🎯 Signal received:', signal);
    console.log('🎯 Signal aborted status:', signal?.aborted);

    try {
        console.log('🎯 Calling LLM for creative generation with grade constraints...');
        const generatedParams = await chatJson(
            messagesForRandomStoryGeneration(gradeLevel, options),
            {
                temperature: 0.9, // High creativity while maintaining educational focus
                signal,
                maxTokens: 4096
            }
        );
        console.log('🎯 LLM generated creative params:', generatedParams);

        // Minimal validation - only ensure essential structure
        const finalParams = {
            ...generatedParams,
            gradeLevel: gradeLevel
        };

        console.log('🎯 Returning creative params with grade constraints:', finalParams);
        return finalParams;

    } catch (error) {
        console.log('🎯 Creative generation error:', error.name, error.message);

        if (error.name === 'AbortError') {
            console.log('🎯 Re-throwing AbortError');
            throw error;
        }

        // NO FALLBACKS - if LLM fails, the system fails
        throw new Error(`Creative generation failed: ${error.message}. Pure LLM creativity required!`);
    }
}

/**
 * Create messages for creative story parameter generation WITH grade-level constraints
 * Balances pure creativity with educational research requirements
 */
function messagesForRandomStoryGeneration(gradeLevel, options) {
    const gradeDisplay = getGradeDisplay(gradeLevel);
    const constraints = getGradeConstraints(gradeLevel);

    const sys = `You are a wildly creative educational content specialist who generates completely original story concepts while respecting research-based grade-level constraints from CCSS and Lexile frameworks. You never repeat ideas and always create surprising, delightful concepts that are developmentally appropriate.`;

    const user = `Generate a completely ORIGINAL and CREATIVE story concept for ${gradeDisplay} students that follows educational research requirements.

BE WILDLY CREATIVE while respecting ${gradeDisplay} developmental needs!

CREATIVE FREEDOM - Invent something amazing:
• Create a completely unique theme that kids have NEVER encountered before
• Design an unexpected genre that would fascinate young readers
• Choose a phonics skill that fits naturally into your creative concept
• Set a story length that perfectly serves your unique idea

EDUCATIONAL RESEARCH REQUIREMENTS for ${gradeDisplay}:
• Sentence complexity: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words per sentence
• Syllable limit: Maximum ${constraints.maxSyllablesPerWord} syllables per word
• Vocabulary tier: ${constraints.vocabularyTier}
• Sentence structures: Use ${constraints.allowedStructures.join(', ')}
• AVOID: ${constraints.forbiddenStructures.join(', ')}
• Lexile range: ${constraints.lexileRange}
• Developmental focus: ${getKeyFocusForGrade(gradeLevel)}

CREATIVE INSPIRATION (but don't copy these - create something NEW):
• What if ordinary objects had secret magical purposes?
• What adventures could happen in places kids know well?
• What if animals had unusual jobs or hobbies?
• What mysteries could kids solve that adults miss?
• What if everyday activities became extraordinary?

PHONICS CREATIVITY:
• Choose a phonics skill that would NATURALLY appear in your story concept
• Make it feel organic to the plot, not forced
• Consider what sounds would fit your theme and characters

STORY LENGTH DECISION:
• Pick the perfect length (4-15 sentences) for YOUR specific concept
• Consider ${gradeDisplay} attention span and comprehension abilities
• Make it long enough to be engaging, short enough to maintain focus

YOUR TASK: Create something that would make both kids and teachers say "Wow, I've never read a story like this before!" while meeting all ${gradeDisplay} educational requirements.

Return ONLY valid JSON in exactly this format:
{
  "theme": "Your completely original, creative theme that's never been done before",
  "genre": "A unique genre that perfectly matches your creative theme",
  "phonicSkill": "A specific phonics skill that naturally fits your story concept",
  "length": [number between 4-15 that serves your story perfectly]
}

Remember: Be MAXIMALLY CREATIVE within educational boundaries. Surprise everyone!`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

/**
 * Generate multiple creative story options for selection
 * Each will be completely unique while respecting grade constraints
 */
export async function generateStoryOptions(gradeLevel, count = 3, options = {}) {
    console.log(`🎨 Generating ${count} CREATIVE story options for Grade ${gradeLevel} with research constraints...`);

    const storyOptions = [];
    const errors = [];

    for (let i = 0; i < count; i++) {
        try {
            const storyOption = await generateRandomStoryInput({
                gradeLevel,
                ...options
            });
            storyOptions.push({
                ...storyOption,
                optionNumber: i + 1
            });

            // Add delay to ensure variety and avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            errors.push(error);
            console.warn(`⚠️ Failed to generate creative option ${i + 1}: ${error.message}`);
        }
    }

    if (storyOptions.length === 0) {
        throw new Error(`Failed to generate any creative story options. Errors: ${errors.map(e => e.message).join(', ')}`);
    }

    console.log(`🎨 Successfully generated ${storyOptions.length} creative, grade-appropriate story options!`);
    return storyOptions;
}

/**
 * Get the key educational focus for a grade level (from research constraints)
 */
function getKeyFocusForGrade(gradeLevel) {
    const grade = normalizeGradeLevel(gradeLevel);
    const focuses = {
        'K': 'Basic phonics, sight words, simple sentence structure',
        '1': 'Phonics patterns, high-frequency words, basic fluency',
        '2': 'Compound words, beginning academic vocabulary, sentence variety',
        '3': 'Academic vocabulary, complex sentences, reading comprehension',
        '4': 'Multisyllabic words, advanced sentence structures, content reading',
        '5': 'Abstract concepts, complex text structures, critical thinking',
        '6': 'Sophisticated vocabulary, varied syntax, analytical reading'
    };
    return focuses[grade] || 'General literacy development';
}

/**
 * Utility function to get grade display name
 */
function getGradeDisplay(gradeLevel) {
    if (gradeLevel === 0 || gradeLevel === 'K' || gradeLevel === 'k') {
        return 'Kindergarten';
    }
    return `Grade ${gradeLevel}`;
}

/**
 * Normalize grade level to consistent format
 */
function normalizeGradeLevel(gradeLevel) {
    if (gradeLevel === 0 || gradeLevel === 'K' || gradeLevel === 'k') return 'K';
    return String(gradeLevel);
}

/**
 * Simple random choice helper - only used for initial grade selection
 */
function randomChoice(array) {
    if (!Array.isArray(array) || array.length === 0) {
        return null;
    }
    return array[Math.floor(Math.random() * array.length)];
}
