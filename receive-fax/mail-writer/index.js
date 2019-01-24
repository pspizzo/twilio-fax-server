const fs = require('fs');
const path = require('path');
const moment = require('moment');
const hostname = require('os').hostname();

const characterSet = [];

const chunkSize = 1;
const lineWidth = 76;

for (let i = 0; i < 26; i++) {
    if (i < 10) characterSet.push(String(i));
    characterSet.push(String.fromCharCode('a'.codePointAt(0) + i));
    characterSet.push(String.fromCharCode('A'.codePointAt(0) + i));
}


function generateRandomString(length) {
    return Array(length)
        .fill(0)
        .map(() => characterSet[Math.floor(Math.random() * characterSet.length)])
        .join('');
}

function mailWriter(mailDir) {

    if (!mailDir) {
        throw new Error('Missing maildir argument');
    }

    function getMailFilename(req) {
        return Math.floor(Date.now()/1000) + '.' + generateRandomString(12) + '.' + hostname;
    }


    function startMailMessage(req, fd, separator) {
        const mimetype = req.file.mimetype || 'application/pdf';
        const date = moment().format('ddd, DD MMM YYYY HH:mm:ss ZZ');

        fs.writeSync(fd, `From: ${req.body.From} <${req.body.From}@phone>\n`);
        fs.writeSync(fd, `To: faxuser\n`);
        fs.writeSync(fd, `Date: ${date}\n`);
        fs.writeSync(fd, `MIME-Version: 1.0\n`);
        fs.writeSync(fd, `Content-type: multipart/mixed; boundary=${separator}\n`);
        fs.writeSync(fd, `\n`);
        fs.writeSync(fd, `--${separator}\n`);
        fs.writeSync(fd, `Content-Type: text/text\n`);
        fs.writeSync(fd, `\n`);
        fs.writeSync(fd, `From:  ${req.body.From || 'unknown'}\n`);
        fs.writeSync(fd, `To:    ${req.body.To || 'unknown'}\n`);
        fs.writeSync(fd, `Date:  ${date}\n`);
        fs.writeSync(fd, `Pages: ${req.body.NumPages || 'unknown'}\n`);
        fs.writeSync(fd, `\n`);
        fs.writeSync(fd, `--${separator}\n`);
        fs.writeSync(fd, `Content-Type: ${mimetype}\n`);
        fs.writeSync(fd, `Content-Transfer-Encoding: base64\n`);
        fs.writeSync(fd, `Content-Disposition: attachment ;filename="fax.${mimetype.split('/')[1]}"\n`);
        fs.writeSync(fd, `\n`);
    }


    function endMailMessage(req, fd, separator) {
        fs.writeSync(fd, `--${separator}--\n`);
    }


    return function (req) {
        if (!req.body || !req.file || !req.file.destination || !req.file.filename) {
            throw new Error('Invalid request');
        }

        const filename = getMailFilename(req);

        let outFd, inFd;
        try {
            inFd = fs.openSync(path.join(req.file.destination, req.file.filename), 'r');
            outFd = fs.openSync(path.join(mailDir, 'tmp', filename), 'wx');

            const boundary = generateRandomString(12);
            startMailMessage(req, outFd, boundary);

            const inBuffer = Buffer.alloc(3);
            let bytesRead;

            let i = 0;
            while ( (bytesRead = fs.readSync(inFd, inBuffer, 0, 3)) > 0) {
                const encoded = (bytesRead < 3 ? inBuffer.slice(0, bytesRead) : inBuffer).toString('base64');
                fs.writeSync(outFd, encoded);

                if (++i >= 19) {
                    fs.writeSync(outFd, '\n');
                    i = 0;
                }
            }

            if (i > 0) fs.writeSync(outFd, '\n');
            endMailMessage(req, outFd, boundary);

            fs.closeSync(outFd); outFd = undefined;

            // Move the mail file to the "new" directory in the MailDir
            fs.renameSync(path.join(mailDir, 'tmp', filename), path.join(mailDir, 'new', filename));

            return filename;

        } finally {
            if (outFd !== undefined) {
                try { fs.closeSync(outFd); } catch (err) { /* Ignore */ }
            }
            if (inFd !== undefined) {
                try { fs.closeSync(inFd); } catch (err) { /* Ignore */ }
            }

            // Clean up temporary fax file
            try {
                fs.unlinkSync(path.join(req.file.destination, req.file.filename));
            } catch (err) { /* Ignore */ }
        }
    };

}

module.exports = mailWriter;
