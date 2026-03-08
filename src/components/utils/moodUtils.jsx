export const MOOD_EMOJIS = {
  happy: "😊",
  sleepy: "😴",
  anxious: "😰",
  focused: "🎯",
  bored: "😐",
  excited: "🤩",
  stressed: "😤",
  chill: "😎",
  hungry: "🍕",
  caffeinated: "☕",
  lost: "🗺️",
  vibing: "🎵",
};

export function getMoodEmoji(mood) {
  return MOOD_EMOJIS[mood] || "👤";
}

export function getCleanAlias(alias) {
  return "Anonymous";
}

// Extracts the first emoji from an alias
export function getAliasEmoji(alias) {
  return "🦇";
}