var express = require('express');
var mysql = require('mysql');
var sha1 = require('node-sha1');
var config = require('./config.js');
var router = express.Router();

var connection = mysql.createConnection({
	host: config.SQL_Server,
	user: config.SQL_User,
	password: config.SQL_Password,
	database: config.SQL_Database
});

connection.connect(function(err) {
	if (err) {
		console.error('Error connecting to Database: ' + err.stack);
		return;
	}
	
	console.log('Connected to database as id ' + connection.threadId);
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/login', function(req, res, next) {
	/*connection.query('SELECT 1 + 1 AS solution', function(err, rows, fields) {
		if (err) throw err;
		console.log('The solution is: ', rows[0].solution);
	});*/
	var salt = null;
	res.set('Access-Control-Allow-Origin', '*');
	//res.sendStatus(403);
	//res.send('Successful POST received');
	
	if (req.body.hasOwnProperty("User")) {
		console.log("Username received...");
		if(!req.body.hasOwnProperty("Password")) {
			console.error("No password received");
			res.status(400).send('Missing password value');
			return;
		}
		
		console.log("Received username: " + req.body.User);
		console.log("Received password: " + req.body.Password);
		
		/*connection.query('SELECT `created` FROM `users` WHERE `username` = \'' + req.body.User + '\'', function (err, rows, fields) {
			if (err) {
				console.error('Error! ' + err.stack);
				return;
			}
			if (rows.length == 0) {
				res.status(403).send('Unable to authenticate user, please check username and password and try again.');
				return;
			} else {
				console.log('Created: ' + rows[0].created);
				return rows[0].created.toString();
				
			}
		});
		console.log(salt);*/
		connection.query('SELECT `uid` FROM `users` WHERE `username` = ? AND BINARY `password` = BINARY SHA1(CONCAT(?,`created`))', [req.body.User, sha1(req.body.Password)], function (err, rows, fields) {
			if (err) { 
				console.error('Error! ' + err.stack);
				return;
			}
			if (rows.length == 0) {
				res.status(403).send('Unable to authenticate user, please check username and password and try again.');
				return;
			} else {
				res.send({ "uid": rows[0].uid });
			}
		});
	} else {
		console.error("No username received");
		res.status(400).send('Missing username value.');
	}
});

//connection.end();

module.exports = router;
