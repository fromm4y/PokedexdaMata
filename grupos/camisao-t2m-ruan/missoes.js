// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t2m-ruan
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 1: "biólogo Especialista em Aves" ganhou o "um" e o tema do grupo (aves do mundo todo).
//   - Missão 2: "Aves do mundo" virou "aves", para a mensagem de fora do tema ficar natural.
//   - Missão 4: a mensagem de foto grande estava só com "10000"; foi escrita pela professora.
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji (as palavras são as do grupo).
//   - O front chegou em .docx (o código se perdeu): a página foi remontada a partir dos textos, das cores e da foto do documento.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Mata Grande",
  integrantes: "Miguel e Ruan",
  escola: "Camisão",
  turma: "Turma 2 - M",
  tema: "Aves do mundo todo",
  pendencias: []
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um biólogo especialista em aves do mundo todo";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "aves";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "" (em branco)
const CERTEZA_MINIMA = 70;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Não é possível arquivar outro tipo de arquivo: mande uma foto!";
  if (foto.size > 10000000) return "🐘 Foto grande demais! Escolha uma menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Não tive certeza: só " + r.confianca + "%. Tente outra foto da ave!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🐦 Achei! O animal é " + r.nome_popular + ". Que legal!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
