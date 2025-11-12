const SUBTLE_PREFIX = 'sha256:';
const SIMPLE_PREFIX = 'plain:';

async function subtleHash(password: string, withPrefix = true): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return withPrefix ? `${SUBTLE_PREFIX}${hashHex}` : hashHex;
}

function simpleHash(password: string): string {
  return `${SIMPLE_PREFIX}${btoa(password)}`;
}

export async function hashPassword(password: string): Promise<string> {
  if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
    try {
      return await subtleHash(password);
    } catch (error) {
      console.warn('Failed to use crypto.subtle.digest, falling back to simple hash:', error);
    }
  }
  return simpleHash(password);
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  if (storedHash.startsWith(SUBTLE_PREFIX)) {
    if (typeof crypto === 'undefined' || typeof crypto.subtle === 'undefined') {
      console.warn('crypto.subtle is not available; unable to verify SHA-256 password hash.');
      return false;
    }
    const computed = await subtleHash(password);
    return storedHash === computed;
  }

  if (storedHash.startsWith(SIMPLE_PREFIX)) {
    return storedHash === simpleHash(password);
  }

  // Legacy hashes without prefixes fallback to SHA-256 hex comparison
  if (typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined') {
    try {
      const legacyHash = await subtleHash(password, false);
      if (storedHash === legacyHash) {
        return true;
      }
    } catch (error) {
      console.warn('Failed to verify legacy hash using crypto.subtle:', error);
    }
  }

  // Last resort, compare against simple hash without prefix (legacy fallback)
  if (storedHash === simpleHash(password).replace(SIMPLE_PREFIX, '')) {
    return true;
  }

  return false;
}

