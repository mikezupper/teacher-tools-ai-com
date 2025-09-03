// prompts.js - REVISED: Simplified prompts leveraging LLM intelligence over utility functions

import { getGradeConstraints } from "./gradeConstraints.js";
import { getPhonicsWordBank, extractPhonicsPattern } from "./phonicsUtils.js";

/**
 * Generate messages for creating phonics-integrated educational stories
 * This replaces the multi-pass approach with a single, comprehensive story generation
 */
export function messagesForEducationalStory(input) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const phonicsWords = getPhonicsWordBank(input.phonicSkill, input.gradeLevel);
    const phonicsPattern = extractPhonicsPattern(input.phonicSkill);

    const sys = `You are an expert children's story writer and literacy educator who creates developmentally appropriate stories that integrate specific phonics patterns naturally while maintaining high narrative quality. You understand research-based grade-level constraints from CCSS and Lexile frameworks.`;

    const user = `CREATE a complete, educationally effective story for ${gradeDisplay} students.

STORY SPECIFICATIONS:
• Length: EXACTLY ${input.length} sentences total
• Genre: ${input.genre}
• Theme: ${input.theme}
• Target phonics: "${input.phonicSkill}"
• Grade level: ${gradeDisplay} (Lexile ${constraints.lexileRange})

RESEARCH-BASED ${gradeDisplay.toUpperCase()} REQUIREMENTS:
• Sentence length: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words per sentence
• Syllable complexity: Maximum ${constraints.maxSyllablesPerWord} syllables per word
• Vocabulary tier: ${constraints.vocabularyTier}
• Allowed structures: ${constraints.allowedStructures.join(', ')}
• FORBIDDEN structures: ${constraints.forbiddenStructures.join(', ')}
• Preferred words: ${constraints.preferredWords.join(', ')}
• Avoid: ${constraints.avoidWords.join(', ')}

PHONICS INTEGRATION STRATEGY:
• Target pattern: "${phonicsPattern}" 
• Use 3-4 words with this pattern naturally throughout story
• Available phonics words: ${phonicsWords.join(', ')}
• Make phonics words central to character actions and plot development
• Ensure natural story flow - avoid forced or artificial insertion

EDUCATIONAL EXCELLENCE CRITERIA:
• Clear narrative arc: engaging setup → meaningful conflict → satisfying resolution
• Characters and actions appropriate for ${gradeDisplay} emotional/cognitive development  
• Rich, concrete details that support visualization and comprehension
• Social-emotional learning elements (friendship, problem-solving, kindness)
• Language that models grade-appropriate communication patterns
• Vocabulary that builds on known words while introducing new concepts appropriately

QUALITY BENCHMARKS:
• Each sentence must advance the plot meaningfully
• Dialogue and actions should feel authentic for the age group
• Educational value beyond phonics (character development, problem-solving)
• Engaging content that motivates continued reading
• Appropriate complexity that challenges without frustrating

EXAMPLES OF EFFECTIVE PHONICS INTEGRATION:
• Action-driven: "The brave fox rushed through the thick brush to help his friend"
• Character-focused: "She wished to share the fresh fish with all her friends"  
• Descriptive: "The shiny shell sparkled and shimmered in the bright sunshine"

Return this EXACT JSON structure:
{
  "title": "Engaging, Age-Appropriate Title with Action/Adventure Elements",
  "paragraphs": [
    {
      "sentences": [
        { 
          "sentence": "Perfect ${gradeDisplay} sentence with natural phonics integration",
          "wordCount": actual_word_count,
          "phonicsWords": ["list", "of", "phonics", "pattern", "words"],
          "educationalNotes": "Brief explanation of learning value"
        }
      ]
    }
  ],
  "storyAnalysis": {
    "totalSentences": ${input.length},
    "phonicsPattern": "${phonicsPattern}",
    "phonicsWordCount": total_phonics_words_used,
    "phonicsWords": ["complete", "list", "of", "phonics", "words"],
    "narrativeArc": "description of story structure",
    "educationalFocus": ["primary", "learning", "objectives"],
    "gradeAppropriateFeatures": ["specific", "age-appropriate", "elements"]
  }
}

CRITICAL SUCCESS FACTORS:
✓ Every sentence exactly ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words
✓ All words ≤ ${constraints.maxSyllablesPerWord} syllables  
✓ Natural integration of ${phonicsPattern} pattern (3-4 words minimum)
✓ Engaging story that children will want to read repeatedly
✓ Educational effectiveness for ${gradeDisplay} literacy development
✓ Research-based developmental appropriateness

Create a story that teachers will confidently use for ${gradeDisplay} phonics instruction while students enjoy reading independently.`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

/**
 * Generate comprehensive educational evaluation messages
 * Replaces multiple scoring passes with single LLM-driven assessment
 */
export function messagesForComprehensiveEvaluation(story, input) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const phonicsPattern = extractPhonicsPattern(input.phonicSkill);

    const sys = `You are a literacy education specialist and researcher who evaluates children's stories for educational effectiveness using evidence-based criteria. You understand developmental reading research, CCSS standards, and Lexile framework requirements.`;

    const user = `COMPREHENSIVELY EVALUATE this ${gradeDisplay} story for complete educational effectiveness:

STORY TO EVALUATE:
${JSON.stringify(story, null, 2)}

INPUT SPECIFICATIONS:
• Target grade: ${gradeDisplay}
• Required phonics: "${input.phonicSkill}" (pattern: ${phonicsPattern})
• Genre: ${input.genre}
• Theme: ${input.theme}
• Expected length: ${input.length} sentences

RESEARCH-BASED EVALUATION FRAMEWORK:

1. DEVELOPMENTAL APPROPRIATENESS (0.0-1.0)
Assess against ${gradeDisplay} research requirements:
• Sentence length: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words per sentence
• Syllable complexity: ≤${constraints.maxSyllablesPerWord} syllables per word
• Vocabulary tier: ${constraints.vocabularyTier}  
• Syntax: Only ${constraints.allowedStructures.join(', ')} structures
• Forbidden: ${constraints.forbiddenStructures.join(', ')}
• Lexile appropriateness: ${constraints.lexileRange}

2. PHONICS INTEGRATION EFFECTIVENESS (0.0-1.0)
Evaluate educational phonics support:
• Natural use of "${phonicsPattern}" pattern (target: 3-4 words minimum)
• Words feel authentic within story context, not forced
• Distribution supports skill reinforcement across story
• Integration enhances rather than disrupts narrative flow
• Appropriate for ${gradeDisplay} phonological development

3. EDUCATIONAL STORY QUALITY (0.0-1.0)
Assess pedagogical effectiveness:
• Narrative structure appropriate for cognitive development stage
• Characters and conflicts match emotional maturity level
• Educational value beyond phonics (social-emotional learning)
• Language models grade-appropriate communication
• Motivational appeal for sustained reading engagement
• Content supports comprehension development

4. INSTRUCTIONAL READINESS (0.0-1.0)  
Determine classroom effectiveness:
• Story length matches attention span expectations
• Complexity appropriate for independent/guided reading
• Content suitable for repeated readings (phonics practice)
• Themes relevant to ${gradeDisplay} social-emotional needs
• Text supports fluency development

DETAILED ANALYSIS REQUIRED:
• Examine each sentence individually for compliance
• Identify specific educational strengths and weaknesses
• Prioritize issues by impact on learning outcomes
• Provide actionable improvement recommendations
• Assess overall instructional value

Return this EXACT structure:
{
  "overallEducationalScore": 0.0-1.0,
  "componentScores": {
    "developmentalAppropriateness": 0.0-1.0,
    "phonicsIntegration": 0.0-1.0,
    "storyQuality": 0.0-1.0,
    "instructionalReadiness": 0.0-1.0
  },
  "meetsEducationalStandards": true/false,
  "readyForInstruction": true/false,
  "sentenceAnalysis": [
    {
      "sentence": "exact sentence text",
      "wordCount": actual_count,
      "issues": ["specific problems with educational rationale"],
      "strengths": ["positive educational elements"],
      "priority": "critical/important/minor",
      "recommendation": "specific improvement needed"
    }
  ],
  "phonicsAssessment": {
    "patternFound": "actual pattern identified",
    "wordsIdentified": ["words", "with", "pattern"],
    "totalCount": number,
    "distribution": "even/uneven/clustered",
    "naturalness": "natural/forced/artificial",
    "educationalEffectiveness": "explanation of learning support"
  },
  "educationalStrengths": ["specific positive elements for learning"],
  "criticalIssues": ["problems that impede educational effectiveness"],
  "improvementPriorities": ["ordered by impact on learning outcomes"],
  "instructionalRecommendations": "specific guidance for educational use",
  "developmentalAlignment": "assessment of grade-level appropriateness"
}

EVALUATION STANDARDS:
• HIGH scores (0.85+) only for stories that expertly meet all research criteria
• MEDIUM scores (0.70-0.84) for good stories with minor issues
• LOW scores (<0.70) for stories needing significant educational improvements
• Focus on learning effectiveness over entertainment value
• Prioritize developmental appropriateness and phonics integration
• Consider real classroom implementation needs`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

/**
 * Generate targeted educational revision messages
 * Focuses on specific pedagogical improvements rather than general fixes
 */
export function messagesForPedagogicalRevision(sentence, issues, input, storyContext) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const phonicsWords = getPhonicsWordBank(input.phonicSkill, input.gradeLevel);
    const phonicsPattern = extractPhonicsPattern(input.phonicSkill);

    const sys = `You are a literacy specialist who revises sentences to meet specific educational research requirements while maintaining narrative quality and natural phonics integration. You understand developmental reading progression and evidence-based instruction.`;

    const user = `EDUCATIONALLY REVISE this sentence to meet ${gradeDisplay} research standards:

ORIGINAL SENTENCE: "${sentence}"
IDENTIFIED EDUCATIONAL ISSUES: ${issues.join('; ')}
STORY CONTEXT: ${storyContext}

${gradeDisplay.toUpperCase()} EDUCATIONAL REQUIREMENTS:
• Word count: EXACTLY ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words
• Syllable limit: Maximum ${constraints.maxSyllablesPerWord} per word (research-based)
• Vocabulary: Use only ${constraints.vocabularyTier} 
• Syntax: Limited to ${constraints.allowedStructures.join(', ')}
• Phonics: Include "${phonicsPattern}" pattern naturally
• Avoid: ${constraints.forbiddenStructures.join(', ')} structures

AVAILABLE PHONICS WORDS (by research): ${phonicsWords.join(', ')}

EDUCATIONAL REVISION PRINCIPLES:
• Support ${gradeDisplay} reading fluency development
• Reinforce phonics learning through authentic usage
• Build systematic vocabulary at appropriate tier
• Model syntactic patterns for developmental stage  
• Maintain story engagement and narrative coherence
• Ensure repeated reading value for phonics practice

RESEARCH-BASED STRATEGIES:
• Replace advanced words with ${gradeDisplay}-appropriate alternatives from research word lists
• Adjust sentence structure to match cognitive development evidence
• Integrate phonics naturally into meaningful actions/descriptions
• Use concrete, sensory language that supports comprehension
• Maintain character consistency and emotional authenticity

SUCCESS CRITERIA:
✓ Exact word count: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence}
✓ All words ≤${constraints.maxSyllablesPerWord} syllables
✓ Natural ${phonicsPattern} integration
✓ Grade-appropriate vocabulary tier
✓ Developmentally suitable syntax
✓ Educational effectiveness for repeated readings

Return EXACT JSON format:
{
  "revisedSentence": "Educationally optimized sentence meeting ALL research criteria",
  "wordCount": actual_count,
  "educationalImprovements": "specific pedagogical enhancements made",
  "phonicsIntegration": "how ${phonicsPattern} pattern supports learning",  
  "developmentalAppropriateness": "alignment with ${gradeDisplay} research",
  "vocabularyJustification": "why word choices support grade-level learning",
  "syntaxAlignment": "how structure matches developmental expectations",
  "instructionalValue": "educational benefits for classroom use",
  "issuesResolved": ["original problems fixed with educational rationale"]
}

CRITICAL: The revision must be educationally superior while maintaining story quality and natural phonics integration.`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

/**
 * Generate messages for quality assessment focused on educational effectiveness
 * Replaces generic scoring with pedagogy-focused evaluation
 */
export function messagesForEducationalQualityCheck(story, input) {
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const constraints = getGradeConstraints(input.gradeLevel);

    const sys = `You are an educational content specialist who assesses children's stories for classroom readiness and instructional effectiveness based on literacy research and educational standards.`;

    const user = `ASSESS educational quality and classroom readiness for this ${gradeDisplay} story:

STORY: ${JSON.stringify(story, null, 2)}
TARGET: ${gradeDisplay} phonics instruction with "${input.phonicSkill}"

EDUCATIONAL QUALITY FRAMEWORK:

1. INSTRUCTIONAL EFFECTIVENESS
• Supports systematic phonics instruction
• Appropriate cognitive load for grade level
• Scaffolds reading skill development  
• Enables repeated reading for practice
• Motivates continued engagement

2. DEVELOPMENTAL ALIGNMENT  
• Matches ${gradeDisplay} attention span
• Appropriate emotional/social content
• Language complexity suits reading level
• Content connects to student experiences
• Supports comprehension development

3. CLASSROOM IMPLEMENTATION
• Length appropriate for lesson timing
• Content suitable for diverse learners
• Supports both guided and independent reading
• Facilitates discussion and extension activities
• Meets curriculum standards integration

Return focused assessment:
{
  "educationalQualityScore": 0.0-1.0,
  "classroomReadiness": true/false,
  "instructionalStrengths": ["specific educational benefits"],
  "pedagogicalConcerns": ["issues affecting learning outcomes"],
  "implementationGuidance": "specific suggestions for classroom use",
  "differentiationPotential": "how story supports diverse learners",
  "curriculumAlignment": "standards and objectives supported"
}`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
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
 * Legacy compatibility exports - these can be removed once pipeline is updated
 */
export function messagesForPass1(input, drafts, temperature) {
    // Convert to new educational story approach
    return messagesForEducationalStory(input);
}

export function messagesForPass2(selected, input) {
    // This is now handled in the main educational story generation
    return messagesForEducationalStory(input);
}

export function messagesForPass3(story, input, threshold) {
    // Convert to comprehensive evaluation
    return messagesForComprehensiveEvaluation(story, input);
}

export function messagesForPass4(originalSentence, input, threshold) {
    // Convert to pedagogical revision
    return messagesForPedagogicalRevision(
        originalSentence.sentence || originalSentence,
        ['needs improvement'],
        input,
        'story context'
    );
}
