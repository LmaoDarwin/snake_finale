// --- ALL MATERIALS INIT ---
const nameInput = document.getElementById('name');
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
const fps = 4;
cvs.width = 960;
cvs.height = 640;
let run;
let rewind;
rewindbtn.disabled = true;
// --- ALL MATERIALS INIT ---

// --- CLASS START ---
class Game {
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
    context.fillStyle = 'rgba(245, 222, 179,0.8)';
    context.fillRect(this.width / 2 - 400 / 2, this.height / 2 - 200 / 2, 400, 200);
    //text section
    context.fillStyle = 'rgb(19 37 49)';
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
    context.fillStyle = 'rgb(19 37 49)';
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
    context.fillStyle = 'wheat';
    context.fillRect(0, 0, this.width, this.height - 600);
    //logo
    // context.fillStyle = 'rgb(69 165 210)';
    context.fillStyle = 'rgb(19 37 49)';
    context.font = 'bold 30px arial';
    context.fillText(`PHYTONS`, this.width / 2 - (30 * 7) / 2, (this.height - 600) / 2 + 10);

    //score
    context.fillStyle = 'rgb(19 37 49)';
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
  /** @param {CanvasRenderingContext2D} context */
  draw(context) {
    this.apple.spawnApple(context);
    this.snake.draw(context);
    this.grid(context);
    this.score(context);
    this.printTime(context);
    this.gameover(context);
  }
  update() {
    // console.log(this.player);
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
      if (this.directionQueue.length >= 3 || screenArea.checkVisibility() || this.game.scene === 'rewind')
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
      context.fillStyle = 'darkslateblue'; //color of the snake
      if (i === 0) context.fillStyle = 'slateblue';
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
      if (this.count > 5) this.count = 0;//fix if any error happen to the count
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
      this.count = 3
      this.createApple();
    } //pellet below 3 auto add
    this.appleCount.forEach((apple) => {
      context.fillStyle = 'yellow';
      context.fillRect(apple.x, apple.y, this.size, this.size);
    });
  }
}
class Rewind {
  /** @param {Game}game */
  constructor(game) {
    this.game = game;
    this.rewindDir = [];
    this.rewindCor = [];
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
      context.fillStyle = 'darkslateblue';
      if (i === 0) context.fillStyle = 'slateblue';
      context.fillRect(x, y, this.game.blockSize, this.game.blockSize);
    });
    this.game.snake.currTails =
      this.rewindCor[this.index].length >= 6 ? this.rewindCor[this.index].length : 6;
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
// window.onload = () => {
// for development plesase comment later
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
  if (nameInput.value != '') {
    play.disabled = false;
    game.player = nameInput.value;
  } else play.disabled = true;
});
// onRewind
function onRewind() {
  if (game.scene === 'over') return;
  if (!rewindRange.checkVisibility()) {
    rewindRange.style.display = 'initial';
    // cancelbtn.style.display = 'initial';
    game.scene = 'rewind';
    rewind = setInterval(() => game.rewind.draw(ctx), 1000 / fps);
    return;
  } //first click to show
  //second to do the rewind
  game.snake.controller();
  rewindRange.style.display = 'none';
  clearInterval(rewind);
  game.scene = 'game';
  game.apple.count = 0;
  //disable rewind
  rewindbtn.disabled = true;
  setTimeout(() => (rewindbtn.disabled = false), 5000);
}
rewindbtn.addEventListener('click', onRewind);
window.addEventListener('keydown', ({ key }) => {
  if (rewindbtn.disabled) return;
  if (key === ' ') onRewind();
});
rewindRange.addEventListener('input', ({ target }) => {
  game.rewind.index = target.value;
});
