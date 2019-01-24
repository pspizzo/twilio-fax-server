
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const users = require('../../config/web-logins.json');


passport.serializeUser((user, done) => {
    done(null, user.username);
});

passport.deserializeUser((id, done) => {
    done(null, { username: id });
});

passport.use(new LocalStrategy({},
    (username, password, done) => {
        if (users[username] && users[username] === password) {
            return done(null, { username });
        }
        done(null, false);
    }
));


/**
 * Used by the login form to verify that the user's submitted username/password is correct.
 * Error handling is expected to be handled in the "login" route by checking for the existence
 * of the req.user.  If the req.user does not exist, the user was not authenticated.
 * @param req
 * @param res
 * @param next
 */
function form(req, res, next) {
    passport.authenticate('local', (err, user) => {
        if (user) {
            req.login(user, (loginErr) => next(loginErr));
        } else {
            next(err);
        }
    })(req, res);
}


/**
 * Enforce authentication on a route.  If the user is not authenticated, they are redirected
 * to the main page.
 * @param req
 * @param res
 * @param next
 */
function web(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.redirect('/');
    }
}


/**
 * Enforce authentication on a route.  If the user is not authenticated, they will get a
 * 401/Unauthorized error.
 * @param req
 * @param res
 * @param next
 */
function api(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized', status: 401 });
    }
}


module.exports = {
    passport,
    web,
    api,
    form
};
