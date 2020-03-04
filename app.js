
const path = require('path');
const config = require('./config');
const FoxLog = require('./lib/foxlog');
const tools = require('./lib/tools');

// Express server
const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// require('./lib/socket')(io);

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

http.listen(3000, function () {
  console.log('listening on *:3000');
});

// LogFox worker
let logFile = process.env.LOG_PATH || config.defaultPath;
if (!path.isAbsolute(logFile)) {
  logFile = path.join(__dirname, path.normalize(process.env.LOG_PATH));
}

const args = config.fox;
args.path = logFile;
if (process.env.ALERT_THRESHOLD) {
  args.alertThreshold = process.env.ALERT_THRESHOLD;
}

const fox = new FoxLog(args);

fox.setup()
  .then(() => {
    fox.watch();
    fox.enableReport();
    setInterval(() => {
      io.emit('report', { alerts: fox.alerts, stats: fox._buildStats(), avg: fox.avg, config: args });
    }, 10 * 1000);
  });

io.on('connection', () => {
  io.emit('report', { alerts: fox.alerts, stats: fox._buildStats(), avg: fox.avg, config: args });
});

// Dummy log populater
console.log('popLogs', process.env.POPULATE_LOGS, !!process.env.POPULATE_LOGS);

if (process.env.POPULATE_LOGS) {
  setInterval(() => {
    tools.populateLog(logFile);
  }, 1000);
}
