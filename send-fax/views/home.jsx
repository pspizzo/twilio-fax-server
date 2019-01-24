
const React = require('react');
const DefaultLayout = require('./layouts/default');

module.exports = (props) => (
    <DefaultLayout title="Fax Home" alert={props.alert}>
        <div>Hello!</div>
    </DefaultLayout>
);