
const router = require('express').Router();
const config = require('config');
const fs = require('fs');
const path = require('path');
const auth = require('../auth');
const logger = require('../../logger');
const multer = require('multer');

const multerOptions = {
    dest: path.join(config.get('faxStorageDir')),
    limits: {
        fields: 5,
        fileSize: 10000000,
        files: 1,
        parts: 10
    }
};

if (!config.get('twilio.sid') || !config.get('twilio.token') || !config.get('twilio.number')) {
    throw new Error('System is not configured, missing twilio authentication');
}
if (!config.get('publicHostname')) {
    throw new Error('System is not configured, missing publicHostname');
}

const twilioClient = require('twilio')(config.get('twilio.sid'), config.get('twilio.token'));



router.get('/', auth.web, (req, res) => {
    res.render('new-fax');
});


router.post('/', auth.web, multer(multerOptions).single('file'), (req, res) => {
    let to = req.body.to;

    // Check form input
    const error = (msg) => {
        fs.unlinkSync(req.file.filename);
        res.render('new-fax', { alert: { error: msg } })
    };
    if (!to) { return error('Must include a recipient phone number'); }
    if (!to.match(/^\+?1?[2-9][0-9]{9}$/)) { return error('Invalid recipient phone number format'); }

    // Make the "To" field Twilio-friendly: +13125551212
    if (to.match(/^[2-9]/)) { to = '+1' + to; }
    else if (to.match(/^1/)) { to = '+' + to; }

    logger.info(`(fax/POST): Valid fax request received, to:${to}`);
    let auth = '';
    if (config.get('inboundAuth.user') && config.get('inboundAuth.pass')) {
        auth = config.get('inboundAuth.user') + ':' + config.get('inboundAuth.pass') + '@';
    }
    const publicHostname = config.get('publicHostname');

    const mediaUrl = `https://${auth}${publicHostname}/fax/sending/${req.file.filename}`;
    twilioClient.fax.faxes.create({
        from: config.get('twilio.number'),
        to,
        mediaUrl,
        storeMedia: false,
    }).then((fax) => {
        logger.info(`(fax/POST) Submitted fax request to Twilio, FaxSid:${fax.sid}`);
        res.redirect(`/fax/status/${fax.sid}`);
    }).catch((err) => {
        logger.warn('(fax/POST) Error sending fax request to Twilio', err);
        res.render('error', {
            error: err,
            message: 'Sorry, we were unable to send your fax. Press the Back button in your browser to try again.'
        });
    }).done();
});


router.get('/status/:sid', auth.web, (req, res) => {
    if (!req.params || !req.params.sid || !req.params.sid.match(/^[a-zA-Z0-9]+$/)) {
        return res.status(404).type('text/text').send('Not found');
    }

    logger.info(`(fax/status) Requesting fax status, FaxSid:${req.params.sid}`);
    twilioClient.fax.faxes(req.params.sid).fetch()
        .then((fax) => {
            logger.info(`(fax/status) Fax status found, FaxSid:${req.params.sid}, status:${fax.status}`);
            res.render('fax-status', { fax: fax });
        }).catch((err) => {
        logger.info(`(fax/status) Error getting fax status, FaxSid:${req.params.sid}`, err);
            switch(err.status) {
                case 404:
                    res.status(404).render('error', { message: 'The requested fax was not found' });
                    break;
                default:
                    res.status(err.status || 400).render('error', { message: 'An error occurred' });
            }
        }).done();
});


module.exports = router;
