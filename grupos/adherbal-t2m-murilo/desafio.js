/* ============================================================================
   DESAFIO DA FLORESTA — o quiz do grupo virou um jogo de competição
   (pedido do Prompt.docx do grupo: tela inicial, dificuldade, 20 segundos,
   quatro botões coloridos, pontos extras por rapidez, macaco mascote,
   ranking com medalhas e resultado final). Identidade visual própria.
   ========================================================================== */
(function () {
  "use strict";
  const raiz = document.getElementById("desafio");
  if (!raiz) return;

  const TEMPO = 20;
  // nivel: 1 = fácil, 2 = médio, 3 = difícil
  const PERGUNTAS = [
    { n: 1, tipo: "Alimentação", e: "Hydrochoerus hydrochaeris", emoji: "🐾", q: "O que a capivara come principalmente?", o: ["Peixes grandes", "Capim e plantas aquáticas", "Carne de outros animais", "Só insetos"], a: 1, why: "A capivara é herbívora: come capim e plantas da beira da água." },
    { n: 1, tipo: "Alimentação", e: "Myrmecophaga tridactyla", emoji: "🐜", q: "Qual é a comida favorita do tamanduá-bandeira?", o: ["Formigas e cupins", "Peixes", "Frutos de palmeira", "Folhas de árvore"], a: 0, why: "Ele é insetívoro e come milhares de formigas e cupins por dia." },
    { n: 1, tipo: "Alimentação", e: "Panthera onca", emoji: "🐆", q: "A onça-pintada é…", o: ["Herbívora", "Onívora", "Carnívora", "Insetívora"], a: 2, why: "A onça-pintada é carnívora: caça outros animais." },
    { n: 1, tipo: "Características", e: "Bradypus variegatus", emoji: "🦥", q: "Qual animal se move bem devagar e passa a vida pendurado nas árvores?", o: ["Jacaré", "Bicho-preguiça", "Capivara", "Onça-pintada"], a: 1, why: "O bicho-preguiça é famoso por ser lento e viver no alto das árvores." },
    { n: 1, tipo: "Características", e: "Anodorhynchus hyacinthinus", emoji: "🦜", q: "De que cor são as penas da arara-azul-grande?", o: ["Vermelhas", "Verdes", "Azuis", "Amarelas"], a: 2, why: "Ela tem penas azul-cobalto e um anel amarelo em volta dos olhos." },
    { n: 1, tipo: "Características", e: "Ramphastos toco", emoji: "🦜", q: "O que mais chama atenção no tucano-toco?", o: ["O bico grande e colorido", "As listras pretas", "A cauda de peixe", "Os chifres"], a: 0, why: "O bico enorme e laranja é a marca registrada do tucano-toco." },
    { n: 2, tipo: "Habitat", e: "Caiman yacare", emoji: "🐊", q: "Onde vive o jacaré-do-pantanal?", o: ["Em desertos", "Em rios, lagoas e áreas alagadas", "Em montanhas geladas", "Dentro de cavernas"], a: 1, why: "Ele vive na água e nas margens dos rios e lagoas do Pantanal." },
    { n: 2, tipo: "Alimentação", e: "Anodorhynchus hyacinthinus", emoji: "🦜", q: "A arara-azul-grande come principalmente…", o: ["Coquinhos de palmeiras", "Peixes", "Formigas", "Carne"], a: 0, why: "Com o bico fortíssimo ela quebra coquinhos de acuri e bocaiuva." },
    { n: 2, tipo: "Alimentação", e: "Ramphastos toco", emoji: "🦜", q: "O tucano-toco é onívoro. Isso quer dizer que ele…", o: ["Só come plantas", "Só come carne", "Come plantas e animais", "Não precisa comer"], a: 2, why: "Onívoro come de tudo: frutos, insetos, ovos e pequenos animais." },
    { n: 2, tipo: "Curiosidades", e: "Hydrochoerus hydrochaeris", emoji: "🐾", q: "A capivara é o maior… do mundo!", o: ["Felino", "Roedor", "Réptil", "Pássaro"], a: 1, why: "A capivara é o maior roedor do planeta." },
    { n: 2, tipo: "Características", e: "Myrmecophaga tridactyla", emoji: "🐜", q: "Como o tamanduá pega as formigas?", o: ["Com a língua comprida e grudenta", "Com o bico", "Com uma teia", "Com as asas"], a: 0, why: "A língua dele pode passar de 60 cm e é bem pegajosa." },
    { n: 2, tipo: "Características", e: "Panthera onca", emoji: "🐆", q: "As manchas da onça-pintada têm um nome. Qual?", o: ["Listras", "Rosetas", "Escamas", "Bolinhas de neve"], a: 1, why: "As manchas em forma de flor se chamam rosetas." },
    { n: 3, tipo: "Curiosidades", e: "Panthera onca", emoji: "🐆", q: "Qual é o nome científico da onça-pintada?", o: ["Panthera onca", "Caiman yacare", "Ramphastos toco", "Bradypus variegatus"], a: 0, why: "Panthera onca: o maior felino das Américas." },
    { n: 3, tipo: "Habitat", e: "Caiman yacare", emoji: "🐊", q: "Qual bioma é a casa do jacaré-do-pantanal e da arara-azul?", o: ["Pantanal", "Pampa", "Caatinga", "Antártida"], a: 0, why: "Os dois vivem no Pantanal, a maior planície alagada do mundo." },
    { n: 3, tipo: "Curiosidades", e: "Bradypus variegatus", emoji: "🦥", q: "O bicho-preguiça desce da árvore principalmente para…", o: ["Fazer cocô", "Caçar onças", "Nadar no mar", "Dormir no chão"], a: 0, why: "Ele desce mais ou menos uma vez por semana, só para fazer cocô!" },
    { n: 3, tipo: "Curiosidades", e: "Myrmecophaga tridactyla", emoji: "🐜", q: "Quantos dentes tem o tamanduá-bandeira?", o: ["Nenhum", "10", "32", "100"], a: 0, why: "Ele não tem dentes: engole as formigas inteiras." },
    { n: 3, tipo: "Natureza", e: "", emoji: "🌳", q: "Por que a alimentação dos animais é importante para a floresta?", o: ["Porque todos comem a mesma coisa", "Porque não muda nada", "Porque cria relações e equilíbrio entre as espécies", "Porque impede a chuva"], a: 2, why: "As relações alimentares formam uma teia que mantém a floresta equilibrada." },
    { n: 3, tipo: "Natureza", e: "Anodorhynchus hyacinthinus", emoji: "🌱", q: "Como os animais que comem frutos ajudam a floresta?", o: ["Espalhando sementes", "Comendo todas as árvores", "Poluindo os rios", "Espantando a chuva"], a: 0, why: "Eles levam as sementes para longe, e novas árvores nascem." }
  ];
  const NIVEIS = {
    facil: { nome: "Fácil", qtd: 6, filtro: q => q.n === 1 },
    medio: { nome: "Médio", qtd: 8, filtro: q => q.n <= 2 },
    dificil: { nome: "Difícil", qtd: 10, filtro: () => true }
  };
  const CORES = [
    { cor: "#e5484d", sombra: "#a32a2f", icone: "🍃" },
    { cor: "#2f7fe0", sombra: "#1d55a0", icone: "💧" },
    { cor: "#f0b400", sombra: "#a87d00", icone: "☀️" },
    { cor: "#27a35a", sombra: "#18703c", icone: "🌺" }
  ];
  const CHAVE = "desafio-floresta-ranking";

  const css = document.createElement("style");
  css.textContent = `
  #desafio{--df-fundo:linear-gradient(160deg,#1b5034,#123b28 60%,#0c2a1c);color:#fff8e7}
  .df-palco{position:relative;background:var(--df-fundo);border:1px solid #ffffff24;border-radius:24px;padding:clamp(16px,3vw,30px);overflow:hidden;min-height:440px;box-shadow:0 18px 40px #0005}
  .df-palco:before{content:"";position:absolute;inset:-40% -10% auto;height:120%;background:radial-gradient(circle at 20% 30%,#ffd84d22,transparent 40%),radial-gradient(circle at 80% 20%,#59d47722,transparent 45%);pointer-events:none}
  .df-palco>*{position:relative}
  .df-titulo{font-size:clamp(30px,6vw,56px);font-weight:900;letter-spacing:.02em;margin:0;line-height:1;text-align:center;color:#ffd84d;text-shadow:0 4px 0 #8b5e3c,0 10px 24px #0008}
  .df-sub{text-align:center;color:#d6e8da;margin:10px 0 18px;font-size:17px}
  .df-macaco{font-size:86px;line-height:1;text-align:center;display:block;filter:drop-shadow(0 8px 10px #0006);animation:dfBalanca 2.4s ease-in-out infinite;transform-origin:50% 90%}
  .df-macaco.comemora{animation:dfPula .5s ease-in-out 3}
  .df-macaco.surpresa{animation:dfTreme .45s ease-in-out 2}
  .df-macaco.danca{animation:dfDanca 1s ease-in-out infinite}
  .df-fala{display:block;width:max-content;max-width:min(92%,420px);margin:6px auto 0;background:#fff8e7;color:#173323;font-weight:800;padding:9px 14px;border-radius:16px;text-align:center;position:relative}
  .df-fala:before{content:"";position:absolute;top:-8px;left:50%;margin-left:-8px;border:8px solid transparent;border-top:0;border-bottom-color:#fff8e7}
  @keyframes dfBalanca{0%,100%{transform:rotate(-6deg)}50%{transform:rotate(6deg)}}
  @keyframes dfPula{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-26px) scale(1.12)}}
  @keyframes dfTreme{0%,100%{transform:translateX(0)}25%{transform:translateX(-10px) rotate(-8deg)}75%{transform:translateX(10px) rotate(8deg)}}
  @keyframes dfDanca{0%,100%{transform:rotate(-12deg) translateY(0)}50%{transform:rotate(12deg) translateY(-12px)}}
  .df-nome{display:flex;justify-content:center;margin:6px 0 14px}
  .df-nome input{width:min(340px,100%);padding:13px 16px;border-radius:14px;border:2px solid #ffffff40;background:#0c2418;color:#fff8e7;font:inherit;font-size:17px;text-align:center}
  .df-niveis{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:18px}
  .df-nivel{all:unset;cursor:pointer;padding:11px 18px;border-radius:14px;border:2px solid #ffffff35;font-weight:800;background:#ffffff10;transition:transform .15s}
  .df-nivel:hover{transform:translateY(-2px)}
  .df-nivel.on{background:#ffd84d;color:#173323;border-color:#ffd84d}
  .df-nivel small{display:block;font-weight:600;font-size:12px;opacity:.8}
  .df-jogar{all:unset;cursor:pointer;display:block;margin:0 auto;padding:18px 40px;border-radius:20px;font-size:clamp(20px,3.4vw,28px);font-weight:900;letter-spacing:.04em;background:linear-gradient(180deg,#7be38f,#2fa84f);color:#0b2a17;box-shadow:0 7px 0 #18703c,0 14px 26px #0006;animation:dfPulsa 1.6s ease-in-out infinite;text-align:center}
  .df-jogar:active{transform:translateY(5px);box-shadow:0 2px 0 #18703c}
  @keyframes dfPulsa{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}
  .df-topo{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;font-weight:800}
  .df-pill{background:#0c2418;border:1px solid #ffffff2a;padding:7px 13px;border-radius:999px}
  .df-relogio{--p:1;width:74px;height:74px;border-radius:50%;display:grid;place-items:center;font-size:28px;font-weight:900;background:conic-gradient(#ffd84d calc(var(--p)*360deg),#ffffff1c 0);position:relative}
  .df-relogio:before{content:"";position:absolute;inset:7px;border-radius:50%;background:#123b28}
  .df-relogio span{position:relative}
  .df-relogio.acabando{background:conic-gradient(#ff5a5f calc(var(--p)*360deg),#ffffff1c 0);animation:dfBate .5s ease-in-out infinite}
  @keyframes dfBate{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
  .df-pergunta{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:center;margin:16px 0}
  .df-foto{width:clamp(96px,18vw,150px);aspect-ratio:1;border-radius:20px;object-fit:cover;border:3px solid #ffd84d;background:#245139}
  .df-q{font-size:clamp(20px,3.4vw,32px);font-weight:900;line-height:1.2;margin:0}
  .df-tipo{display:inline-block;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:#ffd84d;margin-bottom:6px}
  .df-opcoes{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .df-op{all:unset;box-sizing:border-box;cursor:pointer;display:flex;align-items:center;gap:12px;min-height:76px;padding:14px 16px;border-radius:16px;color:#fff;font-weight:800;font-size:clamp(16px,2.3vw,20px);text-shadow:0 1px 2px #0006;transition:transform .12s,filter .2s,opacity .2s}
  .df-op .ic{font-size:28px;flex-shrink:0;width:44px;height:44px;border-radius:12px;background:#ffffff2a;display:grid;place-items:center}
  .df-op:hover{transform:translateY(-3px) scale(1.01)}
  .df-op:active{transform:translateY(4px)}
  .df-op.escolhida{animation:dfEscolhe .35s ease}
  .df-op.apagada{opacity:.35;filter:grayscale(.6)}
  .df-op.certa{outline:5px solid #fff;outline-offset:-5px;animation:dfPula .5s ease 1}
  @keyframes dfEscolhe{50%{transform:scale(.94)}}
  .df-aviso{position:absolute;inset:0;display:grid;place-items:center;z-index:5;border-radius:24px;animation:dfEntra .3s ease both}
  .df-aviso.ok{background:#1f9d4ff2}.df-aviso.erro{background:#c2363cf2}
  .df-aviso div{text-align:center;padding:20px}
  .df-aviso h3{font-size:clamp(28px,6vw,52px);margin:8px 0;font-weight:900;letter-spacing:.03em}
  .df-aviso p{font-size:18px;max-width:520px;margin:6px auto}
  .df-aviso .df-pts{display:inline-block;margin-top:10px;background:#0004;padding:8px 16px;border-radius:999px;font-weight:900;font-size:20px}
  .df-aviso button{all:unset;cursor:pointer;margin-top:18px;display:inline-block;background:#fff8e7;color:#173323;font-weight:900;padding:13px 26px;border-radius:14px;font-size:18px;box-shadow:0 5px 0 #0004}
  @keyframes dfEntra{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:scale(1)}}
  .df-final{text-align:center}
  .df-total{font-size:clamp(40px,8vw,72px);font-weight:900;color:#ffd84d;margin:6px 0;text-shadow:0 4px 0 #8b5e3c}
  .df-podio{display:flex;justify-content:center;align-items:flex-end;gap:10px;margin:18px 0}
  .df-degrau{width:min(30%,150px);border-radius:16px 16px 6px 6px;padding:10px 6px;background:#ffffff14;border:1px solid #ffffff2a}
  .df-degrau b{display:block;font-size:15px;word-break:break-word}.df-degrau small{color:#d6e8da}
  .df-degrau .md{font-size:38px;display:block}
  .df-degrau.p1{min-height:150px;background:#ffd84d33;border-color:#ffd84d}
  .df-degrau.p2{min-height:120px}.df-degrau.p3{min-height:100px}
  .df-lista{max-width:420px;margin:0 auto 16px;text-align:left;font-size:14px;color:#d6e8da}
  .df-lista li{padding:3px 0}
  .df-botoes{display:flex;gap:10px;justify-content:center;flex-wrap:wrap}
  .df-botoes .df-jogar{margin:0}
  .df-sec{all:unset;cursor:pointer;padding:13px 22px;border-radius:14px;border:2px solid #ffffff40;font-weight:800}
  .df-confete{position:absolute;top:-12px;width:10px;height:16px;border-radius:3px;animation:dfCai 2.2s linear forwards;z-index:6}
  @keyframes dfCai{to{transform:translateY(560px) rotate(540deg);opacity:0}}
  @media(max-width:600px){.df-opcoes{grid-template-columns:1fr}.df-pergunta{grid-template-columns:1fr;text-align:center}.df-foto{margin:0 auto}.df-op{min-height:62px}}`;
  document.head.appendChild(css);

  // sons (Web Audio, sem arquivos)
  let ctx = null;
  function nota(f, t, d, tipo, v) {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === "suspended") ctx.resume();
      const o = ctx.createOscillator(), g = ctx.createGain(), t0 = ctx.currentTime + t;
      o.type = tipo || "triangle"; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(v || 0.12, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
      o.connect(g); g.connect(ctx.destination); o.start(t0); o.stop(t0 + d + 0.05);
    } catch (e) {}
  }
  const somAcerto = () => [523, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.09, 0.25));
  const somErro = () => { nota(220, 0, 0.3, "sawtooth", 0.07); nota(165, 0.18, 0.45, "sawtooth", 0.07); };
  const somTique = () => nota(1200, 0, 0.06, "square", 0.04);
  const somFim = () => [392, 523, 659, 784, 659, 784, 1047].forEach((f, i) => nota(f, i * 0.13, 0.32));

  const esc = t => String(t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const lerRanking = () => { try { const l = JSON.parse(localStorage.getItem(CHAVE) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const embaralhar = l => l.map(x => [Math.random(), x]).sort((a, b) => a[0] - b[0]).map(x => x[1]);
  const fotoEmoji = e => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' fill='#245139'/><text x='50' y='68' font-size='54' text-anchor='middle'>${e}</text></svg>`);

  let estado = { nivel: "facil", nome: "", lista: [], i: 0, pontos: 0, acertos: 0, timer: null, resta: TEMPO, respondeu: false };

  function macaco(cls, fala) {
    return `<span class="df-macaco ${cls || ""}" aria-hidden="true">🐒</span>${fala ? `<span class="df-fala">${esc(fala)}</span>` : ""}`;
  }

  function telaInicial() {
    pararTimer();
    raiz.innerHTML = `<div class="df-palco">
      <h2 class="df-titulo">DESAFIO DA FLORESTA</h2>
      <p class="df-sub">Perguntas sobre alimentação, habitat e curiosidades dos animais. Responda rápido para ganhar pontos extras!</p>
      ${macaco("", "Ei, você! Topa o desafio? Eu sei que você consegue! 🌟")}
      <div class="df-nome" style="margin-top:18px"><input id="dfNome" maxlength="18" placeholder="Seu nome de explorador(a)" value="${esc(estado.nome)}" aria-label="Seu nome de explorador"></div>
      <div class="df-niveis" role="group" aria-label="Dificuldade">
        ${Object.entries(NIVEIS).map(([k, n]) => `<button type="button" class="df-nivel ${k === estado.nivel ? "on" : ""}" data-nivel="${k}">${k === "facil" ? "🌱" : k === "medio" ? "🌿" : "🌳"} ${n.nome}<small>${n.qtd} perguntas</small></button>`).join("")}
      </div>
      <button type="button" class="df-jogar" id="dfJogar">▶ JOGAR AGORA</button>
      ${lerRanking().length ? `<p class="df-sub" style="margin-top:18px"><button type="button" class="df-sec" id="dfVerRanking">🏆 Ver ranking</button></p>` : ""}
    </div>`;
    raiz.querySelectorAll(".df-nivel").forEach(b => b.onclick = () => { estado.nivel = b.dataset.nivel; raiz.querySelectorAll(".df-nivel").forEach(x => x.classList.toggle("on", x === b)); });
    raiz.querySelector("#dfJogar").onclick = comecar;
    const vr = raiz.querySelector("#dfVerRanking"); if (vr) vr.onclick = () => telaRanking(null);
  }

  function comecar() {
    const inp = raiz.querySelector("#dfNome");
    estado.nome = (inp && inp.value.trim()) || "Explorador(a)";
    const n = NIVEIS[estado.nivel];
    estado.lista = embaralhar(PERGUNTAS.filter(n.filtro)).slice(0, n.qtd).map(q => {
      // embaralha as alternativas guardando qual é a certa
      const ordem = embaralhar([0, 1, 2, 3]);
      return Object.assign({}, q, { o: ordem.map(i => q.o[i]), a: ordem.indexOf(q.a) });
    });
    estado.i = 0; estado.pontos = 0; estado.acertos = 0;
    pergunta();
  }

  function pergunta() {
    pararTimer();
    const q = estado.lista[estado.i];
    estado.resta = TEMPO; estado.respondeu = false;
    raiz.innerHTML = `<div class="df-palco">
      <div class="df-topo">
        <span class="df-pill">❓ ${estado.i + 1} de ${estado.lista.length}</span>
        <div class="df-relogio" id="dfRelogio"><span>${TEMPO}</span></div>
        <span class="df-pill">⭐ ${estado.pontos} pontos</span>
      </div>
      <div class="df-pergunta">
        <img class="df-foto" alt="" src="${fotoEmoji(q.emoji)}" ${q.e ? `data-especie="${esc(q.e)}"` : ""}>
        <div><span class="df-tipo">${esc(q.tipo)}</span><p class="df-q">${esc(q.q)}</p></div>
      </div>
      <div class="df-opcoes">${q.o.map((t, i) => `<button type="button" class="df-op" data-i="${i}" style="background:${CORES[i].cor};box-shadow:0 6px 0 ${CORES[i].sombra}"><span class="ic">${CORES[i].icone}</span><span>${esc(t)}</span></button>`).join("")}</div>
    </div>`;
    if (window.FichaPokedex && FichaPokedex.trocarFotos) FichaPokedex.trocarFotos(raiz);
    raiz.querySelectorAll(".df-op").forEach(b => b.onclick = () => responder(+b.dataset.i, b));
    const rel = raiz.querySelector("#dfRelogio");
    estado.timer = setInterval(() => {
      estado.resta = Math.max(0, estado.resta - 0.1);
      rel.style.setProperty("--p", estado.resta / TEMPO);
      const s = Math.ceil(estado.resta);
      if (rel.firstChild.textContent !== String(s)) { rel.firstChild.textContent = s; if (s <= 5 && s > 0) somTique(); }
      rel.classList.toggle("acabando", estado.resta <= 5);
      if (estado.resta <= 0) responder(-1, null);
    }, 100);
  }

  function pararTimer() { if (estado.timer) clearInterval(estado.timer); estado.timer = null; }

  function responder(i, botao) {
    if (estado.respondeu) return;
    estado.respondeu = true; pararTimer();
    const q = estado.lista[estado.i], certo = i === q.a;
    raiz.querySelectorAll(".df-op").forEach((b, k) => { b.disabled = true; if (k === q.a) b.classList.add("certa"); else b.classList.add("apagada"); });
    if (botao) botao.classList.add("escolhida");
    let ganhou = 0;
    if (certo) { ganhou = 500 + Math.round(500 * estado.resta / TEMPO); estado.pontos += ganhou; estado.acertos++; somAcerto(); }
    else somErro();
    setTimeout(() => {
      const palco = raiz.querySelector(".df-palco");
      const av = document.createElement("div");
      av.className = "df-aviso " + (certo ? "ok" : "erro");
      const ultima = estado.i === estado.lista.length - 1;
      av.innerHTML = `<div>${macaco(certo ? "comemora" : "surpresa")}
        <h3>${certo ? "RESPOSTA CORRETA!" : i < 0 ? "O TEMPO ACABOU!" : "OPS! NÃO FOI DESSA VEZ!"}</h3>
        <p>${esc(q.why)}</p>
        ${certo ? `<span class="df-pts">+${ganhou} pontos${ganhou > 750 ? " ⚡ bônus de rapidez!" : ""}</span>` : `<span class="df-pts">A certa era: ${esc(q.o[q.a])}</span>`}
        <p style="margin-top:10px;font-weight:800">⭐ Total: ${estado.pontos} pontos</p>
        <button type="button" id="dfProx">${ultima ? "🏁 Ver resultado" : "Próxima pergunta ➜"}</button></div>`;
      palco.appendChild(av);
      if (certo) confete(palco, 40);
      av.querySelector("#dfProx").onclick = () => { estado.i++; if (estado.i < estado.lista.length) pergunta(); else final(); };
    }, 650);
  }

  function confete(el, n) {
    const cores = ["#ffd84d", "#59d477", "#ff8b5e", "#75d7ff", "#f6a6ff", "#fff8e7"];
    for (let k = 0; k < n; k++) {
      const c = document.createElement("i");
      c.className = "df-confete";
      c.style.left = Math.random() * 100 + "%"; c.style.background = cores[k % cores.length];
      c.style.animationDelay = Math.random() * 0.6 + "s";
      el.appendChild(c); setTimeout(() => c.remove(), 3000);
    }
  }

  function final() {
    somFim();
    const total = estado.lista.length, pct = estado.acertos / total;
    const msg = pct === 1 ? "PERFEITO! Você é o(a) rei(rainha) da floresta! 👑" : pct >= 0.7 ? "Mandou muito bem! A floresta está orgulhosa! 🌟" : pct >= 0.4 ? "Bom trabalho! Continue explorando para ficar ainda melhor! 🌱" : "Todo cientista aprende praticando. Bora tentar de novo? 💚";
    const lista = lerRanking();
    const eu = { nome: estado.nome, pontos: estado.pontos, nivel: NIVEIS[estado.nivel].nome, acertos: estado.acertos + "/" + total, t: Date.now() };
    lista.push(eu); lista.sort((a, b) => b.pontos - a.pontos);
    try { localStorage.setItem(CHAVE, JSON.stringify(lista.slice(0, 20))); } catch (e) {}
    raiz.innerHTML = `<div class="df-palco df-final">
      ${macaco("danca", `Parabéns, ${estado.nome}! 🎉`)}
      <p class="df-sub" style="margin-bottom:0">Pontuação total</p>
      <div class="df-total">${estado.pontos}</div>
      <p style="font-size:19px;font-weight:800;margin:0">✅ Você acertou ${estado.acertos} de ${total} perguntas (${NIVEIS[estado.nivel].nome})</p>
      <p class="df-sub">${esc(msg)}</p>
      <div class="df-botoes"><button type="button" class="df-jogar" id="dfDeNovo" style="animation:none">🔁 JOGAR NOVAMENTE</button><button type="button" class="df-sec" id="dfRank">🏆 Ver ranking</button></div>
    </div>`;
    confete(raiz.querySelector(".df-palco"), 90);
    raiz.querySelector("#dfDeNovo").onclick = comecar;
    raiz.querySelector("#dfRank").onclick = () => telaRanking(eu.t);
  }

  function telaRanking(destaque) {
    pararTimer();
    const l = lerRanking();
    const pos = destaque ? l.findIndex(x => x.t === destaque) : -1;
    const top = [l[1], l[0], l[2]];
    const md = ["🥈", "🥇", "🥉"], cls = ["p2", "p1", "p3"];
    raiz.innerHTML = `<div class="df-palco df-final">
      <h2 class="df-titulo" style="font-size:clamp(28px,5vw,44px)">🏆 RANKING</h2>
      <p class="df-sub">Os melhores exploradores deste aparelho</p>
      <div class="df-podio">${top.map((x, k) => x ? `<div class="df-degrau ${cls[k]}"><span class="md">${md[k]}</span><b>${esc(x.nome)}</b><small>${x.pontos} pts · ${esc(x.nivel)}</small></div>` : "").join("")}</div>
      ${pos >= 3 ? `<p style="font-weight:800">Você ficou em ${pos + 1}º lugar! Continue tentando para subir no pódio! 💪</p>` : pos >= 0 ? `<p style="font-weight:800">Você está no pódio! ${md[[1, 0, 2][pos]]}</p>` : ""}
      <ol class="df-lista" start="4">${l.slice(3, 10).map(x => `<li>${esc(x.nome)} — ${x.pontos} pts (${esc(x.nivel)})</li>`).join("")}</ol>
      <div class="df-botoes"><button type="button" class="df-jogar" id="dfDeNovo" style="animation:none">🔁 JOGAR NOVAMENTE</button><button type="button" class="df-sec" id="dfInicio">🏠 Início do desafio</button></div>
    </div>`;
    raiz.querySelector("#dfDeNovo").onclick = comecar;
    raiz.querySelector("#dfInicio").onclick = telaInicial;
  }

  // sair da aba no meio do jogo pausa o relógio na próxima pergunta
  document.querySelectorAll('.tab').forEach(b => b.addEventListener("click", () => { if (b.dataset.tab !== "quiz" && estado.timer) telaInicial(); }));
  telaInicial();
})();
