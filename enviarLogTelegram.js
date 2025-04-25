require('dotenv').config();
const logger = require('./src/loggers.js');
const fs = require('fs');
const https = require('https');

const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
//const LOG_PATH = './logs/cron.log';//para rodar via terminal
const LOG_PATH = '/app/logs/cron.log'; //para rodar via docker


// Lê os últimos 500 caracteres do log
const logContent = fs.readFileSync(LOG_PATH, 'utf8');
const message = encodeURIComponent(`📋 *Log diário do Tui 1.2*\n\n\`\`\`\n${logContent.slice(-500)}\n\`\`\``);

// Monta a URL da API do Telegram
const url = `https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT_ID}&text=${message}&parse_mode=Markdown`;

https.get(url, (res) => {
  logger.debug(`Enviado para o Telegram! Status: ${res.statusCode}`);
  res.resume();
}).on('error', (e) => {
  logger.debug('Erro ao enviar log para o Telegram:', e);
});
