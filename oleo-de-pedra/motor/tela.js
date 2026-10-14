// Tela do jogo: desenha os painéis a partir das tabelas de dados e do
// estado. A estrutura só é refeita quando o motor avisa (motor.sujo);
// a cada passo, apenas os números são atualizados.

(function () {
  'use strict';

  const J = JOGO;
  const PASSO = 0.25;
  const ABAS = [
    { id: 'campo', nome: 'Campo' },
    { id: 'mercado', nome: 'Mercado' },
    { id: 'pesquisa', nome: 'Pesquisa' },
    { id: 'rivais', nome: 'Concorrência', quando: () => Object.keys(J.rivais).some((vid) => M.visto('v:' + vid)) },
    { id: 'opcoes', nome: 'Opções' },
  ];

  let M;
  let abaAtual = 'campo';
  let atualizadores = [];
  let dicas = {};        // o que mostrar ao passar o mouse, por chave
  let dicaAtual = null;

  // ---------- utilidades ----------

  function el(tag, classe, texto) {
    const e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto !== undefined) e.textContent = texto;
    return e;
  }

  function botao(texto, aoClicar, classe) {
    const b = el('button', classe || 'botao', texto);
    b.type = 'button';
    b.addEventListener('click', () => { aoClicar(); atualizar(); });
    return b;
  }

  function fmt(n) {
    const a = Math.abs(n);
    if (a >= 1e9) return (n / 1e9).toFixed(2).replace('.', ',') + ' B';
    if (a >= 1e6) return (n / 1e6).toFixed(2).replace('.', ',') + ' M';
    if (a >= 1e4) return (n / 1e3).toFixed(1).replace('.', ',') + ' K';
    const casas = a >= 100 ? 0 : 1;
    const p = Math.pow(10, casas);
    return (Math.floor(n * p + 1e-9) / p).toLocaleString('pt-BR', { maximumFractionDigits: casas });
  }

  function fmtPreco(n) {
    return '$ ' + n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtNum(n) {
    return n.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  }

  function nome(rid) {
    return J.recursos[rid].nome;
  }

  // ---------- textos gerados a partir dos dados ----------

  function efeitosConstrucao(cid) {
    const c = J.construcoes[cid];
    const mp = M.bonus('producao', cid);
    const ma = M.bonus('armazenamento', cid);
    const linhas = [];
    for (const [rid, v] of Object.entries(c.produz || {})) linhas.push('+' + fmtNum(v * mp) + ' ' + nome(rid) + '/s' + (c.esgota ? ' enquanto cheio' : ''));
    if (c.esgota) {
      linhas.push('Reserva: cerca de ' + fmt(c.esgota.reserva * M.bonus('reserva', cid)) + ' por unidade; produz menos conforme esvazia');
      if (c.esgota.seco) linhas.push(Math.round(c.esgota.seco * 100) + '% de chance de não achar nada');
    }
    for (const [rid, v] of Object.entries(c.consome || {})) linhas.push('−' + fmtNum(v) + ' ' + nome(rid) + '/s');
    for (const [rid, v] of Object.entries(c.vende || {})) linhas.push('Vende ' + fmtNum(v) + ' ' + nome(rid) + '/s');
    for (const [rid, v] of Object.entries(c.armazena || {})) linhas.push('+' + fmtNum(v * ma) + ' de espaço para ' + nome(rid));
    return linhas;
  }

  // Multiplicadores (bônus de tecnologia, efeito de evento ou de rival) em frases.
  function frasesMultiplicadores(m) {
    const linhas = [];
    if (!m) return linhas;
    for (const [cid, v] of Object.entries(m.producao || {})) linhas.push('Produção de ' + J.construcoes[cid].nome + ' ×' + fmtNum(v));
    for (const [cid, v] of Object.entries(m.armazenamento || {})) linhas.push('Espaço de ' + J.construcoes[cid].nome + ' ×' + fmtNum(v));
    for (const [cid, v] of Object.entries(m.reserva || {})) linhas.push('Reserva de ' + J.construcoes[cid].nome + ' (novas) ×' + fmtNum(v));
    for (const [rid, v] of Object.entries(m.preco || {})) linhas.push('Preço normal de ' + nome(rid) + ' ×' + fmtNum(v));
    for (const [rid, v] of Object.entries(m.mercado || {})) linhas.push('Mercado de ' + nome(rid) + ' aguenta ' + fmtNum(v) + '× mais venda');
    for (const [rid, v] of Object.entries(m.aquisicao || {})) linhas.push('Comprar rivais de ' + nome(rid) + ' ×' + fmtNum(v));
    for (const [mid, v] of Object.entries(m.medidor || {})) linhas.push(J.medidores[mid].nome + ' sobe ' + fmtNum(v) + '× mais rápido');
    return linhas;
  }

  function frasesMover(move) {
    return Object.entries(move || {}).map(([mid, v]) => J.medidores[mid].nome + ' ' + (v > 0 ? '+' : '−') + fmtNum(Math.abs(v)));
  }

  function efeitosTecnologia(tid) {
    const t = J.tecnologias[tid];
    const b = t.bonus || {};
    const linhas = [];
    for (const [rid, v] of Object.entries(t.concede || {})) linhas.push('Recebe ' + fmtNum(v) + ' ' + nome(rid));
    linhas.push(...frasesMultiplicadores(b));
    const libera = [];
    for (const tabela of [J.construcoes, J.acoes, J.rivais]) {
      for (const item of Object.values(tabela)) {
        if (item.requer && (item.requer.tecnologias || []).includes(tid)) libera.push(item.nome);
      }
    }
    if (libera.length) linhas.push('Libera: ' + libera.join(', '));
    return linhas;
  }

  // O que um evento (ou uma escolha dele) faz, em frases.
  function efeitosEvento(c) {
    const ef = c.efeito;
    const linhas = [];
    for (const [rid, v] of Object.entries(c.concede || {})) linhas.push('Recebe ' + fmtNum(v) + ' ' + nome(rid));
    for (const [rid, v] of Object.entries(c.perde || {})) linhas.push('Perde ' + Math.round(v * 100) + '% de ' + nome(rid));
    for (const [cid, v] of Object.entries(c.destroi || {})) linhas.push('Perde ' + v + ' × ' + J.construcoes[cid].nome);
    linhas.push(...frasesMover(c.move));
    for (const [cid, d] of Object.entries(c.desmembra || {})) linhas.push('Perde ' + Math.round(d.perde * 100) + '% de ' + J.construcoes[cid].nome);
    linhas.push(...frasesMultiplicadores(ef));
    if (c.efeito) linhas.push(c.duracao ? 'Dura ' + relogio(c.duracao) : 'Para sempre');
    return linhas;
  }

  function relogio(segundos) {
    const s = Math.max(0, Math.ceil(segundos));
    return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
  }

  // Lista de custos, em vermelho o que estiver faltando.
  function blocoCusto(custo) {
    const caixa = el('div', 'custo');
    for (const [rid, v] of Object.entries(custo || {})) {
      const falta = J.estado.recursos[rid].qtd < v;
      caixa.appendChild(el('span', 'custo-item' + (falta ? ' falta' : ''), fmt(v) + ' ' + nome(rid)));
    }
    return caixa;
  }

  // Botão compacto no estilo do Evolve: só nome e contagem. Descrição,
  // efeitos e custo aparecem na dica ao passar o mouse.
  //   chave: identifica a dica;  montarDica(caixa): preenche a dica;
  //   pode(): diz se o botão está liberado agora.
  function botaoItem(chave, rotulo, contagem, aoClicar, montarDica, pode) {
    const b = botao('', aoClicar, 'item');
    b.appendChild(el('span', 'item-nome', rotulo));
    if (contagem !== null && contagem !== undefined) b.appendChild(el('span', 'item-qtd', String(contagem)));
    b.dataset.dica = chave;
    dicas[chave] = montarDica;
    if (pode) atualizadores.push(() => b.classList.toggle('sem-recurso', !pode()));
    return b;
  }

  function dicaPadrao(caixa, titulo, descricao, efeitos, custo) {
    caixa.appendChild(el('div', 'dica-titulo', titulo));
    if (descricao) caixa.appendChild(el('div', 'descricao', descricao));
    for (const linha of efeitos) caixa.appendChild(el('div', 'efeito', linha));
    if (custo && Object.keys(custo).length) caixa.appendChild(blocoCusto(custo));
  }

  // A dica é refeita a cada passo enquanto está aberta, então os números
  // dentro dela (custo, reservas) ficam sempre em dia.
  function atualizarDica() {
    const caixa = document.getElementById('dica');
    const alvo = dicaAtual && dicas[dicaAtual] && document.querySelector('[data-dica="' + dicaAtual + '"]');
    if (!alvo) { caixa.hidden = true; return; }
    caixa.textContent = '';
    dicas[dicaAtual](caixa);
    caixa.hidden = false;
    const r = alvo.getBoundingClientRect();
    const d = caixa.getBoundingClientRect();
    const embaixo = r.bottom + 4 + d.height <= window.innerHeight;
    caixa.style.top = Math.max(4, embaixo ? r.bottom + 4 : r.top - d.height - 4) + 'px';
    caixa.style.left = Math.max(4, Math.min(r.left, window.innerWidth - d.width - 4)) + 'px';
  }

  // ---------- painéis ----------

  function desenharCabecalho() {
    const c = document.getElementById('cabecalho');
    c.textContent = '';
    const titulo = el('div', 'titulo');
    titulo.appendChild(el('h1', null, J.config.nome));
    titulo.appendChild(el('span', 'subtitulo', J.config.subtitulo));
    c.appendChild(titulo);
    const tempo = el('div', 'tempo');
    tempo.appendChild(el('span', 'ano', String(J.estado.ano)));
    tempo.appendChild(el('span', 'era', M.eraAtual()));
    c.appendChild(tempo);
  }

  function desenharRecursos() {
    const p = document.getElementById('recursos');
    p.textContent = '';
    p.appendChild(el('h2', null, 'Recursos'));
    for (const rid of Object.keys(J.recursos)) {
      if (!M.visto('r:' + rid)) continue;
      const linha = el('div', 'recurso');
      linha.appendChild(el('span', 'recurso-nome', nome(rid)));
      const qtd = el('span', 'recurso-qtd');
      const taxa = el('span', 'recurso-taxa');
      linha.appendChild(qtd);
      linha.appendChild(taxa);
      if (J.recursos[rid].preco) linha.title = 'Vende-se na aba Mercado';
      p.appendChild(linha);
      atualizadores.push(() => {
        const q = J.estado.recursos[rid].qtd;
        const lim = M.limite(rid);
        qtd.textContent = lim === Infinity ? fmt(q) : fmt(q) + ' / ' + fmt(lim);
        qtd.classList.toggle('cheio', lim !== Infinity && q >= lim);
        const t = M.taxas[rid] || 0;
        taxa.textContent = Math.abs(t) < 0.005 ? '' : (t > 0 ? '+' : '−') + fmtNum(Math.abs(t)) + '/s';
        taxa.classList.toggle('negativo', t < 0);
      });
    }
  }

  // Medidores ligados: uma barra cada, embaixo dos recursos.
  function desenharMedidores() {
    const p = document.getElementById('recursos');
    for (const [mid, md] of Object.entries(J.medidores)) {
      if (!M.medidorLigado(mid)) continue;
      const max = md.maximo || 100;
      const caixa = el('div', 'medidor');
      const topo = el('div', 'recurso');
      topo.appendChild(el('span', 'recurso-nome', md.nome));
      const valor = el('span', 'recurso-qtd');
      topo.appendChild(valor);
      const barra = el('div', 'fatia-barra');
      const nivel = el('div', 'fatia-nivel');
      barra.appendChild(nivel);
      caixa.appendChild(topo);
      caixa.appendChild(barra);
      caixa.dataset.dica = 'm:' + mid;
      dicas['m:' + mid] = (dica) => {
        const porMin = M.ritmoMedidor(mid) * 60;
        const ritmo = Math.abs(porMin) < 0.005 ? 'Parado' : (porMin > 0 ? 'Subindo ' : 'Descendo ') + fmtNum(Math.abs(porMin)) + ' por minuto';
        dicaPadrao(dica, md.nome, md.descricao, [ritmo]);
      };
      p.appendChild(caixa);
      atualizadores.push(() => {
        const v = J.estado.medidores[mid];
        valor.textContent = Math.floor(v) + ' / ' + max;
        nivel.style.width = (v / max * 100).toFixed(1) + '%';
        nivel.classList.toggle('alto', v >= max * 0.75);
      });
    }
  }

  // Efeitos de eventos em curso, embaixo dos recursos.
  function desenharEmCurso() {
    // Efeito que só acelera um medidor já desligado não interessa mais.
    const ativos = J.estado.eventos.ativos.filter((a) => {
      const ef = M.consequencia(a).efeito;
      const tipos = Object.keys(ef);
      return !(tipos.length === 1 && tipos[0] === 'medidor' && Object.keys(ef.medidor).every((mid) => !M.medidorLigado(mid)));
    });
    if (!ativos.length) return;
    const p = document.getElementById('recursos');
    p.appendChild(el('h2', null, 'Em curso'));
    ativos.forEach((a, i) => {
      const ev = J.eventos[a.id];
      const c = M.consequencia(a);
      const linha = el('div', 'recurso em-curso');
      linha.appendChild(el('span', 'recurso-nome', ev.nome));
      const resta = el('span', 'recurso-qtd');
      linha.appendChild(resta);
      linha.dataset.dica = 'e:' + i;
      dicas['e:' + i] = (caixa) => dicaPadrao(caixa, ev.nome, c.nome ? 'Você escolheu: ' + c.nome : '', efeitosEvento(c).slice(0, c.duracao ? -1 : undefined));
      p.appendChild(linha);
      atualizadores.push(() => { resta.textContent = a.resta === null ? 'permanente' : relogio(a.resta); });
    });
  }

  // Eventos esperando uma decisão do jogador: ficam no alto, em qualquer aba.
  function desenharDecisoes() {
    const p = document.getElementById('decisoes');
    p.textContent = '';
    for (const id of J.estado.eventos.pendentes) {
      const ev = J.eventos[id];
      const caixa = el('div', 'decisao');
      caixa.appendChild(el('div', 'dica-titulo', ev.nome));
      if (typeof ev.texto === 'string') caixa.appendChild(el('div', 'decisao-texto', ev.texto));
      const grade = el('div', 'grade');
      ev.escolhas.forEach((o, i) => {
        grade.appendChild(botaoItem('d:' + id + ':' + i, o.nome, null, () => M.escolher(id, i),
          (dica) => dicaPadrao(dica, o.nome, o.descricao, efeitosEvento(o), o.custo),
          () => M.podePagar(o.custo)));
      });
      caixa.appendChild(grade);
      p.appendChild(caixa);
    }
  }

  function desenharAbas() {
    const barra = document.getElementById('abas');
    barra.textContent = '';
    for (const aba of ABAS) {
      if (aba.quando && !aba.quando()) continue;
      const b = botao(aba.nome, () => { abaAtual = aba.id; M.sujo = true; }, 'aba' + (aba.id === abaAtual ? ' ativa' : ''));
      barra.appendChild(b);
    }
  }

  function desenharCampo(p) {
    p.appendChild(el('h2', null, 'Trabalho manual'));
    const acoes = el('div', 'grade');
    for (const [aid, a] of Object.entries(J.acoes)) {
      if (!M.visto('a:' + aid)) continue;
      const ganhos = Object.entries(a.ganha || {}).map(([rid, v]) => '+' + fmtNum(v) + ' ' + nome(rid)).concat(frasesMover(a.move));
      acoes.appendChild(botaoItem('a:' + aid, a.nome, null, () => M.agir(aid),
        (caixa) => dicaPadrao(caixa, a.nome, a.descricao, ganhos, a.gasta),
        () => M.podePagar(a.gasta)));
    }
    p.appendChild(acoes);

    p.appendChild(el('h2', null, 'Construções'));
    const grade = el('div', 'grade');
    for (const [cid, c] of Object.entries(J.construcoes)) {
      if (!M.visto('c:' + cid)) continue;
      const ec = J.estado.construcoes[cid];
      const caixaItem = el('div', 'item-caixa');
      caixaItem.appendChild(botaoItem('c:' + cid, c.nome, ec.qtd, () => M.comprar(cid), (caixa) => {
        dicaPadrao(caixa, c.nome, c.descricao, efeitosConstrucao(cid), M.custoConstrucao(cid));
        if (c.esgota && ec.qtd > 0) {
          const cheio = c.esgota.reserva * M.bonus('reserva', cid);
          const lista = ec.reservas.map((r) => Math.round(r / cheio * 100) + '%').join('  ');
          caixa.appendChild(el('div', 'descricao', 'Reserva de cada unidade: ' + lista));
        }
      }, () => M.podePagar(M.custoConstrucao(cid))));

      // Barrinha: quanto ainda resta, somando todas as unidades.
      if (c.esgota && ec.qtd > 0) {
        const barra = el('div', 'reserva');
        const nivel = el('div', 'reserva-nivel');
        barra.appendChild(nivel);
        caixaItem.appendChild(barra);
        atualizadores.push(() => {
          const f = Math.min(1, M.rendimento(cid) / (ec.qtd * M.bonus('reserva', cid) || 1));
          nivel.style.width = Math.round(f * 100) + '%';
          nivel.classList.toggle('baixa', f < 0.35);
        });
      }

      if ((c.consome || c.vende) && ec.qtd > 0) {
        const controle = el('div', 'ativos');
        const texto = el('span', 'ativos-texto');
        controle.appendChild(botao('−', () => M.ajustarAtivos(cid, -1), 'mini'));
        controle.appendChild(texto);
        controle.appendChild(botao('+', () => M.ajustarAtivos(cid, 1), 'mini'));
        caixaItem.appendChild(controle);
        atualizadores.push(() => {
          const f = M.fatores[cid];
          const lento = ec.ativos > 0 && f < 0.995;
          texto.textContent = ec.ativos + '/' + ec.qtd + (lento ? ' · ' + Math.round(f * 100) + '%' : '');
          texto.classList.toggle('lento', lento);
          texto.title = lento ? 'Trabalhando a ' + Math.round(f * 100) + '% do ritmo: falta insumo ou espaço' : 'Ligados / construídos';
        });
      }
      grade.appendChild(caixaItem);
    }
    p.appendChild(grade);
  }

  function desenharMercado(p) {
    p.appendChild(el('h2', null, 'Mercado'));
    p.appendChild(el('p', 'descricao', 'O preço oscila sozinho e cai quando se vende muito de uma vez. Com o tempo ele volta para perto do preço normal.'));
    let algum = false;
    for (const [rid, r] of Object.entries(J.recursos)) {
      if (!r.preco || !M.visto('r:' + rid)) continue;
      algum = true;
      const linha = el('div', 'mercado-linha');
      linha.appendChild(el('span', 'mercado-nome', r.nome));
      const preco = el('span', 'preco');
      const normal = el('span', 'preco-normal');
      linha.appendChild(preco);
      linha.appendChild(normal);
      const botoes = el('div', 'mercado-botoes');
      const b1 = botao('Vender 1', () => M.vender(rid, 1));
      const b10 = botao('Vender 10', () => M.vender(rid, 10));
      const bT = botao('Vender tudo', () => M.vender(rid, J.estado.recursos[rid].qtd));
      botoes.appendChild(b1);
      botoes.appendChild(b10);
      botoes.appendChild(bT);
      linha.appendChild(botoes);
      p.appendChild(linha);
      atualizadores.push(() => {
        const atual = J.estado.precos[rid];
        const base = M.precoBase(rid);
        const q = J.estado.recursos[rid].qtd;
        preco.textContent = fmtPreco(atual);
        preco.classList.toggle('alta', atual > base * 1.05);
        preco.classList.toggle('baixa', atual < base * 0.95);
        normal.textContent = 'normal: ' + fmtPreco(base);
        b1.disabled = q < 1;
        b10.disabled = q < 10;
        bT.disabled = q <= 0;
      });
    }
    if (!algum) p.appendChild(el('p', 'vazio', 'Nada para vender ainda.'));
  }

  function desenharRivais(p) {
    // Um bloco por produto disputado.
    const produtos = [];
    for (const [vid, r] of Object.entries(J.rivais)) {
      if (M.visto('v:' + vid) && !produtos.includes(r.produto)) produtos.push(r.produto);
    }
    for (const rid of produtos) {
      p.appendChild(el('h2', null, 'Mercado de ' + nome(rid)));
      const resumo = el('div', 'fatia');
      const texto = el('span');
      const barra = el('div', 'fatia-barra');
      const nivel = el('div', 'fatia-nivel');
      barra.appendChild(nivel);
      resumo.appendChild(texto);
      resumo.appendChild(barra);
      p.appendChild(resumo);
      atualizadores.push(() => {
        const f = M.fatia(rid);
        texto.textContent = 'Sua fatia: ' + Math.round(f * 100) + '%  (você ' + fmtNum(M.capacidade(rid)) + '/s, rivais ' + fmtNum(M.capacidadeRivais(rid)) + '/s)';
        nivel.style.width = (f * 100).toFixed(1) + '%';
      });

      const grade = el('div', 'grade');
      const comprados = [];
      for (const [vid, r] of Object.entries(J.rivais)) {
        if (r.produto !== rid) continue;
        if (J.estado.rivais[vid]) { comprados.push(r.nome); continue; }
        if (!M.visto('v:' + vid)) continue;
        grade.appendChild(botaoItem('v:' + vid, r.nome, fmtNum(r.tamanho) + '/s', () => M.comprarRival(vid), (caixa) => {
          const linhas = ['Produz ' + fmtNum(r.tamanho) + ' ' + nome(rid) + '/s'];
          if (!r.custo) linhas.push('Não está à venda');
          for (const [cid, n] of Object.entries(r.entrega || {})) linhas.push('Ao comprar: +' + n + ' × ' + J.construcoes[cid].nome);
          linhas.push(...frasesMultiplicadores(r.efeito));
          dicaPadrao(caixa, r.nome, r.descricao, linhas, M.custoRival(vid));
        }, () => !!r.custo && M.podePagar(M.custoRival(vid))));
      }
      p.appendChild(grade);
      if (!grade.children.length) p.appendChild(el('p', 'vazio', 'Nenhum rival à vista para comprar agora.'));
      if (comprados.length) {
        p.appendChild(el('h2', null, 'Já são seus'));
        const lista = el('ul', 'feitas');
        for (const n of comprados) lista.appendChild(el('li', null, n));
        p.appendChild(lista);
      }
    }
  }

  function desenharPesquisa(p) {
    p.appendChild(el('h2', null, 'Pesquisa'));
    const grade = el('div', 'grade');
    const feitas = [];
    let algum = false;
    for (const [tid, t] of Object.entries(J.tecnologias)) {
      if (J.estado.tecnologias[tid]) { feitas.push(t); continue; }
      if (!M.visto('t:' + tid)) continue;
      algum = true;
      grade.appendChild(botaoItem('t:' + tid, t.nome, t.ano || null, () => M.pesquisar(tid),
        (caixa) => dicaPadrao(caixa, t.nome + (t.ano ? ' (' + t.ano + ')' : ''), t.descricao, efeitosTecnologia(tid), t.custo),
        () => M.podePagar(t.custo)));
    }
    p.appendChild(grade);
    if (!algum) p.appendChild(el('p', 'vazio', 'Nenhuma pesquisa disponível agora. Continue crescendo.'));

    if (feitas.length) {
      p.appendChild(el('h2', null, 'Concluídas'));
      const lista = el('ul', 'feitas');
      for (const t of feitas) lista.appendChild(el('li', null, (t.ano ? t.ano + ' — ' : '') + t.nome));
      p.appendChild(lista);
    }
  }

  function desenharOpcoes(p) {
    p.appendChild(el('h2', null, 'Jogo salvo'));
    p.appendChild(el('p', 'descricao', 'O jogo salva sozinho neste navegador a cada 15 segundos.'));
    const aviso = el('p', 'aviso-opcoes');
    const caixa = el('textarea', 'caixa-save');
    caixa.rows = 5;
    caixa.placeholder = 'Cole aqui um save exportado para importar.';
    const linha = el('div', 'mercado-botoes');
    linha.appendChild(botao('Salvar agora', () => { M.salvar(); aviso.textContent = 'Salvo.'; }));
    linha.appendChild(botao('Exportar', () => { caixa.value = M.exportar(); caixa.select(); aviso.textContent = 'Copie o texto da caixa e guarde.'; }));
    linha.appendChild(botao('Importar', () => {
      const texto = caixa.value;
      if (M.importar(texto)) window.location.reload();
      else aviso.textContent = 'Esse texto não é um save válido.';
    }));
    linha.appendChild(botao('Recomeçar do zero', () => {
      if (window.confirm('Apagar todo o progresso e recomeçar?')) {
        M.reiniciar();
        window.location.reload();
      }
    }, 'botao perigo'));
    p.appendChild(linha);
    p.appendChild(caixa);
    p.appendChild(aviso);
  }

  function desenharDiario() {
    const p = document.getElementById('diario');
    p.textContent = '';
    p.appendChild(el('h2', null, 'Diário'));
    if (!J.estado.diario.length) {
      p.appendChild(el('p', 'vazio', 'Pensilvânia, ' + J.config.anoInicial + '. Um óleo escuro mina das pedras do riacho. Dizem que serve de remédio.'));
    }
    for (const nota of J.estado.diario) {
      const item = el('div', 'nota' + (nota.aviso ? ' aviso' : ''));
      item.appendChild(el('span', 'nota-ano', String(nota.ano)));
      item.appendChild(el('span', 'nota-texto', nota.texto + (nota.vezes > 1 ? ' (×' + nota.vezes + ')' : '')));
      p.appendChild(item);
    }
  }

  function desenhar() {
    atualizadores = [];
    dicas = {};
    desenharCabecalho();
    desenharRecursos();
    desenharMedidores();
    desenharEmCurso();
    desenharDecisoes();
    desenharAbas();
    const p = document.getElementById('painel');
    p.textContent = '';
    if (abaAtual === 'campo') desenharCampo(p);
    if (abaAtual === 'mercado') desenharMercado(p);
    if (abaAtual === 'pesquisa') desenharPesquisa(p);
    if (abaAtual === 'rivais') desenharRivais(p);
    if (abaAtual === 'opcoes') desenharOpcoes(p);
    desenharDiario();
    M.sujo = false;
  }

  function atualizar() {
    // A aba de opções tem uma caixa de texto: não é refeita enquanto está aberta.
    if (M.sujo && abaAtual === 'opcoes' && document.querySelector('.caixa-save')) {
      desenharCabecalho();
      desenharDecisoes();
      desenharDiario();
      M.sujo = false;
    }
    if (M.sujo) desenhar();
    for (const f of atualizadores) f();
    atualizarDica();
  }

  // ---------- início ----------

  function mostrarErros(erros) {
    const caixa = document.getElementById('erros');
    caixa.hidden = false;
    caixa.textContent = '';
    caixa.appendChild(el('h2', null, 'O jogo não pôde começar'));
    const lista = el('ul');
    for (const e of erros) lista.appendChild(el('li', null, e));
    caixa.appendChild(lista);
    caixa.appendChild(el('p', null, 'Corrija o arquivo, salve e recarregue a página (F5).'));
  }

  function iniciar() {
    const erros = J.validar();
    if (erros.length) { mostrarErros(erros); return; }

    M = J.motor;
    M.carregar();
    document.title = J.config.nome;
    document.getElementById('jogo').hidden = false;
    desenhar();
    atualizar();

    let ultimo = Date.now();
    let sobra = 0;
    setInterval(() => {
      const agora = Date.now();
      sobra += (agora - ultimo) / 1000;
      ultimo = agora;
      if (sobra > 5) {
        M.simular(Math.min(sobra, J.config.offlineMaxHoras * 3600));
        sobra = 0;
      }
      while (sobra >= PASSO) { M.tick(PASSO); sobra -= PASSO; }
      atualizar();
    }, PASSO * 1000);

    document.addEventListener('mouseover', (ev) => {
      const alvo = ev.target.closest ? ev.target.closest('[data-dica]') : null;
      const chave = alvo ? alvo.dataset.dica : null;
      if (chave !== dicaAtual) { dicaAtual = chave; atualizarDica(); }
    });

    setInterval(M.salvar, 15000);
    window.addEventListener('beforeunload', M.salvar);
  }

  document.addEventListener('DOMContentLoaded', iniciar);
})();
