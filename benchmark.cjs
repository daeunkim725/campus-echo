const { performance } = require('perf_hooks');

// Generate mock data
const NUM_COMMENTS = 10000;
const NUM_VOTES = 50000;

const commentIds = [];
for (let i = 0; i < NUM_COMMENTS; i++) {
  commentIds.push(`comment_${i}`);
}

const userVotes = [];
for (let i = 0; i < NUM_VOTES; i++) {
  const isInclude = Math.random() < 0.5;
  const targetId = isInclude ? commentIds[Math.floor(Math.random() * commentIds.length)] : `other_comment_${i}`;
  userVotes.push({ target_id: targetId, vote_value: 1 });
}

// Baseline: using Array.includes()
const startBaseline = performance.now();
const voteMap1 = {};
for (const v of userVotes) {
  if (commentIds.includes(v.target_id)) {
    voteMap1[v.target_id] = v.vote_value;
  }
}
const endBaseline = performance.now();
const timeBaseline = endBaseline - startBaseline;

// Optimized: using Set.has()
const startOptimized = performance.now();
const voteMap2 = {};
const commentIdSet = new Set(commentIds);
for (const v of userVotes) {
  if (commentIdSet.has(v.target_id)) {
    voteMap2[v.target_id] = v.vote_value;
  }
}
const endOptimized = performance.now();
const timeOptimized = endOptimized - startOptimized;

console.log(`Baseline time: ${timeBaseline.toFixed(2)} ms`);
console.log(`Optimized time: ${timeOptimized.toFixed(2)} ms`);
console.log(`Improvement: ${(timeBaseline / timeOptimized).toFixed(2)}x faster`);
