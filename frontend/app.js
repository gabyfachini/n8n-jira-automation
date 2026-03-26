// ── CONFIGURATION ──
const WEBHOOK_URL = 'http://localhost:5678/webhook-test/triagem-ticket';
let ticketCounter = 1017;
let history = [];

// ── PRESET CASES ──
// Sorted: Success → Warning/Incomplete → Error
const PRESETS = [
  // ── SUCCESS ──
  {
    id: 1,
    name: "Happy Path – Bug Crítico",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Bug · Alta",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-3001",
      title: "Sistema fora do ar",
      description: "Nenhum usuário consegue acessar a plataforma desde hoje cedo. Total indisponibilidade.",
      requester_name: "João Silva",
      requester_email: "user1@email.com"
    }
  },
  {
    id: 2,
    name: "Dúvida – Produto",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Dúvida · Baixa",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-3002",
      title: "Como alterar senha?",
      description: "Não encontrei onde posso alterar minha senha dentro do sistema.",
      requester_name: "Maria Souza",
      requester_email: "user2@email.com"
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
      ticket_id: "JIRA-3003",
      title: "Sistema lento",
      description: "O sistema está demorando muito para responder desde ontem à noite.",
      requester_name: "Carlos Lima",
      requester_email: "user3@email.com"
    }
  },

  // ── EDGE / LLM ──
  {
    id: 4,
    name: "Ambíguo – Bug ou Performance",
    type: "info",
    badge: "info",
    expectedLabel: "LLM · Bug ou Problema",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-3004",
      title: "Tela demora e trava",
      description: "A tela demora muito para carregar e às vezes parece travada.",
      requester_name: "Fernanda Lima",
      requester_email: "user4@email.com"
    }
  },
  {
    id: 5,
    name: "Campos Extras – Ignorar",
    type: "success",
    badge: "success",
    expectedLabel: "Sucesso · Ignora extras",
    expectedStatus: "200 OK",
    data: {
      ticket_id: "JIRA-3005",
      title: "Erro ao atualizar perfil",
      description: "Não consigo salvar alterações no meu perfil.",
      requester_name: "Usuário Extra",
      requester_email: "user5@email.com",
      prioridade_usuario: "alta",
      origem: "mobile"
    }
  },

  // ── WARNING ──
  {
    id: 6,
    name: "Descrição Muito Curta",
    type: "warning",
    badge: "warning",
    expectedLabel: "Aviso · Descrição insuficiente",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-3006",
      title: "Erro",
      description: "Não funciona",
      requester_name: "Ana Costa",
      requester_email: "user6@email.com"
    }
  },
  {
    id: 7,
    name: "Descrição Vazia",
    type: "warning",
    badge: "warning",
    expectedLabel: "Incompleto · Campo obrigatório",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-3007",
      title: "Erro no app",
      description: "",
      requester_name: "Bruno Alves",
      requester_email: "user7@email.com"
    }
  },
  {
    id: 8,
    name: "LLM Pode Falhar Parse",
    type: "warning",
    badge: "warning",
    expectedLabel: "LLM · Parse instável",
    expectedStatus: "200 / 500",
    data: {
      ticket_id: "JIRA-3008",
      title: "Erro estranho",
      description: "asdf qwer zxcv erro bug ??? comportamento inconsistente",
      requester_name: "Teste User",
      requester_email: "user8@email.com"
    }
  },

  // ── ERROR ──
  {
    id: 9,
    name: "Campo Faltando",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Campo ausente",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "JIRA-3009",
      title: "Erro ao logar",
      requester_name: "Carlos Silva",
      requester_email: "user9@email.com"
    }
  },
  {
    id: 10,
    name: "Payload Totalmente Inválido",
    type: "error",
    badge: "error",
    expectedLabel: "Erro · Payload inválido",
    expectedStatus: "400 Bad Request",
    data: {
      ticket_id: "",
      title: "",
      description: "",
      requester_name: "",
      requester_email: ""
    }
  }
];

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

function loadPreset(id) {
  const preset = PRESETS.find(p => p.id === id);
  if (!preset) return;

  const d = preset.data;
  $('field-nome').value = d.requester_name || extractName(d.requester_email || '');
  $('field-email').value = d.requester_email || '';
  $('field-titulo').value = d.title || '';
  $('field-descricao').value = d.description || '';
  $('ticket-id-display').textContent = d.ticket_id || generateTicketId();

  clearErrors();
  showToast(`Caso #${id} carregado`, 'info');

  document.querySelector('.form-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function extractName(email) {
  if (!email || !email.includes('@')) return email;
  return email.split('@')[0].replace(/[._]/g, ' ');
}

function clearErrors() {
  document.querySelectorAll('.form-input, .form-textarea').forEach(el => {
    el.classList.remove('error');
  });
}

function resetForm() {
  $('field-nome').value = '';
  $('field-email').value = '';
  $('field-titulo').value = '';
  $('field-descricao').value = '';
  updateTicketIdDisplay();
  clearErrors();
}

function togglePresets() {
  const collapsible = $('presets-collapsible');
  const btn = $('btn-collapse-presets');
  const isCollapsed = collapsible.classList.toggle('collapsed');
  btn.classList.toggle('collapsed', isCollapsed);
  btn.querySelector('span').textContent = isCollapsed ? 'Expandir' : 'Recolher';
}

function buildPayload(overrides = {}) {
  const ticketId = $('ticket-id-display').textContent;
  const name = $('field-nome').value.trim();
  const email = $('field-email').value.trim();
  const title = $('field-titulo').value.trim();
  const description = $('field-descricao').value.trim();

  return {
    ticket_id: ticketId,
    title: title,
    description: description,
    requester_name: name,
    requester_email: email,
    created_at: new Date().toISOString(),
    ...overrides
  };
}

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
      data: { error: err.message },
      elapsed: Date.now() - startTime
    };
  }
}

function showResponse(result, payload) {
  const container = $('response-content');
  const empty = $('response-empty');
  empty.style.display = 'none';
  container.style.display = 'flex';

  const json = $('response-json');
  json.innerHTML = syntaxHighlight(JSON.stringify(result.data, null, 2));
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, match => {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      cls = /:$/.test(match) ? 'json-key' : 'json-string';
    }
    return `<span class="${cls}">${match}</span>`;
  });
}

function addToHistory(payload, result) {
  const entry = {
    id: history.length,
    ticket_id: payload.ticket_id,
    title: payload.title || '(sem título)',
    description: payload.description || '(sem descrição)',
    requester_name: payload.requester_name || '(sem nome)',
    requester_email: payload.requester_email || '(sem email)',
    status: resolveStatus(result),
    timestamp: new Date().toLocaleTimeString('pt-BR'),
    payload: { ...payload },
    response: result
  };
  history.unshift(entry);
  renderHistory();
}

function resolveStatus(result) {
  return (result.ok && result.status === 200) ? 'sucesso' : 'erro';
}

function renderHistory() {
  const container = $('history-table-container');
  $('history-count').textContent = history.length;

  if (history.length === 0) {
    container.innerHTML = '<div class="history-empty">Nenhum ticket enviado ainda.</div>';
    return;
  }

  container.innerHTML = `
    <div class="history-table-wrapper">
      <table class="history-table">
        <colgroup>
          <col style="width:90px">
          <col style="width:160px">
          <col style="width:140px">
          <col style="width:auto">
          <col style="width:80px">
          <col style="width:80px">
        </colgroup>
        <thead>
          <tr>
            <th>Ticket ID</th>
            <th>Título</th>
            <th>Solicitante</th>
            <th>Descrição</th>
            <th>Status</th>
            <th>Horário</th>
          </tr>
        </thead>
        <tbody>
          ${history.map(entry => `
            <tr>
              <td><span class="history-ticket-id">${entry.ticket_id}</span></td>
              <td class="history-cell-wrap">${entry.title}</td>
              <td>
                <div style="display:flex; flex-direction:column; gap:2px;">
                  <strong style="font-size:12px;">${entry.requester_name}</strong>
                  <span style="font-size:10px; color:var(--text-secondary); word-break:break-all;">${entry.requester_email}</span>
                </div>
              </td>
              <td class="history-cell-wrap" style="color:var(--text-secondary);">${entry.description}</td>
              <td><span class="status-badge ${entry.status}">${entry.status}</span></td>
              <td><span class="history-time">${entry.timestamp}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function handleSubmit() {
  const payload = buildPayload();
  setLoading(true);
  const result = await sendToWebhook(payload);
  setLoading(false);
  showResponse(result, payload);
  addToHistory(payload, result);
  updateTicketIdDisplay();
}

function setLoading(state) {
  $('submit-btn').disabled = state;
  $('btn-text').textContent = state ? 'Enviando...' : 'Enviar Ticket';
}

function showToast(msg, type = 'info') {
  const container = $('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function editWebhookUrl() {
  const current = WEBHOOK_URL;
  const newUrl = prompt('URL do Webhook:', current);
  if (newUrl && newUrl !== current) {
    showToast('URL atualizada (requer reload para aplicar)', 'info');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderPresets();
  updateTicketIdDisplay();

  // Start the collected use cases
  const collapsible = $('presets-collapsible');
  const btn = $('btn-collapse-presets');
  collapsible.classList.add('collapsed');
  btn.classList.add('collapsed');
  btn.querySelector('span').textContent = 'Expandir';
});