const express = require('express');
const path = require('path');
const { Client } = require('pg');
const app = express();
var types = require('pg').types;
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var Handlebars = require('handlebars');
var MomentHandler = require('handlebars.moment');
var hbs = require('nodemailer-express-handlebars');
var paginate = require('handlebars-paginate');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var Strategy = require('passport-local').Strategy;
var session = require('express-session');
const bcrypt = require('bcrypt');
const saltRounds = 10;
// var crypto = require('crypto');
// var async = require('async');
Handlebars.registerHelper('paginate', paginate);
MomentHandler.registerHelpers(Handlebars);
require('dotenv').config();

//CALLBACKS
const Class = require('./models/class.js');
const User = require('./models/user.js');
const Committee = require('./models/committee.js');
const Group = require('./models/group.js');



//ROUTES
var adminRoute = require("./routes/admin_route");
var facultyRoute = require("./routes/faculty_route");
var guestRoute = require("./routes/guest_route");
var nonLoggedRoute = require("./routes/non_logged_route");
var studentRoute = require("./routes/student_route");
var loginRoute = require("./routes/login");

//CLIENT
const client = new Client({
  database: 'd2e89uf6dlr7q5',
  user: 'melgulxabeyzzp',
  password: 'e6d2c7d6c1922a4e41a4acb2a52352dcf75ff97d6c2a7333fdef28047bd6b235',
  host: 'ec2-184-73-197-211.compute-1.amazonaws.com',
  port: 5432,
  ssl: true
});
client.connect()
.then(function () {
  console.log('Connected to Database!');
})
.catch(function () {
  console.log('Error Connecting to Database');
});

//MOMENTJS
types.setTypeParser(1114, function (stringValue) {
  return new Date(Date.parse(stringValue + '+0000'));
});

//PASSPORT
passport.use(new Strategy({
  usernameField: 'email',
  passwordField: 'password'
},
function (email, password, cb) {
  User.getByEmail(client, email, function (user) {
    if (!user) { return cb(null, false); }
    bcrypt.compare(password, user.password).then(function (res) {
      if (res === false) { return cb(null, false); }
      return cb(null, user);
    });
  });
}));

//PASSPORT AUTHENTICATION
passport.serializeUser(function (user, cb) {
  cb(null, user.id);
});
passport.deserializeUser(function (id, cb) {
  User.getById(client, id, function (user) {
    cb(null, user);
  });
});
app.use(cookieParser());

//PASSPORT INITIALIZATION
app.use(session({
  key: 'user_sid',
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: 600000
  }
}));
app.use(passport.initialize());
app.use(passport.session());

//PUBLIC OR STATIC FOLDER
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text({ type: 'text/html' }));
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));

//ADMIN INSERT FACULTY
app.post('/insertfaculty', function (req, res) {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      console.log('error');
    } else {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) {
          console.log('error');
        } else {
          User.create(client, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            phone: req.body.phone,
            password: hash,
            user_type: 'faculty',
            is_admin: req.body.admin
          }, function (user) {
            if (user === 'success') {
              console.log('INSERTED');
              res.redirect('/faculty/group');
            } else if (user === 'error') {
              console.log('error', err);
              res.render('partials/admin/error', {
                msg: 'There was a problem adding a Faculty.',
                msg2: 'Try Again?',
                title: 'Error',
                action: 'adding',
                page: 'faculty',
                layout: 'admin',
                link: '/faculty/group'
              });
            }
          });
        }
      });
    }
  });
});


//ADMIN INSERT STUDENT
app.post('/insertstudent', function (req, res) {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      console.log('error');
    } else {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) {
          console.log('error');
        } else {
          User.create(client, {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            student_number: req.body.student_number,
            // class_id: req.body.class,
            email: req.body.email,
            phone: req.body.phone,
            user_type: 'student',
            password: hash
          }, function (user) {
            if (user === 'success') {
              console.log('INSERTED');
              res.redirect('/admin/students');
            } else if (user === 'error') {
              res.render('partials/admin/error', {
                msg: 'There was a problem adding a student.',
                msg2: 'Try Again?',
                title: 'Error',
                action: 'adding',
                page: 'student',
                layout: 'admin',
                link: '/admin/students'
              });
            }
          });
        }
      });
    }
  });
});

//ADMIN INSERT CLASS
app.post('/insertclass', function (req, res) {
  Class.create(client, {
    batch: req.body.batch,
    section: req.body.section,
    adviser: req.body.adviser
  }, function (classes) {
    if (classes === 'success') {
      console.log('INSERTED');
      res.redirect('/admin/class');
    } else if (classes === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem adding a class.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'adding',
        page: 'class',
        layout: 'admin',
        link: '/admin/class'
      });
    }
  });
});

//ADMIN INSERT GROUP
app.post('/insertgroup', function (req, res) {
  Group.create(client, {
    group: req.body.group,
    class: req.body.class
  }, function (groups) {
    if (groups === 'success') {
      console.log('INSERTED');
      res.redirect('/faculty/group');
    } else if (groups === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem adding a group.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'adding',
        page: 'group',
        layout: 'faculty',
        link: '/faculty/group'
      });
    }
  });
});

//ADMIN INSERT STUDENT IN CLASS
app.post('/add_student/:id', function (req, res) {
  Class.addStudents(client, {
class: req.params.id,
student: req.body.studentlist
  }, function (classes) {
    if (classes === 'success') {
      console.log('INSERTED');
      res.redirect('/admin/class/:id');
    } else if (classes === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem adding a student.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'adding',
        page: 'student',
        layout: 'admin',
        link: '/admin/class'
      });
    }
  });
});

//ADMIN INSERT FACULTY IN COMMITTEE
app.post('/add_committee', function (req, res) {
  Committee.addFaculty(client, {
faculty: req.body.facultylist
  }, function (committee) {
    if (committee === 'success') {
      res.redirect('/admin/committee');
    } else if (committee === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem adding a committee.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'adding',
        page: 'committee',
        layout: 'admin',
        link: '/admin/committee'
      });
    }
  });
});

//FACULTY INSERT STUDENT IN GROUP
app.post('/add_group/:id', function (req, res) {
  Group.addStudent(client, {
group: req.params.id,
student: req.body.studentlist
  }, function (groups) {
    if (groups === 'success') {
      res.redirect('/faculty/group');
    } else if (groups === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem adding a student to group.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'adding',
        page: 'student',
        layout: 'faculty',
        link: '/faculty/group'
      });
    }
  });
});

//ROUTES
app.use("/admin", adminRoute);
app.use("/faculty", facultyRoute);
app.use("/guest", guestRoute);
app.use("/visitor", nonLoggedRoute);
app.use("/student", studentRoute);
app.use("/", loginRoute);

// SERVER
app.listen(process.env.PORT || 4000, function () {
  console.log('Server started at port 4000');
});
