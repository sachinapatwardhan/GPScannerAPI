const crypto = require('crypto');

const SECRET_KEY = '2sCCXGSC2F9vH8PUGEpdUhxWqaKY69Ev';
const SECRET_IV = 'aHM44sqTeRQyDrjrCbCRR9ZJrHKVhjbe';

/**
 * Encrypt using AES-256-CBC.
 * 
 * @param {string} string The string to encrypt.
 */
function _encrypt(string) {
  const key = crypto.createHash('sha256').update(SECRET_KEY).digest('hex').substr(0, 32);
  const iv = crypto.createHash('sha256').update(SECRET_IV).digest('hex').substr(0, 16);

  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  return cipher.update(string, 'utf8', 'base64') + cipher.final('base64');
}

/**
 * Decrypt using AES-256-CBC.
 * 
 * @param {string} encoded The string to decrypt.
 */
function _decrypt(string) {
  const key = crypto.createHash('sha256').update(SECRET_KEY).digest('hex').substr(0, 32);
  const iv = crypto.createHash('sha256').update(SECRET_IV).digest('hex').substr(0, 16);

  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  return decipher.update(string, 'base64', 'utf8') + decipher.final('utf8');
}

module.exports = {
  encrypt: _encrypt,
  decrypt: _decrypt
};
