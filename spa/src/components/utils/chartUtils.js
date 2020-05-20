function normalizeVotes(votes) {
  const items = [votes.neutral, votes.trivial, votes.dislike, votes.hate];
  const result = [];
  let sum = 0, biggestRound = 0, roundPointer = 0;

  items.forEach((count, index) => {
    const value = 100 * count / votes.total;
    const rounded = Math.round(value);
    const diff = value - rounded;
    if (diff > biggestRound) {
      biggestRound = diff;
      roundPointer = index;
    }
    sum += rounded;
    result.push(rounded);
  });

  if (sum === 99) {
    result[roundPointer] += 1;
  } else if (sum === 101) {
    result[roundPointer] -= 1;
  }

  return {
    neutral: result[0],
    trivial: result[1],
    dislike: result[2],
    hate: result[3],
  };
}

export default normalizeVotes;
