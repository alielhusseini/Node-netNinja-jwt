// requires
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser'); // npm install cookie-parser
const { requireAuth, checkUser } = require('./middleware/authMiddleware');
require('dotenv/config'); // npm install dotenv (dotenv.config())

// setup
const app = express();
mongoose.connect(process.env.DB_CONNECTION).then(() => app.listen(3000)).catch(err => console.log(err));

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

/*
const db = mongoose.connection;
db.on('error', error => console.log(error));
db.once('open', ()) => console.log('Connected to DB'));
*/

// routes
app.get('*', checkUser); // to all get reqs and then it does next()
app.get('/', (req, res) => res.render('home'));
app.get('/smoothies', requireAuth, (req, res) => res.render('smoothies'));
app.use(require('./routes/authRoutes'));

// 404
app.use((req, res) => res.status(404).render('404'));

/*
 cookies give us a way to store data in the user's browser (#10 check the description below)
 1)
 when a req from the browser is sent to a server, we can create a cookie at that moment in time
 and decide what data that cookie would hold, how long should it last in the browser before expiration and auto deletion
 then the cookie is sent back by the server res to the browser and the browser registers it
 now the cookie is storing data in the user's browser
 2)
 thereafter, every req the browser makes to the server, it sends whatever cookie we stored in the server,
 where the server can access the cookie, this is how we'll be auth users 
 whereby this cookie holds a jwt to identify a user, and when the server sees that, it can verify and auth them
 for more security check csrf mitigation stratigies
*/

/*
// cookies
app.get('/set-cookies', (req, res) => {
    // when we send a res to the browser this cookie is sent with it
    // res.setHeader('Set-Cookie', 'newUser=false'); // key (identify the name of cookie)=value

    res.cookie('newUser', false);
    res.cookie('isEmployee', true, {
        maxAge: 1000 * 60 * 60 * 24, // by default the exp. of the cookie is one Session
        //secure: true, // cookie would be set only if the req is https (for production)
        httpOnly: true, // cookie can't be accessed from front-end JS
    });
    res.send('you got cookies');
})

app.get('/read-cookies', (req, res) => {

    const cookies = req.cookies;
    console.log(cookies.newUser, cookies.isEmployee);

    res.json(cookies);
})
*/