const router = require('express').Router();
const bodyParser = require('body-parser');
const auth = require('./auth');

router.use('/fax', require('./fax'));
router.use('/api', require('./api'));


router.get('/', (req, res) => {
    if (req.user) { return res.redirect('/fax/'); }
    res.render('login');
});

router.post('/', bodyParser.urlencoded({ extended: false }), auth.form, (req, res) => {
    if (req.user) { return res.redirect('/fax/'); }

    const context = {
        username: (req.body && req.body.username) || '',
        alert: { error: 'Wrong username or password.' }
    };
    res.render('login', context);
});

router.get('/logout', auth.web, (req, res) => {
    req.logout();
    res.redirect('/');
});

module.exports = router;
