const SPREADSHEET_ID = '';
const SHEET_NAME = 'Guestbook';
const PASSWORD_SALT = 'jh_is_wedding_guestbook';
const MAX_DAILY_ENTRIES = 300;
const DUPLICATE_WINDOW_SECONDS = 60;

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const action = payload.action;

    if (action === 'list') {
      return jsonResponse({ success: true, entries: listEntries() });
    }

    if (action === 'create') {
      createEntry(payload);
      return jsonResponse({ success: true, entries: listEntries() });
    }

    if (action === 'delete') {
      deleteEntry(payload);
      return jsonResponse({ success: true, entries: listEntries() });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function doGet(e) {
  try {
    const params = e.parameter || {};
    const action = params.action || 'list';

    if (action === 'list') {
      return jsonResponse({ success: true, entries: listEntries() });
    }

    if (action === 'create') {
      createEntry(params);
      return jsonResponse({ success: true, entries: listEntries() });
    }

    if (action === 'delete') {
      deleteEntry(params);
      return jsonResponse({ success: true, entries: listEntries() });
    }

    return jsonResponse({ success: false, error: 'Unknown action' });
  } catch (error) {
    return jsonResponse({ success: false, error: error.message });
  }
}

function setupGuestbookSheet() {
  const sheet = getSheet();
  ensureHeader(sheet);
}

function getSheet() {
  const spreadsheet = SPREADSHEET_ID
    ? SpreadsheetApp.openById(SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error('Spreadsheet not found. Bind this script to a Sheet or set SPREADSHEET_ID.');
  }

  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  ensureHeader(sheet);
  return sheet;
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() > 0) return;
  sheet.appendRow(['id', 'createdAt', 'nickname', 'content', 'passwordHash']);
}

function listEntries() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];

  const rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
  return rows
    .filter(row => row[0])
    .map(row => ({
      id: String(row[0]),
      createdAt: normalizeDate(row[1]),
      nickname: String(row[2] || ''),
      content: String(row[3] || '')
    }))
    .reverse();
}

function createEntry(payload) {
  const nickname = sanitize(payload.nickname, 20);
  const content = sanitize(payload.content, 300);
  const password = String(payload.password || '').trim();

  if (!nickname || !content || !password) {
    throw new Error('Missing required fields');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const sheet = getSheet();
    assertCanCreate(sheet, nickname, content);

    const id = Utilities.getUuid();
    const createdAt = new Date();
    sheet.appendRow([id, createdAt, nickname, content, hashPassword(password)]);
  } finally {
    lock.releaseLock();
  }
}

function deleteEntry(payload) {
  const id = String(payload.id || '');
  const password = String(payload.password || '').trim();
  if (!id || !password) {
    throw new Error('Missing delete fields');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(5000);

  try {
    const sheet = getSheet();
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) {
      throw new Error('Entry not found');
    }

    const rows = sheet.getRange(2, 1, lastRow - 1, 5).getValues();
    const passwordHash = hashPassword(password);

    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === id) {
        if (String(rows[i][4]) !== passwordHash) {
          throw new Error('Invalid password');
        }
        sheet.deleteRow(i + 2);
        return;
      }
    }

    throw new Error('Entry not found');
  } finally {
    lock.releaseLock();
  }
}

function assertCanCreate(sheet, nickname, content) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const duplicateWindowStart = new Date(now.getTime() - DUPLICATE_WINDOW_SECONDS * 1000);
  const rows = sheet.getRange(2, 2, lastRow - 1, 3).getValues();
  let todayCount = 0;

  rows.forEach(row => {
    const createdAt = row[0] instanceof Date ? row[0] : new Date(row[0]);
    if (Number.isNaN(createdAt.getTime())) return;

    if (createdAt >= todayStart) {
      todayCount++;
    }

    if (
      createdAt >= duplicateWindowStart &&
      String(row[1] || '') === nickname &&
      String(row[2] || '') === content
    ) {
      throw new Error('Duplicate entry');
    }
  });

  if (todayCount >= MAX_DAILY_ENTRIES) {
    throw new Error('Daily limit exceeded');
  }
}

function sanitize(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function normalizeDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function hashPassword(password) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    `${PASSWORD_SALT}:${password}`,
    Utilities.Charset.UTF_8
  );
  return bytes.map(byte => {
    const value = byte < 0 ? byte + 256 : byte;
    return value.toString(16).padStart(2, '0');
  }).join('');
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
