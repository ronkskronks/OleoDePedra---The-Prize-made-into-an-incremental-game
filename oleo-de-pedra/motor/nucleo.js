// Motor do jogo: toda a matemática fica aqui, sem nada de tela.
// Lê as tabelas de JOGO.recursos / acoes / construcoes / tecnologias
// e mantém o estado em JOGO.estado.

(function () {
  'use strict';

  const J = JOGO;
  const CHAVE_SAVE = 'oleo-de-pedra-save';
  const MAX_DIARIO = 60;
  const MAX_AVISOS = 6;

  const motor = {
    taxas: {},      // variação líquida por segundo de cada recurso
    fatores: {},    // 0..1: quanto cada construção conseguiu trabalhar
    sujo: true,     // a tela precisa ser redesenhada
    naoSalvar: false,
    quieto: null,   // durante a simulação fora do jogo: conta os avisos em vez de anotar
  };

  // ---------- estado ----------

  function estadoNovo() {
    const e = {
      versao: 1,
      ano: J.config.anoInicial,
      recursos: {},
      construcoes: {},
      tecnologias: {},
      precos: {},
      vistos: {},
      diario: [],
      eventos: null,
      rivais: {},
      medidores: {},
      ultimoSalvo: Date.now(),
    };
    completar(e);
    return e;
  }

  // Garante que o estado tem uma entrada para tudo o que existe nas
  // tabelas. É o que deixa um save antigo continuar funcionando depois
  // que um recurso ou construção novo é adicionado.
  function completar(e) {
    // feitos: já aconteceram;  espera/proximo: contagens em segundos;
    // pendentes: esperando o jogador escolher;  ativos: efeitos em curso.
    const ev = Object.assign({ feitos: {}, espera: {}, proximo: {}, pendentes: [], ativos: [] }, e.eventos);
    ev.pendentes = ev.pendentes.filter((id) => J.eventos[id] && J.eventos[id].escolhas);
    ev.ativos = ev.ativos.filter((a) => consequencia(a));
    e.eventos = ev;
    for (const [id, r] of Object.entries(J.recursos)) {
      if (!e.recursos[id]) e.recursos[id] = { qtd: r.inicial || 0 };
      if (r.preco && !(e.precos[id] > 0)) e.precos[id] = r.preco;
    }
    for (const id of Object.keys(J.medidores)) if (!(e.medidores[id] >= 0)) e.medidores[id] = 0;
    for (const [id, c] of Object.entries(J.construcoes)) {
      if (!e.construcoes[id]) e.construcoes[id] = { qtd: 0, ativos: 0 };
      if (!c.esgota) continue;
      // Uma reserva por unidade. Save de antes da mecânica ganha unidades cheias.
      const ec = e.construcoes[id];
      if (!Array.isArray(ec.reservas)) ec.reservas = [];
      while (ec.reservas.length < ec.qtd) ec.reservas.push(c.esgota.reserva);
      ec.reservas.length = ec.qtd;
      ec.ativos = ec.qtd;
      if (!(ec.feitos >= ec.qtd)) ec.feitos = ec.qtd;
    }
  }

  // ---------- consultas ----------

  // Produto dos bônus de todas as tecnologias pesquisadas e dos
  // efeitos de eventos em curso.
  function bonus(tipo, id) {
    let m = 1;
    for (const tid of Object.keys(J.estado.tecnologias)) {
      const t = J.tecnologias[tid];
      const v = t && t.bonus && t.bonus[tipo] && t.bonus[tipo][id];
      if (v) m *= v;
    }
    for (const a of J.estado.eventos.ativos) {
      const efeito = consequencia(a).efeito;
      const v = efeito[tipo] && efeito[tipo][id];
      if (v) m *= v;
    }
    for (const vid of Object.keys(J.estado.rivais)) {
      const r = J.rivais[vid];
      const v = r && r.efeito && r.efeito[tipo] && r.efeito[tipo][id];
      if (v) m *= v;
    }
    // Recurso com "multiplica": cada unidade guardada soma um tanto a tudo daquele tipo.
    for (const [rid, r] of Object.entries(J.recursos)) {
      const v = r.multiplica && r.multiplica[tipo];
      if (v) m *= 1 + v * J.estado.recursos[rid].qtd;
    }
    return m;
  }

  // De onde vem um efeito em curso: do próprio evento ou da escolha feita nele.
  function consequencia(ativo) {
    const ev = J.eventos[ativo.id];
    const c = ev && (ativo.escolha === null || ativo.escolha === undefined ? ev : (ev.escolhas || [])[ativo.escolha]);
    return c && c.efeito ? c : null;
  }

  function limite(rid) {
    const r = J.recursos[rid];
    if (r.limite === undefined) return Infinity;
    let total = r.limite;
    for (const [cid, c] of Object.entries(J.construcoes)) {
      if (c.armazena && c.armazena[rid]) {
        total += c.armazena[rid] * J.estado.construcoes[cid].qtd * bonus('armazenamento', cid);
      }
    }
    return total;
  }

  // Mesmo escalonamento do Evolve: base x aumento ^ quantidade.
  function custoConstrucao(cid) {
    const c = J.construcoes[cid];
    const n = J.estado.construcoes[cid].qtd;
    const custo = {};
    for (const [rid, base] of Object.entries(c.custo || {})) {
      custo[rid] = Math.round(base * Math.pow(c.aumento || 1, n));
    }
    return custo;
  }

  function podePagar(custo) {
    for (const [rid, v] of Object.entries(custo || {})) {
      if (J.estado.recursos[rid].qtd < v) return false;
    }
    return true;
  }

  function pagar(custo) {
    for (const [rid, v] of Object.entries(custo || {})) J.estado.recursos[rid].qtd -= v;
  }

  function ganhar(ganhos) {
    for (const [rid, v] of Object.entries(ganhos || {})) {
      const r = J.estado.recursos[rid];
      r.qtd = Math.min(r.qtd + v, limite(rid));
    }
  }

  function requisitosOk(requer) {
    if (!requer) return true;
    const e = J.estado;
    for (const tid of requer.tecnologias || []) if (!e.tecnologias[tid]) return false;
    for (const [cid, n] of Object.entries(requer.construcoes || {})) {
      if (e.construcoes[cid].qtd < n) return false;
    }
    for (const [rid, n] of Object.entries(requer.recursos || {})) {
      if (e.recursos[rid].qtd < n) return false;
    }
    for (const [rid, f] of Object.entries(requer.fatia || {})) {
      if (fatia(rid) < f) return false;
    }
    for (const eid of requer.eventos || []) if (!e.eventos.feitos[eid]) return false;
    for (const [mid, v] of Object.entries(requer.medidores || {})) {
      if (e.medidores[mid] < v) return false;
    }
    return true;
  }

  // ---------- concorrência ----------

  // Quanto o jogador consegue produzir de um recurso por segundo, com
  // tudo o que está ligado (poços contam pelo que ainda rendem).
  function capacidade(rid) {
    let total = 0;
    for (const [cid, c] of Object.entries(J.construcoes)) {
      if (!c.produz || !c.produz[rid]) continue;
      const n = c.esgota ? rendimento(cid) : J.estado.construcoes[cid].ativos;
      total += c.produz[rid] * n * bonus('producao', cid);
    }
    return total;
  }

  // Produção somada dos rivais que ainda não foram comprados.
  function capacidadeRivais(rid) {
    let total = 0;
    for (const [vid, r] of Object.entries(J.rivais)) {
      if (r.produto === rid && !J.estado.rivais[vid] && requisitosOk(r.surge)) total += r.tamanho;
    }
    return total;
  }

  function fatia(rid) {
    const minha = capacidade(rid);
    const total = minha + capacidadeRivais(rid);
    return total > 0 ? minha / total : 0;
  }

  function custoRival(vid) {
    const r = J.rivais[vid];
    const custo = {};
    for (const [rid, v] of Object.entries(r.custo || {})) custo[rid] = Math.round(v * bonus('aquisicao', r.produto));
    return custo;
  }

  // Compra o rival: as instalações dele passam a ser suas.
  function comprarRival(vid) {
    const e = J.estado;
    const r = J.rivais[vid];
    const custo = custoRival(vid);
    if (e.rivais[vid] || !r.custo || !visto('v:' + vid) || !podePagar(custo)) return false;
    pagar(custo);
    e.rivais[vid] = true;
    for (const [cid, n] of Object.entries(r.entrega || {})) {
      e.construcoes[cid].qtd += n;
      e.construcoes[cid].ativos += n;
    }
    anotar(r.diario || ('Você comprou ' + r.nome + '.'));
    motor.sujo = true;
    return true;
  }

  function visto(chave) {
    return !!J.estado.vistos[chave];
  }

  function precoBase(rid) {
    return J.recursos[rid].preco * bonus('preco', rid);
  }

  function eraAtual() {
    let nome = '';
    for (const era of J.config.eras) if (J.estado.ano >= era.de) nome = era.nome;
    return nome;
  }

  // ---------- ações do jogador ----------

  function agir(aid) {
    const a = J.acoes[aid];
    if (!podePagar(a.gasta)) return false;
    pagar(a.gasta);
    ganhar(a.ganha);
    mover(a.move);
    return true;
  }

  function comprar(cid) {
    const custo = custoConstrucao(cid);
    if (!podePagar(custo)) return false;
    pagar(custo);
    const c = J.estado.construcoes[cid];
    const g = J.construcoes[cid].esgota;
    if (g) {
      // A primeira unidade nunca falha, para o jogador não travar no começo.
      const seco = c.feitos > 0 && Math.random() < (g.seco || 0);
      c.feitos = (c.feitos || 0) + 1;
      if (seco) {
        anotar(g.avisoSeco || (J.construcoes[cid].nome + ': furo seco, não deu em nada.'), true);
        return true;
      }
      const sorteio = 1 + (g.variacao || 0) * (Math.random() * 2 - 1);
      c.reservas.push(g.reserva * bonus('reserva', cid) * sorteio);
    }
    c.qtd += 1;
    c.ativos += 1;
    motor.sujo = true;
    return true;
  }

  // Soma das reservas em "unidades cheias": 2 unidades pela metade valem 1.
  function rendimento(cid) {
    const g = J.construcoes[cid].esgota;
    let soma = 0;
    for (const r of J.estado.construcoes[cid].reservas) soma += r;
    return soma / g.reserva;
  }

  // Tira das reservas o que foi produzido e abandona as unidades esgotadas.
  function esgotar(cid, extraido) {
    const c = J.construcoes[cid];
    const ec = J.estado.construcoes[cid];
    let total = 0;
    for (const r of ec.reservas) total += r;
    if (total <= 0) return;
    const resta = Math.max(0, 1 - extraido / total);
    const corte = c.esgota.reserva * (c.esgota.abandono || 0.1);
    const antes = ec.reservas.length;
    ec.reservas = ec.reservas.map((r) => r * resta).filter((r) => r >= corte);
    const perdidos = antes - ec.reservas.length;
    if (!perdidos) return;
    ec.qtd = ec.reservas.length;
    ec.ativos = ec.qtd;
    for (let i = 0; i < perdidos; i++) {
      anotar(c.esgota.avisoAbandono || (c.nome + ': uma unidade se esgotou e foi abandonada.'), true);
    }
    motor.sujo = true;
  }

  function ajustarAtivos(cid, delta) {
    const c = J.estado.construcoes[cid];
    c.ativos = Math.max(0, Math.min(c.qtd, c.ativos + delta));
  }

  function pesquisar(tid) {
    const t = J.tecnologias[tid];
    const e = J.estado;
    // Vale o que já apareceu na tela: um poço abandonado não "desfaz" o requisito.
    if (e.tecnologias[tid] || !(visto('t:' + tid) || requisitosOk(t.requer)) || !podePagar(t.custo)) return false;
    pagar(t.custo);
    e.tecnologias[tid] = true;
    if (t.ano && t.ano > e.ano) e.ano = t.ano;
    ganhar(t.concede);
    anotar(t.diario || ('Pesquisado: ' + t.nome));
    motor.sujo = true;
    return true;
  }

  function vender(rid, quantidade) {
    const e = J.estado;
    const q = Math.min(quantidade, e.recursos[rid].qtd);
    if (q <= 0) return 0;
    const valor = venderInterno(rid, q);
    return valor;
  }

  // Vende q unidades ao preço atual e derruba o preço pela pressão de oferta.
  function venderInterno(rid, q) {
    const e = J.estado;
    const r = J.recursos[rid];
    const valor = q * e.precos[rid];
    e.recursos[rid].qtd -= q;
    e.recursos[J.config.moeda].qtd += valor;
    e.precos[rid] *= Math.exp(-(r.pressao || 0) * q / bonus('mercado', rid));
    return valor;
  }

  // "aviso" é notícia do dia a dia (poço seco, poço esgotado). Avisos
  // repetidos viram um só com contador e os antigos somem, para não
  // empurrar a história para fora do diário.
  function anotar(texto, aviso) {
    const d = J.estado.diario;
    if (aviso && motor.quieto) {
      motor.quieto[texto] = (motor.quieto[texto] || 0) + 1;
      return;
    }
    if (aviso && d[0] && d[0].aviso && d[0].texto === texto) {
      d[0].vezes = (d[0].vezes || 1) + 1;
    } else {
      d.unshift(aviso ? { ano: J.estado.ano, texto: texto, aviso: true } : { ano: J.estado.ano, texto: texto });
    }
    let avisos = 0;
    J.estado.diario = d.filter((n) => !n.aviso || ++avisos <= MAX_AVISOS).slice(0, MAX_DIARIO);
    motor.sujo = true;
  }

  // ---------- medidores ----------

  function medidorLigado(mid) {
    const md = J.medidores[mid];
    return visto('m:' + mid) && !(md.ate && requisitosOk(md.ate));
  }

  // Quanto o medidor sobe por segundo agora (negativo = desce).
  function ritmoMedidor(mid) {
    const md = J.medidores[mid];
    if (!medidorLigado(mid)) return 0;
    let taxa = 0;
    for (const regra of md.cresce || []) if (requisitosOk(regra.quando)) taxa += regra.taxa;
    return taxa * bonus('medidor', mid) - (md.cai || 0);
  }

  // Empurra medidores para cima ou para baixo de uma vez.
  function mover(deltas) {
    for (const [mid, v] of Object.entries(deltas || {})) {
      const max = J.medidores[mid].maximo || 100;
      J.estado.medidores[mid] = Math.max(0, Math.min(max, J.estado.medidores[mid] + v));
    }
  }

  function medidores(dt) {
    for (const mid of Object.keys(J.medidores)) {
      const taxa = ritmoMedidor(mid);
      if (taxa) mover({ [mid]: taxa * dt });
    }
  }

  // ---------- eventos ----------

  function sortearIntervalo(media) {
    return media * (0.5 + Math.random());
  }

  function textoDe(t) {
    return Array.isArray(t) ? t[Math.floor(Math.random() * t.length)] : t;
  }

  // Aplica o que um evento (ou uma escolha dele) faz: dá, tira, destrói
  // e, se tiver "efeito", liga um multiplicador temporário ou permanente.
  function aplicar(id, escolha) {
    const e = J.estado;
    const ev = J.eventos[id];
    const c = escolha === null ? ev : ev.escolhas[escolha];
    ganhar(c.concede);
    for (const [rid, fracao] of Object.entries(c.perde || {})) e.recursos[rid].qtd *= 1 - fracao;
    for (const [cid, n] of Object.entries(c.destroi || {})) {
      const ec = e.construcoes[cid];
      ec.qtd = Math.max(0, ec.qtd - n);
      ec.ativos = Math.min(ec.ativos, ec.qtd);
      if (ec.reservas) ec.reservas.length = ec.qtd;
    }
    mover(c.move);
    // Desmembramento: perde uma fração de cada construção listada e,
    // se houver "rende", recebe algo por unidade perdida.
    for (const [cid, d] of Object.entries(c.desmembra || {})) {
      const ec = e.construcoes[cid];
      const perdidas = Math.floor(ec.qtd * d.perde);
      ec.qtd -= perdidas;
      ec.ativos = Math.min(ec.ativos, ec.qtd);
      if (ec.reservas) ec.reservas.length = ec.qtd;
      for (const [rid, v] of Object.entries(d.rende || {})) ganhar({ [rid]: v * perdidas });
    }
    if (c.efeito) {
      e.eventos.ativos.push({ id: id, escolha: escolha, resta: c.duracao || null });
      // O preço salta na hora, em vez de ir chegando aos poucos.
      for (const [rid, m] of Object.entries(c.efeito.preco || {})) e.precos[rid] *= m;
    }
    if (escolha !== null && c.diario) anotar(c.diario, !!ev.repete);
    motor.sujo = true;
  }

  function disparar(id) {
    const e = J.estado;
    const ev = J.eventos[id];
    if (!ev.repete) e.eventos.feitos[id] = true;
    if (ev.ano && ev.ano > e.ano) e.ano = ev.ano;
    if (ev.texto) anotar(textoDe(ev.texto), !!ev.repete);
    if (ev.escolhas) e.eventos.pendentes.push(id);
    else aplicar(id, null);
    motor.sujo = true;
  }

  function escolher(id, indice) {
    const st = J.estado.eventos;
    const ev = J.eventos[id];
    const opcao = ev && ev.escolhas && ev.escolhas[indice];
    if (!opcao || !st.pendentes.includes(id) || !podePagar(opcao.custo)) return false;
    pagar(opcao.custo);
    st.pendentes = st.pendentes.filter((p) => p !== id);
    aplicar(id, indice);
    return true;
  }

  function eventos(dt) {
    const st = J.estado.eventos;
    for (const [id, ev] of Object.entries(J.eventos)) {
      if (ev.repete) {
        if (!requisitosOk(ev.requer) || (ev.ate && requisitosOk(ev.ate))) continue;
        if (st.pendentes.includes(id) || st.ativos.some((a) => a.id === id)) continue;
        if (st.proximo[id] === undefined) st.proximo[id] = sortearIntervalo(ev.repete);
        st.proximo[id] -= dt;
        if (st.proximo[id] <= 0) { st.proximo[id] = sortearIntervalo(ev.repete); disparar(id); }
      } else if (!st.feitos[id]) {
        // Depois que o requisito é cumprido uma vez, a contagem não volta atrás.
        if (st.espera[id] === undefined && !requisitosOk(ev.requer)) continue;
        st.espera[id] = (st.espera[id] || 0) + dt;
        if (st.espera[id] >= (ev.espera || 0)) disparar(id);
      }
    }
    let acabou = false;
    for (const a of st.ativos) {
      if (a.resta === null) continue;
      a.resta -= dt;
      if (a.resta > 0) continue;
      acabou = true;
      const c = consequencia(a);
      if (c.fim) anotar(c.fim, !!J.eventos[a.id].repete);
    }
    if (acabou) {
      st.ativos = st.ativos.filter((a) => a.resta === null || a.resta > 0);
      motor.sujo = true;
    }
  }

  // ---------- simulação ----------

  function tick(dt) {
    const e = J.estado;
    const taxas = {};
    for (const rid of Object.keys(J.recursos)) taxas[rid] = 0;

    for (const [cid, c] of Object.entries(J.construcoes)) {
      const ativos = e.construcoes[cid].ativos;
      if (!ativos) { motor.fatores[cid] = 1; continue; }
      // Quem se esgota produz na proporção da reserva que ainda tem.
      const n = c.esgota ? rendimento(cid) : ativos;

      const mp = bonus('producao', cid);
      const entradas = Object.assign({}, c.consome);
      for (const [rid, v] of Object.entries(c.vende || {})) entradas[rid] = (entradas[rid] || 0) + v;

      // Falta de insumo faz a construção trabalhar proporcionalmente menos.
      let fator = 1;
      let temEntrada = false;
      for (const [rid, v] of Object.entries(entradas)) {
        temEntrada = true;
        fator = Math.min(fator, e.recursos[rid].qtd / (v * n * dt));
      }
      // Quem transforma insumo em produto (ou gasta uma reserva finita) para
      // quando não há onde guardar o produto.
      if (temEntrada || c.esgota) {
        for (const [rid, v] of Object.entries(c.produz || {})) {
          const lim = limite(rid);
          if (lim !== Infinity) {
            fator = Math.min(fator, Math.max(0, lim - e.recursos[rid].qtd) / (v * n * mp * dt));
          }
        }
      }
      fator = Math.max(0, Math.min(1, fator));
      motor.fatores[cid] = fator;

      for (const [rid, v] of Object.entries(c.consome || {})) {
        e.recursos[rid].qtd -= v * n * dt * fator;
        taxas[rid] -= v * n * fator;
      }
      for (const [rid, v] of Object.entries(c.vende || {})) {
        const q = v * n * dt * fator;
        const valor = venderInterno(rid, q);
        taxas[rid] -= v * n * fator;
        taxas[J.config.moeda] += valor / dt;
      }
      let extraido = 0;
      for (const [rid, v] of Object.entries(c.produz || {})) {
        e.recursos[rid].qtd += v * n * mp * dt * fator;
        taxas[rid] += v * n * mp * fator;
        extraido += v * n * mp * dt * fator;
      }
      if (c.esgota) esgotar(cid, extraido);
    }

    for (const rid of Object.keys(J.recursos)) {
      const r = e.recursos[rid];
      r.qtd = Math.max(0, Math.min(r.qtd, limite(rid)));
    }

    medidores(dt);
    eventos(dt);
    mercado(dt);
    motor.taxas = taxas;
    descobrir();
  }

  // O preço sacode ao acaso e é puxado de volta para o preço normal.
  function mercado(dt) {
    const e = J.estado;
    for (const [rid, r] of Object.entries(J.recursos)) {
      if (!r.preco) continue;
      const base = precoBase(rid);
      const acaso = (Math.random() + Math.random() + Math.random() - 1.5) * 2;
      let p = e.precos[rid];
      p += (base - p) * (r.recuperacao || 0) * dt;
      p += p * (r.volatilidade || 0) * acaso * Math.sqrt(dt);
      const min = r.precoMin !== undefined ? r.precoMin : base * 0.2;
      const max = r.precoMax !== undefined ? r.precoMax : base * 4;
      e.precos[rid] = Math.max(min, Math.min(max, p));
    }
  }

  // Marca como "visto" tudo cujo requisito acabou de ser cumprido.
  function descobrir() {
    const e = J.estado;
    const marcar = (chave) => {
      if (!e.vistos[chave]) { e.vistos[chave] = true; motor.sujo = true; }
    };
    for (const [id, r] of Object.entries(J.recursos)) {
      if (r.visivel || e.recursos[id].qtd > 0) marcar('r:' + id);
    }
    for (const [id, a] of Object.entries(J.acoes)) if (requisitosOk(a.requer)) marcar('a:' + id);
    for (const [id, c] of Object.entries(J.construcoes)) {
      if (!requisitosOk(c.requer)) continue;
      marcar('c:' + id);
      // Recurso que uma construção à vista produz ou guarda também aparece.
      for (const rid of Object.keys(Object.assign({}, c.produz, c.armazena))) marcar('r:' + rid);
    }
    for (const [id, t] of Object.entries(J.tecnologias)) if (requisitosOk(t.requer)) marcar('t:' + id);
    for (const [id, r] of Object.entries(J.rivais)) if (requisitosOk(r.requer) && requisitosOk(r.surge)) marcar('v:' + id);
    for (const [id, md] of Object.entries(J.medidores)) if (requisitosOk(md.requer)) marcar('m:' + id);
  }

  // Avança o jogo por vários segundos de uma vez (aba fechada ou em segundo plano).
  function simular(segundos) {
    const passo = segundos > 5 ? 1 : 0.25;
    for (let restante = segundos; restante >= passo; restante -= passo) tick(passo);
  }

  // ---------- save ----------

  function salvar() {
    if (motor.naoSalvar) return;
    J.estado.ultimoSalvo = Date.now();
    try {
      localStorage.setItem(CHAVE_SAVE, JSON.stringify(J.estado));
    } catch (erro) { /* sem armazenamento disponível: o jogo segue sem salvar */ }
  }

  function carregar() {
    let salvo = null;
    try {
      salvo = JSON.parse(localStorage.getItem(CHAVE_SAVE));
    } catch (erro) { salvo = null; }
    J.estado = aplicarSave(salvo) || estadoNovo();
    descobrir();

    const fora = (Date.now() - J.estado.ultimoSalvo) / 1000;
    if (salvo && fora > 60) {
      const segundos = Math.min(fora, J.config.offlineMaxHoras * 3600);
      motor.quieto = {};
      simular(segundos);
      const avisos = motor.quieto;
      motor.quieto = null;
      for (const [texto, vezes] of Object.entries(avisos)) {
        anotar(texto, true);
        J.estado.diario[0].vezes = vezes;
      }
      anotar('Enquanto você esteve fora, o campo trabalhou por ' + duracao(segundos) + '.');
    }
    motor.sujo = true;
  }

  function aplicarSave(salvo) {
    if (!salvo || typeof salvo !== 'object' || !salvo.recursos || !salvo.construcoes) return null;
    const e = estadoNovo();
    for (const campo of ['recursos', 'construcoes', 'tecnologias', 'precos', 'vistos', 'rivais', 'medidores']) {
      Object.assign(e[campo], salvo[campo]);
    }
    // Descarta o que não existe mais nas tabelas.
    for (const id of Object.keys(e.recursos)) if (!J.recursos[id]) delete e.recursos[id];
    for (const id of Object.keys(e.construcoes)) if (!J.construcoes[id]) delete e.construcoes[id];
    for (const id of Object.keys(e.tecnologias)) if (!J.tecnologias[id]) delete e.tecnologias[id];
    for (const id of Object.keys(e.rivais)) if (!J.rivais[id]) delete e.rivais[id];
    for (const id of Object.keys(e.medidores)) if (!J.medidores[id]) delete e.medidores[id];
    for (const id of Object.keys(e.precos)) if (!J.recursos[id] || !J.recursos[id].preco) delete e.precos[id];
    completar(e);
    if (salvo.ano) e.ano = salvo.ano;
    if (Array.isArray(salvo.diario)) e.diario = salvo.diario.slice(0, MAX_DIARIO);
    if (salvo.eventos && typeof salvo.eventos === 'object') e.eventos = salvo.eventos;
    if (salvo.ultimoSalvo) e.ultimoSalvo = salvo.ultimoSalvo;
    return e;
  }

  function duracao(segundos) {
    if (segundos < 3600) return Math.round(segundos / 60) + ' min';
    return (segundos / 3600).toFixed(1).replace('.', ',') + ' h';
  }

  function exportar() {
    return btoa(unescape(encodeURIComponent(JSON.stringify(J.estado))));
  }

  function importar(texto) {
    let e = null;
    try {
      e = aplicarSave(JSON.parse(decodeURIComponent(escape(atob(texto.trim())))));
    } catch (erro) { e = null; }
    if (!e) return false;
    e.ultimoSalvo = Date.now();
    J.estado = e;
    descobrir();
    motor.sujo = true;
    salvar();
    return true;
  }

  function reiniciar() {
    motor.naoSalvar = true;
    try { localStorage.removeItem(CHAVE_SAVE); } catch (erro) { /* nada a apagar */ }
  }

  Object.assign(motor, {
    estadoNovo, carregar, salvar, exportar, importar, reiniciar,
    tick, simular,
    bonus, limite, custoConstrucao, podePagar, requisitosOk, visto, precoBase, eraAtual,
    agir, comprar, ajustarAtivos, pesquisar, vender, anotar, rendimento, escolher, consequencia,
    capacidade, capacidadeRivais, fatia, custoRival, comprarRival,
    medidorLigado, ritmoMedidor,
  });
  J.motor = motor;
})();
