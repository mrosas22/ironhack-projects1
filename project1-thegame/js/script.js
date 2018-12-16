let requestAnimFrame = (function(){
    return window.requestAnimationFrame       ||
        function(callback){
            //attempts to render a 60 frames/second.
            // window.setTimeout(callback, 1000 / 60);
            window.setInterval(callback, 120);
        };
})();
//Global variables
let terrainPattern;
const spriteSize = 190;
var controller, loop, spriteSheet;

//create canvas
let canvas = document.createElement('canvas');
let ctx = canvas.getContext('2d');
canvas.width = 1050;
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
    terrainPattern = ctx.createPattern(resources.get('images/terrain.png'), 'repeat');
    document.getElementById('play-again').addEventListener('click', function() {
        reset();
    });

    reset();
    main();
}
//loading resources
resources.load([
    'images/running.png',
    'images/backgroundext.png',
    'images/terrain.png'
]);
resources.onReady(init);

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
    this.x = x;
    this.y = y;
    this.width = 144;
    this.height = 194;
    this.speedX = 0;
    this.speedY = 0;
    this.jumping = true;
    this.animation = new Animation ();  
}

spriteSheet = {
    frameSets:[[0], [1, 5], [4, 5]],// standing still, walk right, walk left
    image:new Image()
};
// Game state
let player = new Player(15, 15)

controller = {
    left:  { active:false, state:false },
    right: { active:false, state:false },
    up:    { active:false, state:false },
    keyUpDown:function(event) {
      /* Get the physical state of the key being pressed. true = down false = up*/
      var keyState = (event.type == "keydown") ? true : false;
      switch(event.keyCode) {
        case 37:// left key
        // console.log('left')
          if (controller.left.state != keyState) controller.left.active = keyState;
          controller.left.state  = keyState;// Always update the physical state.
        break;
        case 38:// up key
        // console.log('up')
          if (controller.up.state != keyState) controller.up.active = keyState;
          controller.up.state  = keyState;
        break;
        case 39:// right key
        // console.log('right')
          if (controller.right.state != keyState) controller.right.active = keyState;
          controller.right.state  = keyState;
        break;
      }
    }
  };

  //Game Loop
  loop = function(time_stamp) {
    if (controller.up.active && !player.jumping) {
      controller.up.active = false;
      player.jumping = true;
      player.speedY -= 2.5;
    }
    if (controller.left.active) {
      /* To change the animation, all you have to do is call animation.change. */
      player.animation.change(spriteSheet.frameSets[2], 15);
      player.speedX -= 0.05;
    }
    if (controller.right.active) {
      player.animation.change(spriteSheet.frameSets[1], 15);
      player.speedX += 0.05;
    }
    /* If you're just standing still, change the animation to standing still. */
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
    player.animation.update();
    drawEverything();
  };
 

//draw eveything in canvas
function drawEverything(){
    //we render the background by setting the fillStyle of the context
    ctx.fillStyle = terrainPattern;
    //and then render the whole canvas with fillRect
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //draw player
    // player.animation.draw();
    ctx.drawImage(spriteSheet.image, player.animation.frame * spriteSize, 0, spriteSize, spriteSize, Math.floor(player.x), Math.floor(player.y), spriteSize, spriteSize);
    spriteSheet.image.src = "./images/running.png";// Start loading the image.
    
}

//Reset game to original state
function reset(){
    //sets all the game state back to the beginning and hides the game over screen
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('game-over-overlay').style.display = 'none';
    window.addEventListener("keydown", controller.keyUpDown);
    window.addEventListener("keyup", controller.keyUpDown);
 }


 