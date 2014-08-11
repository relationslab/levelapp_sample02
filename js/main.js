enchant();

function rand(num) {
    return Math.floor(Math.random() * num);
}

window.onload = function() {
    core = new Core(320, 480);
    core.rootScene.backgroundColor = "rgb(80,239,255)";

    core.preload("./koguma1.png", "./koguma2.png", "./ground.png", "./enemy.png");

    core.onload = function() {
      var field = new Field();
      core.rootScene.addChild(field);
    }

    core.start();
}

var Field = enchant.Class.create(enchant.Group, (function() {
  var core, background, ground, koguma;
  var enemies = [];

  function initialize() {
    core = enchant.Core.instance;
    enchant.Group.call(this, core.width, core.height);

    background = new Sprite(core.width, core.height);
    ground = new Ground();
    this.addChild(background);
    this.addChild(ground);

    koguma = new Koguma(50, 75, core.height - ground.height - 75);
    koguma.x = 0;
    koguma.y = core.height - ground.height - koguma.height;

    this.addChild(koguma);

    this.addEventListener(Event.ENTER_FRAME, function() {
      enterFrame.call(this);
    });

    this.addEventListener(Event.TOUCH_END, function() {
      koguma.jump();
    });
  };

  function enterFrame() {
    if (rand(50) == 1) {
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
    var enemy = new Enemy();
    enemy.x = core.width;
    enemy.y = core.height - ground.height - enemy.height;

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

  var core, images, frameCount, isJumping, jumpSpeed, defaultPositionY;

  function initialize(width, height, y) {
    enchant.Sprite.call(this, width, height);
    defaultPositionY = y;

    core = enchant.Core.instance;
    images = [
      core.assets['./koguma1.png'],
      core.assets['./koguma2.png']
    ];
    frameCount = 0;
    isJumping = false;

    this.addEventListener(Event.ENTER_FRAME, function() {
      if (isJumping) {
        calcPosition.call(this);
      }
      else if (frameCount++ % 10 == 0) {
        walk.call(this);
      }
    });
  };

  function walk() {
    if (this.image == images[0]) {
      this.image = images[1];
    }
    else {
      this.image = images[0];
    }
  };

  function jump() {
    if (!isJumping) {
      jumpSpeed = 15;
      isJumping = true;
    }
  };

  function calcPosition() {
    jumpSpeed -= 1;

    this.y = this.y - jumpSpeed;
    if (this.y > defaultPositionY) {
      this.y = defaultPositionY;
      isJumping = false;
    }
  };

  return {
    initialize : initialize,
    jump : jump
  };
})());

var Ground = enchant.Class.create(enchant.Sprite, (function(){

  var core, frameCount;

  function initialize() {
    core = enchant.Core.instance;
    enchant.Sprite.call(this, core.width + 16, 32);

    this.image = core.assets['./ground.png'];
    this.x = 0;
    this.y = core.height - 32;

    frameCount = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      frameCount++;
      move.call(this);
    });
  };

  function move() {
    this.x = - frameCount % 16;
  };

  return {
    initialize : initialize
  };
})());

var Enemy = enchant.Class.create(enchant.Sprite, (function(){
  var core, frameCount;

  function initialize() {
    enchant.Sprite.call(this, 30, 44);
    core = enchant.Core.instance;

    this.image = core.assets['./enemy.png'];

    frameCount = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      frameCount++;
      move.call(this);
    });
  };

  function move() {
    this.x -= 8;

    if (this.x + this.width < 0) {
      var event = new enchant.Event('dissapear_enemy');
      this.dispatchEvent(event);
    }
  };

  return {
    initialize : initialize
  };
})());
