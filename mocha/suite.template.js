var assert = require('assert');
const testBody = require('../test-body');

describe(__filename, () => {
    for (t = 0; t < process.env.TEST_COUNT; t++) {
        it(`${__filename}--${t}`, async () => {
            assert.equal(true, true)
            await testBody()
            assert.equal(true, true)
        })
    }
})
