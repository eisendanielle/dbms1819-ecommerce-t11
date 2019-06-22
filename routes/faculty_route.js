module.exports = (function() {
  'use strict';
  const { Client } = require('pg');
  const User = require('../models/user.js');
  const Class = require('../models/class.js');
  const Committee = require('../models/committee.js');
  const Group = require('../models/group.js');
  
  var facultyRoute = require ('express').Router();

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

//CLASSES
facultyRoute.get('/',
  function (req, res, next) {
  if (req.isAuthenticated() && req.user.user_type == 'faculty') {
    Class.listByFacultyId(client, req.user.id, function (classes) {
      res.render('partials/faculty/class', {
        classes: classes,
        title: 'Faculty',
        layout: 'faculty'
      });
       });
        } else {
    res.redirect('/')
  }
  });


// CLASS DETAILS
facultyRoute.get('/class/:id',
  (req, res) => {
      if (req.isAuthenticated() && req.user.user_type == 'faculty') {
    Class.getById(client, req.params.id, function (classData) {
      Class.getStudentsByClassId(client, req.params.id, function (classStudents){
      res.render('partials/faculty/class_details', {
        layout: 'faculty',
        classData: classData,
        classStudents: classStudents 
      });
    });
      });
      } else {
    res.redirect('/')
  }
  });







// FACULTY GROUP LIST
facultyRoute.get('/group',
  function (req, res, next) {
      if (req.isAuthenticated() && req.user.user_type == 'faculty') {
      Group.list(client, {}, function (groups) {
        console.log(groups);
        res.render('partials/faculty/groups', {
          layout: 'faculty',
          title: 'Groups',
          groups: groups
        });
      });

    } else {
      res.redirect('/')
    }
  });

//FACULTY ADD GROUP
facultyRoute.get('/group/add_group',
  function (req, res) {
      if (req.isAuthenticated() && req.user.user_type == 'faculty') {
      Class.list(client, 'faculty', function (classes) {
        res.render('partials/faculty/group-add', {
          classes: classes,
          layout: 'faculty',
          title: 'Add Group'
        });
      });
    } else {
      res.redirect('/')
    }
  });


facultyRoute.get('/group/:id',
  function (req, res) {
      if (req.isAuthenticated() && req.user.user_type == 'faculty') {
      Group.getById(client, req.params.id, function (groupData) {
        Group.getStudentsByGroupId(client, req.params.id, function (classStudents) {
        console.log('GROUP NAME', groupData);
        Group.noGroupList(client, 'student', function (user) {
            res.render('partials/faculty/group-list', {
              groups: groupData,
              classStudents: classStudents,
              user: user,
              layout: 'faculty',
              title: 'Add Group'
            });
          });
        });
        });
    } else {
      res.redirect('/')
    }
  });


return facultyRoute;
})();

