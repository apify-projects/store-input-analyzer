import type { InnerState, State } from './main.js';

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
export const analyzeInputAndUpdateState = (state: State | InnerState, input: any, options: AnalyzeInputOptions) => {
    const { fieldsOnlyCountPresent } = options;

    // input is either a full input object or a primitive value from recursive iteration
    if (isPrimitive(input)) {
        state[`${input}`] ??= 0;
        (state[`${input}`] as number)++;
        return;
    }

    for (const [key, value] of Object.entries(input)) {
        // We could have this already populated from other run inputs
        state[key] ??= {
            __total__: 0,
            __used__: 0,
            __empty__: 0,
        } as InnerState;
        const innerState = state[key] as InnerState;
        innerState.__total__++;
        if (isFieldEmpty(value)) {
            innerState.__empty__++;
        } else {
            innerState.__used__++;
        }
        if (fieldsOnlyCountPresent.includes(key)) {
            continue;
        }
        if (inNestedValue(value)) {
            if (Array.isArray(value)) {
                for (const item of value) {
                    analyzeInputAndUpdateState(innerState, item, options);
                }
            } else {
                // We can add recursive analysis later if needed
                analyzeInputAndUpdateState(innerState, value, options);
            }
        } else {
            // Normal primitive value we want to track values occurence
            innerState[value as string] ??= 0;
            (innerState[value as string] as number)++;
        }
    }
};
