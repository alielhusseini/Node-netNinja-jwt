const User = require("../models/User");
const jwt = require("jsonwebtoken"); // npm install jsonwebtoken
require('dotenv/config');

// handle errors
const handleErrors = (err) => {
    //console.log(err.message, err.code); // err.code is only available for the "unique" property 

    let errors = { email: '', password: '' }; // (according to the Schema)

    if (err.message === 'incorrect email') errors.email = 'the password is not registered';
    if (err.message === 'incorrect password') errors.password = 'the password is incorrect';

    // duplicate error code (unique)
    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    // validation errors
    if (err.message.includes('user validation failed')) {
        //console.log(Object.values(err.errors)); // array of the object err values (according to the Schema)

        Object.values(err.errors).forEach(({ properties }) => { // destructuring
            //console.log(properties);

            errors[properties.path] = properties.message;
        });
    }

    return errors;
}

// creating token for 3 days
const maxAge = 3 * 24 * 60 * 60; // jwt expects in seconds

const createToken = id => {
    return jwt.sign({ id }, process.env.TOKEN_SECRET, { // secret
        expiresIn: maxAge
    });
}

// controller actions
module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async(req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.create({ email, password });
        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        res.status(201).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async(req, res) => {
    const { email, password } = req.body;

    try {
        // custom extension
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: maxAge * 1000
        });
        res.status(200).json({ user: user._id });
    } catch (err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}