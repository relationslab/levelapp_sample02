enchant();

function rand(num) {
    return Math.floor(Math.random() * num);
}

function rateOf(num) {
  return rand(num) == 1;
}

window.onload = function() {
    core = new Core(320, 480);
    core.rootScene.backgroundColor = 'rgb(173, 209, 218)';

    core.preload('./images/cogoo.png', './images/enemy.png', './images/stage.png');

    core.onload = function() {
      var field = new Field();
      field.x = 0;
      field.y = 0;
      core.rootScene.addChild(field);
    }

    core.start();
}

var Field = enchant.Class.create(enchant.Group, (function() {
  var MARGIN_TOP = 100;
  var HEIGHT = 300;
  var IMAGE_MARGIN = 20; //画像内の枠
  var core, background, koguma, scoreLabel, vectorY = 0;
  var level = 1;
  var enemies = [];

  function initialize() {
    core = enchant.Core.instance;
    enchant.Group.call(this, core.width, core.height);

    // background image
    background = new Sprite(core.width + 20, HEIGHT);
    background.image = core.assets['./images/stage.png'];
    background.y = MARGIN_TOP;
    this.addChild(background);

    // Koguma
    koguma = new Koguma();
    koguma.x = 0;
    koguma.y = core.height / 2;
    this.addChild(koguma);

    // Score Label
    scoreLabel = new ScoreLabel(5, 5);
    this.addChild(scoreLabel);

    this.addEventListener(Event.ENTER_FRAME, function() {
      enterFrame.call(this);
    });

    initTouchAction.call(this);
  };

  function initTouchAction() {
    var touchedPosition;

    this.addEventListener(Event.TOUCH_START, function(event) {
      touchedPosition = event.y;
    });
    this.addEventListener(Event.TOUCH_MOVE, function(event) {
      vectorY = event.y - touchedPosition;
    });
    this.addEventListener(Event.TOUCH_END, function(event) {
      vectorY = 0;
    });
  };

  function enterFrame() {
    // move image
    background.x = -(scoreLabel.score * 2) % 20;

    // koguma
    koguma.move(vectorY / 5);
    if (koguma.y < (MARGIN_TOP + IMAGE_MARGIN)
      || koguma.y + koguma.height > MARGIN_TOP + HEIGHT - IMAGE_MARGIN) {
      // out of stage
      core.end();
    }

    // add Score
    if (++scoreLabel.score % 500 == 0) {
      level++;
    }

    // add Enemy
    if (scoreLabel.score % ((20 / level) + 10) == 0) {
      var enemy = createEnemy.call(this);
      enemies.push(enemy);
      this.addChild(enemy);
    }

    for (var i = 0; i < enemies.length; i++) {
      if (koguma.intersect(enemies[i])) {
        core.end();
      }
    }
  };

  function createEnemy() {
    var enemy = new Enemy(level);
    enemy.x = core.width;
    enemy.y = rand(HEIGHT - enemy.height - IMAGE_MARGIN * 2) + MARGIN_TOP + IMAGE_MARGIN;

    var self = this;
    enemy.addEventListener('dissapear_enemy', function(event) {
      self.removeChild(enemy);

      for (var i = 0; i < enemies.length; i++) {
        if (enemies[i] == enemy) {
          enemies.splice(i, 1);
          break;
        }
      }
    });

    return enemy;
  }

  return {
    initialize : initialize
  };
})());

var Koguma = enchant.Class.create(enchant.Sprite, (function(){

  var core;

  function initialize() {
    enchant.Sprite.call(this, 24, 32);

    core = enchant.Core.instance;
    this.image = core.assets['./images/cogoo.png'];

    // animation
    this.frame = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.frame = ++this.frame % 4;
    });
  };

  function move(distance) {
    this.y += distance;
  }

  return {
    initialize : initialize,
    move : move
  };
})());

var Enemy = enchant.Class.create(enchant.Sprite, (function(){
  var core;

  function initialize(level) {
    enchant.Sprite.call(this, 30, 44);
    core = enchant.Core.instance;

    this.image = core.assets['./images/enemy.png'];

    this.speed = 4 * level;

    this.addEventListener(Event.ENTER_FRAME, function() {
      move.call(this);
    });
  };

  function move() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      var event = new enchant.Event('dissapear_enemy');
      this.dispatchEvent(event);
    }
  };

  return {
    initialize : initialize
  };
})());
