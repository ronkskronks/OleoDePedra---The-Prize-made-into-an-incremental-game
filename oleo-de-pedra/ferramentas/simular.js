// Joga o jogo sozinho, sem tela, para medir o ritmo depois de mexer nos números.
// Uso:  node ferramentas/simular.js [tecnologia ou evento alvo] [quantas partidas]
// Ex.:  node ferramentas/simular.js standard 5

const fs = require('fs');
const path = require('path');
const raiz = path.join(__dirname, '..');
const alvo = process.argv[2] || 'standard';
const partidas = Number(process.argv[3]) || 5;
const LIMITE_HORAS = 48;
// Cliques por segundo do jogador simulado. Ex.:  CLIQUES=0.3 node ferramentas/simular.js
const CLIQUES = process.env.CLIQUES === undefined ? 2 : Number(process.env.CLIQUES);

global.JOGO = {};
global.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
for (const f of ['dados/config.js', 'dados/recursos.js', 'dados/acoes.js', 'dados/construcoes.js', 'dados/tecnologias.js', 'dados/eventos.js', 'dados/rivais.js', 'dados/medidores.js', 'motor/validar.js', 'motor/nucleo.js']) {
  (0, eval)(fs.readFileSync(path.join(raiz, f), 'utf8'));
}
const J = JOGO, M = J.motor;
const erros = J.validar();
if (erros.length) { console.log(erros.join('\n')); process.exit(1); }
if (!J.tecnologias[alvo] && !J.eventos[alvo]) { console.log('Não existe tecnologia nem evento chamado "' + alvo + '".'); process.exit(1); }

function hora(s) {
  return Math.floor(s / 3600) + 'h' + String(Math.floor(s % 3600 / 60)).padStart(2, '0');
}

// Jogador simples: clica (2x por segundo, se não mudar CLIQUES), pesquisa o que der, mantém espaço
// de estoque, não vende o insumo das refinarias e compra a construção mais
// barata que couber no bolso.
function jogar() {
  J.estado = M.estadoNovo();
  const e = J.estado;
  const marcos = [];
  const vistosEventos = {};
  let cliques = 0, compras = 0;
  for (let t = 0; t < LIMITE_HORAS * 3600; t++) {
    M.tick(1);
    const vezes = Math.floor(CLIQUES) + (Math.random() < CLIQUES % 1 ? 1 : 0);
    for (let i = 0; i < vezes; i++) {
      const acoes = Object.keys(J.acoes).filter((aid) => M.visto('a:' + aid));
      const cheio = (aid) => Object.keys(J.acoes[aid].ganha || {}).every((rid) => e.recursos[rid].qtd >= M.limite(rid));
      const aid = acoes.filter((a) => !cheio(a))[(t + i) % Math.max(1, acoes.filter((a) => !cheio(a)).length)];
      if (aid && M.agir(aid)) cliques++;
    }
    for (const [rid, r] of Object.entries(J.recursos)) {
      if (!r.preco) continue;
      const cheio = e.recursos[rid].qtd >= M.limite(rid) * 0.9;
      const insumo = Object.entries(J.construcoes).some(([cid, c]) => c.consome && c.consome[rid] && e.construcoes[cid].qtd > 0);
      if (cheio) M.vender(rid, e.recursos[rid].qtd * (insumo ? 0.5 : 1));
    }
    // Nas decisões, fica com a primeira opção que puder pagar.
    for (const id of e.eventos.pendentes.slice()) {
      J.eventos[id].escolhas.some((o, i) => M.escolher(id, i) && marcos.push(hora(t) + ' [' + id + '] ' + o.nome));
    }
    for (const tid of Object.keys(J.tecnologias)) {
      if (!e.tecnologias[tid] && M.visto('t:' + tid) && M.pesquisar(tid)) marcos.push(hora(t) + ' ' + tid);
    }
    for (const vid of Object.keys(J.rivais)) {
      if (!e.rivais[vid] && M.visto('v:' + vid) && M.comprarRival(vid)) marcos.push(hora(t) + ' [rival] ' + vid);
    }
    for (const eid of Object.keys(e.eventos.feitos)) {
      if (!vistosEventos[eid]) { vistosEventos[eid] = true; marcos.push(hora(t) + ' (evento) ' + eid); }
    }
    if (e.tecnologias[alvo] || e.eventos.feitos[alvo]) return { t, marcos, cliques, compras };
    // Se uma refinaria está parada por falta de insumo, desliga um vendedor desse insumo.
    for (const [cid, c] of Object.entries(J.construcoes)) {
      if (!c.consome || !e.construcoes[cid].ativos || M.fatores[cid] > 0.5) continue;
      for (const [vid, v] of Object.entries(J.construcoes)) {
        if (v.vende && Object.keys(c.consome).some((rid) => v.vende[rid])) M.ajustarAtivos(vid, -1);
      }
    }
    // Guarda dinheiro para a pesquisa à vista mais barata, se já estiver perto.
    let reserva = 0;
    for (const [tid, tec] of Object.entries(J.tecnologias)) {
      if (e.tecnologias[tid] || !M.visto('t:' + tid)) continue;
      const falta = Object.entries(tec.custo || {}).filter(([rid, v]) => rid !== J.config.moeda && e.recursos[rid].qtd < v);
      if (!falta.length) reserva = Math.max(reserva, (tec.custo || {})[J.config.moeda] || 0);
    }
    let meta = Infinity;
    for (const vid of Object.keys(J.rivais)) {
      if (!e.rivais[vid] && M.visto('v:' + vid)) meta = Math.min(meta, M.custoRival(vid)[J.config.moeda] || Infinity);
    }
    for (const [tid, tec] of Object.entries(J.tecnologias)) {
      if (!e.tecnologias[tid] && M.visto('t:' + tid) && (tec.custo || {})[J.config.moeda]) meta = Math.min(meta, tec.custo[J.config.moeda]);
    }
    const opcoes = Object.keys(J.construcoes).filter((cid) => M.visto('c:' + cid)).map((cid) => {
      const custo = M.custoConstrucao(cid);
      return { cid, custo, preco: custo[J.config.moeda] || 0 };
    }).sort((a, b) => a.preco - b.preco);
    const serve = (o) => {
      const c = J.construcoes[o.cid];
      // Só aumenta o estoque quando ele está apertado.
      if (c.armazena && !c.produz && Object.keys(c.armazena).every((rid) => e.recursos[rid].qtd < M.limite(rid) * 0.8)) return false;
      // Estoque é acessório: não torra nele o dinheiro da meta.
      if (c.armazena && !c.produz && meta < Infinity && o.preco > meta * 0.05) return false;
      // Só contrata mais vendedores quando o produto está sobrando.
      if (c.vende && Object.keys(c.vende).some((rid) => e.recursos[rid].qtd < M.limite(rid) * 0.5)) return false;
      // Compra pelo que está faltando: não aumenta a produção do que sobra
      // no estoque, nem o consumo do que está em falta.
      const finito = (rid) => M.limite(rid) !== Infinity;
      if (c.produz && !c.armazena && e.construcoes[o.cid].qtd > 0 && Object.keys(c.produz).every((rid) => finito(rid) && e.recursos[rid].qtd > M.limite(rid) * 0.5)) return false;
      if (c.consome && e.construcoes[o.cid].qtd > 0 && Object.keys(c.consome).some((rid) => finito(rid) && e.recursos[rid].qtd < M.limite(rid) * 0.1)) return false;
      // Não fura sem parar nem compra insumo que as refinarias não estão pedindo.
      if (c.esgota && e.construcoes[o.cid].qtd >= 6) return false;
      if (c.consome && c.consome[J.config.moeda] && e.construcoes[o.cid].qtd > 0 && Object.keys(c.produz).every((rid) => e.recursos[rid].qtd > M.limite(rid) * 0.2)) return false;
      // Junta dinheiro para a meta (rival ou pesquisa mais barata à vista):
      // só gasta em construção que custe uma fração pequena dela.
      if (meta < Infinity && o.preco > meta * 0.6 && e.recursos[J.config.moeda].qtd - o.preco < meta) return false;
      if (e.recursos[J.config.moeda].qtd - o.preco < reserva) return false;
      return true;
    };
    // O que dá dinheiro (fabrica ou vende produto com preço) vem primeiro:
    // o resto só entra se custar uma fração pequena disso.
    const rende = (c) => !!c.vende || Object.keys(c.produz || {}).some((rid) => J.recursos[rid].preco);
    const boas = opcoes.filter(serve);
    // Pesquisa à vista que não cabe no limite de algum recurso (conhecimento):
    // aumentar esse limite passa na frente de tudo.
    const apertado = {};
    for (const [tid, tec] of Object.entries(J.tecnologias)) {
      if (e.tecnologias[tid] || !M.visto('t:' + tid)) continue;
      for (const [rid, v] of Object.entries(tec.custo || {})) if (v > M.limite(rid)) apertado[rid] = true;
    }
    const destrava = opcoes.find((o) => Object.keys(J.construcoes[o.cid].armazena || {}).some((rid) => apertado[rid]));
    if (destrava) {
      if (M.podePagar(destrava.custo) && M.comprar(destrava.cid)) compras++;
      continue;
    }
    const alvoCompra = boas.find((o) => rende(J.construcoes[o.cid]));
    for (const o of boas) {
      if (alvoCompra && !rende(J.construcoes[o.cid]) && o.preco > alvoCompra.preco * 0.1) continue;
      if (M.podePagar(o.custo) && M.comprar(o.cid)) { compras++; break; }
    }
  }
  return { t: null, marcos, cliques, compras };
}

const tempos = [];
for (let i = 0; i < partidas; i++) {
  const r = jogar();
  tempos.push(r.t);
  console.log('Partida ' + (i + 1) + ': ' + (r.t === null ? 'não chegou em ' + LIMITE_HORAS + 'h' : hora(r.t)) + '  (' + r.cliques + ' cliques, ' + r.compras + ' compras)');
  if (i === 0) {
    console.log('  ' + r.marcos.join('\n  '));
    console.log('  no fim: ' + Object.entries(J.estado.construcoes).map(([cid, c]) => cid + ' ×' + c.qtd + (c.feitos ? ' (' + c.feitos + ' furados)' : '')).join(', '));
  }
}
const ok = tempos.filter((t) => t !== null);
if (ok.length) console.log('Média até "' + alvo + '": ' + hora(ok.reduce((a, b) => a + b, 0) / ok.length));
