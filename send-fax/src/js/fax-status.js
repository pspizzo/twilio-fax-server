
const fetch = require('isomorphic-fetch');
const checkPeriod = 20000; // 20 seconds
const maxFailureRetries = 3;

const status = {
    success: ['delivered', 'receiving', 'received'],
    error: ['no-answer', 'busy', 'failed', 'canceled'],
    pending: ['queued', 'processing', 'sending']
};

function checkFaxStatus(faxSid, numFailures = 0) {
    setTimeout(() => {
        fetch(`/api/fax/${faxSid}`, {
            credentials: 'same-origin'
        }).then((response) => {
            if (!response.ok) {
                throw new Error('Response from server: ' + response.status);
            }
            return response.json();
        }).then((json) => {
            console.log('Fax status: ' + json.status);
            if (json.pages !== undefined) {
                document.querySelector('[data-fax="pages"]').textContent = json.pages;
            }
            if (status.success.includes(json.status)) {
                document.querySelector('[data-fax="status"]').textContent = `Success (${json.status})`;
                document.querySelector('[data-fax="result"]').innerHTML =
                    '<span class="oi fax-status-success" data-glyph="check" title="Success" aria-hidden="true"></span>';
            } else if (status.error.includes(json.status)) {
                document.querySelector('[data-fax="status"]').textContent = `Failed (${json.status})`;
                document.querySelector('[data-fax="result"]').innerHTML =
                    '<span class="oi fax-status-error" data-glyph="warning" title="Failed" aria-hidden="true"></span>';
            } else {
                const displayStatus = (status.pending.includes(json.status) ? json.status : 'unknown');
                document.querySelector('[data-fax="status"]').textContent = `Pending (${displayStatus})`;
                checkFaxStatus(faxSid);
            }

        }).catch((err) => {
            if (++numFailures <= maxFailureRetries) {
                console.warn('Error getting fax status: ' + err.message + ', failures: ' + numFailures);
                checkFaxStatus(faxSid, numFailures);
            } else {
                console.warn('Error getting fax status: ' + err.message + ', giving up.');
                document.querySelector('[data-fax="status"]').textContent = `Unknown (server error)`;
                document.querySelector('[data-fax="result"]').innerHTML = '';
            }
        });

    }, checkPeriod);
}

(function () {
    window.addEventListener('load', function () {
        const faxStatusContent = document.getElementById('fax-status-content');
        if (faxStatusContent) {
            const resultContainer = faxStatusContent.querySelector('[data-fax="result"]');
            if (resultContainer) {
                const pending = resultContainer.querySelector('[data-fax="pending"]');
                if (pending) {
                    let matches;
                    if ( (matches = window.location.pathname.match(/\/fax\/status\/([a-zA-Z0-9]+)/)) ) {
                        const faxSid = matches[1];
                        checkFaxStatus(faxSid);
                    }
                }
            }
        }
    });
})();
