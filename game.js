var Game = function(canvasId) {
    this.WIDTH = 600;
    this.HEIGHT = 600;
    this.size = {
      w: this.WIDTH,
      h: this.HEIGHT
    };
    this.active = false;
    this.blocksPerRow = 12;
    this.totalSquares = 45;
    this.squareSize = this.WIDTH / this.blocksPerRow;
    var canvas = document.getElementById(canvasId);
    canvas.width = this.size.w;
    canvas.height = this.size.h;
    this.drawingContext = canvas.getContext('2d');
    this.steps = 0;

    this.btnStart = document.getElementById('start');
    this.title = document.getElementById('title'); 

    this.setEvents();
}

Game.prototype = {
  setEvents: function() {
    var self = this;
    this.btnStart.onclick = function() {
      self.start();
    }

  },
  createSquares: function() {
    function getCoordinates(totalBlocks) {
      return function(num) {
        var x = num % totalBlocks;
        var y = parseInt(num / totalBlocks);
        return {x: x, y: y};
      }
    }
    getCoordinates = getCoordinates(this.blocksPerRow);

    var tempSquares = [];
    var len = this.blocksPerRow * this.blocksPerRow - 3;
    for (var i = 0; i < len; i++) {
      if (i < this.totalSquares) {
        tempSquares.push(true);
      }
      else {
        tempSquares.push(false);
      }
    };
    var rnd, rnd2, temp;
    var randomLen = function() {
      return generateRandom(len);
    }
    for (var i = 1; i < 400; i++) {
      rnd = randomLen();
      rnd2 = randomLen();
      temp = tempSquares[rnd];
      tempSquares[rnd] = tempSquares[rnd2];
      tempSquares[rnd2] = temp;
    }    
    var defaultPos = {}, coord, sqr;
    defaultPos[1] = false;
    defaultPos[this.blocksPerRow] = false;
    defaultPos[this.blocksPerRow+1] = false;
    this.squares = []
    for (var i = 0; i < tempSquares.length; i++) {
      if (tempSquares[i]) {
        if ((i+2) in defaultPos) {
          defaultPos[i+2] = true;
        }
        coord = getCoordinates(i+2);
        sqr = new Square(this, {
          x: coord.x * this.squareSize,
          y: coord.y * this.squareSize,
          color: 'blue',
          type: 1
        });
        this.squares.push(sqr);
      }
    };

    for (var k in defaultPos) {
      if (!defaultPos[k]) {
        coord = getCoordinates(k);
        sqr = new Square(this, {
          x: coord.x * this.squareSize,
          y: coord.y * this.squareSize,
          color: 'blue',
          type: 1
        });
        this.squares.push(sqr);
      }
    }
  },
  createEntities: function() {
    this.player = new Player(this);
    this.endSquare = new Square(this, {
      x: this.size.w - this.squareSize,
      y: this.size.h - this.squareSize,
      color: 'red',
      type: 0
    });
    this.createSquares();
  },
  start: function() {
    this.title.innerHTML = 'Get to red square';
    this.active = true;
    this.createEntities();
    this.draw();
    this.steps = 0;
  },
  update: function() {
    if (!this.active) {
      return;
    }
    this.steps += 1;
    var player = this.player;
    this.squares.forEach(function(item, idx) {
      if(entitiesColliding(player, item)) {
        if (item.type == 1) {
          player.rotate();
        } else if (item.color == 2) {
          player.jump();
        }
      }
    }); 
    
    if (entitiesColliding(player , this.endSquare)) {
      this.win();
    }    
    this.draw();
  },
  win: function() {
    this.active = false;
    //textContent
    this.title.innerHTML = 'You won. Click restart to try again';
    console.log('won ', this.steps);
  },
  draw: function() {
    var context = this.drawingContext;
    context.clearRect(0, 0, this.WIDTH, this.HEIGHT);
    this.squares.forEach(function(item, idx){
      item.draw(context);
    });
    this.endSquare.draw(context);
    this.player.draw(context);    
  }
}

var drawRect = function(context, item) {
  context.fillStyle = item.color;
  context.fillRect(item.position.x, item.position.y, item.size.w, item.size.h);
}

var entitiesColliding = function(e1, e2) {
  return e1.position.x == e2.position.x && e1.position.y == e2.position.y;
}

var generateRandom = function(num) {
  return Math.floor(Math.random() * num);
}

var Player = function(game) {
  this.speed = game.squareSize;
  this.game = game;
  this.position = {x: 0, y: 0};
  this.color = 'yellow';
  this.size = {h: game.squareSize, w: game.squareSize};
  this.keyboarder = new Keyboarder(this);
  this.movement = {
    37: {x: -1, y: 0},//left
    38: {x: 0, y: -1},//up
    39: {x: 1, y: 0},//right
    40: {x: 0, y: 1 },//down
  }

};

Player.prototype = {
  update: function() {
    
  },
  jump: function(item) {
    this.position = item.position;
  },
  move: function(direction) {

    if (!(direction in this.movement)) {
      return;
    }

    function evaluateEdges(pos, limit) {
      if (pos > limit) {
        return limit;
      }
      if (pos < 0) {
        return 0;
      }
      return pos;
    }

    var move = this.movement[direction];
    var nextPos = this.position;
    nextPos.x += move.x * this.speed;
    nextPos.y += move.y * this.speed;
    this.position.x = evaluateEdges(nextPos.x, this.game.size.w - this.size.w);
    this.position.y = evaluateEdges(nextPos.y, this.game.size.h - this.size.h);
    this.game.update();
  },
  draw: function(context) {
    drawRect(context, this);
  },
  rotate: function() {
    random4 = function() {
      return generateRandom(4);
    }
    for (var i = 0; i < 6; i++) {
      var rnd = random4();
      var rnd2 = random4();
      var temp = this.movement[37 + rnd];
      this.movement[37 + rnd] = this.movement[37 + rnd2];
      this.movement[37 + rnd2] = temp;
    };
  }
}

var Keyboarder = function(item) {
  window.onkeydown = function(e) {
    var code = e.keyCode ? e.keyCode : e.which;
    item.move(code);
  };
}

var Square = function(game, extraData) {
  extraData = extraData || {};
  this.position = {
    x: extraData.x,
    y: extraData.y,
  };
  this.color = extraData.color;
  this.type = extraData.type;
  this.size = {h: game.squareSize, w: game.squareSize};
}

Square.prototype = {
  setPos: function(pos) {
    this.position = pos;
  },
  draw: function(context) {
    drawRect(context, this);
  },
  update: function() {

  }
}

window.onload = function () {
  new Game("canvas");
};

