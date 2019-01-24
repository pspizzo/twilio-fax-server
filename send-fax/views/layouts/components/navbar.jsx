const React = require('react');

module.exports = (props) => (
    <nav className="nav">
        <div className="container">
            <div className="row">
                <a className="nav-link" href="/fax/">Home</a>
                <div className="nav-spacer">&nbsp;</div>
                <a className="nav-link" href="/logout">Logout</a>
            </div>
        </div>
    </nav>
);