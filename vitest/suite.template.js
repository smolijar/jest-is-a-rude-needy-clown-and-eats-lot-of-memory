import { test, expect } from 'vitest';
const testBody = require('../test-body');

for (t = 0; t < process.env.TEST_COUNT; t++) {
    test(`${__filename}--${t}`, async () => {
        expect(true).toBe(true);
        await testBody()
	    expect(true).toBe(true);
    })
}