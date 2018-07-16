window.onload = function() {

	/* 
	|  SOCKETS STUFF
	*/

	var socket = io.connect('http://127.0.0.1:8081');

	// Logs any messages from server
	socket.on('messages', function(data) {
		console.log(data);
	});

	// Sends a request to the server for player data once client is connected
	socket.on('connect', function() {
		socket.emit('init', player);
	});

	// receiving the player data and putting it in an object
	socket.on('loggedin', function(data) {
		console.log('Player ID: ' + data.id);
		//player.x =  128; //Math.floor(math.random());
		//player.y = 128;
		player.playerID = data.id;
		player.x = gamePiece.x;
		player.y = gamePiece.y;
		socket.emit('positionData', player);
		socket.emit('newPlayerConnected', player);
	});
	
	
	/*
	|  Recieving data from server
	*/
	
	socket.on('otherPlayersData', function(data) {
		
		// find the index (if exists) of the ID of the recieved data from local players array
		var existingPlayerIndex = players.map(function(e) { return e.playerID }).indexOf(data.playerID);
		
		// if the ID of the recieved data doesn't match one from players array
		if (existingPlayerIndex < 0) {
			// create a new component
			let a = new component(data.size, data.size, data.color, data.x, data.y);
			// push the new player to players and add to rendering array
			playersRendered.push(a);
			players.push(data);
		} else {
			// update existing player's location
			players[existingPlayerIndex].x = data.x;
			players[existingPlayerIndex].y = data.y;
			// update player's location on rendering array
			playersRendered[existingPlayerIndex].x = data.x;
			playersRendered[existingPlayerIndex].y = data.y;
		}
	});
	
	// when a new player connects
	socket.on('otherPlayerConnected', function(data) {
		console.log('new player connected');
	});
	
	
	/*
	|  GAME STUFF
	*/
	
	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');
	
	var playerPos;
	
	// client player information
	var player = {};
	// all the player objects recieved from server
	var players = [];
	// essentially a copy of players, but with components instead of plain objects
	var playersRendered = [];
	
	var keydown;
	var pressed = { left: false, right: false, top: false, bottom: false }
	
	// obstacles to be rendered on page
	var obstacles = [
		new component(32, 512, 'green', 0, 0),
		new component(512, 32, 'green', 0, 0),
		new component(512, 32, 'green', 0, 448),
		new component(32, 512, 'green', 480, 0),
	];
	
	// initialise player - this info goes to gamepiece component
	var player = {
		size: 16,
		color: getRandomColor(),
		x: getRandomInt(2, 30) * 16,
		y: getRandomInt(2, 28) * 16
	}
	
	// game event triggers
	var triggers = {
		keypress: false,
		example : false // find if pos is 32
	};
	
	// get random color for player color
	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	}
	
	// get random location for player
	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
	}
	
	/*
	
	Blueprint for getting collision to work
	
	var Map = {
		
		
		// this is pseudo bs, get all this working proper
		
		TILE_SIZE : 16;
		
		tileGridX : 512 / TILE_SIZE,
		tileGridY : 480 / TILE_SIZE,
		
		player.x.grid : player.x / TILE_SIZE,
		player.x.grid : player.y / TILE_SIZE,
		
		isPositionWall : function(entity) {
			
			// create the grid
			
			
			// get four boundaries of player
			entity.top = entity.y;
			entity.right = entity.x + entity.size;
			entity.bot = entity.y + entity.size;
			entity.left = entity.x
		}
		
		map : [
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
		[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
		],
	}
	*/
	
	//  ---------
	//	RENDERING
	//  ---------
	
	var gameArea = {
		canvas: canvas,
		
		start: function() {
			this.canvas.width = 512,
			this.canvas.height = 480,
			this.ctx = this.canvas.getContext('2d');
			this.frameNo = 0;
			this.interval = setInterval(update, 10);
		},
		
		clear: function() {
			this.ctx.clearRect(0,0, this.canvas.width, this.canvas.height);
		},
		
		screen1: function() {
			gamePiece.newPos();
			gamePiece.update();
			
			// render each component from obstacles[]
			for (i=0; i < obstacles.length; i++) {
				obstacles[i].update();
			}
			// render each component from playersRendered[]
			for (i = 0; i < playersRendered.length; i++) {
				playersRendered[i].update();
			}
			
			/*
			|	Game events
			*/
			
			// check if player has moved to a certain square
			if ((gamePiece.x == 32) && (triggers.example == false)) {
				triggers.example = true;
				console.log('x = 0 - it worked');
			}
		}
	}
	
	function component(width, height, color, x, y) {
		this.width = width;
		this.height = height;
		this.x = x;
		this.y = y;
		this.update = function() {
			gameArea.ctx.fillStyle = color;
			gameArea.ctx.fillRect(this.x, this.y, this.width, this.height);
		}
		
		// updates position of player, called when a keypress is received
		this.newPos = function() {
			var oldX = this.x;
			var oldY = this.y;
			this.x += moveLengthX;
			this.y += moveLengthY;
		}
	}
	
	// create the objects which are local-only on the screen
	function startGame() {
		gameArea.start();
		
		gamePiece = new component(player.size, player.size, player.color, player.x, player.y);
		obstacle = new component(gameArea.canvas.width, 50, 'rgba(0,0,255,0.6)', 0, (gameArea.canvas.height - 50));
	}
	
	/*
	|	Keypress Handling
	*/

	// when a key is pressed
	var keyDownHandler = function(e) {
		if (e.keyCode == 65)      { pressed.right = true; }
		else if (e.keyCode == 68) { pressed.left  = true; }
		else if (e.keyCode == 87) { pressed.up    = true; }
		else if (e.keyCode == 83) { pressed.down  = true; }
	}

	var keyUpHandler = function(e) {
		// update player object to be sent
		player.x = gamePiece.x;
		player.y = gamePiece.y;
		
		// send the player object
		socket.emit('positionData', player);
		
		triggers.keypress = false;
		if (e.keyCode == 65) 	  { pressed.right = false; }
		else if (e.keyCode == 68) { pressed.left  = false; }
		else if (e.keyCode == 87) { pressed.up    = false; }
		else if (e.keyCode == 83) { pressed.down  = false; }
		if (e.keyCode == 32)      { pressed.jump  = false; }
	}

	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	// runs every frame
	function update() {
		
		// check if keys are being pressed
		if ((pressed.left) && (!triggers.keypress)) {
			moveLengthX = 16;
			gamePiece.newPos();
			triggers.keypress = true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.right) && (!triggers.keypress)) {
			moveLengthX = -16;
			gamePiece.newPos();
			triggers.keypress = true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.up) && (!triggers.keypress)) {
			moveLengthY = -16;
			gamePiece.newPos();
			triggers.keypress = true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.down) && (!triggers.keypress)) {
			moveLengthY = 8;
			gamePiece.newPos();
			triggers.keypress = true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		
		// clear then re-render the game area
		gameArea.clear();
		gameArea.screen1();
	}

	startGame();
}