// utils/abortable.js

/**
 * Creates an abortable operation utility
 * @returns {Object} Object with execute and cancel methods
 */
export function createAbortableOperation() {
    let controller = new AbortController();
    console.log('🔧 Created new AbortController:', controller);

    return {
        execute: async (fn, ...args) => {
            console.log('🔧 execute called with fn:', fn.name || 'anonymous');
            console.log('🔧 Signal aborted status before call:', controller.signal.aborted);

            try {
                // Check if the function is a wrapper function (for cases like generateRandomStoryInput)
                if (args.length === 0 && fn.length === 1) {
                    // This is likely our wrapper function that expects just the signal
                    const result = await fn(controller.signal);
                    console.log('🔧 Function completed successfully (wrapper pattern)');
                    return result;
                } else {
                    // Standard pattern - append signal as last argument
                    const result = await fn(...args, controller.signal);
                    console.log('🔧 Function completed successfully (standard pattern)');
                    return result;
                }
            } catch (error) {
                console.log('🔧 Function threw error:', error.name, error.message);
                throw error;
            }
        },

        cancel: () => {
            console.log('🔧 cancel() called');
            console.log('🔧 Signal aborted status before abort:', controller.signal.aborted);
            controller.abort();
            console.log('🔧 Signal aborted status after abort:', controller.signal.aborted);
        },

        get signal() {
            return controller.signal;
        },

        get isAborted() {
            return controller.signal.aborted;
        }
    };
}
/**
 * Helper function to make any async function abortable
 * @param {Function} fn - Async function to make abortable
 * @param {...any} args - Arguments to pass to function
 * @param {AbortSignal} signal - Abort signal
 * @returns {Promise} Promise that can be aborted
 */
export async function makeAbortable(fn, ...args) {
    const lastArg = args[args.length - 1];

    // If last argument is already an AbortSignal, use it
    if (lastArg instanceof AbortSignal) {
        return fn(...args);
    }

    // Otherwise, create a new AbortController and append signal
    const controller = new AbortController();
    return fn(...args, controller.signal);
}
