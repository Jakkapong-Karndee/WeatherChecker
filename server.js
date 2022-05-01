if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

var express = require("express")
const mongoose = require('mongoose');
const User = require('./models/user');
var app = express()
//-----------------------------------authentication part
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config');
initializePassport(
    passport,
    username => User.find(user => user.username === username),
    id => User.find(user => user.id === id)
)
//-------------------------------

//connect to mongodb
const dbURI = 'mongodb+srv://admin:A395UNE4fFE6mnJ2@des422-mongodb.7jcr1.mongodb.net/DES422-MongoDB?retryWrites=true&w=majority'
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));


app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/javascript', express.static(__dirname + 'public/javascript'))
app.set('views', './views');
app.set('view engine', 'ejs');

//-----------------------------------authentication part
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//link to index
app.get('/', checkAuthenticated, (req, res) => {
    res.render('index.ejs')
});

//link to login
app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
});

//link to signup
app.get('/signup', checkNotAuthenticated, (req, res) => {
    res.render('signup.ejs')
});

//connect signup with DB & hash password
app.post('/signup', checkNotAuthenticated, async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newuser = new User({
            name: req.body.name,
            email: req.body.email,
            username: req.body.username,
            password: hashedPassword
        });
        newuser.save();
        res.redirect('/login');
    } catch {
        res.redirect('/signup');
    }
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

//---------------------------------------------------------
// insert user
app.get('/add-user', (req, res) => {
    const user = new User({
        name: 'Jack Sparrow',
        email: 'Jack@gmail.com',
        username: 'jack',
        password: '1234'
    });

    user.save()
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            console.log(err);
        });
});

// show all users
app.get('/all-users', (req, res) => {
    User.find()
        .then((result) => {
            res.send(result);
        })
        .catch((err) => {
            conslotchange.log(err);
        });
})
// show user
app.get('/single-user', (req, res) => {
    User.find({ username: 'jack' })
        .then((result) => {
            res.send(result)
        })
        .catch((err) => {
            conslotchange.log(err);
        });
})


app.get('/setting', (req, res) => {
    res.redirect('/users');
});

app.get('/users', (req, res) => {
    User.find()
        .then((result) => {

            res.render('setting', { users: result })
        })
        .catch((err) => {
            console.log(err);
        })
})

