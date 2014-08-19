var EndScene = enchant.Class.create(enchant.Scene, {
  initialize : function() {
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
  }
});
