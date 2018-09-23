var mainState = {
    preload: function() { 
        // This function will be executed at the beginning     
        // That's where we load the images and sounds

		game.load.image('ninja', 'assets/ninja.png');
		game.load.image('block', 'assets/block.png');
		game.load.image('invis', 'assets/invis.png');
		game.load.audio('jump', 'assets/jump.wav');
		game.load.image('button', 'assets/play.png');
		game.load.image('ground', 'assets/ground.png');
		game.load.spritesheet('red', 'assets/red.png');
		game.load.spritesheet('green', 'assets/green.png');
		game.load.spritesheet('blue', 'assets/blue.png');
    },

    create: function() { 
        // This function is called after the preload function     
        // Here we set up the game, display sprites, etc. 

		game.stage.backgroundColor = '#71c5cf';
		
		game.physics.startSystem(Phaser.Physics.Arcarde);
		
		this.ground = game.add.sprite(0, 480, "ground");
		
		// Display the ninja at the position x=100 and y=245
		this.ninja = game.add.sprite(100, 450, 'ninja');

		this.gameTime = 0;

		this.scoreTime = 0;
		
		this.jumpcount = 0;

		this.canChange = true;

		this.currentColor = "block";
		this.ninjaColor = "";
		
		// Add physics to the ninja
		// Needed for: movements, gravity, collisions, etc.
		game.physics.arcade.enable(this.ninja);
		game.physics.arcade.enable(this.ground);

		game.input.onDown.add(this.jump, this);

        this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
        this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
        this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);

		// Create an empty group
		this.blocks = game.add.group();
		this.door = game.add.group();
		
		this.labelScore = game.add.text(20, 20, this.score, {font: "30px Arial", fill: "#ffffff"});
		
		// Move the anchor to the left and downward
		this.ninja.anchor.setTo(-0.2, 0.5)
		
		this.jumpSound = game.add.audio('jump');
		
		this.ground.body.immovable = true;
		
		this.button = game.add.button(game.world.centerX - 20, game.world.centerY - 20, 'button', this.startGame, this);
	
		this.started = false;
		
		this.ninja.visible = false;
		
		this.ninja.alive = false;
    },

    update: function() {
        // This function is called 60 times per second    
        // It contains the game's logic 
		
		if(this.started) {
			game.physics.arcade.overlap(this.ninja, this.blocks, this.hitblock, null, this);
			game.physics.arcade.collide(this.ninja, this.ground, this.onground, null, this);
			game.physics.arcade.overlap(this.door, this.ninja, this.inside, null, this);
			
			if(this.ninja.angle < 0)
				this.ninja.angle +=1;
	
			if (this.ninja.alive == false)
				this.restartGame();
			
			if(this.ninja.y < 0)
				this.ninja.y = 0;

			if(this.ninja.body.gravity.y == 0 && this.gameTime <= game.time.now) {
			    this.ninja.body.gravity.y = 600;
			}

			if(this.aKey.isDown && this.canChange) {
			    this.ninja.loadTexture('red');
			    this.ninjaColor = "red";
			    this.freeze();

			}
            if(this.sKey.isDown && this.canChange) {
                this.ninja.loadTexture('green');
                this.ninjaColor = "green";
                this.freeze();
            }
            if(this.dKey.isDown && this.canChange) {
                this.ninja.loadTexture('blue');
                this.ninjaColor = "blue";
                this.freeze();
            }
		}
	
    },

    freeze: function () {
        this.canChange = false;
        this.ninja.body.velocity.y = 0;
        this.ninja.body.gravity.y = 0;
        this.gameTime = game.time.now + 500;
    },
	
	jump: function() {
			
		if (this.ninja.alive == false || this.jumpcount > 2)
			return;  
		
		this.ninja.body.velocity.y = -400;
		
		// Create an animation on the ninja
		var animation = game.add.tween(this.ninja);
		
		// Change the angle of the ninja to -20� in 100 milliseconds
		animation.to({angle: -20}, 100);
		animation.start();
		
		this.jumpcount++;
		this.jumpSound.play();
	},
	
	addOneblock: function(x, y) {
		// Create a block at the position x and y
		var block = game.add.sprite(x, y, this.currentColor);

		// Add the block to our previously created group
		this.blocks.add(block);

		// Enable physics on the block 
		game.physics.arcade.enable(block);

		// Add velocity to the block to make it move left
		block.body.velocity.x = -200; 

		// Automatically kill the block when it's no longer visible 
		block.checkWorldBounds = true;
		block.outOfBoundsKill = true;
	},

    addDoor: function(x, y) {
        // Create a block at the position x and y
        var hole = game.add.sprite(x, y, 'invis');

        // Add the block to our previously created group
        this.door.add(hole);

        // Enable physics on the block
        game.physics.arcade.enable(hole);

        // Add velocity to the block to make it move left
        hole.body.velocity.x = -200;

        // Automatically kill the block when it's no longer visible
        hole.checkWorldBounds = true;
        hole.outOfBoundsKill = true;
    },
	
	addRowOfblocks: function() {
		// Randomly pick a number between 1 and 5
		// This will be the hole position
		var hole = Math.floor(Math.random() * 5) + 1;

        switch(Math.floor(Math.random() * 4) + 1) {
            case 1:
                this.currentColor = 'red';
                break;
            case 2:
                this.currentColor = 'green';
                break;
            case 3:
                this.currentColor = 'blue';
                break;
            default:
                this.currentColor = 'block';
        }

		// Add the 6 blocks 
		// With one big hole at position 'hole' and 'hole + 1'
		for (var i = 0; i < 8; i++) {
			if (i != hole && i != hole + 1) 
				this.addOneblock(400, i * 60 + 10);
		    else {
		        this.addDoor(400, i * 60 + 10);
		    }
        }
	},
	
	hitblock: function() {
		if(this.ninja.alive == false)
			return;
		
		// Set the alive property of the ninja to false
		this.ninja.alive = false;
		
		// Prevent new blocks from appearing
		game.time.events.remove(this.timer);
		
		// Go through all the blocks, and stop their movement
		this.blocks.forEach(function(p) {
			p.body.velocity.x = 0;
		}, this);
		
	},

    inside: function() {
        if(this.ninja.alive == false)
            return;

        if(this.ninjaColor != this.currentColor && this.currentColor != 'block') {
            // Set the alive property of the ninja to false
            this.ninja.alive = false;

            // Prevent new blocks from appearing
            game.time.events.remove(this.timer);

            // Go through all the blocks, and stop their movement
            this.blocks.forEach(function(p) {
                p.body.velocity.x = 0;
            }, this);

            return;
        }

        if(this.scoreTime <= game.time.now) {
            this.scoreTime = game.time.now + 1000;
            this.score += 1;
            this.labelScore.text = this.score;
		}
    },
	
	onground: function() {
			
		if (this.ninja.alive == false)
			return;  
		
		this.ninja.body.velocity.y = 0;
		
        this.ninja.angle = 0;
		
		this.jumpcount = 0;

		this.canChange = true;
	},
	
	startGame: function () {
		this.ninja.body.gravity.y = 600;
		
		// Go through all the blocks, and stop their movement
		this.blocks.forEach(function(p) {
			p.body.velocity.x = -200;
		}, this);
		
				
		this.timer = game.time.events.loop(2500, this.addRowOfblocks, this);
		
		this.started = true;
		
		this.ninja.visible = true;
		
		this.button.visible = false;
		
		this.ninja.alive = true;
		
		this.score = 0;
		this.labelScore.text = 0;
	},
	
	restartGame: function() {
		game.state.start('main');
	}
};

// Initialize Phaser, and create a 400px by 490px game
var game = new Phaser.Game(400, 490);

// Add the 'mainState' and call it 'main'
game.state.add('main', mainState); 

// Start the state to actually start the game
game.state.start('main');