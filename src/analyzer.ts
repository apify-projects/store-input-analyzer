import type { State } from './main.js';

interface AnalyzeInputOptions {
    fieldsOnlyCountPresent: string[],
}

const isFieldEmpty = (value: any) => {
    const isEmpty = value === null || value === undefined || value === '';
    const isEmptyArray = Array.isArray(value) && value.length === 0;
    return isEmpty || isEmptyArray;
};

const inNestedValue = (value: any) => typeof value === 'object' && value !== null;

const isPrimitive = (value: any) => typeof value !== 'object' || value === null;

/**
 * The types are a bit messy since we allow recursive checks
 */
export const analyzeInputAndUpdateState = (state: State, input: any, options: AnalyzeInputOptions) => {
    const { fieldsOnlyCountPresent } = options;

    // input is either a full input object or a primitive value from recursive iteration
    if (isPrimitive(input)) {
        state[`${input}`] ??= 0;
        state[`${input}`]++;
        return;
    }

    for (const [key, value] of Object.entries(input)) {
        if (fieldsOnlyCountPresent.includes(key)) {
            state[key] ??= {
                used: 0,
                empty: 0,
            };
            if (isFieldEmpty(value)) {
                state[key].empty++;
            } else {
                state[key].used++;
            }
        } else if (inNestedValue(value)) {
            state[key] ??= {};
            if (Array.isArray(value)) {
                for (const item of value) {
                    analyzeInputAndUpdateState(state[key], item, options);
                }
            } else {
                // We can add recursive analysis later if needed
                analyzeInputAndUpdateState(state[key], value, options);
                state[key].count++;
            }
        } else {
            // Normal primitive value we want to track values occurence
            state[key] ??= {};
            state[key][value as string] ??= 0;
            state[key][value as string]++;
        }
    }
};
