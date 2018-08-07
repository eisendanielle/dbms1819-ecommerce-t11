const express = require('express');
const path = require('path');
const exphbs = require('express-handlebars');

const app = express();

app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname + '/public')));

app.get('/', function(req, res) {
	res.render('home');
});










app.get('/team/11/Eisen', function(req, res){
	res.render('member', {
		name: 'Eisen Danielle Fiesta',
		email: 'eisen1021@gmail.com',
		phone: '09173371660',
		imageurl: 'https://scontent.fmnl9-1.fna.fbcdn.net/v/t1.0-9/19437239_1500393716673391_602765196506655918_n.jpg?_nc_cat=0&oh=2852bbfbaae4548d7b5a2761fd026158&oe=5C0AF32C',
		hobbies: ['Instrument Playing', 'Singing', 'Eating' ]
	});
});

app.get('/team/11/Duanne', function(req, res){
	res.render('member', {
		name: 'Duanne Malvin Piedad',
		email: 'duannepiedad@gmail.com',
		phone: '09173096381',
		imageurl:'https://scontent.fmnl4-6.fna.fbcdn.net/v/t1.0-9/18765857_1876761379008006_8721594579226360278_n.jpg?_nc_cat=0&oh=1a5518d108aca039ca037ae378628760&oe=5BCEB7BB',
		hobbies: ['Cooking', 'Eating', 'Dancing']
	});
});

app.listen(process.env.PORT || 3000, function() {
	console.log('Server started at port 3000');
});

