var assert = require('assert');
const expect = require('chai').expect;
describe('Basic Mocha String Test', function () {
 it('new test 1 ', function () {
     driver.pause(4000)
    expect('bar').to.equal('bar');
    });
 it('new test 2', function () {
    driver.pause(4000)
    expect('foo').to.have.lengthOf(3);
    });
});