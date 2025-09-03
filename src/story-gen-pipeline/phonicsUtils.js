// phonicsUtils.js - Research-based phonics pattern support and word banks

import { getGradeConstraints } from "./gradeConstraints.js";

// Research-based phonics word banks by pattern and grade level
// Based on developmental phonics progression from educational research
export const PHONICS_WORD_BANKS = {
    // -------------------------
    // CONSONANT DIGRAPHS
    // -------------------------
    'sh': {
        K: ['she'],
        1: ['shop', 'ship', 'fish', 'wish'],
        2: ['shell', 'shine', 'flash', 'brush', 'fresh', 'splash', 'rush'],
        3: ['foolish', 'selfish', 'bashful', 'sunshine', 'marshmallow'],
        4: ['accomplish', 'establish', 'polish', 'astonish', 'refreshing'],
        5: ['distinguished', 'relationship', 'scholarship', 'establishment'],
        6: ['sophisticated', 'accomplishment', 'distinguishable', 'refreshment']
    },
    'ch': {
        K: ['chin'],
        1: ['chat', 'chop', 'much', 'rich'],
        2: ['chair', 'lunch', 'reach', 'beach', 'teach', 'branch'],
        3: ['chapter', 'teacher', 'kitchen', 'children', 'sandwich'],
        4: ['chocolate', 'mechanic', 'architect', 'approach', 'research'],
        5: ['achievement', 'archaeology', 'technology', 'architecture'],
        6: ['characteristic', 'choreography', 'chronological', 'mechanical']
    },
    'th': {
        K: ['the'],
        1: ['that', 'this', 'then', 'with'],
        2: ['thing', 'think', 'three', 'thank', 'path', 'math'],
        3: ['brother', 'mother', 'father', 'nothing', 'something'],
        4: ['together', 'weather', 'although', 'birthday', 'everything'],
        5: ['mathematics', 'throughout', 'strengthen', 'enthusiasm'],
        6: ['authentication', 'mathematician', 'hypothetical', 'sympathetic']
    },
    'wh': {
        K: [],
        1: ['what', 'when', 'why'],
        2: ['where', 'white', 'whale', 'wheel', 'while'],
        3: ['whisper', 'whistle', 'whether', 'somewhere'],
        4: ['meanwhile', 'whenever', 'wherever', 'overwhelm'],
        5: ['overwhelmed', 'overwhelming', 'worthwhile'],
        6: ['whereabouts', 'overwhelmingly', 'worthwhileness']
    },
    'ph': {
        K: [],
        1: [],
        2: ['phone'],
        3: ['photo', 'graph', 'elephant'],
        4: ['paragraph', 'telephone', 'alphabet', 'photograph'],
        5: ['geography', 'biography', 'philosophy', 'symphony'],
        6: ['photographer', 'philosophical', 'autobiography', 'sophisticated']
    },
    'ck': {
        K: ['back'],
        1: ['duck', 'pack', 'sock'],
        2: ['pocket', 'ticket', 'rocket'],
        3: ['backpack', 'unlock', 'thickest'],
        4: ['knapsack', 'checklist', 'stockpile'],
        5: ['interlock', 'feedback', 'hijack'],
        6: ['counterattack', 'reconstruct', 'overclock']
    },
    'ng': {
        K: ['sing'],
        1: ['ring', 'long', 'song'],
        2: ['bring', 'thing', 'strong'],
        3: ['belong', 'spring', 'string'],
        4: ['clinging', 'happening', 'beginning'],
        5: ['belonging', 'outstanding', 'undergoing'],
        6: ['overhanging', 'misunderstanding', 'accompanying']
    },
    'tch': {
        K: ['catch'],
        1: ['match', 'witch', 'pitch'],
        2: ['kitchen', 'stretch', 'hatch'],
        3: ['scratch', 'dispatch', 'snatch'],
        4: ['outstretch', 'sketching', 'watchman'],
        5: ['dispatching', 'outmatched', 'sketchbook'],
        6: ['unmatched', 'overstretched', 'sketchiness']
    },
    'dge': {
        K: [],
        1: ['badge', 'edge'],
        2: ['bridge', 'judge', 'fudge'],
        3: ['knowledge', 'pledge', 'hedge'],
        4: ['acknowledge', 'abridge', 'smudged'],
        5: ['unacknowledged', 'abridgment', 'hedgerow'],
        6: ['acknowledgment', 'abridgements', 'hedgehog']
    },

    // -------------------------
    // CONSONANT BLENDS
    // -------------------------
    'bl': {
        K: [],
        1: ['blue', 'blow'],
        2: ['black', 'block', 'bloom', 'blend', 'blank'],
        3: ['blanket', 'problem', 'trouble', 'grumble'],
        4: ['blizzard', 'emblem', 'incredible', 'responsible'],
        5: ['reasonable', 'horrible', 'terrible'],
        6: ['unbelievable', 'irresponsible', 'uncomfortable']
    },
    'br': {
        K: [],
        1: ['brown'],
        2: ['bring', 'brave', 'bright', 'bread', 'break'],
        3: ['brother', 'breathe', 'breakfast', 'library'],
        4: ['celebrate', 'remember', 'October', 'November'],
        5: ['celebration', 'abbreviation'],
        6: ['extraordinary', 'embraceable']
    },
    'cl': {
        K: [],
        1: ['clap'],
        2: ['class', 'clean', 'close', 'clock', 'cloud'],
        3: ['clothes', 'climb', 'include', 'uncle'],
        4: ['bicycle', 'article', 'particle'],
        5: ['include', 'conclude', 'exclusive'],
        6: ['exclusively', 'including', 'concluding']
    },
    'dr': {
        K: [],
        1: ['drum', 'drop'],
        2: ['drink', 'drive', 'dream'],
        3: ['dragon', 'drawer', 'dread'],
        4: ['address', 'drastic', 'dribble'],
        5: ['hydraulic', 'dreadful', 'dramatize'],
        6: ['dramatically', 'hydraulics', 'overdramatize']
    },
    'fr': {
        K: [],
        1: ['frog', 'from'],
        2: ['free', 'fresh', 'friend'],
        3: ['frozen', 'fright', 'fringe'],
        4: ['framework', 'fragrance', 'friction'],
        5: ['infrastructure', 'frustration', 'fractional'],
        6: ['reconfiguration', 'fractionation', 'frictionless']
    },
    'gr': {
        K: [],
        1: ['green', 'grab'],
        2: ['great', 'grass', 'grow'],
        3: ['ground', 'grape', 'grind'],
        4: ['graduate', 'grammar', 'grumble'],
        5: ['aggregation', 'gratitude', 'gravitate'],
        6: ['congratulations', 'gravitational', 'aggregation']
    },
    'pr': {
        K: [],
        1: ['prize', 'print'],
        2: ['press', 'proud', 'prove'],
        3: ['problem', 'protect', 'promise'],
        4: ['progress', 'project', 'process'],
        5: ['provision', 'promotion', 'proportion'],
        6: ['procrastination', 'pronunciation', 'proliferation']
    },
    'tr': {
        K: [],
        1: ['tree', 'trip'],
        2: ['train', 'trap', 'true'],
        3: ['treat', 'track', 'trade'],
        4: ['transport', 'translate', 'transform'],
        5: ['transmission', 'transition', 'transaction'],
        6: ['transcontinental', 'transformation', 'transfiguration']
    },
    'scr': {
        K: [],
        1: [],
        2: ['scrap', 'scrub', 'screw'],
        3: ['screen', 'scrape', 'scratch'],
        4: ['scrolling', 'scramble', 'scrutiny'],
        5: ['description', 'prescription', 'subscription'],
        6: ['inscription', 'circumscription', 'transcription']
    },
    'spr': {
        K: [],
        1: [],
        2: ['spring', 'spray', 'spread'],
        3: ['sprout', 'sprang', 'spruce'],
        4: ['sprinkle', 'sprinter', 'sprained'],
        5: ['springtime', 'spreadsheet', 'sprinkling'],
        6: ['unspringing', 'resprinkling', 'springboard']
    },
    'str': {
        K: [],
        1: [],
        2: ['street', 'strap', 'strip'],
        3: ['strong', 'strike', 'string'],
        4: ['struggle', 'stranger', 'strategy'],
        5: ['strengthen', 'streamline', 'structure'],
        6: ['infrastructure', 'misconstruction', 'restructuring']
    },
    'spl': {
        K: [],
        1: [],
        2: ['split', 'splash', 'splat'],
        3: ['splendid', 'splinter', 'splurge'],
        4: ['splatter', 'splitting', 'splashed'],
        5: ['splattering', 'splintering', 'splendour'],
        6: ['unsplintered', 'resplendent', 'splinterproof']
    },
    'squ': {
        K: [],
        1: [],
        2: ['squid', 'squat', 'squash'],
        3: ['square', 'squeeze', 'squirm'],
        4: ['squirrel', 'squabble', 'squander'],
        5: ['squiggly', 'squashable', 'squashiness'],
        6: ['unsquashable', 'squashinesses', 'squarishness']
    },

    // -------------------------
    // LONG VOWEL PATTERNS
    // -------------------------
    'ai': {
        K: [],
        1: [],
        2: ['rain', 'pain', 'main', 'train', 'brain'],
        3: ['explain', 'remain', 'afraid', 'captain'],
        4: ['mountain', 'fountain', 'certain', 'curtain'],
        5: ['maintain', 'complain', 'sustain', 'obtain'],
        6: ['entertainment', 'ascertainment', 'mountains']
    },
    'ay': {
        K: [],
        1: ['day', 'say', 'way', 'may', 'play'],
        2: ['today', 'away', 'always', 'maybe', 'birthday'],
        3: ['yesterday', 'holiday', 'everyday', 'anyway'],
        4: ['Wednesday', 'Saturday', 'February', 'January'],
        5: ['anniversary', 'extraordinary', 'missionary'],
        6: ['contemporary', 'revolutionary', 'extraordinary']
    },
    'oa': {
        K: [],
        1: ['boat', 'coat', 'road'],
        2: ['coach', 'float', 'throat'],
        3: ['approach', 'oatmeal', 'goalpost'],
        4: ['overload', 'boasting', 'coasting'],
        5: ['floatation', 'overcoat', 'broadcoat'],
        6: ['undercoating', 'overboasting', 'goalkeeping']
    },
    'oe': {
        K: [],
        1: ['toe'],
        2: ['foe', 'hoe', 'doe'],
        3: ['goes', 'heroes', 'oboe'],
        4: ['overthrow', 'foreclose', 'toeprint'],
        5: ['foreboding', 'foregoing', 'foretold'],
        6: ['foreknowledge', 'foreordination', 'foreclosure']
    },
    'ie': {
        K: [],
        1: ['pie', 'tie'],
        2: ['die', 'lie', 'vie'],
        3: ['chief', 'thief', 'brief'],
        4: ['belief', 'relief', 'achieve'],
        5: ['achievement', 'grievance', 'retrieval'],
        6: ['misbelief', 'unbelievable', 'perceivable']
    },
    'igh': {
        K: [],
        1: ['high'],
        2: ['light', 'night', 'right'],
        3: ['bright', 'flight', 'fright'],
        4: ['delight', 'insight', 'twilight'],
        5: ['highlight', 'foresight', 'oversight'],
        6: ['enlightenment', 'foresightedness', 'overhighlight']
    },
    'ee': {
        K: [],
        1: ['see', 'bee', 'tree'],
        2: ['keep', 'sleep', 'green', 'three', 'free'],
        3: ['thirteen', 'fourteen', 'fifteen', 'between'],
        4: ['agreement', 'seventeen', 'eighteen', 'nineteen'],
        5: ['committee', 'guarantee', 'volunteer', 'engineering'],
        6: ['engineering', 'disagreement', 'volunteering']
    },
    'ea': {
        K: [],
        1: [],
        2: ['eat', 'sea', 'tea', 'read', 'meat'],
        3: ['teacher', 'feature', 'creature', 'treasure'],
        4: ['breakfast', 'weather', 'sweater', 'feather'],
        5: ['treatment', 'agreement', 'measurement', 'achievement'],
        6: ['entertainment', 'disagreement', 'rearrangement']
    },
    'ew': {
        K: [],
        1: ['new', 'few'],
        2: ['blew', 'grew', 'threw'],
        3: ['chew', 'stew', 'crew'],
        4: ['review', 'interview', 'renew'],
        5: ['preview', 'overthrew', 'withdrew'],
        6: ['interviewer', 'reviewable', 'renewable']
    },
    'ui': {
        K: [],
        1: [],
        2: ['fruit', 'suit'],
        3: ['juice', 'bruise', 'pursuit'],
        4: ['circuit', 'cruise', 'suitable'],
        5: ['pursuing', 'suitcase', 'fruitful'],
        6: ['circuitous', 'unsuitable', 'recruitment']
    },

    // -------------------------
    // DIPHTHONGS & OTHER VOWEL TEAMS
    // -------------------------
    'ou': {
        K: [],
        1: ['out', 'our'],
        2: ['house', 'mouse', 'found'],
        3: ['flower', 'shout', 'cloud'],
        4: ['powerful', 'allowance', 'trouble'],
        5: ['pronounce', 'announce', 'renounce'],
        6: ['mispronounce', 'announcement', 'renouncement']
    },
    'ow': {
        K: [],
        1: ['cow', 'how', 'now'],
        2: ['brown', 'down', 'town'],
        3: ['flower', 'shower', 'power'],
        4: ['allow', 'endow', 'bestow'],
        5: ['disallow', 'overthrow', 'withdrew'],
        6: ['foreshadow', 'overpower', 'disempower']
    },
    'oi': {
        K: [],
        1: ['oil', 'boil'],
        2: ['coin', 'join', 'point'],
        3: ['voice', 'choice', 'spoil'],
        4: ['appoint', 'rejoice', 'avoid'],
        5: ['appointment', 'disjointed', 'loyalty'],
        6: ['reappointment', 'unavoidable', 'disloyalty']
    },
    'oy': {
        K: [],
        1: ['boy', 'toy'],
        2: ['joy', 'enjoy', 'ploy'],
        3: ['royal', 'loyal', 'annoy'],
        4: ['employ', 'destroy', 'deploy'],
        5: ['employment', 'enjoyment', 'deployment'],
        6: ['redeployment', 'unemployment', 'overjoyed']
    },
    'au': {
        K: [],
        1: ['aunt', 'auto'],
        2: ['author', 'haul', 'fault'],
        3: ['autumn', 'pause', 'cause'],
        4: ['laundry', 'auction', 'audience'],
        5: ['automatic', 'autograph', 'auditory'],
        6: ['automation', 'authorization', 'autonomous']
    },
    'aw': {
        K: [],
        1: ['saw', 'paw'],
        2: ['draw', 'straw', 'claw'],
        3: ['crawl', 'lawn', 'yawn'],
        4: ['awkward', 'lawyer', 'flawless'],
        5: ['outlawed', 'withdrawal', 'overaw'],
        6: ['foresaw', 'outlawing', 'withdrawals']
    },

    // -------------------------
    // R-CONTROLLED VOWELS
    // -------------------------
    'ar': {
        K: [],
        1: ['car', 'far', 'arm'],
        2: ['park', 'farm', 'star', 'hard', 'start'],
        3: ['garden', 'market', 'partner', 'apartment'],
        4: ['particular', 'ordinary', 'barbarian'],
        5: ['remarkable', 'regarding', 'apparatus'],
        6: ['extraordinary', 'particularly', 'apparatus']
    },
    'er': {
        K: [],
        1: [],
        2: ['her', 'over', 'under', 'after', 'water'],
        3: ['sister', 'brother', 'mother', 'father', 'other'],
        4: ['however', 'remember', 'together', 'another'],
        5: ['nevertheless', 'temperature', 'different'],
        6: ['refrigerator', 'temperature', 'nevertheless']
    },
    'ir': {
        K: [],
        1: [],
        2: ['bird', 'girl', 'first', 'dirt'],
        3: ['shirt', 'third', 'birthday', 'circle'],
        4: ['thirteen', 'thirty', 'confirm', 'Birmingham'],
        5: ['circulate', 'circumstance', 'Birmingham'],
        6: ['circulation', 'circumstances', 'Birmingham']
    },
    'or': {
        K: [],
        1: ['for', 'or'],
        2: ['more', 'store', 'door', 'floor', 'four'],
        3: ['before', 'morning', 'important', 'story'],
        4: ['therefore', 'explore', 'support', 'record'],
        5: ['enormous', 'performance', 'transformed', 'information'],
        6: ['extraordinary', 'performance', 'transformed']
    },
    'ur': {
        K: [],
        1: [],
        2: ['turn', 'burn', 'hurt', 'fur'],
        3: ['during', 'return', 'turtle', 'purple'],
        4: ['furniture', 'adventure', 'picture'],
        5: ['temperature', 'cultural', 'capture'],
        6: ['architectural', 'agricultural', 'cultural']
    },
    'ear': {
        K: [],
        1: ['ear'],
        2: ['hear', 'near', 'fear'],
        3: ['clear', 'dear', 'year'],
        4: ['appear', 'disappear', 'volunteer'],
        5: ['engineering', 'reappearance', 'clearance'],
        6: ['mishearing', 'unearthing', 'reengineering']
    },
    'air': {
        K: [],
        1: ['air'],
        2: ['hair', 'fair', 'pair'],
        3: ['chair', 'stair', 'repair'],
        4: ['airplane', 'airline', 'airborne'],
        5: ['millionaire', 'declaration', 'preparation'],
        6: ['humanitarian', 'declarative', 'preparatory']
    },
    'ore': {
        K: [],
        1: ['ore'],
        2: ['more', 'store', 'core'],
        3: ['before', 'ignore', 'score'],
        4: ['explore', 'restore', 'shoreline'],
        5: ['foresee', 'foresight', 'foreman'],
        6: ['foreknowledge', 'restoration', 'exploration']
    },
    'are': {
        K: [],
        1: ['are'],
        2: ['care', 'share', 'bare'],
        3: ['aware', 'compare', 'prepare'],
        4: ['declare', 'despair', 'awarely'],
        5: ['declaration', 'preparation', 'comparative'],
        6: ['unpreparedness', 'declarative', 'comparatively']
    }
};


// Common phonics patterns that appear in skills
export const PHONICS_PATTERNS = {
    // Single patterns
    'sh': /\bsh\b|sh/i,
    'ch': /\bch\b|ch/i,
    'th': /\bth\b|th/i,
    'wh': /\bwh\b|wh/i,
    'ph': /\bph\b|ph/i,

    // Blends
    'bl': /\bbl/i,
    'br': /\bbr/i,
    'cl': /\bcl/i,
    'cr': /\bcr/i,
    'dr': /\bdr/i,
    'fl': /\bfl/i,
    'fr': /\bfr/i,
    'gl': /\bgl/i,
    'gr': /\bgr/i,
    'pl': /\bpl/i,
    'pr': /\bpr/i,
    'sc': /\bsc/i,
    'sk': /\bsk/i,
    'sl': /\bsl/i,
    'sm': /\bsm/i,
    'sn': /\bsn/i,
    'sp': /\bsp/i,
    'st': /\bst/i,
    'sw': /\bsw/i,
    'tr': /\btr/i,
    'tw': /\btw/i,

    // Long vowels
    'ai': /ai/i,
    'ay': /ay/i,
    'ea': /ea/i,
    'ee': /ee/i,
    'ie': /ie/i,
    'oa': /oa/i,
    'oe': /oe/i,
    'ue': /ue/i,
    'ui': /ui/i,

    // R-controlled
    'ar': /ar/i,
    'er': /er/i,
    'ir': /ir/i,
    'or': /or/i,
    'ur': /ur/i,

    // Diphthongs
    'au': /au/i,
    'aw': /aw/i,
    'oi': /oi/i,
    'oy': /oy/i,
    'ou': /ou/i,
    'ow': /ow/i,

    // CVC patterns
    'cvc': /^[bcdfghjklmnpqrstvwxyz][aeiou][bcdfghjklmnpqrstvwxyz]$/i
};

/**
 * Extract the phonics pattern from a phonics skill description
 * @param {string} phonicsSkill - Description like "Use 'sh' digraph words"
 * @returns {string} - The extracted pattern like 'sh'
 */
export function extractPhonicsPattern(phonicsSkill) {
    if (!phonicsSkill) return '';

    const skill = phonicsSkill.toLowerCase();

    // Direct pattern matching
    for (const [pattern, regex] of Object.entries(PHONICS_PATTERNS)) {
        if (skill.includes(pattern) || skill.includes(`'${pattern}'`) || skill.includes(`"${pattern}"`)) {
            return pattern;
        }
    }

    // Special case handling
    if (skill.includes('digraph')) {
        if (skill.includes('sh')) return 'sh';
        if (skill.includes('ch')) return 'ch';
        if (skill.includes('th')) return 'th';
        if (skill.includes('wh')) return 'wh';
        if (skill.includes('ph')) return 'ph';
    }

    if (skill.includes('blend')) {
        // Try to find common blends
        const blends = ['bl', 'br', 'cl', 'cr', 'dr', 'fl', 'fr', 'gl', 'gr', 'pl', 'pr', 'sl', 'sm', 'sn', 'sp', 'st', 'sw', 'tr'];
        for (const blend of blends) {
            if (skill.includes(blend)) return blend;
        }
    }

    if (skill.includes('long') && skill.includes('vowel')) {
        const longVowels = ['ai', 'ay', 'ea', 'ee', 'ie', 'oa', 'oe', 'ue'];
        for (const vowel of longVowels) {
            if (skill.includes(vowel)) return vowel;
        }
    }

    if (skill.includes('r-controlled') || skill.includes('r controlled')) {
        const rControlled = ['ar', 'er', 'ir', 'or', 'ur'];
        for (const pattern of rControlled) {
            if (skill.includes(pattern)) return pattern;
        }
    }

    // Default fallback - try to extract any quoted pattern
    const quotedMatch = skill.match(/['"]([a-z]{1,3})['"]/) || skill.match(/([a-z]{2,3})/);
    if (quotedMatch) {
        const potential = quotedMatch[1];
        if (PHONICS_PATTERNS[potential]) {
            return potential;
        }
    }

    return '';
}

/**
 * Get appropriate phonics words for a specific pattern and grade level
 * @param {string} phonicsSkill - The phonics skill description
 * @param {number|string} gradeLevel - Grade level (K, 1, 2, etc.)
 * @returns {string[]} - Array of appropriate words
 */
export function getPhonicsWordBank(phonicsSkill, gradeLevel) {
    const pattern = extractPhonicsPattern(phonicsSkill);
    if (!pattern) return [];

    const grade = normalizeGradeLevel(gradeLevel);
    const wordBank = PHONICS_WORD_BANKS[pattern];

    if (!wordBank) return [];

    // Get words for current grade and all previous grades (cumulative learning)
    const gradeOrder = ['K', '1', '2', '3', '4', '5', '6'];
    const currentGradeIndex = gradeOrder.indexOf(grade);

    if (currentGradeIndex === -1) return wordBank['2'] || []; // Default to grade 2

    let cumulativeWords = [];
    for (let i = 0; i <= currentGradeIndex; i++) {
        const gradeWords = wordBank[gradeOrder[i]] || [];
        cumulativeWords.push(...gradeWords);
    }

    // Remove duplicates and return
    return [...new Set(cumulativeWords)];
}

/**
 * Check if a word contains the target phonics pattern
 * @param {string} word - Word to check
 * @param {string} phonicsSkill - Phonics skill description
 * @returns {boolean} - True if word contains the pattern
 */
export function wordContainsPhonicsPattern(word, phonicsSkill) {
    const pattern = extractPhonicsPattern(phonicsSkill);
    if (!pattern || !word) return false;

    const regex = PHONICS_PATTERNS[pattern];
    if (!regex) return false;

    return regex.test(word.toLowerCase());
}

/**
 * Find all words in a sentence that contain the phonics pattern
 * @param {string} sentence - Sentence to analyze
 * @param {string} phonicsSkill - Phonics skill description
 * @returns {string[]} - Array of words containing the pattern
 */
export function findPhonicsWordsInSentence(sentence, phonicsSkill) {
    if (!sentence) return [];

    const words = sentence.toLowerCase()
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/)
        .filter(word => word.length > 0);

    return words.filter(word => wordContainsPhonicsPattern(word, phonicsSkill));
}

/**
 * Analyze phonics integration in a complete story
 * @param {Object} story - Story object with paragraphs and sentences
 * @param {string} phonicsSkill - Target phonics skill
 * @returns {Object} - Analysis of phonics integration
 */
export function analyzePhonicsInStory(story, phonicsSkill) {
    const pattern = extractPhonicsPattern(phonicsSkill);
    let totalWords = [];
    let sentenceCount = 0;

    if (!story.paragraphs) {
        return {
            pattern,
            totalWords: 0,
            uniqueWords: [],
            sentenceCount: 0,
            integration: 'insufficient',
            coverage: 0
        };
    }

    story.paragraphs.forEach(paragraph => {
        if (paragraph.sentences) {
            paragraph.sentences.forEach(sentenceObj => {
                sentenceCount++;
                const phonicsWords = findPhonicsWordsInSentence(sentenceObj.sentence, phonicsSkill);
                totalWords.push(...phonicsWords);
            });
        }
    });

    const uniqueWords = [...new Set(totalWords)];
    const coverage = sentenceCount > 0 ? totalWords.length / sentenceCount : 0;

    let integration = 'insufficient';
    if (totalWords.length >= 4 && uniqueWords.length >= 2) {
        integration = coverage > 0.5 ? 'excellent' : 'natural';
    } else if (totalWords.length >= 2) {
        integration = 'adequate';
    }

    return {
        pattern,
        totalWords: totalWords.length,
        uniqueWords,
        sentenceCount,
        integration,
        coverage: Math.round(coverage * 100) / 100,
        wordsPerSentence: Math.round((totalWords.length / Math.max(1, sentenceCount)) * 100) / 100
    };
}

/**
 * Generate phonics-focused writing prompts
 * @param {string} phonicsSkill - Target phonics skill
 * @param {number|string} gradeLevel - Grade level
 * @param {string} theme - Story theme
 * @returns {string[]} - Array of creative prompts
 */
export function generatePhonicsPrompts(phonicsSkill, gradeLevel, theme) {
    const pattern = extractPhonicsPattern(phonicsSkill);
    const words = getPhonicsWordBank(phonicsSkill, gradeLevel);
    const grade = normalizeGradeLevel(gradeLevel);

    if (words.length < 2) {
        return [`Write a story about ${theme} using ${pattern} sounds.`];
    }

    const sampleWords = words.slice(0, 4).join(', ');

    const prompts = [
        `Create an adventure where characters use these ${pattern} words: ${sampleWords}`,
        `Write about ${theme} featuring actions with ${pattern} sounds like ${words.slice(0, 3).join(', ')}`,
        `Tell a story where ${pattern} words help solve a problem: ${sampleWords}`,
        `Describe characters doing things with ${pattern} words in a ${theme} setting`
    ];

    return prompts;
}

/**
 * Validate phonics integration quality for educational effectiveness
 * @param {Object} phonicsAnalysis - Result from analyzePhonicsInStory
 * @param {number|string} gradeLevel - Target grade level
 * @returns {Object} - Validation results with educational recommendations
 */
export function validatePhonicsIntegration(phonicsAnalysis, gradeLevel) {
    const constraints = getGradeConstraints(gradeLevel);
    const issues = [];
    const recommendations = [];

    // Minimum word count requirements by grade
    const minPhonicsWords = {
        'K': 2, '1': 2, '2': 3, '3': 3, '4': 4, '5': 4, '6': 5
    };

    const grade = normalizeGradeLevel(gradeLevel);
    const required = minPhonicsWords[grade] || 3;

    if (phonicsAnalysis.totalWords < required) {
        issues.push(`Insufficient phonics words: ${phonicsAnalysis.totalWords}/${required} needed`);
        recommendations.push(`Add ${required - phonicsAnalysis.totalWords} more ${phonicsAnalysis.pattern} words naturally into actions or descriptions`);
    }

    if (phonicsAnalysis.uniqueWords.length < 2) {
        issues.push('Needs more variety in phonics words');
        recommendations.push(`Use different ${phonicsAnalysis.pattern} words to avoid repetition and build vocabulary`);
    }

    if (phonicsAnalysis.coverage < 0.3) {
        issues.push('Phonics pattern not well-distributed across story');
        recommendations.push('Spread phonics words more evenly throughout the story for better reinforcement');
    }

    const isValid = issues.length === 0;
    const score = Math.min(1.0, (phonicsAnalysis.totalWords / required) *
        (phonicsAnalysis.uniqueWords.length / 2) *
        Math.min(1.0, phonicsAnalysis.coverage / 0.3));

    return {
        isValid,
        score: Math.round(score * 100) / 100,
        issues,
        recommendations,
        educationalValue: phonicsAnalysis.integration,
        meetsGradeStandards: isValid && score >= 0.7
    };
}

/**
 * Normalize grade level to consistent string format
 * @param {number|string} gradeLevel - Input grade level
 * @returns {string} - Normalized grade level ('K', '1', '2', etc.)
 */
function normalizeGradeLevel(gradeLevel) {
    if (gradeLevel === 0 || gradeLevel === 'K' || gradeLevel === 'k') return 'K';
    return String(gradeLevel);
}

// Export validation functions for story pipeline
// export { validatePhonicsInStory, getPhonicsWordSuggestions } from './phonicsValidation.js';
