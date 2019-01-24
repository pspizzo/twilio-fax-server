
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const morgan = require('morgan');
const auth = require('./routes/auth');

const app = express();

// Middleware
app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { stream: { write: (msg, enc) => { logger.info(msg.trim()) } } }));
app.use(session({
    store: new MemoryStore({ checkPeriod: 86400000 }), /* Memory-safe implementation */
    secret: '5mQLhh3xzhSbkBEV',
    cookie: { secure: true },
    resave: false,
    saveUninitialized: false
}));
app.use(auth.passport.initialize());
app.use(auth.passport.session());
app.use(express.static(__dirname + '/dist'));
app.use(express.static(__dirname + '/public'));
app.use('/open-iconic/sprite', express.static(path.resolve('node_modules/open-iconic/sprite')));
app.use('/open-iconic/font', express.static(path.resolve('node_modules/open-iconic/font')));

// View engine
app.set('views', __dirname + '/views');
app.set('view engine', 'jsx');
app.engine('jsx', require('express-react-views').createEngine());

// App routes
app.use(require('./routes'));

// Start server
try {
    const https = require('https');

    const server = https.createServer({
        key: fs.readFileSync(path.join('privateKey.pem')),
        cert: fs.readFileSync(path.join('certificate.pem'))
    }, app);
    server.listen(process.env.SEND_PORT || 443);
    server.on('listening', function () {
        logger.info('Fax sender listening on port: ' + this.address().port);
    });
} catch (e) {
    logger.error('Failed to start send-fax server', e);
}
