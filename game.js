


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
	var otherPlayers = [];
	var playersRendered = [];
	/*
	|  Other players
	*/

	socket.on('otherPlayersData', function(data) {
		console.log('other players pos received');
		console.log(data);
		if (!players[data.playerID]) {
			let a = new component(data.size, data.size, data.color, data.x, data.y);
			playersRendered.push(a);
			console.log(playersRendered);
		} else {
			playersRendered[0].x = data.x;
			playersRendered[0].y = data.y;
		}
		players.push(data);
		console.log('players array:');
		console.log(players);
		playersRendered.push(data);
		console.log('players to render:');
		
		// clear other players?
		// update new players
	});
	
	socket.on('otherPlayerConnected', function(data) {
		console.log('new player connected');
		console.log(data);
	});
	
	
	/*
	|  GAME STUFF
	*/
	
	var playerPos;
	// var everyFive = 0; <- a limiter in case this causes too many update
	var player = {};
	var players = [];

	var canvas = document.querySelector('canvas');
	var ctx = canvas.getContext('2d');

	var keydown;
	var pressed = { left: false, right: false, top: false, bottom: false }

	//var obstacles = [];
	var obstacles = [
			new component(32, 512, 'green', 0, 0),
			new component(512, 32, 'green', 0, 0),
			new component(512, 32, 'green', 0, 448),
			new component(32, 512, 'green', 480, 0),
		];
	var player = {
		size: 16,
		color: getRandomColor(),
		posX: 240,
		posY: 256
	}
	
	
	/*
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
			
			// old collision code
			//for (i=0; i < obstacles.length; i++) {
				//gamePiece.collideWith(obstacles[i]);
			//}
			
			for (i=0; i < obstacles.length; i++) {
				obstacles[i].update();
			}
			
			
			playersRendered[0].update();
			//console.log(otherPlayers.length);
			/*
			for (let a=0; a < playersRendered.length; a++) {
				//console.log(playersRendered[a]);
				
			}*/
			/*
			if ( (gamePiece.y <= obstacle8.y) && (gamePiece.x > gameArea.canvas.width - 100) ) {
				alert('Winner winner, chicken dinner');
				location.reload();
			}*/
		}
	}
	
	// get random color for player color
	function getRandomColor() {
		var letters = '0123456789ABCDEF';
		var color = '#';
		for (var i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
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
			if(Map.isPositionWall(this)) {
				this.x = oldX;
				this.y = oldY;
			}
		}
		
		//Map.isPositionWall(this);
		/*
		this.isPositionWall = function(pt) {
			var gridX = Math.floor(pt.x / TILE_SIZE);
			var gridY = Math.floor(pt.y / TILE_SIZE);
			if (gridX < 0 || gridX >= self.grid[0].length)
				return true;
			if (gridX < 0 || gridX >= self.grid[0].length)
				return true;
			return self.grid[griY][gridX];
		} */
		
		/*
		this.hitBottom = function () {
			var rockbottom = gameArea.canvas.height - this.height;
			if (this.y > rockbottom)
				{ this.y = rockbottom + 1; bottomCheck = true;
			} else if (this.y < (rockbottom + 1)) {
				bottomCheck = false;
			}
		}
		
		this.collideWith = function(obstruction) {
			var myLeft = this.x; var myTop = this.y;
			var myRight = this.x + this.width;
			var myBot = this.y + this.height;
			var theirLeft = obstruction.x; var theirTop = obstruction.y;
			var theirRight = obstruction.x + obstruction.width;
			var theirBot = obstruction.y + obstruction.height;
			var collide = true;
			if ((myBot <= theirTop) || (myTop >= theirBot) || (myRight <= theirLeft) || (myLeft >= theirRight)) {
				collide = false;
			}
			// ground collision
			var objGround = obstruction.y - this.height;
			if ((myBot >= theirTop) && (myRight > theirLeft) && (myLeft < theirRight) && (myTop < theirBot) && (this.gravitySpeed > 0) ) {
				this.y = objGround - 0; bottomCheck = true;
			} else if (this.y < (objGround + 1)) {
				bottomCheck = false; 
			} else if ((myTop <= theirBot) || (myBot > theirTop)) {
				this.y = this.y;
			}
			return collide;
		} */
	}

	

	function startGame() {
		gameArea.start();
		
		gamePiece = new component(player.size, player.size, player.color, player.posX, player.posY);
		obstacle = new component(gameArea.canvas.width, 50, 'rgba(0,0,255,0.6)', 0, (gameArea.canvas.height - 50));
		
		/*
		obstacle2 = new component(16, 16, 'green', 200, obstacle.y - 20);
		obstacle3 = new component(50, 20, 'green', 100, obstacle.y - 50);
		obstacle4 = new component(50, 20, 'green', 300, obstacle.y - 80);
		obstacle5 = new component(50, 20, 'green', 350, obstacle.y - 150);
		obstacle6 = new component(50, 20, 'green', 155, obstacle.y - 200);
		obstacle7 = new component(50, 20, 'green', 50, obstacle.y - 230);
		obstacle8 = new component(gameArea.canvas.width - 100, 20, 'blue', 100, obstacle.y - 300);
		*/
	}


	var triggered;


	var keyDownHandler = function(e) {	
		//console.log(gamePiece.x);
		
		if (e.keyCode == 65)      { pressed.right = true; }
		else if (e.keyCode == 68) { pressed.left  = true; }
		else if (e.keyCode == 87) { pressed.up    = true; }
		else if (e.keyCode == 83) { pressed.down  = true; }
	}

	var keyUpHandler = function(e) {
		player.x = gamePiece.x;
		player.y = gamePiece.y;
		socket.emit('positionData', player);
		//console.log('----------------');
		//console.log('X: ' + gamePiece.x);
		//console.log('Y: ' + gamePiece.y);
		triggered=false;
		if (e.keyCode == 65) 	  { pressed.right = false; }
		else if (e.keyCode == 68) { pressed.left  = false; }
		else if (e.keyCode == 87) { pressed.up    = false; }
		else if (e.keyCode == 83) { pressed.down  = false; }
		if (e.keyCode == 32)      { pressed.jump  = false; }
	}

	document.addEventListener('keydown', keyDownHandler, false);
	document.addEventListener('keyup', keyUpHandler, false);

	function update() {
				
		
		if ((pressed.left) && (!triggered)) {
			moveLengthX = 16;
			triggered=true;
			gamePiece.newPos();
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.right) && (!triggered)) {
			moveLengthX = -16;
			gamePiece.newPos();
			triggered=true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.up) && (!triggered)) {
			moveLengthY = -16;
			gamePiece.newPos();
			triggered=true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		if ((pressed.down) && (!triggered)) {
			moveLengthY = 8;
			gamePiece.newPos();
			triggered=true;
			
		} else {moveLengthX = 0;moveLengthY = 0;}
		
		//if (bottomCheck) { gamePiece.gravity = 0; jumpMax = gamePiece.y - 50;  }
		
		/*
		document.addEventListener('keydown', function(e) {
			if (e.keyCode == '65') {
				gamePiece.speedX = -player.speed;
			} else if (e.keyCode == '68') {
				gamePiece.speedX = player.speed;
			} else if (e.keyCode == '87') {
				gamePiece.speedY = -player.speed;
			} else if ((e.keyCode == '83') && (!gamePiece.collideWith(obstacle))) {
				gamePiece.speedY = player.speed;
			}
			
		});	
			
		document.addEventListener('keyup', function () {
			gamePiece.speedX = 0;
			gamePiece.speedY = 0;
		})*/
		
		gameArea.clear();
		gameArea.screen1();
		
	}

	startGame();
}