var Email = {
  sendNotificationToCustomer: (subject, mailOptions1, callback) => {
    var nodemailer = require('nodemailer');
    var hbs = require('nodemailer-express-handlebars');
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    // var mailOptions1 = {
    //   viewEngine: {
    //     extname: '.handlebars',
    //     layoutsDir: 'views/layouts/',
    //     defaultLayout: 'template',
    //     partialsDir: 'views/partials/'
    //   },
    //   viewPath: 'views/partials/email/',
    //   extName: '.handlebars',
    //   from: '"A&P Clothing" <dbms.projects1819@gmail.com>',
    //   to: '${mailOptions1.email}',
    //   subject: 'Order Received',
    //   template: 'email.body',
    //   context: {
    //     status: 'Your order was sent to us',
    //     message: 'Thank you for shopping with us. For inquiries, contact us at dbms.projects1819@gmail.com',
    //     name: '${mailOptions1.name}',
    //     email: '${mailOptions1.email}',
    //     number: '${mailOptions1.number}',
    //     productid: '${mailOptions1.productid}',
    //     quantity: '${mailOptions1.quantity}',
    //     address: '${mailOptions1.address}'
    //   }
    // };
    transporter.use('compile', hbs(mailOptions1));
    transporter.sendMail(mailOptions1, (error, info) => {
      if (error) {
        console.log('error');
      } else {
        console.log('success');
      }
    });
  },

  sendNotificationToAdmin: (subject, mailOptions2, callback) => {
    var nodemailer = require('nodemailer');
    var hbs = require('nodemailer-express-handlebars');
    var transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    });
    // var mailOptions2 = {
    //   viewEngine: {
    //     extname: '.handlebars',
    //     layoutsDir: 'views/layouts/',
    //     defaultLayout : 'template',
    //     partialsDir : 'views/partials/'
    //   },
    //   viewPath: 'views/partials/email/',
    //   extName: '.handlebars',
    //   from: '"A&P Clothing" <dbms.projects1819@gmail.com>',
    //   to: 'patgnavarro@gmail.com, marquez.josealfonso@gmail.com',
    //   subject: 'New Order Request',
    //   template: 'email.body',
    //   context: {
    //     status: 'New order request',
    //     message: '',
    //     name: '${mailOptions2.name}',
    //     email: '${mailOptions2.email}',
    //     number: '${mailOptions2.number}',
    //     productid: '${mailOptions2.productid}',
    //     quantity: '${mailOptions2.quantity}',
    //     address: '${mailOptions2.address}'
    //   }
    // };
    transporter.use('compile', hbs(mailOptions2));
    transporter.sendMail(mailOptions2, (error, info) => {
      if (error) {
        console.log('error');
      } else {
        console.log('success');
      }
    });
  },

  getNewOrderEmail: () => {

  }

};

module.exports = Email;
