const mongoose = require('mongoose');
const { isEmail } = require('validator'); // npm install validator
const bcrypt = require('bcrypt'); // npm install bcrypt

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        validate: [isEmail, 'Please enter a valid email'], // validate: [(value) => {}, 'type something']
        unique: true, // accessed by err.code / you can't do a custom message for the unique
        lowercase: true,
    },
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum password length is 6 characters'],
    }
}, { timestamps: true });


/* mongoose hooks: (#6 check the description below) */

// fire a function after doc saved to the db
userSchema.post('save', function(doc, next) { // this doesn't refer to the post request, it means post event where the event here is save
    //console.log('new user was creates and saved', doc);

    next(); // so that the code won't hang in, but move on
})

// fire a function before doc saved to the db
userSchema.pre('save', async function(next) { // the reason we use the "function" here is to use the "this" keyword refering to the instance of the user we're trying to create (User.create)
    // console.log('new user about to be created and saved', this); // we can't access to the "doc" since user hasn't been created yet, but the "this" is the instance that is about to be the "doc"

    // hashing the password (returns a promise)
    const salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, salt) // hashed password to the db (with salt)

    next();
})

// static method to login User (extension)
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({ email });

    // check if user exists
    if (user) {
        // check if passwords match
        const auth = await bcrypt.compare(password, user.password);

        if (auth) return user;

        throw new Error('incorrect password');
    }
    throw new Error('incorrect email');
}

const User = mongoose.model('user', userSchema);
module.exports = User;