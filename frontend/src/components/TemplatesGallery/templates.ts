export interface Template {
  id: string;
  nameKey: string;
  descriptionKey: string;
  icon: string;
  html: string;
  headerHtml?: string;
  footerHtml?: string;
  headerHeight?: string;
  footerHeight?: string;
}

export const templates: Template[] = [
  {
    id: 'invoice',
    nameKey: 'templates.invoice.name',
    descriptionKey: 'templates.invoice.description',
    icon: '🧾',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Fatura</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.5;
    }
    .invoice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 3px solid #3b82f6;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .company-info h1 {
      font-size: 1.75rem;
      color: #3b82f6;
      margin: 0 0 0.5rem 0;
    }
    .company-info p {
      margin: 0.25rem 0;
      color: #666;
      font-size: 0.875rem;
    }
    .invoice-details {
      text-align: right;
    }
    .invoice-number {
      font-size: 1.25rem;
      font-weight: bold;
      color: #3b82f6;
    }
    .invoice-date {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .client-section {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin: 2rem 0;
    }
    .client-section h2 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .client-name {
      font-size: 1.125rem;
      font-weight: 600;
      color: #333;
    }
    .client-info {
      color: #666;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
    }
    .items-table th {
      background: #3b82f6;
      color: white;
      padding: 0.875rem 1rem;
      text-align: left;
      font-weight: 600;
    }
    .items-table th:last-child,
    .items-table td:last-child {
      text-align: right;
    }
    .items-table td {
      padding: 0.875rem 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .items-table tbody tr:hover {
      background: #f8fafc;
    }
    .totals-section {
      display: flex;
      justify-content: flex-end;
      margin-top: 2rem;
    }
    .totals-table {
      width: 300px;
    }
    .totals-table tr td {
      padding: 0.5rem 0;
    }
    .totals-table tr td:last-child {
      text-align: right;
      font-weight: 500;
    }
    .total-row td {
      font-size: 1.25rem;
      font-weight: bold !important;
      color: #3b82f6;
      border-top: 2px solid #3b82f6;
      padding-top: 1rem !important;
    }
    .payment-info {
      margin-top: 3rem;
      padding: 1.5rem;
      background: #eff6ff;
      border-radius: 0.5rem;
      border-left: 4px solid #3b82f6;
    }
    .payment-info h3 {
      margin: 0 0 0.75rem 0;
      color: #1e40af;
      font-size: 1rem;
    }
    .payment-info p {
      margin: 0.25rem 0;
      font-size: 0.875rem;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="invoice-header">
    <div class="company-info">
      <h1>Sua Empresa Ltda</h1>
      <p>CNPJ: 00.000.000/0001-00</p>
      <p>Rua Exemplo, 123 - Centro</p>
      <p>São Paulo - SP | CEP: 01000-000</p>
      <p>contato@suaempresa.com.br</p>
    </div>
    <div class="invoice-details">
      <div class="invoice-number">FATURA #2024-001</div>
      <div class="invoice-date">
        <p>Emissão: ${new Date().toLocaleDateString('pt-BR')}</p>
        <p>Vencimento: ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}</p>
      </div>
    </div>
  </div>

  <div class="client-section">
    <h2>Faturar Para</h2>
    <div class="client-name">Cliente Exemplo S.A.</div>
    <div class="client-info">
      <p>CNPJ: 11.111.111/0001-11</p>
      <p>Av. Principal, 456 - Sala 10</p>
      <p>Rio de Janeiro - RJ | CEP: 20000-000</p>
    </div>
  </div>

  <table class="items-table">
    <thead>
      <tr>
        <th>Descrição</th>
        <th>Qtd</th>
        <th>Valor Unit.</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Consultoria em TI - Março/2024</td>
        <td>40h</td>
        <td>R$ 150,00</td>
        <td>R$ 6.000,00</td>
      </tr>
      <tr>
        <td>Desenvolvimento de Sistema Web</td>
        <td>1</td>
        <td>R$ 8.500,00</td>
        <td>R$ 8.500,00</td>
      </tr>
      <tr>
        <td>Suporte Técnico Mensal</td>
        <td>1</td>
        <td>R$ 1.200,00</td>
        <td>R$ 1.200,00</td>
      </tr>
      <tr>
        <td>Licenças de Software</td>
        <td>5</td>
        <td>R$ 299,00</td>
        <td>R$ 1.495,00</td>
      </tr>
    </tbody>
  </table>

  <div class="totals-section">
    <table class="totals-table">
      <tr>
        <td>Subtotal:</td>
        <td>R$ 17.195,00</td>
      </tr>
      <tr>
        <td>ISS (5%):</td>
        <td>R$ 859,75</td>
      </tr>
      <tr class="total-row">
        <td>Total:</td>
        <td>R$ 18.054,75</td>
      </tr>
    </table>
  </div>

  <div class="payment-info">
    <h3>Informações de Pagamento</h3>
    <p><strong>Banco:</strong> Banco do Brasil (001)</p>
    <p><strong>Agência:</strong> 1234-5</p>
    <p><strong>Conta Corrente:</strong> 12345-6</p>
    <p><strong>PIX:</strong> contato@suaempresa.com.br</p>
  </div>
</body>
</html>`,
    headerHtml: `<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:10pt; color:#666;">
  <span style="font-weight:bold; color:#3b82f6;">Sua Empresa Ltda</span>
  <span>Fatura #2024-001</span>
</div>`,
    footerHtml: `<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:9pt; color:#888;">
  <span>Documento gerado em ${new Date().toLocaleDateString('pt-BR')}</span>
  <span>Página {{page}} de {{pages}}</span>
</div>`,
    headerHeight: '1.5',
    footerHeight: '1'
  },
  {
    id: 'resume',
    nameKey: 'templates.resume.name',
    descriptionKey: 'templates.resume.description',
    icon: '📄',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Currículo</title>
  <style>
    @page {
      size: A4;
      margin: 1.5cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #10b981;
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .name {
      font-size: 2.25rem;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 0.25rem 0;
    }
    .title {
      font-size: 1.125rem;
      color: #10b981;
      font-weight: 500;
      margin: 0 0 1rem 0;
    }
    .contact-info {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 1rem;
      font-size: 0.875rem;
      color: #6b7280;
    }
    .contact-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
    .section {
      margin: 1.5rem 0;
    }
    .section-title {
      font-size: 1.125rem;
      font-weight: bold;
      color: #10b981;
      border-bottom: 2px solid #10b981;
      padding-bottom: 0.25rem;
      margin-bottom: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .summary {
      font-size: 0.9375rem;
      color: #4b5563;
      text-align: justify;
    }
    .experience-item {
      margin-bottom: 1.25rem;
    }
    .experience-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }
    .job-title {
      font-weight: bold;
      font-size: 1rem;
      color: #1f2937;
    }
    .company {
      color: #10b981;
      font-weight: 500;
    }
    .period {
      color: #6b7280;
      font-size: 0.875rem;
      white-space: nowrap;
    }
    .experience-description {
      font-size: 0.875rem;
      color: #4b5563;
    }
    .experience-description ul {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }
    .experience-description li {
      margin: 0.25rem 0;
    }
    .education-item {
      margin-bottom: 1rem;
    }
    .degree {
      font-weight: bold;
      color: #1f2937;
    }
    .institution {
      color: #10b981;
    }
    .skills-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .skill-tag {
      background: #d1fae5;
      color: #065f46;
      padding: 0.375rem 0.875rem;
      border-radius: 9999px;
      font-size: 0.8125rem;
      font-weight: 500;
    }
    .two-columns {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }
    .languages-list, .certifications-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .languages-list li, .certifications-list li {
      padding: 0.375rem 0;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }
    .language-level {
      color: #6b7280;
      font-size: 0.8125rem;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="name">Maria Silva Santos</h1>
    <p class="title">Desenvolvedora Full Stack Senior</p>
    <div class="contact-info">
      <span class="contact-item">maria.silva@email.com</span>
      <span class="contact-item">|</span>
      <span class="contact-item">(11) 99999-9999</span>
      <span class="contact-item">|</span>
      <span class="contact-item">São Paulo, SP</span>
      <span class="contact-item">|</span>
      <span class="contact-item">linkedin.com/in/mariasilva</span>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Resumo Profissional</h2>
    <p class="summary">
      Desenvolvedora Full Stack com mais de 8 anos de experiência em desenvolvimento de aplicações web escaláveis.
      Especialista em React, Node.js e arquiteturas cloud. Apaixonada por criar soluções inovadoras e liderar
      equipes de alta performance. Experiência comprovada em startups e empresas de grande porte.
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">Experiência Profissional</h2>

    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">Tech Lead / Desenvolvedora Senior</div>
          <div class="company">TechCorp Brasil</div>
        </div>
        <span class="period">Jan 2021 - Atual</span>
      </div>
      <div class="experience-description">
        <ul>
          <li>Liderança técnica de squad com 6 desenvolvedores em projetos de e-commerce</li>
          <li>Arquitetura e desenvolvimento de microserviços processando 1M+ transações/dia</li>
          <li>Redução de 40% no tempo de resposta da API através de otimizações de performance</li>
          <li>Mentoria técnica e condução de code reviews</li>
        </ul>
      </div>
    </div>

    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">Desenvolvedora Full Stack</div>
          <div class="company">StartupXYZ</div>
        </div>
        <span class="period">Mar 2018 - Dez 2020</span>
      </div>
      <div class="experience-description">
        <ul>
          <li>Desenvolvimento de plataforma SaaS com React e Node.js do zero ao MVP</li>
          <li>Implementação de CI/CD e infraestrutura na AWS</li>
          <li>Integração com APIs de pagamento e sistemas legados</li>
        </ul>
      </div>
    </div>

    <div class="experience-item">
      <div class="experience-header">
        <div>
          <div class="job-title">Desenvolvedora Frontend</div>
          <div class="company">Agência Digital</div>
        </div>
        <span class="period">Jun 2016 - Fev 2018</span>
      </div>
      <div class="experience-description">
        <ul>
          <li>Desenvolvimento de interfaces responsivas para clientes diversos</li>
          <li>Implementação de designs pixel-perfect com foco em UX</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">Competências Técnicas</h2>
    <div class="skills-grid">
      <span class="skill-tag">JavaScript/TypeScript</span>
      <span class="skill-tag">React</span>
      <span class="skill-tag">Node.js</span>
      <span class="skill-tag">Python</span>
      <span class="skill-tag">PostgreSQL</span>
      <span class="skill-tag">MongoDB</span>
      <span class="skill-tag">Docker</span>
      <span class="skill-tag">Kubernetes</span>
      <span class="skill-tag">AWS</span>
      <span class="skill-tag">CI/CD</span>
      <span class="skill-tag">GraphQL</span>
      <span class="skill-tag">Redis</span>
    </div>
  </div>

  <div class="two-columns">
    <div class="section">
      <h2 class="section-title">Formação</h2>
      <div class="education-item">
        <div class="degree">Pós-graduação em Arquitetura de Software</div>
        <div class="institution">FIAP</div>
        <span class="period">2020 - 2021</span>
      </div>
      <div class="education-item">
        <div class="degree">Bacharelado em Ciência da Computação</div>
        <div class="institution">USP - Universidade de São Paulo</div>
        <span class="period">2012 - 2016</span>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Idiomas</h2>
      <ul class="languages-list">
        <li>Português <span class="language-level">- Nativo</span></li>
        <li>Inglês <span class="language-level">- Fluente (C1)</span></li>
        <li>Espanhol <span class="language-level">- Intermediário (B1)</span></li>
      </ul>
    </div>
  </div>
</body>
</html>`
  },
  {
    id: 'report',
    nameKey: 'templates.report.name',
    descriptionKey: 'templates.report.description',
    icon: '📊',
    html: `<!DOCTYPE html>
<html>
<head>
  <title>Relatório</title>
  <style>
    @page {
      size: A4;
      margin: 2cm;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
    }
    .report-header {
      text-align: center;
      border-bottom: 3px solid #8b5cf6;
      padding-bottom: 1.5rem;
      margin-bottom: 2rem;
    }
    .report-title {
      font-size: 1.75rem;
      font-weight: bold;
      color: #1f2937;
      margin: 0 0 0.5rem 0;
    }
    .report-subtitle {
      color: #8b5cf6;
      font-size: 1.125rem;
      margin: 0 0 0.5rem 0;
    }
    .report-meta {
      color: #6b7280;
      font-size: 0.875rem;
    }
    .executive-summary {
      background: #f5f3ff;
      border-left: 4px solid #8b5cf6;
      padding: 1.5rem;
      margin: 2rem 0;
      border-radius: 0 0.5rem 0.5rem 0;
    }
    .executive-summary h2 {
      color: #6d28d9;
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
    }
    .executive-summary p {
      margin: 0;
      color: #4b5563;
    }
    .section {
      margin: 2rem 0;
    }
    .section-title {
      font-size: 1.25rem;
      font-weight: bold;
      color: #8b5cf6;
      border-bottom: 2px solid #e9d5ff;
      padding-bottom: 0.5rem;
      margin-bottom: 1rem;
    }
    .section-content {
      color: #4b5563;
    }
    .section-content p {
      margin: 0.75rem 0;
      text-align: justify;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    .data-table th {
      background: #8b5cf6;
      color: white;
      padding: 0.875rem 1rem;
      text-align: left;
      font-weight: 600;
    }
    .data-table td {
      padding: 0.75rem 1rem;
      border: 1px solid #e5e7eb;
    }
    .data-table tbody tr:nth-child(even) {
      background: #faf5ff;
    }
    .data-table tbody tr:hover {
      background: #f3e8ff;
    }
    .highlight-box {
      background: #fef3c7;
      border: 1px solid #fcd34d;
      border-radius: 0.5rem;
      padding: 1rem 1.5rem;
      margin: 1.5rem 0;
    }
    .highlight-box strong {
      color: #92400e;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin: 1.5rem 0;
    }
    .metric-card {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.25rem;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .metric-value {
      font-size: 1.75rem;
      font-weight: bold;
      color: #8b5cf6;
    }
    .metric-label {
      color: #6b7280;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .metric-change {
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
    .positive { color: #059669; }
    .negative { color: #dc2626; }
    .conclusions {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      padding: 1.5rem;
      margin: 2rem 0;
    }
    .conclusions h2 {
      color: #1f2937;
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
    }
    .conclusions ul {
      margin: 0;
      padding-left: 1.5rem;
      color: #4b5563;
    }
    .conclusions li {
      margin: 0.5rem 0;
    }
    .page-break {
      page-break-after: always;
    }
  </style>
</head>
<body>
  <div class="report-header">
    <h1 class="report-title">Relatório de Desempenho Trimestral</h1>
    <p class="report-subtitle">Análise Q1 2024 - Departamento de Vendas</p>
    <p class="report-meta">
      Preparado por: Equipe de Analytics | Data: ${new Date().toLocaleDateString('pt-BR')}
    </p>
  </div>

  <div class="executive-summary">
    <h2>Sumário Executivo</h2>
    <p>
      O primeiro trimestre de 2024 apresentou resultados expressivos, com crescimento de 23% no faturamento
      em relação ao mesmo período do ano anterior. A estratégia de expansão digital mostrou-se eficaz,
      contribuindo com 45% das novas aquisições de clientes. Este relatório detalha os principais indicadores,
      análises setoriais e recomendações para os próximos trimestres.
    </p>
  </div>

  <div class="section">
    <h2 class="section-title">1. Indicadores Principais</h2>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">R$ 2.4M</div>
        <div class="metric-label">Faturamento Total</div>
        <div class="metric-change positive">+23% vs Q1 2023</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">847</div>
        <div class="metric-label">Novos Clientes</div>
        <div class="metric-change positive">+18% vs Q1 2023</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">94%</div>
        <div class="metric-label">Satisfação do Cliente</div>
        <div class="metric-change positive">+5 pontos</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2 class="section-title">2. Análise por Região</h2>
    <div class="section-content">
      <p>
        A distribuição regional das vendas apresentou variações significativas. A região Sudeste continua
        liderando com 52% do faturamento total, seguida pelo Sul com 23%. Destaque para o crescimento
        expressivo do Nordeste, que registrou aumento de 45% em relação ao trimestre anterior.
      </p>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Região</th>
          <th>Faturamento</th>
          <th>Participação</th>
          <th>Variação</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Sudeste</td>
          <td>R$ 1.248.000</td>
          <td>52%</td>
          <td class="positive">+21%</td>
        </tr>
        <tr>
          <td>Sul</td>
          <td>R$ 552.000</td>
          <td>23%</td>
          <td class="positive">+15%</td>
        </tr>
        <tr>
          <td>Nordeste</td>
          <td>R$ 336.000</td>
          <td>14%</td>
          <td class="positive">+45%</td>
        </tr>
        <tr>
          <td>Centro-Oeste</td>
          <td>R$ 168.000</td>
          <td>7%</td>
          <td class="positive">+12%</td>
        </tr>
        <tr>
          <td>Norte</td>
          <td>R$ 96.000</td>
          <td>4%</td>
          <td class="negative">-3%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="highlight-box">
    <strong>Destaque:</strong> A região Nordeste superou todas as expectativas, impulsionada pela
    abertura de 3 novos pontos de distribuição e campanhas de marketing regionalizadas.
  </div>

  <div class="page-break"></div>

  <div class="section">
    <h2 class="section-title">3. Performance por Produto</h2>
    <div class="section-content">
      <p>
        A linha de produtos premium continuou seu crescimento, representando agora 35% do faturamento
        total. Os produtos digitais também mostraram forte demanda, especialmente após o lançamento
        da nova plataforma online.
      </p>
    </div>
    <table class="data-table">
      <thead>
        <tr>
          <th>Categoria</th>
          <th>Unidades Vendidas</th>
          <th>Faturamento</th>
          <th>Margem</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Linha Premium</td>
          <td>2.450</td>
          <td>R$ 840.000</td>
          <td>42%</td>
        </tr>
        <tr>
          <td>Linha Standard</td>
          <td>8.320</td>
          <td>R$ 748.800</td>
          <td>28%</td>
        </tr>
        <tr>
          <td>Produtos Digitais</td>
          <td>15.670</td>
          <td>R$ 470.100</td>
          <td>85%</td>
        </tr>
        <tr>
          <td>Acessórios</td>
          <td>12.890</td>
          <td>R$ 341.100</td>
          <td>35%</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <h2 class="section-title">4. Canais de Aquisição</h2>
    <div class="section-content">
      <p>
        A estratégia omnichannel provou ser acertada, com equilíbrio entre canais online e offline.
        O e-commerce apresentou o maior crescimento percentual, enquanto as lojas físicas mantiveram
        sua relevância para produtos de maior ticket.
      </p>
    </div>
    <div class="metrics-grid">
      <div class="metric-card">
        <div class="metric-value">45%</div>
        <div class="metric-label">E-commerce</div>
        <div class="metric-change positive">+32% YoY</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">35%</div>
        <div class="metric-label">Lojas Físicas</div>
        <div class="metric-change positive">+8% YoY</div>
      </div>
      <div class="metric-card">
        <div class="metric-value">20%</div>
        <div class="metric-label">Revendedores</div>
        <div class="metric-change positive">+15% YoY</div>
      </div>
    </div>
  </div>

  <div class="conclusions">
    <h2>5. Conclusões e Recomendações</h2>
    <ul>
      <li><strong>Expandir presença no Nordeste:</strong> Resultados indicam alto potencial de crescimento na região</li>
      <li><strong>Investir em produtos digitais:</strong> Maior margem e crescimento acelerado justificam mais recursos</li>
      <li><strong>Fortalecer e-commerce:</strong> Canal com melhor performance deve receber investimentos prioritários</li>
      <li><strong>Revisar estratégia Norte:</strong> Único declínio requer análise detalhada e ações corretivas</li>
      <li><strong>Manter satisfação do cliente:</strong> Índice de 94% deve ser preservado com melhorias contínuas</li>
    </ul>
  </div>
</body>
</html>`,
    headerHtml: `<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:10pt; color:#666;">
  <span style="font-weight:bold; color:#8b5cf6;">Relatório Q1 2024</span>
  <span>Confidencial - Uso Interno</span>
</div>`,
    footerHtml: `<div style="display:flex; justify-content:space-between; align-items:center; width:100%; font-size:9pt; color:#888;">
  <span>Departamento de Analytics</span>
  <span>Página {{page}} de {{pages}}</span>
</div>`,
    headerHeight: '1.5',
    footerHeight: '1'
  }
];
