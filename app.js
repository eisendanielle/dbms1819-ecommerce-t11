const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const PORT = process.env.PORT || 5000

// const client = new Client({
// 	database: 'storedb',
// 	user: 'postgres',
// 	password: '0910',
// 	host: 'localhost',
// 	port: 5432
// });

const client = new Client({
	database: 'deua2se0ond0cu',
	user: 'xeolsxmpkxgcal',
	password: '17192200bc821debbff0956f29efeff32940349c10d9e51dd3d50de05283a55e',
	host: 'ec2-54-225-76-201.compute-1.amazonaws.com',
	port: 5432,
	ssl: true
});

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
			title: 'Our Products'
		});
	});
});

app.get('/products/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT products.id, products.product_name, products.product_description, products.tagline, products.price, products.warranty, products.pic, products.category_id, products_category.category_name, products.brand_id, brands.brand_name FROM products INNER JOIN products_category ON products.category_id = products_category.id INNER JOIN brands ON products.brand_id = brands.id ORDER BY products.id', (req, data) => {
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


app.get('/product/create', (req, res) => {
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
			res.render('create_product', {
				data: list,
				data2: list2
			});
		});
	});
});

app.post('/', function (req, res) {
	var values = [];
	values = [req.body.product_name, req.body.product_description, req.body.tagline, req.body.price, req.body.warranty, req.body.pic, req.body.category_id, req.body.brand_id];
	client.query("INSERT INTO products(product_name, product_description, tagline, price, warranty, pic, category_id, brand_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", values, (err, res) => {
		if (err) {
			console.log(err.stack)
		}
		else {
			console.log(res.rows[0])
		}
	});
	res.redirect('/');
});


app.get('/product/update/:id', (req, res) => {
	var id = req.params.id;
	client.query('SELECT products.id, products.product_name, products.product_description, products.tagline, products.price, products.warranty, products.pic, products.category_id, products_category.category_name, products.brand_id, brands.brand_name FROM products INNER JOIN products_category ON products.category_id = products_category.id INNER JOIN brands ON products.brand_id = brands.id ORDER BY products.id', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			if (i == id) {
				list.push(data.rows[i - 1]);
			}
		}
		client.query('SELECT * FROM products_category', (req, data) => {
			var list2 = [];
			for (var i = 1; i < data.rows.length + 1; i++) {
				list2.push(data.rows[i - 1]);
			}
			client.query('SELECT * FROM brands', (req, data) => {
				var list3 = [];
				for (var i = 1; i < data.rows.length + 1; i++) {
					list3.push(data.rows[i - 1]);
				}
				res.render('update_product', {
					products: list,
					products_category: list2,
					brands: list3
				});
			});
		});
	});
});

app.post('/products/:id', function (req, res) {
	console.log(req.body);
	var id = req.params.id;
	client.query("UPDATE products SET product_name = '" + req.body.product_name + "', product_description = '" + req.body.product_description + "', tagline = '" + req.body.tagline + "', price = '" + req.body.price + "', warranty = '" + req.body.warranty + "', pic = '" + req.body.pic + "', category_id = '" + req.body.category_id + "', brand_id = '" + req.body.brand_id + "' WHERE id = '" + req.body.id + "' ");
	res.redirect('/products/' + id);
});

app.post('/products/:id/send', function (req, res) {
	console.log(req.body);
	var id = req.params.id;
	var email = req.body.email;
	var customers_values = [req.body.email, req.body.first_name, req.body.last_name, req.body.street, req.body.municipality, req.body.province, req.body.zipcode];
	var orders_values = [req.body.product_id, req.body.quantity];

	const acknowledge = `
	<p>Your Order Request has been received!</p>
	<h3>Order Details</h3>
	<ul>
		<li>Customer Name: ${req.body.first_name} ${req.body.last_name}</li>
		<li>Email: ${req.body.email}</li>
		<li>Address: ${req.body.street} ${req.body.municipality} ${req.body.province} ${req.body.zipcode}</li>
		<li>Product ID: ${req.body.product_id}</li>
		<li>Quantity: ${req.body.quantity}</li>
	</ul>
`;
	const request = `
	<p>You have a new Order Request!</p>
	<h3>Order Details</h3>
	<ul>
		<li>Customer Name: ${req.body.first_name} ${req.body.last_name}</li>
		<li>Email: ${req.body.email}</li>
		<li>Address: ${req.body.street} ${req.body.municipality} ${req.body.province} ${req.body.zipcode}</li>
		<li>Product ID: ${req.body.product_id}</li>
		<li>Quantity: ${req.body.quantity}</li>
	</ul>
`;


	client.query('SELECT email FROM customers', (req, data) => {
		var list;
		var existing = 0;
		console.log(email);
		for (var i = 0; i < data.rows.length; i++) {
			list = data.rows[i].email;
			console.log(list);
			if (list == email) {
				existing = 1;
			}
		}

		if (existing == 1) {
			console.log("Existing customer!");

			client.query('SELECT id FROM customers WHERE email=$1', [email], (err, data) => {
				if (err) {
					console.log(err.stack)
				}
				else {
					console.log(data.rows);
					orders_values[2] = data.rows[0].id;
					console.log(orders_values)
					client.query('INSERT INTO orders(product_id, quantity, customer_id) VALUES($1, $2, $3)', orders_values, (req, data) => {

						let transporter = nodemailer.createTransport({
							host: 'smtp.gmail.com',
							port: 465,
							secure: true,
							auth: {
								user: 'fiedadwheels@gmail.com',
								pass: 'fiedadWheels69'
							}
						});
						let mailOptions1 = {
							from: '"Fiedad Wheels" <fiedadwheels@gmail.com',
							to: email,
							subject: 'Fiedad Wheels Acknowledgement',
							html: acknowledge
						};

						let mailOptions2 = {
							from: '"Fiedad Wheels" <fiedadwheels@gmail.com>',
							to: 'eisen1021@gmail.com, duannepiedad@gmail.com',
							subject: 'Fiedad Wheels Request',
							html: request
						};

						transporter.sendMail(mailOptions1, (error, info) => {
							if (error) {
								return console.log(error);
							}
						});

						transporter.sendMail(mailOptions2, (error, info) => {
							if (error) {
								return console.log(error);
							}
						});
					});
					res.redirect('/products/' + id + '/email-exists');
				}
			});
		}
		else {
			console.log(customers_values);
			client.query('INSERT INTO customers(email, first_name, last_name, street, municipality, province, zipcode) VALUES($1, $2, $3, $4, $5, $6, $7)', customers_values, (err, data) => {
				if (err) {
					console.log(err.stack)
				}
				else {
					client.query('SELECT lastval()', (err, data) => {
						if (err) {
							console.log(err.stack)
						}
						else {
							console.log(data.rows);
							orders_values[2] = data.rows[0].lastval;
							console.log(orders_values)
							client.query('INSERT INTO orders(product_id, quantity, customer_id) VALUES($1, $2, $3)', orders_values, (req, data) => {

								let transporter = nodemailer.createTransport({
									host: 'smtp.gmail.com',
									port: 465,
									secure: true,
									auth: {
										user: 'fiedadwheels@gmail.com',
										pass: 'fiedadWheels69'
									}
								});

								let mailOptions1 = {
									from: '"Fiedad Wheels" <fiedadwheels@gmail.com',
									to: email,
									subject: 'Fiedad Wheels Acknowledgement',
									html: acknowledge
								};

								let mailOptions2 = {
									from: '"Fiedad Wheels" <fiedadwheels@gmail.com>',
									to: 'eisen1021@gmail.com, duannepiedad@gmail.com',
									subject: 'Fiedad Wheels Request',
									html: request
								};

								transporter.sendMail(mailOptions1, (error, info) => {
									if (error) {
										return console.log(error);
									}
								});

								transporter.sendMail(mailOptions2, (error, info) => {
									if (error) {
										return console.log(error);
									}
								});
							});
							res.redirect('/products/' + id + '/send');
						}
					});
				}
			});
		}
	});
});

app.get('/products/:id/send', function (req, res) {
	var id = req.params.id;
	res.render('email', {
		message: 'Welcome to Fiedad Wheels! Your email has been sent!',
		PID: id
	});
});

app.get('/products/:id/email-exists', function (req, res) {
	var id = req.params.id;
	res.render('email', {
		message: 'Welcome back! Your email has been sent!',
		PID: id
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

app.get('/category/create', (req, res) => {
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

app.get('/brand/create', (req, res) => {
	res.render('create_brands');
});

// CUSTOMERS
app.get('/customers', (req, res) => {
	client.query('SELECT * FROM customers', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			list.push(data.rows[i - 1]);
		}
		res.render('customers', {
			data: list
		});
	});
});

app.get('/customers/:id', (req, res) => {
	var id = req.params.id;
	console.log(id);
	client.query('SELECT orders.id, orders.customer_id, orders.product_id, orders.purchase_date, orders.quantity, customers.email, customers.first_name,customers.middle_name, customers.last_name, customers.street, customers.municipality, customers.province, customers.zipcode, products.product_name FROM orders INNER JOIN customers ON orders.customer_id = customers.id INNER JOIN products ON orders.product_id = products.id WHERE orders.customer_id = $1', [id], (err, data) => {
		if (err) {
			console.log(err);
		}
		else {
			var list = [];
			console.log(data.rows);
			for (var i = 1; i < data.rows.length + 1; i++) {
				list.push(data.rows[i - 1]);
			}
			data.rows[0];
			res.render('customer_details', {
				data: list,
				first_name: list[0].first_name,
				middle_name: list[0].middle_name,
				last_name: list[0].last_name,
				customer_id: list[0].customer_id,
				email: list[0].email,
				street: list[0].street,
				municipality: list[0].municipality,
				province: list[0].province,
				zipcode: list[0].zipcode
			});
		}
	});
});


// ORDERS
app.get('/orders', (req, res) => {
	client.query('SELECT * FROM orders', (req, data) => {
		var list = [];
		for (var i = 1; i < data.rows.length + 1; i++) {
			list.push(data.rows[i - 1]);
		}
		res.render('orders', {
			data: list
		});
	});
});

// MEMBERS
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
