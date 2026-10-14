// Confere as tabelas de dados antes de o jogo começar e devolve uma
// lista de problemas em português, para erro de digitação não virar
// tela branca.

(function () {
  'use strict';

  const J = JOGO;
  const TABELAS = {
    config: 'dados/config.js',
    recursos: 'dados/recursos.js',
    acoes: 'dados/acoes.js',
    construcoes: 'dados/construcoes.js',
    tecnologias: 'dados/tecnologias.js',
    eventos: 'dados/eventos.js',
    rivais: 'dados/rivais.js',
    medidores: 'dados/medidores.js',
  };

  J.validar = function () {
    const erros = [];

    for (const [tabela, arquivo] of Object.entries(TABELAS)) {
      if (!J[tabela]) {
        erros.push('O arquivo ' + arquivo + ' não carregou. Costuma ser vírgula, chave { } ou aspas faltando.');
      }
    }
    if (erros.length) return erros;

    const recurso = (rid, onde) => {
      if (!J.recursos[rid]) erros.push(onde + ': o recurso "' + rid + '" não existe em dados/recursos.js.');
    };
    const mapaDeRecursos = (mapa, onde) => {
      for (const [rid, v] of Object.entries(mapa || {})) {
        recurso(rid, onde);
        if (typeof v !== 'number' || !(v > 0)) erros.push(onde + ': o valor de "' + rid + '" precisa ser um número maior que zero.');
      }
    };
    const requer = (r, onde) => {
      if (!r) return;
      for (const tid of r.tecnologias || []) {
        if (!J.tecnologias[tid]) erros.push(onde + ': requer a tecnologia "' + tid + '", que não existe.');
      }
      for (const cid of Object.keys(r.construcoes || {})) {
        if (!J.construcoes[cid]) erros.push(onde + ': requer a construção "' + cid + '", que não existe.');
      }
      for (const rid of Object.keys(r.recursos || {})) recurso(rid, onde);
      for (const [rid, f] of Object.entries(r.fatia || {})) {
        recurso(rid, onde + ' (fatia)');
        if (!(f > 0 && f <= 1)) erros.push(onde + ' (fatia): "' + rid + '" é uma fração entre 0 e 1 (ex.: 0.5 = metade do mercado).');
      }
      for (const eid of r.eventos || []) {
        if (!J.eventos[eid]) erros.push(onde + ': requer o evento "' + eid + '", que não existe.');
        else if (J.eventos[eid].repete) erros.push(onde + ': requer o evento "' + eid + '", mas evento com "repete" não serve de requisito.');
      }
      for (const mid of Object.keys(r.medidores || {})) medidor(mid, onde);
    };
    const medidor = (mid, onde) => {
      if (!J.medidores[mid]) erros.push(onde + ': o medidor "' + mid + '" não existe em dados/medidores.js.');
    };
    const mover = (m, onde) => {
      for (const [mid, v] of Object.entries(m || {})) {
        medidor(mid, onde + ' (move)');
        if (typeof v !== 'number' || !v) erros.push(onde + ' (move): o valor de "' + mid + '" precisa ser um número (negativo para baixar).');
      }
    };
    // Multiplicadores: valem para bônus de tecnologia, efeito de evento e de rival comprado.
    const multiplicadores = (m, onde) => {
      for (const tipo of Object.keys(m || {})) {
        if (['producao', 'armazenamento', 'reserva'].includes(tipo)) {
          for (const cid of Object.keys(m[tipo])) {
            if (!J.construcoes[cid]) erros.push(onde + ' (' + tipo + '): a construção "' + cid + '" não existe.');
            else if (tipo === 'reserva' && !J.construcoes[cid].esgota) erros.push(onde + ' (reserva): a construção "' + cid + '" não tem "esgota".');
          }
        } else if (['preco', 'mercado', 'aquisicao'].includes(tipo)) {
          for (const rid of Object.keys(m[tipo])) recurso(rid, onde + ' (' + tipo + ')');
        } else if (tipo === 'medidor') {
          for (const mid of Object.keys(m[tipo])) medidor(mid, onde + ' (medidor)');
        } else {
          erros.push(onde + ': não existe multiplicador do tipo "' + tipo + '". Use producao, armazenamento, reserva, preco, mercado, aquisicao ou medidor.');
        }
      }
    };

    recurso(J.config.moeda, 'dados/config.js (moeda)');

    for (const [id, a] of Object.entries(J.acoes)) {
      const onde = 'Ação "' + id + '"';
      mapaDeRecursos(a.ganha, onde);
      mapaDeRecursos(a.gasta, onde);
      mover(a.move, onde);
      requer(a.requer, onde);
    }

    for (const [id, c] of Object.entries(J.construcoes)) {
      const onde = 'Construção "' + id + '"';
      for (const campo of ['custo', 'produz', 'consome', 'vende', 'armazena']) mapaDeRecursos(c[campo], onde + ' (' + campo + ')');
      for (const rid of Object.keys(c.vende || {})) {
        if (J.recursos[rid] && !J.recursos[rid].preco) erros.push(onde + ': vende "' + rid + '", mas esse recurso não tem preco em dados/recursos.js.');
      }
      for (const rid of Object.keys(c.armazena || {})) {
        if (J.recursos[rid] && J.recursos[rid].limite === undefined) erros.push(onde + ': armazena "' + rid + '", mas esse recurso não tem limite.');
      }
      requer(c.requer, onde);
      const g = c.esgota;
      if (g) {
        if (!c.produz) erros.push(onde + ': tem "esgota", mas não produz nada.');
        if (typeof g.reserva !== 'number' || !(g.reserva > 0)) erros.push(onde + ' (esgota): "reserva" precisa ser um número maior que zero.');
        for (const campo of ['variacao', 'seco', 'abandono']) {
          if (g[campo] !== undefined && !(g[campo] >= 0 && g[campo] < 1)) erros.push(onde + ' (esgota): "' + campo + '" precisa ficar entre 0 e 1 (ex.: 0.1 = 10%).');
        }
      }
    }

    for (const [id, t] of Object.entries(J.tecnologias)) {
      const onde = 'Tecnologia "' + id + '"';
      mapaDeRecursos(t.custo, onde + ' (custo)');
      mapaDeRecursos(t.concede, onde + ' (concede)');
      requer(t.requer, onde);
      multiplicadores(t.bonus, onde + ' (bônus)');
    }

    // O que um evento (ou uma escolha dele) pode fazer.
    const consequencia = (c, onde) => {
      mapaDeRecursos(c.concede, onde + ' (concede)');
      for (const [rid, v] of Object.entries(c.perde || {})) {
        recurso(rid, onde + ' (perde)');
        if (!(v > 0 && v <= 1)) erros.push(onde + ' (perde): "' + rid + '" é uma fração entre 0 e 1 (ex.: 0.3 = perde 30%).');
      }
      for (const cid of Object.keys(c.destroi || {})) {
        if (!J.construcoes[cid]) erros.push(onde + ' (destroi): a construção "' + cid + '" não existe.');
      }
      multiplicadores(c.efeito, onde + ' (efeito)');
      mover(c.move, onde);
      for (const [cid, d] of Object.entries(c.desmembra || {})) {
        if (!J.construcoes[cid]) erros.push(onde + ' (desmembra): a construção "' + cid + '" não existe.');
        if (!d || !(d.perde > 0 && d.perde <= 1)) erros.push(onde + ' (desmembra): "perde" de "' + cid + '" é uma fração entre 0 e 1.');
        else mapaDeRecursos(d.rende, onde + ' (desmembra, rende)');
      }
      if (c.duracao !== undefined && !(c.duracao > 0)) erros.push(onde + ': "duracao" precisa ser um número de segundos maior que zero.');
    };

    for (const [id, ev] of Object.entries(J.eventos)) {
      const onde = 'Evento "' + id + '"';
      if (!ev.nome) erros.push(onde + ': falta o "nome".');
      requer(ev.requer, onde);
      requer(ev.ate, onde + ' (ate)');
      if (ev.repete !== undefined && !(ev.repete > 0)) erros.push(onde + ': "repete" precisa ser um número de segundos maior que zero.');
      if (ev.ate && !ev.repete) erros.push(onde + ': "ate" só vale para evento com "repete".');
      if (Array.isArray(ev.texto) && !ev.texto.length) erros.push(onde + ': a lista de "texto" está vazia.');
      consequencia(ev, onde);
      if (ev.escolhas) {
        if (!Array.isArray(ev.escolhas) || ev.escolhas.length < 2) erros.push(onde + ': "escolhas" precisa de pelo menos duas opções.');
        else {
          if (!ev.escolhas.some((o) => !o.custo)) erros.push(onde + ': pelo menos uma escolha tem de ser de graça (sem "custo"), senão o jogador pode ficar travado.');
          if (ev.efeito || ev.concede || ev.perde || ev.destroi || ev.move || ev.desmembra) erros.push(onde + ': evento com "escolhas" põe os efeitos dentro de cada escolha, não no evento.');
          ev.escolhas.forEach((o, i) => {
            const ondeO = onde + ', escolha ' + (i + 1);
            if (!o.nome) erros.push(ondeO + ': falta o "nome".');
            mapaDeRecursos(o.custo, ondeO + ' (custo)');
            consequencia(o, ondeO);
          });
        }
      }
    }

    for (const [id, r] of Object.entries(J.rivais)) {
      const onde = 'Rival "' + id + '"';
      if (!r.nome) erros.push(onde + ': falta o "nome".');
      if (!r.produto) erros.push(onde + ': falta o "produto" (o recurso que ele fabrica).');
      else recurso(r.produto, onde + ' (produto)');
      if (typeof r.tamanho !== 'number' || !(r.tamanho > 0)) erros.push(onde + ': "tamanho" precisa ser um número maior que zero.');
      mapaDeRecursos(r.custo, onde + ' (custo)');
      for (const [cid, n] of Object.entries(r.entrega || {})) {
        if (!J.construcoes[cid]) erros.push(onde + ' (entrega): a construção "' + cid + '" não existe.');
        else if (J.construcoes[cid].esgota) erros.push(onde + ' (entrega): "' + cid + '" se esgota e não pode ser entregue.');
        if (!(n > 0)) erros.push(onde + ' (entrega): a quantidade de "' + cid + '" precisa ser maior que zero.');
      }
      multiplicadores(r.efeito, onde + ' (efeito)');
      requer(r.requer, onde);
      requer(r.surge, onde + ' (surge)');
    }

    for (const [id, r] of Object.entries(J.recursos)) {
      for (const tipo of Object.keys(r.multiplica || {})) {
        if (!['producao', 'armazenamento'].includes(tipo)) erros.push('Recurso "' + id + '" (multiplica): só vale producao ou armazenamento.');
      }
    }

    for (const [id, md] of Object.entries(J.medidores)) {
      const onde = 'Medidor "' + id + '"';
      if (!md.nome) erros.push(onde + ': falta o "nome".');
      requer(md.requer, onde);
      requer(md.ate, onde + ' (ate)');
      for (const regra of md.cresce || []) {
        if (typeof regra.taxa !== 'number') erros.push(onde + ' (cresce): toda linha precisa de "taxa".');
        requer(regra.quando, onde + ' (cresce)');
      }
    }

    return erros;
  };
})();
