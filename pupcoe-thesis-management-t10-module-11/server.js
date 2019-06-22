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
const Thesis = require('./models/thesis.js');



//ROUTES
var adminRoute = require("./routes/admin_route");
var facultyRoute = require("./routes/faculty_route");
var guestRoute = require("./routes/guest_route");
var nonLoggedRoute = require("./routes/non_logged_route");
var studentRoute = require("./routes/student_route");
var loginRoute = require("./routes/login");

//CLIENT
const client = new Client({
  database: 'd7illutusb8n6k',
  user: 'brsaoynqhwfbam',
  password: '3c091bbda2a4a994b79ab1745089a83fe208f8966f91fbb2e9245097419ca303',
  host: 'ec2-54-243-46-32.compute-1.amazonaws.com',
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

//STUDENT SUBMIT ABSTRACT
app.post('/submit', function (req, res) {
  User.submitThesis(client, {
group: req.body.group,
thesistitle: req.body.thesistitle,
abstract: req.body.abstract
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/student/');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem submitting your proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'submitting',
        page: 'proposal',
        layout: 'student',
        link: '/student/submit_abstract'
      });
    }
  });
});

//FACULTY APPROVE
app.post('/proposal', function (req, res) {
  Thesis.updateStatus(client, {
stage: "for committee",
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/faculty/thesis');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem approving/rejecting the proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'approving/rejecting',
        page: 'proposal',
        layout: 'faculty',
        link: '/faculty/thesis'
      });
    }
  });
});
//FACULTY REJECT
app.post('/proposal_reject', function (req, res) {
  Thesis.updateStatus(client, {
stage: "rejected by faculty",
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/faculty/thesis');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem approving/rejecting the proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'approving/rejecting',
        page: 'proposal',
        layout: 'faculty',
        link: '/faculty/thesis'
      });
    }
  });
});

//COMMITTEE APPROVE/REJECT
app.post('/proposal/defense', function (req, res) {
  Thesis.updateStatus(client, {
stage: "for defense",
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/faculty/thesis');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem approving/rejecting the proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'approving/rejecting',
        page: 'proposal',
        layout: 'faculty',
        link: '/faculty/thesis'
      });
    }
  });
});

//COMMITTEE REJECT
app.post('/proposal/defense_reject', function (req, res) {
  Thesis.updateStatus(client, {
stage: "rejected by committee",
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/faculty/thesis');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem approving/rejecting the proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'approving/rejecting',
        page: 'proposal',
        layout: 'faculty',
        link: '/faculty/thesis'
      });
    }
  });
});

//STUDENT THESIS TO USE FOR DEFENSE
app.post('/proposal/use_defense', function (req, res) {
  Thesis.updateStatus(client, {
stage: "MOR",
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/student/choose');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem choosing the proposal.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'choosing',
        page: 'proposal',
        layout: 'student',
        link: '/student/choose'
      });
    }
  });
});

//SEE THESIS STATUS
app.get('/status',
  function (req, res, next) {
      if (req.isAuthenticated() && req.user.user_type == 'faculty' || 'student') {
      Thesis.listHeadPanel(client, {}, function (thesis) {
        console.log(thesis);
        res.render('partials/status', {
          layout: 'faculty',
          title: 'Thesis',
          thesis: thesis
        });
      });
    } else {
      res.redirect('/')
    }
  });



//ASSIGN HEAD PANELIST
app.post('/assign', function (req, res) {
  Thesis.updateHeadPanel(client, {
head: req.body.facultylist,
thesis_id: req.body.thesis_id
  }, function (thesis) {
    if (thesis === 'success') {
      res.redirect('/faculty/mor');
    } else if (thesis === 'error') {
      res.render('partials/admin/error', {
        msg: 'There was a problem choosing the panel.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'choosing',
        page: 'panel',
        layout: 'faculty',
        link: '/faculty/mor'
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
