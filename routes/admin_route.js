module.exports = (function() {
  'use strict';

  const express = require('express');
  const path = require('path');
  var types = require('pg').types;
  const bcrypt = require('bcrypt');
  const { Client } = require('pg');
  const saltRounds = 10;

  const User = require('../models/user.js');
  const Class = require('../models/class.js');
  const Committee = require('../models/committee.js');

  var adminRoute = require ('express').Router();

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
  })
  .catch(function () {
  });

// ADMIN PROFILE
adminRoute.get('/',
  function (req, res, next) {
    if (req.isAuthenticated() && req.user.is_admin) {
      res.render('partials/admin/profile-admin', {
        layout: 'admin',
        title: 'Welcome'
      })
    } else {
      res.redirect('/')
    }
  });

adminRoute.post('/updateadminprofile', function (req, res) {
  bcrypt.genSalt(saltRounds, function (err, salt) {
    if (err) {
      console.log('error');
    } else {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) {
          console.log('error');
        } else {
          Customer.updateProfile(client, {customerId: req.user.id}, {
            email: req.body.email,
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            street: req.body.street,
            municipality: req.body.municipality,
            province: req.body.province,
            zipcode: req.body.zipcode,
            password: hash,
          }, function (user) {
            res.redirect('/home');
          });
        };
      });
    };
  });
});


// ADMIN FACULTIES LIST
adminRoute.get('/faculties',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      User.list(client, 'faculty', function (faculty) {
        res.render('partials/admin/faculties-admin', {
          faculty: faculty,
          layout: 'admin',
          title: 'Faculty'
        })
      });
    } else {
      res.redirect('/')
    }
  });

// ADMIN ADD FACULTIES
adminRoute.get('/faculties/add_faculty',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      res.render('partials/admin/faculties-add-admin', {
        layout: 'admin',
        title: 'Add Faculty'
      });
    } else {
      res.redirect('/')
    }
  });

// ADMIN STUDENTS LIST
adminRoute.get('/students',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      User.list(client, 'student', function (user) {
        res.render('partials/admin/students-admin', {
          user: user,
          layout: 'admin',
          title: 'Students'
        });
      });
    } else {
      res.redirect('/')
    };
  });

// ADMIN ADD STUDENTS
adminRoute.get('/students/add_student',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      res.render('partials/admin/students-add-admin', {
        layout: 'admin',
        title: 'Add Student'
      });
    } else {
      res.redirect('/')
    }
  });

// ADMIN CLASS LIST
adminRoute.get('/class',
  function (req, res, next) {
    if (req.isAuthenticated() && req.user.is_admin) {
      Class.list(client, {}, function (classes) {
        res.render('partials/admin/class-admin', {
          layout: 'admin',
          title: 'Classes',
          classes: classes
        });
      });

    } else {
      res.redirect('/')
    }
  });

// ADMIN ADD CLASS
adminRoute.get('/class/add_class',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      User.list(client, 'faculty', function (user) {
        res.render('partials/admin/class-add-admin', {
          user: user,
          layout: 'admin',
          title: 'Add Class'
        });
      });
    } else {
      res.redirect('/')
    }
  });


adminRoute.get('/class/:id',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      Class.getById(client, req.params.id, function (classData) {
        Class.getStudentsByClassId(client, req.params.id, function (classStudents) {
        console.log('CLASS STUDENTS', classStudents);
        User.noClassList(client, 'student', function (user) {
            res.render('partials/admin/class-list-admin', {
              classes: classData,
              classStudents: classStudents,
              user: user,
              layout: 'admin',
              title: 'Add Class'
            });
          });
        });
        });
    } else {
      res.redirect('/')
    }
  });

//ADMIN COMMITTEE LIST
adminRoute.get('/committee',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      Committee.getFacultyByCommittee(client, {}, function (committee) {
        Committee.notCommitteeList(client, {}, function(faculty) {
        res.render('partials/admin/committee-admin', {
          faculty: faculty,
          committee: committee,
          layout: 'admin',
          title: 'Committee'
        })
      });
      });
    } else {
      res.redirect('/')
    }
  });

// ADMIN GUEST LIST
adminRoute.get('/guests',
  function (req, res) {
    if (req.isAuthenticated() && req.user.is_admin) {
      res.render('partials/admin/guests-admin', {
        layout: 'admin',
        title: 'Categories'
      });
    } else {
      res.redirect('/')
    }
  });

// ADMIN ADD GUEST
adminRoute.post('/insertguest', function (req, res) {
  Category.create(client, {
    category_name: req.body.name
  }, function (category) {
    if (category === 'SUCCESS') {
      console.log('INSERTED');
      res.redirect('/admin/guests');
    } else if (category === 'ERROR') {
      res.render('partials/admin/error', {
        msg: 'There was a problem creating the Category.',
        msg2: 'Try Again?',
        title: 'Error',
        action: 'creating',
        page: 'category',
        layout: 'admin',
        link: '/admin/categories'
      });
    }
  });
});

return adminRoute;
})();