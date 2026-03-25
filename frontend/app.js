// ── CONFIGURATION ──
const WEBHOOK_URL = 'http://localhost:5678/webhook-test/triagem-ticket';
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
      title: "App trava ao abrir tela de pagamento",
      description: "Ao tentar abrir a tela de pagamento, o app fecha sozinho após alguns segundos. Testado em Android e iOS.",
      requester_name: "João Silva",
      requester_email: "user1@email.com"
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
      title: "Como alterar minha senha?",
      description: "Não encontrei onde posso alterar minha senha no aplicativo.",
      requester_name: "Ana Costa",
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
      ticket_id: "JIRA-1003",
      title: "Cobrança duplicada",
      description: "Fui cobrado duas vezes pelo mesmo serviço na fatura deste mês.",
      requester_name: "Carlos Santos",
      requester_email: "user3@email.com"
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
      title: "Erro no app",
      description: "Não funciona",
      requester_name: "Maria Souza",
      requester_email: "user4@email.com"
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
      title: "Erro ao logar",
      description: "",
      requester_name: "",
      requester_email: "user5@email.com"
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
      title: "",
      description: "O app não abre desde ontem.",
      requester_name: "João Silva",
      requester_email: "user6@email.com"
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
      title: "",
      description: "",
      requester_name: "",
      requester_email: ""
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
      title: "Bug",
      description: "Erro",
      requester_name: "Lucas Oliveira",
      requester_email: "user8@email.com"
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
      title: "Tela demora muito para carregar",
      description: "A tela inicial leva mais de 20 segundos para carregar sempre que abro o app.",
      requester_name: "Fernanda Lima",
      requester_email: "user9@email.com"
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
      title: "Erro intermitente ao gerar relatório financeiro",
      description: "Desde a última atualização, ao tentar gerar relatórios financeiros no aplicativo, ocorre uma falha intermitente. Em alguns momentos funciona normalmente, mas na maioria das vezes apresenta erro após alguns segundos. Já testei em diferentes redes e dispositivos e o problema persiste.",
      requester_name: "Carlos Eduardo",
      requester_email: "user10@email.com"
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
      title: "Erro ao atualizar perfil",
      description: "Não consigo salvar alterações no meu perfil.",
      requester_name: "Usuário Extra",
      requester_email: "user11@email.com",
      user_priority: "urgente",
      platform: "iOS"
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
      title: "App crasha"
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
      title: "Erro estranho",
      description: "asdfasdf qwerqwer zxcvzxcv erro bug problema ???",
      requester_name: "Usuário Teste",
      requester_email: "user13@email.com"
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
      title: "Não entendi como funciona o cashback",
      description: "Gostaria de saber como funciona o cashback no aplicativo, pois não ficou claro após a compra.",
      requester_name: "Ana Costa",
      requester_email: "user14@email.com"
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
      title: "Sistema fora do ar",
      description: "Nenhum usuário consegue acessar o sistema desde hoje cedo. Total indisponibilidade.",
      requester_name: "João Pereira",
      requester_email: "user15@email.com"
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
      title: "Erro ao pagar mas não sei se fui cobrado",
      description: "Tentei pagar e deu erro, mas apareceu cobrança no cartão.",
      requester_name: "Maria Silva",
      requester_email: "user16@email.com"
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

// ── LOAD PRESET INTO FORM (Corrigido para as novas chaves) ──
function loadPreset(id) {
  const preset = PRESETS.find(p => p.id === id);
  if (!preset) return;

  const d = preset.data;
  // Agora preenche o nome se existir, senão tenta extrair do email
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

// ── BUILD PAYLOAD (Corrigido para requester_name e requester_email) ──
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
    requester_name: name,   // Envia o nome do formulário
    requester_email: email, // Envia o email do formulário
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

// ── ADD TO HISTORY (Corrigido para exibir nome e email na tabela) ──
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
              <td><span class="history-title" title="${entry.title}">${entry.title}</span></td>
              <td>
                <div style="display:flex; flex-direction:column;">
                  <strong style="font-size:12px;">${entry.requester_name}</strong>
                  <span style="font-size:10px; color:var(--text-secondary);">${entry.requester_email}</span>
                </div>
              </td>
              <td><span class="history-desc" title="${entry.description}">${entry.description}</span></td>
              <td><span class="status-badge ${entry.status}">${entry.status}</span></td>
              <td><span class="history-time">${entry.timestamp}</span></td>
              <td>
                <button class="btn-resend" onclick="resendEntry(${entry.id})">Reenviar</button>
              </td>
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

document.addEventListener('DOMContentLoaded', () => {
  renderPresets();
  updateTicketIdDisplay();
});