import type { InnerState, State } from './main.js';

const DEFAULT_FIELDS = ['__total__', '__used__', '__empty__'];

// We have the object as reference so we have to do it this ugly field replacement
const getSortedObject = (obj: Record<string, number>) => {
    const keysWithoutDefault = Object.keys(obj).filter((field) => !DEFAULT_FIELDS.includes(field));
    keysWithoutDefault.sort((a, b) => obj[b] - obj[a]);

    // Create holder object
    const sortedInnerStateFinal = {} as Record<string, number>;
    for (const defaulField of DEFAULT_FIELDS) {
        sortedInnerStateFinal[defaulField] = obj[defaulField] as number;
    }
    for (const key of keysWithoutDefault) {
        // JS always sort integers strings in ascending order for some reason
        // so we have no choice but to add space in front of the key
        const sanitizedKey = Number.isInteger(Number(key)) ? ` ${key}` : key;
        sortedInnerStateFinal[sanitizedKey] = obj[key] as number;
    }

    return sortedInnerStateFinal;
};

// We need to pass parent and key to be able to replace the inner object with sorted one
// Unfortunately, you cannot resort object with 'delete' keyword
const sortInnerStateRecursively = (parent: State, key: string) => {
    const innerState = parent[key];
    // Skip sorting empty object that only has the 3 default members
    const keysWithoutDefault = Object.keys(innerState).filter((field) => !DEFAULT_FIELDS.includes(field));
    if (keysWithoutDefault.length === 0) {
        return;
    }

    const isFinal = typeof innerState[keysWithoutDefault[0]] === 'number';
    console.log(`first key: ${keysWithoutDefault[0]}, ${typeof innerState[keysWithoutDefault[0]]}`)
    if (isFinal) {
        // Now we know this is final state, TS is too stupid here
        parent[key] = getSortedObject(innerState as Record<string, number>) as InnerState;
    } else {
        for (const innerKey of Object.keys(innerState)) {
            if (DEFAULT_FIELDS.includes(innerKey)) {
                continue;
            }
            sortInnerStateRecursively(innerState as State, innerKey);
        }
    }
};
/**
 * Sorts by numeric value
 */
export const sortStateObject = (obj: State) => {
    for (const key of Object.keys(obj)) {
        console.log(`sroting key ${key}`);
        sortInnerStateRecursively(obj, key);
    }
};
