// ============================================================================
//  AS 6 MISSÕES DO GRUPO  —  o back-end deste grupo
// ============================================================================
//  Cópia do documento "Meu Back-End — Pokédex" que o grupo preencheu. O resto
//  do back-end (as chaves da IA, o revezamento, a conversa com o Google) mora
//  em api/identificar.js e é igual para todos.
//
//  Para conferir se ficou certo depois de publicar, abra no navegador:
//    https://SEU-PROJETO.vercel.app/api/identificar?grupo=camisao-t2-bryan
//
//  Ajustes feitos pela professora (o resto é como o grupo escreveu):
//   - Missões 1, 2 e 4: só correções de digitação ("frulticultor especilista", "a a a imagem").
//   - O álbum guardava a foto em tamanho original e enchia o espaço do navegador: agora guarda uma versão menor.
//   - Corrigido um erro do front: a variável lastDiscovery nunca era criada, então o botão "🗺️ Ver no mapa" não funcionava.
//   - Em branco no documento (usada a mensagem do exemplo; completar com o grupo): Missão 4 (a mensagem de foto grande não fala do tamanho), Missão 5, Missão 6.
// ============================================================================

// Quem é o grupo (aparece no painel)
const GRUPO = {
  nome: "As Frutas",
  integrantes: "Ana e Bryan",
  escola: "Camisão",
  turma: "Turma 2",
  tema: "Frutas do Brasil",
  pendencias: ["Missão 4 (a mensagem de foto grande não fala do tamanho)", "Missão 5", "Missão 6"]
};

// Missão 1: quem a IA vai fingir ser
const ESPECIALISTA = "um fruticultor especialista em frutas brasileiras";

// Missão 2: o que procurar na foto
const O_QUE_PROCURAR = "frutas brasileiras";

// Missão 3: quanta certeza a IA precisa ter (número de 0 a 100, sem aspas)
// Por que o grupo escolheu: "por que eu quis"
const CERTEZA_MINIMA = 70;

// Missão 4: o porteiro
function conferirFoto(foto) {
  if (!foto.type.startsWith("image/")) return "n foi possivel carregar a imagem";
  if (foto.size > 10000000) return "imagem n encontrada na verificação";
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
