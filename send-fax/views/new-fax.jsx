
const React = require('react');
const DefaultLayout = require('./layouts/default');

module.exports = (props) => (
    <DefaultLayout title="Fax Home" alert={props.alert}>
        <h1>Send a fax</h1>
        <form method="POST" encType="multipart/form-data" id="new-fax-form">
            <div className="form-group">
                <label htmlFor="to">Recipient fax number</label>
                <input type="text" name="to" id="to" className="form-control" pattern="\+?1?[2-9][0-9]{9}" required aria-describedby="toHelpBlock" />
                <small id="toHelpBlock" className="form-text text-muted">
                    Enter the full 10-digit phone number.
                </small>
            </div>
            <div className="form-group">
                <label htmlFor="file">File to send</label>
                <input type="file" name="file" id="file" className="form-control" required accept="application/pdf" aria-describedby="fileHelpBlock" />
                <small id="fileHelpBlock" className="form-text text-muted">
                    Only PDF files are allowed.
                </small>
            </div>
            <button type="submit" className="btn btn-primary">Send</button>
        </form>
    </DefaultLayout>
);