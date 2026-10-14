// ============================================================
//  RECURSOS  (as commodities do jogo)
//
//  Cada recurso é um bloco assim:
//
//    identificador: {
//      nome: 'Nome que aparece na tela',
//      inicial: 0,        // quanto o jogador tem ao começar
//      limite: 20,        // quanto cabe sem armazém (apague a linha = sem limite)
//      visivel: true,     // aparece desde o começo (senão, só quando tiver algum)
//
//      // --- só para o que é vendido no mercado ---
//      preco: 1.00,         // preço "normal", para onde o mercado tende a voltar
//      volatilidade: 0.05,  // quanto o preço sacode sozinho (0 = parado)
//      pressao: 0.002,      // quanto cada unidade vendida derruba o preço
//      recuperacao: 0.02,   // velocidade com que o preço volta ao normal
//      precoMin: 0.10,      // piso do preço
//      precoMax: 10.00,     // teto do preço
//
//      // --- só para recurso de "legado" (o que fica para sempre) ---
//      multiplica: { producao: 0.02 },   // cada unidade guardada dá +2% em toda a produção
//    },
//
//  O identificador (antes dos dois-pontos) é o nome interno: sem
//  espaço, sem acento. É ele que você usa nos outros arquivos.
// ============================================================

JOGO.recursos = {

  dinheiro: {
    nome: 'Dólares',
    inicial: 5,
    visivel: true,
  },

  petroleo: {
    nome: 'Petróleo bruto',
    inicial: 0,
    limite: 20,
    visivel: true,
    // Em 1861 o barril foi de 10 dólares a 10 centavos no mesmo ano:
    // por isso a volatilidade alta e a faixa de preço bem larga.
    preco: 1.00,
    volatilidade: 0.05,
    pressao: 0.002,
    recuperacao: 0.02,
    precoMin: 0.10,
    precoMax: 10.00,
  },

  querosene: {
    nome: 'Querosene',
    inicial: 0,
    limite: 10,
    preco: 4.00,
    volatilidade: 0.02,
    pressao: 0.001,
    recuperacao: 0.02,
    precoMin: 1.00,
    precoMax: 12.00,
  },

  // Até os anos 1900 a gasolina era resto de refino, jogada fora. Por
  // isso o preço normal começa quase em zero: quem sobe o preço são os
  // eventos e as tecnologias do capítulo 4 (o automóvel).
  gasolina: {
    nome: 'Gasolina',
    inicial: 0,
    limite: 200,
    preco: 1.00,
    volatilidade: 0.02,
    pressao: 0.0005,
    recuperacao: 0.02,
    precoMin: 0.10,
    precoMax: 40.00,
  },

  conhecimento: {
    nome: 'Conhecimento',
    inicial: 0,
    limite: 50,
    visivel: true,
  },

  influencia: {
    nome: 'Influência',
    inicial: 0,
    limite: 100,
  },

  // O que sobra do desmembramento de 1911: um pedaço de cada empresa
  // que saiu da Standard. Nunca se perde.
  acoes: {
    nome: 'Ações das sucessoras',
    inicial: 0,
    multiplica: { producao: 0.02 },
  },

};
