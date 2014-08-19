enchant();

window.onload = function() {
    core = new Core(320, 480);
    core.rootScene.backgroundColor = 'rgb(173, 209, 218)';

    core.preload(
      './start.png',
      './end.png',
      './images/cogoo.png',
      './images/enemy.png',
      './images/stage.png');

    core.onload = function() {
      this.pushScene(new TitleScene());
    }

    core.start();
}
