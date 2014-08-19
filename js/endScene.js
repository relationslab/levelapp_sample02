var BASE_URL = "http://levelapp-env.elasticbeanstalk.com/"
//var BASE_URL = "http://localhost:1337/"


var EndScene = enchant.Class.create(enchant.Scene, {
  initialize : function(score) {
    enchant.Scene.call(this);
    this.core = enchant.Core.instance;

    var title = new Sprite(189, 97);
    title.image = this.core.assets['./end.png'];
    title.x = (this.core.width - title.width) / 2;
    title.y = (this.core.height - title.height) / 2;
    this.addChild(title);

    this.addEventListener(Event.TOUCH_END, function() {
      this.core.replaceScene(new PlayScene());
    });

    var self = this;
    $.ajax({
      type: 'POST',
      url: BASE_URL + 'score',
      data: {
        user_name : "テストユーザ",
        score : score,
        gameId : this.core.gameId
      },
      dataType: 'json',
      success : function() {
        self.postScoreSucceed.call(self);
      },
      error : function() {
        alert("スコアの送信に失敗しました");
      }
    });
  },
  postScoreSucceed : function() {
    var self = this;
    $.ajax({
      type: 'GET',
      url: BASE_URL + 'score',
      data : {
        gameId : this.core.gameId
      },
      dataType: 'json',
      success : function(res) {
        self.showHighScore(res);
      },
      error : function() {
        alert("ハイスコアの取得に失敗しました");
      }
    })
  },
  showHighScore : function(scores) {
    scores.sort(function(a, b) {
      if (a.score < b.score) return 1;
      if (a.score > b.score) return -1;
      return 0;
    });

    var msg = "ハイスコア\n";
    var count = 0;
    for (var i = 0; i < scores.length && i < 3; i++) {
      if (scores[i].score) {
        msg += scores[i].userName + " : " + scores[i].score + "\n";
      }
    }
    alert(msg);
  }
});
