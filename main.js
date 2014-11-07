var Square = function (data){
  data = data || {}
  this.x = data.x || 0; 
  this.y = data.y || 0;
  this.w = data.w || 0;
  this.h = data.h || 0;
  this.color = data.color || '';
  this.speed = data.speed || 0;
}

var main = function() {
  var canvas = document.getElementById('myCanvas');
  var size = canvas.width;
  var ctx = canvas.getContext('2d');
  var totalBlocks = 12;
  var squareSize = size / totalBlocks;
  var keys = {};
  var speed = 50;
  var gameOnProgress = false;
  var totalEnemySquares = 30;
  var $startBtn = $('#start');
  var $title = $('#title');
  var mesages = ['Get to red square', 'You won'];
  var enemySquares = [];
  var typeBlock = [
    {color: 'black', speed: 100},
    {color: 'green', speed: 150},
    {color: 'blue', speed: 50}
  ];

  var createSquare = function(data) {
    return function(params) {
      params.w = data.w;
      params.h = data.h;
      return new Square(params);
    }
  };

  createSquare = createSquare({
    w: squareSize,
    h: squareSize
  });

  //finish block on the bottom right corner
  var finishSquare = createSquare({
    x: (totalBlocks-1) * squareSize,
    y: (totalBlocks-1) * squareSize,
    color: 'red'
  });
  
  var playerSquare = createSquare({
    x: 0,
    y: 0,
    color: 'yellow'
  })

  function collision(elem1, elem2) {
    if ( elem1.x == elem2.x && elem1.y == elem2.y ) {
      return true;
    }
    return false;
  }

  function createEnemySquares() {
    var size = totalBlocks*totalBlocks
    var blocks = Array(size);
    var val = 0;
    var rnd1;
    var rnd2;
    for (var i = 1; i < size -1; i++) {
      val = 0;
      if (i <= totalEnemySquares) {
        val = 1;
      }
      blocks[i] = val;
    };

    for (var i = 1; i < 400; i++) {
      rnd = Math.floor(Math.random() * (size-2)+1);
      rnd2 = Math.floor(Math.random() * (size-2)+1);
      val = blocks[rnd];
      blocks[rnd] = blocks[rnd2];
      blocks[rnd2] = val;
    }
    enemySquares = [];
    blocks[1] = blocks[totalBlocks] = blocks[totalBlocks+1] = 1
    for (var i = 1; i < size -1; i++) {
      var y = parseInt(i / totalBlocks) * squareSize;
      var x = (i % totalBlocks) * squareSize;
      if (blocks[i]) {
        enemySquares.push(createSquare({
          x: x,
          y: y,
          color: 'blue'
        }));
      }
    };
  }

  function drawBackground() {
    ctx.clearRect(0, 0, size, size);
    for (var i = 0; i < enemySquares.length; i++) {
      drawRect(enemySquares[i]);
    };
    drawRect(finishSquare);
  }

  function changeDirection(obj) {
    if (!collision(playerSquare, obj)){
      return;
    }
    for (var i = 0; i < 6; i++) {
      var rnd = Math.floor(Math.random() * 4);
      var rnd2 = Math.floor(Math.random() * 4);
      var temp = keys[37 + rnd];
      keys[37 + rnd] = keys[37 + rnd2];
      keys[37 + rnd2] = temp;
    };
  }

  function movePlayer(newPos) {
    function evaluatePos(pos) {
      var maxLimit = size - squareSize;
      if (pos > maxLimit){
        return maxLimit;
      }
      if (pos < 0) {
        return 0;
      }
      return pos;
    };

    drawBackground();
    playerSquare.x += newPos.x;
    playerSquare.y += newPos.y;
    playerSquare.x = evaluatePos(playerSquare.x);
    playerSquare.y = evaluatePos(playerSquare.y);

    if (collision(playerSquare, finishSquare)) {
      gameOnProgress = false;
      $title.text(mesages[1]);
      return;
    }

    for (var i = 0; i < enemySquares.length; i++) {
      changeDirection(enemySquares[i]);
    };
    drawRect(playerSquare);
  }

  function drawRect(rect) {
    ctx.beginPath();
    ctx.rect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = rect.color;
    ctx.fill();
    ctx.closePath();
  }

  var start = function() {
    $startBtn.text('Restart');
    $title.text(mesages[0]);
    createEnemySquares();
    speed = 50;
    keys = {
      37: {x: -1, y: 0},//left
      38: {x: 0, y: -1},//up
      39: {x: 1, y: 0},//right
      40: {x: 0, y: 1},//down
    };
    gameOnProgress = true;
    drawBackground();
    playerSquare.x = 0;
    playerSquare.y = 0;
    drawRect(playerSquare);
  }

  window.onkeydown = function (e) {
    if (!gameOnProgress) return;
    var code = e.keyCode ? e.keyCode : e.which;
    if (code in keys) {
      var newPos = {
        x: keys[code].x * speed,
        y: keys[code].y * speed
      };
      movePlayer(newPos);
    }
  };

  $startBtn.on('click', start);
};

$(function() {
  main();
});