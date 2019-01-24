const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const config = require('config');
const logger = require('../logger');

const bodyParser = require('body-parser');
const multer = require('multer');
const auth = require('./auth');
const mailWriter = require('../mail-writer')(config.get('mailDir'));

const multerOptions = {
    dest: path.join(config.get('faxStorageDir')),
    fileFilter: (req, file, cb) => {
        if (!req.body || !req.body.FaxSid) return cb(null, false);
        cb(null, true);
    },
    limits: {
        fields: 50,
        fileSize: 10000000,
        files: 1,
        parts: 50
    }
};

const twiml = '<Response><Receive action="/fax/payload" method="POST" storeMedia="false" /></Response>';

router.post('/fax/initialize', auth, bodyParser.urlencoded({ extended: false }), (req, res) => {
    logger.info(`(initialize): Incoming fax request. FaxSID:${req.body.FaxSid}, From:${req.body.From}`);
    res.type('text/xml').send(twiml);
});

router.post('/fax/payload', auth, multer(multerOptions).single('Media'), (req, res) => {
    logger.info(`(payload): Incoming fax data. FaxSID:${req.body.FaxSid}, From:${req.body.From}, Pages:${req.body.NumPages}, Size:${req.file.size}, Type:${req.file.mimetype}`);

    // Respond with 200/OK to Twilio -- we already have the file on disk
    res.status(200);
    res.send('200/OK');

    // Move the file contents to the MailDir
    try {
        const mailFilename = mailWriter(req);
        logger.info(`(payload): FaxSID:${req.body.FaxSid}  Created mail file: ${mailFilename}`);
    } catch (err) {
        logger.error(`(payload): FaxSID:${req.body.FaxSid}  Failed to create mail entry`, err);
    }
});


router.get('/fax/sending/:file', auth, (req, res) => {
    if (!req.params || !req.params.file || !req.params.file.match(/^[0-9a-zA-Z]+$/)) {
        logger.warn(`(sending): Invalid filename: ${req.params.file}`);
        return res.status(404).type('text/text').send('Not found');
    }

    logger.info(`(sending): Requested outbound fax file: ${req.params.file}`);
    const osFile = path.resolve(config.get('faxStorageDir'), req.params.file);
    if (!fs.existsSync(osFile)) {
        logger.warn(`(sending): File does not exist: ${req.params.file}`);
        return res.status(404).type('text/text').send('Not found');
    }

    res.type('application/pdf').sendFile(osFile, (err) => {
        if (err) {
            logger.warn(`(sending): Error sending outbound fax file: ${req.params.file}`, err);
            res.end();
        } else {
            logger.info(`(sending): Deleting finished outbound fax file: ${req.params.file}`);
            fs.unlinkSync(osFile);
        }
    });
});

module.exports = router;
