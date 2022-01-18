const test = require('ava');
const testBody = require('../test-body');

for (t = 0; t < process.env.TEST_COUNT; t++) {
    test(`${__filename}--${t}`, async t => {
        t.is(true, true);
        await testBody()
	    t.is(true, true);
    })
}