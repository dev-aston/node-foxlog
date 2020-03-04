
const fs = require('fs');
const tools = require('./tools');

class FoxLog {
  constructor (opts) {
    // Behaviour config (intervals, thresholds, patth)
    this.filePath = opts.path;
    this.refreshInterval = opts.refreshInterval;
    this.alertThreshold = opts.alertThreshold;
    this.alertInterval = opts.alertInterval;

    // Read stream initial setup
    this._streamOpts = {
      encoding: 'utf8',
      start: 0
    };

    // Data to display and work with
    this.alerts = [];
    this._logs = [];

    // Quick  hack to touch file if not exists
    const exists = fs.existsSync(this.filePath);
    if (!exists) fs.closeSync(fs.openSync(this.filePath, 'w'));
  }

  /**
   * Read log file mechanism
   */
  setup () {
    const self = this;
    return new Promise((resolve, reject) => {
      self._rs = fs.createReadStream(self.filePath, self._streamOpts);
      self._rs.on('data', function (chunk) {
        self._streamOpts.start += chunk.length;
        let lines = chunk.split(/\n/);

        self._buildLogs(lines);
      });

      self._rs.on('end', () => {
        // Check traffic threshold after loading new logs.
        self._checkAlert();
      });

      self._rs.on('close', () => {
        self._rs = null;
        resolve();
      });
    });
  }

  /**
   * Watch log file modification to load content
   */
  watch () {
    fs.watchFile(this.filePath, { interval: 1000 }, () => {
      this.setup();
    });
  }

  /**
   * Starts reporting on fixed interval
   */
  enableReport () {
    this._report();
    setInterval(() => {
      this._report();
    }, this.refreshInterval * 1000);
  }

  /**
   * Display report
   */
  _report () {
    console.clear();

    if (!this._logs || !this._logs.length) {
      // Nothing to display, get out.
      console.log(`No access log for the past ${this.refreshInterval}sec`);
      return;
    }

    if (this.alerts && this.alerts.length) {
      console.log('-');
      console.log(`Load check, threshold set to ${this.alertThreshold} (last 10 events):`);
      this.alerts.slice(Math.max(this.alerts.length - 10, 0)).forEach(a => {
        let prefix = (a.type === 'overload' ? 'High' : 'Low');
        console.log(`${prefix} traffic generated an alert - hits = ${a.avg}, triggered at ${tools.dateFormat(a.date)}`);
      });
    }

    let stats = this._buildStats();
    console.log('-');
    console.log(`Report (last ${this.refreshInterval} seconds): `);
    console.log(`-----------------+---------------+-------------`);
    console.log(` Section  \t | Visits    \t | Error ratio`);
    console.log(`-----------------+---------------+-------------`);
    stats._sorted.forEach(k => {
      let ratio = tools.percent(100 * stats[k].errors / stats[k].visits);
      console.log(` ${k.padEnd(8, ' ')}\t | ${stats[k].visits}\t\t | ${ratio}%`);
    });
    console.log(`-----------------+---------------+-------------`);
    console.log(`Average req/s last 120sec: ${this.avg} (threshold : ${this.alertThreshold})`);
  }

  /**
   * Builds the _logs array containing log lines post alertThreshold timestamp, ordered DESC
   * @param {Array} lines : lines fetched from file
   */
  _buildLogs (lines) {
    lines.forEach((l, index) => {
      try {
        this._logs.push(tools.parseLine(l));
      }
      catch (e) {
        // console.error(`Error parsing line ${index}. Ignoring...`);
      }
    });

    // Sorting log by date DESC
    this._logs.sort((a, b) => b.date - a.date);

    // Removing logs older than threshold interlval (defaut 2 mins)
    const from = new Date().valueOf() - this.alertInterval;
    this._logs = this._logs.filter(l => l.date > from);
  }

  /**
   * Format stats output to display, by sections
   */
  _buildStats () {
    const stats = {};

    const from = new Date().valueOf() - this.refreshInterval * 1000;
    for (let i = 0; i < this._logs.length; i++) {
      const log = this._logs[i];
      // No need to parse stats older than refreshInterval.
      if (log.date < from) break;

      stats[log.section] = stats[log.section] || { visits: 0, errors: 0 };
      stats[log.section].visits++;
      stats[log.section].errors += (log.status >= 400 ? 1 : 0);
    }

    stats._sorted = Object.keys(stats).sort((a, b) => {
      return stats[b].visits - stats[a].visits;
    });

    return stats;
  }

  _checkAlert () {
    let now = new Date();
    let thresholdFrom = now.valueOf() - this.alertInterval;

    this.avg = this._logs.reduce((sum, l) => {
      return (l.date > thresholdFrom ? sum + 1 : sum);
    }, 0);
    this.avg = Math.round(100 * this.avg / 120) / 100;

    const alert = tools.buildAlert(this.avg, this.alertThreshold, this.alerts[this.alerts.length - 1] && this.alerts[this.alerts.length - 1].type);

    if (alert) {
      this.alerts.push({ type: alert, avg: this.avg, threshold: this.alertThreshold, date: now });
      this._report();
    }
  }
}

module.exports = FoxLog;
