
const express = require('express');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');
const morgan = require('morgan');

const app = express();

// Middleware
app.use(morgan(':remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"',
    { stream: { write: (msg, enc) => { logger.info(msg.trim()) } } }));

// App routes
app.use(require('./routes'));

// Start server
try {
    const https = require('https');

    const server = https.createServer({
            key: fs.readFileSync(path.join('privateKey.pem')),
            cert: fs.readFileSync(path.join('certificate.pem'))
        }, app);
    server.listen(process.env.RECEIVE_PORT || 3297);
    server.on('listening', function () {
        logger.info('Fax receiver listening on port: ' + this.address().port);
    });
} catch (e) {
    logger.error('Failed to start receive-fax server', e);
}

// Start a separate HTTP server that is only used for Let's Encrypt validation
try {
    const validationApp = express();
    const http = require('http');

    // Only allowed route for this application
    validationApp.use(express.static(__dirname + '/public'));

    const server = http.createServer(validationApp);
    server.listen(process.env.HTTP_PORT || 3298);
    server.on('listening', function () {
        logger.info('http listening on port: ' + this.address().port);
    });
} catch (e) {
    logger.error('Failed to start HTTP server', e);
}