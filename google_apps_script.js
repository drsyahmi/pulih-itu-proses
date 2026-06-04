/**
 * Google Apps Script Web App Webhook untuk "Pulih Itu Proses"
 * 
 * Sila salin kod ini ke dalam Editor Skrip Google Sheets anda:
 * 1. Buka Google Sheets yang ingin anda gunakan.
 * 2. Klik Extensions > Apps Script.
 * 3. Padam sebarang kod sedia ada, dan tampalkan kod ini.
 * 4. Klik ikon Save (Disket).
 * 5. Klik Deploy > New deployment.
 * 6. Pilih type "Web app".
 * 7. Setkan:
 *    - Description: Pulih Itu Proses Webhook
 *    - Execute as: Me (e-mel anda)
 *    - Who has access: Anyone
 * 8. Klik Deploy, luluskan kebenaran (Authorize Access) dan salin "Web app URL".
 */

function doPost(e) {
  try {
    // Membaca data JSON yang dihantar dari pelayan backend
    var data = JSON.parse(e.postData.contents);
    
    // Dapatkan helaian (sheet) aktif dalam spreadsheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Cipta pengepala (Headers) secara automatik sekiranya helaian masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Tarikh & Masa", "Nama Penuh", "Alamat E-mel", "Cabaran Utama"]);
      // Format pengepala menjadi tebal (bold)
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold").setBackground("#8EA897").setFontColor("#FFFFFF");
    }
    
    // Tambah baris baharu dengan data pelanggan
    sheet.appendRow([
      data.timestamp ? formatTimestamp(data.timestamp) : new Date(),
      data.name,
      data.email,
      data.struggle
    ]);
    
    // Beri respon balas kejayaan
    return ContentService.createTextOutput(JSON.stringify({ "status": "success", "message": "Data berhasil disimpan" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Rekod ralat sekiranya berlaku masalah
    console.error("Ralat memproses pendaftaran:", error.toString());
    return ContentService.createTextOutput(JSON.stringify({ "status": "error", "message": error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Fungsi pembantu untuk memformat masa ke zon waktu Malaysia (GMT+8)
function formatTimestamp(isoString) {
  try {
    var date = new Date(isoString);
    return Utilities.formatDate(date, "GMT+8", "yyyy-MM-dd HH:mm:ss");
  } catch (err) {
    return new Date();
  }
}
