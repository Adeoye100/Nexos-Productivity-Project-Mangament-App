
/**
 * Simple reversible encryption for local-first data.
 * This is NOT cryptographically secure against targeted attacks, 
 * but prevents raw tokens from being visible in plaintext localStorage.
 */

// A simple key derived from the "device" (in this case, just a static string since we don't have a better unique device ID easily accessible in the browser without more complex APIs)
const SECRET_KEY = "nexos-local-encryption-key";

/**
 * Encrypts a string using a simple XOR-based method with base64 encoding.
 */
export function encrypt(text: string): string {
  if (!text) return "";
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return btoa(result);
}

/**
 * Decrypts a string previously encrypted with encrypt().
 */
export function decrypt(cipherText: string): string {
  if (!cipherText) return "";
  
  try {
    const text = atob(cipherText);
    let result = "";
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
      result += String.fromCharCode(charCode);
    }
    return result;
  } catch (e) {
    console.error("Failed to decrypt data", e);
    return "";
  }
}
