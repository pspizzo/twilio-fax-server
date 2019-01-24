
const React = require('react');

const NavBar = require('./components/navbar');
const Alert = require('./components/alert');

module.exports = (props) => (
    <html>
        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE-Edge"/>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
            <title>{props.title}</title>
            <link href="/main.css" rel="stylesheet" />
            <link href="/open-iconic/font/css/open-iconic.css" rel="stylesheet" />
        </head>
        <body className="default-layout">
            <NavBar />
            <div className="container">
                <div className="row">
                    <Alert alert={props.alert} />
                    <div className="layout-content">{props.children}</div>
                </div>
            </div>

            <script src="/main.js" />
        </body>
    </html>
);
