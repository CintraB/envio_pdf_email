# ENVIO_PDF_EMAIL

Este é um projeto Node.js com Docker para envio automatizado de arquivos por e-mail, utilizando a API do Google Drive e SMTP (ex: Gmail), com logging e integração com Telegram para monitoramento dos envios.

## 🚀 Funcionalidades

- 🔄 Baixa o arquivo do Google Drive via API.
- 📬 Envia e-mails com anexo PDF.
- 📥 Suporte a múltiplos destinatários e cópia (CC).
- 📁 Armazena logs de execução detalhados (`logs/`)
- 🧾 Envia os logs diários automaticamente para o Telegram
- 📦 Totalmente dockerizado e rodando com `cron` dentro do container
- ⚙️ Configuração flexível via `.env`.

## 📁 Estrutura do Projeto

```
ENVIO_PDF_EMAIL/ 
├── config/ # Configuração SMTP 
├── downloads/ # Arquivos baixados (PDFs) 
├── logs/ # Logs de execução 
├── src/ 
│ └── middleware/ # Logger e configurador de e-mail 
├── .env # Configurações reais (não versionar) 
├── .envExemplo # Exemplo de .env 
├── enviaremails.js # Script de envio de e-mails 
├── enviarLogTelegram.js # Script que envia o cron.log para Telegram 
├── index.js # Script principal (download do arquivo) 
├── Dockerfile # Container com cron embutido 
├── docker-compose.yml # Gerenciador do container 
└── README.md # Este arquivo              # Script para baixar o arquivo do Google Drive
```

## 📦 Instalação

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/CintraVN/envio_pdf_email
cd ENVIO_PDF_EMAIL
npm install
```

## ⚙️ Configuração

Crie um arquivo `.env` com base no `.envExemplo`.

### 📄 Exemplo de `.env`

```env
NODE_ENV=production

# GOOGLE DRIVE
FILE_ID=ADICIONE_O_ID_DO_ARQUIVO

# EMAIL
EMAILREMETENTE="Seu Nome <seuemail@gmail.com>"
EMAILDESTINATARIO=destinatario@exemplo.com
EMAILCC=cc@exemplo.com

# CONFIGURACAO DO SMTP
SMTPHOST=smtp.gmail.com
SMTPPORT=587
SMTPUSER=seuemail@gmail.com
SMTPPASS=senha_de_app_do_google

# TELEGRAM
TELEGRAM_TOKEN=xxxxxxxxx:yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
TELEGRAM_CHAT_ID=123456789
```

> ⚠️ Para enviar pelo Gmail, é necessário [gerar uma senha de app](https://support.google.com/accounts/answer/185833?hl=pt-BR) nas configurações da sua conta Google.

> ⚠️ [Criar credenciais e liberar o drive](https://console.cloud.google.com/apis/credentials?invt=Abu1ig&project=precise-tube-443520-k2).

> ⚠️ [Criar uma pasta no Google Drive e configurar para visualizar qualquer um com o link, adicionar o email gerado no arquivo service-account.json como editor da pasta (vídeo exemplo)](https://youtu.be/GSHc5vlj6aQ).

> ⚠️ [Copiar o ID do arquivo que deseja baixar].

## ▶️ Execução Manual

Para executar o envio do e-mail com PDF:

```bash
node index.js               # Dispara o e-mail com o PDF
node enviarLogTelegram.js   # Envia o cron.log para Telegram
```

## ▶🐳 Docker

Build do container:

```bash
docker-compose build
```

## ▶️ Execução
```bash
docker-compose up -d
```
- Executa index.js no horário definido pelo cron.
- Executa enviarLogTelegram.js 2 minutos depois.

## 📅 Cron (dentro do container)
Você pode alterar os horários diretamente no Dockerfile.
- index.js: roda diariamente às 17:50.
- enviarLogTelegram.js: roda diariamente às 17:52.

## 📬 Logs

Os logs são gravados em:

- `logs/cron.log`         # Log unificado dos agendamentos
- `logs/error.log`        # Erros específicos
- `logs/combined.log`     # Saída combinada geral

O log diário é enviado automaticamente para o Telegram! 📲

## 🛠️ Tecnologias Utilizadas

- Node.js
- Nodemailer
- dotenv
- Winston (para logging)
- Google Drive API
- Telegram Bot API
- Cron (agendador)
- Docker (com agendamentos internos)
- Docker Compose

## 🧪 Testes

Você pode alterar os horários de agendamento no Dockerfile para:
```
*/2 * * * *  # Rodar a cada 2 minutos para teste
```

## 📌 Observações

- O .env NUNCA deve ser versionado — use o .envExemplo como base.
- O service-account.json precisa ter permissões no arquivo/pasta do Google Drive.
- A senha do Gmail deve ser uma senha de app.
- O PDF a ser enviado deve estar na pasta `downloads/` e corresponder ao `FILE_ID`.
- Os logs são armazenados com detalhamento sobre o sucesso ou falha do envio.
- Telegram precisa de um bot criado no @BotFather.

---

## 📄 Licença

Software Livre. By Cintra
