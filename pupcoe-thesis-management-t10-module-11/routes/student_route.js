module.exports = (function() {
  'use strict';
  const { Client } = require('pg');
  const User = require('../models/user.js');
  const Class = require('../models/class.js');
  const Group = require('../models/group.js');
  const Thesis = require('../models/thesis.js');

  var studentRoute = require ('express').Router();

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
  })
  .catch(function () {
  });

//STUDENT PROFILE
studentRoute.get('/',
  function (req, res, next) {
  if (req.isAuthenticated() && req.user.user_type == 'student') {
    Class.getByStudentId(client, req.user.id, function(data) {
      res.render('partials/student/profile', {
        data: data,
        title: 'Profile',
        layout: 'student'
      });
          });
  } else {
    res.redirect('/')
  }
  });

//STUDENT SUBMIT THESIS FORM
studentRoute.get('/submit_abstract',
  function (req, res, next) {
  if (req.isAuthenticated() && req.user.user_type == 'student') {
    Group.listGroups(client, {}, function(data) {
      res.render('partials/student/submit_abstract', {
        data: data,
        title: 'Submit Abstract',
        layout: 'student'
      });
            console.log(data);
      });
  } else {
    res.redirect('/')
  }
  });

//STUDENT SUBMIT THESIS FORM
studentRoute.get('/choose',
  function (req, res, next) {
  if (req.isAuthenticated() && req.user.user_type == 'student') {
    Group.listGroups(client, {}, function(data) {
      Thesis.listAll(client, {}, function(thesis) {
      res.render('partials/student/choose', {
        data: data,
        title: 'Submit Abstract',
        layout: 'student',
        thesis: thesis
      });
      });
      });
  } else {
    res.redirect('/')
  }
  });

return studentRoute;
})();