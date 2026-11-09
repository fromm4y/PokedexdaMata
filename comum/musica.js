/* ============================================================================
   MÚSICA E SONS DOS BOTÕES — compartilhado entre os grupos
   ----------------------------------------------------------------------------
   Música calma de natureza feita na hora pelo navegador (Web Audio): acordes
   suaves, notas de "sininho" e, de vez em quando, um passarinho. Não precisa de
   arquivo de áudio nem de internet.

   Uso no grupo:
     <script src="/comum/musica.js"></script>
     <script>Musica.iniciar({ estilo: "natureza", botao: true, cliques: true, volume: .5 });</script>

   - estilo: "natureza" (calma) ou "jogo" (mais animada, para minigames)
   - botao: mostra um botão flutuante 🎵 para ligar/desligar a música
   - cliques: toca um "plim" suave sempre que um botão é tocado
   O navegador só deixa tocar som depois do primeiro toque na tela: a música
   começa nesse momento (e lembra se a pessoa desligou).
   ========================================================================== */
(function () {
  "use strict";
  const CFG = { estilo: "natureza", botao: true, cliques: true, volume: 0.5, chave: "pdmMusica:" + location.pathname };
  let ctx = null, mestre = null, tocando = false, timer = null, passo = 0, botaoEl = null;

  function audio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      mestre = ctx.createGain(); mestre.gain.value = CFG.volume; mestre.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  const hz = n => 440 * Math.pow(2, (n - 69) / 12);

  // uma nota com envelope suave
  function nota(midi, quando, dur, tipo, vol, destino) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo; o.frequency.value = hz(midi);
    g.gain.setValueAtTime(0.0001, quando);
    g.gain.exponentialRampToValueAtTime(vol, quando + Math.min(0.08, dur / 4));
    g.gain.exponentialRampToValueAtTime(0.0001, quando + dur);
    o.connect(g); g.connect(destino || mestre);
    o.start(quando); o.stop(quando + dur + 0.05);
  }
  // passarinho: um assobio que sobe e desce
  function passarinho(quando) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine";
    const f = 2200 + Math.random() * 1200;
    o.frequency.setValueAtTime(f, quando);
    for (let i = 0; i < 3; i++) {
      o.frequency.linearRampToValueAtTime(f * 1.35, quando + 0.06 + i * 0.14);
      o.frequency.linearRampToValueAtTime(f * 0.95, quando + 0.12 + i * 0.14);
    }
    g.gain.setValueAtTime(0.0001, quando);
    g.gain.exponentialRampToValueAtTime(0.025, quando + 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, quando + 0.5);
    o.connect(g); g.connect(mestre); o.start(quando); o.stop(quando + 0.55);
  }

  // progressões: natureza (Dó maior calmo) e jogo (mais animada)
  const ACORDES = {
    natureza: [[60, 64, 67, 71], [57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 67]],
    jogo: [[60, 64, 67], [65, 69, 72], [67, 71, 74], [60, 64, 67]]
  };
  const ESCALA = [72, 74, 76, 79, 81, 84, 86, 88]; // pentatônica alta

  function compasso() {
    if (!tocando || !ctx) return;
    const jogo = CFG.estilo === "jogo";
    const t = ctx.currentTime + 0.05, dur = jogo ? 2.4 : 4.8;
    const acorde = ACORDES[jogo ? "jogo" : "natureza"][passo % 4];
    // acorde de fundo bem suave
    acorde.forEach(n => nota(n - 12, t, dur * 1.05, "sine", jogo ? 0.03 : 0.035));
    nota(acorde[0] - 24, t, dur, "triangle", 0.04);
    // sininhos (melodia aleatória da escala)
    const qtd = jogo ? 8 : 5, gap = dur / qtd;
    for (let i = 0; i < qtd; i++) {
      if (!jogo && Math.random() < 0.35) continue;
      const n = ESCALA[Math.floor(Math.random() * ESCALA.length)];
      nota(n, t + i * gap, jogo ? 0.35 : 1.4, jogo ? "square" : "sine", jogo ? 0.018 : 0.03);
    }
    if (jogo) for (let i = 0; i < 8; i++) nota(i % 2 ? acorde[2] - 12 : acorde[0] - 12, t + i * gap, 0.18, "triangle", 0.03);
    if (!jogo && Math.random() < 0.55) passarinho(t + Math.random() * dur * 0.8);
    passo++;
    timer = setTimeout(compasso, dur * 1000 - 60);
  }

  function ligar() {
    if (!audio()) return;
    if (tocando) return;
    tocando = true; passo = 0; compasso(); salvar(); pintarBotao();
  }
  function desligar() {
    tocando = false; clearTimeout(timer); salvar(); pintarBotao();
  }
  function alternar() { tocando ? desligar() : ligar(); }
  function salvar() { try { localStorage.setItem(CFG.chave, tocando ? "on" : "off"); } catch (e) {} }
  function quer() { try { return localStorage.getItem(CFG.chave) !== "off"; } catch (e) { return true; } }
  function definirVolume(v) { CFG.volume = Math.max(0, Math.min(1, Number(v))); if (mestre) mestre.gain.value = CFG.volume; }

  // "plim" suave ao tocar num botão
  function clique() {
    if (!audio()) return;
    const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "sine"; o.frequency.setValueAtTime(880, t); o.frequency.exponentialRampToValueAtTime(1320, t + 0.06);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.08 * Math.max(0.3, CFG.volume) / 0.5, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.18);
    o.connect(g); g.connect(ctx.destination); o.start(t); o.stop(t + 0.2);
  }

  function pintarBotao() {
    if (!botaoEl) return;
    botaoEl.textContent = tocando ? "🎵" : "🔇";
    botaoEl.title = tocando ? "Desligar a música" : "Ligar a música";
    botaoEl.classList.toggle("off", !tocando);
  }
  function criarBotao() {
    const st = document.createElement("style");
    st.textContent = `.pdm-musica{position:fixed;right:16px;bottom:16px;z-index:9000;width:54px;height:54px;border-radius:50%;border:2px solid #ffffffaa;
      background:linear-gradient(135deg,#3fb27f,#2a7d5a);color:#fff;font-size:24px;cursor:pointer;box-shadow:0 8px 20px #0005;display:grid;place-items:center;padding:0}
      .pdm-musica.off{background:#5d6b64}.pdm-musica:hover{transform:scale(1.06)}`;
    document.head.appendChild(st);
    botaoEl = document.createElement("button");
    botaoEl.type = "button"; botaoEl.className = "pdm-musica"; botaoEl.setAttribute("aria-label", "Ligar ou desligar a música");
    botaoEl.addEventListener("click", e => { e.stopPropagation(); alternar(); });
    document.body.appendChild(botaoEl); pintarBotao();
  }

  function iniciar(o) {
    Object.assign(CFG, o || {});
    const pronto = () => {
      if (CFG.botao) criarBotao();
      // o navegador só libera som depois do primeiro toque
      const primeiro = () => { document.removeEventListener("pointerdown", primeiro, true); if (quer()) ligar(); };
      document.addEventListener("pointerdown", primeiro, true);
      if (CFG.cliques) document.addEventListener("click", e => {
        const b = e.target.closest && e.target.closest("button,.btn,[role=button],a.button,label[for]");
        if (b && !b.classList.contains("pdm-musica")) clique();
      }, true);
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
  }

  window.Musica = { iniciar, ligar, desligar, alternar, clique, definirVolume, tocando: () => tocando };
})();
