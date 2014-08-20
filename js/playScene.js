// プレイ中画面
var PlayScene = enchant.Class.create(enchant.Scene, {
  initialize : function() {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    // フィールドの設定
    this.field = new Field();
    this.field.x = 0;
    this.field.y = 0;
    this.addChild(this.field);

    // タッチ操作の設定
    this.initTouchAction();
  },
  initTouchAction : function() {
    var touchedPositionY = 0;
    this.addEventListener(Event.TOUCH_START, function(event) {
      // タッチを開始したときの座標を記録
      touchedPositionY = event.y;
    });
    this.addEventListener(Event.TOUCH_MOVE, function(event) {
      // ドラッグ(スワイプ)したときに速度が変わる
      this.field.velocityY = event.y - touchedPosition;
    });
    this.addEventListener(Event.TOUCH_END, function(event) {
      // タッチ終了で速度はゼロに
      this.field.velocityY = 0;
    });
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
    this.velocityY = 0;  // コグマの縦方向の速度

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

    // 点数ラベル
    this.scoreLabel = new ScoreLabel(5, 5);
    this.addChild(this.scoreLabel);

    this.addEventListener(Event.ENTER_FRAME, function() {
      // 1フレームごとに実行される
      this.enterFrame();
    });
  },
  enterFrame : function() {
    // １フレームごとに画像をずらすことで動いているように見せる
    this.background.x = -(this.scoreLabel.score * 2) % 20;

    // コグマを移動。5で割っているのは適当な速度調整
    this.koguma.move(this.velocityY / 5);

    // コースアウトしたか？
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

    // 左端まで移動したらイベントを発行
    if (this.x + this.width < 0) {
      var event = new enchant.Event('dissapear_enemy');
      this.dispatchEvent(event);
    }
  }
});
