document.addEventListener('DOMContentLoaded', () => {
  const baseSegredo = document.getElementById('baseSegredo');
  const botoes = document.querySelectorAll('.Teclas');
  const vidaBarra = document.getElementById('vidaBarra');
  const nivelTxt = document.getElementById('nivel');
  const recordeTxt = document.getElementById('recorde');
  const gameOverTela = document.getElementById('gameOver');
  const nivelFinalTxt = document.getElementById('nivelFinal');
  const btnReiniciar = document.getElementById('btnReiniciar');
  const goTexto = document.getElementById('goTexto'); // pode ser null
  const baseBotoes = document.querySelector('.Base');

  const VIDA_MAX = 20;
  const TAM_MAX = Infinity;

  let tamanhoSenha = 1;
  let senha = [];
  let indice = 0;
  let vidas = VIDA_MAX;
  let bloqueado = false;
  let vidaGanha = [];

  let recorde = Number(localStorage.getItem('recorde')) || 1;
  recordeTxt.textContent = `Recorde: ${recorde}`;

  const coresHex = [
    '#ff4d4d',
    '#4da6ff',
    '#4dff88',
    '#ffe44d',
    '#b84dff',
    '#4dffff'
  ];

  /* ---------- UTIL ---------- */

  function obterCoresPorNivel(nivel) {
    if (nivel <= 3) return [0, 1, 2];
    if (nivel <= 6) return [0, 1, 2, 3];
    if (nivel <= 9) return [0, 1, 2, 3, 4];
    return [0, 1, 2, 3, 4, 5];
  }

  function atualizarBotoes() {
    const cores = obterCoresPorNivel(tamanhoSenha);
    botoes.forEach(b => {
      const v = Number(b.dataset.value);
      b.style.display = cores.includes(v) ? 'block' : 'none';
    });
  }

  function gerarSenha() {
    const cores = obterCoresPorNivel(tamanhoSenha);
    let nova = [];

    for (let i = 0; i < tamanhoSenha; i++) {
      let cor;
      do {
        cor = cores[Math.floor(Math.random() * cores.length)];
      } while (cor === nova[i - 1]);
      nova.push(cor);
    }
    return nova;
  }

  function atualizarVida() {
    const p = (vidas / VIDA_MAX) * 100;
    vidaBarra.style.height = p + '%';

    if (p > 50)
      vidaBarra.style.background = 'linear-gradient(to top, #00ff88, #00cc66)';
    else if (p > 25)
      vidaBarra.style.background = 'linear-gradient(to top, #ffe44d, #ffcc00)';
    else
      vidaBarra.style.background = 'linear-gradient(to top, #ff4d4d, #cc0000)';
  }

  function criarQuadrados() {
    baseSegredo.innerHTML = '';
    vidaGanha = Array(tamanhoSenha).fill(false);

    for (let i = 0; i < tamanhoSenha; i++) {
      const d = document.createElement('div');
      d.className = 'Segredo';
      baseSegredo.appendChild(d);
    }

    nivelTxt.textContent = `Senha: ${tamanhoSenha}`;
    atualizarBotoes();
  }

  function resetarTentativa() {
    indice = 0;
    document.querySelectorAll('.Segredo')
      .forEach(q => q.classList.remove('sumir', 'erro'));
  }

  function desativarBotoes() {
    baseBotoes.classList.add('desativado');
  }

  function ativarBotoes() {
    baseBotoes.classList.remove('desativado');
  }

  /* ---------- TEXTO ---------- */

  function mostrarMemorize() {
    if (!goTexto) return;
    goTexto.textContent = 'MEMORIZE';
    goTexto.className = 'go mostrar memorize';
  }

  function mostrarGo() {
    if (!goTexto) return;
    goTexto.textContent = 'GO!';
    goTexto.className = 'go mostrar go';

    setTimeout(() => {
      goTexto.classList.remove('mostrar');
    }, 600);
  }

  /* ---------- GAME ---------- */

  function erro() {
    vidas = Math.max(0, vidas - 1);
    atualizarVida();

    document.querySelectorAll('.Segredo')
      .forEach(q => q.classList.add('erro'));

    if (vidas === 0) {
      gameOver();
      return;
    }

    bloqueado = true;
    setTimeout(() => {
      resetarTentativa();
      bloqueado = false;
    }, 300);
  }

  function gameOver() {
    bloqueado = true;
    nivelFinalTxt.textContent = tamanhoSenha;

    if (tamanhoSenha > recorde) {
      recorde = tamanhoSenha;
      localStorage.setItem('recorde', recorde);
      recordeTxt.textContent = `Recorde: ${recorde}`;
    }

    gameOverTela.style.display = 'flex';
  }

  function piscarSenhaNosQuadrados() {
    bloqueado = true;
    desativarBotoes();
    mostrarMemorize();

    const quadrados = document.querySelectorAll('.Segredo');
    const velocidade = Math.max(300, 300 - tamanhoSenha * 15);

    let i = 0;

    const intervalo = setInterval(() => {
      if (i > 0) {
        quadrados[i - 1].style.background = '#3a3535';
        quadrados[i - 1].classList.remove('piscar');
      }

      if (i === senha.length) {
        clearInterval(intervalo);

        quadrados[senha.length - 1].style.background = '#3a3535';
        quadrados[senha.length - 1].classList.remove('piscar');

        resetarTentativa();
        mostrarGo();

        bloqueado = false;
        ativarBotoes();
        return;
      }

      quadrados[i].style.background = coresHex[senha[i]];
      quadrados[i].classList.add('piscar');
      i++;
    }, velocidade);
  }

  function subirNivel() {
    if (tamanhoSenha < TAM_MAX) tamanhoSenha++;
    senha = gerarSenha();
    criarQuadrados();
    setTimeout(piscarSenhaNosQuadrados, 200);
  }

  /* ---------- EVENTOS ---------- */

  botoes.forEach(botao => {
    botao.addEventListener('click', () => {
      if (bloqueado) return;

      const valor = Number(botao.dataset.value);

      if (valor !== senha[indice]) {
        erro();
        return;
      }

      if (!vidaGanha[indice] && vidas < VIDA_MAX) {
        vidas++;
        vidaGanha[indice] = true;
        atualizarVida();
      }

      baseSegredo.children[indice].classList.add('sumir');
      indice++;

      if (indice === senha.length) subirNivel();
    });
  });

  btnReiniciar.addEventListener('click', () => location.reload());

  /* ---------- START ---------- */

  senha = gerarSenha();
  criarQuadrados();
  atualizarVida();
  setTimeout(piscarSenhaNosQuadrados, 300);
});
