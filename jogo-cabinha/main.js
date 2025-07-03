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
let hitSound;
let vidas = 3;
let vidasText;
let nivel = 1;
let nivelText;
let ranking = [];


function preload() {
  this.load.image('cabinha', 'assets/images/cabinha.png');
  this.load.image('cantil', 'assets/images/cantil.png');
  this.load.image('rede', 'assets/images/rede.png');
  this.load.image('inimigo_racismo', 'assets/images/racismo.png');
  this.load.image('inimigo_preconceito', 'assets/images/discriminacao.png');

  // Botões mobile (pode usar imagens customizadas)
  this.load.image('btnLeft', 'assets/images/btn_left.png');
  this.load.image('btnRight', 'assets/images/btn_right.png');
  this.load.image('btnCantil', 'assets/images/btn_cantil.png');
  this.load.image('btnRede', 'assets/images/btn_rede.png');
  this.load.audio('hit', 'assets/hit.mp3'); // Adicione o arquivo assets/hit.mp3
}

function loadRanking() {
  const data = localStorage.getItem('cabinha_ranking');
  ranking = data ? JSON.parse(data) : [];
}
function saveRanking() {
  localStorage.setItem('cabinha_ranking', JSON.stringify(ranking));
}
function showRanking(scene) {
  let txt = 'RANKING\n\n';
  ranking.slice(0, 5).forEach((item, i) => {
    txt += `${i + 1}. ${item} pts\n`;
  });
  if (!scene.rankingText) {
    scene.rankingText = scene.add.text(config.width / 2, config.height / 2 + 80, txt, {
      fontSize: '32px',
      fill: '#fff',
      fontFamily: 'sans-serif',
      align: 'center',
      backgroundColor: '#222e',
      padding: { x: 30, y: 30 },
      fontStyle: 'bold',
      stroke: '#000',
      strokeThickness: 4
    }).setOrigin(0.5).setDepth(20);
  } else {
    scene.rankingText.setText(txt).setVisible(true).setDepth(20);
  }
}

function getVelocidadePorNivel(tipo, nivel) {
  // Valores ajustados para cada nível
  if (tipo === 'inimigo_racismo') {
    if (nivel === 1) return Phaser.Math.Between(60, 80);      // Lento
    if (nivel === 2) return Phaser.Math.Between(100, 120);    // Médio
    if (nivel === 3) return Phaser.Math.Between(150, 170);    // Rápido
    if (nivel === 4) return Phaser.Math.Between(200, 230);    // Muito rápido
  } else {
    if (nivel === 1) return Phaser.Math.Between(80, 100);
    if (nivel === 2) return Phaser.Math.Between(130, 150);
    if (nivel === 3) return Phaser.Math.Between(180, 200);
    if (nivel === 4) return Phaser.Math.Between(240, 270);
  }
}

function create() {
  const centerX = this.scale.width / 2;
  const bottomY = this.scale.height;

  // Painel de instruções e botão Play
  const instrucoes = this.add.text(
    this.scale.width / 2,
    this.scale.height / 2,
    'Como jogar:\n← → ou A D: mover\nEspaço: atira cantil\nR: atira rede\nEnter: reiniciar após Game Over',
    {
      fontSize: '22px',
      fill: '#fff',
      fontFamily: 'sans-serif',
      align: 'center',
      backgroundColor: '#222a',
      padding: { x: 30, y: 20 }
    }
  ).setOrigin(0.5).setDepth(30);

  const playButton = this.add.text(
    this.scale.width / 2,
    this.scale.height / 2 + 120,
    '▶ Jogar',
    {
      fontSize: '32px',
      fill: '#fff',
      backgroundColor: '#228B22',
      padding: { x: 40, y: 15 },
      borderRadius: 10
    }
  ).setOrigin(0.5).setInteractive().setDepth(30);

  // Elementos do jogo (inicialmente invisíveis)
  player = this.physics.add.sprite(centerX, bottomY - 50, 'cabinha').setVisible(false);
  player.setScale(0.10);
  player.setCollideWorldBounds(true);

  cursors = this.input.keyboard.createCursorKeys();
  cantis = this.physics.add.group();
  redes = this.physics.add.group();
  enemies = this.physics.add.group();

  vidas = 10;
  vidasText = this.add.text(16, 40, 'Vidas: 10', {
    fontSize: '20px',
    fill: '#fff',
    fontFamily: 'sans-serif'
  }).setVisible(false);

  scoreText = this.add.text(16, 16, 'Pontuação: 0', {
    fontSize: '20px',
    fill: '#fff',
    fontFamily: 'sans-serif'
  }).setVisible(false);

  nivelText = this.add.text(16, 64, 'Nível: 1', {
    fontSize: '20px',
    fill: '#fff',
    fontFamily: 'sans-serif'
  }).setVisible(false);

  const titulo = this.add.text(centerX - 150, 40, 'Jogo do Cabinha!', {
    font: '32px sans-serif',
    fill: '#228B22'
  }).setVisible(false);

  loadRanking();

  this.nInimigos = 0;
  this.inimigosPorNivel = 10;
  this.velocidadeBaseRacismo = 80;
  this.velocidadeBasePreconceito = 100;
  for (let i = 0; i < 3; i++) {
    const e1 = enemies.create(150 + i * 200, 100, 'inimigo_racismo')
      .setVelocityY(getVelocidadePorNivel('inimigo_racismo', nivel))
      .setBounce(0)
      .setCollideWorldBounds(false)
      .setScale(0.6)
      .setVisible(false);
    const e2 = enemies.create(100 + i * 250, 0, 'inimigo_preconceito')
      .setVelocityY(getVelocidadePorNivel('inimigo_preconceito', nivel))
      .setBounce(0)
      .setCollideWorldBounds(false)
      .setScale(0.2)
      .setVisible(false);
    this.nInimigos += 2;
  }
  // Spawn contínuo de inimigos (só ativa após o play)
  this.spawnEvent = this.time.addEvent({
    delay: 2000,
    callback: () => {
      if (!player.visible) return; // só gera inimigos se o jogo começou
      let tipo = Phaser.Math.Between(0, 1) === 0 ? 'inimigo_racismo' : 'inimigo_preconceito';
      let x = Phaser.Math.Between(50, this.scale.width - 50);
      let vel = getVelocidadePorNivel(tipo, nivel);
      let escala = tipo === 'inimigo_racismo' ? 0.6 : 0.2;
      enemies.create(x, 0, tipo)
        .setVelocityY(vel)
        .setBounce(0)
        .setCollideWorldBounds(false)
        .setScale(escala)
        .setVisible(true);
      this.nInimigos++;
    },
    loop: true
  });

  // Ativa o jogo ao clicar no botão ou pressionar Enter
  function startGame() {
    instrucoes.destroy();
    playButton.destroy();
    player.setVisible(true);
    vidasText.setVisible(true);
    scoreText.setVisible(true);
    nivelText.setVisible(true);
    titulo.setVisible(true);
    enemies.children.iterate(e => e.setVisible(true));
  }
  playButton.on('pointerdown', startGame);
  this.input.keyboard.once('keydown-ENTER', startGame);

  this.input.keyboard.on('keydown-SPACE', () => {
    shootProjectile(this, cantis, 'cantil');
  });

  this.input.keyboard.on('keydown-R', () => {
    shootProjectile(this, redes, 'rede');
  });

  this.physics.add.overlap(cantis, enemies, hitEnemy, null, this);
  this.physics.add.overlap(redes, enemies, hitEnemy, null, this);
  this.physics.add.overlap(enemies, player, hitPlayer, null, this);

  // Botões para mobile
  if (!this.sys.game.device.os.desktop) {
    createMobileControls(this);
  }

  // Botão de reiniciar após Game Over
  this.restartButton = this.add.text(centerX, bottomY / 2 + 50, 'Reiniciar', {
    fontSize: '28px',
    fill: '#fff',
    backgroundColor: '#228B22',
    padding: { x: 20, y: 10 },
    borderRadius: 10
  }).setOrigin(0.5).setInteractive().setVisible(false);
  this.restartButton.on('pointerdown', () => {
    this.scene.restart();
    gameOver = false;
    score = 0;
  });
  // Atalho para reiniciar com Enter
  this.input.keyboard.on('keydown-ENTER', () => {
    if (gameOver) {
      this.scene.restart();
      gameOver = false;
      score = 0;
    }
  });
}

function update() {
  if (gameOver) return;

  player.setVelocityX(0);
  if (cursors.left.isDown || isMovingLeft) player.setVelocityX(-300);
  else if (cursors.right.isDown || isMovingRight) player.setVelocityX(300);

  enemies.children.iterate((enemy) => {
    if (!enemy) return;
    if (enemy.y > config.height) {
      enemy.destroy();
      vidas--;
      vidasText.setText('Vidas: ' + vidas);
      if (vidas <= 0 && !gameOver) {
        hitPlayer.call(this, player, enemy);
      }
    }
  });
}

function hitEnemy(projetil, enemy) {
  projetil.destroy();
  enemy.destroy();
  score += 10;
  scoreText.setText('Pontuação: ' + score);
  if (hitSound) hitSound.play();
  // Nível aumenta a cada 100 pontos
  let novoNivel = Math.min(1 + Math.floor(score / 100), 4);
  if (novoNivel > nivel) {
    nivel = novoNivel;
    nivelText.setText('Nível: ' + nivel);
    vidas = 10;
    vidasText.setText('Vidas: 10');
  }
}

function hitPlayer(player, enemy) {
  enemy.destroy();
  vidas--;
  vidasText.setText('Vidas: ' + vidas);
  if (vidas <= 0 && !gameOver) {
    gameOver = true;
    this.physics.pause();
    if (!this.gameOverText) {
      this.gameOverText = this.add.text(config.width / 2, config.height / 2, 'Game Over', {
        fontSize: '32px',
        fill: '#ff0000',
        fontFamily: 'sans-serif'
      }).setOrigin(0.5);
    } else {
      this.gameOverText.setVisible(true);
    }
    // Salva e mostra ranking
    ranking.push(score);
    ranking = ranking.sort((a, b) => b - a).slice(0, 5);
    saveRanking();
    showRanking(this);
    this.restartButton.setVisible(true).setDepth(10);
    this.input.keyboard.once('keydown-ENTER', () => {
      this.scene.restart();
      gameOver = false;
      score = 0;
    });
    this.restartButton.once('pointerdown', () => {
      this.scene.restart();
      gameOver = false;
      score = 0;
    });
  }
}

// Função genérica para tiros
function shootProjectile(scene, group, key) {
  const now = scene.time.now;
  if (key === 'cantil' && now > lastShotCantil + 300) {
    const shot = group.create(player.x, player.y - 20, key);
    shot.setVelocityY(-300);
    lastShotCantil = now;
  } else if (key === 'rede' && now > lastShotRede + 300) {
    const shot = group.create(player.x, player.y - 20, key);
    shot.setVelocityY(-300);
    lastShotRede = now;
  }
}

// Ajuste dinâmico do tamanho do jogo
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Organização dos assets: 
// Recomenda-se separar assets em subpastas: assets/player, assets/inimigos, assets/ui, etc.
