/* ============================================================================
   TRILHA DE PRÊMIOS — dá um propósito aos pontos dos grupos
   ----------------------------------------------------------------------------
   Os pontos que o grupo já conta passam a abrir prêmios que mudam o app:
     🏷️ título de explorador, ✨ vagalumes na tela, 🎉 festa a cada descoberta,
     🌈 ficha arco-íris e 👑 Lenda da Mata.
   Uso no grupo (depois do adaptador):
     <script src="/comum/recompensas.js"></script>
     <script>Recompensas.iniciar({
       pontos: () => Number(document.getElementById("pontos").textContent) || 0,
       onde: "#medalhas",                      // onde aparece o painel
       comoGanhar: "Cada ave descoberta vale 10 pontos.",
       cor: "#2f7d43"
     });</script>
   ========================================================================== */
(function () {
  "use strict";
  const PREMIOS = [
    { pts: 30, ic: "🏷️", nome: "Título de explorador(a)", txt: "Um selo com o seu título aparece no canto da tela.", id: "titulo" },
    { pts: 60, ic: "✨", nome: "Vagalumes", txt: "Vagalumes brilhando e voando pela tela.", id: "vagalumes" },
    { pts: 100, ic: "🎉", nome: "Festa da descoberta", txt: "Chuva de confete toda vez que você descobrir uma espécie.", id: "festa" },
    { pts: 150, ic: "🌈", nome: "Ficha arco-íris", txt: "A ficha das descobertas ganha uma borda arco-íris brilhante.", id: "arcoiris" },
    { pts: 250, ic: "👑", nome: "Lenda da Mata", txt: "Seu título vira Lenda da Mata, com coroa e tudo!", id: "lenda" }
  ];
  const CFG = { pontos: () => 0, onde: null, comoGanhar: "", cor: "#2f7d43" };
  const chave = () => "pdmPremiosOff:" + location.pathname;
  const off = () => { try { return JSON.parse(localStorage.getItem(chave()) || "[]"); } catch (e) { return []; } };
  const ativo = (id, p) => p >= PREMIOS.find(x => x.id === id).pts && !off().includes(id);

  function css() {
    if (document.getElementById("pdm-premios-css")) return;
    const s = document.createElement("style"); s.id = "pdm-premios-css";
    s.textContent = `
.pdm-trilha{margin:18px 0;padding:16px;border-radius:20px;background:rgba(127,127,127,.10);border:2px solid ${CFG.cor}55;font-family:inherit;color:inherit}
.pdm-trilha h3{margin:0 0 6px;font-size:20px}.pdm-trilha p{margin:4px 0;line-height:1.45}
.pdm-barra{height:14px;border-radius:99px;background:rgba(127,127,127,.25);overflow:hidden;margin:10px 0}
.pdm-barra span{display:block;height:100%;background:linear-gradient(90deg,${CFG.cor},#f2c66d)}
.pdm-premios{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px;margin-top:10px}
.pdm-premio{border-radius:16px;padding:12px;text-align:center;border:2px dashed rgba(127,127,127,.45);background:rgba(127,127,127,.08)}
.pdm-premio .ic{font-size:36px;display:block;filter:grayscale(1);opacity:.55}
.pdm-premio b{display:block;margin:6px 0 2px;font-size:15px}.pdm-premio small{display:block;font-size:13.5px;opacity:.85;line-height:1.35}
.pdm-premio .meta{display:inline-block;margin-top:8px;font-weight:800;font-size:13px;padding:4px 10px;border-radius:99px;background:rgba(0,0,0,.25);color:#fff}
.pdm-premio.ok{border-style:solid;border-color:#f2c66d;box-shadow:0 0 16px rgba(242,198,109,.35)}.pdm-premio.ok .ic{filter:none;opacity:1}
.pdm-premio label{display:flex;gap:6px;justify-content:center;align-items:center;margin-top:8px;font-weight:800;font-size:14px;cursor:pointer}
.pdm-selo{position:fixed;left:12px;bottom:14px;z-index:8998;background:linear-gradient(90deg,#f2c66d,#f08c1b);color:#2b1700;font:900 14px system-ui,sans-serif;padding:8px 14px;border-radius:999px;box-shadow:0 6px 16px #0005;pointer-events:none}
.pdm-vagalumes{position:fixed;inset:0;pointer-events:none;z-index:1;overflow:hidden}
.pdm-vagalumes i{position:absolute;width:7px;height:7px;border-radius:50%;background:#fff7a8;box-shadow:0 0 10px 4px #fff36a99;animation:pdmVoa var(--d) ease-in-out infinite alternate;opacity:.85}
@keyframes pdmVoa{0%{transform:translate(0,0);opacity:.2}50%{opacity:1}100%{transform:translate(var(--x),var(--y));opacity:.3}}
html.pdm-arcoiris .fp-pop .fp-box-ficha,html.pdm-arcoiris .fp-pop>div{box-shadow:0 0 0 4px transparent,0 0 0 4px #ff5f6d,0 0 18px 6px #ffc37188!important;animation:pdmArco 3s linear infinite}
@keyframes pdmArco{0%{filter:hue-rotate(0)}100%{filter:hue-rotate(360deg)}}
.pdm-confete{position:fixed;top:-20px;width:10px;height:16px;border-radius:3px;z-index:100001;pointer-events:none;animation:pdmCai 2.4s linear forwards}
@keyframes pdmCai{to{transform:translateY(110vh) rotate(600deg)}}`;
    document.head.appendChild(s);
  }

  let selo = null, vaga = null;
  function aplicar() {
    const p = CFG.pontos();
    // título
    const t = ativo("lenda", p) ? "👑 Lenda da Mata" : ativo("titulo", p) ? "🏷️ Explorador(a) da Mata" : "";
    if (t) { if (!selo) { selo = document.createElement("div"); selo.className = "pdm-selo"; document.body.appendChild(selo); } selo.textContent = t; }
    else if (selo) { selo.remove(); selo = null; }
    // vagalumes
    if (ativo("vagalumes", p)) {
      if (!vaga) { vaga = document.createElement("div"); vaga.className = "pdm-vagalumes";
        for (let i = 0; i < 18; i++) vaga.insertAdjacentHTML("beforeend", `<i style="left:${(i * 53) % 100}%;top:${(i * 37) % 100}%;--d:${4 + (i % 5)}s;--x:${(i % 2 ? 1 : -1) * (30 + i * 4)}px;--y:${(i % 3 ? -1 : 1) * (40 + i * 3)}px"></i>`);
        document.body.appendChild(vaga); }
    } else if (vaga) { vaga.remove(); vaga = null; }
    document.documentElement.classList.toggle("pdm-arcoiris", ativo("arcoiris", p));
  }
  function confete() {
    const cores = ["#f2c66d", "#59d477", "#ff8b5e", "#75d7ff", "#f6a6ff", "#fff"];
    for (let i = 0; i < 70; i++) { const c = document.createElement("i"); c.className = "pdm-confete"; c.style.left = Math.random() * 100 + "vw"; c.style.background = cores[i % cores.length]; c.style.animationDelay = Math.random() * .6 + "s"; document.body.appendChild(c); setTimeout(() => c.remove(), 3200); }
  }
  function painel() {
    const caixa = CFG.onde && document.querySelector(CFG.onde); if (!caixa) return;
    let el = caixa.querySelector(".pdm-trilha"); if (!el) { el = document.createElement("div"); el.className = "pdm-trilha"; caixa.appendChild(el); }
    const p = CFG.pontos(), o = off(), prox = PREMIOS.find(x => p < x.pts), max = PREMIOS[PREMIOS.length - 1].pts;
    el.innerHTML = `<h3>🎁 Para que servem os pontos? Trilha de prêmios</h3>
      ${CFG.comoGanhar ? `<p>⭐ <b>Como ganhar:</b> ${CFG.comoGanhar}</p>` : ""}
      <p>${prox ? `Você tem <b>${p} pontos</b>. Faltam <b>${prox.pts - p}</b> para ganhar <b>${prox.ic} ${prox.nome}</b>!` : `🏆 Você tem <b>${p} pontos</b> e ganhou todos os prêmios!`}</p>
      <div class="pdm-barra"><span style="width:${Math.min(100, p / max * 100)}%"></span></div>
      <div class="pdm-premios">${PREMIOS.map(x => `<div class="pdm-premio ${p >= x.pts ? "ok" : ""}"><span class="ic">${x.ic}</span><b>${x.nome}</b><small>${x.txt}</small>
        ${p >= x.pts ? `<label><input type="checkbox" data-id="${x.id}" ${o.includes(x.id) ? "" : "checked"}> usar</label>` : `<span class="meta">🔒 ${x.pts} pontos</span>`}</div>`).join("")}</div>`;
    el.querySelectorAll("input[data-id]").forEach(i => i.onchange = () => { let l = off().filter(x => x !== i.dataset.id); if (!i.checked) l.push(i.dataset.id); try { localStorage.setItem(chave(), JSON.stringify(l)); } catch (e) {} aplicar(); });
  }
  function iniciar(o) {
    Object.assign(CFG, o || {});
    const pronto = () => {
      css(); aplicar(); painel();
      let ultimo = CFG.pontos();
      setInterval(() => { const p = CFG.pontos(); if (p !== ultimo) { ultimo = p; aplicar(); painel(); } }, 1000);
      // festa: quando a ficha de uma descoberta abre
      new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => { if (n.nodeType === 1 && n.classList.contains("fp-pop")) setTimeout(() => { if (n.isConnected && n.querySelector(".fp-ficha") && ativo("festa", CFG.pontos())) confete(); }, 350); }))).observe(document.body, { childList: true });
    };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
  }
  window.Recompensas = { iniciar, PREMIOS };
})();
