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

var Field = enchant.Class.create(enchant.Group, {
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Group.call(this, this.core.width, this.core.height);

    var background = new Sprite(this.core.width, this.core.height);
    this.addChild(background);

    this.ground = new Ground();
    this.addChild(this.ground);

    this.koguma = new Koguma(50, 75, this.core.height - this.ground.height - 75);
    this.koguma.x = 0;
    this.koguma.y = this.core.height - this.ground.height - this.koguma.height;

    this.addChild(this.koguma);

    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });

    this.addEventListener(Event.TOUCH_END, function() {
      this.koguma.jump();
    });

    this.enemies = [];
  },
  enterFrame : function() {
    if (rand(50) == 1) {
      var enemy = this.createEnemy();
      this.enemies.push(enemy);
      this.addChild(enemy);
    }

    for (var i = 0; i < this.enemies.length; i++) {
      if (this.koguma.intersect(this.enemies[i])) {
        this.core.end();
      }
    }
  },
  createEnemy : function() {
    var enemy = new Enemy();
    enemy.x = this.core.width;
    enemy.y = this.core.height - this.ground.height - enemy.height;

    var self = this;
    enemy.addEventListener('dissapear_enemy', function(event) {
      self.removeChild(this);

      for (var i = 0; i < self.enemies.length; i++) {
        if (self.enemies[i] == this) {
          self.enemies.splice(i, 1);
          break;
        }
      }
    });

    return enemy;
  }
});

var Koguma = enchant.Class.create(enchant.Sprite, {
  initialize : function(width, height, defaultPositionY) {
    enchant.Sprite.call(this, width, height);
    this.defaultPositionY = defaultPositionY;

    this.core = enchant.Core.instance;
    this.images = [
      this.core.assets['./koguma1.png'],
      this.core.assets['./koguma2.png']
    ];
    this.frameCount = 0;
    this.isJumping = false;

    this.addEventListener(Event.ENTER_FRAME, function() {
      if (this.isJumping) {
        this.calcPosition();
      }
      else if (this.frameCount++ % 10 == 0) {
        this.walk();
      }
    });
  },
  walk : function() {
    if (this.image == this.images[0]) {
      this.image = this.images[1];
    }
    else {
      this.image = this.images[0];
    }
  },
  jump : function() {
    if (!this.isJumping) {
      this.jumpSpeed = 15;
      this.isJumping = true;
    }
  },
  calcPosition : function() {
    this.jumpSpeed -= 1;

    this.y = this.y - this.jumpSpeed;
    if (this.y > this.defaultPositionY) {
      this.y = this.defaultPositionY;
      this.isJumping = false;
    }
  }
});

var Ground = enchant.Class.create(enchant.Sprite, {
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Sprite.call(this, this.core.width + 16, 32);

    this.image = this.core.assets['./ground.png'];
    this.x = 0;
    this.y = this.core.height - 32;

    this.frameCount = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.frameCount++;
      this.move();
    });
  },
  move : function() {
    this.x = - this.frameCount % 16;
  }
});

var Enemy = enchant.Class.create(enchant.Sprite, {
  initialize : function() {
    enchant.Sprite.call(this, 30, 44);
    this.core = enchant.Core.instance;

    this.image = this.core.assets['./enemy.png'];

    this.frameCount = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.frameCount++;
      this.move();
    });
  },
  move : function() {
    this.x -= 8;

    if (this.x + this.width < 0) {
      var event = new enchant.Event('dissapear_enemy');
      this.dispatchEvent(event);
    }
  }
});
