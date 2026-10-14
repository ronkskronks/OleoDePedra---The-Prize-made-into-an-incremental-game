// ============================================================
//  RIVAIS  (as outras empresas do ramo)
//
//  Cada rival fabrica um produto e ocupa um pedaço do mercado. A sua
//  FATIA é: o que você consegue produzir, dividido pelo que você e
//  todos os rivais ainda de pé produzem juntos. Comprar um rival tira
//  ele da conta e põe as fábricas dele na sua.
//
//    identificador: {
//      nome: 'Nome da empresa',
//      descricao: 'Frase que aparece ao passar o mouse',
//      produto: 'querosene',        // o recurso que ele fabrica
//      tamanho: 2,                  // quanto ele produz por segundo
//
//      custo: { dinheiro: 6000 },   // preço para comprar
//      entrega: { refinaria: 2 },   // construções que passam a ser suas
//      efeito: {                    // multiplicadores para sempre, depois de comprado
//        preco: { querosene: 1.05 },   // (os mesmos tipos de bônus das tecnologias)
//      },
//      diario: 'Texto do diário quando você compra.',
//
//      requer: { tecnologias: ['standard'] },   // quando ele aparece na tela
//      surge: { eventos: ['spindletop'] },      // só passa a EXISTIR depois disso (opcional);
//                                               // antes, nem entra na conta da fatia
//    },
//
//  Rival sem "custo" não está à venda: só ocupa mercado.
//
//  A fatia serve de requisito em qualquer "requer" do jogo:
//      requer: { fatia: { querosene: 0.5 } }    // ter metade do mercado
//
//  Uma tecnologia pode baratear as compras:
//      bonus: { aquisicao: { querosene: 0.75 } }   // rivais de querosene 25% mais baratos
//
//  ATENÇÃO: nomes, datas e textos escritos de memória. Confira com o livro.
// ============================================================

JOGO.rivais = {

  // ---------- Cleveland, 1872 ----------

  hanna: {
    nome: 'Hanna, Baslington & Co.',
    descricao: 'Refinaria pequena de Cleveland. Os donos acham que valem mais do que você oferece.',
    produto: 'querosene',
    tamanho: 1,
    custo: { dinheiro: 2500 },
    entrega: { refinaria: 1 },
    efeito: { preco: { querosene: 1.03 } },
    diario: 'Os Hanna resistiram, viram os livros da Standard e entenderam que não havia como competir com aqueles fretes. Venderam.',
    requer: { tecnologias: ['standard'] },
  },

  westlake: {
    nome: 'Westlake, Hutchins & Co.',
    descricao: 'Outra refinaria de Cleveland, apertada entre o preço do bruto e o do frete.',
    produto: 'querosene',
    tamanho: 1,
    custo: { dinheiro: 3000 },
    entrega: { refinaria: 1 },
    efeito: { preco: { querosene: 1.03 } },
    diario: 'Mais uma refinaria de Cleveland troca de dono sem trocar de placa. Pouca gente fica sabendo de quem ela é agora.',
    requer: { tecnologias: ['standard'] },
  },

  scofield: {
    nome: 'Alexander, Scofield & Co.',
    descricao: 'Refinadores antigos de Cleveland. Dinheiro ou ações da Standard: eles que escolham.',
    produto: 'querosene',
    tamanho: 2,
    custo: { dinheiro: 6000 },
    entrega: { refinaria: 2 },
    efeito: { preco: { querosene: 1.05 } },
    diario: 'A oferta era sempre a mesma: dinheiro na mão ou ações da Standard. Rockefeller aconselhava as ações. Quem ouviu ficou rico.',
    requer: { tecnologias: ['standard'] },
  },

  clark_payne: {
    nome: 'Clark, Payne & Co.',
    descricao: 'A maior concorrente de Cleveland. Se ela vier, as outras vêm atrás.',
    produto: 'querosene',
    tamanho: 3,
    custo: { dinheiro: 10000 },
    entrega: { refinaria: 3 },
    efeito: { preco: { querosene: 1.06 } },
    diario: 'Clark, Payne & Co., a maior rival da cidade, entra para a Standard. Em poucas semanas de 1872, quase todas as refinarias de Cleveland mudaram de mão. Chamaram aquilo de "o Massacre de Cleveland".',
    requer: { tecnologias: ['descontos'] },
  },

  // ---------- o resto do país, 1874 em diante ----------

  camden: {
    nome: 'J. N. Camden & Co.',
    descricao: 'Refinador da Virgínia Ocidental, dono do tráfego do rio Ohio.',
    produto: 'querosene',
    tamanho: 3,
    custo: { dinheiro: 15000 },
    entrega: { refinaria: 3 },
    efeito: { preco: { querosene: 1.05 } },
    diario: 'Camden passa a comprar concorrentes na Virgínia Ocidental em segredo, com o dinheiro da Standard e o nome dele na porta.',
    requer: { tecnologias: ['alianca'] },
  },

  lockhart: {
    nome: 'Lockhart, Frew & Co.',
    descricao: 'Os maiores refinadores de Pittsburgh.',
    produto: 'querosene',
    tamanho: 4,
    custo: { dinheiro: 20000 },
    entrega: { refinaria: 4 },
    efeito: { preco: { querosene: 1.06 } },
    diario: 'Pittsburgh se junta à aliança. Lockhart fica encarregado de absorver as refinarias vizinhas, uma por uma.',
    requer: { tecnologias: ['alianca'] },
  },

  atlantic: {
    nome: 'Atlantic Refining',
    descricao: 'A grande refinaria da Filadélfia, com saída para o mar.',
    produto: 'querosene',
    tamanho: 4,
    custo: { dinheiro: 22000 },
    entrega: { refinaria: 4 },
    efeito: { preco: { querosene: 1.06 } },
    diario: 'A Filadélfia também é da Standard agora. O querosene americano sai para a Europa por portos que já não têm dono independente.',
    requer: { tecnologias: ['alianca'] },
  },

  pratt: {
    nome: 'Charles Pratt & Co.',
    descricao: 'Nova York. O querosene "Astral" de Pratt é marca conhecida no mundo inteiro.',
    produto: 'querosene',
    tamanho: 6,
    custo: { dinheiro: 35000 },
    entrega: { refinaria: 6 },
    efeito: { preco: { querosene: 1.08 } },
    diario: 'Charles Pratt entra para a Standard e traz junto um sócio jovem e briguento, Henry H. Rogers, que anos antes tinha liderado os refinadores de Nova York contra você.',
    requer: { tecnologias: ['alianca'], fatia: { querosene: 0.4 } },
  },

  tidewater: {
    nome: 'Tidewater Pipe Company',
    descricao: 'Produtores independentes que construíram um oleoduto de 170 km por cima das montanhas, só para escapar de você.',
    produto: 'querosene',
    tamanho: 4,
    custo: { dinheiro: 30000 },
    entrega: { refinaria: 4 },
    efeito: { preco: { querosene: 1.06 } },
    diario: 'A Tidewater provou que um oleoduto de longa distância funciona, e por um momento os independentes respiraram. A Standard respondeu construindo os seus e comprando participação na rival. Acabaram dividindo o mercado.',
    requer: { tecnologias: ['alianca'], fatia: { querosene: 0.6 } },
  },

  // ---------- gasolina, depois de 1911: as irmãs viraram concorrentes ----------

  indiana: {
    nome: 'Standard de Indiana',
    descricao: 'A ex-irmã do Meio-Oeste, dona da patente do craqueamento e da maior rede de postos do país. A lei proíbe juntar de novo o que o tribunal separou.',
    produto: 'gasolina',
    tamanho: 30,
    surge: { eventos: ['desmembramento'] },
  },

  socony: {
    nome: 'Standard de Nova York (Socony)',
    descricao: 'Ficou com os mercados do Nordeste e da Ásia, e com quase nenhum poço.',
    produto: 'gasolina',
    tamanho: 24,
    surge: { eventos: ['desmembramento'] },
  },

  socal: {
    nome: 'Standard da Califórnia (Socal)',
    descricao: 'Sozinha do outro lado das Montanhas Rochosas, com óleo próprio de sobra.',
    produto: 'gasolina',
    tamanho: 20,
    surge: { eventos: ['desmembramento'] },
  },

  gulf_gasolina: {
    nome: 'Gulf Oil (gasolina)',
    descricao: 'Foi a Gulf que abriu o primeiro posto de beira de rua, em Pittsburgh.',
    produto: 'gasolina',
    tamanho: 20,
    surge: { eventos: ['desmembramento'] },
  },

  texaco_gasolina: {
    nome: 'The Texas Company (gasolina)',
    descricao: 'A estrela vermelha da Texaco quer estar em todos os estados do país.',
    produto: 'gasolina',
    tamanho: 20,
    surge: { eventos: ['desmembramento'] },
  },

  shell: {
    nome: 'Shell',
    descricao: 'A Royal Dutch/Shell de Henri Deterding desembarca na Califórnia com gasolina de Sumatra, só para provar que pode.',
    produto: 'gasolina',
    tamanho: 28,
    surge: { eventos: ['shell_chega'] },
  },

  beacon: {
    nome: 'Beacon Oil',
    descricao: 'Refinaria e postos na Nova Inglaterra. Pequena o bastante para o governo não reclamar.',
    produto: 'gasolina',
    tamanho: 4,
    custo: { dinheiro: 150000 },
    entrega: { craqueamento: 2, postos: 2 },
    efeito: { preco: { gasolina: 1.03 } },
    diario: 'A Jersey compra a Beacon Oil e, com ela, bombas de gasolina na Nova Inglaterra. As ex-irmãs começam a invadir o território umas das outras.',
    requer: { tecnologias: ['tubo_tanque'] },
  },

  anglo_american: {
    nome: 'Anglo-American Oil',
    descricao: 'A antiga filial inglesa da Standard, que o tribunal mandou soltar em 1911. Vende gasolina em toda a Grã-Bretanha.',
    produto: 'gasolina',
    tamanho: 8,
    custo: { dinheiro: 300000 },
    entrega: { craqueamento: 3, postos: 4 },
    efeito: { preco: { gasolina: 1.05 } },
    diario: 'Quase vinte anos depois de separada à força, a Anglo-American volta para casa. A marca nas bombas inglesas é uma palavra inventada a partir de "S.O.": Esso.',
    requer: { tecnologias: ['chumbo'] },
  },

  // ---------- Texas, 1901: os que não estão à venda ----------

  gulf: {
    nome: 'Gulf Oil',
    descricao: 'Nascida em Spindletop com o dinheiro dos Mellon, banqueiros de Pittsburgh. Não deve nada a você e não vende.',
    produto: 'querosene',
    tamanho: 5,
    surge: { eventos: ['spindletop'] },
  },

  texaco: {
    nome: 'The Texas Company',
    descricao: 'Fundada por um ex-homem da Standard que saiu brigado. No Texas, a lei estadual mantém você do lado de fora.',
    produto: 'querosene',
    tamanho: 4,
    surge: { eventos: ['spindletop'] },
  },

};
