// gradeConstraints.js - REVISED: Streamlined constraints focused on LLM integration

// Research-based grade constraints from educational literature
// Simplified to focus on core parameters that LLM can effectively use
export const GRADE_CONSTRAINTS = {
    K: {
        maxWordsPerSentence: 6,
        minWordsPerSentence: 3,
        maxSyllablesPerWord: 2,
        vocabularyTier: 'Tier 1 only (everyday, high-frequency)',
        sentenceStructure: 'Simple SVO only - no subordination or compound sentences',
        allowedStructures: ['SVO', 'SV'],
        forbiddenStructures: ['compound', 'complex', 'subordinate clauses'],
        lexileRange: 'BR-200L',
        preferredWords: ['sight words', 'CVC patterns', 'basic nouns and verbs'],
        avoidWords: ['multisyllabic', 'abstract concepts', 'idiomatic expressions'],
        examples: [
            "I see a dog.",
            "The cat is big.",
            "We go up.",
            "The ball is red."
        ]
    },
    1: {
        maxWordsPerSentence: 8,
        minWordsPerSentence: 4,
        maxSyllablesPerWord: 2,
        vocabularyTier: 'Tier 1 + early Tier 2 (high utility)',
        sentenceStructure: 'Simple sentences, basic compound with "and"',
        allowedStructures: ['SVO', 'SVOC', 'simple compound with and'],
        forbiddenStructures: ['subordinate clauses', 'complex sentences', 'multiple conjunctions'],
        lexileRange: '200L-400L',
        preferredWords: ['high-frequency words', 'CVC/CVCC patterns', 'simple blends', 'inflectional endings'],
        avoidWords: ['multisyllabic beyond 2 syllables', 'idioms', 'complex prefixes'],
        examples: [
            "The dog runs fast.",
            "I play with Sam.",
            "We read and play games.",
            "My mom is nice."
        ]
    },
    2: {
        maxWordsPerSentence: 10,
        minWordsPerSentence: 5,
        maxSyllablesPerWord: 3,
        vocabularyTier: 'Tier 1 + Tier 2 (academic utility)',
        sentenceStructure: 'Simple and compound sentences, introductory phrases',
        allowedStructures: ['SVO', 'SVOC', 'compound with and/but', 'prepositional phrase starters'],
        forbiddenStructures: ['subordinate clauses', 'relative clauses', 'multiple dependent clauses'],
        lexileRange: '400L-650L',
        preferredWords: ['high-frequency', 'basic compound words', 'affixed words', 'basic academic vocabulary'],
        avoidWords: ['idioms', 'rare words', 'complex Latinate forms', 'highly technical terms'],
        examples: [
            "My friend helps me clean up.",
            "We went to the park after lunch.",
            "The happy dog played outside.",
            "After school, we play games."
        ]
    },
    3: {
        maxWordsPerSentence: 12,
        minWordsPerSentence: 6,
        maxSyllablesPerWord: 3,
        vocabularyTier: 'Tier 2 focus + contextual Tier 3',
        sentenceStructure: 'Simple, compound, and emerging complex sentences',
        allowedStructures: ['SVO', 'compound', 'basic subordinate with because/when/after'],
        forbiddenStructures: ['multiple subordinate clauses', 'embedded clauses', 'passive voice'],
        lexileRange: '650L-820L',
        preferredWords: ['Tier 2 academic words', 'affixed words', 'irregular plurals', 'basic content words'],
        avoidWords: ['obscure affixes', 'dense idiomatic expressions', 'highly technical jargon'],
        examples: [
            "After breakfast, the family walked to the market.",
            "She was unhappy because her book was lost.",
            "The students observed the experiment carefully.",
            "When it rains, we play inside the house."
        ]
    },
    4: {
        maxWordsPerSentence: 15,
        minWordsPerSentence: 7,
        maxSyllablesPerWord: 4,
        vocabularyTier: 'Tier 2 + contextual Tier 3 + morphological analysis',
        sentenceStructure: 'Compound and complex sentences with subordinate clauses',
        allowedStructures: ['compound', 'complex', 'subordinate clauses', 'relative clauses emerging'],
        forbiddenStructures: ['compound-complex', 'multiple embedded clauses'],
        lexileRange: '820L-980L',
        preferredWords: ['Tier 2 academic', 'beginning Tier 3', 'multisyllabic words', 'Greek/Latin roots'],
        avoidWords: ['highly technical beyond context', 'archaic terms', 'dense jargon'],
        examples: [
            "Although the weather was cold, we still played soccer after school.",
            "The scientist measured the water in three different containers.",
            "Because she studied hard, Maria received excellent grades on her test.",
            "The mysterious package that arrived yesterday contained a beautiful gift."
        ]
    },
    5: {
        maxWordsPerSentence: 18,
        minWordsPerSentence: 8,
        maxSyllablesPerWord: 4,
        vocabularyTier: 'Tier 2 + domain-specific Tier 3 + morphological complexity',
        sentenceStructure: 'Compound/complex with dependent and independent clauses',
        allowedStructures: ['compound', 'complex', 'relative clauses', 'participial phrases'],
        forbiddenStructures: ['overly dense compound-complex', 'multiple embeddings'],
        lexileRange: '980L-1120L',
        preferredWords: ['Tier 2 academic', 'content-specific vocabulary', 'abstract concepts', 'Latin/Greek bases'],
        avoidWords: ['dense technical terminology', 'archaisms', 'advanced idioms without context'],
        examples: [
            "Because the river flooded, the team canceled their trip and planned a new one for next week.",
            "Many inventions, such as the telephone, have changed the world in surprising ways.",
            "Despite the challenging circumstances, the expedition team successfully reached the summit.",
            "The archaeologist carefully examined the ancient artifacts before recording her observations."
        ]
    },
    6: {
        maxWordsPerSentence: 20,
        minWordsPerSentence: 9,
        maxSyllablesPerWord: 5,
        vocabularyTier: 'Tier 2-3 + figurative + morphologically complex',
        sentenceStructure: 'Complex and compound-complex with multiple subordinate clauses',
        allowedStructures: ['compound-complex', 'multiple subordinate clauses', 'embedded phrases', 'varied starters'],
        forbiddenStructures: ['extremely dense academic prose', 'overly convoluted syntax'],
        lexileRange: '1120L-1185L',
        preferredWords: ['Tier 2-3 academic', 'domain-specific', 'figurative language', 'sophisticated vocabulary'],
        avoidWords: ['archaic without context', 'densely technical outside domain', 'college-level abstractions'],
        examples: [
            "After completing the science project, the students presented their findings to the class, clearly explaining each step.",
            "When the river began to rise, the villagers built levees to prevent flooding in their community.",
            "Despite her fear of heights, Maya climbed the tall mountain and admired the spectacular view below.",
            "The protagonist's internal conflict, which had been building throughout the novel, finally reached its climax."
        ]
    }
};

/**
 * Get grade constraints for a specific grade level
 * @param {number|string} gradeLevel - Grade level (K, 0, 1, 2, etc.)
 * @returns {Object} - Constraints object for the grade
 */
export function getGradeConstraints(gradeLevel) {
    const grade = normalizeGradeLevel(gradeLevel);
    return GRADE_CONSTRAINTS[grade] || GRADE_CONSTRAINTS['1']; // Default to Grade 1
}

/**
 * Validate a sentence against grade-level constraints
 * Simplified version focused on core metrics that matter most
 * @param {string} sentence - Sentence to validate
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Validation results
 */
export function validateSentenceForGrade(sentence, gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    const words = sentence.split(/\s+/).filter(word => word.length > 0);
    const issues = [];

    // Core validations that LLM should handle
    if (words.length > constraints.maxWordsPerSentence) {
        issues.push(`Too many words: ${words.length} > ${constraints.maxWordsPerSentence}`);
    }
    if (words.length < constraints.minWordsPerSentence) {
        issues.push(`Too few words: ${words.length} < ${constraints.minWordsPerSentence}`);
    }

    // Syllable complexity check
    const complexWords = words.filter(word => estimateSyllables(word) > constraints.maxSyllablesPerWord);
    if (complexWords.length > 0) {
        issues.push(`Complex words: ${complexWords.join(', ')} exceed ${constraints.maxSyllablesPerWord} syllables`);
    }

    return {
        isValid: issues.length === 0,
        issues,
        wordCount: words.length,
        complexWords
    };
}

/**
 * Validate an entire story for grade-level appropriateness
 * Simplified to provide essential feedback for LLM-based pipeline
 * @param {Object} story - Story object with paragraphs and sentences
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Story validation results
 */
export function validateStoryGradeLevel(story, gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    const issues = [];
    const sentences = [];

    if (!story.paragraphs) {
        return {
            isValid: false,
            issues: [{ location: 'Story structure', sentence: '', issues: ['No paragraphs found'] }],
            stats: { totalSentences: 0, validSentences: 0 }
        };
    }

    story.paragraphs.forEach((paragraph, pIdx) => {
        if (!paragraph.sentences) return;

        paragraph.sentences.forEach((sentenceObj, sIdx) => {
            const sentenceText = sentenceObj.sentence || sentenceObj;
            const validation = validateSentenceForGrade(sentenceText, gradeLevel);
            sentences.push({ text: sentenceText, validation });

            if (!validation.isValid) {
                issues.push({
                    location: `Paragraph ${pIdx + 1}, Sentence ${sIdx + 1}`,
                    sentence: sentenceText,
                    issues: validation.issues
                });
            }
        });
    });

    const validSentences = sentences.filter(s => s.validation.isValid).length;
    const avgWordCount = sentences.length > 0
        ? sentences.reduce((sum, s) => sum + s.validation.wordCount, 0) / sentences.length
        : 0;

    return {
        isValid: issues.length === 0,
        issues,
        stats: {
            totalSentences: sentences.length,
            validSentences,
            averageWordCount: Math.round(avgWordCount * 10) / 10,
            maxWordLimit: constraints.maxWordsPerSentence,
            minWordLimit: constraints.minWordsPerSentence,
            lexileRange: constraints.lexileRange,
            passRate: sentences.length > 0 ? Math.round((validSentences / sentences.length) * 100) : 0
        }
    };
}

/**
 * Enhanced syllable estimation
 * @param {string} word - Word to analyze
 * @returns {number} - Estimated syllable count
 */
export function estimateSyllables(word) {
    if (!word || word.length <= 3) return 1;

    // Clean the word
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    if (word.length === 0) return 1;

    // Count vowel groups
    let syllables = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
        const isVowel = 'aeiouy'.includes(word[i]);
        if (isVowel && !previousWasVowel) {
            syllables++;
        }
        previousWasVowel = isVowel;
    }

    // Handle silent e
    if (word.endsWith('e') && syllables > 1) {
        syllables--;
    }

    // Handle consonant + le pattern
    if (word.endsWith('le') && word.length > 2 && !'aeiou'.includes(word[word.length - 3])) {
        syllables++;
    }

    return Math.max(1, syllables);
}

/**
 * Get example sentences for a grade level
 * @param {number|string} gradeLevel - Target grade level
 * @returns {string[]} - Array of example sentences
 */
export function getExampleSentences(gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    return constraints.examples || [];
}

/**
 * Check if a sentence structure is appropriate for grade level
 * Simplified check for basic structural appropriateness
 * @param {string} sentence - Sentence to check
 * @param {number|string} gradeLevel - Target grade level
 * @returns {boolean} - True if structure is appropriate
 */
export function isStructureAppropriate(sentence, gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    const lower = sentence.toLowerCase();

    // Check for forbidden structures
    if (gradeLevel === 'K' || gradeLevel === 0) {
        // No compound or complex sentences in Kindergarten
        return !hasCompoundOrComplexStructures(sentence);
    }

    if (gradeLevel === 1) {
        // Only simple compound with 'and' allowed
        return !hasComplexStructures(sentence) && !hasAdvancedCompoundStructures(sentence);
    }

    if (gradeLevel === 2) {
        // No subordinate clauses yet
        return !hasSubordinateClauses(sentence);
    }

    // Grades 3+ allow increasing complexity
    return true;
}

/**
 * Check for compound or complex sentence structures
 * @param {string} sentence - Sentence to analyze
 * @returns {boolean} - True if compound or complex structures found
 */
function hasCompoundOrComplexStructures(sentence) {
    const lower = sentence.toLowerCase();
    return lower.includes(' and ') || lower.includes(' but ') ||
        lower.includes(' or ') || hasSubordinateClauses(sentence);
}

/**
 * Check for complex sentence structures
 * @param {string} sentence - Sentence to analyze
 * @returns {boolean} - True if complex structures found
 */
function hasComplexStructures(sentence) {
    return hasSubordinateClauses(sentence);
}

/**
 * Check for advanced compound structures
 * @param {string} sentence - Sentence to analyze
 * @returns {boolean} - True if advanced compound structures found
 */
function hasAdvancedCompoundStructures(sentence) {
    const lower = sentence.toLowerCase();
    return lower.includes(' but ') || lower.includes(' or ') ||
        lower.includes(' so ') || lower.includes(' yet ');
}

/**
 * Check for subordinate clauses
 * @param {string} sentence - Sentence to analyze
 * @returns {boolean} - True if subordinate clauses found
 */
function hasSubordinateClauses(sentence) {
    const subordinators = ['because', 'when', 'if', 'since', 'while', 'although',
        'though', 'after', 'before', 'unless', 'until', 'wherever'];
    const lower = sentence.toLowerCase();
    return subordinators.some(sub => lower.includes(sub));
}

/**
 * Normalize grade level to consistent format
 * @param {number|string} gradeLevel - Input grade level
 * @returns {string} - Normalized grade level
 */
function normalizeGradeLevel(gradeLevel) {
    if (gradeLevel === 0 || gradeLevel === 'K' || gradeLevel === 'k') return 'K';
    return String(gradeLevel);
}

/**
 * Get a summary of grade-level expectations for display
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Summary of key expectations
 */
export function getGradeLevelSummary(gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    const grade = normalizeGradeLevel(gradeLevel);

    return {
        grade,
        displayName: grade === 'K' ? 'Kindergarten' : `Grade ${grade}`,
        wordRange: `${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words per sentence`,
        syllableLimit: `Maximum ${constraints.maxSyllablesPerWord} syllables per word`,
        vocabularyLevel: constraints.vocabularyTier,
        sentenceTypes: constraints.allowedStructures.join(', '),
        lexileRange: constraints.lexileRange,
        keyFocus: getKeyFocusForGrade(grade)
    };
}

/**
 * Get the key educational focus for a grade level
 * @param {string} grade - Normalized grade level
 * @returns {string} - Key focus description
 */
function getKeyFocusForGrade(grade) {
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
