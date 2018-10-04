const express = require('express');
const path = require('path');
const { Client } = require('pg');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const moment = require('moment');
const PORT = process.env.PORT || 5000

var Product = require('./models/product');
var Brand = require('./models/brand');
var Category = require('./models/category');
var Order = require('./models/order');
var Customer = require('./models/customer');
var Dashboard = require('./models/dashboard');

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
	res.redirect('/page/1');
});

app.get('/products/:id', (req, res) => {
	Product.listDetails(client, req.params.id, function (productData) {
		res.render('products', {
			data: productData,
			layout: 'main'
		});
	});
});

app.get('/page/:id', function (req, res) {
	var page = parseInt(req.params.id);
	var totalItems, totalPage, prevPage, nextPage, lastPage;
	var pages = [];
	Product.getTotal(client, function (total) {
		totalItems = total[0].count;
		totalPage = totalItems / 10;
		for (var i = 1; i < totalPage + 1; i++) {
			pages[i - 1] = i;
			lastPage = i;
		};
		if (page === 1) {
			prevPage = 0;
			nextPage = 2;
		} else if (page > 1 && page < lastPage) {
			prevPage = page - 1;
			nextPage = page + 1;
		} else {
			prevPage = lastPage - 1;
			nextPage = 0;
		}
	});
	Product.list(client, { page }, function (products) {
		res.render('home', {
			data: products,
			page: page,
			pages: pages,
			prevPage: prevPage,
			nextPage: nextPage,
			title: 'Our Products'
		});
	});
});

app.get('/admin/products/page/:id', function (req, res) { 
	var page = parseInt(req.params.id);
	var totalItems, totalPage, prevPage, nextPage, lastPage;
	var pages = [];
	Product.getTotal(client, function (total) {
		totalItems = total[0].count;
		totalPage = totalItems / 10;
		for (var i = 1; i < totalPage + 1; i++) {
			pages[i - 1] = i;
			lastPage = i;
		};
		if (page === 1) {
			prevPage = 0;
			nextPage = 2;
		} else if (page > 1 && page < lastPage) {
			prevPage = page - 1;
			nextPage = page + 1;
		} else {
			prevPage = lastPage - 1;
			nextPage = 0;
		}
	});
	Product.list(client, { page }, function (products) {
		res.render('home_admin', {
			data: products,
			page: page,
			pages: pages,
			prevPage: prevPage,
			nextPage: nextPage,
			layout: 'admin',
			title: 'Our Products'
		});
	});
});

app.get('/admin/products/:id', (req, res) => {
	Product.listDetails(client, req.params.id, function (productData) {
		res.render('products_admin', {
			data: productData,
			layout: 'admin'
		});
	});
});

app.get('/admin/product/create', (req, res) => {
	Category.list(client, {}, function (categories) {
		Brand.list(client, {}, function (brands) {
			res.render('create_product', {
				data: categories,
				data2: brands,
				layout: 'admin'
			});
		});
	});
});

app.post('/admin/products', function (req, res) { 
	var productData = {
	  product_name: req.body.product_name,
	  product_description: req.body.product_description,
	  tagline: req.body.tagline,
	  price: req.body.price,
	  warranty: req.body.warranty,
	  pic: req.body.pic,
	  category_id: req.body.category_id,
	  brand_id: req.body.brand_id
	};
  
	Product.create(client, productData, function (error) {
	  if (error === 1) {
		res.render('duplicate', {
		  layout: 'admin',
		  name: 'Products',
		  message: 'Product already exists',
		  action: '/admin/products/page/1'
		});
	  } else {
		res.redirect('/admin/products/page/1');
	  }
	});
  });

app.get('/admin', function (req, res) {
	Dashboard.customersWithMostOrders(client, function (customersWithMostOrders) {
		Dashboard.customersWithHighestPayment(client, function (customersWithHighestPayment) {
			Dashboard.mostOrderedProducts(client, function (mostOrderedProducts) {
				Dashboard.leastOrderedProducts(client, function (leastOrderedProducts) {
					Dashboard.mostOrderedBrands(client, function (mostOrderedBrands) {
						Dashboard.mostOrderedCategories(client, function (mostOrderedCategories) {
							Dashboard.salesInTheLastSevenDays(client, function (salesInTheLastSevenDays) {
								Dashboard.salesInTheLastThirtyDays(client, function (salesInTheLastThirtyDays) {
									Dashboard.dailyOrderCount(client, function (dailyOrderCount) {
										res.render('dashboard', {
											customersWithMostOrders: customersWithMostOrders,
											customersWithHighestPayment: customersWithHighestPayment,
											mostOrderedProducts: mostOrderedProducts,
											leastOrderedProducts: leastOrderedProducts,
											mostOrderedBrands: mostOrderedBrands,
											mostOrderedCategories: mostOrderedCategories,
											salesInTheLastSevenDays: salesInTheLastSevenDays,
											salesInTheLastThirtyDays: salesInTheLastThirtyDays,
											dailyOrderCount: dailyOrderCount,
											title: 'Dashboard',
											layout: 'admin'
										});
									});
								});
							});
						});
					});
				});
			});
		});
	});
});

app.get('/admin/product/update/:id', (req, res) => {
	Product.getById(client, req.params.id, function (products) {
		Category.list(client, {}, function (categories) {
			Brand.list(client, {}, function (brands) {
				res.render('update_product', {
					products: products,
					products_category: categories,
					brands: brands,
					layout: 'admin'
				});
			});
		});
	});
});

app.post('/admin/products/:id', function (req, res) {
	console.log(req.body);
	var id = parseInt(req.params.id);
	var productData = {
		id: req.body.id,
		product_name: req.body.product_name,
		product_description: req.body.product_description,
		tagline: req.body.tagline,
		price: req.body.price,
		warranty: req.body.warranty,
		pic: req.body.pic,
		category_id: req.body.category_id,
		brand_id: req.body.brand_id
	};

	Product.update(client, productData, function (error) {
		console.log(error);
		res.redirect('/admin/products/' + id);
	});
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
							subject: 'Fiedad Wheels Order Acknowledgement',
							html: acknowledge
						};

						let mailOptions2 = {
							from: '"Fiedad Wheels" <fiedadwheels@gmail.com>',
							to: 'eisen1021@gmail.com, duannepiedad@gmail.com',
							subject: 'Fiedad Wheels Order Request',
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
									subject: 'Fiedad Wheels Order Acknowledgement',
									html: acknowledge
								};

								let mailOptions2 = {
									from: '"Fiedad Wheels" <fiedadwheels@gmail.com>',
									to: 'eisen1021@gmail.com, duannepiedad@gmail.com',
									subject: 'Fiedad Wheels Order Request',
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
app.get('/categories', (req, res) => { 
	Category.list(client, {}, function (categories) {
		res.render('categories', {
			data: categories
		});
	});
});

app.get('/admin/categories', (req, res) => {
	Category.list(client, {}, function (categories) {
		res.render('categories_admin', {
			data: categories,
			layout: 'admin'
		});
	});
});

app.get('/admin/category/create', (req, res) => {
	res.render('create_categories', {
		layout: 'admin'
	});
});

app.post('/admin/categories', function (req, res) {
	var categoryData = req.body.category_name;
	Category.create(client, categoryData, function (error) {
		if (error === 1) {
			res.render('existing', {
				layout: 'admin',
				name: 'Categories',
				message: 'Category already exists!',
				action: '/admin/categories'
			});
		} else {
			res.redirect('/admin/categories');
		}
	});
});

// PRODUCTS BRAND
app.get('/brands', (req, res) => { // brand list
	Brand.list(client, {}, function (brands) {
		res.render('brands', {
			data: brands
		});
	});
});

app.get('/admin/brands', (req, res) => {
	Brand.list(client, {}, function (brands) {
		res.render('brands_admin', {
			data: brands,
			layout: 'admin'
		});
	});
});

app.get('/admin/brand/create', (req, res) => {
	res.render('create_brands', {
		layout: 'admin'
	});
});

app.post('/admin/brands', function (req, res) {
	var brandData = {
		brand_name: req.body.brand_name,
		brand_description: req.body.brand_description
	};

	Brand.create(client, brandData, function (error) {
		if (error === 1) {
			res.render('existing', {
				layout: 'admin',
				name: 'Brands',
				message: 'Brand already exists!',
				action: '/admin/brands'
			});
		} else {
			res.redirect('/admin/brands');
		}
	});
});


// CUSTOMERS
app.get('/admin/customers/page/:id', (req, res) => { 
	var page = parseInt(req.params.id);
	var totalItems, totalPage, prevPage, nextPage, lastPage;
	var pages = [];
	Customer.getTotal(client, function (total) {
	  totalItems = total[0].count;
	  totalPage = totalItems / 10;
	  for (var i = 1; i < totalPage + 1; i++) {
		pages[i - 1] = i;
		lastPage = i;
	  };
	  if (page === 1) {
		prevPage = 0;
		nextPage = 2;
	  } else if (page > 1 && page < lastPage) {
		prevPage = page - 1;
		nextPage = page + 1;
	  } else {
		prevPage = lastPage - 1;
		nextPage = 0;
	  }
	});
	Customer.list(client, {page}, function (customers) {
	  res.render('customers', {
		data: customers,
		page: page,
		pages: pages,
		prevPage: prevPage,
		nextPage: nextPage,
		layout: 'admin'
	  });
	});
  });

app.get('/admin/customers/:id', (req, res) => {
	Order.customerList(client, req.params.id, function (orderData) {
		res.render('customer_details', {
			data: orderData,
			layout: 'admin',
			first_name: orderData[0].first_name,
			last_name: orderData[0].last_name,
			customer_id: orderData[0].customer_id,
			email: orderData[0].email,
			street: orderData[0].street,
			municipality: orderData[0].municipality,
			province: orderData[0].province,
			zipcode: orderData[0].zipcode,
			product_id: orderData[0].product_id
		});
	});
});

// ORDERS
app.get('/admin/orders/page/:id', (req, res) => { // ---------------------------
	var page = parseInt(req.params.id);
	var totalItems, totalPage, prevPage, nextPage, lastPage;
	var pages = [];
	Order.getTotal(client, function (total) {
	  totalItems = total[0].count;
	  console.log('aw');
	  console.log(totalItems);
	  totalPage = totalItems / 10;
	  for (var i = 1; i < totalPage + 1; i++) {
		pages[i - 1] = i;
		lastPage = i;
	  };
	  if (page === 1) {
		prevPage = 0;
		nextPage = 2;
	  } else if (page > 1 && page < lastPage) {
		prevPage = page - 1;
		nextPage = page + 1;
	  } else {
		prevPage = lastPage - 1;
		nextPage = 0;
	  }
	});
  
	Order.list(client, {page}, function (orders) {
	  res.render('orders', {
		data: orders,
		page: page,
		pages: pages,
		prevPage: prevPage,
		nextPage: nextPage,
		layout: 'admin'
	  });
	});
  });

// MEMBERS
app.get('/Eisen', function (req, res) {
	res.render('member', {
		name: 'Eisen Danielle Fiesta',
		email: 'eisen1021@gmail.com',
		phone: '09173371660',
		imageurl: 'https://scontent.fmnl9-1.fna.fbcdn.net/v/t1.0-9/19437239_1500393716673391_602765196506655918_n.jpg?_nc_cat=0&oh=2852bbfbaae4548d7b5a2761fd026158&oe=5C0AF32C',
		hobbies: ['Instrument Playing', 'Singing', 'Eating']
	});
});

app.get('/Duanne', function (req, res) {
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
