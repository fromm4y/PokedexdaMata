/* ============================================================================
   ADAPTADOR DA POKÉDEX  —  liga QUALQUER front de aluno à ficha padrão
   ============================================================================
   Cada grupo fez o seu front do seu jeito. Este arquivo encaixa em todos sem
   precisar reescrever o código dos alunos:

   1) Quando o front pede à IA (fetch para /api/identificar), o adaptador:
      - avisa o back-end de qual grupo é a foto e o tipo/tamanho do arquivo
        (para o porteiro, Missão 4, funcionar);
      - diminui a foto se ela for grande demais para o servidor;
      - mostra o POP-UP padrão: "procurando…", a ficha, a dúvida, o "não é do
        tema" ou o erro (tudo de comum/ficha.js);
      - devolve a resposta ao front, para o álbum, os pontos e as medalhas
        dos alunos continuarem funcionando.
   2) Se o aluno escolher um arquivo que NÃO é foto, o adaptador chama o
      porteiro do grupo na hora (o "grande teste" do documento das missões).
   3) No computador, o botão de câmera abre a webcam.
   4) Opcional: um botão "🖼️ Galeria" ao lado do botão de foto do grupo.
   5) Opcional: um álbum pronto (album: { el, depois }) para quem não tem álbum.
   6) Opcional: botões por etapa (etapas: { inicio, camera, foto, ... }).
   7) Opcional: "📖 Ver ficha" nas figurinhas do álbum do grupo (albumFicha: { cartao, nome }).

   COMO USAR (no fim do index.html do grupo):
     <script src="/comum/ficha.js"></script>
     <script src="/comum/adaptador.js"></script>
     <script>
       PokedexAdaptador.iniciar({
         icone: "🐦", cor: "#48d9ff", cor2: "#a78bfa",
         escuro: () => true,                      // ou uma função do tema do front
         claro: {...}, noturno: {...},             // cores da ficha (opcional)
         esconder: ["#result"],                    // resultado antigo do front
         extras: info => [["🔊 Som", info.som]],    // campos do grupo na ficha
         alerta: info => info.perigoso ? info.aviso_perigo : "",
         salvar: info => document.getElementById("albumBtn").click(),
         acoesExtras: info => [{ texto: "🔊 Ouvir", fechar: false, aoClicar: () => ... }],
         novaFoto: () => document.getElementById("newPhotoBtn").click()
       });
     </script>
   ========================================================================== */
(function () {
  "use strict";

  const GRUPO = (location.pathname.match(/\/grupos\/([^/]+)/) || [])[1] || "";
  const CFG = { esconder: [], extras: null, alerta: null, salvar: null, novaFoto: null, carregando: "🔎 Procurando pistas…", limiarFront: 85 };
  let ultimoArquivo = null;

  const ehImagem = f => !!f && (f.type || "").startsWith("image/");
  const ehIdentificar = url => /\/api\/identificar(\?|$)/.test(String(url && url.url ? url.url : url));

  /* Lê um arquivo de imagem e devolve uma versão reduzida (data URL JPEG). */
  function reduzir(src, ladoMax, qualidade) {
    return new Promise(res => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, ladoMax / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement("canvas");
        c.width = Math.max(1, Math.round(img.naturalWidth * k));
        c.height = Math.max(1, Math.round(img.naturalHeight * k));
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        res(c.toDataURL("image/jpeg", qualidade));
      };
      img.onerror = () => res(null);
      img.src = src;
    });
  }
  function lerArquivo(f) {
    return new Promise(res => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.onerror = () => res(null); r.readAsDataURL(f); });
  }
  async function fotoAtual() {
    if (!ehImagem(ultimoArquivo)) return "";
    const url = URL.createObjectURL(ultimoArquivo);
    const r = await reduzir(url, 900, .82);
    URL.revokeObjectURL(url);
    return r || "";
  }

  /* Fotos de celular passam do limite de 4,5 MB do servidor: se a foto que o
     front montou for grande, refazemos ela menor antes de enviar. */
  async function reduzirSeGrande(pedido) {
    const LIMITE = 2500000;
    const partes = pedido.body && pedido.body.contents && pedido.body.contents[0] && pedido.body.contents[0].parts || [];
    for (const p of partes) {
      const d = p.inline_data || p.inlineData;
      if (d && d.data && d.data.length > LIMITE) {
        const menor = await reduzir(`data:${d.mime_type || d.mimeType || "image/jpeg"};base64,${d.data}`, 1600, .85);
        if (menor) { d.data = menor.split(",")[1]; if (d.mime_type) d.mime_type = "image/jpeg"; else d.mimeType = "image/jpeg"; }
      }
    }
    if (typeof pedido.imagem === "string" && pedido.imagem.length > LIMITE) {
      const menor = await reduzir(`data:${pedido.mime || "image/jpeg"};base64,${pedido.imagem}`, 1600, .85);
      if (menor) { pedido.imagem = menor.split(",")[1]; pedido.mime = "image/jpeg"; }
    }
  }

  /* "Tentar outra foto": zera os seletores de arquivo (senão escolher a MESMA
     foto de novo não faz nada) e chama o "nova foto" do front, se houver. */
  function novaFoto() {
    document.querySelectorAll('input[type="file"]').forEach(i => { try { i.value = ""; } catch (e) {} });
    temFoto = false; etapaAtual();
    if (CFG.novaFoto) CFG.novaFoto();
  }

  /* ---------- 5) Álbum comum (para grupos sem álbum, ou cujo álbum só
     aceitava as espécies do catálogo). Uso:
       album: { el: "#meuAlbum", depois: () => abrirAbaDoAlbum(), compacto: true }   (compacto: figurinhas pequenas)
     Guarda nome, foto, data e a ficha inteira (tocar na figurinha reabre a ficha). ---------- */
  const chaveAlbum = () => "pokedex-album-" + GRUPO;
  const lerAlbum = () => { try { const l = JSON.parse(localStorage.getItem(chaveAlbum()) || "[]"); return Array.isArray(l) ? l : []; } catch (e) { return []; } };
  const escA = t => String(t == null ? "" : t).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  async function salvarNoAlbumComum(info) {
    const lista = lerAlbum(), nome = String(info.nome_popular || info.nome || "Descoberta");
    const foto = ultimoArquivo ? await (async () => { const u = URL.createObjectURL(ultimoArquivo); const r = await reduzir(u, 360, .74); URL.revokeObjectURL(u); return r || ""; })() : "";
    const item = { nome, cientifico: info.nome_cientifico || "", foto, data: new Date().toLocaleDateString("pt-BR"), info };
    const i = lista.findIndex(x => x.nome.toLowerCase() === nome.toLowerCase());
    if (i >= 0) lista.splice(i, 1);
    lista.unshift(item);
    let n = 60;
    while (n > 0) { try { localStorage.setItem(chaveAlbum(), JSON.stringify(lista.slice(0, n))); break; } catch (e) { n -= 10; } }
    desenharAlbumComum();
    FichaPokedex.fechar();
    if (CFG.album.depois) CFG.album.depois();
  }
  function desenharAlbumComum() {
    const caixa = CFG.album && document.querySelector(CFG.album.el);
    if (!caixa) return;
    const lista = lerAlbum(), escuro = CFG.escuro ? CFG.escuro() : true, t = (escuro ? CFG.noturno : CFG.claro) || {};
    caixa.innerHTML = `<style>.fp-album{display:grid;grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:14px;font-family:inherit}
      .fp-album-item{all:unset;box-sizing:border-box;cursor:pointer;display:flex;flex-direction:column;border-radius:18px;overflow:hidden;background:${t.fundo || (escuro ? "#14202a" : "#fff")};color:${t.texto || (escuro ? "#fff" : "#222")};border:2px solid ${CFG.cor || "#5c9"}66;box-shadow:0 8px 22px #0003;transition:transform .2s}
      .fp-album-item:hover,.fp-album-item:focus-visible{transform:translateY(-3px);border-color:${CFG.cor || "#5c9"}}
      .fp-album-foto{aspect-ratio:4/3;background:linear-gradient(135deg,${CFG.cor || "#5c9"},${CFG.cor2 || "#9c5"});display:grid;place-items:center;font-size:46px;overflow:hidden}
      .fp-album-foto img{width:100%;height:100%;object-fit:cover;display:block}
      .fp-album-txt{padding:10px 12px 12px;display:flex;flex-direction:column;gap:2px}
      .fp-album-txt b{font-size:16px;line-height:1.2}.fp-album-txt i,.fp-album-txt small{font-size:12.5px;color:${t.suave || (escuro ? "#bbb" : "#666")}}
      .fp-album.compacto{grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:9px}.fp-album.compacto .fp-album-foto{aspect-ratio:1;font-size:34px}
      .fp-album.compacto .fp-album-txt{padding:6px 8px 8px}.fp-album.compacto .fp-album-txt b{font-size:13px}.fp-album.compacto .fp-album-txt i{display:none}.fp-album.compacto .fp-album-txt small{font-size:11px}
      .fp-album-ver{all:unset;margin-top:6px;align-self:flex-start;padding:5px 10px;border-radius:999px;background:${CFG.cor || "#2f7d43"};color:#fff;font:700 12px/1.2 system-ui,sans-serif;text-shadow:0 1px 2px #0005}
      .fp-album-vazio{grid-column:1/-1;text-align:center;padding:28px 16px;border:2px dashed ${CFG.cor || "#5c9"}88;border-radius:18px;color:${t.suave || "inherit"}}</style>
      <div class="fp-album${CFG.album.compacto ? " compacto" : ""}">${lista.length ? lista.map((x, i) => `<button type="button" class="fp-album-item" data-i="${i}" title="Ver a ficha">
        <span class="fp-album-foto">${x.foto ? `<img src="${escA(x.foto)}" alt="">` : escA(CFG.icone || "🌿")}</span>
        <span class="fp-album-txt"><b>${escA(x.nome)}</b>${x.cientifico ? `<i>${escA(x.cientifico)}</i>` : ""}<small>📅 ${escA(x.data)}</small><em class="fp-album-ver">📖 Ver ficha</em></span></button>`).join("")
        : `<div class="fp-album-vazio"><span style="font-size:40px">${escA(CFG.icone || "🌿")}</span><br><b>Seu álbum ainda está vazio.</b><br>Reconheça uma foto e toque em “💾 Salvar no álbum”!</div>`}</div>`;
    caixa.querySelectorAll(".fp-album-item").forEach(b => b.onclick = () => {
      const x = lista[+b.dataset.i];
      FichaPokedex.mostrar(x.info, { foto: x.foto, extras: CFG.extras ? (CFG.extras(x.info) || []) : [], alerta: CFG.alerta ? (CFG.alerta(x.info) || "") : "",
        acoes: (CFG.som ? [acaoSom(x.info)] : []).concat([{ texto: "🗑️ Tirar do álbum", aoClicar: () => { const l = lerAlbum().filter(y => y.nome !== x.nome); localStorage.setItem(chaveAlbum(), JSON.stringify(l)); desenharAlbumComum(); } }, { texto: "Fechar", principal: true, aoClicar: () => {} }]) });
    });
  }

  /* ---------- 6) Botões por etapa: só aparecem os botões que fazem sentido
     agora. Uso (cada lista diz o que APARECE naquela etapa; o que estiver em
     alguma lista e não estiver na etapa atual fica escondido):
       etapas: { inicio: ["#camera", "#galeria"], camera: ["#tirar"],
                 foto: ["#identificar", "#trocar"],
                 fotoTirada: ["#tirar"],   // botões que tiram foto da webcam
                 trocar: ["#trocar"] }     // botões que voltam ao começo ---------- */
  let temFoto = false;
  /* ---------- 7) Reabrir a ficha pelo álbum: o grupo guarda
     PokedexAdaptador.ultimaFicha() junto com a figurinha e, ao tocar nela,
     chama PokedexAdaptador.abrirFicha(info, foto). ---------- */
  let ultima = null;
  const ultimaFicha = () => ultima ? JSON.parse(JSON.stringify(ultima)) : null;
  /* ---------- 8) "📖 Ver ficha" nas figurinhas do álbum do PRÓPRIO grupo.
     Cada ficha mostrada fica guardada pelo nome (com uma miniatura); toda
     figurinha do álbum cujo nome tenha ficha guardada ganha o botão.
     Uso: albumFicha: { cartao: "#albumGrid .card", nome: "h3" } ---------- */
  const chaveFichas = () => "pokedex-fichas-" + GRUPO;
  const normNome = t => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
  const lerFichas = () => { try { return JSON.parse(localStorage.getItem(chaveFichas()) || "{}") || {}; } catch (e) { return {}; } };
  /* Guarda a ficha JÁ (sem esperar a foto diminuir) e depois atualiza a foto:
     antes, com foto grande, a figurinha aparecia antes da ficha estar guardada
     e ficava sem o botão. Guarda todos os nomes (popular, comum, científico). */
  function gravarFichas(tudo) {
    const chaves = Object.keys(tudo).sort((a, b) => tudo[b].t - tudo[a].t);
    for (let n = Math.min(chaves.length, 40); n > 0; n -= 5) {
      const parte = {}; chaves.slice(0, n).forEach(k => parte[k] = tudo[k]);
      try { localStorage.setItem(chaveFichas(), JSON.stringify(parte)); return; } catch (e) {}
    }
  }
  async function guardarFicha(u) {
    if (!u || !u.info) return;
    const i = u.info, nome = normNome(i.nome_popular || i.nome || i.nome_comum);
    if (!nome) return;
    const nomes = [...new Set([i.nome_popular, i.nome, i.nome_comum, i.name, i.nome_cientifico].map(normNome).filter(x => x.length >= 3))];
    let tudo = lerFichas();
    tudo[nome] = { info: i, foto: (tudo[nome] && tudo[nome].foto) || "", nomes, t: Date.now() };
    gravarFichas(tudo); marcarAlbum();
    const foto = u.foto ? await reduzir(u.foto, 300, .7) : "";
    tudo = lerFichas();
    if (tudo[nome] && foto) { tudo[nome].foto = foto; gravarFichas(tudo); }
    setTimeout(marcarAlbum, 300);
  }
  /* itensDoBioma(bioma): espécies reconhecidas neste aparelho que vivem no
     bioma — para a cena do habitat ao lado dos mapas dos grupos. */
  /* todos os reconhecidos neste aparelho (com a foto que a pessoa mandou),
     para dividirem o habitat dentro da ficha */
  function todosReconhecidos() {
    const tudo = lerFichas();
    return Object.keys(tudo).map(k => tudo[k]).filter(f => f && f.info).sort((a, b) => b.t - a.t)
      .map(f => ({ nome: f.info.nome_popular || f.info.nome || "Espécie", img: f.foto || "", icone: CFG.icone || "🌿", fauna: !!CFG.fauna,
        biomas: [].concat(f.info.biomas || []).concat(f.info.habitat_mundo ? [f.info.habitat_mundo] : []) }));
  }
  function itensDoBioma(bioma) {
    const tudo = lerFichas();
    return Object.keys(tudo).map(k => tudo[k]).filter(f => f && f.info && [].concat(f.info.biomas || []).includes(bioma))
      .map(f => ({ nome: f.info.nome_popular || f.info.nome || "Espécie", img: f.foto || "", icone: CFG.icone || "🌿", fauna: !!CFG.fauna, biomas: [].concat(f.info.biomas || []) }));
  }
  function fichaPeloNome(texto) {
    const n = normNome(texto), tudo = lerFichas();
    if (!n) return null;
    if (tudo[n]) return tudo[n];
    const bate = k => k.length >= 4 && (n.includes(k) || k.includes(n));
    const v = Object.keys(tudo).map(k => tudo[k]).sort((a, b) => b.t - a.t)
      .find(f => [normNome(f.info.nome_popular || f.info.nome)].concat(f.nomes || []).some(bate));
    return v || null;
  }
  function marcarAlbum() {
    const o = CFG.albumFicha;
    if (!o) return;
    document.querySelectorAll(o.cartao).forEach(c => {
      if (c.querySelector(".fp-ver-ficha")) return;
      const alvo = o.nome ? c.querySelector(o.nome) : c;
      const f = alvo && fichaPeloNome(alvo.textContent);
      if (!f) return;
      /* Um botão só: se a figurinha do grupo já tem "Ver detalhes" / "Ver ficha" /
         "Detalhes", ele continua com a cara do grupo, mas abre a ficha completa
         (igual à do resultado, com as informações extras do grupo). */
      const proprio = [...c.querySelectorAll("button,a,[role=button]")].find(x => !x.classList.contains("fp-ver-ficha") && /ver detalhes|detalhes|ver ficha|ficha completa|ver informa/i.test(x.textContent));
      if (proprio) {
        if (proprio.dataset.fpFicha) return;
        proprio.dataset.fpFicha = "1"; c.dataset.fpFicha = "1";
        proprio.addEventListener("click", e => { const g = fichaPeloNome(alvo.textContent) || f; if (!g) return; e.preventDefault(); e.stopImmediatePropagation(); abrirFicha(g.info, g.foto); }, true);
        return;
      }
      if (c.dataset.fpFicha) return;
      const b = document.createElement("span");
      b.className = "fp-ver-ficha"; b.setAttribute("role", "button"); b.tabIndex = 0; b.textContent = "📖 Ver ficha";
      const abrir = e => { e.preventDefault(); e.stopPropagation(); const g = fichaPeloNome(alvo.textContent) || f; abrirFicha(g.info, g.foto); };
      b.addEventListener("click", abrir); b.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") abrir(e); });
      c.appendChild(b);
    });
  }
  function ligarAlbumFicha() {
    if (!CFG.albumFicha) return;
    const st = document.createElement("style");
    st.textContent = `.fp-ver-ficha{display:inline-flex!important;align-items:center;gap:4px;margin:8px 10px 10px;padding:7px 12px!important;border-radius:999px;font:700 13px/1.2 system-ui,sans-serif!important;letter-spacing:0!important;text-transform:none!important;white-space:nowrap;flex:0 0 auto;cursor:pointer;
      background:${CFG.cor || "#2f7d43"};color:#fff;text-shadow:0 1px 2px rgba(0,0,0,.35);box-shadow:0 2px 8px rgba(0,0,0,.18);width:max-content;max-width:calc(100% - 20px)}
      .fp-ver-ficha:hover{filter:brightness(1.08)}`;
    document.head.appendChild(st);
    let pend = false;
    new MutationObserver(() => { if (pend) return; pend = true; requestAnimationFrame(() => { pend = false; marcarAlbum(); }); }).observe(document.body, { childList: true, subtree: true });
    marcarAlbum();
  }
  /* som: true -> botão "🔊 Ouvir som" na ficha, com uma gravação real da espécie */
  const acaoSom = info => ({ texto: CFG.textoSom || "🔊 Ouvir som", fechar: false, aoClicar: botao => FichaPokedex.tocarSom(info.nome_cientifico, info.nome_popular || info.nome, botao) });
  function abrirFicha(info, foto, acoes) {
    if (!info) return;
    if (CFG.som) acoes = [acaoSom(info)].concat(acoes || []);
    FichaPokedex.mostrar(info, { foto: foto || "", extras: CFG.extras ? (CFG.extras(info) || []) : [], alerta: CFG.alerta ? (CFG.alerta(info) || "") : "",
      acoes: (acoes || []).concat([{ texto: "Fechar", principal: true, aoClicar: () => {} }]) });
  }
  function etapaAtual() {
    if (!CFG.etapas) return;
    const camera = [...document.querySelectorAll("video")].some(v => v.srcObject && v.srcObject.active && v.offsetParent !== null);
    document.documentElement.dataset.fpEtapa = temFoto ? "foto" : camera ? "camera" : "inicio";
  }
  function ligarEtapas() {
    const e = CFG.etapas;
    if (!e) return;
    const todos = [...new Set([...(e.inicio || []), ...(e.camera || []), ...(e.foto || [])])];
    const st = document.createElement("style");
    st.textContent = ["inicio", "camera", "foto"].map(et => {
      const esc = todos.filter(x => !(e[et] || []).includes(x));
      return esc.length ? esc.map(x => `html[data-fp-etapa="${et}"] ${x}`).join(",") + "{display:none!important}" : "";
    }).join("\n");
    document.head.appendChild(st);
    document.addEventListener("change", ev => { const t = ev.target; if (t && t.type === "file" && t.files && t.files[0] && ehImagem(t.files[0])) { temFoto = true; etapaAtual(); } }, true);
    document.addEventListener("click", ev => {
      const t = ev.target.closest && ev.target.closest("button,label,a");
      if (!t) return;
      if ((e.fotoTirada || []).some(x => t.matches(x))) setTimeout(() => { temFoto = true; etapaAtual(); }, 60);
      if ((e.trocar || []).some(x => t.matches(x))) { temFoto = false; setTimeout(etapaAtual, 60); }
    }, true);
    setInterval(etapaAtual, 400);
    etapaAtual();
  }

  /* ---------- 8) Não salvar a mesma espécie duas vezes ----------
     semRepetir: ["chaveDoAlbum", ...] — as listas do grupo no localStorage.
     - se a espécie já está numa delas, "Salvar no álbum" só avisa (não duplica);
     - e essas listas nunca guardam o mesmo nome repetido. */
  const nomeDe = x => typeof x === "string" ? x : x && typeof x === "object" ? (x.nome_popular || x.nomePopular || x.speciesName || x.nome || x.name || x.especie || x.commonName || x.title || (x.info && (x.info.nome_popular || x.info.nome)) || "") : "";
  const listaDe = v => Array.isArray(v) ? v : (v && typeof v === "object" ? Object.values(v).find(Array.isArray) : null);
  function jaSalvo(info) {
    const alvo = normNome(info && (info.nome_popular || info.nome));
    if (!alvo) return false;
    const chaves = (CFG.semRepetir || []).concat(CFG.album ? [chaveAlbum()] : []);
    return chaves.some(k => { try { const l = listaDe(JSON.parse(localStorage.getItem(k) || "null")); return !!l && l.some(x => normNome(nomeDe(x)) === alvo); } catch (e) { return false; } });
  }
  const setItemOriginal = Storage.prototype.setItem;
  Storage.prototype.setItem = function (k, v) {
    if (this === window.localStorage && (CFG.semRepetir || []).includes(k)) {
      try {
        const dado = JSON.parse(v), l = listaDe(dado);
        if (l) {
          const vistos = new Set(), limpa = l.filter(x => { const n = normNome(nomeDe(x)); if (!n) return true; if (vistos.has(n)) return false; vistos.add(n); return true; });
          if (limpa.length !== l.length) { l.splice(0, l.length, ...limpa); v = JSON.stringify(dado); }
        }
      } catch (e) {}
    }
    return setItemOriginal.call(this, k, v);
  };
  function salvarUmaVez(info, salvar) {
    // só trava quando sabemos levar a pessoa ao álbum (verAlbum ou o álbum comum)
    if ((CFG.verAlbum || (CFG.album && !CFG.salvar)) && jaSalvo(info)) {
      FichaPokedex.fechar();
      if (CFG.verAlbum) CFG.verAlbum(); else if (CFG.album.depois) CFG.album.depois();
      FichaPokedex.balao("✅ " + (info.nome_popular || "Essa espécie") + " já está no seu álbum!");
      return;
    }
    salvar(info);
  }

  function acoesFinais(info) {
    const lista = [];
    if (CFG.salvar) lista.push({ texto: "💾 Salvar no álbum", principal: true, aoClicar: () => salvarUmaVez(info, CFG.salvar) });
    else if (CFG.album) lista.push({ texto: "💾 Salvar no álbum", principal: true, aoClicar: () => salvarUmaVez(info, salvarNoAlbumComum) });
    if (CFG.som) lista.push(acaoSom(info));
    if (CFG.acoesExtras) lista.push(...(CFG.acoesExtras(info) || []));
    lista.push({ texto: "🔍 Reconhecer outra", principal: !CFG.salvar && !CFG.album, aoClicar: novaFoto });
    return lista;
  }
  const tentarOutra = () => [{ texto: "Tentar outra foto", principal: true, aoClicar: novaFoto }];

  /* ---------- 1) a conversa com a IA vira pop-up ---------- */
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async function (url, opt) {
    if (!ehIdentificar(url) || !opt || String(opt.method || "GET").toUpperCase() !== "POST" || typeof opt.body !== "string") {
      return fetchOriginal(url, opt);
    }
    let pedido;
    try { pedido = JSON.parse(opt.body); } catch (e) { return fetchOriginal(url, opt); }
    pedido.grupo = pedido.grupo || GRUPO;
    // Modelos antigos (gemini-1.x e 2.x) já foram aposentados pelo Google:
    // sem o nome, o back-end usa o modelo atual.
    if (/^gemini-(1|2)\./.test(pedido.modelo || "")) delete pedido.modelo;
    if (ultimoArquivo) { pedido.tipo = ultimoArquivo.type || "application/octet-stream"; pedido.tamanho = ultimoArquivo.size; }
    if (CFG.instrucaoExtra) {
      const t = pedido.body && pedido.body.contents && pedido.body.contents[0] && (pedido.body.contents[0].parts || []).find(p => typeof p.text === "string");
      if (t) t.text += "\n" + CFG.instrucaoExtra;
    }
    FichaPokedex.carregando(CFG.carregando);
    await reduzirSeGrande(pedido);

    let resp;
    try { resp = await fetchOriginal(url, Object.assign({}, opt, { body: JSON.stringify(pedido) })); }
    catch (e) {
      FichaPokedex.aviso({ tipo: "erro", texto: "💜 Ops! Não consegui falar com o servidor. Confira a internet e tente de novo.", acoes: [{ texto: "Fechar", principal: true }] });
      throw e;
    }
    let dados = null;
    try { dados = await resp.clone().json(); } catch (e) {}

    if (!resp.ok) {
      const msg = dados && dados.error && dados.error.message || "";
      if (resp.status === 422) FichaPokedex.aviso({ tipo: "porteiro", texto: msg, acoes: tentarOutra() });
      else FichaPokedex.aviso({ tipo: "erro", texto: "💜 Ops! Não consegui conversar com o reconhecimento agora. Tente novamente!", detalhe: msg, acoes: [{ texto: "Fechar", principal: true }] });
      return resp;
    }

    const parte = dados && dados.candidates && dados.candidates[0] && dados.candidates[0].content && dados.candidates[0].content.parts && dados.candidates[0].content.parts[0];
    let info = null;
    try { info = JSON.parse(parte.text); } catch (e) {}
    if (!info) {
      FichaPokedex.aviso({ tipo: "erro", texto: "A IA não devolveu uma resposta. Tente outra foto.", acoes: tentarOutra() });
      return resp;
    }
    // Front de texto livre: ele recebe o texto (texto_front), não o JSON.
    const devolver = texto => { parte.text = texto; return new Response(JSON.stringify(dados), { status: 200, headers: { "Content-Type": "application/json" } }); };
    const textoFront = typeof info.texto_front === "string" ? info.texto_front : null;
    if (info.fora_do_tema) {
      FichaPokedex.aviso({ tipo: "fora", texto: info.mensagem_backend, acoes: tentarOutra() });
    } else if (!info.identificado) {
      FichaPokedex.aviso({ tipo: "duvida", texto: info.mensagem_backend || "Não consegui ter certeza. Tente uma foto mais nítida.", acoes: tentarOutra() });
    } else {
      // guarda a ficha (e uma miniatura da foto) para o álbum do grupo poder reabrir depois
      ultima = { info, foto: ultimoArquivo ? await (async () => { const u = URL.createObjectURL(ultimoArquivo); const r = await reduzir(u, 420, .76); URL.revokeObjectURL(u); return r || ""; })() : "" };
      guardarFicha(ultima);
      FichaPokedex.mostrar(info, {
        foto: await fotoAtual(),
        extras: CFG.extras ? (CFG.extras(info) || []) : [],
        alerta: CFG.alerta ? (CFG.alerta(info) || "") : "",
        acoes: acoesFinais(info)
      });
      // O front do grupo tem a SUA nota de corte (ex.: 80%). Quem decide agora
      // é a Missão 3 no back-end; então, quando o back-end aceitou, o front
      // também aceita (senão o álbum e os pontos do front não funcionariam).
      const paraFront = Object.assign({}, info, { confianca: Math.max(Number(info.confianca) || 0, CFG.limiarFront) });
      return devolver(textoFront !== null ? textoFront : JSON.stringify(paraFront));
    }
    return textoFront !== null ? devolver(textoFront) : resp;
  };

  /* ---------- 2) arquivo que não é foto: o porteiro decide ---------- */
  async function porteiro(arquivo) {
    FichaPokedex.carregando("🚪 O porteiro está conferindo o arquivo…");
    try {
      const r = await fetchOriginal("/api/identificar", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grupo: GRUPO, tipo: arquivo.type || "application/octet-stream", mime: arquivo.type || "application/octet-stream", tamanho: arquivo.size, imagem: "" })
      });
      const d = await r.json().catch(() => ({}));
      const msg = d && d.error && d.error.message || "Esse arquivo não pode entrar.";
      FichaPokedex.aviso({ tipo: r.status === 422 ? "porteiro" : "erro", texto: msg, acoes: tentarOutra() });
    } catch (e) {
      FichaPokedex.aviso({ tipo: "erro", texto: "Não consegui falar com o servidor.", acoes: tentarOutra() });
    }
  }
  function aoEscolher(arquivo, evento, input) {
    if (!arquivo) return;
    ultimoArquivo = arquivo;
    if (!ehImagem(arquivo)) {
      if (evento) { evento.stopImmediatePropagation(); evento.preventDefault(); }
      if (input) input.value = "";
      porteiro(arquivo);
    }
  }
  document.addEventListener("change", e => {
    const t = e.target;
    if (t instanceof HTMLInputElement && t.type === "file" && t.files && t.files[0]) aoEscolher(t.files[0], e, t);
  }, true);
  document.addEventListener("drop", e => {
    const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) aoEscolher(f, ehImagem(f) ? null : e, null);
  }, true);

  /* ---------- 3) webcam no computador ---------- */
  function ligarWebcams() {
    document.querySelectorAll('input[type="file"][capture]').forEach(input => {
      if (input.dataset.fpCamera) return;
      input.dataset.fpCamera = "1";
      FichaPokedex.ligarCamera(input, arquivo => {
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
  }

  function iniciar(o) {
    Object.assign(CFG, o || {});
    FichaPokedex.configurar({
      icone: CFG.icone, cor: CFG.cor, cor2: CFG.cor2, fauna: !!CFG.fauna,
      escuro: CFG.escuro, claro: CFG.claro || {}, noturno: CFG.noturno || {},
      aquatico: !!CFG.aquatico, fundosCena: CFG.fundosCena || {}, soMundo: !!CFG.soMundo,
      companheiros: () => todosReconhecidos()
    });
    if (CFG.esconder.length) {
      const s = document.createElement("style");
      s.textContent = CFG.esconder.map(x => "html.fp-esconder " + x).join(",") + "{display:none!important}";
      document.head.appendChild(s);
      document.documentElement.classList.add("fp-esconder");
    }
    const pronto = () => { botaoInicio(); ligarWebcams(); botaoGaleria(); FichaPokedex.trocarFotos(); desenharAlbumComum(); ligarEtapas(); ligarAlbumFicha(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
  }

  /* 9) Botão "🏠 Início" fixo no topo (pedido da professora): sempre à mão,
     em qualquer tela. Uso: inicio: () => irPara("inicio"),
     naInicio: () => true quando já está na tela inicial (aí ele se esconde
     enquanto a página está no topo). */
  function botaoInicio() {
    if (!CFG.inicio || document.querySelector(".pdm-inicio")) return;
    const st = document.createElement("style");
    st.textContent = `.pdm-inicio{position:fixed;top:12px;right:14px;z-index:8999;display:flex;align-items:center;gap:6px;font:600 15px/1 system-ui,-apple-system,"Segoe UI",sans-serif;padding:11px 16px;border-radius:14px;border:1px solid rgba(255,255,255,.38);background:rgba(10,16,34,.74);color:#fff;backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);box-shadow:0 6px 18px rgba(0,0,0,.28);cursor:pointer;transition:opacity .2s,transform .2s,background .2s}
      .pdm-inicio:hover{background:rgba(10,16,34,.9);transform:translateY(-1px)}.pdm-inicio.some{opacity:0;pointer-events:none;transform:translateY(-8px)}
      html.fp-travado .pdm-inicio{display:none}`;
    document.head.appendChild(st);
    const b = document.createElement("button"); b.type = "button"; b.className = "pdm-inicio"; b.textContent = "← Início"; b.setAttribute("aria-label", "Voltar para o início");

    b.addEventListener("click", () => { try { CFG.inicio(); } catch (e) {} window.scrollTo({ top: 0, behavior: "smooth" }); setTimeout(atualizar, 400); });
    document.body.appendChild(b);
    // some só quando está no topo da tela inicial (ou no topo, se o grupo não disse qual é a inicial)
    // procura um lugar no topo (meio, esquerda, direita) que não cubra nenhum botão;
    // se não houver, vai para o canto de baixo à esquerda
    const LUGARES = [{ top: "12px", right: "14px" }, { top: "12px", left: "14px" }, { top: "12px", left: "50%", ml: "-52px" }, { top: "calc(100% - 64px)", left: "14px" }];
    const cobre = () => { const p = b.getBoundingClientRect(); return [...document.querySelectorAll("button,a,input,select,h1,[role=button],nav")].some(e => { if (e === b || e.closest(".pdm-inicio,.pdm-musica,.fp-pop")) return false; const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) return false; const st = getComputedStyle(e); if (st.visibility === "hidden" || st.opacity === "0") return false;
      if (!(r.left < p.right && r.right > p.left && r.top < p.bottom && r.bottom > p.top)) return false;
      // conteúdo que só passa por baixo ao rolar não conta: só menus fixos (ou o topo da página)
      if (window.scrollY < 80) return true;
      for (let n = e; n && n !== document.body; n = n.parentElement) { const ps = getComputedStyle(n).position; if (ps === "fixed" || ps === "sticky") return true; }
      return false; }); };
    const posicionar = () => { if (b.classList.contains("some")) return; for (const L of LUGARES) { b.style.top = L.top; b.style.left = L.left || "auto"; b.style.right = L.right || "auto"; b.style.marginLeft = L.ml || "0"; if (!cobre()) return; } };
    const atualizar = () => { b.classList.toggle("some", window.scrollY < 80 && (CFG.naInicio ? !!CFG.naInicio() : true)); posicionar(); };
    window.addEventListener("scroll", atualizar, { passive: true });
    document.addEventListener("click", () => setTimeout(atualizar, 150), true);
    setInterval(atualizar, 800);
    atualizar();
  }

  /* 4) Botão "🖼️ Galeria": quando o único botão de foto do grupo usa um campo
     com capture, no tablet ele só abre a câmera. Este botão (com a mesma cara
     do botão do grupo) abre a galeria e entrega a foto ao mesmo campo.
     Uso: galeria: { depoisDe: "label.file-label", input: "#photoInput" } */
  function botaoGaleria() {
    const g = CFG.galeria;
    if (!g) return;
    const ref = document.querySelector(g.depoisDe), input = document.querySelector(g.input);
    if (!ref || !input || document.querySelector(".fp-galeria")) return;
    const b = document.createElement("button");
    b.type = "button";
    b.className = (g.classe != null ? g.classe : ref.className) + " fp-galeria";
    b.textContent = g.texto || "🖼️ Galeria";
    b.addEventListener("click", e => {
      e.preventDefault();
      FichaPokedex.escolherArquivo(arquivo => {
        const dt = new DataTransfer();
        dt.items.add(arquivo);
        input.files = dt.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    ref.insertAdjacentElement("afterend", b);
    // sem flex/grid no pai, os botões ficariam grudados
    if (!/flex|grid/.test(getComputedStyle(ref.parentElement).display)) b.style.marginLeft = "8px";
  }

  /* Mostra de novo o resultado antigo do front (ex.: para usar um minigame
     que o grupo colocou lá dentro) e rola a tela até o elemento pedido. */
  function mostrarFront(seletor) {
    document.documentElement.classList.remove("fp-esconder");
    const el = seletor && document.querySelector(seletor);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }
  /* Ao começar uma nova identificação, o resultado antigo volta a ficar escondido. */
  document.addEventListener("change", e => { if (e.target && e.target.type === "file") document.documentElement.classList.toggle("fp-esconder", CFG.esconder.length > 0); }, true);

  window.PokedexAdaptador = { itensDoBioma, fichaSalva: fichaPeloNome, salvarNoAlbumComum: info => salvarNoAlbumComum(info || ultimaFicha()), iniciar, mostrarFront, grupo: GRUPO, lerAlbum, desenharAlbum: desenharAlbumComum, ultimaFicha, abrirFicha };
})();
