/**
 * Universal Isomorphic JWT (JSON Web Token) Implementation
 *
 * Implements HMAC-SHA256 (HS256) sign, verify, and decode in pure JavaScript.
 * Runs seamlessly in both Browser and Node.js environments without depending
 * on Node.js 'buffer' or 'crypto' modules.
 */

function utf8ToBytes(str: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str);
  }
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i) & 0xff;
  }
  return bytes;
}

function bytesToUtf8(bytes: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder().decode(bytes);
  }
  let str = "";
  for (let i = 0; i < bytes.length; i++) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  let base64 = "";
  if (typeof btoa !== "undefined") {
    base64 = btoa(binary);
  } else {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < binary.length; i += 3) {
      const b1 = binary.charCodeAt(i);
      const b2 = i + 1 < binary.length ? binary.charCodeAt(i + 1) : 0;
      const b3 = i + 2 < binary.length ? binary.charCodeAt(i + 2) : 0;
      base64 += chars[b1 >> 2];
      base64 += chars[((b1 & 3) << 4) | (b2 >> 4)];
      base64 += i + 1 < binary.length ? chars[((b2 & 15) << 2) | (b3 >> 6)] : "=";
      base64 += i + 2 < binary.length ? chars[b3 & 63] : "=";
    }
  }

  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }

  let binary = "";
  if (typeof atob !== "undefined") {
    binary = atob(base64);
  } else {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    for (let i = 0; i < base64.length; i += 4) {
      const c1 = chars.indexOf(base64[i]);
      const c2 = chars.indexOf(base64[i + 1]);
      const c3 = base64[i + 2] === "=" ? 0 : chars.indexOf(base64[i + 2]);
      const c4 = base64[i + 3] === "=" ? 0 : chars.indexOf(base64[i + 3]);

      binary += String.fromCharCode((c1 << 2) | (c2 >> 4));
      if (base64[i + 2] !== "=") {
        binary += String.fromCharCode(((c2 & 15) << 4) | (c3 >> 2));
      }
      if (base64[i + 3] !== "=") {
        binary += String.fromCharCode(((c3 & 3) << 6) | c4);
      }
    }
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function rotr(n: number, b: number): number {
  return ((n >>> b) | (n << (32 - b))) >>> 0;
}

function sha256(data: Uint8Array): Uint8Array {
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0x0bef9a3f, 0xc67178f2,
  ];

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const len = data.length;
  const bitLen = len * 8;
  const newLen = (((len + 8) >> 6) + 1) << 6;
  const padded = new Uint8Array(newLen);
  padded.set(data);
  padded[len] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(newLen - 4, bitLen, false);

  const w = new Uint32Array(64);
  for (let chunk = 0; chunk < newLen; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(chunk + i * 4, false);
    }
    for (let i = 16; i < 64; i++) {
      const s0 = (rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3)) >>> 0;
      const s1 = (rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10)) >>> 0;
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = (rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25)) >>> 0;
      const ch = ((e & f) ^ (~e & g)) >>> 0;
      const temp1 = (h + S1 + ch + K[i] + w[i]) >>> 0;
      const S0 = (rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22)) >>> 0;
      const maj = ((a & b) ^ (a & c) ^ (b & c)) >>> 0;
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  outView.setUint32(0, h0, false);
  outView.setUint32(4, h1, false);
  outView.setUint32(8, h2, false);
  outView.setUint32(12, h3, false);
  outView.setUint32(16, h4, false);
  outView.setUint32(20, h5, false);
  outView.setUint32(24, h6, false);
  outView.setUint32(28, h7, false);
  return out;
}

function hmacSha256(keyBytes: Uint8Array, messageBytes: Uint8Array): Uint8Array {
  const blockSize = 64;
  let key = keyBytes;
  if (key.length > blockSize) {
    key = sha256(key);
  }
  const paddedKey = new Uint8Array(blockSize);
  paddedKey.set(key);

  const oKeyPad = new Uint8Array(blockSize);
  const iKeyPad = new Uint8Array(blockSize);
  for (let i = 0; i < blockSize; i++) {
    oKeyPad[i] = paddedKey[i] ^ 0x5c;
    iKeyPad[i] = paddedKey[i] ^ 0x36;
  }

  const innerMsg = new Uint8Array(blockSize + messageBytes.length);
  innerMsg.set(iKeyPad, 0);
  innerMsg.set(messageBytes, blockSize);
  const innerHash = sha256(innerMsg);

  const outerMsg = new Uint8Array(blockSize + 32);
  outerMsg.set(oKeyPad, 0);
  outerMsg.set(innerHash, blockSize);
  return sha256(outerMsg);
}

export interface JwtSignOptions {
  expiresIn?: string | number;
}

export const jwt = {
  sign(payload: Record<string, unknown>, secret: string, options?: JwtSignOptions): string {
    const header = { alg: "HS256", typ: "JWT" };
    const now = Math.floor(Date.now() / 1000);
    const body: Record<string, unknown> = { ...payload, iat: now };

    if (options?.expiresIn) {
      let durationSeconds = 86400; // default 1 day
      if (typeof options.expiresIn === "number") {
        durationSeconds = options.expiresIn;
      } else if (typeof options.expiresIn === "string") {
        const str = options.expiresIn.trim();
        if (str.endsWith("d")) durationSeconds = parseFloat(str) * 86400;
        else if (str.endsWith("h")) durationSeconds = parseFloat(str) * 3600;
        else if (str.endsWith("m")) durationSeconds = parseFloat(str) * 60;
        else if (str.endsWith("s")) durationSeconds = parseFloat(str);
        else durationSeconds = parseFloat(str) || 86400;
      }
      body.exp = now + durationSeconds;
    }

    const encodedHeader = bytesToBase64Url(utf8ToBytes(JSON.stringify(header)));
    const encodedPayload = bytesToBase64Url(utf8ToBytes(JSON.stringify(body)));
    const message = `${encodedHeader}.${encodedPayload}`;

    const sig = hmacSha256(utf8ToBytes(secret), utf8ToBytes(message));
    const encodedSig = bytesToBase64Url(sig);

    return `${message}.${encodedSig}`;
  },

  verify<T = Record<string, unknown>>(token: string, secret: string): T {
    if (!token || typeof token !== "string") {
      throw new Error("Invalid token");
    }
    const parts = token.split(".");
    if (parts.length !== 3) {
      throw new Error("Invalid JWT token format");
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const message = `${headerB64}.${payloadB64}`;
    const expectedSig = bytesToBase64Url(hmacSha256(utf8ToBytes(secret), utf8ToBytes(message)));

    if (expectedSig !== signatureB64) {
      throw new Error("Invalid JWT signature");
    }

    const payloadJson = bytesToUtf8(base64UrlToBytes(payloadB64));
    const payload = JSON.parse(payloadJson);

    if (payload.exp && typeof payload.exp === "number") {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        throw new Error("JWT token expired");
      }
    }

    return payload as T;
  },

  decode<T = Record<string, unknown>>(token: string): T | null {
    if (!token) return null;
    const parts = token.split(".");
    if (parts.length < 2) return null;
    try {
      const payloadJson = bytesToUtf8(base64UrlToBytes(parts[1]));
      return JSON.parse(payloadJson) as T;
    } catch {
      return null;
    }
  },
};

export default jwt;
