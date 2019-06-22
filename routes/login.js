var express = require('express');
var loginRouter = express.Router();
const passport = require('passport');

// LOGIN
loginRouter.get('/', function (req, res) {
  res.render('partials/login/login', {
    title: 'Welcome'
  });
});

loginRouter.post('/login',
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    if (req.user.is_admin) {
      res.redirect('/admin');
    } else if (req.user.user_type == 'faculty') {
      res.redirect('/faculty');
    } else if (req.user.user_type == 'student') {
      res.redirect('/student');
    } 
    // else if (req.user.user_type == 'guest') {
    //   res.redirect('/guest');
    // } 
    else {
      res.redirect('/');
    }
  });

// LOGOUT
loginRouter.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// // RESET PASSWORD
// loginRouter.get('/forgot', function (req, res) {
//   res.render('partials/login/forgot', {
//     title: 'Reset Password'
//   });
// });

// loginRouter.post('/forgot', function (req, res, next) {
//   async.waterfall([
//     function (done) {
//       crypto.randomBytes(20, function (err, buf) {
//         var token = buf.toString('hex');
//         done(err, token);
//       });
//     },
//     function (token, done) {
//       Customer.getByEmail1(client, { email: req.body.email }, {resetPasswordToken: token}, {resetPasswordExpires: Date.now() + 3600000}, function (user) {
//         if (!user) {
//           req.flash('error', 'No account with that email address exists.');
//           return res.redirect('/forgot');
//         }

//         user.resetPasswordToken = token;
//         user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

//         //  user.save(function(err) {
//         //   done(err, token, user);
//         // });
//       });
//     },

//     function (token, user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.GMAIL_USER,
//           pass: process.env.GMAIL_PASS
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: process.env.GMAIL_USER,
//         subject: 'Password Reset',
//         text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
//           'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
//           'http://' + req.headers.host + '/reset/' + token + '\n\n' +
//           'If you did not request this, please ignore this email and your password will remain unchanged.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function (err) {
//         console.log('mail sent');
//         req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
//         done(err, 'done');
//       });
//     }
//   ], function (err) {
//     if (err) return next(err);
//     res.redirect('/forgot');
//   });
// });

// loginRouter.get('/reset/:token', function (req, res) {
//   Customer.getByEmail1(client, email, { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
//     if (!user) {
//       req.flash('error', 'Password reset token is invalid or has expired.');
//       return res.redirect('/forgot');
//     }
//     res.render('partials/login/reset', {token: req.params.token});
//   });
// });

// loginRouter.post('/reset/:token', function (req, res) {
//   async.waterfall([
//     function (done) {
//       Customer.getByEmail1(client, email, { resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
//         if (!user) {
//           req.flash('error', 'Password reset token is invalid or has expired.');
//           return res.redirect('back');
//         }
//         if (req.body.password === req.body.confirm) {
//           user.setPassword(req.body.password, function (err) {
//             user.resetPasswordToken = undefined;
//             user.resetPasswordExpires = undefined;

//             // user.save(function(err) {
//             //   req.logIn(user, function(err) {
//             //     done(err, user);
//             //   });
//             // });
//           });
//         } else {
//           req.flash('error', 'Passwords do not match.');
//           return res.redirect('back');
//         }
//       });
//     },
//     function (user, done) {
//       var smtpTransport = nodemailer.createTransport({
//         service: 'Gmail',
//         auth: {
//           user: process.env.GMAIL_USER,
//           pass: process.env.GMAIL_PASS
//         }
//       });
//       var mailOptions = {
//         to: user.email,
//         from: process.env.GMAIL_USER,
//         subject: 'Your password has been changed',
//         text: 'Hello,\n\n' +
//           'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
//       };
//       smtpTransport.sendMail(mailOptions, function (err) {
//         req.flash('success', 'Success! Your password has been changed.');
//         done(err);
//       });
//     }
//   ], function (err) {
//     res.redirect('/');
//   });
// });

module.exports = loginRouter;