// pipeline.js - REVISED: LLM-focused educational story pipeline

import { chatJson } from "./aiClient.js";
import { withTiming } from "./analytics.js";
import { getGradeConstraints } from "./gradeConstraints.js";
import { getPhonicsWordBank, extractPhonicsPattern } from "./phonicsUtils.js";

export async function runPipelineCore(input, options = {}) {
    const maxRevisionCycles = options.maxRevisionCycles ?? 2;
    const qualityThreshold = options.qualityThreshold ?? 0.75;

    let currentStory = null;
    let finalEvaluation = null;

    // Pass 1: Generate phonics-integrated story
    {
        const t = withTiming("story-generation", 1, options.analytics);
        try {
            currentStory = await chatJson(
                messagesForPhonicsStory(input),
                {
                    temperature: 0.8,
                    signal: options.signal,
                    maxTokens: options.maxTokens ?? 8192
                }
            );

            t.end(true, {
                title: currentStory.title,
                sentences: getTotalSentenceCount(currentStory),
                phonicsTarget: input.phonicSkill
            });
        } catch (e) {
            t.end(false, { error: String(e) });
            throw e;
        }
    }

    // Pass 2: Comprehensive LLM evaluation
    let revisionCycle = 0;
    while (revisionCycle < maxRevisionCycles) {
        const t = withTiming("story-evaluation", 2, options.analytics);
        try {
            finalEvaluation = await chatJson(
                messagesForStoryEvaluation(currentStory, input),
                {
                    temperature: 0.3,
                    signal: options.signal,
                    maxTokens: options.maxTokens ?? 8192
                }
            );

            t.end(true, {
                overallScore: finalEvaluation.overallScore,
                meetsStandards: finalEvaluation.meetsStandards,
                criticalIssues: finalEvaluation.criticalIssues?.length || 0
            });

            // Check if story meets standards or if we should revise
            if (finalEvaluation.meetsStandards && finalEvaluation.overallScore >= qualityThreshold) {
                console.log(`✅ Story meets quality standards (score: ${finalEvaluation.overallScore.toFixed(3)})`);
                break;
            }

            if (revisionCycle >= maxRevisionCycles - 1) {
                console.log(`⚠️ Maximum revision cycles reached. Final score: ${finalEvaluation.overallScore.toFixed(3)}`);
                break;
            }

            // Pass 3: Targeted revisions
            if (finalEvaluation.sentenceRevisions && finalEvaluation.sentenceRevisions.length > 0) {
                await performTargetedRevisions(currentStory, finalEvaluation, input, options);
                revisionCycle++;
            } else {
                break;
            }

        } catch (e) {
            t.end(false, { error: String(e) });
            console.warn(`Evaluation cycle ${revisionCycle + 1} failed:`, e.message);
            break;
        }
    }

    // Attach final evaluation to story
    currentStory.pipeline = {
        finalEvaluation,
        revisionCycles: revisionCycle,
        qualityThreshold,
        timestamp: new Date().toISOString()
    };

    return currentStory;
}

async function performTargetedRevisions(story, evaluation, input, options) {
    const t = withTiming("targeted-revisions", 3, options.analytics);

    try {
        // Focus on most critical revisions only (top 3)
        const criticalRevisions = evaluation.sentenceRevisions
            .filter(rev => rev.priority === 'critical' || rev.priority === 'important')
            .slice(0, 3);
        console.log(`Processing ${criticalRevisions.length} revisions...`);

        let revisionsApplied = 0;
        const storyContext = getStoryContext(story);

        for (const revision of criticalRevisions) {
            try {
                console.log(`Revising: "${revision.original}"`);
                const improved = await chatJson(
                    messagesForEducationalRevision(
                        revision.original,
                        revision.issues || [],
                        input,
                        storyContext
                    ),
                    {
                        temperature: 0.4,
                        signal: options.signal,
                        maxTokens: options.maxTokens ?? 4096
                    }
                );

                if (improved.revisedSentence && improved.revisedSentence.trim() !== revision.original.trim()) {
                    updateSentenceInStory(story, revision.original, improved.revisedSentence);
                    revisionsApplied++;
                    console.log(`   ✏️ Applied: "${improved.revisedSentence}"`);
                } else {
                    console.log(`   ⚠️ No change made to: "${revision.original}"`);
                }
            } catch (revisionError) {
                console.warn(`Failed to revise: "${revision.original}" - ${revisionError.message}`);
            }
        }

        t.end(true, {
            criticalRevisions: criticalRevisions.length,
            revisionsApplied
        });

    } catch (e) {
        t.end(false, { error: String(e) });
        throw e;
    }
}

function messagesForPhonicsStory(input) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const phonicsWords = getPhonicsWordBank(input.phonicSkill, input.gradeLevel);

    const sys = `You are a master children's story writer specializing in phonics-integrated narratives. You create engaging stories that naturally incorporate specific phonics patterns while maintaining high literary quality for specific grade levels.`;

    const user = `CREATE an engaging ${input.length}-sentence story for ${gradeDisplay} that masterfully integrates "${input.phonicSkill}" phonics.

STORY PARAMETERS:
• Genre: ${input.genre} 
• Theme: ${input.theme}
• Grade: ${gradeDisplay} (${constraints.lexileRange})
• Phonics focus: "${input.phonicSkill}"
• Total sentences: EXACTLY ${input.length}

PHONICS INTEGRATION STRATEGY:
• Use 3-4 words with target pattern naturally throughout story
• Available phonics words: ${phonicsWords.join(', ')}
• Create additional appropriate words if needed
• Make phonics words central to plot/character actions
• Ensure natural story flow, not forced insertion

GRADE ${input.gradeLevel} RESEARCH-BASED CONSTRAINTS:
• ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words per sentence
• Maximum ${constraints.maxSyllablesPerWord} syllables per word
• Sentence structures: ${constraints.allowedStructures.join(', ')}
• AVOID: ${constraints.forbiddenStructures.join(', ')}
• Vocabulary level: ${constraints.vocabularyTier}
• Lexile target: ${constraints.lexileRange}

QUALITY REQUIREMENTS:
• Clear story arc: setup → conflict/adventure → resolution
• Age-appropriate emotional depth and character development
• Rich, specific details that create vivid mental pictures
• Educational value beyond phonics (social/emotional learning)
• Each sentence advances plot meaningfully

EXAMPLES OF EXCELLENT PHONICS INTEGRATION:
• Action-driven: "Fox rushed through the brush to help Bear"
• Descriptive: "The shell shimmered and shone in bright sunshine"  
• Character-focused: "She wished to share the fresh fish with friends"

CRITICAL: Return ONLY valid JSON. No explanatory text, no markdown, no prefixes. 
Return EXACTLY this JSON structure:
{
  "title": "Engaging, Action-Oriented Title",
  "paragraphs": [
    {
      "sentences": [
        { 
          "sentence": "Perfect grade-appropriate sentence with natural phonics integration",
          "phonicsWords": ["list", "of", "phonics", "words"],
          "wordCount": actual_word_count,
          "designNotes": "Brief explanation of educational value"
        }
      ]
    }
  ],
  "phonicsIntegration": {
    "targetPattern": "${input.phonicSkill}",
    "totalPhonicsWords": number,
    "integrationStrategy": "explanation of how phonics supports story naturally"
  },
  "gradeLevel": "${input.gradeLevel}",
  "educationalFocus": "primary learning objectives beyond phonics"
}

CRITICAL: Count words carefully. Each sentence must be ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words exactly.`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

function messagesForStoryEvaluation(story, input) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);

    const sys = `You are an expert children's literacy specialist who evaluates stories for grade-level appropriateness, phonics integration, and educational quality. You understand research-based constraints from CCSS and Lexile frameworks.`;

    const user = `EVALUATE this ${gradeDisplay} story for COMPLETE EDUCATIONAL EFFECTIVENESS:

STORY TO EVALUATE:
${JSON.stringify(story, null, 2)}

GRADE ${input.gradeLevel} RESEARCH REQUIREMENTS:
• Sentence length: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words
• Syllable limit: ${constraints.maxSyllablesPerWord} per word  
• Vocabulary tier: ${constraints.vocabularyTier}
• Sentence structures: ${constraints.allowedStructures.join(', ')}
• FORBIDDEN structures: ${constraints.forbiddenStructures.join(', ')}
• Phonics skill: "${input.phonicSkill}"
• Target phonics words needed: 3-4 minimum
• Lexile range: ${constraints.lexileRange}

COMPREHENSIVE EVALUATION FRAMEWORK:

1. GRADE-LEVEL APPROPRIATENESS (0.0-1.0)
   - Sentence word counts within ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence}
   - Syllable complexity appropriate (≤${constraints.maxSyllablesPerWord} per word)
   - Vocabulary matches cognitive development stage
   - Syntax follows developmental progression research
   - No forbidden structures: ${constraints.forbiddenStructures.join(', ')}

2. PHONICS INTEGRATION (0.0-1.0) 
   - Natural incorporation of "${input.phonicSkill}" pattern
   - Sufficient repetition for skill reinforcement (3-4 words minimum)
   - Words feel authentic within story context, not forced
   - Supports phonological awareness development

3. EDUCATIONAL STORY QUALITY (0.0-1.0)
   - Engaging plot with clear beginning/middle/end appropriate for age
   - Character development matches cognitive/emotional maturity
   - Educational value beyond phonics (social-emotional learning)
   - Language models grade-appropriate communication patterns

4. SPECIFIC IMPROVEMENT IDENTIFICATION
   - Identify exact sentences with issues
   - Prioritize most educationally critical problems
   - Suggest specific, actionable changes
   - Focus on research-based developmental appropriateness


CRITICAL: Return ONLY valid JSON. No explanatory text, no markdown, no prefixes. 
Return JSON with detailed explanation
Analyze each sentence individually, then provide comprehensive assessment:
{
  "overallScore": 0.0-1.0,
  "gradeAppropriateScore": 0.0-1.0,
  "phonicsScore": 0.0-1.0, 
  "storyQualityScore": 0.0-1.0,
  "meetsStandards": true/false,
  "criticalIssues": ["specific problems that impede learning"],
  "improvementPriorities": ["ordered by educational importance"],
  "sentenceRevisions": [
    {
      "original": "exact sentence text",
      "issues": ["word count", "syllable complexity", "vocabulary tier", "syntax structure"],
      "priority": "critical/important/minor",
      "suggestedDirection": "specific improvement guidance"
    }
  ],
  "phonicsAnalysis": {
    "targetPattern": "extracted phonics pattern", 
    "wordsFound": ["actual", "words", "with", "pattern"],
    "wordCount": number,
    "integration": "natural/forced/insufficient",
    "educationalEffectiveness": "assessment of learning support"
  },
  "gradeLevelAnalysis": {
    "sentenceComplexityIssues": ["specific problems"],
    "vocabularyAppropriatenessIssues": ["specific problems"],
    "syntaxDevelopmentalIssues": ["specific problems"]
  },
  "educationalRecommendations": "key improvements for learning effectiveness"
}

BE RIGOROUS: Only high scores (0.85+) for truly exceptional, educationally sound stories that perfectly match grade-level research requirements.`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

function messagesForEducationalRevision(sentence, issues, input, context) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = getGradeDisplay(input.gradeLevel);
    const phonicsWords = getPhonicsWordBank(input.phonicSkill, input.gradeLevel);

    const sys = `You are a literacy education specialist who revises sentences to meet specific grade-level research requirements while maintaining story quality and natural phonics integration.`;

    const user = `REVISE this sentence to meet ${gradeDisplay} educational standards:

ORIGINAL: "${sentence}"
IDENTIFIED ISSUES: ${issues.join(', ')}
STORY CONTEXT: ${context}

REVISION REQUIREMENTS FOR GRADE ${input.gradeLevel}:
• Fix all identified issues while preserving meaning
• Word count: EXACTLY ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words
• Syllable limit: Maximum ${constraints.maxSyllablesPerWord} per word
• Phonics: Include "${input.phonicSkill}" pattern naturally if missing
• Vocabulary: Use only ${constraints.vocabularyTier}
• Sentence structure: ${constraints.allowedStructures.join('/')}
• AVOID: ${constraints.forbiddenStructures.join(', ')}

AVAILABLE PHONICS WORDS: ${phonicsWords.join(', ')}

EDUCATIONAL GOALS:
• Support reading fluency development at ${gradeDisplay} level
• Reinforce phonics learning through natural repetition  
• Build grade-appropriate vocabulary systematically
• Model correct syntax patterns for developmental stage
• Maintain story engagement and emotional connection

REVISION STRATEGIES:
• Replace overly complex words with developmentally appropriate alternatives
• Adjust sentence structure to match research-based developmental expectations
• Integrate phonics words naturally into action/description
• Ensure vocabulary supports comprehension, not frustration
• Maintain narrative flow and character consistency

CRITICAL: Return ONLY valid JSON. No explanatory text, no markdown, no prefixes. 
Return JSON with detailed explanation:
{
  "revisedSentence": "Improved sentence meeting ALL grade-level requirements",
  "wordCount": actual_count,
  "changesExplained": "What was changed and educational rationale",
  "educationalValue": "How this specifically supports ${gradeDisplay} learning objectives",
  "phonicsIntegration": "How phonics pattern was incorporated or maintained",
  "gradeLevelJustification": "Why this meets ${gradeDisplay} developmental appropriateness",
  "issuesResolved": ["list of original issues fixed"]
}

CRITICAL: The revised sentence must be exactly ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words and use only vocabulary/structures appropriate for ${gradeDisplay}.`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}

// Utility functions
function getGradeDisplay(gradeLevel) {
    return gradeLevel === 0 || gradeLevel === 'K' ? 'Kindergarten' : `Grade ${gradeLevel}`;
}

function getTotalSentenceCount(story) {
    if (!story.paragraphs) return 0;
    return story.paragraphs.reduce((total, paragraph) =>
        total + (paragraph.sentences?.length || 0), 0);
}

function getStoryContext(story) {
    const sentences = [];
    story.paragraphs?.forEach(p => {
        p.sentences?.forEach(s => {
            sentences.push(s.sentence);
        });
    });
    return `Story: "${story.title}" - Context: ${sentences.join(' ')}`;
}

function updateSentenceInStory(story, originalSentence, revisedSentence) {
    story.paragraphs?.forEach(paragraph => {
        paragraph.sentences?.forEach(sentenceObj => {
            if (sentenceObj.sentence === originalSentence) {
                sentenceObj.sentence = revisedSentence;
                sentenceObj.revised = true;
                sentenceObj.revisionTimestamp = new Date().toISOString();
            }
        });
    });
}

// Export key functions
export { messagesForPhonicsStory, messagesForStoryEvaluation, messagesForEducationalRevision };
