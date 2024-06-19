const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { isValidEmail, isValidPassword, isValidEmailConfirmation, isValidUsername, isValidPasswordConfirmation } = require("../services/util")


// a class of signupValues which has property invalidEmail set default to false. 
// Object of this class are needed to populate the signup template
// the default values represent an empty newly accessed signup form.
class SignupValues {
    constructor(
        invalidEmail = false,
        email = '',
        invalidEmailConfirmation = false,
        emailConfirmation = '',
        invalidUsername = false,
        username = '',
        invalidPassword = false,
        password = '',
        invalidPasswordConfirmation = false,
        passwordConfirmation = '',
        usernameExists = false,
        emailExists = false
    ) {
        this.invalidEmail = invalidEmail;
        this.email = email;
        this.invalidEmailConfirmation = invalidEmailConfirmation;
        this.emailConfirmation = emailConfirmation;
        this.invalidUsername = invalidUsername;
        this.username = username;
        this.invalidPassword = invalidPassword;
        this.password = password;
        this.invalidPasswordConfirmation = invalidPasswordConfirmation;
        this.passwordConfirmation = passwordConfirmation;
        this.usernameExists = usernameExists;
        this.emailExists = emailExists
    }
}

/* GET sign up page. */
router.get('/', async (req, res, next) => {

    res.render("signup",
        new SignupValues());
})


router.post('/', async (req, res, next) => {

    const data = {
        email: req.body.email,
        emailConfirmation: req.body.emailConfirmation,
        username: req.body.username,
        password: req.body.password,
        passwordConfirmation: req.body.passwordConfirmation
    }

    let usernameExists = false;
    const usernameQuery = 'SELECT user_name from users WHERE user_name = ?';
    const usernamePromise = new Promise((resolve, reject) => {
        global.db.get(usernameQuery, [data.username], (err, result) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(result != null);
        })
    })
    try {
        usernameExists = await usernamePromise;
    } catch (err) {
        res.status(500).json({ "error": err.message })
        return;
    }

    let emailExists = false;
    const emailQuery = 'SELECT email from users WHERE email = ?';
    const emailQueryPromise = new Promise((resolve, reject) => {
        global.db.get(emailQuery, [data.email], function (err, result) {
            if (err) {
                reject(err);

            }
            resolve(result != null);
        })
    })
    try {
        emailExists = await emailQueryPromise;
    } catch (err) {
        res.status(500).json({ "error": err.message })
        return;
    }

    // Input validation
    const signupValues = new SignupValues(
        !isValidEmail(data.email),
        data.email,
        !isValidEmailConfirmation(data.email, data.emailConfirmation),
        data.emailConfirmation,
        !isValidUsername(data.username),
        data.username,
        !isValidPassword(data.password),
        data.password,
        !isValidPasswordConfirmation(data.password, data.passwordConfirmation),
        data.passwordConfirmation,
        usernameExists,
        emailExists
    )

    if (signupValues.invalidEmail || signupValues.invalidPassword ||
        signupValues.invalidEmailConfirmation || signupValues.invalidPasswordConfirmation ||
        signupValues.invalidUsername) {
        res.render("signup",
            signupValues);

        return
    };

    bcrypt.hash(data.password, saltRounds, (err, hashedPassword) => {
        if (err) {
            res.status(500).json({ "error": err.message });
            return;
        }

        const sql = 'INSERT INTO users (email,user_name,password) VALUES (?,?,?)';

        const params = [data.email, data.username, hashedPassword];


        global.db.run(sql, params, (err, result) => {
            if (err) {
                res.status(500).json({ "error": err.message })
                return;
            }
            res.redirect("/successsignup");
        });
    });
});

module.exports = router;