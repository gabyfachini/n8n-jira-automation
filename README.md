# Fluxo de Triagem Inteligente de Tickets (n8n)

## O que o fluxo faz

Este fluxo automatiza a triagem de tickets recebidos via webhook,
realizando:

-   Validação de dados de entrada
-   Classificação automática (Bug, Dúvida, Problema) via LLM
-   Definição de severidade
-   Tratamento de erros (validação, parsing, API)
-   Roteamento do ticket conforme classificação
-   Solicitação de mais informações quando necessário

## Como rodar localmente

1.  Abra o n8n pré instalado na máquina

2.  Importe o workflow no n8n via 

    ``` bash
    n8n_flow.json
    ```

3.  Configure:

    -   Credenciais da API de LLM (OpenAI ou Gemini)
    -   Webhook ativo (modo test ou production)

    ``` bash
    Observação: quando não estamos em produção, não é possível configurar e verificar o funcionamento do Erro Global
    ```

4.  Execute testes:

    -   Utilize os JSONs de teste no webhook via Postman ou utilizando o frontend pré-configurado neste case
    -   Ou configure um node de testes automatizados

## Principais decisões do fluxo

-   Validação antecipada para evitar custo com LLM em payload inválido
-   Uso de LLM para classificação, permitindo flexibilidade com texto livre
-   Implementação de fallback para casos ambíguos ou incompletos
-   Tratamento de erros centralizado (global error)
-   Separação por tipo de ticket para facilitar automações futuras

## Cobertura de cenários

O fluxo foi projetado para lidar com:

- ✅ Casos válidos (Bug, Dúvida, Problema)
- ⚠️ Dados incompletos ou vagos
- ❌ Payload inválido ou malformado
- ⚠️ Falhas do LLM (resposta inválida / ambígua)
- 🚨 Erros externos (ex: rate limit de API)

## Possíveis melhorias

Com mais tempo, seria interessante implementar:

-   Mock de LLM para testes sem custo (Simular resposta da IA sem chamar API)
-   Logging estruturado (ex: Google Sheets ou banco de dados)
-   Dashboard de métricas (volume, tipos, falhas)
-   Test runner automatizado dentro do n8n
-   Validações mais robustas (ex: regex para e-mail e campos, NLP leve antes do LLM para classificação simples)

## Observações

-   O fluxo foi pensado para ser modular e escalável
-   Pode ser facilmente integrado com:
    -   Jira / Service Desk
    -   CRM
    -   Sistemas internos

## Resultado esperado

Redução do trabalho manual na triagem, maior consistência na classificação e criação de uma base sólida para automações mais avançadas e análise de dados da área atual, demais áreas e gestores.
