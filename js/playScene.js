var PlayScene = enchant.Class.create(enchant.Scene, {
  initialize : function() {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    var field = new Field();
    field.x = 0;
    field.y = 0;
    this.addChild(field);
  }
});

var Field = enchant.Class.create(enchant.Group, {
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Group.call(this, this.core.width, this.core.height);

    this.MARGIN_TOP = 100;
    this.HEIGHT = 300;
    this.IMAGE_MARGIN = 20; //画像内の枠
    this.level = 1;
    this.enemies = [];
    this.vectorY = 0;

    // background image
    this.background = new Sprite(this.core.width + 20, this.HEIGHT);
    this.background.image = this.core.assets['./images/stage.png'];
    this.background.y = this.MARGIN_TOP;
    this.addChild(this.background);

    // Koguma
    this.koguma = new Koguma();
    this.koguma.x = 0;
    this.koguma.y = this.core.height / 2;
    this.addChild(this.koguma);

    // Score Label
    this.scoreLabel = new ScoreLabel(5, 5);
    this.addChild(this.scoreLabel);

    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });

    this.initTouchAction();
  },
  initTouchAction : function() {
    this.addEventListener(Event.TOUCH_START, function(event) {
      this.touchedPosition = event.y;
    });
    this.addEventListener(Event.TOUCH_MOVE, function(event) {
      this.vectorY = event.y - this.touchedPosition;
    });
    this.addEventListener(Event.TOUCH_END, function(event) {
      this.vectorY = 0;
    });
  },
  enterFrame : function() {
    // move image
    this.background.x = -(this.scoreLabel.score * 2) % 20;

    // koguma
    this.koguma.move(this.vectorY / 5);
    if (this.koguma.y < (this.MARGIN_TOP + this.IMAGE_MARGIN)
      || this.koguma.y + this.koguma.height > this.MARGIN_TOP + this.HEIGHT - this.IMAGE_MARGIN) {
      // out of stage
      this.core.gameover(this.scoreLabel.score);
    }

    // add Score
    if (++this.scoreLabel.score % 500 == 0) {
      this.level++;
    }

    // add Enemy
    if (this.scoreLabel.score % (~~(20 / this.level) + 10) == 0) {
      var enemy = this.createEnemy();
      this.enemies.push(enemy);
      this.addChild(enemy);
    }

    for (var i = 0; i < this.enemies.length; i++) {
      if (this.koguma.intersect(this.enemies[i])) {
        this.core.gameover(this.scoreLabel.score);
      }
    }
  },
  createEnemy : function() {
    var enemy = new Enemy(this.level);
    enemy.x = this.core.width;
    enemy.y = enchant.levelapp.util.rand(this.HEIGHT - enemy.height - this.IMAGE_MARGIN * 2) + this.MARGIN_TOP + this.IMAGE_MARGIN;

    var self = this;
    enemy.addEventListener('dissapear_enemy', function(event) {
      self.removeChild(enemy);

      for (var i = 0; i < self.enemies.length; i++) {
        if (self.enemies[i] == enemy) {
          self.enemies.splice(i, 1);
          break;
        }
      }
    });

    return enemy;
  }
});

var Koguma = enchant.Class.create(enchant.Sprite, {
  initialize : function() {
    enchant.Sprite.call(this, 24, 32);

    this.core = enchant.Core.instance;
    this.image = this.core.assets['./images/cogoo.png'];

    // animation
    this.frame = 0;
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.frame = ++this.frame % 4;
    });
  },
  move : function(distance) {
    this.y += distance;
  }
});

var Enemy = enchant.Class.create(enchant.Sprite, {
  initialize : function(level) {
    enchant.Sprite.call(this, 30, 44);
    this.core = enchant.Core.instance;

    this.image = this.core.assets['./images/enemy.png'];

    this.speed = 4 * level;

    this.addEventListener(Event.ENTER_FRAME, function() {
      this.move();
    });
  },
  move : function() {
    this.x -= this.speed;

    if (this.x + this.width < 0) {
      var event = new enchant.Event('dissapear_enemy');
      this.dispatchEvent(event);
    }
  }
});
