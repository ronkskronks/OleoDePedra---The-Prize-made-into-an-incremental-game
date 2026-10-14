# Óleo de Pedra — guia de edição

## Como jogar

Dê dois cliques em `index.html`. Abre no navegador, sem instalar nada.
Depois de mexer em qualquer arquivo, salve e aperte **F5** na página.

## Onde fica cada coisa

| Pasta / arquivo | O que é | Você mexe? |
|---|---|---|
| `dados/recursos.js` | As commodities: nome, limite, preço de mercado | Sim |
| `dados/acoes.js` | Botões de clique manual | Sim |
| `dados/construcoes.js` | O que se compra e trabalha sozinho | Sim |
| `dados/tecnologias.js` | A linha do tempo: cada marco do livro | Sim |
| `dados/eventos.js` | O que acontece sozinho: guerras, crises, notícias, decisões | Sim |
| `dados/rivais.js` | As empresas concorrentes, que dá para comprar | Sim |
| `dados/medidores.js` | Barras que sobem sozinhas, como a Atenção pública | Sim |
| `dados/config.js` | Nome do jogo, ano inicial, eras | Sim |
| `estilo.css` | Cores e aparência | Se quiser |
| `motor/` | As contas e a tela | Não precisa |
| `ferramentas/simular.js` | Joga sozinho para medir o ritmo | Só roda |

Cada arquivo de `dados/` tem no topo a explicação de todos os campos.

## A tela

No estilo do Evolve: cada ação, construção ou pesquisa é um botão
pequeno, só com o nome e a quantidade. **Passe o mouse** em cima para
ver a descrição, os efeitos e o custo. Nome em vermelho quer dizer que
ainda falta recurso. Embaixo de algumas construções aparecem:

- uma barrinha verde: quanto resta de reserva (poços);
- `− 2/3 +`: quantas unidades estão ligadas, para desligar e religar.

## Receitas

### Transformar um trecho do livro em jogo

Quase sempre é um bloco novo em `dados/tecnologias.js`:

```js
  guerra_civil: {
    nome: 'Demanda da Guerra Civil',
    ano: 1862,
    descricao: 'O Norte precisa de luz, de lubrificante e de dólares de exportação.',
    diario: 'O texto que conta o que aconteceu, com as suas palavras.',
    custo: { conhecimento: 70 },
    requer: { tecnologias: ['destilacao'] },
    bonus: { preco: { querosene: 1.2 } },
  },
```

### Contar um pedacinho de história enquanto o jogo roda

Acrescente uma frase na lista `texto` de `cronicas_febre`, em
`dados/eventos.js`. O jogo sorteia uma de tempos em tempos e põe no
diário, em cinza. Para um período novo, copie o bloco inteiro e troque
o `requer` (quando começa) e o `ate` (quando para).

### Criar um acontecimento que mexe no mercado

Um bloco em `dados/eventos.js`:

```js
  guerra_civil: {
    nome: 'Guerra Civil',
    ano: 1861,
    requer: { tecnologias: ['destilacao'] },   // só depois disso
    espera: 180,                               // 3 minutos depois
    texto: 'O que entra no diário quando começa.',
    efeito: { preco: { querosene: 1.4 } },
    duracao: 900,                              // 15 minutos
    fim: 'O que entra no diário quando acaba.',
  },
```

Com `repete: 900` no lugar de `espera`, ele volta a acontecer em
média a cada 15 minutos. Enquanto dura, aparece em "Em curso", embaixo
dos recursos, com o relógio.

### Dar uma decisão ao jogador

Um evento com `escolhas` (veja `leilao` e `pithole`). O jogo mostra uma
caixa no alto da tela e espera, sem prazo. Cada escolha tem os seus
próprios efeitos, e pelo menos uma tem de ser de graça.

### Criar um concorrente

Um bloco em `dados/rivais.js`:

```js
  hanna: {
    nome: 'Hanna, Baslington & Co.',
    descricao: 'Aparece ao passar o mouse.',
    produto: 'querosene',           // o que ele fabrica
    tamanho: 1,                     // quanto produz por segundo
    custo: { dinheiro: 2500 },      // preço para comprar
    entrega: { refinaria: 1 },      // o que passa a ser seu
    efeito: { preco: { querosene: 1.03 } },   // vantagem para sempre
    diario: 'O que entra no diário quando você compra.',
    requer: { tecnologias: ['standard'] },    // quando aparece
  },
```

Ele aparece na aba **Concorrência**, que mostra a sua fatia do mercado.
Para amarrar qualquer coisa à fatia (uma tecnologia, um evento, outro
rival), use `requer: { fatia: { querosene: 0.5 } }`.

### Fazer o jogo reagir ao tamanho do jogador

A **Atenção pública** (em `dados/medidores.js`) é uma barra de 0 a 100
que sobe conforme as regras da lista `cresce`. O resto do jogo conversa
com ela de três jeitos:

```js
    requer: { medidores: { atencao: 50 } },    // evento que só acontece com a barra em 50
    move: { atencao: -3 },                     // ação, evento ou escolha que empurra a barra
    bonus: { medidor: { atencao: 1.25 } },     // tecnologia que faz a barra subir mais rápido
```

Um evento também pode depender de outro já ter acontecido:
`requer: { eventos: ['spindletop'] }`.

### Tirar coisas do jogador e deixar um legado

O desmembramento de 1911 (em `dados/eventos.js`) usa `desmembra`: o
jogador perde uma fração das construções listadas e ganha um recurso
por unidade perdida. Esse recurso (`acoes`, em `dados/recursos.js`) tem
`multiplica`: cada unidade dá um bônus permanente em toda a produção.

### Criar uma commodity nova

1. Um bloco em `dados/recursos.js` (com `preco` se for vendida no mercado).
2. Uma construção em `dados/construcoes.js` que a `produz`.
3. Se ela tem `limite`, uma construção que a `armazena`.

### Criar uma construção que transforma uma coisa em outra

Use `consome` e `produz` juntos, como o `alambique`. Ela desacelera
sozinha se faltar insumo ou se o produto não tiver onde ser guardado.

### Criar um poço ou campo que se esgota

Uma construção que `produz` e tem o bloco `esgota`, como o `poco`:

```js
    produz: { petroleo: 0.4 },
    esgota: {
      reserva: 300,     // barris que cada poço tem, em média
      variacao: 0.5,    // cada poço nasce com 50% a 150% disso
      seco: 0.1,        // 10% de chance de furar e não achar nada
      abandono: 0.1,    // com 10% da reserva, o poço é abandonado
    },
```

Um campo novo da história (Spindletop, Pérsia...) é só outra construção
com números diferentes: reserva enorme, custo alto, mais risco. Uma
tecnologia pode aumentar a reserva dos poços novos com
`bonus: { reserva: { poco: 1.5 } }`.

### Liberar algo só depois de um marco

Na construção (ou ação, ou tecnologia) que deve ficar escondida:

```js
    requer: { tecnologias: ['oleoduto'] },
```

## Regras de digitação

- Identificador (o nome antes dos dois-pontos): minúsculas, sem espaço e
  sem acento. Ex.: `gas_natural`, não `gás natural`.
- Texto vai entre aspas simples: `'assim'`. Se o texto tiver apóstrofo,
  use aspas duplas: `"d'água"`.
- Número decimal usa **ponto**: `0.5`, não `0,5`.
- Todo bloco e toda linha terminam com vírgula.

Se algo estiver errado, o jogo mostra uma caixa vermelha dizendo o que
é e em qual bloco, em vez de abrir em branco.

## Jogo salvo

O jogo salva sozinho no navegador. Saves antigos continuam funcionando
quando você adiciona coisas novas. Para testar do começo, use
**Opções → Recomeçar do zero**.

## Como as contas funcionam

- **Custo:** `custo × aumento ^ quantidade já construída` (o mesmo
  escalonamento do Evolve).
- **Produção:** soma de tudo o que as construções ligadas produzem,
  vezes os bônus das tecnologias.
- **Esgotamento:** a unidade produz na proporção da reserva que ainda
  tem (metade da reserva, metade da produção). Abandonada, ela sai da
  contagem e a próxima fica mais barata. Com o estoque cheio, ela
  espera sem gastar reserva. A primeira unidade nunca dá furo seco.
- **Preço de mercado:** oscila ao acaso (`volatilidade`), cai a cada
  unidade vendida (`pressao`) e volta aos poucos para o preço normal
  (`recuperacao`). Inundar o mercado derruba o preço.
- **Fatia de mercado:** o que você consegue produzir do produto (com
  tudo ligado), dividido por isso mais a produção de todos os rivais
  ainda não comprados, mesmo os que não apareceram na tela.
- **Vender muito:** o preço cai quanto mais se vende por segundo. O
  bônus `mercado` de uma tecnologia faz o mercado aguentar mais.
- **Medidores:** a cada segundo, soma as taxas das regras de `cresce`
  que estão valendo, multiplica pelos aceleradores e desconta o `cai`.
- **Legado:** recurso com `multiplica: { producao: 0.02 }` dá +2% em
  toda a produção por unidade guardada.
- **Eventos:** o efeito de um evento multiplica igual ao bônus de uma
  tecnologia, só que com prazo. Quando mexe em preço, o preço salta na
  hora e depois volta sozinho. Os tempos contam em segundos de jogo,
  inclusive com a aba fechada; decisões ficam esperando você voltar.
- **Fora do jogo:** ao voltar, o jogo rende o tempo que ficou fechado,
  até o máximo definido em `dados/config.js`.

## Medir o ritmo do jogo

Depois de mexer em números, dá para ver quanto tempo um jogador
simulado leva até um marco, sem abrir o navegador:

    node ferramentas/simular.js standard 5

`standard` é o identificador da tecnologia-alvo e `5` é o número de
partidas. Por padrão ele clica 2 vezes por segundo sem parar; para
imitar alguém que clica pouco: `CLIQUES=0.3 node ferramentas/simular.js`.
