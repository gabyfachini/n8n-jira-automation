// ═══════════════════════════════════════════════
// PRESETS — payloads de entrada
// ═══════════════════════════════════════════════
const PRESETS = [
  // ── VÁLIDOS ──
  {
    id: 'bug-app',
    badge: 'ok',
    badgeLabel: '✓ Válido',
    name: 'Bug — App trava (Rede Credenciada)',
    desc: 'Crash no iOS com dados completos',
    payload: {
      ticket_id: 'JIRA-4821',
      titulo: 'App trava ao tentar visualizar Rede Credenciada',
      descricao: 'Desde ontem à tarde, quando tento abrir a seção de rede credenciada no app, a tela carrega por alguns segundos e depois fecha sozinha. Já desinstalei e reinstalei, mas continua acontecendo. iPhone 14, iOS 17.4.',
      solicitante: 'ana.lima@email.com',
      criado_em: '2025-03-10T14:32:00Z'
    }
  },
  {
    id: 'duvida-boleto',
    badge: 'ok',
    badgeLabel: '✓ Válido',
    name: 'Dúvida — Segunda via do boleto',
    desc: 'Dúvida clara com contexto suficiente',
    payload: {
      ticket_id: 'JIRA-4900',
      titulo: 'Como emitir segunda via do boleto pelo app?',
      descricao: 'Preciso pagar minha fatura mas não encontrei onde baixar a segunda via do boleto no aplicativo. Já tentei pelo menu principal, histórico de pagamentos e configurações de conta, mas a opção não aparece. Estou usando Android 13, app versão 4.2.1.',
      solicitante: 'carlos.melo@email.com',
      criado_em: '2025-03-11T09:15:00Z'
    }
  },
  {
    id: 'operacional-lentidao',
    badge: 'ok',
    badgeLabel: '✓ Válido',
    name: 'Problema Operacional — Lentidão no painel',
    desc: 'Problema de performance no backoffice',
    payload: {
      ticket_id: 'JIRA-5103',
      titulo: 'Painel administrativo extremamente lento desde atualização',
      descricao: 'Após a atualização do sistema realizada na sexta-feira (07/03), o painel administrativo está demorando mais de 40 segundos para carregar qualquer relatório. Antes da atualização carregava em menos de 3 segundos. Afeta todos os usuários do time de operações (7 pessoas). Já tentamos limpar cache e acessar de diferentes navegadores sem sucesso.',
      solicitante: 'patricia.ops@alice.com.br',
      criado_em: '2025-03-10T11:00:00Z'
    }
  },
  // ── INCOMPLETOS (passam validação mas LLM retorna incompleto) ──
  {
    id: 'incompleto-vago',
    badge: 'warn',
    badgeLabel: '⚠ Incompleto',
    name: 'Relato vago — "sistema parou"',
    desc: 'Descrição sem contexto para triagem',
    payload: {
      ticket_id: 'JIRA-5001',
      titulo: 'Sistema com problema',
      descricao: 'O sistema parou de funcionar hoje de manhã. Por favor verificar.',
      solicitante: 'joao.silva@email.com',
      criado_em: '2025-03-10T08:00:00Z'
    }
  },
  {
    id: 'incompleto-sem-contexto',
    badge: 'warn',
    badgeLabel: '⚠ Incompleto',
    name: 'Erro sem detalhes de reprodução',
    desc: 'Falta: versão, passos, frequência',
    payload: {
      ticket_id: 'JIRA-5050',
      titulo: 'Não consigo fazer login',
      descricao: 'Não está funcionando o login. Dá um erro.',
      solicitante: 'usuario@email.com',
      criado_em: '2025-03-12T16:45:00Z'
    }
  },
  // ── ERROS DE VALIDAÇÃO ──
  {
    id: 'erro-sem-descricao',
    badge: 'err',
    badgeLabel: '✕ Erro — Campo vazio',
    name: 'Campo obrigatório vazio (descricao)',
    desc: 'Retorna HTTP 400 sem chamar o LLM',
    payload: {
      ticket_id: 'JIRA-5200',
      titulo: 'Erro no pagamento',
      descricao: '',
      solicitante: 'teste@email.com',
      criado_em: '2025-03-10T10:00:00Z'
    }
  },
  {
    id: 'erro-sem-id',
    badge: 'err',
    badgeLabel: '✕ Erro — Campo ausente',
    name: 'ticket_id ausente no payload',
    desc: 'Campo obrigatório faltando no JSON',
    payload: {
      titulo: 'Bug no checkout',
      descricao: 'Ao finalizar a compra o sistema retorna erro 500 sem mensagem de detalhe.',
      solicitante: 'comprador@email.com',
      criado_em: '2025-03-13T14:20:00Z'
    }
  },
  {
    id: 'erro-descricao-curta',
    badge: 'err',
    badgeLabel: '✕ Erro — Desc. curta',
    name: 'Descrição abaixo do mínimo',
    desc: 'Menos de 20 chars → rejeitado na validação',
    payload: {
      ticket_id: 'JIRA-5300',
      titulo: 'Tela branca',
      descricao: 'App bugado.',
      solicitante: 'pedro@email.com',
      criado_em: '2025-03-14T09:00:00Z'
    }
  },
  {
    id: 'erro-json-invalido',
    badge: 'err',
    badgeLabel: '✕ Erro — JSON inválido',
    name: 'JSON malformado',
    desc: 'Sintaxe quebrada — falha antes do webhook',
    payload: '{ "ticket_id": "JIRA-9999", "titulo": "Teste, "descricao": "faltou fechar aspas }'
  }
];

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let activePreset = null;
let requestHistory = [];

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  buildPresets();
  loadPreset('bug-app');

  // Live JSON validation
  document.getElementById('payload-textarea').addEventListener('input', validateJSON);
});

// ═══════════════════════════════════════════════
// BUILD PRESET LIST
// ═══════════════════════════════════════════════
function buildPresets() {
  const container = document.getElementById('preset-list');
  const groups = {
    ok:   { label: 'Payloads válidos', items: [] },
    warn: { label: 'Incompletos (passam validação)', items: [] },
    err:  { label: 'Erros de validação', items: [] }
  };

  PRESETS.forEach(p => groups[p.badge]?.items.push(p));

  Object.entries(groups).forEach(([type, group]) => {
    const label = document.createElement('span');
    label.className = 'preset-section-label';
    label.textContent = group.label;
    container.appendChild(label);

    group.items.forEach(p => {
      const btn = document.createElement('button');
      btn.className = `preset-item ${type === 'err' ? 'preset-error' : ''}`;
      btn.dataset.presetId = p.id;
      btn.innerHTML = `
        <span class="preset-badge badge-${type === 'ok' ? 'ok' : type === 'warn' ? 'warn' : 'err'}">${p.badgeLabel}</span>
        <span class="preset-name">${p.name}</span>
        <span class="preset-desc">${p.desc}</span>
      `;
      btn.addEventListener('click', () => loadPreset(p.id));
      container.appendChild(btn);
    });
  });
}

// ═══════════════════════════════════════════════
// LOAD PRESET INTO EDITOR
// ═══════════════════════════════════════════════
function loadPreset(id) {
  const preset = PRESETS.find(p => p.id === id);
  if (!preset) return;

  activePreset = id;

  // Update active state
  document.querySelectorAll('.preset-item').forEach(el => {
    el.classList.toggle('active', el.dataset.presetId === id);
  });

  const textarea = document.getElementById('payload-textarea');
  if (typeof preset.payload === 'string') {
    textarea.value = preset.payload;
  } else {
    textarea.value = JSON.stringify(preset.payload, null, 2);
  }

  validateJSON();
  clearResponse();
}

// ═══════════════════════════════════════════════
// JSON VALIDATION
// ═══════════════════════════════════════════════
function validateJSON() {
  const val = document.getElementById('payload-textarea').value.trim();
  const indicator = document.getElementById('json-indicator');
  const textarea = document.getElementById('payload-textarea');

  if (!val) {
    indicator.className = 'json-validation neutral';
    indicator.textContent = '— editor vazio';
    textarea.classList.remove('has-error');
    return;
  }

  try {
    JSON.parse(val);
    indicator.className = 'json-validation valid';
    indicator.textContent = '✓ JSON válido';
    textarea.classList.remove('has-error');
  } catch (e) {
    indicator.className = 'json-validation invalid';
    indicator.textContent = `✕ JSON inválido — ${e.message.split('\n')[0]}`;
    textarea.classList.add('has-error');
  }
}

// ═══════════════════════════════════════════════
// COPY WEBHOOK URL
// ═══════════════════════════════════════════════
function copyWebhookUrl() {
  const url = document.getElementById('webhook-url').value;
  navigator.clipboard.writeText(url).then(() => {
    const btn = document.getElementById('copy-url-btn');
    btn.textContent = 'copiado!';
    setTimeout(() => btn.textContent = 'copiar', 1500);
  });
}

// ═══════════════════════════════════════════════
// SEND REQUEST
// ═══════════════════════════════════════════════
async function sendRequest() {
  const rawPayload = document.getElementById('payload-textarea').value.trim();
  const webhookUrl = document.getElementById('webhook-url').value.trim();
  const btn = document.getElementById('send-btn');

  // Validate JSON first
  let parsedPayload;
  try {
    parsedPayload = JSON.parse(rawPayload);
  } catch (e) {
    showClientError('JSON inválido', `O payload não é um JSON válido e não pode ser enviado.\n${e.message}`);
    return;
  }

  if (!webhookUrl) {
    showClientError('URL do webhook vazia', 'Informe a URL do webhook do n8n antes de enviar.');
    return;
  }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Enviando...';
  showLoading();

  const startTime = Date.now();

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsedPayload)
    });

    const elapsed = Date.now() - startTime;
    let responseData;

    try {
      responseData = await response.json();
    } catch {
      responseData = { error: 'Resposta não é JSON válido' };
    }

    addToHistory(parsedPayload, response.status, responseData);
    showResponse(response.status, responseData, elapsed, parsedPayload);

  } catch (err) {
    const elapsed = Date.now() - startTime;
    const isNetworkErr = err.name === 'TypeError' && err.message.includes('fetch');
    showNetworkError(
      isNetworkErr
        ? 'Não foi possível conectar ao webhook. Verifique se o n8n está rodando e a URL está correta.'
        : err.message,
      elapsed
    );
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<span>▶</span> Enviar para o n8n';
  }
}

// ═══════════════════════════════════════════════
// SHOW RESPONSE
// ═══════════════════════════════════════════════
function showLoading() {
  const panel = document.getElementById('response-panel');
  panel.className = 'response-panel visible card';
  panel.innerHTML = `
    <div class="card-body">
      <div class="status-bar loading">
        <span class="spinner" style="width:14px;height:14px;border-width:2px"></span>
        Aguardando resposta do n8n...
      </div>
    </div>`;
}

function clearResponse() {
  const panel = document.getElementById('response-panel');
  panel.className = 'response-panel';
  panel.innerHTML = '';
}

function showClientError(title, msg) {
  const panel = document.getElementById('response-panel');
  panel.className = 'response-panel visible card';
  panel.innerHTML = `
    <div class="card-body">
      <div class="status-bar error">
        <span>✕</span> ${title}
      </div>
      <div class="detail-box error-box">
        <div class="detail-title">Erro no cliente</div>
        <div class="detail-msg">${msg}</div>
      </div>
    </div>`;
}

function showNetworkError(msg, elapsed) {
  const panel = document.getElementById('response-panel');
  panel.className = 'response-panel visible card';
  panel.innerHTML = `
    <div class="card-body">
      <div class="status-bar error">
        <span>✕</span> Falha de conexão
        <span class="status-code">${elapsed}ms</span>
      </div>
      <div class="detail-box error-box">
        <div class="detail-title">Não foi possível alcançar o webhook</div>
        <div class="detail-msg">${msg}</div>
      </div>
    </div>`;
}

function showResponse(httpStatus, data, elapsed, sentPayload) {
  const panel = document.getElementById('response-panel');
  panel.className = 'response-panel visible card';

  const status = data.status || '';
  const isSuccess = status === 'sucesso' || httpStatus === 200 && !data.error;
  const isError = httpStatus >= 400 || status.startsWith('erro');
  const isIncomplete = status === 'incompleto';

  let statusBar = '';
  if (isSuccess && !isIncomplete) {
    statusBar = `<div class="status-bar success"><span>✓</span> Triagem concluída com sucesso <span class="status-code">HTTP ${httpStatus} · ${elapsed}ms</span></div>`;
  } else if (isIncomplete) {
    statusBar = `<div class="status-bar warning"><span>⚠</span> Ticket incompleto — fluxo encerrado sem triagem <span class="status-code">HTTP ${httpStatus} · ${elapsed}ms</span></div>`;
  } else if (isError) {
    statusBar = `<div class="status-bar error"><span>✕</span> Erro na triagem <span class="status-code">HTTP ${httpStatus} · ${elapsed}ms</span></div>`;
  } else {
    statusBar = `<div class="status-bar loading"><span>ℹ</span> Resposta recebida <span class="status-code">HTTP ${httpStatus} · ${elapsed}ms</span></div>`;
  }

  let content = '';

  if (isSuccess && !isIncomplete && data.tipo) {
    content = `
      <div class="result-content">
        <div class="result-fields">
          ${field('ticket_id', data.ticket_id)}
          ${fieldChip('tipo', data.tipo, chipClass('tipo', data.tipo))}
          ${fieldChip('severidade', data.severidade, chipClass('sev', data.severidade))}
          ${fieldChip('time_responsavel', data.time_responsavel, chipClass('time', data.time_responsavel))}
        </div>
        <div class="raw-response">
          <div class="raw-response-header">
            <span class="raw-label">JSON da resposta</span>
            <button class="raw-copy" onclick="copyRaw()">copiar</button>
          </div>
          <pre class="raw-pre" id="raw-json">${escapeHTML(JSON.stringify(data, null, 2))}</pre>
        </div>
      </div>`;
  } else if (isIncomplete) {
    content = `
      <div class="result-content">
        <div class="detail-box warn-box">
          <div class="detail-title">⚠ Ticket marcado como incompleto</div>
          <div class="detail-msg"><strong>ID:</strong> ${data.ticket_id || sentPayload?.ticket_id || '—'}<br><strong>Motivo:</strong> ${data.motivo || 'Relato vago demais para triagem confiante'}</div>
        </div>
        <div class="raw-response">
          <div class="raw-response-header">
            <span class="raw-label">JSON da resposta</span>
            <button class="raw-copy" onclick="copyRaw()">copiar</button>
          </div>
          <pre class="raw-pre" id="raw-json">${escapeHTML(JSON.stringify(data, null, 2))}</pre>
        </div>
      </div>`;
  } else {
    content = `
      <div class="result-content">
        <div class="detail-box error-box">
          <div class="detail-title">Detalhe do erro</div>
          <div class="detail-msg">${data.motivo || data.error || data.message || 'Sem detalhe disponível'}</div>
        </div>
        <div class="raw-response">
          <div class="raw-response-header">
            <span class="raw-label">JSON da resposta</span>
            <button class="raw-copy" onclick="copyRaw()">copiar</button>
          </div>
          <pre class="raw-pre" id="raw-json">${escapeHTML(JSON.stringify(data, null, 2))}</pre>
        </div>
      </div>`;
  }

  panel.innerHTML = `<div class="card-body">${statusBar}${content}</div>`;
}

// ═══════════════════════════════════════════════
// HISTORY
// ═══════════════════════════════════════════════
function addToHistory(payload, httpStatus, responseData) {
  const status = responseData?.status || '';
  const type = httpStatus >= 400 || status.startsWith('erro') ? 'err'
    : status === 'incompleto' ? 'warn' : 'ok';

  requestHistory.unshift({
    id: payload.ticket_id || '—',
    title: payload.titulo || 'sem título',
    type,
    time: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    payload,
    httpStatus,
    responseData
  });

  if (requestHistory.length > 8) requestHistory.pop();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const section = document.getElementById('history-section');

  if (requestHistory.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = requestHistory.map((item, i) => `
    <div class="history-item" onclick="loadFromHistory(${i})">
      <span class="history-status hs-${item.type}"></span>
      <span class="history-id">${item.id}</span>
      <span class="history-title-text">${item.title}</span>
      <span class="history-time">${item.time}</span>
    </div>
  `).join('');
}

function loadFromHistory(idx) {
  const item = requestHistory[idx];
  if (!item) return;

  document.querySelectorAll('.preset-item').forEach(el => el.classList.remove('active'));
  document.getElementById('payload-textarea').value = JSON.stringify(item.payload, null, 2);
  validateJSON();
  showResponse(item.httpStatus, item.responseData, 0, item.payload);
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function field(key, val) {
  return `<div class="result-field">
    <span class="result-field-key">${key}</span>
    <span class="result-field-val">${val || '—'}</span>
  </div>`;
}

function fieldChip(key, val, cls) {
  return `<div class="result-field">
    <span class="result-field-key">${key}</span>
    <span class="chip ${cls}">${val || '—'}</span>
  </div>`;
}

function chipClass(type, val) {
  const map = {
    tipo: { Bug: 'chip-bug', Dúvida: 'chip-duvida', 'Problema operacional': 'chip-operacional' },
    sev:  { Alta: 'chip-alta', Média: 'chip-media', Baixa: 'chip-baixa' },
    time: { Engenharia: 'chip-eng', Produto: 'chip-prod', Operações: 'chip-ops' }
  };
  return map[type]?.[val] || '';
}

function escapeHTML(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function copyRaw() {
  const pre = document.getElementById('raw-json');
  if (!pre) return;
  navigator.clipboard.writeText(pre.textContent).then(() => {
    const btn = document.querySelector('.raw-copy');
    if (btn) { btn.textContent = 'copiado!'; setTimeout(() => btn.textContent = 'copiar', 1500); }
  });
}