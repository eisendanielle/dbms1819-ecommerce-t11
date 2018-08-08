const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

const client = new Client({
	database: 'storedb',
	user: 'postgres',
	password: '0910',
	host: 'localhost',
	port: 5432
});

// const client = new Client({
// 	database: 'deua2se0ond0cu',
// 	user: 'xeolsxmpkxgcal',
// 	password: '17192200bc821debbff0956f29efeff32940349c10d9e51dd3d50de05283a55e',
// 	host: 'ec2-54-225-76-201.compute-1.amazonaws.com',
// 	port: 5432,
// 	ssl: true
// });

client.connect()
	.then(function () {
		console.log('Connected to database!');
	})
	.catch(function () {
		console.log('Error');
	})


const app = express();
app.use(express.static(path.join(__dirname, 'public')));
app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());



app.get('/', function (req, res) { 
	client.query('SELECT * FROM products ORDER BY products.id', (req, data) => {
		var list = [];
		for (var i = 0; i < data.rows.length; i++) {
			list.push(data.rows[i]);
		}
		res.render('home', {
			data: list,
			title: 'Top Products'
		});
	});
});


// PRODUCTS CATEGORY
app.post('/categories', function (req, res) {
	var values = [];
	values = [req.body.category_name];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO products_category(category_name) VALUES($1)", values, (err, res) => {
		if (err) {
			console.log(err.stack)
		}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/categories');
});


app.get('/categories', (req, res) => {
	client.query('SELECT * FROM products_category', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			list.push(data.rows[i - 1]);
		}
		res.render('categories', {
			data: list
		});
	});
});

app.get('/categories/create', (req, res) => {
	res.render('create_categories');
});


// PRODUCTS BRAND
app.post('/brands', function (req, res) {  
	var values = [];
	values = [req.body.brand_name, req.body.brand_description];
	console.log(req.body);
	console.log(values);
	client.query("INSERT INTO brands(brand_name, brand_description) VALUES($1, $2)", values, (err, res) => {
		if (err) {
			console.log(err.stack)
		}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/brands');
});

app.get('/brands', (req, res) => { 
	client.query('SELECT * FROM brands', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			list.push(data.rows[i - 1]);
		}
		res.render('brands', {
			data: list
		});
	});
});

app.get('/brands/create', (req, res) => {
	res.render('create_brands');
});



app.get('/product/create', (req, res) => {	//CREATE PRODUCT html
	client.query('SELECT * FROM products_category', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			list.push(data.rows[i - 1]);
		}
		client.query('SELECT * FROM brands', (req, data) => {
			var list2 = [];
			for (var i = 1; i < data.rows.length + 1; i++) {
				list2.push(data.rows[i - 1]);
			}
			res.render('product_create', {
				data: list,
				data2: list2
			});
		});
	});
});

app.get('/products/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT * FROM products_m1', (req, data) => {
		var list = [];
		for (var i = 0; i < data.rows.length + 1; i++) {
			if (i == id) {
				list.push(data.rows[i - 1]);
			}
		}
		res.render('products', {
			data: list
		});
	});
});

app.get('/edit', (req, res) => {
	var id = req.params.id;
	res.render('edit');
});

app.post('/products/:id/send', function (req, res) {
	console.log(req.body);
	var id = req.params.id;
	const output = `
		<p>You have a new contact request</p>
		<h3>Contact Details</h3>
		<ul>
			<li>Customer Name: ${req.body.name}</li>
			<li>Phone: ${req.body.phone}</li>
			<li>Email: ${req.body.email}</li>
			<li>Product ID: ${req.body.productid}</li>
			<li>Quantity: ${req.body.quantity}</li>
		</ul>
	`;

	//nodemailer
	let transporter = nodemailer.createTransport({
		host: 'smtp.mail.yahoo.com',
		port: 465,
		secure: true,
		auth: {
			user: 'iemaniamailer@yahoo.com',
			pass: 'custominearmonitor'
            /*
            user: 'iemaniamailer@google.com', 
            pass: 'custominearmonitor' 
        host: 'smtp.mail.yahoo.com'
            */
		}
	});

	let mailOptions = {
		from: '"IEMania Mailer" <iemaniamailer@yahoo.com>',
		to: 'jdvista96@gmail.com, killerbats1com@gmail.com, drobscortz@gmail.com',
		subject: 'IEMania Contact Request',
		//text: req.body.name,
		html: output
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message sent: %s', info.messageId);
		console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

		client.query('SELECT * FROM products_m1', (req, data) => {
			var list = [];
			for (var i = 0; i < data.rows.length + 1; i++) {
				if (i == id) {
					list.push(data.rows[i - 1]);
				}
			}
			res.render('products', {
				data: list,
				msg: '---Email has been sent---'
			});
		});
	});
});

app.get('/team/11/Eisen', function (req, res) {
	res.render('member', {
		name: 'Eisen Danielle Fiesta',
		email: 'eisen1021@gmail.com',
		phone: '09173371660',
		imageurl: 'https://scontent.fmnl9-1.fna.fbcdn.net/v/t1.0-9/19437239_1500393716673391_602765196506655918_n.jpg?_nc_cat=0&oh=2852bbfbaae4548d7b5a2761fd026158&oe=5C0AF32C',
		hobbies: ['Instrument Playing', 'Singing', 'Eating']
	});
});

app.get('/team/11/Duanne', function (req, res) {
	res.render('member', {
		name: 'Duanne Malvin Piedad',
		email: 'duannepiedad@gmail.com',
		phone: '09173096381',
		imageurl: 'https://scontent.fmnl4-6.fna.fbcdn.net/v/t1.0-9/18765857_1876761379008006_8721594579226360278_n.jpg?_nc_cat=0&oh=1a5518d108aca039ca037ae378628760&oe=5BCEB7BB',
		hobbies: ['Cooking', 'Eating', 'Dancing']
	});
});

app.listen(3000, function () {
	console.log('Server started at port 3000');
});

app.listen(PORT);