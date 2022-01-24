const tap = require('tap');
const testBody = require('../test-body');

for (t = 0; t < process.env.TEST_COUNT; t++) {
    tap.test(`${__filename}--${t}`, async t => {
        t.equal(true, true);
        await testBody()
	    t.equal(true, true);
    })
}