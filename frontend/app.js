// ── CONFIGURATION ──
const WEBHOOK_URL = 'https://SEU-N8N.app.n8n.cloud/webhook/triagem-ticket';
let ticketCounter = 1017;
let history = [];
let editingIndex = null;

// ── PRESET CASES ──
const PRESETS = [
  {
    id: 1,
    name: "Caso Base – Bug Alta",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Bug · Alta",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1001",
      titulo: "App trava ao abrir tela de pagamento",
      descricao: "Ao tentar abrir a tela de pagamento, o app fecha sozinho após alguns segundos. Testado em Android e iOS.",
      solicitante: "user1@email.com"
    }
  },
  {
    id: 2,
    name: "Dúvida – Produto / Baixa",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Dúvida · Baixa",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1002",
      titulo: "Como alterar minha senha?",
      descricao: "Não encontrei onde posso alterar minha senha no aplicativo.",
      solicitante: "user2@email.com"
    }
  },
  {
    id: 3,
    name: "Problema Operacional",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Problema · Média",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1003",
      titulo: "Cobrança duplicada",
      descricao: "Fui cobrado duas vezes pelo mesmo serviço na fatura deste mês.",
      solicitante: "user3@email.com"
    }
  },
  {
    id: 4,
    name: "Ticket Incompleto – Descrição Vaga",
    type: "warning",
    badge: "warning",
    expectedLabel: "Aviso · Descrição curta",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-1004",
      titulo: "Erro no app",
      descricao: "Não funciona",
      solicitante: "user4@email.com"
    }
  },
  {
    id: 5,
    name: "Campo Faltando – Sem Descrição",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Campo vazio",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-1005",
      titulo: "Erro ao logar",
      descricao: "",
      solicitante: "user5@email.com"
    }
  },
  {
    id: 6,
    name: "Sem Título",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Campo ausente",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-1006",
      titulo: "",
      descricao: "O app não abre desde ontem.",
      solicitante: "user6@email.com"
    }
  },
  {
    id: 7,
    name: "Todos Campos Vazios",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Payload inválido",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "",
      titulo: "",
      descricao: "",
      solicitante: ""
    }
  },
  {
    id: 8,
    name: "Descrição Muito Curta",
    type: "warning",
    badge: "warning",
    expectedLabel: "Aviso · Mínimo 20 chars",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-1008",
      titulo: "Bug",
      descricao: "Erro",
      solicitante: "user8@email.com"
    }
  },
  {
    id: 9,
    name: "Ambíguo – Testa LLM",
    type: "info",
    badge: "info",
    expectedLabel: "LLM · Resultado variável",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1009",
      titulo: "Tela demora muito para carregar",
      descricao: "A tela inicial leva mais de 20 segundos para carregar sempre que abro o app.",
      solicitante: "user9@email.com"
    }
  },
  {
    id: 10,
    name: "Texto Longo – Robustez",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Bug · Alta",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1010",
      titulo: "Erro intermitente ao gerar relatório financeiro",
      descricao: "Desde a última atualização, ao tentar gerar relatórios financeiros no aplicativo, ocorre uma falha intermitente. Em alguns momentos funciona normalmente, mas na maioria das vezes apresenta erro após alguns segundos. Já testei em diferentes redes e dispositivos e o problema persiste.",
      solicitante: "user10@email.com"
    }
  },
  {
    id: 11,
    name: "Campos Extras – Resiliência",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Ignora extras",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1011",
      titulo: "Erro ao atualizar perfil",
      descricao: "Não consigo salvar alterações no meu perfil.",
      solicitante: "user11@email.com",
      prioridade_usuario: "urgente",
      plataforma: "iOS"
    }
  },
  {
    id: 12,
    name: "Payload Malformado",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Campos ausentes",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-1012",
      titulo: "App crasha"
    }
  },
  {
    id: 13,
    name: "LLM Pode Quebrar Parse",
    type: "warning",
    badge: "warning",
    expectedLabel: "LLM · Parse instável",
    expectedStatus: "200 / 500",
    data: {
      ticket_id: "JIRA-1013",
      titulo: "Erro estranho",
      descricao: "asdfasdf qwerqwer zxcvzxcv erro bug problema ???",
      solicitante: "user13@email.com"
    }
  },
  {
    id: 14,
    name: "Dúvida com Contexto Forte",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Dúvida · Baixa",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1014",
      titulo: "Não entendi como funciona o cashback",
      descricao: "Gostaria de saber como funciona o cashback no aplicativo, pois não ficou claro após a compra.",
      solicitante: "user14@email.com"
    }
  },
  {
    id: 15,
    name: "Critico – Sistema Fora do Ar",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Bug · Alta",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1015",
      titulo: "Sistema fora do ar",
      descricao: "Nenhum usuário consegue acessar o sistema desde hoje cedo. Total indisponibilidade.",
      solicitante: "user15@email.com"
    }
  },
  {
    id: 16,
    name: "Edge Case – Misto",
    type: "info",
    badge: "info",
    expectedLabel: "LLM · Bug ou Problema",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-1016",
      titulo: "Erro ao pagar mas não sei se fui cobrado",
      descricao: "Tentei pagar e deu erro, mas apareceu cobrança no cartão.",
      solicitante: "user16@email.com"
    }
  }
];

// ── DOM HELPERS ──
const $ = id => document.getElementById(id);

function generateTicketId() {
  const id = `JIRA-${ticketCounter}`;
  ticketCounter++;
  return id;
}

function updateTicketIdDisplay() {
  const current = `JIRA-${ticketCounter}`;
  $('ticket-id-display').textContent = current;
}

// ── RENDER PRESETS ──
function renderPresets() {
  const grid = $('presets-grid');
  grid.innerHTML = PRESETS.map(p => `
    <button class="preset-btn ${p.type}" onclick="loadPreset(${p.id})" title="${p.name}">
      <span class="preset-number">Caso #${p.id}</span>
      <span class="preset-name">${p.name}</span>
      <span class="preset-badge badge-${p.badge}">${p.expectedLabel}</span>
      <span class="preset-expected">Esperado: ${p.expectedStatus}</span>
    </button>
  `).join('');
}

// ── LOAD PRESET INTO FORM ──
function loadPreset(id) {
  const preset = PRESETS.find(p => p.id === id);
  if (!preset) return;

  const d = preset.data;
  $('field-nome').value = extractName(d.solicitante || '');
  $('field-email').value = d.solicitante || '';
  $('field-titulo').value = d.titulo || '';
  $('field-descricao').value = d.descricao || '';

  // Update ticket ID display to the preset's ID (still editable logic)
  $('ticket-id-display').textContent = d.ticket_id || generateTicketId();

  // Clear any validation errors
  clearErrors();
  showToast(`Caso #${id} carregado`, 'info');

  // Scroll to form
  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function extractName(email) {
  if (!email || !email.includes('@')) return email;
  return email.split('@')[0].replace(/[._]/g, ' ');
}

// ── FORM VALIDATION ──
function validateForm() {
  let valid = true;
  clearErrors();

  const nome = $('field-nome').value.trim();
  const email = $('field-email').value.trim();
  const titulo = $('field-titulo').value.trim();
  const descricao = $('field-descricao').value.trim();

  if (!nome) { showFieldError('field-nome', 'Nome é obrigatório'); valid = false; }
  if (!email) { showFieldError('field-email', 'Email é obrigatório'); valid = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('field-email', 'Email inválido'); valid = false;
  }
  if (!titulo) { showFieldError('field-titulo', 'Título é obrigatório'); valid = false; }

  return valid;
}

function showFieldError(fieldId, msg) {
  const el = $(fieldId);
  el.classList.add('error');
  const hint = el.parentElement.querySelector('.field-hint');
  if (hint) { hint.textContent = msg; hint.style.color = 'var(--error)'; }
}

function clearErrors() {
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
    el.classList.remove('error');
  });
  document.querySelectorAll('.field-hint').forEach(el => {
    el.style.color = '';
    // Reset to original hints
    const fieldId = el.closest('.form-group')?.querySelector('input, textarea')?.id;
    const hints = {
      'field-nome': '',
      'field-email': 'Será usado como identificador do solicitante',
      'field-titulo': '',
      'field-descricao': 'Mínimo de 20 caracteres para classificação confiável'
    };
    if (fieldId && hints[fieldId] !== undefined) {
      el.textContent = hints[fieldId];
    }
  });
}

// ── BUILD PAYLOAD ──
function buildPayload(overrides = {}) {
  const ticketId = $('ticket-id-display').textContent;
  const email = $('field-email').value.trim();
  const titulo = $('field-titulo').value.trim();
  const descricao = $('field-descricao').value.trim();

  return {
    ticket_id: ticketId,
    titulo: titulo,
    descricao: descricao,
    solicitante: email,
    criado_em: new Date().toISOString(),
    ...overrides
  };
}

// ── SEND TO WEBHOOK ──
async function sendToWebhook(payload) {
  const startTime = Date.now();

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const elapsed = Date.now() - startTime;
    let data;
    try {
      data = await response.json();
    } catch {
      data = { raw: await response.text() };
    }

    return { ok: true, status: response.status, data, elapsed };
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: { error: err.message, detail: 'Network error or CORS blocked' },
      elapsed: Date.now() - startTime
    };
  }
}

// ── SHOW RESPONSE ──
function showResponse(result, payload) {
  const container = $('response-content');
  const empty = $('response-empty');

  empty.style.display = 'none';
  container.style.display = 'flex';

  // Status pill
  const statusPill = $('response-status-pill');
  statusPill.className = 'response-status-pill';

  if (result.ok) {
    const statusClass = result.status >= 200 && result.status < 300 ? '200' :
                        result.status >= 400 && result.status < 500 ? '400' : '500';
    statusPill.classList.add(`status-${statusClass}`);
    statusPill.innerHTML = `<span>●</span> HTTP ${result.status}`;
  } else {
    statusPill.classList.add('status-400');
    statusPill.innerHTML = `<span>●</span> Erro de Rede`;
  }

  $('response-time').textContent = `${result.elapsed}ms`;

  // JSON display
  const json = $('response-json');
  json.innerHTML = syntaxHighlight(JSON.stringify(result.data, null, 2));

  // Classification cards
  const classContainer = $('response-classification');
  if (result.data?.tipo || result.data?.severidade || result.data?.time_responsavel) {
    classContainer.style.display = 'grid';
    $('class-tipo').textContent = result.data.tipo || '–';
    $('class-severidade').textContent = result.data.severidade || '–';
    $('class-time').textContent = result.data.time_responsavel || '–';
  } else {
    classContainer.style.display = 'none';
  }
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'json-key' : 'json-string';
    } else if (/true|false/.test(match)) {
      cls = 'json-bool';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

// ── ADD TO HISTORY ──
function addToHistory(payload, result) {
  const entry = {
    id: history.length,
    ticket_id: payload.ticket_id,
    titulo: payload.titulo || '(sem título)',
    descricao: payload.descricao || '(sem descrição)',
    solicitante: payload.solicitante || '(sem email)',
    status: resolveStatus(result),
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    payload: { ...payload },
    response: result
  };
  history.unshift(entry);
  renderHistory();
}

function resolveStatus(result) {
  if (!result.ok) return 'erro';
  if (result.status === 200) return 'sucesso';
  if (result.status === 400) return 'erro';
  if (result.status === 500) return 'erro';
  return 'pending';
}

// ── RENDER HISTORY ──
function renderHistory() {
  const container = $('history-table-container');
  const countEl = $('history-count');

  countEl.textContent = history.length;

  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">Nenhum ticket enviado ainda.</div>';
    return;
  }

  container.innerHTML = `
    <table class="history-table">
      <thead>
        <tr>
          <th>Ticket ID</th>
          <th>Título</th>
          <th>Solicitante</th>
          <th>Descrição</th>
          <th>Status</th>
          <th>Horário</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        ${history.map(entry => `
          <tr>
            <td><span class="history-ticket-id">${entry.ticket_id}</span></td>
            <td><span class="history-title" title="${entry.titulo}">${entry.titulo}</span></td>
            <td style="font-size:11px;color:var(--text-secondary)">${entry.solicitante}</td>
            <td><span class="history-desc" title="${entry.descricao}">${entry.descricao}</span></td>
            <td><span class="status-badge ${entry.status}">${entry.status}</span></td>
            <td><span class="history-time">${entry.timestamp}</span></td>
            <td>
              <div class="action-buttons">
                <button class="btn-edit" onclick="openEditModal(${entry.id})">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Editar
                </button>
                <button class="btn-resend" onclick="resendEntry(${entry.id})">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                  Reenviar
                </button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

// ── SUBMIT HANDLER ──
async function handleSubmit() {
  if (!validateForm()) {
    showToast('Preencha os campos obrigatórios', 'error');
    return;
  }

  const payload = buildPayload();
  setLoading(true);

  const result = await sendToWebhook(payload);

  setLoading(false);
  showResponse(result, payload);
  addToHistory(payload, result);

  // Advance ticket ID
  ticketCounter++;
  updateTicketIdDisplay();

  if (result.ok && result.status === 200) {
    showToast('Ticket enviado com sucesso!', 'success');
  } else if (!result.ok) {
    showToast('Erro de rede. Verifique a URL do webhook.', 'error');
  } else {
    showToast(`Webhook retornou HTTP ${result.status}`, 'warning');
  }
}

// ── RESET FORM ──
function resetForm() {
  $('field-nome').value = '';
  $('field-email').value = '';
  $('field-titulo').value = '';
  $('field-descricao').value = '';
  clearErrors();
  updateTicketIdDisplay();
}

// ── LOADING STATE ──
function setLoading(state) {
  const overlay = $('loading-overlay');
  const btn = $('submit-btn');
  const spinner = $('btn-spinner');
  const btnText = $('btn-text');

  if (state) {
    overlay.style.display = 'flex';
    btn.disabled = true;
    spinner.style.display = 'block';
    btnText.textContent = 'Enviando...';
  } else {
    overlay.style.display = 'none';
    btn.disabled = false;
    spinner.style.display = 'none';
    btnText.textContent = 'Enviar Ticket';
  }
}

// ── TOAST ──
function showToast(msg, type = 'info') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      ${type === 'success' ? '<polyline points="20 6 9 17 4 12"/>' :
        type === 'error' ? '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>' :
        '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'}
    </svg>
    ${msg}
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.25s ease forwards';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// ── EDIT MODAL ──
function openEditModal(id) {
  const entry = history.find(e => e.id === id);
  if (!entry) return;

  editingIndex = id;
  const p = entry.payload;

  $('modal-ticket-id').value = p.ticket_id || '';
  $('modal-titulo').value = p.titulo || '';
  $('modal-descricao').value = p.descricao || '';
  $('modal-solicitante').value = p.solicitante || '';

  $('modal-overlay').classList.add('open');
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  editingIndex = null;
}

async function submitModal() {
  if (editingIndex === null) return;

  const payload = {
    ticket_id: $('modal-ticket-id').value.trim(),
    titulo: $('modal-titulo').value.trim(),
    descricao: $('modal-descricao').value.trim(),
    solicitante: $('modal-solicitante').value.trim(),
    criado_em: new Date().toISOString()
  };

  closeModal();
  setLoading(true);
  const result = await sendToWebhook(payload);
  setLoading(false);

  showResponse(result, payload);
  addToHistory(payload, result);

  showToast('Ticket reenviado com edições', result.ok && result.status === 200 ? 'success' : 'warning');
}

async function resendEntry(id) {
  const entry = history.find(e => e.id === id);
  if (!entry) return;

  const payload = { ...entry.payload, criado_em: new Date().toISOString() };

  setLoading(true);
  const result = await sendToWebhook(payload);
  setLoading(false);

  showResponse(result, payload);
  addToHistory(payload, result);

  showToast(`${entry.ticket_id} reenviado`, result.ok ? 'success' : 'error');
}

// ── WEBHOOK URL EDIT ──
function editWebhookUrl() {
  const url = prompt('URL do Webhook n8n:', WEBHOOK_URL);
  if (url && url.trim()) {
    window.WEBHOOK_URL_OVERRIDE = url.trim();
    showToast('URL do webhook atualizada', 'success');
  }
}

// Override WEBHOOK_URL with dynamic version
const originalSend = sendToWebhook;

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  renderPresets();
  updateTicketIdDisplay();

  // Close modal on overlay click
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });

  // Char counter for description
  $('field-descricao').addEventListener('input', function() {
    const len = this.value.length;
    const hint = this.parentElement.querySelector('.field-hint');
    if (hint) {
      if (len > 0 && len < 20) {
        hint.textContent = `${len}/20 caracteres mínimos`;
        hint.style.color = 'var(--warning)';
      } else if (len >= 20) {
        hint.textContent = `${len} caracteres`;
        hint.style.color = 'var(--success)';
      } else {
        hint.textContent = 'Mínimo de 20 caracteres para classificação confiável';
        hint.style.color = '';
      }
    }
  });

  // Email → Nome autocomplete
  $('field-email').addEventListener('blur', function() {
    const nome = $('field-nome').value.trim();
    if (!nome && this.value.includes('@')) {
      $('field-nome').value = extractName(this.value);
    }
  });
});