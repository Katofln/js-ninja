// Player object constructor.
function Player (x, y, animationDirection) {
  // Position and size.
  this.width = 48;
  this.height = 64;
  this.x = x;
  this.y = y;

  // Velocity.
  this.gravity = 1.5;
  this.xVelocity = 0;
  this.yVelocity = 0;
  this.maxYVelocity = 100;
  this.moveVelocity = 10;
  this.jumpVelocity = -25;

  // Standard attack points for player.
  this.shurikenDamage = 10;
  this.meleeDamage = 10;
  // If player currently attacking or blocking.
  this.attackingOrBlocking = false;

  // Other.
  this.hp = 100;
  this.wins = 0;  // Rounds player have won.

  // Keys held down.
  this.moveLeftKey = false;
  this.moveRightKey = false;
  this.jumpKey = false;
  this.attackAndBlockKey = false;
  this.shurikenKey = false;

  // Double jump.
  this.timesJumped = 0;
  this.maxJumpTimes = 2;
  // While jumping check if jump key have been released while in air, this is for double jump to work properly.
  this.jumpKeyHaveBeenReleasedInAir = false;

  // Animations.
  // Animation states: 0-idle, 1-running, 2-in air, 3-attacking/blocking.
  this.animationState = 0;
  this.currentFrame = 0;
  this.animationDirection = animationDirection; // Left or right.
  this.updateAnimationState = function (state) {
    if (this.animationState != state) {
      this.animationState = state;
      // Start animation at first frame.
      this.currentFrame = 0;
    }
  }
  this.idleAnimationFrames = 4;
  this.runningAnimationFrames = 1;
  this.inAirAnimationFrames = 1;
  this.attackingOrBlockingAnimationFrames = 1;

  // Reset player.
  this.reset = function () {
    this.xVelocity = 0;
    this.yVelocity = 0;

    this.animationState = 0;
    this.currentFrame = 0;

    this.hp = 100;

    this.timesJumped = 0;
    this.jumpKeyHaveBeenReleasedInAir = false;
  }

  // Attack/block.
  this.attackAndBlock = function () {
    console.log("Player attacked/blocked");
  }

  // Take damage.
  this.takeDamage = function (dmg) {
    this.hp -= dmg;
  }

  this.isPlayerDead = function () {
    if (this.hp <= 0) {
      return true;
    } else {
      return false;
    }
  }

  // Variable to not let movement update run more than once per frame. This variable is also used for animation.
  this.lastRenderTick = 0;

  this.update = function () {
    // Allow movement only if render function gets called.
    if (Game.currentRenderTick > this.lastRenderTick) {
      /*
        Increase animation frames.
      */
      // Animation states: 0-idle, 1-running, 2-in air, 3-attacking/blocking.
      switch (this.animationState) {
        case 0:
        if (Game.currentRenderTick % 5 == 0) { // This is to slow down animation.
            if (this.currentFrame < this.idleAnimationFrames - 1) {
              this.currentFrame++;
            } else {
              this.currentFrame = 0;
            }
          }
          break;
        case 1:
          if (this.currentFrame < this.runningAnimationFrames - 1) {
            this.currentFrame++;
          } else {
            this.currentFrame = 0;
          }
          break;
        case 2:
          if (this.currentFrame < this.inAirAnimationFrames - 1) {
            this.currentFrame++;
          } else {
            this.currentFrame = 0;
          }
          break;
        case 3:
          if (this.currentFrame < this.attackingOrBlockingAnimationFrames - 1) {
            this.currentFrame++;
          } else {
            this.currentFrame = 0;
          }
          break;
      }
      /*
        End increase animation frames.
      */

      /*
        Y-axis movement.
      */
      // Apply gravity if player not standing on tile.
      if (!isObjectCollidingWithTilemapDown(this.x, this.y, this.width, this.height)) {
        this.yVelocity += this.gravity;

        // Ensure yVelocity is never larger than maxYVelocity.
        if (this.yVelocity > this.maxYVelocity) {
          this.yVelocity = this.maxYVelocity;
        }
      // If player standing on ground.
      } else if (isObjectCollidingWithTilemapDown(this.x, this.y, this.width, this.height)) {
        this.yVelocity = 0;
        this.timesJumped = 0;
      }

      // Jump key have been realesed in air.
      if (!isObjectCollidingWithTilemapDown(this.x, this.y, this.width, this.height) && !this.jumpKey) {
        this.jumpKeyHaveBeenReleasedInAir = true;
      }

      if (this.jumpKey) {
        // Check if player is able to jump.
        if (isObjectCollidingWithTilemapDown(this.x, this.y, this.width, this.height) || (this.jumpKeyHaveBeenReleasedInAir && this.timesJumped < this.maxJumpTimes)) {
          this.yVelocity = this.jumpVelocity;
          this.timesJumped++;
          this.jumpKeyHaveBeenReleasedInAir = false;
        }
      }

      // Move player by y-axis, but only so that if a tile is in the way, it touches it, and does not go through it.
      // If player moving downwards.
      if (this.yVelocity > 0 && !isObjectCollidingWithTilemapDown(this.x, this.y, this.width, this.height)) {
        // Stores the players new y value.
        var newY = this.y;

        // For loop to move player by one whole pixel each loop, until either velocity have been moved or player touching tile.
        while (newY < (this.y + this.yVelocity)) {
          // Increase newY variable by one each loop to move slowly downards.
          newY++;
          // Break loop if collision from tilemap downwards is detected.
          if (isObjectCollidingWithTilemapDown(this.x, newY, this.width, this.height)) {
            break;
          }
        }

        // Set new y value.
        this.y = newY;

      // If player moving upwards.
      } else if (this.yVelocity < 0 && !isObjectCollidingWithTilemapUp(this.x, this.y, this.width, this.height)) {
        var newY = this.y;

        while (newY > (this.y + this.yVelocity)) {
          newY--;
          if (isObjectCollidingWithTilemapUp(this.x, newY, this.width, this.height)) {
            break;
          }
        }

        this.y = newY;

      // Kill upwards velocity if player is collding with object upwards.
      } else if (this.yVelocity < 0 && isObjectCollidingWithTilemapUp(this.x, this.y, this.width, this.height)) {
        this.yVelocity = 0;
      }
      /*
        End y-axis movement.
      */

      /*
        X-axis movement.
      */
      var newX = this.x;
      // Player presses both or non move keys at the same time.
      if ((this.moveLeftKey && this.moveRightKey) || (!this.moveLeftKey && !this.moveRightKey)) {
        this.xVelocity = 0;
      // Player presses left move key and is not touching tile to the left.
      } else if (this.moveLeftKey && !isObjectCollidingWithTilemapLeft(this.x, this.y, this.width, this.height)) {
        this.animationDirection = "left";
        this.xVelocity = this.moveVelocity;
        while (newX > (this.x - this.xVelocity)) {
          newX--;

          if (isObjectCollidingWithTilemapLeft(newX, this.y, this.width, this.height)) {
            break;
          }
        }
      // Player presses right move key and is not touching tile to the right.
      } else if (this.moveRightKey && !isObjectCollidingWithTilemapRight(this.x, this.y, this.width, this.height)) {
        this.animationDirection = "right";
        this.xVelocity = this.moveVelocity;
        while (newX < (this.x + this.xVelocity)) {
          newX++;

          if (isObjectCollidingWithTilemapRight(newX, this.y, this.width, this.height)) {
            break;
          }
        }
      }

      this.x = newX;
      /*
        End of x-axis movement.
      */

      /*
        Update animation states.
      */
      // Animation states: 0-idle, 1-running, 2-in air, 3-attacking/blocking.
      // Player attacking or blocking.
      if (this.attackingOrBlocking) {
        this.updateAnimationState(3);
      // Player in air.
      } else if (this.yVelocity != 0) {
        this.updateAnimationState(3);
      // Player running.
      } else if (this.xVelocity != 0) {
        this.updateAnimationState(1);
      // Player idle.
      } else {
        this.updateAnimationState(0);
      }
      /*
        End update animation states.
      */

      // Update players last render tick to the games current render tick.
      this.lastRenderTick = Game.currentRenderTick;
    }
  }
}

// Declare the two players.
player1 = new Player(Game.player1StartX, Game.player1StartY, Game.player1StartAnimationDirection);
player2 = new Player(Game.player2StartX, Game.player2StartY, Game.player2StartAnimationDirection);
