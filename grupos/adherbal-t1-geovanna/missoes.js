// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t1-geovanna
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Em branco no documento (usada a mensagem do exemplo; completar com o grupo): Missão 4 (mensagem de não é foto), Missão 4 (mensagem de foto grande), Missão 5.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Asas do Brasil",
  integrantes: "Geovanna, Geovana, Alberto e Daniel",
  escola: "Adherbal",
  turma: "Turma 1",
  tema: "Aves do Brasil",
  pendencias: ["Missão 4 (mensagem de não é foto)", "Missão 4 (mensagem de foto grande)", "Missão 5"]
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: ""
const CERTEZA_MINIMA = 50;

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
  return "Boa! " + r.nome_popular + " Que bom";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
