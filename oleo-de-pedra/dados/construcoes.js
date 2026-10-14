// ============================================================
//  CONSTRUÇÕES  (o que o jogador compra e que trabalha sozinho)
//
//    identificador: {
//      nome: 'Nome na tela',
//      descricao: 'Frase de ambientação',
//
//      custo: { dinheiro: 40 },   // preço da PRIMEIRA unidade
//      aumento: 1.35,             // cada unidade custa 1,35x a anterior
//                                 // (fórmula: custo x aumento ^ quantidade)
//
//      produz:   { petroleo: 0.4 },   // gera por segundo, por unidade
//      consome:  { petroleo: 0.5 },   // gasta por segundo, por unidade
//      vende:    { petroleo: 0.5 },   // vende por segundo, ao preço do mercado
//      armazena: { petroleo: 25 },    // aumenta o limite do recurso
//
//      requer: { tecnologias: ['perfuracao'] },   // veja dados/acoes.js
//
//      // --- só para o que se esgota (poços, campos) ---
//      esgota: {
//        reserva: 500,      // quanto cada unidade tem para dar, em média
//        variacao: 0.5,     // sorteio ao construir: 0.5 = de 50% a 150% da média
//        seco: 0.1,         // chance de pagar e não achar nada (0.1 = 10%)
//        abandono: 0.1,     // com 10% da reserva, a unidade é abandonada e some
//        avisoSeco: 'Texto do diário quando não acha nada.',          // opcional
//        avisoAbandono: 'Texto do diário quando a unidade se esgota.', // opcional
//      },
//    },
//
//  Use só as linhas de que precisar. Os efeitos mostrados na tela
//  são escritos sozinhos a partir destes números.
//
//  Quem "consome" ou "vende" ganha botões de − e + para o jogador
//  desligar e religar unidades. Se faltar insumo, a construção
//  trabalha mais devagar em vez de parar de vez.
//
//  Quem tem "esgota" produz cada vez menos: uma unidade com metade da
//  reserva produz metade. Quando é abandonada, a quantidade diminui e
//  a próxima fica mais barata. Se não houver onde guardar o produto,
//  a unidade espera e a reserva não é gasta.
// ============================================================

JOGO.construcoes = {

  barril: {
    nome: 'Barris de uísque',
    descricao: 'Não existe barril de petróleo ainda. Serve o que tiver na vila.',
    custo: { dinheiro: 8 },
    aumento: 1.15,
    armazena: { petroleo: 25 },
  },

  gabinete: {
    nome: 'Gabinete de química',
    descricao: 'Uma bancada, vidraria e alguém pago para pensar no assunto.',
    custo: { dinheiro: 25 },
    aumento: 1.4,
    produz: { conhecimento: 0.1 },
    armazena: { conhecimento: 50 },
    requer: { recursos: { conhecimento: 5 } },
  },

  poco: {
    nome: 'Torre de perfuração',
    descricao: 'Torre de madeira, broca de ferro e uma máquina a vapor batendo dia e noite.',
    custo: { dinheiro: 40 },
    aumento: 1.35,
    produz: { petroleo: 0.4 },
    // Os poços de Oil Creek jorravam e minguavam em meses. Pithole foi
    // de 15 mil habitantes a cidade-fantasma em pouco mais de um ano.
    esgota: {
      reserva: 300,
      variacao: 0.5,
      seco: 0.1,
      abandono: 0.1,
      avisoSeco: 'Furo seco. A broca desceu, o dinheiro também, e não subiu nada.',
      avisoAbandono: 'Um poço minguou até não pagar a lenha da caldeira. A torre foi abandonada.',
    },
    requer: { tecnologias: ['perfuracao'] },
  },

  carroceiros: {
    nome: 'Carroceiros',
    descricao: 'Levam os barris pela lama até a ferrovia e vendem pelo preço do dia.',
    custo: { dinheiro: 60 },
    aumento: 1.3,
    vende: { petroleo: 0.5 },
    requer: { tecnologias: ['frete'] },
  },

  alambique: {
    nome: 'Alambique de refino',
    descricao: 'Ferve o óleo bruto e separa o querosene para os lampiões.',
    custo: { dinheiro: 150, petroleo: 40 },
    aumento: 1.4,
    consome: { petroleo: 0.5 },
    produz: { querosene: 0.3 },
    requer: { tecnologias: ['destilacao'] },
  },

  deposito: {
    nome: 'Depósito de latas',
    descricao: 'Querosene enlatado, empilhado e pronto para seguir viagem.',
    custo: { dinheiro: 50 },
    aumento: 1.2,
    armazena: { querosene: 30 },
    requer: { tecnologias: ['destilacao'] },
  },

  mascates: {
    nome: 'Mascates de querosene',
    descricao: 'Vendem a "nova luz" de porta em porta, cidade por cidade.',
    custo: { dinheiro: 120 },
    aumento: 1.3,
    vende: { querosene: 0.25 },
    requer: { construcoes: { alambique: 1 } },
  },

  // ---------- capítulo 2: a Standard Oil ----------

  refinaria: {
    nome: 'Refinaria',
    descricao: 'Fábrica de verdade, com fornalhas em fila. Comprar a de um rival costuma sair mais em conta do que erguer a sua.',
    custo: { dinheiro: 2500 },
    aumento: 1.5,
    consome: { petroleo: 1.5 },
    produz: { querosene: 1 },
    requer: { tecnologias: ['standard'] },
  },

  compradores: {
    nome: 'Compradores de bruto',
    descricao: 'Agentes na região do óleo que compram direto do produtor. Você paga em dinheiro vivo.',
    custo: { dinheiro: 500 },
    aumento: 1.3,
    consome: { dinheiro: 1.5 },
    produz: { petroleo: 1 },
    requer: { tecnologias: ['standard'] },
  },

  tanque: {
    nome: 'Tanques de ferro',
    descricao: 'Reservatórios do tamanho de uma casa. Barril é coisa do passado.',
    custo: { dinheiro: 300 },
    aumento: 1.2,
    armazena: { petroleo: 400 },
    requer: { tecnologias: ['standard'] },
  },

  armazem: {
    nome: 'Armazém de querosene',
    descricao: 'Barris azuis empilhados até o teto, esperando o trem.',
    custo: { dinheiro: 400 },
    aumento: 1.25,
    armazena: { querosene: 300 },
    requer: { tecnologias: ['standard'] },
  },

  agentes: {
    nome: 'Agentes de venda',
    descricao: 'Uma rede própria de atacadistas, cidade por cidade, vendendo só o seu querosene.',
    custo: { dinheiro: 600 },
    aumento: 1.25,
    vende: { querosene: 1 },
    requer: { tecnologias: ['standard'] },
  },

  // ---------- capítulo 3: o Truste ----------

  laboratorio: {
    nome: 'Laboratório',
    descricao: 'Químicos de carreira, pagos para resolver problemas que ainda não apareceram.',
    custo: { dinheiro: 8000 },
    aumento: 1.4,
    produz: { conhecimento: 0.5 },
    armazena: { conhecimento: 500 },
    requer: { tecnologias: ['truste'] },
  },

  // ---------- capítulo 4: as irmãs e as guerras ----------

  craqueamento: {
    nome: 'Unidade de craqueamento',
    descricao: 'Calor e pressão quebram as moléculas pesadas do óleo. Do mesmo barril sai o dobro de gasolina.',
    custo: { dinheiro: 15000 },
    aumento: 1.15,
    consome: { petroleo: 2 },
    produz: { gasolina: 1.2 },
    requer: { tecnologias: ['burton'] },
  },

  tanque_gasolina: {
    nome: 'Tanques de gasolina',
    descricao: 'Longe de qualquer fagulha, com um vigia que não fuma.',
    custo: { dinheiro: 3000 },
    aumento: 1.2,
    armazena: { gasolina: 500 },
    requer: { tecnologias: ['burton'] },
  },

  postos: {
    nome: 'Postos de gasolina',
    descricao: 'Uma bomba na calçada, um toldo, um frentista de uniforme e a sua marca num letreiro que se vê de longe.',
    custo: { dinheiro: 8000 },
    aumento: 1.15,
    vende: { gasolina: 1.5 },
    requer: { tecnologias: ['posto'] },
  },

  centro_pesquisa: {
    nome: 'Centro de pesquisa',
    descricao: 'Prédios inteiros de químicos e engenheiros. A companhia passa a inventar por encomenda.',
    custo: { dinheiro: 60000 },
    aumento: 1.4,
    produz: { conhecimento: 2 },
    armazena: { conhecimento: 3000 },
    requer: { tecnologias: ['tubo_tanque'] },
  },

  campo_texas: {
    nome: 'Campo no Texas',
    descricao: 'Terra arrendada, sonda rotativa e um geólogo dizendo onde furar. Nem sempre ele acerta.',
    custo: { dinheiro: 50000 },
    aumento: 1.25,
    produz: { petroleo: 8 },
    esgota: {
      reserva: 150000,
      variacao: 0.5,
      seco: 0.2,
      abandono: 0.1,
      avisoSeco: 'Texas: três meses de sonda e só saiu água salgada. O arrendamento fica para o próximo otimista.',
      avisoAbandono: 'Um campo do Texas chegou ao fim. Ficam as bombas enferrujando no pasto.',
    },
    requer: { tecnologias: ['humble'] },
  },

  campo_mexico: {
    nome: 'Concessão no México',
    descricao: 'A "Faixa de Ouro", perto de Tampico: poços que jorram como poucos no mundo, num país em revolução.',
    custo: { dinheiro: 120000 },
    aumento: 1.3,
    produz: { petroleo: 15 },
    esgota: {
      reserva: 250000,
      variacao: 0.5,
      seco: 0.2,
      abandono: 0.1,
      avisoSeco: 'México: o poço deu água salgada. Dizem que a Faixa de Ouro está se afogando.',
      avisoAbandono: 'Um campo mexicano foi invadido pela água salgada e abandonado.',
    },
    requer: { tecnologias: ['mexico'] },
  },

  campo_venezuela: {
    nome: 'Concessão na Venezuela',
    descricao: 'Torres fincadas dentro do lago de Maracaibo. O ditador Gómez assina as concessões; o óleo sai em barcaças.',
    custo: { dinheiro: 250000 },
    aumento: 1.3,
    produz: { petroleo: 25 },
    esgota: {
      reserva: 600000,
      variacao: 0.5,
      seco: 0.3,
      abandono: 0.1,
      avisoSeco: 'Venezuela: meses de selva, febre e sonda, e nada. Outras companhias já gastaram fortunas aqui sem achar uma gota.',
      avisoAbandono: 'Um campo venezuelano se esgotou.',
    },
    requer: { tecnologias: ['venezuela'] },
  },

  lobistas: {
    nome: 'Advogados e lobistas',
    descricao: 'Os melhores que o dinheiro compra, em cada capital de estado e em Washington.',
    custo: { dinheiro: 5000 },
    aumento: 1.6,
    consome: { dinheiro: 5 },
    produz: { influencia: 0.03 },
    requer: { tecnologias: ['truste'] },
  },

};
