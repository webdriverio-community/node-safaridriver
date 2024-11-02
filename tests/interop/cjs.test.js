const assert = require('node:assert')
const driver = require('../..')

console.log('Start CJS tests')
assert.equal(typeof driver.start, 'function')
assert.equal(typeof driver.stop, 'function')
console.log('CJS tests passed ✅')
