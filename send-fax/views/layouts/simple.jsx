
const React = require('react');

const Alert = require('./components/alert');

module.exports = (props) => (
    <html>
        <head>
            <meta charSet="UTF-8"/>
            <meta httpEquiv="X-UA-Compatible" content="IE-Edge"/>
            <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
            <title>{props.title}</title>
            <link href="/main.css" rel="stylesheet" />
        </head>
        <body className="simple-layout">
            <div className="layout-content">
                <Alert alert={props.alert} />
                {props.children}
            </div>
        </body>
    </html>
);
