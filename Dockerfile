# Usa a imagem base do Node.js
FROM node:22

# Evita interação manual e instala dependências + configura timezone
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update && apt-get install -y \
    tzdata \
    libaio1 \
    unzip \
    cron && \
    ln -sf /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime && \
    echo "America/Sao_Paulo" > /etc/timezone && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o timezone no ambiente
ENV TZ=America/Sao_Paulo

# Cria diretório da aplicação
WORKDIR /app

# Copia arquivos de dependência
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código
COPY . .

# Garante permissão segura ao .env (ignora se não existir)
RUN [ -f .env ] && chmod 600 .env || true

# Cria pastas para arquivos e logs
RUN mkdir -p /app/downloads /app/logs

# Define variável de ambiente
ENV NODE_ENV=production

# Cria cron job para rodar todos os dias às 17:40 da tarde (21:00 UTC)
RUN echo "00 18 * * * root /bin/bash -c 'set -a && source /app/.env && /usr/local/bin/node /app/index.js' >> /app/logs/cron.log 2>&1" > /etc/cron.d/tui-job && \
#RUN echo "*/2 * * * * root /bin/bash -c 'set -a && source /app/.env && /usr/local/bin/node /app/index.js' >> /app/logs/cron.log 2>&1" > /etc/cron.d/tui-job && \
    echo "02 18 * * * root /bin/bash -c 'set -a && source /app/.env && /usr/local/bin/node /app/enviarLogTelegram.js' >> /app/logs/cron.log 2>&1" >> /etc/cron.d/tui-job && \
    echo '' >> /etc/cron.d/tui-job && \
    chmod 0644 /etc/cron.d/tui-job

# Inicia o serviço do cron em foreground
CMD ["cron", "-f"]
