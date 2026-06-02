/**
 * Returns only digit characters (0–9) from a string.
 * Use this to sanitize phone/numeric inputs.
 */
export function onlyDigits(value) {
  return String(value).replaceAll(/\D/g, '');
}

/**
 * Validates a phone number (digits only, 5–15 chars).
 * Returns an error message string, or null if valid.
 */
export function validatePhone(phone) {
  if (!phone) return null; // campo opcional
  if (phone.length < 5) return 'El teléfono debe tener al menos 5 dígitos.';
  if (phone.length > 15) return 'El teléfono no puede superar los 15 dígitos.';
  return null;
}

/**
 * Validates an email address format.
 * Returns an error message string, or null if valid.
 */
export function validateEmail(email) {
  if (!email) return 'El correo electrónico es requerido.';
  const atIndex = email.indexOf('@');
  if (atIndex < 1 || atIndex !== email.lastIndexOf('@')) {
    return 'Ingresa un correo electrónico válido.';
  }
  const domain = email.slice(atIndex + 1);
  const dotIndex = domain.lastIndexOf('.');
  if (dotIndex < 1 || dotIndex === domain.length - 1) {
    return 'Ingresa un correo electrónico válido.';
  }
  return null;
}

/**
 * Validates a password (minimum 6 characters).
 * Returns an error message string, or null if valid.
 */
export function validatePassword(password) {
  if (!password) return 'La contraseña es requerida.';
  if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres.';
  return null;
}

/**
 * Validates that two passwords match.
 * Returns an error message string, or null if valid.
 */
export function validatePasswordMatch(password, confirm) {
  if (password !== confirm) return 'Las contraseñas no coinciden.';
  return null;
}

/**
 * Calculates password strength.
 * Returns an object { label, color, width } or null when empty.
 */
export function passwordStrength(password) {
  if (!password) return null;
  let score = 0;
  if (password.length >= 8)          score++;
  if (/[A-Z]/.test(password))        score++;
  if (/\d/.test(password))            score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score <= 1) return { label: 'Débil',   color: 'bg-red-500',    width: '25%' };
  if (score === 2) return { label: 'Regular', color: 'bg-yellow-500', width: '50%' };
  if (score === 3) return { label: 'Buena',   color: 'bg-blue-500',   width: '75%' };
  return            { label: 'Fuerte',  color: 'bg-green-500',  width: '100%' };
}
