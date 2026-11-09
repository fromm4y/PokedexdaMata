// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t1m-nickolas
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 4: a mensagem de foto grande falava de "erro ao analisar"; virou aviso de foto grande (com as palavras do grupo).
//   - Missão 5: o "80" estava grudado no r.confianca (quebrava o código); saiu, e a frase ganhou o "%".
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, espaços e um emoji (as palavras são as do grupo).
//   - Front: as abas, a câmera ao vivo (tirar, tirar outra, usar esta foto) e os favoritos das fotos foram ligados, como o prompt do grupo pedia.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "The Winners",
  integrantes: "Nickolas e Enzo",
  escola: "Adherbal",
  turma: "Turma 1 - M",
  tema: "Animais da savana",
  pendencias: []
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um zoólogo especialista em animais da savana";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "animais da savana";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "porque abaixo de 80 não tenho certeza"
const CERTEZA_MINIMA = 80;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Opa, errou de lugar: isso não é uma foto!";
  if (foto.size > 10000000) return "🐘 Eita, essa foto é grande demais para analisar! Por favor, mande outra foto.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Eu só tenho " + r.confianca + "% de certeza. Por favor, meu amigo, me mande outra foto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Que daora, você encontrou um(a) " + r.nome_popular + "! Que demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
