let requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        function(callback){
            //attempts to render a 60 frames/second.
            // window.setTimeout(callback, 1000 / 60);
            window.setInterval(callback, 120);
        };
  })();
//Global variables
let background, controller, spriteSheet, isGameOver;
const spriteSize = 116;
let enemies = [];
let frames = 0;
let score = 0;
let scoreEl = document.getElementById('score');
  
  //create canvas
  let canvas = document.createElement('canvas');
  let ctx = canvas.getContext('2d');
  canvas.width = 1250;
  canvas.height = 350;
  
  resources.onReady(init);
  document.body.appendChild(canvas);
  
  //Game Loop
  function main (){
    //call the Player class to create the player
    loop ();
    requestAnimFrame(main);
    spriteSheet.image.addEventListener("load", function(event){
  
    });
  }
  //create background pattern and hooks up the "Play Again" button
  function init() {
    background = ctx.createPattern(resources.get('images/backgroundext.png'), 'repeat');
    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });
  
    reset();
    main();
  }
//loading resources
resources.load([
    'images/player1.png',
    'images/backgroundext.png',
    'images/enemy.png'
]);
resources.onReady(init);

//A vector for a 2d space
function Vector(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}
  
//Animation constructor function
function Animation (frameSet, delay) {
        this.count = 0;// Counts the number of game cycles since the last frame change.
        this.delay = delay;// The number of game cycles to wait until the next frame change.
        this.frame = 0;// The value in the sprite sheet of the sprite image / tile to display.
        this.frameIndex = 0;// The frame's index in the current animation frame set.
        this.frameSet = frameSet;// The current animation frame set that holds sprite tile values.
};
  
Animation.prototype = {
    change:function(frameSet, delay = 15) {
      if (this.frameSet != frameSet) {// If the frame set is different:
        this.count = 0;// Reset the count.
        this.delay = delay;// Set the delay.
        this.frameIndex = 0;// Start at the first frame in the new frame set.
        this.frameSet = frameSet;// Set the new frame set.
        this.frame = this.frameSet[this.frameIndex];// Set the new frame value.
    }
},
  
//Call this on each game cycle
 update:function() {
        this.count ++;// Keep track of how many cycles have passed since the last frame change
        if (this.count >= this.delay) {// If enough cycles have passed, we change the frame
            this.count = 0;// Reset the count
            this.frameIndex = (this.frameIndex == this.frameSet.length - 1) ? 0 : this.frameIndex + 1;
            this.frame = this.frameSet[this.frameIndex];// Change the current frame value
    }
},
draw: function(){
    ctx.drawImage(
        spritesheet.image,
        player.animation.frame * spritesheet.spriteSize, 0,
        spritesheet.spriteSize, spritesheet.spriteSize,
        Math.floor(player.x), Math.floor(player.y),
        spritesheet.spriteSize, spritesheet.spriteSize);
    }
};
  
//Create Player
function Player(x,y){
    this.x      = x;
    this.y      = y;
    this.width  = 116;
    this.height = 116;
    this.speedX = 0;
    this.speedY = 0;
    this.jumping = true;
    this.animation = new Animation ();
    Vector.call(this, x, y);
    this.draw = function (){
        this.animation.draw(this.x, this.y)
    };
    this.run = function(){
        this.animation.update(this.x, this.y)
    };
    this.shoot = function(){
        let bulletPosition =  this.weapon ();
        playerBullets.push(Bullet({
          speed: 3,
          x: bulletPosition.x,
          y: bulletPosition.y
        }))
    };
    this.weapon = function(){
        return {
          x: this.x + (this.width - 10),
          y: this.y + (this.height - 80)
        }
    }  
}
Player.prototype = Object.create(Vector.prototype);

spriteSheet = {
    frameSets:[[0], [1, 6], [1, 6]],// standing still, walk right, walk left
    image:new Image()
};
// Game state
let player = new Player(15, 15)

//constructor to create enemies instances
function Enemy (width, height, x, y){
    //set the current active enemy to true
    this.active = true;
    this.width  = width;
    this.height = height;
    this.x      = x;
    this.y      = y;
    this.xVelocity = 1;
    //keep enemies in bounds
    this.inBounds = function(){
        return this.x >= 0 && this.x <= 1250
            && this.y >= 0 && this.y <= 350;
    };
    this.image  = './images/enemy.png';
    this.draw   = function (){
        const enemyImg = new Image();
        enemyImg.src   = this.image;
        ctx.drawImage(enemyImg, this.x, this.y, this.width, this.height)
    },
    this.update = function (){
        //enemy starts at position x which changes negatively
        this.x -= this.xVelocity;
        this.xVelocity = 1; 
        this.active = this.active && this.inBounds();
    };
    this.die = function(){
        this.active = false;
    };
  
};

//empty array to store bullets
let playerBullets = [];
//constructor to create bullet instances
function Bullet (e){
    e.active    = true;
    e.xVelocity = e.speed;
    e.yVelocity = 0;
    e.width     = 3;
    e.height    = 3;
    e.color     = "red";
    //set boundaries for bullets
    e.inBounds = function(){
        return e.x >= 0 && e.x <= 1250
            && e.y >= 0 && e.y <= 350;
    };
    e.draw = function (){
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    e.update = function(){
        e.x += e.xVelocity;
        e.y += e.yVelocity;
        e.active = e.active && e.inBounds();
    }
    return e;
}

//handle input  
controller = {
    left:  { active:false, state:false },
    right: { active:false, state:false },
    up:    { active:false, state:false },
    keyUpDown:function(event) {
      //Get the physical state of the key being pressed. true = down false = up
      let keyState = (event.type == "keydown") ? true : false;
      switch(event.keyCode) {
        case 37:// left key
          if (controller.left.state != keyState) controller.left.active = keyState;
          controller.left.state  = keyState;// Always update the physical state.
        break;
        case 38:// up key
          if (controller.up.state != keyState) controller.up.active = keyState;
          controller.up.state  = keyState;
        break;
        case 39:// right key
          if (controller.right.state != keyState) controller.right.active = keyState;
          controller.right.state  = keyState;
        break;
        case 16://shoot
          player.shoot()
        break;
      }
    }
};
//update player position in canvas
function updatePlayer(){
    if (controller.up.active && !player.jumping) {
        controller.up.active = false;
        player.jumping = true;
        player.speedY -= 10;
    }
    if (controller.left.active) {
        //To change the animation, all you have to do is call animation.change
        player.animation.change(spriteSheet.frameSets[2], 15);
        player.speedX -= 0.05;
    }
    if (controller.right.active) {
        player.animation.change(spriteSheet.frameSets[1], 15);
        player.speedX += 0.05;
    }
    //If you're just standing still, change the animation to standing still
    if (!controller.left.active && !controller.right.active) {
        player.animation.change(spriteSheet.frameSets[0], 20);
    }
        player.speedY += 0.25;
        player.x += player.speedX;
        player.y += player.speedY;
        player.speedX *= 0.9;
        player.speedY *= 0.9;
    if (player.y + player.height > canvas.height - 2) {
        player.jumping = false;
        player.y = canvas.height - 2 - player.height;
        player.speedY = 0;
    }
    if (player.x + player.width < 0) {
        player.x = canvas.width;
    } else if (player.x > canvas.width) {
        player.x = - player.width;
    }
}

//Game Loop
function loop(){
    updatePlayer();
    updateGameArea();
    player.run()
    handleCollisions();
    scoreEl.innerHTML = score;
}  

////Updating the Scene
function updateGameArea (){
    frames +=1;
    if (frames % 360 === 0) {
      x = canvas.width;
      y = Math.random() * (canvas.height - 80)
      enemies.push(new Enemy(116, 80, x, 170))
      if (y > 130 && y <= 240){
      enemies.push(new Enemy(116, 80, x, y));
      }
    }
    drawEverything()
}
//update enemies and bullets
function updateEntities(){
    //add the new position of the bullet to the update step
    playerBullets.forEach(function(bullet){
        bullet.update();
    });
    playerBullets.forEach(function(bullet){
        bullet.draw();
    });
    //filter the list of bullet to only add the active bullets
    playerBullets = playerBullets.filter(function(bullet){
        return bullet.active;
    });
    //add the new enemy to the array of enemies
    enemies.forEach(function(enemy){
        enemy.update();
    });
    // filter the list of enemies
    enemies = enemies.filter(function(enemy){
        return enemy.active;
    })
    enemies.forEach(function(enemy){
            enemy.draw();
    });
}

//draw eveything in canvas
function drawEverything(){
    //we render the background by setting the fillStyle of the context
    ctx.fillStyle = background;
    //and then render the whole canvas with fillRect
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //draw player
    ctx.drawImage(spriteSheet.image, player.animation.frame * spriteSize, 0, spriteSize, spriteSize, Math.floor(player.x), Math.floor(player.y), spriteSize, spriteSize);
    spriteSheet.image.src = "./images/player1.png";// Start loading the image.
    updateEntities();
}

//rectangular collision detection algorithm
function checkCollision (obj1,obj2){
    return obj1.y +  obj1.height - 10  >= obj2.y
        && obj1.y <= obj2.y + obj2.height
        && obj1.x +  obj1.width - 10 >= obj2.x
        && obj1.x <= obj2.x + obj2.width
}
// check for collisions
function handleCollisions(){
    checkPlayerBounds();
    playerBullets.forEach(function(bullet){
        enemies.forEach(function(enemy){
            if (checkCollision(bullet, enemy)){
                enemy.die();
                bullet.active = false;
                // Add score
                score += 1;
            }
            if(score === 10) {
                alert("YOU WIN, CONGRATULATIONS!");
                document.location.reload();
            }
    
        });
    });
    enemies.forEach(function(enemy){
        if (checkCollision(enemy, player)){
            gameOver();
        }
    })
    
}
//Avoid player from exiting the canvas
function checkPlayerBounds() {
    // Check bounds
    if(player.x < 0) {
        player.x = 0;
    }
    else if(player.x > canvas.width - player.width) {
        player.x = canvas.width - player.width;
    }

    if(player.x < 0) {
        player.y = 0;
    }
    else if(player.y > canvas.height - player.height) {
        player.y = canvas.height - player.height;
    }
}
// Game over
function gameOver() {
    document.getElementById('game-over').style.display = 'block';
    document.getElementById('game-over-overlay').style.display = 'block';
    isGameOver = true;
}

//Reset game to original state
function reset(){
    //sets all the game state back to the beginning and hides the game over screen
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    window.addEventListener("keydown", controller.keyUpDown);
    window.addEventListener("keyup", controller.keyUpDown);
    score = 0;
}