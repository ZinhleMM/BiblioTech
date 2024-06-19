const express = require('express');
const router = express.Router();

router.use(session({
    secret: '$ecret_key!',
    resave: false,
    saveUninitialized: true,
    user_authed: false
  }));
  
  function authentication(req, res, next) {
    user = req.session.user;
    if (user == req.session.user && req.session.user_authed) { 
      next();
    } else {
      res.redirect('/signin');  
    }
};

module.exports = router;