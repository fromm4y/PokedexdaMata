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

  function acoesFinais(info) {
    const lista = [];
    if (CFG.salvar) lista.push({ texto: "💾 Salvar no álbum", principal: true, aoClicar: () => CFG.salvar(info) });
    if (CFG.acoesExtras) lista.push(...(CFG.acoesExtras(info) || []));
    lista.push({ texto: "🔍 Reconhecer outra", principal: !CFG.salvar, aoClicar: () => CFG.novaFoto && CFG.novaFoto() });
    return lista;
  }
  const tentarOutra = () => [{ texto: "Tentar outra foto", principal: true, aoClicar: () => CFG.novaFoto && CFG.novaFoto() }];

  /* ---------- 1) a conversa com a IA vira pop-up ---------- */
  const fetchOriginal = window.fetch.bind(window);
  window.fetch = async function (url, opt) {
    if (!ehIdentificar(url) || !opt || String(opt.method || "GET").toUpperCase() !== "POST" || typeof opt.body !== "string") {
      return fetchOriginal(url, opt);
    }
    let pedido;
    try { pedido = JSON.parse(opt.body); } catch (e) { return fetchOriginal(url, opt); }
    pedido.grupo = pedido.grupo || GRUPO;
    if (ultimoArquivo) { pedido.tipo = ultimoArquivo.type || "application/octet-stream"; pedido.tamanho = ultimoArquivo.size; }
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
    if (info.fora_do_tema) {
      FichaPokedex.aviso({ tipo: "fora", texto: info.mensagem_backend, acoes: tentarOutra() });
    } else if (!info.identificado) {
      FichaPokedex.aviso({ tipo: "duvida", texto: info.mensagem_backend || "Não consegui ter certeza. Tente uma foto mais nítida.", acoes: tentarOutra() });
    } else {
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
      parte.text = JSON.stringify(paraFront);
      return new Response(JSON.stringify(dados), { status: 200, headers: { "Content-Type": "application/json" } });
    }
    return resp;
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
      escuro: CFG.escuro, claro: CFG.claro || {}, noturno: CFG.noturno || {}
    });
    if (CFG.esconder.length) {
      const s = document.createElement("style");
      s.textContent = CFG.esconder.map(x => "html.fp-esconder " + x).join(",") + "{display:none!important}";
      document.head.appendChild(s);
      document.documentElement.classList.add("fp-esconder");
    }
    const pronto = () => { ligarWebcams(); FichaPokedex.trocarFotos(); };
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", pronto); else pronto();
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

  window.PokedexAdaptador = { iniciar, mostrarFront, grupo: GRUPO };
})();
