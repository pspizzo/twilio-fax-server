
const React = require('react');
const SimpleLayout = require('./layouts/simple');

module.exports = (props) => (
    <SimpleLayout title="Sign In" alert={props.alert}>
        <form method="POST" id="login-form">
            <div className="form-group">
                <label htmlFor="username">Username</label>
                <input type="text" name="username" id="username" className="form-control" defaultValue={props.username} required />
            </div>
            <div className="form-group">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" className="form-control" required />
            </div>
            <button type="submit" className="btn btn-primary">Submit</button>
        </form>
    </SimpleLayout>
);