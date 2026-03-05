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
  if (!alias) return "Anonymous";
  const regex = /^[\p{Emoji_Presentation}\p{Extended_Pictographic}\uFE0F\u200D\s]+/u;
  return alias.replace(regex, "").trim() || "Anonymous";
}

// Extracts the leading emoji from an alias like "😴 sleepy" → "😴"
export function getAliasEmoji(alias) {
  if (!alias) return "👤";
  const match = alias.match(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]/u);
  return match ? match[0] : "👤";
}