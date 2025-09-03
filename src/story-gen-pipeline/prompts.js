import { getGradeConstraints } from "./gradeConstraints.js";
import { getRecommendedVocabularyForGrade, TIER_1_WORDS, TIER_2_WORDS } from "./vocabularyTiers.js";

export function messagesForPass1(input, drafts, temperature) {
    const sys = `You are a master children's story writer who creates engaging, creative stories that captivate young readers. Always respond with valid JSON only.`;

    const user = `
Create ${drafts} HIGHLY CREATIVE and ENGAGING story drafts that young readers will love.

STORY REQUIREMENTS:
- Genre: ${input.genre} (make it exciting and adventurous!)
- Theme: ${input.theme}
- Length: EXACTLY ${input.length} sentences total
- Must be creative, engaging, and avoid repetition

CREATIVITY REQUIREMENTS:
- Each sentence should advance the plot meaningfully
- Include specific actions, emotions, and vivid details
- Use varied sentence structures and vocabulary
- Create a clear story arc: setup → conflict/adventure → resolution
- Make characters distinctive and memorable

STORY STRUCTURE:
- Opening: Introduce characters and setting with intrigue
- Middle: Create adventure, conflict, or exciting events
- Ending: Satisfying resolution that ties to theme

Example of GOOD creative progression:
❌ BAD (repetitive): "Fox meets bear. Fox and bear play. Fox and bear are friends. Fox and bear play more."
✅ GOOD (creative): "Fox discovers scared bear stuck in mud. Fox bravely helps pull bear free. Bear gratefully shares secret honey spot. Fox and bear become best adventure partners."

Return exactly this JSON structure:
{
  "drafts": [
    {
      "title": "Creative Action-Oriented Title",
      "paragraphs": [
        {
          "sentences": [
            { "sentence": "Engaging opening that hooks the reader with action or mystery." }
          ]
        },
        {
          "sentences": [
            { "sentence": "Adventure or conflict develops with specific details." },
            { "sentence": "Characters take meaningful actions to address the situation." }
          ]
        },
        {
          "sentences": [
            { "sentence": "Satisfying resolution with emotional payoff." }
          ]
        }
      ]
    }
  ]
}

CRITICAL: Each sentence must be UNIQUE and MEANINGFUL. NO repetition of ideas or phrases!
Total sentences across ALL paragraphs = EXACTLY ${input.length}
`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}
export function messagesForPass2(selected, input) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = input.gradeLevel === 0 || input.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${input.gradeLevel}`;

    const sys = `You are an expert children's book editor who maintains story creativity while ensuring perfect grade-level appropriateness. Always respond with valid JSON only.`;

    const user = `
Transform this story to be PERFECT for ${gradeDisplay} while keeping it CREATIVE and ENGAGING.

Original Story: ${JSON.stringify(selected, null, 2)}

GRADE-LEVEL REQUIREMENTS FOR ${gradeDisplay.toUpperCase()}:
- Words per sentence: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words (COUNT CAREFULLY!)
- Syllables: Maximum ${constraints.maxSyllablesPerWord} per word
- Sentence types: ${constraints.sentenceStructure}
- Vocabulary: ${constraints.vocabularyTier}
- Phonics focus: "${input.phonicSkill}" (use at least 3 words with this pattern)

QUALITY REQUIREMENTS:
- Keep the story creative and engaging
- Each sentence must be different and meaningful  
- Use vivid, age-appropriate action words
- Include emotions and sensory details
- Maintain clear story progression

PHONICS INTEGRATION:
- Naturally weave in words with "${input.phonicSkill}"
- Examples for "sh": shop, ship, fish, wish, shell, shine, rush, fresh
- Don't force it - make it feel natural

VOCABULARY STRATEGY:
- Use simple, concrete words kids know
- Include action verbs: run, jump, help, find, catch, hide
- Add emotion words: happy, excited, scared, brave, kind
- Use sensory words: bright, loud, soft, sweet, warm

Return the story maintaining exact paragraph structure:
{
  "title": "Engaging ${gradeDisplay}-Appropriate Title",
  "paragraphs": [
    {
      "sentences": [
        { "sentence": "Creative opening with ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words including phonics." }
      ]
    }
  ]
}

Remember: CREATIVITY + GRADE-APPROPRIATENESS = EXCELLENT STORY
`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}
export function messagesForPass3(story, input, threshold) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = input.gradeLevel === 0 || input.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${input.gradeLevel}`;

    const sys = `You are a precise ${gradeDisplay} story quality assessor. Rate stories on creativity, engagement, and educational value. Always respond with valid JSON only.`;

    const user = `
Rate this ${gradeDisplay} story for QUALITY and EDUCATIONAL VALUE.

STORY: ${JSON.stringify(story, null, 2)}

ASSESSMENT CRITERIA:

GENRE SCORE (0.0-1.0):
- 1.0: Perfectly captures ${input.genre} with exciting, age-appropriate adventure
- 0.8: Good genre match with some adventure elements  
- 0.6: Generic story with minimal genre elements
- 0.4: Poor genre match
- 0.2: No clear genre elements

THEME SCORE (0.0-1.0):
- 1.0: Beautifully develops "${input.theme}" with emotional depth
- 0.8: Clearly shows theme with good character development
- 0.6: Theme is present but underdeveloped
- 0.4: Theme barely addressed
- 0.2: Theme missing or unclear

PHONICS SCORE (0.0-1.0):
- 1.0: Natural integration of "${input.phonicSkill}" in 3+ words
- 0.8: Good use of phonics pattern in 2-3 words
- 0.6: Some phonics usage (1-2 words)
- 0.4: Forced or minimal phonics
- 0.2: No phonics pattern usage

GRADE LEVEL SCORE (0.0-1.0):
- 1.0: Perfect ${gradeDisplay} level (word count, vocabulary, structure)
- 0.8: Appropriate with minor issues
- 0.6: Mostly appropriate 
- 0.4: Some difficulty level issues
- 0.2: Too difficult for grade level

CREATIVITY BONUS FACTORS:
+ Vivid, specific details
+ Emotional engagement
+ Clear story progression  
+ Unique character actions
+ Varied sentence structures
+ Sensory language

QUALITY PENALTIES:
- Repetitive sentences or ideas
- Generic/boring content
- Poor story flow
- Unclear character motivations

Return detailed scoring with this structure:
{
  "title": "Story Title",
  "paragraphs": [
    {
      "sentences": [
        {
          "sentence": "Sentence text",
          "genreScore": 0.95,
          "themeScore": 0.92,
          "phonicsScore": 0.88,
          "gradeLevelScore": 0.94,
          "creativityElements": ["specific detail", "emotion", "action"],
          "qualityIssues": ["repetition", "generic"],
          "suggestedRevision": "Only if any score < ${threshold}"
        }
      ]
    }
  ],
  "aggregateScores": {
    "genre": 0.92,
    "theme": 0.95, 
    "phonics": 0.89,
    "gradeLevel": 0.92
  },
  "overallQuality": {
    "creativity": 0.88,
    "engagement": 0.91,
    "educationalValue": 0.93,
    "storyCoherence": 0.89
  }
}

BE TOUGH: Only give high scores (0.9+) to truly excellent, creative stories that kids will love!
`;

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}
export function messagesForPass4(originalSentence, input, threshold) {
    const constraints = getGradeConstraints(input.gradeLevel);
    const gradeDisplay = input.gradeLevel === 0 || input.gradeLevel === 'K' ? 'Kindergarten' : `Grade ${input.gradeLevel}`;
    const recommendedWords = getRecommendedVocabularyForGrade(input.gradeLevel, 15);

    const sys = `You are rewriting a single sentence specifically for ${gradeDisplay} readers using research-validated constraints from CCSS and Lexile Framework. Always respond with valid JSON only.`;

    const user = `
Original sentence: ${JSON.stringify(originalSentence)}

REWRITE FOR ${gradeDisplay.toUpperCase()} LEVEL USING RESEARCH-BASED CONSTRAINTS:

STRICT REQUIREMENTS (Research-Validated):
- Word count: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words (COUNT CAREFULLY)
- Syllable limit: Maximum ${constraints.maxSyllablesPerWord} syllables per word
- Vocabulary: ${constraints.vocabularyTier}
- Structure: ${constraints.sentenceStructure}
- Lexile target: ${constraints.lexileRange}
- Phonics emphasis: "${input.phonicSkill}"
- Genre: ${input.genre}
- Theme: ${input.theme}
- Target quality: All scores ≥ ${threshold}

SYNTACTIC CONSTRAINTS:
- MUST USE: ${constraints.allowedStructures.join(', ')}
- NEVER USE: ${constraints.forbiddenStructures.join(', ')}

VOCABULARY GUIDANCE:
- Recommended words for ${gradeDisplay}: ${recommendedWords.slice(0, 10).join(', ')}
- AVOID: ${constraints.avoidWords.join(', ')}

RESEARCH-VALIDATED EXAMPLES for ${gradeDisplay}:
${constraints.examples.map(ex => `"${ex}"`).join('\n')}

REVISION PROCESS:
1. Count words in original (currently: ${originalSentence.sentence ? originalSentence.sentence.split(' ').length : 'unknown'})
2. Identify words > ${constraints.maxSyllablesPerWord} syllables
3. Check sentence structure against allowed patterns
4. Simplify vocabulary to appropriate tier
5. Integrate phonics skill: "${input.phonicSkill}"
6. Verify final word count: ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence} words
7. Confirm no forbidden structures used

Return valid JSON:
{ "revisedText": "Perfect ${gradeDisplay} sentence meeting all research criteria." }

CRITICAL SUCCESS CRITERIA:
□ Word count within ${constraints.minWordsPerSentence}-${constraints.maxWordsPerSentence}
□ All words ≤ ${constraints.maxSyllablesPerWord} syllables
□ Uses only allowed structures: ${constraints.allowedStructures.join(', ')}
□ Vocabulary matches ${constraints.vocabularyTier}
□ Phonics skill emphasized
□ Maintains story meaning and ${input.theme} theme
□ Appropriate for ${constraints.lexileRange} reading level

The revised sentence must pass rigorous ${gradeDisplay} readability standards based on educational research.
`.trim();

    return [
        { role: "system", content: sys },
        { role: "user", content: user }
    ];
}
