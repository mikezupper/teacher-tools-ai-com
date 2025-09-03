// db/StoryAppDB.js
import Dexie, {liveQuery} from 'dexie';
import {combineLatest} from "rxjs";
import{map} from "rxjs/operators";
export const StoryAppDB = new Dexie('teacher-tools-ai-stories');
const TOTAL_STEPS = 5;

StoryAppDB.version(1).stores({
    stories: '++id, title, theme, gradeLevel, phonicSkill, genre, length, paragraphs, educationalAnalysis, finalReport, content, storyMarkdown, imageUrl, imageBlob, pipelineGenerated, generatedAt, createdAt, updatedAt',
    prompts: '++id, storyId, promptText',
    questions: '++id, storyId, questionText, type, options, metadata',
    metadata: 'key, value'
})

/** Save or update a story record */
export const saveStory = async (story) => {
    // Add timestamps
    const now = new Date().toISOString();
    const storyToSave = {
        ...story,
        updatedAt: now
    };

    if (!story.id) {
        storyToSave.createdAt = now;
    }

    const storyId = await StoryAppDB.stories.put(storyToSave);

    // If this is a new story (no existing id), set currentStep to 1
    if (!story.id) {
        await saveMetadata(`currentStep:${storyId}`, 1);
    }

    return storyId;
};

export const getStoryById$ = storyId =>
    liveQuery(() =>
        StoryAppDB.stories.get(Number(storyId))
    );

export const getQuestionsByStoryId$ = storyId =>
    liveQuery(() =>
        StoryAppDB.questions
            .where('storyId')
            .equals(Number(storyId))
            .toArray()
    );

export const getPromptsByStoryId$ = storyId =>
    liveQuery(() =>
        StoryAppDB.prompts
            .where('storyId')
            .equals(Number(storyId))
            .toArray()
    );

/**
 * Emits { story, questions, prompts } whenever any of those tables change.
 */
export const getFullStory$ = storyId =>
    combineLatest([
        getStoryById$(storyId),
        getQuestionsByStoryId$(storyId),
        getPromptsByStoryId$(storyId)
    ]).pipe(
        map(([story, questions, prompts]) => ({
            ...story,
            questions,
            prompts
        }))
    );

export const getStoryAndQuestions$ = storyId =>
    combineLatest([
        getStoryById$(storyId),
        getQuestionsByStoryId$(storyId)
    ]).pipe(
        map(([story, questions]) => ({
            ...story,
            questions
        }))
    );

/** Get a story by its ID - throws error if not found */
export const getStoryById = async (id) => {
    const story = await StoryAppDB.stories.get(id);
    if (!story) {
        throw new Error(`Story with ID ${id} not found`);
    }

    [ story.prompts, story.questions ] = await Promise.all([
        getPromptsByStoryId(story.id),
        getQuestionsByStoryId(story.id)
    ]);
    return story;
};

/** Save multiple prompts for a story */
export const savePrompts = async (storyId, prompts) => {
    // Clear existing prompts for this story
    await StoryAppDB.prompts.where('storyId').equals(storyId).delete();

    if (prompts.length > 0) {
        const entries = prompts.map((p) => ({ storyId, promptText: p }));
        await StoryAppDB.prompts.bulkPut(entries);
    }

    // Update currentStep to 4 when prompts are saved
    await saveMetadata(`currentStep:${storyId}`, 4);

    return prompts.length;
};

/** Mark story as completed */
export const markStoryCompleted = async (storyId) => {
    await saveMetadata(`completed:${storyId}`, true);
    await saveMetadata(`currentStep:${storyId}`, 5);
};

/** Check if story is completed */
export const isStoryCompleted = async (storyId) => {
    const completed = await getMetadata(`completed:${storyId}`);
    return completed === true;
};

/** Get all prompts for a given story ID */
export const getPromptsByStoryId = async (storyId) => {
    return await StoryAppDB.prompts.where('storyId').equals(storyId).toArray();
};

/** Save multiple questions for a story */
export const saveQuestions = async (storyId, questions) => {
    // Clear existing questions for this story
    await StoryAppDB.questions.where('storyId').equals(storyId).delete();

    if (questions.length > 0) {
        const entries = questions.map((q) => ({
            storyId,
            questionText: q.text || q.questionText,
            type: q.type,
            // ADD: Save options for Multiple Choice questions
            options: q.options || null,
            // ADD: Save any additional question metadata
            metadata: {
                hasOptions: !!(q.options && q.options.length > 0),
                optionsCount: q.options ? q.options.length : 0
            }
        }));
        await StoryAppDB.questions.bulkPut(entries);
    }

    // Update currentStep to 3 when questions are saved
    await saveMetadata(`currentStep:${storyId}`, 3);

    return questions.length;
};

/** Get all questions for a given story ID */
export const getQuestionsByStoryId = async (storyId) => {
    return await StoryAppDB.questions.where('storyId').equals(storyId).toArray();
};

/** Save image URL for a story */
export const saveStoryImage = async (storyId, imageBlob) => {
    const id = Number(storyId);

    // update only the imageBlob _and_ currentStep in one go
    const count = await StoryAppDB.stories.update(id, {
        imageBlob,
        currentStep: 2,
        updatedAt: new Date().toISOString()
    });

    if (!count) {
        throw new Error(`Story ${id} not found, nothing was updated`);
    }

    return storyId;
};

/** Skip image for a story (save null) */
export const skipStoryImage = async (storyId) => {
    const story = await getStoryById(storyId);
    story.imageBlob = null;
    story.updatedAt = new Date().toISOString();
    await StoryAppDB.stories.put(story);

    // Update currentStep to 2 when image step is completed (even if skipped)
    await saveMetadata(`currentStep:${storyId}`, 2);

    return storyId;
};

/** Save metadata key-value pair */
export const saveMetadata = async (key, value) => {
    return await StoryAppDB.metadata.put({ key, value });
};

/** Get metadata value by key */
export const getMetadata = async (key) => {
    const rec = await StoryAppDB.metadata.get(key);
    return rec ? rec.value : null;
};

/** Get current step for a story */
export const getCurrentStep = async (storyId) => {
    const currentStep = await getMetadata(`currentStep:${storyId}`);
    return currentStep || 0;
};

/** Set current step for a story */
export const setCurrentStep = async (storyId, step) => {
    return await saveMetadata(`currentStep:${storyId}`, step);
};

/** Fetch all stories in creation order */
export const fetchAllStories = async () => {
    return await StoryAppDB.stories.orderBy('id').reverse().toArray();
};

/** Compute dashboard stats */
export const fetchDashboardStats = async () => {
    const stories = await fetchAllStories();
    const total = stories.length;

    // Count completed stories using completion flag
    const completedCount = await Promise.all(
        stories.map(async (story) => {
            return await isStoryCompleted(story.id);
        })
    );

    const completed = completedCount.filter(Boolean).length;
    const inProgress = total - completed;

    return { total, completed, inProgress };
};

/** Delete a story and all related data */
export const deleteStory = async (id) => {
    // Delete related data
    await StoryAppDB.prompts.where('storyId').equals(id).delete();
    await StoryAppDB.questions.where('storyId').equals(id).delete();
    await StoryAppDB.metadata.where('key').startsWith(`currentStep:${id}`).delete();
    await StoryAppDB.metadata.where('key').startsWith(`completed:${id}`).delete();

    // Delete the story itself
    return await StoryAppDB.stories.delete(id);
};

/** Duplicate a story - returns the new story ID */
export const duplicateStory = async (origStory) => {
    // Create new story without id, with new timestamp
    const { id, createdAt, updatedAt, ...storyData } = origStory;
    const now = new Date().toISOString();

    const newStoryData = {
        ...storyData,
        createdAt: now,
        updatedAt: now
    };

    const newStoryId = await StoryAppDB.stories.put(newStoryData);

    // Copy related data
    const [prompts, questions] = await Promise.all([
        getPromptsByStoryId(id),
        getQuestionsByStoryId(id)
    ]);

    if (prompts.length > 0) {
        const newPrompts = prompts.map(p => ({ storyId: newStoryId, promptText: p.promptText }));
        await StoryAppDB.prompts.bulkPut(newPrompts);
    }

    if (questions.length > 0) {
        const newQuestions = questions.map(q => ({
            storyId: newStoryId,
            questionText: q.questionText,
            type: q.type
        }));
        await StoryAppDB.questions.bulkPut(newQuestions);
    }

    // Set currentStep for duplicated story
    const originalStep = await getCurrentStep(id);
    await setCurrentStep(newStoryId, originalStep);

    return newStoryId;
};

/** Fetch a story's completion status and progress */
export const fetchStoryStatus = async (storyId) => {
    const [currentStep, isCompleted] = await Promise.all([
        getCurrentStep(storyId),
        isStoryCompleted(storyId)
    ]);

    const isDone = isCompleted;
    const progress = isCompleted ? 100 : Math.round((currentStep / TOTAL_STEPS) * 100);

    return {
        currentStep,
        isDone,
        progress,
        totalSteps: TOTAL_STEPS
    };
};
