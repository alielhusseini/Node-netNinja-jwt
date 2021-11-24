const jwt = require("jsonwebtoken");
const User = require('../models/User');
require('dotenv/config');

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    // check jwt exists and verify
    if (token) {
        // verify the token
        jwt.verify(token, process.env.TOKEN_SECRET, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.redirect('/login');
            } else {
                console.log(decodedToken);
                next();
            }
        });
    } else {
        res.redirect('/login')
    };
}

// check current user (fire this middleware to every get req to every page)
const checkUser = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, process.env.TOKEN_SECRET, async(err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            } else {
                console.log(decodedToken);

                // the decodedToken contains a payload which stores the id of the user(createToken took the id to generate a token {id: id})
                let user = await User.findById(decodedToken.id);

                // we want to inject something into the views, we make it by res.locals.anyVariable to get accessed from the view
                res.locals.user = user; // (in the err & else, set it to null since we will check in front-end of it has a value implying user is found)
                next();
            }
        });
    } else {
        res.locals.user = null;
        next();
    }
}

module.exports = { requireAuth, checkUser };