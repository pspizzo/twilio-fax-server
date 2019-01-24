const React = require('react');

module.exports = (props) => {
    if (!props.alert) return null;

    if (props.alert.error) {
        return (
            <div className="alert alert-danger" role="alert">
                {props.alert.error}
            </div>
        );
    }
    return null;
};