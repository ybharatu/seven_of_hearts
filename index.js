var express = require('express');
var app = express();

var server = require('http').createServer(app);
const port = process.env.PORT || 3000

//app.get('/',function(req, res) {
//	res.sendFile(__dirname + '/client/index.html');
//});
//app.use('/client',express.static(__dirname + '/client'));
app.use(express.static(__dirname + '/assets'));
app.set('view engine', 'ejs')

app.get('/',function(req, res) {
	res.render('seven_of_hearts');
	//res.sendFile(__dirname + '/assets/seven_of_hearts.html');
});

app.listen(port, function () {
	console.log('Website app listening on port 3000!')
})

console.log("Server started.");
