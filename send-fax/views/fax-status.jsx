
const React = require('react');
const moment = require('moment');
const DefaultLayout = require('./layouts/default');
const successIcon = 'check';
const errorIcon = 'warning';

module.exports = (props) => {
    const fax = props.fax || {},
        dateString = fax.dateCreated || fax.date_created;

    let date = 'Unknown';
    if (dateString) {
        date = moment(dateString).format('MMM Do YYYY, h:mm:ss a');
    }

    let pending = false,
        error = false;

    // https://www.twilio.com/docs/fax/api/faxes#fax-status-values
    switch(fax.status) {
        case 'queued':
        case 'processing':
        case 'sending':
            pending = true;
            break;
        case 'no-answer':
        case 'busy':
        case 'failed':
        case 'canceled':
            error = fax.status;
            break;
        case 'delivered':
        case 'receiving':
        case 'received':
        default:
    }

    let resultIcon = '';
    let result = fax.status;
    if (pending) {
        resultIcon = (
            <div data-fax="pending" className="loader"><div /><div /></div>
        );
        result = `Pending (${fax.status})`;
    } else {
        resultIcon = (
            <span className={'oi fax-status-' + (error ? 'error' : 'success')}
                  data-glyph={error ? errorIcon : successIcon}
                  title={error ? 'Failed' : 'Success'}
                  aria-hidden="true">
            </span>
        );
        result = (error ? 'Failed' : 'Success') + ` (${fax.status})`;
    }

    return (
        <DefaultLayout title="Fax Status" alert={props.alert}>
            <h1>Fax status</h1>
            <div id="fax-status-content">
                <table className="table table-dark table-borderless fax-status">
                    <tr><td className="row-title">Fax to:</td><td className="row-value">{fax.to}</td><td className="row-icon">&nbsp;</td></tr>
                    <tr><td className="row-title">Date sent:</td><td className="row-value">{date}</td><td className="row-icon">&nbsp;</td></tr>
                     <tr>
                        <td className="row-title">Pages:</td>
                        <td className="row-value" data-fax="pages">{fax.numPages || fax.num_pages || 'Unknown'}</td>
                        <td className="row-icon">&nbsp;</td>
                    </tr>
                    <tr>
                        <td className="row-title">Status:</td>
                        <td className="row-value" data-fax="status">{result}</td>
                        <td className="row-icon" data-fax="result">{resultIcon}</td>
                    </tr>
                </table>
            </div>
        </DefaultLayout>
    )
};
