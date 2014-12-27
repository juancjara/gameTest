var Square = function (data){
  data = data || {}
  this.color = data.color || '';
  this.speed = data.speed || 0;
}

var Player = function(data) {
  data = data || {};
  this.x = data.x;
  this.y = data.y;
  this.color = 'yellow';
}

var main = function() {
  var canvas = document.getElementById('myCanvas');
  var size = canvas.width;
  var ctx = canvas.getContext('2d');
  var totalBlocks = 12;
  var squareSize = size / totalBlocks;
  var keys = {};
  var speed = 1;
  var matrix = [];
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

  //finish block on the bottom right corner
  var finishSquare = new Square({
    color: 'red'
  });
  
  var player = new Player();

  function getCoordinates(totalBlocks) {
    return function(num) {
      var x = parseInt(num / totalBlocks);
      var y = num % totalBlocks;
      return {x: x, y: y};
    }
  }
  getCoordinates = getCoordinates(totalBlocks);

  function getEnemyArray(matrix) {
    var arr = [];
    var totalBlocks = matrix[0].length;
    for (var i = 0; i < totalBlocks; i++) {
      for (var j = 0; j < totalBlocks; j++) {
        if (matrix[i][j]) {
          arr.push({
            x: i,
            y: j,
            sqr: matrix[i][j]
          })
        }
      };      
    };    
    return arr;
  }

  function createEnemySquares() {
    var size = totalBlocks*totalBlocks
    var blocks = Array(size);
    var temp;
    var rnd1;
    var rnd2;
    var x;
    var y;
    var pos1;
    var pos2;
    matrix = [];

    for (var i = 0; i < totalBlocks; i++) {
      var arr = [];
      for (var j = 0; j < totalBlocks; j++) {
        arr.push(null);
      };
      matrix.push(arr);
    };
    for (var i = 1; i < totalEnemySquares; i++) {
      pos = getCoordinates(i);
      var newsqr = new Square({color: 'blue'});
      matrix[pos.x][pos.y] = newsqr;
      enemySquares.push(newsqr);
    };

    for (var i = 1; i < 400; i++) {
      rnd = Math.floor(Math.random() * (size-2)+1);
      rnd2 = Math.floor(Math.random() * (size-2)+1);

      pos1 = getCoordinates(rnd);
      pos2 = getCoordinates(rnd2);

      temp = matrix[pos1.x][pos1.y];
      matrix[pos1.x][pos1.y] = matrix[pos2.x][pos2.y];
      matrix[pos2.x][pos2.y] = temp;
    }

    var defaultSqr = [1, totalBlocks, totalBlocks +1];
    for (var i = 0; i < defaultSqr.length; i++) {
      pos1 = getCoordinates(defaultSqr[i]);
      if (!matrix[pos1.x][pos1.y]) {
        var newsqr = new Square({color: 'blue'});
        matrix[pos1.x][pos1.y] = newsqr;
        enemySquares.push(newsqr);
      }
    };
    
    x = totalBlocks-1;
    matrix[x][x] = finishSquare;
  }

  function drawBackground() {
    ctx.clearRect(0, 0, size, size);
    var enemies = getEnemyArray(matrix);
    for(var i = 0; i < enemies.length; i++) {
      var enemy = enemies[i];
      drawSqr({
        x: enemy.x,
        y: enemy.y,
        color: enemy.sqr.color
      });
    }
    /*
    for (var i = 0; i < totalBlocks; i++) {
      for (var j = 0; j < totalBlocks; j++) {
        if (matrix[i][j]) {
          var sqr = matrix[i][j];
          drawSqr({
            x: i,
            y: j,
            color: sqr.color
          });
        }
      }
    };*/
  }

  function changeDirection() {
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
      var maxLimit = totalBlocks - 1;
      if (pos > maxLimit ){
        return maxLimit;
      }
      if (pos < 0) {
        return 0;
      }
      return pos;
    };

    drawBackground();
    
    player.x += newPos.x;
    player.y += newPos.y;
    player.x = evaluatePos(player.x);
    player.y = evaluatePos(player.y);

    var x = player.x;
    var y = player.y;
    
    if (matrix[x][y]) {
      
      if(matrix[x][y].color == 'red') {
        gameOnProgress = false;
        $title.text(mesages[1]);
        return;
      }
      if (matrix[x][y]) {
        changeDirection();
      }
    }
    
    drawSqr(player);
  }

  function drawSqr(size) {
    return function(obj) {
      var sqr = {};
      sqr.x = obj.x * size;
      sqr.y = obj.y * size;
      sqr.w = sqr.h = size;
      sqr.color = obj.color;
      drawRect(sqr);
    }
  }

  drawSqr = drawSqr(squareSize);

  function drawRect(rect) {
    ctx.beginPath();
    ctx.rect(rect.y, rect.x, rect.w, rect.h);
    ctx.fillStyle = rect.color;
    ctx.fill();
    ctx.closePath();
  }

  var start = function() {
    $startBtn.text('Restart');
    $title.text(mesages[0]);
    createEnemySquares();
    speed = 1;
    keys = {
      37: {x: 0, y: -1},//left
      38: {x: -1, y: 0},//up
      39: {x: 0, y: 1},//right
      40: {x: 1, y: 0},//down
    };
    gameOnProgress = true;
    drawBackground();
    player.x = 0;
    player.y = 0;
    drawSqr(player);
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