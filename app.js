
const fs = require('fs');

if (!fs.existsSync('send-fax/dist/main.css')) {
    console.error('Missing CSS file for send-fax app (send-fax/dist/main.css).');
    console.error('Did you run "npm run build" yet?');
    throw new Error('Unable to start');
}

// Start both services
require('./receive-fax');
require('./send-fax');
