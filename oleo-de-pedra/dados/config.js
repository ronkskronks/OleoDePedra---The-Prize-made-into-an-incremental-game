// ============================================================
//  CONFIGURAÇÃO GERAL DO JOGO
//  Aqui ficam o nome, o ano em que a história começa e as eras.
// ============================================================

JOGO.config = {
  nome: 'Óleo de Pedra',
  subtitulo: 'Uma história do petróleo',

  // Ano em que o jogo começa. O ano avança quando você pesquisa
  // tecnologias (cada tecnologia tem o seu "ano").
  anoInicial: 1854,

  // Qual recurso é o dinheiro (usado pelo mercado).
  moeda: 'dinheiro',

  // Quantas horas, no máximo, o jogo rende com a aba fechada.
  offlineMaxHoras: 8,

  // Eras: o nome que aparece no topo muda conforme o ano.
  // Para criar uma era nova, copie uma linha e mude o ano e o nome.
  eras: [
    { de: 1854, nome: 'A febre do óleo de pedra' },
    { de: 1870, nome: 'O império da Standard Oil' },
    { de: 1882, nome: 'O Truste' },
    { de: 1911, nome: 'As irmãs e as guerras' },
  ],
};
