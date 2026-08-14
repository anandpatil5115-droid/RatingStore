export const NAME_MIN = 20;
export const NAME_MAX = 60;
export const ADDRESS_MAX = 400;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PASSWORD_PATTERN = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,16}$/;

export function validateName(name) {
  if (!name || !name.trim()) return 'Name is required.';
  if (name.trim().length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters.`;
  if (name.trim().length > NAME_MAX) return `Name must not exceed ${NAME_MAX} characters.`;
  return null;
}

export function validateEmail(email) {
  if (!email || !email.trim()) return 'Email is required.';
  if (!EMAIL_PATTERN.test(email.trim())) return 'Please enter a valid email address.';
  return null;
}

export function validateAddress(address) {
  if (address && address.trim().length > ADDRESS_MAX) {
    return `Address must not exceed ${ADDRESS_MAX} characters.`;
  }
  return null;
}

export function validatePassword(password) {
  if (!password) return 'Password is required.';
  if (!PASSWORD_PATTERN.test(password)) {
    return 'Password must be 8-16 characters and include at least one uppercase letter and one special character.';
  }
  return null;
}

export function validateConfirmPassword(password, confirm) {
  if (!confirm) return 'Please confirm your password.';
  if (password !== confirm) return 'Passwords do not match.';
  return null;
}

export function validateRating(rating) {
  if (rating === null || rating === undefined || rating === '') return 'Rating is required.';
  const value = Number(rating);
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return 'Rating must be an integer between 1 and 5.';
  }
  return null;
}

export function validateStoreName(name) {
  if (!name || !name.trim()) return 'Store name is required.';
  if (name.trim().length > 60) return 'Store name must not exceed 60 characters.';
  return null;
}
