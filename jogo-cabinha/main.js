const config = {
  
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  backgroundColor: '#5c94fc',
  physics: {
    default: 'arcade',
    arcade: { debug: false }
  },
  scene: {
    preload,
    create,
    update
  }
};
Phaser.GameObjects.Image.prototype.setSmooth = function () {
  this.setPipeline('TextureTintPipeline');
  return this;
};


const game = new Phaser.Game(config);

let player, cursors, cantis, redes, enemies;
let leftButton, rightButton, shootCantilButton, shootRedeButton;
let lastShotCantil = 0, lastShotRede = 0;
let score = 0;
let scoreText;
let gameOver = false;
let isMovingLeft = false;
let isMovingRight = false;


function preload() {
  this.load.image('cabinha', 'assets/images/cabinha.png');
  this.load.image('cantil', 'assets/images/cantil.png');
  this.load.image('rede', 'assets/images/rede.png');
  this.load.image('inimigo_racismo', 'assets/images/racismo.png');
  this.load.image('inimigo_preconceito', 'assets/images/inimigo_preconceito.png');

  // Botões mobile (pode usar imagens customizadas)
  this.load.image('btnLeft', 'assets/images/btn_left.png');
  this.load.image('btnRight', 'assets/images/btn_right.png');
  this.load.image('btnCantil', 'assets/images/btn_cantil.png');
  this.load.image('btnRede', 'assets/images/btn_rede.png');
}

function create() {
  const centerX = this.scale.width / 2;
  const bottomY = this.scale.height;

  player = this.physics.add.sprite(centerX, bottomY - 50, 'cabinha');
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  cantis = this.physics.add.group();
  redes = this.physics.add.group();
  enemies = this.physics.add.group();

  for (let i = 0; i < 3; i++) {
    enemies.create(150 + i * 200, 100, 'inimigo_racismo').setVelocityX(Phaser.Math.Between(50, 100)).setBounce(1).setCollideWorldBounds(true);
    enemies.create(100 + i * 250, 200, 'inimigo_preconceito').setVelocityX(Phaser.Math.Between(-100, -50)).setBounce(1).setCollideWorldBounds(true);
  }

  this.input.keyboard.on('keydown-SPACE', () => {
    shootCantil(this);
  });

  this.input.keyboard.on('keydown-R', () => {
    shootRede(this);
  });

  scoreText = this.add.text(16, 16, 'Pontuação: 0', {
    fontSize: '20px',
    fill: '#fff',
    fontFamily: 'sans-serif'
  });

  this.add.text(centerX - 150, 40, 'Jogo do Cabinha!', {
    font: '32px Arial',
    fill: '#228B22'
  });

  this.physics.add.overlap(cantis, enemies, hitEnemy, null, this);
  this.physics.add.overlap(redes, enemies, hitEnemy, null, this);

  // Botões para mobile
  if (!this.sys.game.device.os.desktop) {
    createMobileControls(this);
  }

  this.time.addEvent({
    delay: 10000,
    callback: () => {
      const enemy = enemies.create(Phaser.Math.Between(100, 700), 0, 'inimigo_racismo');
      enemy.setVelocityX(Phaser.Math.Between(100, 150)).setBounce(1).setCollideWorldBounds(true);
    },
    loop: true
  });
}

function update() {
  if (gameOver) return;

  player.setVelocityX(0);
  if (cursors.left.isDown || isMovingLeft) player.setVelocityX(-300);
  else if (cursors.right.isDown || isMovingRight) player.setVelocityX(300);

  enemies.children.iterate((enemy) => {
    if (enemy.y > config.height - 50) {
      this.scene.pause();
      this.add.text(config.width / 2 - 80, config.height / 2, 'Game Over', {
        fontSize: '32px',
        fill: '#ff0000',
        fontFamily: 'sans-serif'
      });
      gameOver = true;
    }
  });
}

function hitEnemy(projetil, enemy) {
  projetil.destroy();
  enemy.destroy();
  score += 10;
  scoreText.setText('Pontuação: ' + score);
}

function shootCantil(scene) {
  if (scene.time.now > lastShotCantil + 300) {
    const shot = cantis.create(player.x, player.y - 20, 'cantil');
    shot.setVelocityY(-300);
    lastShotCantil = scene.time.now;
  }
}

function shootRede(scene) {
  if (scene.time.now > lastShotRede + 300) {
    const shot = redes.create(player.x, player.y - 20, 'rede');
    shot.setVelocityY(-300);
    lastShotRede = scene.time.now;
  }
}

function createMobileControls(scene) {
  const w = scene.scale.width;
  const h = scene.scale.height;

  leftButton = scene.add.image(80, h - 80, 'btnLeft').setInteractive().setAlpha(0.8).setScale(0.8);
  rightButton = scene.add.image(180, h - 80, 'btnRight').setInteractive().setAlpha(0.8).setScale(0.8);
  shootCantilButton = scene.add.image(w - 180, h - 80, 'btnCantil').setInteractive().setAlpha(0.8).setScale(0.8);
  shootRedeButton = scene.add.image(w - 80, h - 80, 'btnRede').setInteractive().setAlpha(0.8).setScale(0.8);

  leftButton.on('pointerdown', () => isMovingLeft = true);
  leftButton.on('pointerup', () => isMovingLeft = false);
  leftButton.on('pointerout', () => isMovingLeft = false);

  rightButton.on('pointerdown', () => isMovingRight = true);
  rightButton.on('pointerup', () => isMovingRight = false);
  rightButton.on('pointerout', () => isMovingRight = false);

  shootCantilButton.on('pointerdown', () => shootCantil(scene));
  shootRedeButton.on('pointerdown', () => shootRede(scene));
}
