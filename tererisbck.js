// https://tetris.fandom.com/wiki/Tetris_Guideline

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
  
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  // generate a new tetromino sequence
  // @see https://tetris.fandom.com/wiki/Random_Generator
  function generateSequence() {
//    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    const sequence = [ 'O'];
  
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  let score=0;
  // get the next tetromino in the sequence
  function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
      generateSequence();
    }
  
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
  
    // I and O start centered, all others start in left-middle
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
  
    // I starts on row 21 (-1), all others start on row 22 (-2)
    const row = name === 'I' ? -1 : -2;
  
    return {
      name: name,      // name of the piece (L, O, etc.)
      matrix: matrix,  // the current rotation matrix
      row: row,        // current row (starts offscreen)
      col: col         // current col
    };
  }
  
  // rotate an NxN matrix 90deg
  // @see https://codereview.stackexchange.com/a/186834
  function rotate(matrix) {
    const N = matrix.length - 1;
    const result = matrix.map((row, i) =>
      row.map((val, j) => matrix[N - j][i])
    );
  
    return result;
  }

  // check to see if the new matrix/row/col is valid
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] && (
            // outside the game bounds
            cellCol + col < 0 ||
            cellCol + col >= playfield[0].length ||
            cellRow + row >= playfield.length ||
            // collides with another piece
            playfield[cellRow + row][cellCol + col])
          ) {
          return false;
        }
      }
    }
  
    return true;
  }
  //let rcnt=1,pos=-250;
  const expPos=[] ;
  expPos[19]= 300;
  expPos[17]= 250;
  expPos[15]= 200;
  expPos[13]= 120;
  expPos[11]= 50;
  expPos[9]= -10;
  expPos[7]= -80;
  expPos[5]= -150;
  expPos[3]= -200;
  expPos[1]= -250;
  // place the tetromino on the playfield
  async function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          //console.log("placed ",tetromino.row + row )
          //if(tetromino.row + row==rcnt)
          //crexplode(row);
          // game over if piece has any part offscreen
          if (tetromino.row + row < 0) {
            return showGameOver();
          }
          
          playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
        }
      }
    }
  
    // check for line clears starting from the bottom and working our way up
    for (let row = playfield.length - 1; row >= 0; ) {
      if (playfield[row].every(cell => !!cell)) {
        let cnt=0;
        // drop every row above this one
        for (let r = row; r >= 0; r--) {
          for (let c = 0; c < playfield[r].length; c++) {
            //console.log("clear",row)
            playfield[r][c] = playfield[r-1][c];
  
            cnt++;
            if(cnt<2){
             await crexplode(row);
            }
           // crexplode();
          }
        }
        score++;
        upadteScore();

      }
      else {
        row--;
      }
    }
  
    tetromino = getNextTetromino();
  }
  
  // show the game over screen
  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
  
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
  
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('GAME OVER!', canvas.width / 2, canvas.height / 2);
  }
  
  const canvas = document.getElementById('game1');
  const context = canvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  

  // keep track of what is in every cell of the game using a 2d array
  // tetris playfield is 10x20, with a few rows offscreen
  const playfield = [];
  
  // populate the empty state
  for (let row = -2; row < 20; row++) {
    playfield[row] = [];
  
    for (let col = 0; col < 10; col++) {
      playfield[row][col] = 0;
    }
  }
  
  // how to draw each tetromino
  // @see https://tetris.fandom.com/wiki/SRS
  const tetrominos = {
    'I': [
      [0,0,0,0],
      [1,1,1,1],
      [0,0,0,0],
      [0,0,0,0]
    ],
    'J': [
      [1,0,0],
      [1,1,1],
      [0,0,0],
    ],
    'L': [
      [0,0,1],
      [1,1,1],
      [0,0,0],
    ],
    'O': [
      [1,1],
      [1,1],
    ],
    'S': [
      [0,1,1],
      [1,1,0],
      [0,0,0],
    ],
    'Z': [
      [1,1,0],
      [0,1,1],
      [0,0,0],
    ],
    'T': [
      [0,1,0],
      [1,1,1],
      [0,0,0],
    ]
  };
  
  // color of each tetromino
  const colors = {
    'I': 'cyan',
    'O': 'yellow',
    'T': 'purple',
    'S': 'green',
    'Z': 'red',
    'J': 'blue',
    'L': 'orange'
  };
  
  let count = 0;
  let tetromino = getNextTetromino();
  let rAF = null;  // keep track of the animation frame so we can cancel it
  let gameOver = false;
  
  // game loop
  function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0,0,canvas.width,canvas.height);
  
    // draw the playfield
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (playfield[row][col]) {
          const name = playfield[row][col];
          //console.log("name-->",name);
          //context.fillStyle = colors[name];
          context.fillStyle ="#8a898d";  
          // image.src = 'https://images.unsplash.com/photo-1732647169576-49abfdef3348?q=80&w=1979&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
          // const pat = context.createPattern(image, "repeat");
          // context.rect(0, 0, 150, 100);
          // context.fillStyle = pat;
          // drawing 1 px smaller than the grid creates a grid effect
          context.fillRect(col * grid, row * grid, grid-1, grid-1);
        }
      }
    }
  
    // draw the active tetromino
    if (tetromino) {
  
      // tetromino falls every 35 frames
      if (++count > 35) {
        tetromino.row++;
        count = 0;
  
        // place piece if it runs into anything
        if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
          tetromino.row--;
          placeTetromino();
        }
      }
  
      //context.fillStyle = colors[tetromino.name];
      //context.fillStyle = context.createLinearGradient(0, 0, 0, 170);
      var image = new Image();
//      image.addEventListener('load', start);
 //     image.addEventListener('error', errorfn);

// 8a898d 949497 9f9ea2 aaa9ad b5b4b8 c0bfc3 cbcace
context.fillStyle ="#8a898d";  
//makeStars(x, y);

// image.src = 'https://images.unsplash.com/photo-1732647169576-49abfdef3348?q=80&w=1979&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      // const pat = context.createPattern(image, "repeat");
      // context.rect(0, 0, 150, 100);
      // context.fillStyle = pat;
      context.shadowOffsetX = 10;
      context.shadowOffsetY = 10;
      context.shadowBlur = 10;
      context.shadowColor = "black";
      for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
          if (tetromino.matrix[row][col]) {
  
            // drawing 1 px smaller than the grid creates a grid effect
            context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid-1, grid-1);
          }
        }
      }
    }
  }
  const editContext = new EditContext();
canvas.editContext = editContext;
editContext.addEventListener("textupdate", (e) => {
  render();
});
  function upadteScore() {
    
    ctx.clearRect(0, 0, canvas1.width, canvas1.height) ;
    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.75;
    ctx.fillRect(0, canvas1.height / 2 - 30, canvas1.width, 60);
  
    ctx.globalAlpha = 1;
    ctx.fillStyle = 'white';
    ctx.font = '36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Score='+score, canvas1.width / 2, canvas1.height / 2);
    //score--;

  }
    const canvas1 = document.getElementById("game2");

      const ctx = canvas1.getContext("2d");
      upadteScore();
  
      // ctx.fillRect(25, 25, 100, 100);
      // ctx.clearRect(45, 45, 60, 60);
      // ctx.strokeRect(50, 50, 50, 50);
    
//   /* Get the height and width of the window */
//  canvas.height = window.innerHeight;
//  canvas.width = window.innerWidth;


// /* Fills or sets the color,gradient,pattern */

// /* Writes the required text */
// context.fillText("GFG", 500, 350)

  let particles = [];

  /* Initialize particle object */
  class Particle {
      constructor(x, y, radius, dx, dy) {
          this.x = x;
          this.y = y;
          this.radius = radius;
          this.dx = dx;
          this.dy = dy;
          this.alpha = 1;
      }
      draw() {
        context.save();
        context.globalAlpha = this.alpha;
        context.fillStyle = '#8a898d';
  
          /* Begins or reset the path for 
          the arc created */
          context.beginPath();
  
          /* Some curve is created*/
          context.arc(this.x, this.y, this.radius,
              0, Math.PI * 2, false);
  
              context.fill();
  
          /* Restore the recent canvas context*/
          context.restore();
      }
      update() {
          this.draw();
          this.alpha -= 0.01;
          this.x += this.dx;
          this.y += this.dy;
      }
  }
//  const audioObj = new Audio("https://cdn.pixabay.com/audio/2024/01/20/audio_bb461c7ea3.mp3");
//  audioObj.play();

  function crexplode(row) {
//    particles = [];
console.log("row-->",particles.length);    
  
  //  console.log("row-->",row);    
  //  console.log(expPos[row]);
    setTimeout(() => {
      for (let i = 0; i <= 300; i++) {
          let dx = (Math.random() - 0.5) * (Math.random() * 6);
          let dy = (Math.random() - 0.5) * (Math.random() * 6);
          let radius = Math.random() * 3;
//          let particle = new Particle((canvas.height/2)-(i) ,canvas.width+(wcnt-(trow-row)*(40)), radius, dx, dy);
let particle = new Particle((canvas.height/2)-(i) ,canvas.width+(expPos[row]), radius, dx, dy);
  
          /* Adds new items like particle*/
          particles.push(particle);
      }
      explode();
  }, );

  }
  crexplode();
  /* Timer is set for particle push 
      execution in intervals*/
  // setTimeout(() => {
  //     for (let i = 0; i <= 150; i++) {
  //         let dx = (Math.random() - 0.5) * (Math.random() * 6);
  //         let dy = (Math.random() - 0.5) * (Math.random() * 6);
  //         let radius = Math.random() * 3;
  //         let particle = new Particle((canvas.height/2)-100 ,canvas.width+canvas.width, radius, dx, dy);
  
  //         /* Adds new items like particle*/
  //         particles.push(particle);
  //     }
  //     explode();
  // }, 1000);
  
  /* Particle explosion function */
  function explode() {
    //console.log("count-->",particles);
      /* Clears the given pixels in the rectangle */
      //context.clearRect(0, 0, canvas.width, canvas.height);
      //context.fillStyle = "white";
      //context.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((particle, i) => {
          if (particle.alpha <= 0) {
              particles.splice(i, 1);
          } else particle.update()
      })

      /* Performs a animation after request*/
      requestAnimationFrame(explode);
  }


  // listen to keyboard events to move the active tetromino
  document.addEventListener('keydown', function(e) {
    if (gameOver) return;
  
    // left and right arrow keys (move)
    if (e.which === 37 || e.which === 39) {
      const col = e.which === 37
        ? tetromino.col - 1
        : tetromino.col + 1;
  
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }
  
    // up arrow key (rotate)
    if (e.which === 38) {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }
  
    // down arrow key (drop)
    if(e.which === 40) {
      const row = tetromino.row + 1;
  
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
  
        placeTetromino();
        return;
      }
  
      tetromino.row = row;
    }
  });

  

    rAF = requestAnimationFrame(loop);
