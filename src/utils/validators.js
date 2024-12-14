// src/utils/validators.js
export const validEmail = (email) => {
  if (!email) return true; // Allow empty email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validPhone = (phone) => {
  const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits for Vietnamese phone numbers
  return phoneRegex.test(phone);
};

export const validName = (name) => {
  if (!name) return false;
  const nameRegex = /^[a-zA-ZÀ-ỹ\s]{2,100}$/; // Vietnamese names with spaces, 2-100 chars
  return nameRegex.test(name) && !containsEmoji(name);
};

export const validAddress = (address) => {
  if (!address) return true; // Allow empty address
  return !containsEmoji(address) && address.length <= 255;
};

export const containsEmoji = (str) => {
  const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
  return emojiRegex.test(str);
};
