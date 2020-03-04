const fs = require('fs');
const moment = require('moment');

const percent = (ratio) => {
  return Math.round(ratio * 100) / 100;
};

const dateFormat = (date) => {
  return moment(date).format('L HH:mm:ss');
};

/**
 * Builds a alerts messag for traffic load if necessary
 * @param {Number} avg : current average req/s for the last period
 * @param {Number} threshold : threshold above which a LOAD alert is triggered, and below which a recovery alert is truggered
 * @param {Object} prevAlert : last triggered alert
 * @returns {Object} : Alert to dispay or null
 */
const checkAlert = (avg, threshold, prevAlert) => {
  let type;
  if (avg >= threshold && (!prevAlert || prevAlert === 'recovery')) {
    type = 'overload';
  }
  else if (avg < threshold && prevAlert && prevAlert === 'overload') {
    type = 'recovery';
  }

  return type;
};

/**
 * Parses a line and checks if format is compliant to W3C accesslog format
 * https://www.w3.org/Daemon/User/Config/Logging.html#common-logfile-format
 * @param {String} l : line from access.log
 * @returns {Object} : line parsed and formatted
 */
const parseLine = (l) => {
  const result = {};
  const parts = l.split(/\s+/g);

  if (parts.length < 10) {
    throw new Error('ERROR_LOG_FORMAT');
  }

  try {
    let match = l.match(/\[.*\]/g)[0].replace(/(\[|\])/g, '').replace(/\//g, ' ').replace(/:/, ' ');

    result.date = new Date(match).valueOf();

    if (isNaN(result.date)) {
      throw new Error('ERROR_LOG_DATE_FORMAT');
    }
  }
  catch (e) {
    throw new Error('ERROR_LOG_DATE_FORMAT');
  }

  try {
    let request = l.match(/".*"/g)[0].replace(/"/g, '').split(/\s+/);
    result.request = {
      method: request[0],
      endPoint: request[1],
      protocol: request[2]
    };
  }
  catch (e) {
    throw new Error('ERROR_LOG_REQUEST_FORMAT');
  }

  result.section = result.request.endPoint.match(/^\/[^/]*/)[0];
  result.remoteHost = parts[0];
  result.rfc = parts[1];
  result.authuser = parts[2];
  result.status = parts[8];
  result.bytes = parts[9];

  return result;
};

/**
 * Quick populate routine for dev env.
 * @param {String} path : access.log file path to populate
 */
const populateLog = (path) => {
  const methods = ['GET', 'PUT', 'POST', 'DELETE'];
  const endpoints = ['/users', '/posts', '/terms', '/users/me', '/fox', '/fox/intelligence', '/tyler/durden', '/marla/singer'];
  const statuses = ['200', '304', '400', '404', '500'];
  const limit = Math.floor(Math.random() * 10);
  let data = [];

  for (let i = 0; i < limit; i++) {
    let method = methods[Math.floor(Math.random() * methods.length)];
    let endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    let status = statuses[Math.floor(Math.random() * statuses.length)];
    let line = ['127.0.0.1', '-', 'aston', '[' + moment().format('DD/MMM/YYYY:HH:mm:ss') + ' +0000]', '"' + method + ' ' + endpoint + ' HTTP1.1"', status, '42'];

    data.push(line.join(' '));
  }

  const string = data.join('\n') + '\n';

  fs.writeFile(path, string, { flag: 'a' }, (err, data) => {
    if (err) {
      console.error('Error populating logs...');
    }
  });
};

module.exports = {
  percent,
  dateFormat,
  checkAlert,
  parseLine,
  populateLog
};