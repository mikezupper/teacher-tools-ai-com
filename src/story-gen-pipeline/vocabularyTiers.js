// vocabularyTiers.js - REVISED: Simplified vocabulary support for LLM integration

// Research-based vocabulary tiers from Beck, McKeown & Kucan framework
// Streamlined for effective LLM prompt integration rather than complex validation

// Tier 1: Basic everyday words (learned through conversation)
export const TIER_1_CORE_WORDS = {
    K: [
        'a', 'and', 'are', 'as', 'at', 'be', 'big', 'can', 'come', 'day', 'do', 'down',
        'eat', 'for', 'get', 'go', 'good', 'have', 'he', 'here', 'I', 'in', 'is', 'it',
        'like', 'look', 'make', 'me', 'my', 'no', 'not', 'on', 'play', 'run', 'said',
        'see', 'she', 'the', 'this', 'to', 'up', 'was', 'we', 'with', 'you'
    ],
    1: [
        'after', 'again', 'all', 'boy', 'came', 'could', 'did', 'from', 'girl', 'had',
        'has', 'help', 'him', 'his', 'home', 'house', 'how', 'just', 'know', 'let',
        'little', 'man', 'may', 'new', 'now', 'old', 'our', 'out', 'put', 'say',
        'some', 'take', 'than', 'them', 'there', 'time', 'too', 'two', 'way', 'well',
        'went', 'were', 'what', 'when', 'where', 'will', 'work', 'your'
    ],
    2: [
        'about', 'also', 'any', 'ask', 'back', 'because', 'before', 'being', 'both',
        'buy', 'call', 'children', 'different', 'does', 'don\'t', 'each', 'even',
        'every', 'find', 'first', 'found', 'gave', 'give', 'going', 'hand', 'keep',
        'kind', 'last', 'leave', 'long', 'made', 'many', 'might', 'more', 'most',
        'mother', 'move', 'much', 'must', 'name', 'need', 'never', 'next', 'number',
        'only', 'other', 'over', 'own', 'part', 'place', 'right', 'same', 'school',
        'should', 'show', 'small', 'still', 'such', 'tell', 'think', 'three',
        'through', 'try', 'turn', 'under', 'until', 'very', 'want', 'water',
        'why', 'without', 'words', 'world', 'would', 'write', 'year', 'years'
    ]
};

// Tier 2: Academic utility words (appear across many contexts)
export const TIER_2_ACADEMIC_WORDS = {
    2: [
        'compare', 'describe', 'explain', 'identify', 'observe', 'predict',
        'important', 'problem', 'solution', 'example', 'different', 'similar'
    ],
    3: [
        'analyze', 'categorize', 'classify', 'conclude', 'contrast', 'create',
        'demonstrate', 'develop', 'discuss', 'evaluate', 'examine', 'illustrate',
        'investigate', 'organize', 'summarize', 'support', 'character', 'setting',
        'event', 'sequence', 'cause', 'effect', 'detail', 'evidence'
    ],
    4: [
        'accomplish', 'achieve', 'approach', 'argument', 'assume', 'calculate',
        'challenge', 'combine', 'communicate', 'construct', 'convince', 'determine',
        'elaborate', 'estimate', 'formulate', 'interpret', 'justify', 'maintain',
        'previous', 'process', 'provide', 'reference', 'respond', 'significant',
        'strategy', 'structure', 'sufficient', 'traditional', 'various'
    ],
    5: [
        'alternative', 'approximate', 'attitude', 'category', 'circumstances',
        'concept', 'consistent', 'demonstrate', 'dimension', 'emphasis',
        'establish', 'factor', 'feature', 'function', 'individual', 'involve',
        'method', 'obvious', 'occur', 'percent', 'period', 'primary', 'procedure',
        'require', 'resource', 'specific', 'symbol', 'technique', 'theory'
    ],
    6: [
        'abstract', 'accurate', 'acquire', 'adapt', 'adequate', 'analyze',
        'annual', 'apparent', 'appropriate', 'approximate', 'arbitrary', 'assume',
        'authority', 'benefit', 'concept', 'conclude', 'conduct', 'consequent',
        'considerable', 'consist', 'constant', 'constitute', 'context', 'contract',
        'create', 'data', 'define', 'derive', 'distribute', 'economy', 'environment',
        'establish', 'estimate', 'evaluate', 'evident', 'export', 'factor',
        'formula', 'function', 'identify', 'income', 'indicate', 'individual',
        'interpret', 'involve', 'issue', 'labor', 'legal', 'legislate', 'major',
        'method', 'occur', 'percent', 'period', 'policy', 'principle', 'proceed',
        'process', 'require', 'research', 'respond', 'role', 'section', 'significant',
        'similar', 'source', 'specific', 'structure', 'theory', 'vary'
    ]
};

// Tier 3: Domain-specific words (taught in context for specific subjects)
export const TIER_3_DOMAIN_WORDS = {
    science: [
        'habitat', 'ecosystem', 'adaptation', 'photosynthesis', 'evaporation',
        'condensation', 'precipitation', 'mammal', 'reptile', 'amphibian',
        'vertebrate', 'invertebrate', 'predator', 'prey', 'producer', 'consumer',
        'decomposer', 'food chain', 'food web', 'migration', 'hibernation'
    ],
    mathematics: [
        'addition', 'subtraction', 'multiplication', 'division', 'fraction',
        'decimal', 'percent', 'geometry', 'perimeter', 'area', 'volume',
        'equation', 'variable', 'coordinate', 'graph', 'pattern', 'sequence',
        'probability', 'statistics', 'average', 'median', 'mode', 'range'
    ],
    social_studies: [
        'community', 'government', 'citizen', 'democracy', 'constitution',
        'amendment', 'freedom', 'responsibility', 'geography', 'continent',
        'country', 'state', 'culture', 'tradition', 'history', 'timeline',
        'primary source', 'secondary source', 'artifact', 'civilization'
    ]
};

/**
 * Get vocabulary tier for a word based on research framework
 * Simplified for LLM prompt integration
 * @param {string} word - Word to classify
 * @param {number|string} gradeLevel - Target grade level
 * @returns {number|null} - Tier number (1, 2, 3) or null if unknown
 */
export function getVocabularyTier(word, gradeLevel) {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (!cleanWord) return null;

    const grade = normalizeGradeLevel(gradeLevel);

    // Check Tier 1 words (cumulative by grade)
    const gradeOrder = ['K', '1', '2'];
    for (const checkGrade of gradeOrder) {
        if (TIER_1_CORE_WORDS[checkGrade]?.includes(cleanWord)) {
            return 1;
        }
        if (checkGrade === grade) break;
    }

    // Check Tier 2 words (by grade level)
    const tier2Grade = Math.max(2, parseInt(grade) || 2);
    for (let g = 2; g <= tier2Grade; g++) {
        if (TIER_2_ACADEMIC_WORDS[g]?.includes(cleanWord)) {
            return 2;
        }
    }

    // Check Tier 3 words (domain-specific)
    for (const domain of Object.values(TIER_3_DOMAIN_WORDS)) {
        if (domain.includes(cleanWord)) {
            return 3;
        }
    }

    return null; // Unknown word
}

/**
 * Get recommended vocabulary words for a grade level
 * Focused on words that should be emphasized in stories
 * @param {number|string} gradeLevel - Target grade level
 * @param {number} count - Number of words to return
 * @returns {Object} - Object with tier1, tier2, and suggested arrays
 */
export function getRecommendedVocabulary(gradeLevel) {
    const grade = normalizeGradeLevel(gradeLevel);

    const recommendations = {
        tier1: [],
        tier2: [],
        focus: '',
        avoid: []
    };

    // Tier 1 words (cumulative)
    if (grade === 'K' || grade === '0') {
        recommendations.tier1 = TIER_1_CORE_WORDS.K || [];
        recommendations.focus = 'Simple, concrete words for everyday objects and actions';
        recommendations.avoid = ['multisyllabic words', 'abstract concepts', 'complex grammar'];
    } else if (grade === '1') {
        recommendations.tier1 = [...(TIER_1_CORE_WORDS.K || []), ...(TIER_1_CORE_WORDS['1'] || [])];
        recommendations.focus = 'High-frequency words with simple phonics patterns';
        recommendations.avoid = ['complex prefixes/suffixes', 'idioms', 'advanced grammar'];
    } else if (grade === '2') {
        recommendations.tier1 = Object.values(TIER_1_CORE_WORDS).flat();
        recommendations.tier2 = TIER_2_ACADEMIC_WORDS['2'] || [];
        recommendations.focus = 'Academic utility words that appear across subjects';
        recommendations.avoid = ['technical jargon', 'rare words', 'complex sentence structures'];
    } else {
        // Grades 3+
        const gradeNum = parseInt(grade) || 3;
        recommendations.tier1 = Object.values(TIER_1_CORE_WORDS).flat();

        // Include tier 2 words up to grade level
        for (let g = 2; g <= Math.min(gradeNum, 6); g++) {
            if (TIER_2_ACADEMIC_WORDS[g]) {
                recommendations.tier2.push(...TIER_2_ACADEMIC_WORDS[g]);
            }
        }

        recommendations.focus = `Academic vocabulary with morphological awareness (Grade ${grade})`;
        recommendations.avoid = ['archaic terms', 'highly technical language', 'college-level abstractions'];
    }

    return recommendations;
}

/**
 * Validate vocabulary appropriateness for grade level
 * Simplified validation for LLM pipeline
 * @param {string[]} words - Array of words to validate
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Validation results
 */
export function validateVocabularyForGrade(words, gradeLevel) {
    const issues = [];
    const tierCounts = { tier1: 0, tier2: 0, tier3: 0, unknown: 0 };
    const inappropriateWords = [];

    words.forEach(word => {
        const tier = getVocabularyTier(word, gradeLevel);

        if (tier === null) {
            tierCounts.unknown++;
            // Don't flag as inappropriate - may be valid words not in our lists
        } else if (tier === 1) {
            tierCounts.tier1++;
        } else if (tier === 2) {
            tierCounts.tier2++;
            // Tier 2 words generally appropriate for grades 2+
            if (gradeLevel === 'K' || gradeLevel === 0 || gradeLevel === 1) {
                inappropriateWords.push(word);
                issues.push(`Tier 2 word "${word}" may be advanced for grade ${gradeLevel}`);
            }
        } else if (tier === 3) {
            tierCounts.tier3++;
            // Tier 3 words should be used carefully before grade 3
            if (parseInt(gradeLevel) < 3 && gradeLevel !== 'K') {
                inappropriateWords.push(word);
                issues.push(`Tier 3 word "${word}" may be too specialized for grade ${gradeLevel}`);
            }
        }
    });

    return {
        isValid: issues.length === 0,
        issues,
        inappropriateWords,
        tierDistribution: tierCounts,
        recommendations: generateVocabularyRecommendations(tierCounts, gradeLevel)
    };
}

/**
 * Generate vocabulary recommendations based on tier distribution
 * @param {Object} tierCounts - Distribution of vocabulary tiers
 * @param {number|string} gradeLevel - Target grade level
 * @returns {string[]} - Array of recommendations
 */
function generateVocabularyRecommendations(tierCounts, gradeLevel) {
    const recommendations = [];
    const grade = normalizeGradeLevel(gradeLevel);

    // Grade-specific recommendations
    if (grade === 'K' || grade === '1') {
        if (tierCounts.tier2 > 0) {
            recommendations.push('Consider replacing some Tier 2 words with simpler alternatives');
        }
        if (tierCounts.tier1 < 5) {
            recommendations.push('Include more high-frequency Tier 1 words for accessibility');
        }
    } else if (grade === '2' || grade === '3') {
        if (tierCounts.tier2 < 2) {
            recommendations.push('Consider adding some academic vocabulary (Tier 2) words');
        }
        if (tierCounts.tier3 > 2) {
            recommendations.push('Limit specialized vocabulary unless essential to content');
        }
    } else {
        // Grades 4+
        if (tierCounts.tier2 < 3) {
            recommendations.push('Include more academic vocabulary to build word knowledge');
        }
    }

    return recommendations;
}

/**
 * Get vocabulary guidance for LLM prompts
 * Provides clear, actionable vocabulary direction for story generation
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Vocabulary guidance for prompts
 */
export function getVocabularyGuidance(gradeLevel) {
    const grade = normalizeGradeLevel(gradeLevel);
    const recommendations = getRecommendedVocabulary(grade);

    const guidance = {
        primaryWords: recommendations.tier1.slice(0, 20), // Most essential words
        academicWords: recommendations.tier2.slice(0, 10), // Key academic terms
        focusArea: recommendations.focus,
        avoidWords: recommendations.avoid,
        examples: getVocabularyExamples(grade),
        instructions: generateVocabularyInstructions(grade)
    };

    return guidance;
}

/**
 * Get vocabulary examples for each grade level
 * @param {string} grade - Normalized grade level
 * @returns {Object} - Examples of appropriate/inappropriate words
 */
function getVocabularyExamples(grade) {
    const examples = {
        K: {
            good: ['cat', 'dog', 'run', 'big', 'red', 'see', 'go'],
            avoid: ['enormous', 'magnificent', 'because', 'although']
        },
        1: {
            good: ['play', 'friend', 'happy', 'jump', 'look', 'help', 'find'],
            avoid: ['wonderful', 'important', 'different', 'problem']
        },
        2: {
            good: ['important', 'different', 'problem', 'example', 'describe'],
            avoid: ['magnificent', 'extraordinary', 'complicated', 'sophisticated']
        },
        3: {
            good: ['analyze', 'compare', 'character', 'setting', 'evidence'],
            avoid: ['comprehensive', 'sophisticated', 'phenomenon', 'hypothesis']
        }
    };

    return examples[grade] || examples['2'];
}

/**
 * Generate vocabulary instructions for LLM prompts
 * @param {string} grade - Normalized grade level
 * @returns {string} - Clear instructions for vocabulary use
 */
function generateVocabularyInstructions(grade) {
    const instructions = {
        K: 'Use only simple, concrete words that children know from daily conversation. Avoid any words longer than 2 syllables.',
        1: 'Focus on high-frequency words and simple phonics patterns. Include basic action words and descriptive words.',
        2: 'Combine everyday words with beginning academic vocabulary. Introduce words that appear across different subjects.',
        3: 'Use academic vocabulary that builds reading comprehension. Include words for discussing stories and ideas.',
        4: 'Incorporate subject-specific vocabulary with context support. Use words with prefixes and suffixes appropriately.',
        5: 'Include advanced academic vocabulary and abstract concepts. Support understanding through story context.',
        6: 'Use sophisticated vocabulary including figurative language. Demonstrate complex word relationships and meanings.'
    };

    return instructions[grade] || instructions['2'];
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
