var assert = require('assert');
var tools = require('../lib/tools');
const moment = require('moment');

const dateFormat = moment().format('L HH:mm:ss');
const threshold = 10;
const avgs = {
  overload: 15,
  recovery: 5
};

describe('Message formating', function () {
  it('is date well formatted', function () {
    assert.deepEqual(tools.dateFormat(new Date()), dateFormat);
  });
});

describe('Traffic alerts mechanism', function () {
  it('High traffic alert', function () {
    assert.deepEqual(tools.checkAlert(avgs.overload, threshold, null), 'overload');
    assert.deepEqual(tools.checkAlert(avgs.overload, threshold, 'recovery'), 'overload');
    assert.deepEqual(tools.checkAlert(avgs.overload, threshold, 'overload'), undefined);
  });

  it('Low traffic alert', function () {
    assert.deepEqual(tools.checkAlert(avgs.recovery, threshold, 'overload'), 'recovery');
    assert.deepEqual(tools.checkAlert(avgs.recovery, threshold, 'recovery'), undefined);
    assert.deepEqual(tools.checkAlert(avgs.recovery, threshold, null), undefined);
  });
});
