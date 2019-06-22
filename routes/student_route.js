module.exports = (function() {
  'use strict';
  const { Client } = require('pg');
  const User = require('../models/user.js');
  const Class = require('../models/class.js');

  var studentRoute = require ('express').Router();

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



return studentRoute;
})();