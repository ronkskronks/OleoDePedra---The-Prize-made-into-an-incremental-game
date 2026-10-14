// ============================================================
//  TECNOLOGIAS  (a linha do tempo da história)
//
//  É aqui que o livro vira jogo: cada marco histórico é um bloco.
//
//    identificador: {
//      nome: 'Nome na tela',
//      ano: 1859,                       // o calendário do jogo pula para este ano
//      descricao: 'Frase curta no cartão',
//      diario: 'Texto que entra no diário quando o jogador pesquisa.',
//
//      custo: { conhecimento: 20, dinheiro: 30 },
//      requer: { tecnologias: ['silliman'] },    // veja dados/acoes.js
//
//      concede: { dinheiro: 50 },       // presente único ao pesquisar (opcional)
//
//      bonus: {                         // multiplicadores permanentes (opcional)
//        producao:      { poco: 1.5 },        // construção produz 1,5x
//        armazenamento: { barril: 2 },        // construção armazena 2x
//        preco:         { petroleo: 1.2 },    // preço normal do recurso sobe 1,2x
//        reserva:       { poco: 1.5 },        // unidades NOVAS nascem com 1,5x de reserva
//                                             // (só para construção com "esgota")
//        mercado:       { querosene: 3 },     // o mercado aguenta 3x mais venda antes de o preço cair
//        aquisicao:     { querosene: 0.75 },  // rivais desse produto ficam 25% mais baratos
//        medidor:       { atencao: 1.25 },    // o medidor sobe 1,25x mais rápido
//      },
//    },
//
//  Para liberar uma construção ou ação com uma tecnologia, não se
//  mexe aqui: coloque  requer: { tecnologias: ['identificador'] }
//  lá na construção. A tela mostra "Libera: ..." sozinha.
// ============================================================

JOGO.tecnologias = {

  silliman: {
    nome: 'Relatório Silliman',
    ano: 1855,
    descricao: 'Encomendar a um professor de Yale uma análise do óleo de pedra.',
    diario: 'O professor Benjamin Silliman Jr. conclui que o óleo de pedra pode ser destilado em um excelente iluminante. Com o relatório na mão, os investidores de New Haven abrem a carteira.',
    custo: { conhecimento: 10 },
    concede: { dinheiro: 40 },
  },

  perfuracao: {
    nome: 'Perfuração de poços',
    ano: 1859,
    descricao: 'Furar o chão atrás de óleo, como se fura atrás de sal.',
    diario: 'Titusville, Pensilvânia, agosto de 1859: o "coronel" Edwin Drake encontra óleo a pouco mais de vinte metros de profundidade. Riram dele por meses. Agora o vale inteiro quer um pedaço de terra.',
    custo: { conhecimento: 20, dinheiro: 30 },
    requer: { tecnologias: ['silliman'] },
  },

  tubo: {
    nome: 'Tubo condutor',
    ano: 1859,
    descricao: 'Cravar um tubo de ferro antes da broca, para o furo não desabar.',
    diario: 'A ideia de Drake de perfurar por dentro de um tubo de ferro resolve o problema da água e do desmoronamento. Todo perfurador passa a copiar.',
    custo: { conhecimento: 35 },
    requer: { construcoes: { poco: 1 } },
    bonus: { producao: { poco: 1.5 } },
  },

  frete: {
    nome: 'Contratar carroceiros',
    ano: 1860,
    descricao: 'Pagar quem tem carroça e cavalo para escoar a produção.',
    diario: 'Milhares de carroceiros tomam conta das estradas de lama da região do óleo. Cobram o que querem, e você paga.',
    custo: { conhecimento: 30, dinheiro: 40 },
    requer: { construcoes: { poco: 2 } },
  },

  destilacao: {
    nome: 'Destilação de querosene',
    ano: 1861,
    descricao: 'Adaptar ao óleo de pedra o processo usado no óleo de carvão.',
    diario: 'O querosene de petróleo queima limpo e custa menos que o óleo de baleia. Refinarias brotam por todo lado, e o preço do bruto despenca e dispara ao sabor de cada poço novo.',
    custo: { conhecimento: 60, dinheiro: 80 },
    requer: { tecnologias: ['perfuracao'], construcoes: { poco: 3 } },
  },

  tanoaria: {
    nome: 'Tanoaria própria',
    ano: 1863,
    descricao: 'Fabricar os próprios barris, bem vedados, em vez de comprar usados.',
    diario: 'Barril bom vale mais que o óleo que vai dentro. Quem controla os barris controla o negócio.',
    custo: { conhecimento: 80, dinheiro: 100 },
    requer: { tecnologias: ['frete'] },
    bonus: { armazenamento: { barril: 2 } },
  },

  oleoduto: {
    nome: 'Oleoduto',
    ano: 1865,
    descricao: 'Bombear o óleo por tubos até a ferrovia, sem carroça nenhuma.',
    diario: 'Samuel Van Syckel inaugura o primeiro oleoduto que dá certo, ligando Pithole à ferrovia. Os carroceiros tentam destruí-lo. O frete cai e sobra mais dinheiro por barril.',
    custo: { conhecimento: 150, dinheiro: 400 },
    requer: { tecnologias: ['tanoaria'], construcoes: { carroceiros: 3 } },
    bonus: { preco: { petroleo: 1.3 } },
  },

  standard: {
    nome: 'Fundar a Standard Oil',
    ano: 1870,
    descricao: 'Juntar refinarias, barris e fretes debaixo de uma empresa só.',
    diario: 'Cleveland, 1870: John D. Rockefeller funda a Standard Oil Company. A era dos aventureiros acabou; começa a era da organização. Do outro lado da rua, e do país, há dezenas de refinarias iguais à sua. Olhe a aba Concorrência.',
    custo: { conhecimento: 300, dinheiro: 3000 },
    requer: { tecnologias: ['oleoduto', 'destilacao'], construcoes: { alambique: 3 } },
  },

  // ---------- capítulo 2: a Standard Oil ----------

  exportacao: {
    nome: 'Querosene para o mundo',
    ano: 1871,
    descricao: 'Vender em Londres, Bremen e Xangai o que não cabe nos lampiões americanos.',
    diario: 'Mais da metade do querosene americano já segue para o exterior. É o primeiro produto industrial que os Estados Unidos vendem ao mundo inteiro, e o mundo quer mais.',
    custo: { conhecimento: 300, dinheiro: 2000 },
    requer: { tecnologias: ['standard'] },
    bonus: { mercado: { querosene: 3 } },
  },

  descontos: {
    nome: 'Descontos secretos das ferrovias',
    ano: 1872,
    descricao: 'Garantir à ferrovia vagões cheios todo dia. Em troca, um frete que ninguém mais tem.',
    diario: 'As ferrovias devolvem à Standard, por baixo do pano, parte do frete que cobram. Pelo plano da South Improvement Company, devolveriam até parte do frete pago pelos concorrentes. Nenhum rival consegue vender ao seu preço.',
    custo: { conhecimento: 400, dinheiro: 3000 },
    requer: { tecnologias: ['standard'], construcoes: { refinaria: 1 } },
    // Negócio feito no escuro chama mais atenção quando vem à luz.
    bonus: { preco: { querosene: 1.15 }, aquisicao: { querosene: 0.75 }, medidor: { atencao: 1.25 } },
  },

  alianca: {
    nome: 'A aliança nacional',
    ano: 1874,
    descricao: 'O que deu certo em Cleveland pode dar certo em Pittsburgh, Filadélfia e Nova York.',
    diario: 'Em reuniões discretas em Saratoga, os maiores refinadores do país ouvem a proposta: juntar-se à Standard em vez de brigar com ela. As compras são mantidas em segredo; as firmas continuam com os nomes antigos.',
    custo: { conhecimento: 600, dinheiro: 8000 },
    requer: { tecnologias: ['descontos'], fatia: { querosene: 0.2 } },
  },

  coleta: {
    nome: 'Rede de oleodutos de coleta',
    ano: 1877,
    descricao: 'Ligar cada poço novo aos seus tanques antes que alguém mais chegue.',
    diario: 'A United Pipe Lines, da Standard, liga os poços da região às ferrovias. O produtor fura onde quiser; para tirar o óleo de lá, só há um cano, e é o seu.',
    custo: { conhecimento: 800, dinheiro: 12000 },
    requer: { tecnologias: ['alianca'] },
    bonus: { producao: { compradores: 1.5 } },
  },

  dominio: {
    nome: 'Noventa por cento',
    ano: 1879,
    descricao: 'Nove em cada dez barris de querosene do país passam pelas suas mãos.',
    diario: 'Em 1879, a Standard Oil controla cerca de noventa por cento do refino americano. Rockefeller tem quarenta anos. Falta dar uma forma legal a esse amontoado de empresas espalhadas por vários estados.',
    custo: { conhecimento: 1000, dinheiro: 20000 },
    requer: { fatia: { querosene: 0.9 } },
  },

  // ---------- capítulo 3: o Truste ----------

  truste: {
    nome: 'O Truste da Standard Oil',
    ano: 1882,
    descricao: 'Entregar as ações de todas as empresas a nove curadores, que mandam em tudo como se fosse uma só.',
    diario: 'Um advogado da casa encontra a saída: os donos de cada empresa entregam suas ações a um conselho de nove curadores e recebem certificados do Truste. No papel, dezenas de firmas independentes; na prática, uma só, dirigida de Nova York. A palavra "truste" vai virar palavrão. O país começa a prestar atenção em você.',
    custo: { conhecimento: 1000, dinheiro: 30000 },
    requer: { tecnologias: ['dominio'] },
    bonus: { producao: { refinaria: 1.25 } },
  },

  lima: {
    nome: 'O óleo azedo de Lima',
    ano: 1888,
    descricao: 'Comprar os campos de Ohio, cujo óleo fede a ovo podre, e apostar que alguém descobre como limpá-lo.',
    diario: 'O óleo de Lima, em Ohio, tem enxofre demais: o querosene sai fedendo e suja os lampiões. Ninguém quer. Rockefeller manda comprar assim mesmo, contra a diretoria, e contrata o químico alemão Herman Frasch. Dois anos depois Frasch resolve o problema, e a Standard, que só refinava, passa a ser dona de poços.',
    custo: { conhecimento: 1500, dinheiro: 40000 },
    requer: { tecnologias: ['truste'], construcoes: { laboratorio: 1 } },
    bonus: { producao: { compradores: 1.5 } },
  },

  holding: {
    nome: 'Standard Oil de Nova Jersey',
    ano: 1899,
    descricao: 'O tribunal de Ohio mandou desfazer o Truste. Nova Jersey permite que uma empresa seja dona de outras.',
    diario: 'Condenado em Ohio, o Truste se desfaz no papel e renasce como uma companhia de Nova Jersey, dona das ações de todas as outras. Mudou o nome na porta. Os homens na sala são os mesmos.',
    custo: { conhecimento: 2500, dinheiro: 60000 },
    requer: { tecnologias: ['lima'], eventos: ['sherman'] },
    bonus: { preco: { querosene: 1.1 } },
  },

  // ---------- capítulo 4: as irmãs e as guerras ----------

  burton: {
    nome: 'Craqueamento térmico',
    ano: 1913,
    descricao: 'Tirar mais gasolina de cada barril, quebrando o óleo pesado com calor e pressão.',
    diario: 'William Burton, químico da Standard de Indiana, insiste numa ideia que a antiga diretoria tinha proibido por medo de explodir a refinaria: aquecer o óleo sob pressão. Funciona, e dobra a gasolina tirada de cada barril. A patente é da sua ex-irmã; você paga a licença, como todo mundo.',
    custo: { conhecimento: 2500, dinheiro: 30000 },
    requer: { eventos: ['desmembramento'] },
  },

  posto: {
    nome: 'O posto de gasolina',
    ano: 1913,
    descricao: 'Parar de vender gasolina em lata no armazém e levar a bomba para a beira da rua.',
    diario: 'Até aqui, quem tinha automóvel comprava gasolina em lata, na mercearia ou na ferraria. Em Pittsburgh abre o primeiro posto feito só para isso, com bomba, cobertura e mapa de estradas de graça. Em dez anos haverá um em cada esquina do país.',
    custo: { conhecimento: 2000, dinheiro: 40000 },
    requer: { tecnologias: ['burton'] },
    bonus: { mercado: { gasolina: 3 } },
  },

  mexico: {
    nome: 'Entrar no México',
    ano: 1917,
    descricao: 'Comprar uma produtora na Faixa de Ouro. O óleo é farto; o país está em revolução.',
    diario: 'O México caminha para ser o segundo produtor de petróleo do mundo. A nova Constituição de 1917 diz que o subsolo pertence à nação, mas ninguém em Nova York acha que isso seja para valer.',
    custo: { conhecimento: 3000, dinheiro: 100000 },
    requer: { tecnologias: ['posto'] },
  },

  humble: {
    nome: 'Comprar a Humble Oil',
    ano: 1919,
    descricao: 'Você ficou com as refinarias e sem os poços. Uma produtora texana resolve isso.',
    diario: 'O desmembramento deixou a Jersey cheia de refinarias e quase sem óleo próprio. A saída é comprar metade da Humble, uma produtora do Texas tocada por gente que sabe achar petróleo. O estado do Texas, que odeia a Standard, só percebe depois.',
    custo: { conhecimento: 3000, dinheiro: 80000 },
    requer: { tecnologias: ['posto'], eventos: ['primeira_guerra'] },
  },

  tubo_tanque: {
    nome: 'Processo tubo-e-tanque',
    ano: 1920,
    descricao: 'Um craqueamento seu, contínuo, sem pagar licença a ninguém.',
    diario: 'A Jersey monta um departamento de pesquisa de verdade e desenvolve o próprio processo de craqueamento. Pela primeira vez, a companhia contrata cientistas antes de saber exatamente para quê.',
    custo: { conhecimento: 3500, dinheiro: 150000 },
    requer: { tecnologias: ['humble'], construcoes: { craqueamento: 5 } },
    bonus: { producao: { craqueamento: 1.4 } },
  },

  chumbo: {
    nome: 'Gasolina com chumbo',
    ano: 1923,
    descricao: 'Um aditivo que acaba com a "batida de pino" e deixa os motores mais fortes.',
    diario: 'Um químico da General Motors descobre que uma pitada de chumbo tetraetila faz a gasolina render mais nos motores novos. A GM e a Jersey fundam juntas a Ethyl Corporation. Morrem operários envenenados na fábrica; o produto vai para as bombas mesmo assim, e lá fica por meio século.',
    custo: { conhecimento: 6000, dinheiro: 200000 },
    requer: { tecnologias: ['tubo_tanque'] },
    bonus: { preco: { gasolina: 1.2 } },
  },

  venezuela: {
    nome: 'Concessões em Maracaibo',
    ano: 1928,
    descricao: 'A Shell chegou antes e achou um mar de óleo debaixo do lago. Ainda há lugar para quem pagar.',
    diario: 'Em 1922, um poço da Shell em Maracaibo jorrou cem mil barris por dia. A Jersey gastou anos e fortunas na Venezuela sem achar nada, até comprar quem já tinha achado. O país vira o maior exportador de petróleo do mundo.',
    custo: { conhecimento: 8000, dinheiro: 300000 },
    requer: { tecnologias: ['chumbo'], eventos: ['anos_loucos'] },
  },

  octanas: {
    nome: 'Gasolina de 100 octanas',
    ano: 1942,
    descricao: 'Craqueamento com catalisador, para a gasolina que os aviões de combate pedem.',
    diario: 'Com gasolina de 100 octanas, um caça sobe mais depressa, voa mais longe e carrega mais peso. O craqueamento catalítico em leito fluidizado, desenvolvido pela Jersey, produz essa gasolina em quantidades que a Alemanha nunca vai alcançar.',
    custo: { conhecimento: 12000, dinheiro: 500000 },
    requer: { tecnologias: ['venezuela'], eventos: ['segunda_guerra'] },
    bonus: { producao: { craqueamento: 1.5 } },
  },

  pos_guerra: {
    nome: 'O mundo depois da guerra',
    ano: 1945,
    descricao: 'A guerra acabou. Os Estados Unidos queimaram tanto óleo que já não se bastam.',
    diario: 'De cada sete barris de petróleo usados pelos Aliados, seis saíram dos Estados Unidos. Os geólogos avisam: o centro de gravidade do petróleo está se mudando para o Golfo Pérsico. (O próximo capítulo ainda está por escrever.)',
    custo: { conhecimento: 15000, dinheiro: 800000 },
    requer: { tecnologias: ['octanas'], eventos: ['big_inch'] },
  },

};
