
const React = require('react');
const DefaultLayout = require('./layouts/default');

module.exports = (props) => {
    const alert = { };
    if (props.error && props.error.message) {
        alert.error = props.error.message;
    }

    return (
        <DefaultLayout title="Fax Home" alert={alert}>
            <div>{props.message}</div>
        </DefaultLayout>
    );
};
