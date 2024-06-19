const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { isValidEmail, isValidPassword } = require("../services/util")


class SigninValues {
    constructor(
        invalidEmail = false,
        email = '',
        invalidPassword = false,
        password = ''
    ) {
        this.invalidEmail = invalidEmail;
        this.email = email;
        this.invalidPassword = invalidPassword;
        this.password = password;
    }
}

router.get('/', async (req, res, next) => {

    res.render("signin",
        new SigninValues());

});


const queryDB = (sql, params) => {
    return new Promise((resolve, reject) => {
        global.db.get(sql, params, (err, result) => {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
    });
};

router.post('/', async (req, res, next) => {
    const data = {
        email: req.body.email,
        password: req.body.password 
    }

    let signinValues = new SigninValues(
        !isValidEmail(data.email),
        data.email,
        !isValidPassword(data.password),
        data.password,
    )

    if (signinValues.invalidEmail || signinValues.invalidPassword) {
        res.render("signin",
            signinValues);

            return;
    }

    const sql = 'SELECT email, password FROM users WHERE email = ?';
    const params = [data.email];

    try {
        const user = await queryDB(sql, params);

        if (user) {
            bcrypt.compare(data.password, user.password, (err, isMatch) => {
                if (err) {
                    return res.status(500).send("Error occurred");
                }
        
                if (!isMatch) {
                    return res.status(401).send("Invalid credentials");
                }
                // Authentication Success
                req.session.user = user.email
                req.session.user_authed = true

                res.redirect("/collectionList");
            });

        } else {
            res.status(404).json({ "error": "User not found" });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ "error": err.message });
    }
});

module.exports = router;