import { Actor } from 'apify';
import { BasicCrawler } from 'crawlee';

import { analyzeInputAndUpdateState } from './analyzer.js';

await Actor.init();

interface Input {
    runIds: string[],
    fieldsOnlyCountPresent: string[],
}

// We have any there because we can do recursive iteration
export type State = Record<string, any>;

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
            const { defaultKeyValueStoreId } = run;
            const runInput = (await client.keyValueStore(defaultKeyValueStoreId).getRecord('INPUT'))!.value as Record<string, any>;
            analyzeInputAndUpdateState(state, runInput, { fieldsOnlyCountPresent });
        }
    },
});

await crawler.run(requests);

await Actor.setValue('OUTPUT', state);
await Actor.pushData(state);

// Exit successfully
await Actor.exit();
