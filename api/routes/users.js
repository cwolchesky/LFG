var express = require('express');
var mysql = require('mysql');
var sha1 = require('node-sha1');
var config = require('./config.js');
var router = express.Router();

// Establish connection to MySQL or report error if failed.
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

// Default code being left for reference, not used.
/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


/*
	Endpoint: /users/login
	Method: POST
	Expected parameters:
		User: Username of user attempting to be authenticated.
		Password: SHA1 encrypted password of user to be authenticated.
	Possible Returns:
		HTTP Status Code:
			200: Authentication successful.  UID of user will be returned in JSON format.
			400: User is missing required parameters
			403: Authentication failed: Incorrect username or password.
*/
router.post('/login', function(req, res, next) {

	// Enable all origins for testing only.  Must be removed during production.  TODO: Flag this to only run when env is in debug
	res.set('Access-Control-Allow-Origin', '*');
	
	if (req.body.hasOwnProperty("User")) {
		console.log("Username received...");
		if(!req.body.hasOwnProperty("Password")) {
			console.error("No password received");
			res.status(400).send('Missing password value');
			return;
		}
		
		console.log("Received username: " + req.body.User);
		// Debug only.  TODO: Flag this to only run when env is in debug
		console.log("Received password: " + req.body.Password);

		// For testing, do sha1 encryption on cleartext password being received.  Backend already expects SHA1, but incoming from front end still
		// needs to be encrypted using SHA1.
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

module.exports = router;
