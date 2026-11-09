// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t2m-arthur
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 1: "um ornitólogo especialista aves do brasil" ganhou o "em".
//   - Missão 5: o "65%" e o "(65)" estavam escritos na frase (quebrava o código); o número agora vem do r.confianca e a frase ganhou "Tente outra foto!".
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação e um emoji (as palavras são as do grupo).
//   - Front: o pedido à IA aceitava só arara, tucano, coruja ou águia; agora aceita qualquer ave do Brasil (como na Missão 2). Ganhou botão de galeria e a ficha no álbum.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Poké Aves Brasileiras",
  integrantes: "Ricardo, Arthur, Yuri, Alice e Anthony",
  escola: "Adherbal",
  turma: "Turma 2 - M",
  tema: "Aves do Brasil",
  pendencias: []
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um ornitólogo especialista em aves do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves do Brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "" (em branco)
const CERTEZA_MINIMA = 65;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Erro! Esse arquivo não é uma imagem.";
  if (foto.size > 10000000) return "🐘 Foto grande demais! Tente enviar uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Eu tenho só " + r.confianca + "% de certeza. Tente outra foto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Que massa, é um(a) " + r.nome_popular + "! Que demais!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
