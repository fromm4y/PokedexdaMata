// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=adherbal-t2m-murilo
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missão 3: o nome da constante estava escrito "CERTEZA _ MÍNIMA" (quebrava o código); o número 67 é o do grupo.
//   - Missão 4: as duas mensagens estavam trocadas/incompletas ("Ops..isso não" e "isso não é uma foto" na foto grande); foram completadas com as palavras do grupo.
//   - Mensagens das missões: as frases do grupo ganharam acentos, pontuação, o "%" e um emoji (as palavras são as do grupo).
//   - Front: o quiz virou o "Desafio da Floresta" (pedido do Prompt.docx do grupo); as fotos dos cards agora são da espécie certa; câmera + galeria e álbum com as fotos.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "Floresta Unida",
  integrantes: "Murilo, Leonardo, Lucas e Enzo",
  escola: "Adherbal",
  turma: "Turma 2 - M",
  tema: "Animais do Brasil",
  pendencias: []
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um zoólogo especialista em animais do Brasil";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "animais do Brasil";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "" (em branco)
const CERTEZA_MINIMA = 67;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "📷 Ops... isso não é uma foto!";
  if (foto.size > 10000000) return "🐘 Nossa, que pesado! Essa foto é grande demais.";
  return "ok";
}

// Missão 5: quando a IA fica em dúvida
function mensagemDeDuvida(r) {
  return "🤔 Ohh, só tenho " + r.confianca + "% de certeza.";
}

// Missão 6: quando a IA acerta
function mensagemDeAcerto(r) {
  return "🎉 Nossa, é um(a) " + r.nome_popular + "! Sensacional!";
}

// ----------------------------------------------------------------------------
//  DAQUI PARA BAIXO, NÃO MEXA. Esta linha entrega as missões para o
//  api/identificar.js usar.
// ----------------------------------------------------------------------------
module.exports = { GRUPO, ESPECIALISTA, O_QUE_PROCURAR, CERTEZA_MINIMA, conferirFoto, mensagemDeDuvida, mensagemDeAcerto };
