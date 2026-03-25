Webhook → Validação → IF (válido?)
   → NÃO → Resposta erro + log
   → SIM → LLM → Parse → IF (JSON válido?)
         → NÃO → Log erro
         → SIM → IF (ticket completo?)
               → NÃO → Log incompleto
               → SIM → Notificação → Resposta OK




Webhook
 → Validação
 → IF válido?
   → NÃO → Log erro (Sheets) → Response

   → SIM → LLM
        → Parse
        → IF parse ok?
            → NÃO → Log erro LLM (Sheets)

            → SIM → Verifica completude
                → IF completo?
                    → NÃO → Log incompleto (Sheets)

                    → SIM → Notificação
                           → Salva sucesso (Sheets)
                           → Response


OK 🧪 ✅ 1. CASO BASE (SUCESSO - BUG ALTA)
{
  "ticket_id": "JIRA-1001",
  "titulo": "App trava ao abrir tela de pagamento",
  "descricao": "Ao tentar abrir a tela de pagamento, o app fecha sozinho após alguns segundos. Testado em Android e iOS.",
  "solicitante": "user1@email.com",
  "criado_em": "2025-03-10T10:00:00Z"
}
🧪 ✅ 2. DÚVIDA (DEVE IR PARA PRODUTO / MÉDIA OU BAIXA)
{
  "ticket_id": "JIRA-1002",
  "titulo": "Como alterar minha senha?",
  "descricao": "Não encontrei onde posso alterar minha senha no aplicativo.",
  "solicitante": "user2@email.com",
  "criado_em": "2025-03-10T11:00:00Z"
}
🧪 ✅ 3. PROBLEMA OPERACIONAL
{
  "ticket_id": "JIRA-1003",
  "titulo": "Cobrança duplicada",
  "descricao": "Fui cobrado duas vezes pelo mesmo serviço na fatura deste mês.",
  "solicitante": "user3@email.com",
  "criado_em": "2025-03-10T12:00:00Z"
}
OK 🧪 ⚠️ 4. TICKET INCOMPLETO (DESCRIÇÃO VAGA)
{
  "ticket_id": "JIRA-1004",
  "titulo": "Erro no app",
  "descricao": "Não funciona",
  "solicitante": "user4@email.com",
  "criado_em": "2025-03-10T13:00:00Z"
}
OK 🧪 ❌ 5. CAMPO FALTANDO (SEM DESCRIÇÃO)
{
  "ticket_id": "JIRA-1005",
  "titulo": "Erro ao logar",
  "descricao": "",
  "solicitante": "user5@email.com",
  "criado_em": "2025-03-10T14:00:00Z"
}
OK 🧪 ❌ 6. SEM TÍTULO
{
  "ticket_id": "JIRA-1006",
  "descricao": "O app não abre desde ontem.",
  "solicitante": "user6@email.com",
  "criado_em": "2025-03-10T15:00:00Z"
}
OK 🧪 ❌ 7. TODOS CAMPOS VAZIOS
{
  "ticket_id": "",
  "titulo": "",
  "descricao": "",
  "solicitante": "",
  "criado_em": ""
}
OK 🧪 ⚠️ 8. DESCRIÇÃO MUITO CURTA
{
  "ticket_id": "JIRA-1008",
  "titulo": "Bug",
  "descricao": "Erro",
  "solicitante": "user8@email.com",
  "criado_em": "2025-03-10T16:00:00Z"
}
🧪 🤖 9. CASO AMBÍGUO (TESTA LLM)
{
  "ticket_id": "JIRA-1009",
  "titulo": "Tela demora muito para carregar",
  "descricao": "A tela inicial leva mais de 20 segundos para carregar sempre que abro o app.",
  "solicitante": "user9@email.com",
  "criado_em": "2025-03-10T17:00:00Z"
}
🧪 🤖 10. TEXTO LONGO (TESTA ROBUSTEZ)
{
  "ticket_id": "JIRA-1010",
  "titulo": "Erro intermitente ao gerar relatório financeiro",
  "descricao": "Desde a última atualização, ao tentar gerar relatórios financeiros no aplicativo, ocorre uma falha intermitente. Em alguns momentos funciona normalmente, mas na maioria das vezes apresenta erro após alguns segundos. Já testei em diferentes redes e dispositivos e o problema persiste.",
  "solicitante": "user10@email.com",
  "criado_em": "2025-03-10T18:00:00Z"
}
🧪 🔥 11. PAYLOAD COM CAMPOS EXTRAS (RESILIÊNCIA)
{
  "ticket_id": "JIRA-1011",
  "titulo": "Erro ao atualizar perfil",
  "descricao": "Não consigo salvar alterações no meu perfil.",
  "solicitante": "user11@email.com",
  "criado_em": "2025-03-10T19:00:00Z",
  "prioridade_usuario": "urgente",
  "plataforma": "iOS"
}
🧪 🔥 12. PAYLOAD MALFORMADO (SIMULA ERRO REAL)
{
  "ticket_id": "JIRA-1012",
  "titulo": "App crasha"
}
🧪 🤯 13. TESTE DE LLM QUE PODE QUEBRAR PARSE
{
  "ticket_id": "JIRA-1013",
  "titulo": "Erro estranho",
  "descricao": "asdfasdf qwerqwer zxcvzxcv erro bug problema ???",
  "solicitante": "user13@email.com",
  "criado_em": "2025-03-10T20:00:00Z"
}
🧪 🧠 14. SIMULA DÚVIDA + CONTEXTO FORTE
{
  "ticket_id": "JIRA-1014",
  "titulo": "Não entendi como funciona o cashback",
  "descricao": "Gostaria de saber como funciona o cashback no aplicativo, pois não ficou claro após a compra.",
  "solicitante": "user14@email.com",
  "criado_em": "2025-03-10T21:00:00Z"
}
🧪 🚨 15. CRÍTICO (DEVE DAR ALTA)
{
  "ticket_id": "JIRA-1015",
  "titulo": "Sistema fora do ar",
  "descricao": "Nenhum usuário consegue acessar o sistema desde hoje cedo. Total indisponibilidade.",
  "solicitante": "user15@email.com",
  "criado_em": "2025-03-10T22:00:00Z"
}
🧪 🧪 16. EDGE CASE (MISTO)
{
  "ticket_id": "JIRA-1016",
  "titulo": "Erro ao pagar mas não sei se fui cobrado",
  "descricao": "Tentei pagar e deu erro, mas apareceu cobrança no cartão.",
  "solicitante": "user16@email.com",
  "criado_em": "2025-03-10T23:00:00Z"
}