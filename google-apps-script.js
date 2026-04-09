// ============================================
// GOOGLE APPS SCRIPT — Colar em Extensions > Apps Script
// dentro da planilha: 1CGTVABssX70bDP1JYW3kNpFfGfqn11ti0grV5E931NM
//
// DEPOIS de colar:
// 1. Deploy > New deployment > Web app
// 2. Execute as: Me
// 3. Who has access: Anyone
// 4. Copiar a URL gerada e substituir no workshopsolar.html e obrigado-workshop.html
// ============================================

var SHEET_NAME = 'Sheet1'; // ou o nome da aba

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    }

    var data = JSON.parse(e.postData.contents);
    var action = data.action || 'register';

    if (action === 'register') {
      // Verifica se headers existem
      var headers = sheet.getRange(1, 1, 1, 8).getValues()[0];
      if (headers[0] === '') {
        sheet.getRange(1, 1, 1, 8).setValues([
          ['Nome', 'Email', 'Telefone', 'Data Inscricao', 'Num Projetos', 'Tipo Captacao', 'Detalhes Extra', 'Origem']
        ]);
      }

      // Append nova linha
      var newRow = [
        data.nome || '',
        data.email || '',
        data.telefone || '',
        new Date().toLocaleString('pt-BR'),
        '', // Num Projetos (preenchido depois)
        '', // Tipo Captacao (preenchido depois)
        '', // Detalhes Extra
        'Landing Page Workshop Solar'
      ];

      sheet.appendRow(newRow);
      var lastRow = sheet.getLastRow();

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', row: lastRow, email: data.email }))
        .setMimeType(ContentService.MimeType.JSON);

    } else if (action === 'update') {
      // Busca a linha pelo email
      var emailCol = 2; // Coluna B = Email
      var allData = sheet.getDataRange().getValues();
      var targetRow = -1;

      for (var i = allData.length - 1; i >= 1; i--) {
        if (allData[i][emailCol - 1].toString().toLowerCase().trim() === data.email.toLowerCase().trim()) {
          targetRow = i + 1; // +1 porque array e 0-based e sheet e 1-based
          break;
        }
      }

      if (targetRow === -1) {
        return ContentService
          .createTextOutput(JSON.stringify({ status: 'error', message: 'Email nao encontrado' }))
          .setMimeType(ContentService.MimeType.JSON);
      }

      // Atualiza colunas E, F, G (5, 6, 7)
      if (data.numProjetos) sheet.getRange(targetRow, 5).setValue(data.numProjetos);
      if (data.tipoCaptacao) sheet.getRange(targetRow, 6).setValue(data.tipoCaptacao);
      if (data.detalhesExtra) sheet.getRange(targetRow, 7).setValue(data.detalhesExtra);

      return ContentService
        .createTextOutput(JSON.stringify({ status: 'ok', row: targetRow }))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: 'ok', message: 'Workshop Solar API ativa' }))
    .setMimeType(ContentService.MimeType.JSON);
}
