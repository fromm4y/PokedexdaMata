// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t1-maria
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 1: "biólogo marinho" virou "um biólogo marinho especialista em peixes do Brasil", para a IA saber o tema.
//   - Missão 3: o grupo escreveu 76 no número e "67" no porquê; ficou o 76.
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji, para fazer sentido para quem lê (as palavras são as do grupo).
//   - Missão 6: a primeira frase estava em branco; ficou o "uhuuu" do grupo + o nome do peixe.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "AquaDex",
  integrantes: "Maria, Mateus e Raul",
  escola: "Camisão",
  turma: "Turma 1",
  tema: "Peixes do Brasil",
  pendencias: []
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um biólogo marinho especialista em peixes do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "peixes";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "67"
const CERTEZA_MINIMA = 76;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "🐟 Não é isso! Use uma foto ou imagem.";
  if (foto.size > 10000000) return "🐋 Grande demais! Use uma foto menor.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Desculpe, estou em dúvida: só " + r.confianca + "% de certeza. Tente explicar de outro jeito, com outra foto!";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🐠 Uhuuuuu! Estou confiante: é " + r.nome_popular + "!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
