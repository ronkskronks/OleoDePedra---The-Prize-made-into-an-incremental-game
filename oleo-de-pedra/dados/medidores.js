// ============================================================
//  MEDIDORES  (barras que sobem sozinhas e têm consequência)
//
//  Um medidor vai de 0 a 100. Ele não é um recurso: não se gasta nem
//  se vende. Serve para o jogo reagir ao que o jogador virou.
//
//    identificador: {
//      nome: 'Nome na tela',
//      descricao: 'Aparece ao passar o mouse',
//      requer: { tecnologias: ['truste'] },   // quando começa a contar
//      ate: { eventos: ['desmembramento'] },  // quando para e some (opcional)
//
//      cresce: [          // cada linha que estiver valendo soma a sua taxa (por segundo)
//        { taxa: 0.004 },                                       // sempre
//        { quando: { fatia: { querosene: 0.5 } }, taxa: 0.004 }, // só com metade do mercado
//      ],
//      cai: 0.001,        // quanto desce sozinho por segundo (opcional)
//    },
//
//  Como o resto do jogo conversa com um medidor:
//    - requisito:   requer: { medidores: { atencao: 50 } }     (chegou a 50)
//    - empurrão:    move: { atencao: -3 }     em ação, evento ou escolha
//    - acelerador:  bonus/efeito: { medidor: { atencao: 2 } }  (sobe 2x mais rápido)
// ============================================================

JOGO.medidores = {

  atencao: {
    nome: 'Atenção pública',
    descricao: 'Quanto os jornais, os tribunais e o Congresso estão de olho em você. Quanto maior a sua fatia do mercado, mais depressa sobe.',
    requer: { tecnologias: ['truste'] },
    ate: { eventos: ['desmembramento'] },
    cresce: [
      { taxa: 0.004 },
      { quando: { fatia: { querosene: 0.5 } }, taxa: 0.004 },
      { quando: { fatia: { querosene: 0.75 } }, taxa: 0.004 },
      { quando: { fatia: { querosene: 0.9 } }, taxa: 0.004 },
    ],
  },

};
