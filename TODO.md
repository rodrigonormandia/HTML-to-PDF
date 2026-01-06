# 📋 TODO - PDF Gravity

## 🎯 Roadmap de Melhorias

---

## ⚡ Quick Wins (Implementação Rápida)

- [x] Limite de caracteres no textarea (max 2MB)
- [x] Botão "Limpar" para resetar o editor
- [x] Contador de caracteres em tempo real
- [x] Atalhos de teclado (Ctrl+Enter para converter)
- [x] Botão "Copiar HTML de exemplo"

---

## 🔴 Versão 1.1 - ALTA PRIORIDADE (2 semanas)

### Segurança
- [x] Validação de HTML no backend
- [x] Sanitização de HTML antes de processar
- [x] Rate limiting por IP (30 req/min)
- [x] Limite de tamanho de input (2MB)

### UX
- [x] Barra de progresso durante conversão
- [x] Indicador de tempo estimado
- [x] Mensagens de erro mais descritivas em português
- [x] Sugestões de correção em erros

### Features
- [ ] Histórico local (últimas 5 conversões)
- [ ] Botão "Carregar último HTML"
- [ ] Opção de limpar histórico
- [ ] LocalStorage para persistência

---

## 🟡 Versão 1.2 - MÉDIA PRIORIDADE (1 mês)

### Customização de PDF
- [ ] Seletor de tamanho (A4, Letter, Custom)
- [ ] Orientação (Portrait/Landscape)
- [ ] Margens customizáveis
- [ ] Header/Footer personalizados

### Editor
- [ ] Integrar CodeMirror ou Monaco Editor
- [ ] Syntax highlighting para HTML
- [ ] Auto-complete de tags
- [ ] Formatação automática (prettier)

### Templates
- [ ] Template de fatura
- [ ] Template de currículo
- [ ] Template de relatório
- [ ] Galeria de templates
- [ ] Botão "Usar template"

### Tema
- [ ] Modo escuro
- [ ] Toggle dark/light mode
- [ ] Salvar preferência no localStorage
- [ ] Respeitar preferência do sistema

---

## 🟢 Versão 2.0 - LONGO PRAZO (3 meses)

### Exportação
- [ ] Exportar como PNG
- [ ] Exportar como DOCX
- [ ] Exportar como Markdown
- [ ] Exportar HTML estático

### API Pública
- [ ] Sistema de API Keys
- [ ] Rate limiting por usuário
- [ ] Dashboard de uso
- [ ] Planos (free/pro)
- [ ] Documentação da API

### Batch Processing
- [ ] Upload de múltiplos HTMLs
- [ ] Conversão em lote
- [ ] Download em ZIP
- [ ] Fila de processamento

### Integrações
- [ ] Salvar no Google Drive
- [ ] Salvar no Dropbox
- [ ] Webhook para enviar para URL
- [ ] API REST para integração

---

## 🏗️ Melhorias de Arquitetura

### Backend
- [ ] Fila de processamento (Celery + Redis)
- [ ] Cache de resultados (Redis)
- [ ] Logging estruturado (Loguru)
- [ ] Integração com Sentry
- [ ] Tratamento de erros robusto
- [ ] Códigos de erro específicos

### Frontend
- [ ] Code splitting e lazy loading
- [ ] Service Worker (PWA offline)
- [ ] Cache de assets
- [ ] Otimização de bundle
- [ ] Acessibilidade (ARIA labels)
- [ ] Navegação por teclado

### DevOps
- [ ] Unit tests (pytest para backend)
- [ ] E2E tests (Playwright para frontend)
- [ ] CI/CD com GitHub Actions
- [ ] Testes automatizados em PRs
- [ ] Coverage reports

---

## 📊 Analytics e Monitoramento

- [ ] Google Analytics ou Plausible
- [ ] Métricas de conversão
- [ ] Heatmaps (Hotjar)
- [ ] Error tracking (Sentry)
- [ ] Performance monitoring

---

## 🌍 Internacionalização

- [ ] Adicionar inglês (en-US)
- [ ] Adicionar espanhol (es-ES)
- [ ] Seletor de idioma
- [ ] Traduzir toda a UI
- [ ] Traduzir mensagens de erro

---

## 📝 Documentação

- [ ] README.md completo
- [ ] Guia de contribuição
- [ ] Documentação da API
- [ ] Exemplos de uso
- [ ] FAQ

---

## 🎨 Design e Branding

- [x] Logo criada
- [x] Favicon adicionado
- [x] Open Graph images
- [ ] Animações e micro-interações
- [ ] Ilustrações customizadas
- [ ] Design system completo

---

## 🔒 Segurança e Compliance

- [ ] HTTPS obrigatório
- [ ] CSP (Content Security Policy)
- [ ] GDPR compliance
- [ ] Política de privacidade
- [ ] Termos de uso

---

## 💰 Monetização (Futuro)

- [ ] Plano Free (limitado)
- [ ] Plano Pro (ilimitado)
- [ ] Stripe integration
- [ ] Dashboard de assinatura
- [ ] Billing automático

---

## 📈 Priorização

### Implementar AGORA (Esta semana)
1. Quick Wins (5 itens)
2. Validação e segurança básica
3. Histórico local

### Implementar PRÓXIMO (Próximas 2 semanas)
1. Feedback visual melhorado
2. Tratamento de erros robusto
3. Customização básica de PDF

### Implementar DEPOIS (Próximo mês)
1. Editor com syntax highlighting
2. Templates prontos
3. Modo escuro

---

## ✅ Concluído

- [x] MVP funcional
- [x] Deploy no Render
- [x] Docker setup
- [x] SEO otimizado
- [x] Logo e branding
- [x] PWA manifest
- [x] robots.txt e sitemap.xml
- [x] Schema.org JSON-LD
- [x] Internacionalização (pt-BR)

---

**Última atualização:** 2026-01-06
**Versão atual:** v1.0.4
