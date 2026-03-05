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