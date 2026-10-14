// ============================================================
//  AÇÕES  (botões que o jogador clica à mão)
//
//    identificador: {
//      nome: 'Texto do botão',
//      descricao: 'Frase que aparece embaixo',
//      ganha: { petroleo: 1 },     // o que cada clique dá
//      gasta: { dinheiro: 2 },     // o que cada clique custa (opcional)
//      move: { atencao: -3 },      // empurra um medidor (veja dados/medidores.js)
//      requer: { ... },            // quando o botão aparece (opcional)
//    },
//
//  O "requer" funciona igual em ações, construções e tecnologias:
//
//      requer: {
//        tecnologias: ['perfuracao'],     // precisa ter pesquisado
//        construcoes: { poco: 1 },        // precisa ter pelo menos 1
//        recursos: { petroleo: 10 },      // precisa ter pelo menos 10
//      },
//
//  Depois que algo aparece na tela, não some mais.
// ============================================================

JOGO.acoes = {

  coletar: {
    nome: 'Coletar óleo na nascente',
    descricao: 'Torcer cobertores encharcados no óleo que mina do riacho.',
    ganha: { petroleo: 1 },
  },

  estudar: {
    nome: 'Estudar amostras',
    descricao: 'Queimar, cheirar e anotar. Para que serve isso, afinal?',
    ganha: { conhecimento: 1 },
  },

  abafar: {
    nome: 'Abafar o caso',
    descricao: 'Um jantar com o senador certo, um anúncio no jornal certo, um processo que anda mais devagar.',
    gasta: { influencia: 25 },
    move: { atencao: -3 },
    requer: { tecnologias: ['truste'] },
  },

};
