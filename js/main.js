// --- ALL MATERIALS INIT ---
const label = document.getElementById('label');
label.textContent = 'Input Your Name';
const nameInput = document.getElementById('name');
/** @type {HTMLInputElement} */
const rewindRange = document.getElementById('rewindRange');
const screenArea = document.querySelector('.screen');
const playbtn = document.getElementById('play');
/** @type {HTMLElement | HTMLButtonElement} */
const rewindbtn = document.getElementById('rewind');
const cancelbtn = document.getElementById('cancel');
const gameArea = document.getElementById('game');
/** @type {HTMLElement | HTMLInputElement} */
const play = document.getElementById('play');
/** @type {HTMLCanvasElement} */
const cvs = document.getElementById('canvas');
/** @type {CanvasRenderingContext2D} */
const ctx = cvs.getContext('2d');
const head = new Image();
head.src = '/design/source/head.png';
head.height = 20;
head.width = 20;
const pellet = new Image();
pellet.src = '/design/source/money.png';
pellet.height = 20;
pellet.width = 20;
const logo = new Image();
logo.src = '/design/source/logo.png';
logo.width = 165;
logo.height = 40;
const fps = 4;
cvs.width = 960;
cvs.height = 640;
let run;
let rewind;
rewindbtn.disabled = true;
// --- ALL MATERIALS INIT ---

// --- CLASS START ---
class Game {
  fontColor = '#d9d9d9';
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.scene = '';
    this.player = null;
    this.blockSize = 20;
    this.highscore = localStorage.getItem('highscore') || 0;
    this.offset = height - 600;
    this.gridWidth = this.width / this.blockSize;
    this.gridHeight = this.height / this.blockSize - 40 / this.blockSize;
    this.second = 0;
    this.minute = 0;
    setInterval(() => this.calculateTime(), 1000);
    this.snake = new Snake(this);
    this.apple = new Apple(this);
    this.rewind = new Rewind(this);
  }
  /**
   * @param {CanvasRenderingContext2D} context
   * game over
   */
  gameover(context) {
    if (this.scene !== 'over') return;
    context.canvas.addEventListener('click', () => window.location.reload());
    context.fillStyle = 'rgba(56, 56, 98, 0.8)';
    context.fillRect(this.width / 2 - 400 / 2, this.height / 2 - 200 / 2, 400, 200);
    //text section
    context.fillStyle = this.fontColor;
    //scores
    context.font = 'bold italic 30px arial';
    context.fillText(`Final Score : ${this.snake.currTails}`, this.width / 3, this.height / 2 - 30);
    context.font = '20px arial';
    context.fillText(`Highscore : ${this.highscore}`, this.width / 3, this.height / 2);
    context.font = 'bold 30px arial';
    context.fillText(`Tap anywhere to restart`, this.width / 3, this.height / 2 + 50, 300);
    localStorage.setItem('highscore', Math.max(this.snake.currTails, this.highscore));
  }
  calculateTime() {
    if (this.scene !== 'game') return;
    this.second++;
    if (this.second === 60) {
      this.second = 0;
      this.minute++;
    }
  }
  /**
   * @param {CanvasRenderingContext2D} context
   * Print time to the board
   * */
  printTime(context) {
    // context.fillStyle = 'rgb(19 37 49)';
    context.fillStyle = this.fontColor;
    context.font = '20px arial';
    context.fillText(
      `${this.minute}:${this.second >= 10 ? this.second : '0' + this.second}`,
      this.width - 50,
      30
    );
  }
  /**
   * @param {CanvasRenderingContext2D} context
   * Print score to the board
   * */
  score(context) {
    context.fillStyle = '#383862';
    context.fillRect(0, 0, this.width, this.height - 600);
    //logo
    context.drawImage(logo, this.width / 2 - logo.width / 2, 3, logo.width - 5, logo.height - 5);
    //score
    // context.fillStyle = 'rgb(19 37 49)';
    context.fillStyle = this.fontColor;
    context.font = 'bold italic 30px arial';
    context.fillText(`SCORE : ${this.snake.currTails}`, 5, (this.height - 600) / 2 + 10);
    context.font = '15px arial';
    context.fillText(`HIGHSCORE : ${this.highscore}`, this.width - 190, (this.height - 600) / 2 + 10);
  }
  /** @param {CanvasRenderingContext2D} context */
  grid(context) {
    context.strokeStyle = 'rgba(245 ,222 ,179 ,0.15)';
    // vertical
    for (let i = 1; i < this.gridWidth; i++) {
      context.beginPath();
      context.moveTo(i * this.blockSize, 40);
      context.lineTo(i * this.blockSize, this.height);
      context.stroke();
    }
    // Horizontal
    for (let i = 1; i < this.gridHeight; i++) {
      context.beginPath();
      context.moveTo(0, i * this.blockSize + 40);
      context.lineTo(this.width, i * this.blockSize + 40);
      context.stroke();
    }
  }
  /**
   * draw image with rotation
   * @param {HTMLImageElement} img
   * @param {Number} x
   * @param {Number} y
   * @param {Number} width
   * @param {Number} height
   * @param {Number} deg
   */
  drawImageRot(img, x, y, width, height, deg) {
    // Store the current context state (i.e. rotation, translation etc..)
    ctx.save();
    //Convert degrees to radian
    let rad = (deg * Math.PI) / 180;
    //Set the origin to the center of the image
    ctx.translate(x + width / 2, y + height / 2);
    //Rotate the canvas around the origin
    ctx.rotate(rad);
    //draw the image
    ctx.drawImage(img, (width / 2) * -1, (height / 2) * -1, width, height);
    // Restore canvas state as saved from above
    ctx.restore();
  }
  /** @param {CanvasRenderingContext2D} context */
  draw(context) {
    this.apple.spawnApple(context);
    this.snake.draw(context);
    // this.grid(context);
    this.score(context);
    this.printTime(context);
    this.gameover(context);
  }
  update() {
    this.snake.update();
    this.apple.onEaten();
  }
}

class Snake {
  /** @param {Game} game */
  constructor(game) {
    this.game = game;
    this.size = game.blockSize;
    this.tailsCoordinate = [];
    this.directionQueue = [];
    this.currTails = 6;
    this.direction = 'right';
    this.x = (game.gridWidth * this.size) / 2;
    this.y = (game.gridHeight * this.size) / 2;
    document.addEventListener('keydown', ({ key }) => {
      // if queue is 3 stop push to array
      // if screen area input player name is visible disable to prevent move before played
      // if onRewind disable inpyt
      if (this.directionQueue.length >= 2 || screenArea.checkVisibility() || this.game.scene === 'rewind')
        return;
      switch (key) {
        case 'ArrowUp':
        case 'w':
          if (this.direction !== 'down') this.directionQueue.push('up');
          break;
        case 'ArrowDown':
        case 's':
          if (this.direction !== 'up') this.directionQueue.push('down');
          break;
        case 'ArrowLeft':
        case 'a':
          if (this.direction !== 'right') this.directionQueue.push('left');
          break;
        case 'ArrowRight':
        case 'd':
          if (this.direction !== 'left') this.directionQueue.push('right');
          break;
      }
    });
  }
  /**
   * get the direction of the head to calculate angle
   * @param {string} dir
   */
  getHeadDirection(dir) {
    if (dir === 'right') return 180; //right
    if (dir === 'left') return 0; //Left
    if (dir === 'down') return 270; //down
    if (dir === 'up') return 90; //up
  }
  //snake come frome opposite dircetion if out of bound
  onOutOfBound() {
    if (this.x < 0) this.x = this.game.width - this.size; //left
    if (this.x >= this.game.width) this.x = 0; //right
    if (this.y < 40) this.y = this.game.height - this.size; //above
    if (this.y >= this.game.height) this.y = 40; //below
  }
  //controller check to move according to the direction
  controller() {
    //to prevent quick turn collision
    if (this.directionQueue.length > 0) this.direction = this.directionQueue.shift();
    if (this.direction === 'up') this.y -= this.size;
    if (this.direction === 'down') this.y += this.size;
    if (this.direction === 'right') this.x += this.size;
    if (this.direction === 'left') this.x -= this.size;
  }
  //making tails according to current tails amount
  /** @param {CanvasRenderingContext2D} context */
  createTails(context) {
    this.tailsCoordinate.unshift({ x: this.x, y: this.y });
    this.tailsCoordinate.splice(this.currTails);
    this.tailsCoordinate.forEach(({ x, y }, i) => {
      context.fillStyle = '#D9D9D9'; //color of the snake
      if (i === 0) return this.game.drawImageRot(head,x,y,this.size,this.size,this.getHeadDirection(this.direction)); //draw head
      if (i % 2 !== 0) context.fillStyle = '#1B1B1B';
      context.fillRect(x, y, this.size, this.size);
      // onCollision to tails
      if (i !== 0) if (this.x == x && this.y == y) clearInterval(run), (this.game.scene = 'over');
    });
  }
  /**
   * to do context canvas drawing
   * @param {CanvasRenderingContext2D} context */
  draw(context) {
    //not on game stop moving
    if (this.game.scene === 'game') {
      this.createTails(context);
      this.controller();
    }
  }
  //update current status on this class to be updated with main
  update() {
    this.onOutOfBound();
  }
}
class Apple {
  /** @param {Game} game */
  constructor(game) {
    this.game = game;
    this.size = game.blockSize;
    this.appleCount = [];
    this.count = 1;
    //init apple using constructor manually
    for (let i = 0; i < 3; i++) {
      this.x = ~~(Math.random() * game.gridWidth) * this.size;
      this.y = ~~(Math.random() * game.gridHeight) * this.size;
      this.y += 40; //offset top;
      this.appleCount.push({ x: this.x, y: this.y });
    }
    this.x = 0;
    this.y = 0;
    setInterval(() => {
      if (this.game.scene !== 'game') return;
      if (this.count > 5) this.count = 0; //fix if any error happen to the count
      this.createApple(), this.popApple(), this.count++;
    }, 1000);
  }
  /** on eat snake gain tail and remove the pellet */
  onEaten() {
    if (this.game.scene !== 'game') return;
    this.appleCount.forEach((apple, i) => {
      if (this.game.snake.x === apple.x && this.game.snake.y === apple.y) {
        this.appleCount.splice(i, 1);
        this.game.snake.currTails++;
      }
    });
  }
  /** remove first apple index */
  popApple() {
    if (this.game.scene !== 'game') return;
    if (this.appleCount.length === 5 && this.count >= 5) this.appleCount.shift(), (this.count = 0);
  }
  /** Creating the appple */
  createApple() {
    if (this.game.scene !== 'game') return;
    if (this.appleCount.length === 5) return;
    this.x = ~~(Math.random() * this.game.gridWidth) * this.size;
    this.y = ~~(Math.random() * this.game.gridHeight) * this.size;
    this.y += 40; //offset top
    this.appleCount.forEach(({ x, y }) => {
      if (x === this.x && y === this.y) this.createApple();
    }); //cant spawn pellet if occupied
    this.game.snake.tailsCoordinate.forEach(({ x, y }) => {
      if (x === this.x && y === this.y) this.createApple();
    }); //cant spawn on snake body
    //spawn on count 3 (3 seconds)
    if (this.count === 3) {
      this.appleCount.push({ x: this.x, y: this.y });
      this.count = 0;
    }
  }
  /**
   *  @param {CanvasRenderingContext2D} context
   *  spawning apple to the game area
   */
  spawnApple(context) {
    if (this.appleCount.length < 3) {
      this.count = 3;
      this.createApple();
    } //pellet below 3 auto add
    this.appleCount.forEach((apple) =>
      context.drawImage(pellet, apple.x, apple.y, pellet.width, pellet.height)
    );
  }
}
class Rewind {
  /** @param {Game}game */
  constructor(game) {
    this.game = game;
    this.rewindDir = [];
    this.rewindCor = [];
    this.size = game.snake.size
    this.index = 4;
    setInterval(() => {
      if (this.rewindCor.length > 5) this.rewindCor.shift(), this.rewindDir.shift();
      if (this.game.scene === 'game')
        this.rewindCor.push([...this.game.snake.tailsCoordinate]),
          this.rewindDir.push(this.game.snake.direction);
    }, 1000);
  }
  /**
   *  @param {CanvasRenderingContext2D}context
   *  @param {number}index
   */
  draw(context) {
    if (this.game.scene !== 'rewind') return; // not onRewind dont draw current snake
    this.game.snake.direction = this.rewindDir[this.index]; //to prevent wrong direction onRewind
    this.rewindCor[this.index].forEach(({ x, y }, i) => {
      if (i === 0) return this.game.drawImageRot(head,x,y,this.size,this.size,this.game.snake.getHeadDirection(this.game.snake.direction)); //draw head
      context.fillStyle = '#D9D9D9'; //color of the snake
      if (i % 2 !== 0) context.fillStyle = '#1B1B1B';
      context.fillRect(x, y, this.game.blockSize, this.game.blockSize);
    });
    this.game.snake.currTails =
      this.rewindCor[this.index].length >= 6 ? this.rewindCor[this.index].length : 6; //prefix early rewind error
    this.game.snake.tailsCoordinate = this.rewindCor[this.index];
    this.game.snake.x = this.rewindCor[this.index][0].x;
    this.game.snake.y = this.rewindCor[this.index][0].y;
  }
}
// --- CLASS END ---

const game = new Game(cvs.width, cvs.height);

// --- ANIMATION / FRAME LOOP ---
function animate() {
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  game.draw(ctx);
  game.update();
}

// --- EVENT HANDLER ---
//onPlay
playbtn.addEventListener('click', () => {
  //precautions empty array onRewind
  setTimeout(() => (rewindbtn.disabled = false), 5000);
  game.scene = 'game';
  animate();
  run = setInterval(animate, 1000 / fps);
  screenArea.remove();
  gameArea.style.display = 'flex';
});
//onInput
nameInput.addEventListener('input', () => {
  //if input not empty
  if (nameInput.value != '') {
    label.textContent = 'Greetings, ' + nameInput.value;
    play.disabled = false;
    game.player = nameInput.value;
  } else {
    play.disabled = true;
    label.textContent = 'Input Your Name';
  }
});
// onRewind
function onRewind() {
  if (game.scene === 'over') return;
  if (!rewindRange.checkVisibility()) {
    rewindRange.style.display = 'initial';
    cancelbtn.style.display = 'initial';
    game.scene = 'rewind';
    rewind = setInterval(() => game.rewind.draw(ctx), 1000 / fps);
    return;
  } //first click to show
  //second to do the rewind
  game.snake.controller();
  //style back to none
  rewindRange.style.display = 'none';
  cancelbtn.style.display = 'none';
  //reset interval drawing rewind
  clearInterval(rewind);
  //reset apple count, scene to game and rewind index
  game.scene = 'game';
  game.apple.count = 0;
  game.rewind.index = 4;
  rewindRange.value = 4;
  //disable rewind
  rewindbtn.disabled = true;
  //delay to prevent buggy fast rewind
  setTimeout(() => (rewindbtn.disabled = false), 1000);
}
//rewind button
rewindbtn.addEventListener('click', onRewind);
//cancel button
cancelbtn.addEventListener('click', () => {
  //why 4? it is last index of rewindCore which the current latest position
  game.snake.direction = game.rewind.rewindDir[4]; //to prevent wrong direction onRewind
  //change position of snake
  game.snake.tailsCoordinate = game.rewind.rewindCor[4];
  game.snake.x = game.rewind.rewindCor[4][0].x;
  game.snake.y = game.rewind.rewindCor[4][0].y;
  onRewind();
});
//space click even
window.addEventListener('keydown', ({ key }) => {
  if (rewindbtn.disabled) return;
  if (key === ' ') onRewind();
});
//range input
rewindRange.addEventListener('input', ({ target }) => {
  game.rewind.index = target.value;
});
