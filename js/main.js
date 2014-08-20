enchant();

window.onload = function() {
    core = new enchant.levelapp.Core(320, 480);
    core.rootScene.backgroundColor = 'rgb(173, 209, 218)';
    core.gameId = "123456"

    core.preload(
      './start.png',
      './end.png',
      './images/cogoo.png',
      './images/enemy.png',
      './images/stage.png');

    core.gameStart(PlayScene);
}
