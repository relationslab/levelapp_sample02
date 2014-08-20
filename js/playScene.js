// プレイ中画面
var PlayScene = enchant.Class.create(enchant.Scene, {
  initialize : function() {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    // フィールドの設定
    var field = new Field();
    field.x = 0;
    field.y = 0;
    this.addChild(field);
  }
});

var Field = enchant.Class.create(enchant.Group, {
  // 事前処理
  initialize : function() {
    this.core = enchant.Core.instance;
    enchant.Group.call(this, this.core.width, this.core.height);

    this.MARGIN_TOP = 100;  //上マージン
    this.HEIGHT = 300;  //フィールドの高さ
    this.IMAGE_MARGIN = 20; //画像内の枠
    this.level = 1;  //レベル(初期 = 1)
    this.enemies = [];  //敵の配列
    this.vectorY = 0;  // コグマの速度

    // フィールドの背景画像
    this.background = new Sprite(this.core.width + 20, this.HEIGHT);
    this.background.image = this.core.assets['./images/stage.png'];
    this.background.y = this.MARGIN_TOP;
    this.addChild(this.background);

    // 操作するコグマ
    this.koguma = new Koguma();
    this.koguma.x = 0;
    this.koguma.y = this.core.height / 2;
    this.addChild(this.koguma);

    // 点数のラベル
    this.scoreLabel = new ScoreLabel(5, 5);
    this.addChild(this.scoreLabel);

    // フレームが切り替わったときのイベント
    this.addEventListener(Event.ENTER_FRAME, function() {
      this.enterFrame();
    });

    // タッチ操作の設定
    this.initTouchAction();
  },
  initTouchAction : function() {
    // タッチを開始したとき
    this.addEventListener(Event.TOUCH_START, function(event) {
      this.touchedPosition = event.y;
    });
    // ドラッグ(スワイプ)したとき
    this.addEventListener(Event.TOUCH_MOVE, function(event) {
      this.vectorY = event.y - this.touchedPosition;
    });
    // タッチを終了したとき
    this.addEventListener(Event.TOUCH_END, function(event) {
      this.vectorY = 0;
    });
  },
  enterFrame : function() {
    // 画像をずらす(動いているように見せる)
    this.background.x = -(this.scoreLabel.score * 2) % 20;

    // コグマを移動
    this.koguma.move(this.vectorY / 5);

    // コースアウトした？
    if (this.koguma.y < (this.MARGIN_TOP + this.IMAGE_MARGIN)
      || this.koguma.y + this.koguma.height > this.MARGIN_TOP + this.HEIGHT - this.IMAGE_MARGIN) {
      this.core.gameover(this.scoreLabel.score);
    }

    // スコアを加算、500ごとにレベルアップ
    if (++this.scoreLabel.score % 500 == 0) {
      this.level++;
    }

    // 定期的に敵が出現
    if (this.scoreLabel.score % (~~(20 / this.level) + 10) == 0) {
      // 敵を追加
      var enemy = this.createEnemy();
      this.enemies.push(enemy);
      this.addChild(enemy);
    }

    for (var i = 0; i < this.enemies.length; i++) {
      // コグマと敵がぶつかったか？
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
    // 敵が左端に消えたときのイベント
    enemy.addEventListener('dissapear_enemy', function(event) {
      self.removeChild(enemy);

      // 敵を削除
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
