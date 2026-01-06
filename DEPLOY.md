# Deploy - PDF Gravity

## Arquitetura de Deploy

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐     ┌───────────┐
│  Git Push   │ ──▶ │   GitHub     │ ──▶ │  Docker Hub │ ──▶ │ Portainer │
│  (main)     │     │   Actions    │     │  (imagens)  │     │  (Swarm)  │
└─────────────┘     └──────────────┘     └─────────────┘     └───────────┘
```

## Fluxo de CI/CD

### 1. Desenvolvimento Local
- Edite o código localmente
- Faça commit e push para o branch `main`

### 2. GitHub Actions (Automático)
Quando você faz push para `main`, o workflow é disparado automaticamente:

- **Arquivo:** `.github/workflows/build-and-push.yml`
- **Imagens geradas:**
  - `normandiabuscarid/pdf-gravity-api:latest`
  - `normandiabuscarid/pdf-gravity-web:latest`
- **Destino:** Docker Hub

### 3. Portainer (Manual)
Após o build concluir no GitHub Actions:

1. Acesse o Portainer
2. Vá em **Stacks** → **pdf-gravity**
3. Clique em **Update the stack**
4. Marque **"Re-pull image and redeploy"**
5. Clique em **Update**

## Deploy de Nova Versão

```bash
# 1. Faça suas alterações no código

# 2. Commit e push
git add .
git commit -m "Descrição das alterações"
git push

# 3. Aguarde o GitHub Actions concluir (~2 minutos)
# Acompanhe em: https://github.com/EngenhariaBucarId/HTML-to-PDF-Antigravity/actions

# 4. No Portainer: Update the stack com "Re-pull image"
```

## Arquivos de Configuração

| Arquivo | Descrição |
|---------|-----------|
| `.github/workflows/build-and-push.yml` | Workflow CI/CD - build e push automático |
| `docker-compose.prod.yml` | Stack de produção para Portainer/Swarm |
| `Dockerfile` | Build da API (Python + FastAPI + WeasyPrint) |
| `frontend/Dockerfile` | Build do frontend (Node + Nginx) |
| `frontend/nginx.conf` | Configuração do Nginx para SPA |

## Configuração do Ambiente

### Secrets do GitHub (já configurados)
- `DOCKERHUB_USERNAME`: normandiabuscarid
- `DOCKERHUB_TOKEN`: Token de acesso do Docker Hub

### Variáveis de Build
- `VITE_API_URL`: https://htmltopdf.buscarid.com (configurado no build do frontend)
- `PORT`: 8000 (porta da API)

## URLs de Produção

| Recurso | URL |
|---------|-----|
| Aplicação | [https://htmltopdf.buscarid.com](https://htmltopdf.buscarid.com) |
| Portainer | [https://portainer.buscarid.com](https://portainer.buscarid.com) |
| GitHub Actions | [Ver workflows](https://github.com/EngenhariaBucarId/HTML-to-PDF-Antigravity/actions) |
| Docker Hub - API | [normandiabuscarid/pdf-gravity-api](https://hub.docker.com/r/normandiabuscarid/pdf-gravity-api) |
| Docker Hub - Web | [normandiabuscarid/pdf-gravity-web](https://hub.docker.com/r/normandiabuscarid/pdf-gravity-web) |
| Repositório | [GitHub](https://github.com/EngenhariaBucarId/HTML-to-PDF-Antigravity) |

## Troubleshooting

### Containers não iniciam
1. Verifique os logs no Portainer: **Stacks** → **pdf-gravity** → **Logs**
2. Verifique se as imagens existem no Docker Hub

### Certificado SSL inválido
1. Aguarde alguns minutos para o Let's Encrypt gerar o certificado
2. Verifique se o DNS está configurado corretamente
3. Verifique os logs do Traefik

### Imagem não atualiza
1. No Portainer, marque **"Re-pull image"** ao atualizar a stack
2. Ou pare e inicie a stack novamente

## Comandos Úteis (API Portainer)

```bash
# Token de acesso
TOKEN="seu_token_portainer"

# Parar stack
curl -X POST -H "X-API-Key: $TOKEN" \
  "https://portainer.buscarid.com/api/stacks/7/stop?endpointId=1"

# Iniciar stack
curl -X POST -H "X-API-Key: $TOKEN" \
  "https://portainer.buscarid.com/api/stacks/7/start?endpointId=1"

# Ver status dos containers
curl -H "X-API-Key: $TOKEN" \
  "https://portainer.buscarid.com/api/endpoints/1/docker/containers/json" | grep pdf-gravity
```
