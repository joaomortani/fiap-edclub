# -------- EdClub Makefile --------
SHELL := /bin/bash
NODE_VERSION := v21.7.3

# Configurações
.PHONY: setup install dev-web dev-backend dev-stack dev-mobile build-web clean help

# 1) Configura ambiente e dependências
setup:
	@echo "→ Configurando Node $(NODE_VERSION)"
	@nvm install $(NODE_VERSION) && nvm use $(NODE_VERSION)
	@echo "→ Instalando dependências..."
	@npm install

# 2) Instala apenas (sem mexer em versão)
install:
	@npm install

# 3) Roda o Next.js (web)
dev-web:
	@npm run dev:web

# 3b) Roda o backend BFF (Next.js em 4000)
dev-backend:
	@npm run dev:backend

# 3c) Roda web e backend em paralelo (Ctrl+C para encerrar ambos)
dev-stack:
	@echo "→ Iniciando backend (porta 4000) e web (porta 3000)"
	@trap 'kill 0' SIGINT SIGTERM EXIT; \
		npm run dev:backend & \
		npm run dev:web & \
		wait

# 4) Roda o Expo (mobile)
dev-mobile:
	@npm run dev:mobile

# 5) Build web para deploy
build-web:
	@npm run build:web

# 6) Limpa caches e builds
clean:
	@echo "→ Limpando node_modules, dist, build..."
	@find . -type d -name "node_modules" -prune -exec rm -rf {} +
	@find . -type d -name "dist" -prune -exec rm -rf {} +
	@find . -type d -name ".next" -prune -exec rm -rf {} +
	@find . -type d -name "build" -prune -exec rm -rf {} +

# 7) Mostra ajuda
help:
	@echo "Comandos disponíveis:"
	@echo "  make setup        - Configura ambiente Node e instala dependências"
	@echo "  make install      - Instala dependências"
	@echo "  make dev-web      - Inicia o servidor Next.js (web)"
	@echo "  make dev-backend  - Inicia o backend BFF (porta 4000)"
	@echo "  make dev-stack    - Inicia backend e web juntos"
	@echo "  make dev-mobile   - Inicia o Expo (mobile)"
	@echo "  make build-web    - Faz build do app web"
	@echo "  make clean        - Remove builds e node_modules"
