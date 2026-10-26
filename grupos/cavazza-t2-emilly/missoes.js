// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=cavazza-t2-emilly
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - O grupo não entregou o documento do back-end: as 6 missões foram preenchidas pela professora, seguindo a ideia do app (a elfa especialista em flores).
//   - Front usado: Dattflower_nova_versao_ajustada.html (a versão mais nova).
//   - O histórico guardava a foto em tamanho original e enchia o espaço do navegador: agora guarda uma versão menor.
//   - Em branco no documento (usada a mensagem do exemplo; completar com o grupo): Missão 1, Missão 2, Missão 3, Nome do grupo e integrantes, Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Dattflower",
  integrantes: "Emilly",
  escola: "Cavazza",
  turma: "Turma 2",
  tema: "Flores",
  pendencias: ["Missão 1", "Missão 2", "Missão 3", "Nome do grupo e integrantes", "Missão 4 (mensagem de não é foto)", "Missão 4 (mensagem de foto grande)", "Missão 5", "Missão 6"]
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "uma elfa especialista em flores";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "flores";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "(definido pela professora: o próprio app do grupo só mostra resultado a partir de 60% e avisa quando fica abaixo de 80%)"
const CERTEZA_MINIMA = 60;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Isso não é uma foto!";
  if (foto.size > 10000000) return "🐘 Foto grande demais! Escolha outra.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Tenho só " + r.confianca + "% de certeza. Tenta outra foto, mais de perto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Achei! É " + r.nome_popular + "! Que demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
