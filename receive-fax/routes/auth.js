
const config = require('config');
const username = config.get('inboundAuth.user');
const password = config.get('inboundAuth.pass');

let middleware = (req, res, next) => next();

if (username && password) {
    const logger = require('../logger');
    logger.info('Enabling basic authentication for incoming requests.');

    middleware = (req, res, next) => {
        const authHeader = req.get('Authorization');
        if (authHeader) {
            const matches = authHeader.match(/Basic\s+(.+)/);
            if (matches && matches.length > 1) {
                const decoded = Buffer.from(matches[1], 'base64').toString('utf8');
                const pieces = decoded.split(':');
                const u = pieces.shift();
                const p = pieces.join('');

                if (u === username && p === password) {
                    return next();
                }
            }
        }

        res.status(401)
            .set('WWW-Authenticate', 'Basic realm="Fax"')
            .json({ error: 'Unauthorized' });
    };
}

module.exports = middleware;
