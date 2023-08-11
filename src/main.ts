import { Actor, log } from 'apify';
import { BasicCrawler } from 'crawlee';

import { analyzeInputAndUpdateState } from './analyzer.js';
import { sortStateObject } from './utils.js';

await Actor.init();

interface Input {
    runIds: string[],
    fieldsOnlyCountPresent: string[],
}

// We have to do this madness to workaround TS recursion limitation
type StateValue = number | InnerState;

export interface InnerState extends Record<string, StateValue> {
    __total__: number,
    __used__: number,
    __empty__: number,
}
export type State = Record<string, InnerState>

const {
    runIds = [],
    fieldsOnlyCountPresent = [],
}: Input = (await Actor.getInput())!;

const client = Actor.newClient();

const requests = runIds.map((runId) => {
    return {
        url: 'https://example.com', // dummy
        uniqueKey: runId,
    };
});

const state: State = await Actor.getValue('STATE') || {};
Actor.on('persistState', async () => {
    await Actor.setValue('STATE', state);
});

const crawler = new BasicCrawler({
    maxConcurrency: 10,
    // If there is no run, we just fail and skip
    maxRequestRetries: 0,
    requestHandler: async ({ request }) => {
        const runId = request.uniqueKey;
        const run = await client.run(runId).get();
        if (run) {
            log.info(`Processing run ${runId}`);
            const { defaultKeyValueStoreId } = run;
            const runInput = (await client.keyValueStore(defaultKeyValueStoreId).getRecord('INPUT'))!.value as Record<string, any>;
            analyzeInputAndUpdateState(state, runInput, { fieldsOnlyCountPresent });
        } else {
            log.warning(`Run ${runId} not found, perhaps it is after retention period?`);
        }
    },
});

await crawler.run(requests);

sortStateObject(state);

await Actor.setValue('OUTPUT', state);
await Actor.pushData(state as Record<string, any>);

// Exit successfully
await Actor.exit();
