var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// database dependencies
var mysql = require('mysql');
var http = require('http');

// includes the node_modules folder
app.use(express.static(__dirname + '/node_modules'));


var player = [];
var players = [];
var currentPlayer;

// create database connection variable
var con = mysql.createConnection({
	host:'localhost',
	port:'3306',
	user: 'root',
	database: 'mydb',
	password: ''
});

// connect to database
con.connect(function(err) {
	if (err) throw err;
	console.log('Connected to SQL Database.');
});


/*
|  CLIENT-SERVER ROUTING
*/

app.get('/login', function(req, res, next) {
	res.sendFile(__dirname + '/login.html');
	console.log('routed client to login');
});
app.get(['/','/registration'], function(req, res, next) {
	res.sendFile(__dirname + '/registration.html');
	console.log('routed client to registration');
});
app.get('/game', function(req,res,next) {
	res.sendFile(__dirname + '/game.html');
	console.log('routed client to game');
});
app.get('/game.js', function(req,res,next) {
	res.sendFile(__dirname + '/game.js');
});

// route css file
app.get('/main.css', function(req,res,next) {
	res.sendFile(__dirname + '/main.css');
});

/*
|  REQUEST HANDLING
*/

io.on('connection', function(client) {
	
	client.on('join', function(data) {
		console.log(data);
		client.emit('messages', 'Hello from server')
		// get the clickCount column for the logged in user
		// save it to a variable
	});
	
	client.on('login-details', function(data) {
		// check if user exists and if the passwords match
		// if not, emit a message to show on login screen denying access
		// if they do match, add the details to the database
		// create new player object or array, with these details saved
		// move user onto the button page:
		// res.sendFile(__dirname + '/button');
		var sqlGet = "SELECT * FROM players WHERE username LIKE '"+data.username+"'";
		con.query(sqlGet, (function(err, result) {
			if(err) throw err;
			console.log(result);
			if (result.length > 0) {
				console.log('Existing user: Usr ' + result[0].username + ', P ' + result[0].password);
				console.log('Match found, bueno.');
				
				if ((data.username == result[0].username) && (data.password == result[0].password)) {
					console.log('logged in!');
					
					console.log(result[0].id);
					var l = (result[0]);
					console.log(l);
					player.push(l);
					//console.log(player.indexOf(6));
					console.log(player);
					currentPlayer = result[0];
					console.log('Current player: ');
					console.log(currentPlayer.id);
					client.emit('login');
					
					
				} else {
					console.log('authentication failed');
				}
				
			} else {
				console.log('No username match');
			}
			
		}));
	});
	var playersConnected = [];
	client.on('init', function(data) {
		client.emit('loggedin', currentPlayer);
		oldData = data;
		console.log('init player data:');
		console.log(data);
		
		if (data.playerID) {
			players[data.playerID] = data;
			playersConnected[data.playerID] = (data);
			console.log('players connected:');
			console.log(playersConnected);
			var playersTruncated = playersConnected.filter(function(v){return v!==''});
			client.broadcast.emit('otherPlayerConnected', playersTruncated);
		}
		
		
		
		//players.push(data);
		//console.log(players);
		//players.push()
		//console.log(currentPlayer);
		
		
		
	});
	
	client.on('newPlayerConnected', function() {
		client.broadcast.emit('otherPlayerConnected', playersConnected);
	});
	
	client.on('registration-details', function(data) {
		console.log('New user data:');
		console.log(data);
		// check if user exists
		// if they do, emit a message to client about this
		// if not, add details to database
		var x;
		var q = "SELECT * FROM players WHERE username LIKE '"+data.username+"'";
		con.query(q, (function(err, result) {
			if(err) throw err;
			x=result;
			if (result.length > 0) {
				console.log(data.username + ', ' + data.password);
				console.log('Match found, no data was added.');
			} else {
				
				let sql = "INSERT INTO players (username, password, created, clicks) VALUES ('"+data.username+"', '"+data.password+"', '"+data.date+"', '"+data.clicks+"')";
				
				
				con.query(sql, data, function(err, result) {
					if(err) throw err;
					console.log(result);
				});
				
				client.emit('messages', 'Data inserted');
			}
			
			x = result;
		}));
		
	});
	var oldData;
	var newData;
	var trig = false;
	// When the client sends clickCount data
	client.on('positionData', function(data) {
		console.log('----------------');
		console.log('X: ' + data.x);
		console.log('Y: ' + data.y);
		
		// save data to newData (just came in)
		newData = data; //console.log(newData);
		
		/*if (newData.playerID != oldData.playerID) {
			players.push(newData);
			console.log(players[players.indexOf(newData.playerID)]);
		} else*/
		if (players.indexOf(newData.playerID)) {
			delete players[newData.playerID];
			//players.push(newData);
			players[newData.playerID] = newData;
			//console.log(players);
			console.log('xzzy : ' + players[newData.playerID].playerID);
			console.log(players);
			client.broadcast.emit('newPlayerConnected', players);
			//console.log(players.indexOf(newData.playerID));
			//
		}
		
		// assign newdata to olddata at end of function for next signal
		oldData = newData;
		//console.log('players: ');
		//console.log(players);
		client.broadcast.emit('otherPlayersData', newData);
		
		/*
		
		let sql = "UPDATE players SET clicks = " + data.clickCount + " WHERE id = " + data.playerID;
		con.query(sql, data, function(err, result) {
			if(err) throw err;
			console.log(result);
		});
		*/
		
		// clickCount++;
		// save to database every 5-10 clicks?
		
		
		// possible solution for multiple users:
		// player var is an array
		// var player[ref] gets its reference from the player id
		// so player with id 24
		// gets player[24] from player[data.playerID]
		// when client sends data it also sends playerID minus 1
		
		// what the client sends:
		// { newClickCount : x, playerID : y }
		
		// when a new player logs in, do: player[data.playerID] = data;
		
		// when user clicks:
		// then SQL finds a match to the data.playerID & updates that row
		
	});
	
	// client.leave = function {
		// save the clickCount variable to database
		// remove the player who left
	// }
});

server.listen(8081);