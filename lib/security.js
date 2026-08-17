import crypto from 'crypto';

/**
 * Common weak passwords blacklist to protect against dictionary attacks.
 */
const WEAK_PASSWORDS = new Set([
  '123456',
  '12345678',
  '123456789',
  'password',
  'password123',
  'admin123',
  'qwerty',
  'qwerty123',
  'letmein',
  'welcome',
  'welcome123',
  'iloveyou',
  'passcode',
  '000000',
  '111111',
  'saasgrid',
  'saaterra',
]);

/**
 * Disposable email domains blacklist to prevent spam and throwaway accounts.
 */
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'trashmail.com',
  'getairmail.com',
]);

/**
 * Validates password strength according to enterprise security standards.
 * Requirements:
 * - At least 8 characters long
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 number (0-9)
 * - At least 1 special character (!@#$%^&*...)
 * - Not in common weak passwords dictionary
 *
 * @param {string} password
 * @returns {{ valid: boolean, error?: string }}
 */
export function validatePassword(password) {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required.' };
  }

  const trimmed = password.trim();

  if (trimmed.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters long.' };
  }

  if (trimmed.length > 128) {
    return { valid: false, error: 'Password cannot exceed 128 characters.' };
  }

  if (WEAK_PASSWORDS.has(trimmed.toLowerCase())) {
    return { valid: false, error: 'This password is too common and easily guessed. Please choose a stronger password.' };
  }

  const hasUpper = /[A-Z]/.test(trimmed);
  const hasLower = /[a-z]/.test(trimmed);
  const hasNumber = /[0-9]/.test(trimmed);
  const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(trimmed);

  if (!hasUpper) {
    return { valid: false, error: 'Password must contain at least one uppercase letter (A-Z).' };
  }

  if (!hasLower) {
    return { valid: false, error: 'Password must contain at least one lowercase letter (a-z).' };
  }

  if (!hasNumber) {
    return { valid: false, error: 'Password must contain at least one number (0-9).' };
  }

  if (!hasSpecial) {
    return { valid: false, error: 'Password must contain at least one special character (e.g. !@#$%^&*).' };
  }

  return { valid: true };
}

/**
 * Validates and sanitizes email address.
 *
 * @param {string} email
 * @returns {{ valid: boolean, sanitizedEmail?: string, error?: string }}
 */
export function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email address is required.' };
  }

  const sanitized = email.toLowerCase().trim();

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(sanitized)) {
    return { valid: false, error: 'Please enter a valid email address.' };
  }

  const domain = sanitized.split('@')[1];
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, error: 'Temporary or disposable email addresses are not permitted.' };
  }

  return { valid: true, sanitizedEmail: sanitized };
}

/**
 * Sanitizes user input string against XSS and injection attacks.
 *
 * @param {string} input
 * @returns {string}
 */
export function sanitizeInput(input) {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
}

/**
 * Generates a cryptographically secure random token (e.g. for reset tokens or OTPs).
 *
 * @param {number} bytes
 * @returns {string}
 */
export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex');
}
