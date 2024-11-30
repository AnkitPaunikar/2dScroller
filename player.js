import { Collision } from "./collision.js";
import {
  Diving,
  Hit,
  Jumping,
  Landing,
  Rolling,
  Running,
  Sitting,
} from "./playerState.js";

export class Player {
  constructor(game) {
    this.game = game;
    this.width = 100; // Desired width of the player on the canvas
    this.height = 91.3; // Desired height of the player on the canvas
    this.x = 0; // Initial x position
    this.y = this.game.height - this.height - this.game.groundMargin; // Position at the bottom of the canvas
    this.vy = 0;

    this.image = document.getElementById("player");
    this.frameX = 0;
    this.frameY = 0;
    this.maxframe = 0;
    this.fps = 20;
    this.frameInterval = 1000 / this.fps;
    this.frameTimer = 0;
    this.weight = 1;
    this.speed = 0;
    this.maxspeed = 4;
    this.state = [
      new Sitting(this.game),
      new Running(this.game),
      new Jumping(this.game),
      new Landing(this.game),
      new Rolling(this.game),
      new Diving(this.game),
      new Hit(this.game),
    ];
    this.currentState = null;
  }

  update(input, deltaTime) {
    this.checkCollision();
    this.currentState.handleInput(input);
    //horizontal movement
    this.x += this.speed;
    if (input.includes("ArrowRight") && this.currentState !== this.state[6])
      this.speed = this.maxspeed;
    else if (input.includes("ArrowLeft") && this.currentState !== this.state[6])
      this.speed = -this.maxspeed;
    else this.speed = 0;
    if (this.x < 0) this.x = 0;
    if (this.x > this.game.width - this.width)
      this.x = this.game.width - this.width;
    // vertical movement
    this.y += this.vy;
    if (!this.onGround()) this.vy += this.weight;
    else this.vy = 0;
    // vertical boundaries
    if (this.y > this.game.height - this.height - this.game.groundMargin)
      this.y = this.game.height - this.height - this.game.groundMargin;
    //sprite animation
    if (this.frameTimer > this.frameInterval) {
      this.frameTimer = 0;
      if (this.frameX < this.maxframe) this.frameX++;
      else this.frameX = 0;
    } else {
      this.frameTimer += deltaTime;
    }
  }

  draw(context) {
    if (this.game.debug)
      context.strokeRect(this.x, this.y, this.width, this.height);
    // Draw the image, scaling it to the desired dimensions
    context.drawImage(
      this.image, // The image element
      this.frameX * this.width, // Source x (top-left corner of the image)
      this.frameY * this.height, // Source y (top-left corner of the image)
      this.width, // Source width (original image width)
      this.height, // Source height (original image height)
      this.x, // Destination x (where to draw on the canvas)
      this.y, // Destination y (where to draw on the canvas)
      this.width, // Destination width (scaled width)
      this.height // Destination height (scaled height)
    );
  }

  onGround() {
    return this.y >= this.game.height - this.height - this.game.groundMargin;
  }

  setState(state, speed) {
    this.currentState = this.state[state];
    this.game.speed = this.game.maxSpeed * speed;
    this.currentState.enter();
  }

  checkCollision() {
    this.game.enemies.forEach((enemy) => {
      if (
        enemy.x < this.x + this.width &&
        enemy.x + enemy.width > this.x &&
        enemy.y < this.y + this.height &&
        enemy.y + enemy.height > this.y
      ) {
        // colision
        enemy.markedForDeletion = true;
        this.game.collisions.push(
          new Collision(
            this.game,
            enemy.x + enemy.width * 0.5,
            enemy.y + enemy.height * 0.5
          )
        );
        if (
          this.currentState === this.state[4] ||
          this.currentState === this.state[5]
        ) {
          this.game.score++;
        } else {
          this.setState(6, 0);
          this.game.lives--;
          if (this.game.lives <= 0) this.game.gameOver = true;
        }
      }
    });
  }
}
