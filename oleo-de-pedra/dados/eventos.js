// ============================================================
//  EVENTOS  (o que acontece sozinho enquanto o jogo roda)
//
//  Tecnologia é o que o jogador decide fazer. Evento é o que o mundo
//  faz com ele: guerra, incêndio, corrida de especuladores, notícia.
//
//    identificador: {
//      nome: 'Nome na tela',
//      ano: 1861,                        // o calendário pula para este ano (opcional)
//      texto: 'O que entra no diário.',  // pode ser uma lista: ['um', 'outro'] sorteia um
//
//      // --- quando acontece ---
//      requer: { tecnologias: ['destilacao'] },   // veja dados/acoes.js
//      espera: 120,       // segundos depois de cumprido o "requer" (opcional)
//
//      // --- o que faz (use só o que precisar) ---
//      concede: { dinheiro: 50 },        // dá de presente
//      perde: { petroleo: 0.3 },         // tira 30% do que estiver guardado
//      destroi: { poco: 1 },             // acaba com 1 unidade da construção
//      move: { atencao: 5 },             // empurra um medidor (veja dados/medidores.js)
//      desmembra: {                      // perde uma FRAÇÃO das construções...
//        refinaria: { perde: 0.66, rende: { acoes: 1 } },   // ...e ganha algo por unidade perdida
//      },
//      efeito: {                         // multiplicadores enquanto durar
//        preco:    { querosene: 1.5 },   //   preço normal 1,5x
//        producao: { poco: 0.5 },        //   construção produz metade
//      },
//      duracao: 300,      // segundos do "efeito" (sem esta linha = para sempre)
//      fim: 'Texto do diário quando o efeito acaba.',   // opcional
//    },
//
//  EVENTO QUE SE REPETE: troque "espera" por
//      repete: 600,       // volta a acontecer, em média, a cada 600 segundos
//      ate: { tecnologias: ['standard'] },   // para de acontecer depois disso (opcional)
//  As notícias dele aparecem em cinza no diário.
//
//  EVENTO COM ESCOLHA: em vez de efeito direto, uma lista de opções.
//  O jogo mostra uma caixa e espera o jogador decidir (sem pressa).
//      escolhas: [
//        { nome: 'Texto do botão',
//          descricao: 'Aparece ao passar o mouse.',
//          custo: { dinheiro: 300 },     // opcional (uma opção tem de ser grátis)
//          diario: 'O que entra no diário se escolher esta.',
//          concede: ..., perde: ..., destroi: ..., efeito: ..., duracao: ..., fim: ...
//        },
//        { nome: 'Outra opção', ... },
//      ],
//
//  ATENÇÃO: os textos abaixo foram escritos de memória. Confira com o
//  livro antes de dar o jogo por pronto.
// ============================================================

JOGO.eventos = {

  // ---------- crônicas (só texto, para dar clima) ----------

  cronicas_nascente: {
    nome: 'Crônicas da nascente',
    repete: 150,
    ate: { tecnologias: ['perfuracao'] },
    texto: [
      'Em Pittsburgh, Samuel Kier engarrafa o óleo que estraga seus poços de sal e vende como remédio: "Óleo de Pedra de Kier", bom para quase tudo.',
      'O óleo de baleia para os lampiões fica mais caro a cada ano. Os baleeiros de New Bedford precisam ir cada vez mais longe atrás dos cachalotes.',
      'Os índios Seneca já recolhiam esse óleo dos riachos muito antes de alguém pensar em vendê-lo.',
      'Quem não pode pagar óleo de baleia queima canfeno, uma mistura de terebintina e álcool. Clareia bem. Às vezes explode.',
      'Na Europa já se destila "óleo de carvão" para iluminação. Falta descobrir uma fonte farta e barata.',
    ],
  },

  cronicas_febre: {
    nome: 'Crônicas da febre',
    repete: 420,
    requer: { tecnologias: ['perfuracao'] },
    texto: [
      'A lama das estradas de Oil Creek engole as rodas até o eixo. Cavalo de carroceiro não dura uma temporada.',
      'Há quem procure óleo com varinha de vedor, e quem cobre caro para "farejar" o lugar certo de furar.',
      'Quem não tem máquina a vapor fura no pé: uma vara de árvore faz de mola e dois homens pisam o estribo o dia inteiro.',
      'Para descer os barris, represam o riacho e soltam a água de uma vez. As barcaças vão na enxurrada, batendo umas nas outras. Metade chega.',
      'Um barril vazio custa quase o dobro do óleo que cabe nele.',
      'Um rapaz herdou a fazenda da tia, com poços e tudo, e gastou uma fortuna em um ano. Chamam-no de "Coal Oil Johnny".',
      'Lampião de querosene mal refinado explode na sala. O comprador aprende a desconfiar de marca que não conhece.',
      'Um ator de nome John Wilkes Booth andou pela região comprando participação em poços. Não teve sorte.',
    ],
  },

  cronicas_standard: {
    nome: 'Crônicas da Standard',
    repete: 480,
    requer: { tecnologias: ['standard'] },
    texto: [
      'Rockefeller anota cada centavo que ganha e gasta desde os dezesseis anos, num caderninho que chama de Livro-Razão A.',
      'Na Standard nada é comprado de fora se der para fazer em casa: barris, cola, tinta, vagões-tanque, até a madeira dos barris vem de florestas próprias.',
      'O nome "Standard" foi escolhido para dizer ao freguês uma coisa só: este querosene é sempre igual e não vai explodir na sua sala.',
      'Um refinador que vendeu conta que viu os livros da Standard por meia hora e saiu sabendo que estava liquidado.',
      'Na região do óleo, já chamam a Standard de "o Polvo".',
      'Rockefeller não levanta a voz, não bebe, dá aula na escola dominical e chega ao escritório sempre na mesma hora.',
    ],
  },

  cronicas_truste: {
    nome: 'Crônicas do Truste',
    repete: 540,
    requer: { tecnologias: ['truste'] },
    ate: { eventos: ['desmembramento'] },
    texto: [
      'A sede agora fica no número 26 da Broadway, em Nova York. Os diretores almoçam juntos todo dia, na mesma mesa comprida; é ali que tudo se decide.',
      'Thomas Edison acendeu suas lâmpadas elétricas em Manhattan. Por enquanto é brinquedo de rico. Por enquanto.',
      'Nos confins da Rússia, em Baku, os irmãos Nobel e os Rothschild tiram tanto óleo do chão que o querosene russo já disputa a Europa com o americano.',
      'Do refino sobra um líquido leve e perigoso, a gasolina. Vende-se um pouco como solvente; o resto é jogado no rio, de noite.',
      'Um comerciante de Londres, Marcus Samuel, manda petroleiros com querosene russo pelo Canal de Suez. Os navios levam nomes de conchas.',
      'Um caricaturista desenha a Standard como um polvo com um tentáculo em cada capitólio do país.',
      'Aparecem pelas estradas umas carruagens sem cavalo, barulhentas, que queimam gasolina. Assustam os animais e pouca gente as leva a sério.',
    ],
  },

  cronicas_irmas: {
    nome: 'Crônicas das irmãs',
    repete: 600,
    requer: { eventos: ['desmembramento'] },
    ate: { tecnologias: ['pos_guerra'] },
    texto: [
      'Em Wall Street correm para comprar ações das "filhotes" da Standard. Rockefeller, dono de um quarto de cada uma, nunca foi tão rico quanto depois de derrotado.',
      'Winston Churchill, no Almirantado, troca o carvão do País de Gales pelo óleo da Pérsia nos navios de guerra. Para garantir o óleo, o governo britânico compra metade da Anglo-Persian.',
      'Setembro de 1914: os alemães chegam perto de Paris, e o general Gallieni requisita os táxis da cidade para levar soldados à frente do Marne.',
      'O diretor do serviço geológico americano avisa que o petróleo do país acaba em menos de dez anos. As companhias saem pelo mundo atrás de concessões.',
      'Calouste Gulbenkian, um armênio de Constantinopla, costurou a companhia que tem os direitos sobre o óleo da Mesopotâmia e ficou com cinco por cento dela. Chamam-no de "Senhor Cinco por Cento".',
      'Henri Deterding, da Royal Dutch/Shell, é chamado de "o Napoleão do petróleo". Ele não acha exagero.',
      'Washington ferve com o escândalo de Teapot Dome: um ministro alugou reservas de petróleo da Marinha a dois amigos e recebeu o agradecimento em dinheiro vivo, numa maleta preta.',
      'Um Ford Modelo T custa menos de trezentos dólares. Há um automóvel para cada cinco americanos.',
      'Guerra de preços nas esquinas: os postos dão mapa, lavam o para-brisa, calibram os pneus e ainda distribuem copos de brinde.',
      'Em Bahrein, uma ilhota do Golfo Pérsico, a Standard da Califórnia acha petróleo. Do outro lado da água fica a Arábia. Quase ninguém repara.',
    ],
  },

  // ---------- sacudidas do mercado (voltam de tempos em tempos) ----------

  poco_jorrando: {
    nome: 'Poço jorrando no vale vizinho',
    repete: 900,
    requer: { tecnologias: ['frete'] },
    texto: 'Um poço novo jorra sem controle no vale vizinho e inunda o mercado. O preço do bruto desaba.',
    efeito: { preco: { petroleo: 0.6 } },
    duracao: 150,
    fim: 'O poço do vizinho perdeu a força. O preço do bruto respira.',
  },

  falta_barris: {
    nome: 'Faltam barris',
    repete: 1100,
    requer: { tecnologias: ['frete'] },
    texto: 'Não há barril vazio em toda a região. Quem tem óleo embarrilado cobra o que quer.',
    efeito: { preco: { petroleo: 1.5 } },
    duracao: 120,
    fim: 'Chegou um carregamento de barris. O preço do bruto volta ao normal.',
  },

  incendio: {
    nome: 'Incêndio no campo',
    repete: 1500,
    requer: { construcoes: { poco: 2 } },
    texto: 'Uma fagulha, e o gás em volta dos tanques pega fogo. Parte do óleo guardado vira fumaça preta.',
    perde: { petroleo: 0.3 },
  },

  // ---------- a história (acontecem uma vez) ----------

  corrida: {
    nome: 'A corrida para Oil Creek',
    ano: 1860,
    requer: { tecnologias: ['perfuracao'] },
    espera: 240,
    texto: 'A notícia do poço de Drake corre. Gente de todo o Leste desce em Titusville, arrenda cada palmo de chão e ergue torres encostadas umas nas outras. Sobra óleo, e o preço cai.',
    efeito: { preco: { petroleo: 0.7 } },
    duracao: 300,
    fim: 'O mercado engole o óleo novo: cada lampião aceso é um freguês a mais.',
  },

  guerra_civil: {
    nome: 'Guerra Civil',
    ano: 1861,
    requer: { tecnologias: ['destilacao'] },
    espera: 180,
    texto: 'Começa a Guerra Civil. O Norte fica sem a terebintina do Sul, e sem ela não há canfeno para os lampiões. O querosene ocupa o lugar e ainda rende dólares de exportação.',
    efeito: { preco: { querosene: 1.4 } },
    duracao: 900,
    fim: 'A guerra vai chegando ao fim. O querosene já não precisa dela: virou a luz do mundo.',
  },

  leilao: {
    nome: 'O leilão da refinaria',
    ano: 1865,
    requer: { construcoes: { alambique: 2 } },
    espera: 300,
    texto: 'Em Cleveland, os sócios de uma refinaria não se entendem: um quer crescer tomando dinheiro emprestado, os outros têm medo de dívida. Decidem leiloar a firma entre eles mesmos. Você é o sócio que quer crescer.',
    escolhas: [
      {
        nome: 'Cobrir todos os lances',
        descricao: 'Ficar com a refinaria inteira, custe o que custar.',
        custo: { dinheiro: 500 },
        diario: 'O lance final foi alto, e você nem piscou. A refinaria é sua, sem sócio para segurar o freio. Em 1865, Rockefeller pagou 72.500 dólares aos Clark e disse depois que aquele foi o dia que decidiu sua carreira.',
        efeito: { producao: { alambique: 1.25 } },
      },
      {
        nome: 'Vender a sua parte',
        descricao: 'Embolsar o dinheiro e deixar a refinaria com os outros.',
        diario: 'Você deixou os sócios levarem a refinaria e saiu com dinheiro no bolso. Negócio seguro. Seguro demais?',
        concede: { dinheiro: 250 },
      },
    ],
  },

  guerra_do_oleo: {
    nome: 'A Guerra do Óleo',
    ano: 1872,
    requer: { tecnologias: ['descontos'] },
    espera: 240,
    texto: 'O plano das ferrovias vazou. A região do óleo se levanta: comícios à noite, tochas, jornais com a lista dos conspiradores na primeira página. Os produtores juram não vender uma gota à Standard.',
    efeito: { producao: { compradores: 0.25 } },
    duracao: 420,
    fim: 'O boicote dos produtores se desfaz: eles precisam vender, e só a Standard compra tanto. A South Improvement Company foi enterrada, mas os descontos continuam por outros caminhos.',
  },

  boicote: {
    nome: 'Boicote ao Truste',
    repete: 1200,
    requer: { medidores: { atencao: 40 } },
    ate: { eventos: ['desmembramento'] },
    texto: 'Um jornal publica mais uma história sobre os métodos do Truste. Em várias cidades, mercearias anunciam que só vendem querosene "independente".',
    efeito: { preco: { querosene: 0.85 } },
    duracao: 240,
    fim: 'O boicote esfria. O querosene independente é mais caro, e a indignação não ilumina a sala.',
  },

  sherman: {
    nome: 'A Lei Sherman',
    ano: 1890,
    requer: { medidores: { atencao: 25 } },
    texto: 'O Congresso aprova, quase sem votos contrários, a Lei Sherman: fica proibida toda combinação que restrinja o comércio. Ninguém sabe ainda o que isso quer dizer na prática. Todo mundo sabe em quem estavam pensando.',
    move: { atencao: 5 },
  },

  spindletop: {
    nome: 'Spindletop',
    ano: 1901,
    requer: { tecnologias: ['holding'] },
    espera: 300,
    texto: 'Texas, 10 de janeiro de 1901. Num morrinho chamado Spindletop, um poço explode num jorro de óleo mais alto que a torre e leva nove dias para ser domado. Sozinho, produz mais do que todos os outros poços do país juntos. Em volta dele nascem empresas que não devem nada à Standard: a Gulf e a Texas Company.',
    efeito: { preco: { petroleo: 0.5 } },
    duracao: 600,
    fim: 'O óleo do Texas é ruim para querosene, mas ótimo para queimar em caldeira de navio e de locomotiva. O petróleo acaba de arranjar outro uso.',
  },

  tarbell: {
    nome: 'A história da Standard Oil',
    ano: 1902,
    requer: { eventos: ['spindletop'], medidores: { atencao: 50 } },
    texto: 'A revista McClure\'s começa a publicar, mês a mês, "A História da Standard Oil Company". A autora, Ida Tarbell, cresceu na região do óleo e viu o pai, produtor independente, ser espremido. Ela escreve sem adjetivos, com documentos. O país inteiro lê.',
    efeito: { medidor: { atencao: 2 } },
  },

  processo: {
    nome: 'Os Estados Unidos contra a Standard Oil',
    ano: 1906,
    requer: { eventos: ['tarbell'], medidores: { atencao: 75 } },
    texto: 'O governo de Theodore Roosevelt processa a Standard Oil com base na Lei Sherman e pede a dissolução da companhia. São 444 testemunhas e mais de catorze mil páginas de depoimentos.',
    efeito: { medidor: { atencao: 1.5 } },
  },

  desmembramento: {
    nome: 'O desmembramento',
    ano: 1911,
    requer: { eventos: ['processo'], medidores: { atencao: 100 } },
    texto: 'Maio de 1911. A Suprema Corte confirma a sentença: a Standard Oil tem seis meses para se desfazer. O império é repartido em 34 companhias. Você fica com a maior delas, a Standard Oil de Nova Jersey, e com um punhado de ações de cada uma das outras. Em poucos anos, separadas, elas valerão mais do que valiam juntas. E enquanto os juízes olhavam para o querosene, o futuro mudou de combustível: veja a Pesquisa.',
    desmembra: {
      refinaria: { perde: 0.66, rende: { acoes: 1 } },
      compradores: { perde: 0.66 },
      agentes: { perde: 0.66 },
    },
  },

  // ---------- capítulo 4: as irmãs e as guerras ----------

  luz_eletrica: {
    nome: 'A luz elétrica',
    ano: 1912,
    requer: { eventos: ['desmembramento'] },
    espera: 300,
    texto: 'A lâmpada de Edison deixou de ser novidade. Bairro por bairro, as cidades puxam fio, e o lampião de querosene vai para o porão. O produto que fez a Standard está perdendo a serventia.',
    efeito: { preco: { querosene: 0.75 } },
  },

  shell_chega: {
    nome: 'A Shell desembarca',
    ano: 1912,
    requer: { eventos: ['desmembramento'] },
    espera: 600,
    texto: 'Enquanto a Standard se desfazia nos tribunais, Deterding atacou: a Royal Dutch/Shell abre uma companhia de gasolina na costa do Pacífico e compra campos em Oklahoma. "Estamos na América!", comemora ele.',
  },

  ford_t: {
    nome: 'A linha de montagem',
    ano: 1913,
    requer: { tecnologias: ['burton'] },
    espera: 180,
    texto: 'Em Highland Park, Henry Ford põe o Modelo T numa esteira que anda. O carro, que levava doze horas para ser montado, sai em uma hora e meia e custa cada vez menos. A gasolina, que as refinarias jogavam fora, virou o que todos querem.',
    efeito: { preco: { gasolina: 4 } },
  },

  primeira_guerra: {
    nome: 'A Grande Guerra',
    ano: 1914,
    requer: { tecnologias: ['posto'] },
    espera: 420,
    texto: 'A guerra começou a cavalo e vai terminar a motor: caminhões, tanques, aviões, submarinos, e a esquadra britânica queimando óleo. Quatro de cada cinco barris dos Aliados vêm dos Estados Unidos.',
    efeito: { preco: { gasolina: 1.5, petroleo: 1.5 } },
    duracao: 900,
    fim: 'Novembro de 1918: armistício. Num jantar em Londres, lorde Curzon diz que a causa aliada "flutuou para a vitória sobre uma onda de petróleo".',
  },

  anos_loucos: {
    nome: 'Os anos loucos',
    ano: 1924,
    requer: { tecnologias: ['tubo_tanque'] },
    espera: 420,
    texto: 'O país inteiro aprendeu a dirigir. Estradas asfaltadas, subúrbios, motéis, a viagem de férias de carro. Em dez anos, o número de automóveis passa de nove para vinte e três milhões.',
    efeito: { preco: { gasolina: 1.5 }, mercado: { gasolina: 2 } },
  },

  luz_no_campo: {
    nome: 'A luz chega ao campo',
    ano: 1925,
    requer: { eventos: ['anos_loucos'] },
    espera: 600,
    texto: 'A eletricidade alcança as cidades pequenas e as fazendas. O querosene ainda serve para fogareiro e trator; como luz do mundo, acabou.',
    efeito: { preco: { querosene: 0.75 } },
  },

  linha_vermelha: {
    nome: 'O Acordo da Linha Vermelha',
    ano: 1928,
    requer: { tecnologias: ['venezuela'] },
    espera: 420,
    texto: 'Acharam um campo imenso em Kirkuk, no Iraque. As grandes companhias negociam há anos quem fica com o quê. Diz a lenda que Gulbenkian pegou um lápis vermelho e contornou no mapa o antigo Império Otomano: dentro da linha, ninguém procura petróleo sozinho. No mesmo ano, num castelo da Escócia, os chefes das maiores companhias combinam não brigar mais por mercado.',
    escolhas: [
      {
        nome: 'Assinar o acordo',
        descricao: 'Entrar no consórcio do Iraque e aceitar as regras do clube.',
        custo: { dinheiro: 200000 },
        diario: 'A Jersey assina. Passa a receber a sua parte do óleo do Iraque e promete não procurar mais nada, sozinha, da Turquia à Arábia.',
        efeito: { producao: { compradores: 1.5 }, preco: { gasolina: 1.1 } },
      },
      {
        nome: 'Ficar de fora',
        descricao: 'Mãos livres para procurar petróleo onde quiser, e nenhum amigo.',
        diario: 'Você não assina. Fica sem o óleo do Iraque e livre para furar onde bem entender, inclusive nas areias que os outros prometeram não tocar.',
        efeito: { reserva: { campo_texas: 1.3, campo_venezuela: 1.3 } },
      },
    ],
  },

  crise_29: {
    nome: 'A Grande Depressão',
    ano: 1929,
    requer: { eventos: ['linha_vermelha'] },
    espera: 600,
    texto: 'A Bolsa de Nova York desaba em outubro. Fábricas fecham, um em cada quatro americanos fica sem emprego, e quem ainda tem carro pensa duas vezes antes de encher o tanque.',
    efeito: { preco: { gasolina: 0.6, querosene: 0.7 } },
    duracao: 1200,
    fim: 'A economia começa a se mexer de novo, devagar. O carro, descobriu-se, é a última coisa de que o americano abre mão.',
  },

  east_texas: {
    nome: 'O gigante do leste do Texas',
    ano: 1930,
    requer: { eventos: ['crise_29'] },
    espera: 300,
    texto: 'No pior momento possível, um velho aventureiro falido, "Dad" Joiner, acha no leste do Texas o maior campo já visto no país. Milhares de pequenos produtores furam ao mesmo tempo, cada um tirando o óleo antes do vizinho. O barril, que valia um dólar, chega a dez centavos.',
    escolhas: [
      {
        nome: 'Apoiar as cotas do Texas',
        descricao: 'Pedir ao governo que mande cada produtor tirar menos. É contra tudo o que você sempre disse sobre o governo.',
        diario: 'O governador manda a Guarda Nacional fechar os poços, e uma repartição estadual, a Comissão de Ferrovias do Texas, passa a dizer quanto cada um pode produzir. O preço se levanta. O sistema vai durar quarenta anos.',
        efeito: { preco: { petroleo: 0.7 }, producao: { campo_texas: 0.6 } },
        duracao: 900,
      },
      {
        nome: 'Produzir a todo vapor',
        descricao: 'Se o óleo está barato, que esteja barato para todos. Suas refinarias agradecem.',
        diario: 'Você deixa o mercado se afogar. Óleo a dez centavos o barril: água custa mais. Os pequenos quebram; parte do campo se estraga para sempre, com a pressão do gás desperdiçada.',
        efeito: { preco: { petroleo: 0.25 }, producao: { compradores: 1.5 } },
        duracao: 900,
        fim: 'O "óleo quente", contrabandeado de noite, enfim é contido pela lei federal. O preço do bruto volta a existir.',
      },
    ],
  },

  tensao_mexico: {
    nome: 'México: greve nos campos',
    ano: 1937,
    requer: { tecnologias: ['mexico'], eventos: ['east_texas'] },
    espera: 900,
    texto: 'Os petroleiros mexicanos entram em greve por salário. As companhias estrangeiras recusam o laudo do governo, depois recusam a sentença da Suprema Corte do país. O presidente Lázaro Cárdenas está perdendo a paciência.',
    escolhas: [
      {
        nome: 'Vender e sair do México',
        descricao: 'Passar adiante as concessões enquanto alguém ainda paga por elas.',
        diario: 'Você vendeu os campos mexicanos por uma fração do que valiam e saiu. Na sede, disseram que foi covardia.',
        concede: { dinheiro: 250000 },
        destroi: { campo_mexico: 999 },
      },
      {
        nome: 'Ficar e endurecer',
        descricao: 'Ceder aqui é ceder na Venezuela amanhã. O México não ousaria.',
        diario: 'As companhias fecham questão: não cedem um centavo. Acham que o México precisa mais delas do que elas do México.',
      },
    ],
  },

  expropriacao: {
    nome: 'A expropriação mexicana',
    ano: 1938,
    requer: { eventos: ['tensao_mexico'] },
    espera: 600,
    texto: 'Na noite de 18 de março de 1938, Cárdenas fala pelo rádio: o petróleo do México é dos mexicanos. Todas as companhias estrangeiras são expropriadas. Nas ruas, mulheres doam alianças e galinhas para pagar a indenização. Quem ainda tinha campos lá perdeu tudo; nasce a Pemex.',
    destroi: { campo_mexico: 999 },
  },

  segunda_guerra: {
    nome: 'A Segunda Guerra Mundial',
    ano: 1941,
    requer: { tecnologias: ['venezuela'], eventos: ['east_texas'] },
    espera: 1200,
    texto: 'A Alemanha invade a Rússia de olho no óleo de Baku. O Japão, cortado do petróleo americano, ataca Pearl Harbor para chegar ao das Índias Holandesas. É uma guerra movida a petróleo e, em boa parte, travada por ele.',
    efeito: { preco: { gasolina: 1.6, petroleo: 1.5 } },
    duracao: 1800,
    fim: 'Os tanques de Rommel pararam no deserto por falta de gasolina. Os aviões japoneses, no fim, mal tinham combustível para decolar. A guerra acabou.',
  },

  big_inch: {
    nome: 'Os submarinos e o "Big Inch"',
    ano: 1942,
    requer: { eventos: ['segunda_guerra'] },
    espera: 420,
    texto: 'Submarinos alemães caçam petroleiros à vista das praias americanas, iluminados pelas luzes dos hotéis. Em poucos meses vai a pique um quarto da frota que leva óleo do Texas para o Nordeste.',
    escolhas: [
      {
        nome: 'Bancar o "Big Inch"',
        descricao: 'Um oleoduto de dois mil quilômetros, do Texas a Nova York, o maior já feito. Submarino não afunda cano.',
        custo: { dinheiro: 300000 },
        diario: 'Em pouco mais de um ano o "Big Inch" fica pronto: sessenta centímetros de diâmetro, do Texas à costa leste. O óleo passa a viajar por terra.',
        efeito: { producao: { craqueamento: 1.3 } },
      },
      {
        nome: 'Seguir com os petroleiros',
        descricao: 'Navio é mais barato. A Marinha há de dar um jeito nos submarinos.',
        diario: 'Você continua mandando o óleo por mar. Os submarinos agradecem: carga após carga vai para o fundo antes que os comboios e os aviões fechem o caminho.',
        perde: { petroleo: 0.5, gasolina: 0.5 },
        efeito: { producao: { compradores: 0.5, campo_texas: 0.7 } },
        duracao: 1200,
      },
    ],
  },

  pithole: {
    nome: 'A febre de Pithole',
    ano: 1865,
    requer: { tecnologias: ['oleoduto'] },
    espera: 120,
    texto: 'Acharam óleo em Pithole Creek. Em poucos meses, onde havia uma fazenda há hotéis, bancos, teatro e quinze mil pessoas. Os lotes mudam de mão várias vezes no mesmo dia.',
    escolhas: [
      {
        nome: 'Comprar um lote em Pithole',
        descricao: 'Entrar na febre enquanto os poços de lá estão jorrando.',
        custo: { dinheiro: 400 },
        diario: 'Você arrendou um lote em Pithole e furou depressa, antes do vizinho.',
        efeito: { producao: { poco: 1.8 } },
        duracao: 600,
        fim: 'Os poços de Pithole secaram tão depressa quanto apareceram. Veio o fogo, e a cidade se esvaziou. Um terreno que valeu dois milhões de dólares foi vendido depois por menos de cinco.',
      },
      {
        nome: 'Ficar de fora',
        descricao: 'Febre passa. Guardar o dinheiro.',
        diario: 'Você olhou a correria de longe. Pouco mais de um ano depois, Pithole era uma cidade-fantasma, e um terreno que valeu dois milhões de dólares foi vendido por menos de cinco.',
        concede: { conhecimento: 40 },
      },
    ],
  },

};
