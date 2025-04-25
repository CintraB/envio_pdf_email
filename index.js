const fs = require('fs');
const path = require('path');
const {google} = require('googleapis');
const {GoogleAuth} = require('google-auth-library');
const logger = require('./src/loggers.js');
const enviaremails = require('./enviaremails.js');
require('dotenv').config();

try {
    // Lista de MIME types suportados para exportação
const exportMimeTypes = {
    'application/vnd.google-apps.document': 'application/pdf',
    'application/vnd.google-apps.spreadsheet': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.google-apps.presentation': 'application/pdf',
  };
  
  /**
   * Baixa um arquivo do Google Drive, seja blob ou Google Docs
   * @param {string} fileId ID do arquivo no Drive
   * @param {string} savePath Caminho local para salvar o arquivo
   */
  async function downloadFromDrive(fileId, savePath) {
    const auth = new GoogleAuth({
      keyFile: path.resolve(__dirname, 'service-account.json'), // Caminho da credencial
      scopes: ['https://www.googleapis.com/auth/drive.readonly'],
    });
  
    const authClient = await auth.getClient();
    const drive = google.drive({version: 'v3', auth: authClient});
  
    // Primeiro, obter metadados do arquivo para saber o tipo
    const {data: fileMetadata} = await drive.files.get({
      fileId,
      fields: 'name, mimeType',
    });
  
    const fileName = fileMetadata.name;
    const mimeType = fileMetadata.mimeType;
    const fullPath = path.join(savePath, fileName);
  
    logger.info(`Nome do Arquivo: ${fileName}`);
    logger.info(`Tipo do Arquivo: ${mimeType}`);
  
    // Verifica se é arquivo do Google Workspace
    if (exportMimeTypes[mimeType]) {
      const exportMimeType = exportMimeTypes[mimeType];
      logger.debug(`Exportando "${fileName}" como ${exportMimeType}...`);
      const res = await drive.files.export(
        {
          fileId,
          mimeType: exportMimeType,
        },
        {responseType: 'stream'}
      );
  
      const finalPath = `${fullPath}.${getExtension(exportMimeType)}`;
      const dest = fs.createWriteStream(finalPath);
      await pipeStream(res.data, dest);
      return finalPath; // <-- Retorna caminho final
      //await pipeStream(res.data, dest);
    } else {
      // É arquivo blob comum
      logger.debug(`Baixando "${fileName}"...`);
      const res = await drive.files.get(
        {
          fileId,
          alt: 'media',
        },
        {responseType: 'stream'}
      );
  
      const dest = fs.createWriteStream(fullPath);
      await pipeStream(res.data, dest);
      logger.info('Download completo!');
      return dest.path; // <-- Retorna caminho completo do arquivo salvo
    }
   
  }
  
  function pipeStream(readable, writable) {
    return new Promise((resolve, reject) => {
      readable
        .on('end', resolve)
        .on('error', reject)
        .pipe(writable);
    });
  }
  
  function getExtension(mimeType) {
    const map = {
      'application/pdf': 'pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    };
    return map[mimeType] || 'bin';
  }
  
  //Exemplo de uso:
  (async () => {
    const fileId = process.env.FILE_ID; // ← Substitua no arquivo .env por um ID real do seu arquivo
    const saveDir = path.resolve(__dirname, 'downloads'); // ← Substitua pelo diretorio que ira salvar o arquivo
  
    // Criar pasta se não existir
    if (!fs.existsSync(saveDir)) {
      fs.mkdirSync(saveDir);
    }
  
    try {
      const caminhoArquivo = await downloadFromDrive(fileId, saveDir);
      await enviaremails.construirCorpoEmail(caminhoArquivo);
      logger.info('Email enviado!');
    } catch (err) {
      logger.error('Erro no download:', err);
    }
  })();


} catch (error) {
    logger.error('Erro no sistema ',error);
}

