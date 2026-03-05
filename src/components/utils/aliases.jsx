const adjectives = [
  "Anonymous", "Mysterious", "Silent", "Curious", "Brave", "Clever", "Witty", "Bold",
  "Sneaky", "Cheerful", "Grumpy", "Sleepy", "Happy", "Jolly", "Funky", "Quirky"
];

const animals = [
  "Owl", "Fox", "Bear", "Wolf", "Eagle", "Hawk", "Tiger", "Lion", "Panda", "Koala",
  "Penguin", "Dolphin", "Rabbit", "Deer", "Otter", "Hedgehog", "Raccoon", "Lynx"
];

const colors = [
  "#6C63FF", "#FF6584", "#43B89C", "#F4A261", "#E76F51", "#2A9D8F", "#E9C46A",
  "#264653", "#8338EC", "#FF006E", "#FB5607", "#3A86FF", "#06D6A0", "#EF233C"
];

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
}

export function generateAlias(seed) {
  const adjIdx = Math.abs(hashCode(seed + "adj")) % adjectives.length;
  const aniIdx = Math.abs(hashCode(seed + "ani")) % animals.length;
  const colorIdx = Math.abs(hashCode(seed + "col")) % colors.length;
  return {
    alias: `${adjectives[adjIdx]} ${animals[aniIdx]}`,
    color: colors[colorIdx]
  };
}