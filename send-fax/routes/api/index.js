
const router = require('express').Router();
const config = require('config');
const auth = require('../auth');
const logger = require('../../logger');


if (!config.get('twilio.sid') || !config.get('twilio.token') || !config.get('twilio.number')) {
    throw new Error('System is not configured, missing twilio authentication');
}
if (!config.get('publicHostname')) {
    throw new Error('System is not configured, missing publicHostname');
}

const twilioClient = require('twilio')(config.get('twilio.sid'), config.get('twilio.token'));

function error(res, status, message) {
    res.status(status).json({
        message: message,
        status: status
    });
}

function notFound(res) { error(res, 404, 'Not found'); }


router.get('/ping', auth.api, (req, res) => {
    logger.info('(api/ping) Requested');
    res.json({ status: 'ok' });
});


router.get('/fax/:sid', auth.api, (req, res) => {
    if (!req.params || !req.params.sid || !req.params.sid.match(/^[a-zA-Z0-9]+$/)) {
        return notFound(res);
    }

    twilioClient.fax.faxes(req.params.sid).fetch()
        .then((fax) => {
            res.json({ status: fax.status, pages: fax.numPages || fax.num_pages });
        }).catch((err) => {
            switch(err.status) {
                case 404:
                    error(res, 404, 'Not found');
                    break;
                default:
                    error(res, err.status || 400, err.message);
            }
        }).done();
});

module.exports = router;
