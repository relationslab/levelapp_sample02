var BASE_URL = "http://levelapp-env.elasticbeanstalk.com/"

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
        user_name : "hoge",
        score : score,
        gameId : this.core.gameId
      },
      dataType: 'json',
      success : function() {
        postScoreSucceed.call(self);
      },
      error : function() {
        alert("スコアの送信に失敗しました");
      }
    });
  },
  postScoreSucceed : function() {
    $.ajax({
      type: 'POST',
      url: BASE_URL + 'score',
      data : {
        gameId : this.core.gameId
      },
      dataType: 'json',
      success : function(res) {
        showHighScore(res);
      },
      error : function() {
        alert("ハイスコアの取得に失敗しました");
      }
    })
  },
  showHighScore : function(Scores) {
    score.forEach(function(score) {
      console.log(score.score);
    });
  }
});
