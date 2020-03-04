var assert = require('assert');
var tools = require('../lib/tools');

const validObject = {
  section: '/report',
  date: 1525881639000,
  request: { method: 'GET', endPoint: '/report', protocol: 'HTTP/1.0' },
  remoteHost: '127.0.0.1',
  rfc: '-',
  authuser: 'james',
  status: '200',
  bytes: '123'
};

describe('Line format check', function () {
  it('is line format rescpeted', function () {
    assert.deepEqual(tools.parseLine('127.0.0.1 - james [09/May/2018:16:00:39 +0000] "GET /report HTTP/1.0" 200 123'), validObject);
    assert.throws(() => {
      tools.parseLine('');
    }, Error, 'ERROR_LOG_FORMAT');
    assert.throws(() => {
      tools.parseLine(null);
    }, Error, 'ERROR_LOG_FORMAT');
  });

  it('is date format rescpeted', function () {
    assert.throws(() => {
      tools.parseLine('127.0.0.1 - james [09_May_2018:16:00:39 +0000] "GET /report HTTP/1.0" 200 123');
    }, Error, 'ERROR_LOG_DATE_FORMAT');
    assert.throws(() => {
      tools.parseLine('127.0.0.1 - james [09/May/2018:16:00:39 +0000 "GET /report HTTP/1.0" 200 123');
    }, Error, 'ERROR_LOG_DATE_FORMAT');
  });

  it('is request format rescpeted', function () {
    assert.throws(() => {
      tools.parseLine('127.0.0.1 - james [09/May/2018:16:00:39 +0000] GET /report HTTP/1.0" 200 123');
    }, Error, 'ERROR_LOG_REQUEST_FORMAT');
  });
});
