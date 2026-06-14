// KIDSbSAFE Risk Engine — scores messages/events 0-100
// Alert threshold: >= 70

export type RiskCategory = "grooming" | "bullying" | "scam" | "predator" | "other";

interface RiskSignal {
  score: number;
  category: RiskCategory;
  matched: string[];
}

const KEYWORD_SETS: { pattern: RegExp; weight: number; category: RiskCategory }[] = [
  // Grooming signals
  { pattern: /\b(asl|age[\s,]+sex[\s,]+location)\b/i, weight: 30, category: "grooming" },
  { pattern: /\b(send\s+(me\s+)?(pics|photos|nudes|pictures))\b/i, weight: 50, category: "grooming" },
  { pattern: /\b(trade\s+(pics|photos|nudes))\b/i, weight: 55, category: "grooming" },
  { pattern: /\b(keep\s+(this|it)\s+secret|this\s+is\s+our\s+secret)\b/i, weight: 45, category: "grooming" },
  { pattern: /\bwithout\s+telling\s+(your\s+)?(parents|mum|mom|dad|anyone)\b/i, weight: 50, category: "grooming" },
  { pattern: /\b(meet\s+(me\s+)?(alone|up|irl|in\s+real\s+life|tonight|today|somewhere))\b/i, weight: 40, category: "grooming" },
  { pattern: /\b(don'?t\s+tell\s+(your\s+)?(parents|mum|mom|dad))\b/i, weight: 45, category: "grooming" },
  { pattern: /\b(without\s+your\s+parents|behind\s+your\s+parents)\b/i, weight: 40, category: "grooming" },
  { pattern: /\bcan\s+you\s+meet\s+(me|us)\b/i, weight: 35, category: "grooming" },
  { pattern: /\bwant\s+to\s+(show|meet|see)\s+you\s+(something|tonight|alone|secretly)\b/i, weight: 40, category: "grooming" },
  { pattern: /\b(you'?re?\s+(so\s+)?cute\s+for\s+(your\s+)?age)\b/i, weight: 35, category: "grooming" },
  { pattern: /\b(how\s+old\s+are\s+you|how\s+big\s+are\s+you)\b/i, weight: 20, category: "grooming" },
  { pattern: /\b(sexy|hot\s+body|beautiful\s+body)\b/i, weight: 30, category: "grooming" },
  { pattern: /\b(video\s+call|facetime|skype\s+me)\b/i, weight: 15, category: "grooming" },
  { pattern: /\bi\s+want\s+to\s+(show|give|give\s+you)\s+(you\s+)?something\s+(secret|private|special)\b/i, weight: 45, category: "grooming" },
  // Predator signals
  { pattern: /\b(i'?m\s+an?\s+adult|older\s+than\s+you)\b/i, weight: 25, category: "predator" },
  { pattern: /\b(gift\s+card|amazon\s+card|itunes\s+card)\b/i, weight: 20, category: "scam" },
  // Bullying
  { pattern: /\b(kill\s+yourself|kys)\b/i, weight: 70, category: "bullying" },
  { pattern: /\b(nobody\s+likes\s+you)\b/i, weight: 25, category: "bullying" },
  { pattern: /\b(you('?re|r)\s+(ugly|fat|worthless|pathetic|loser))\b/i, weight: 35, category: "bullying" },
  { pattern: /\b(i'?ll\s+(hurt|kill|beat)\s+you)\b/i, weight: 55, category: "bullying" },
  // Scam
  { pattern: /\b(click\s+(this\s+)?link|free\s+(iphone|robux|vbucks))\b/i, weight: 25, category: "scam" },
  { pattern: /\b(you('?ve|'ve)?\s+won|claim\s+your\s+prize)\b/i, weight: 20, category: "scam" },
];

export function scoreMessage(params: {
  message: string;
  isUnknownContact?: boolean;
  messageCount?: number; // messages from this contact in last 24h
}): { score: number; category: RiskCategory; summary: string; matched: string[] } {
  const { message, isUnknownContact = false, messageCount = 1 } = params;

  let totalScore = 0;
  let dominantCategory: RiskCategory = "other";
  let maxWeight = 0;
  const matched: string[] = [];

  for (const { pattern, weight, category } of KEYWORD_SETS) {
    const match = message.match(pattern);
    if (match) {
      totalScore += weight;
      matched.push(match[0]);
      if (weight > maxWeight) {
        maxWeight = weight;
        dominantCategory = category;
      }
    }
  }

  // Sender novelty boost
  if (isUnknownContact && totalScore > 0) {
    totalScore += 20;
  }

  // Frequency anomaly boost (many messages = pressure pattern)
  if (messageCount > 10) totalScore += 10;
  if (messageCount > 25) totalScore += 10;

  // Clamp to 100
  const score = Math.min(100, totalScore);

  const summary = buildSummary(score, dominantCategory, matched, isUnknownContact);

  return { score, category: dominantCategory, summary, matched };
}

function buildSummary(
  score: number,
  category: RiskCategory,
  matched: string[],
  isUnknownContact: boolean
): string {
  const contactNote = isUnknownContact ? "Unknown contact" : "Contact";

  if (score >= 80) {
    if (category === "grooming") return `${contactNote} requesting private photos or secret meetings. Immediate attention needed.`;
    if (category === "bullying") return `Severe threatening or demeaning messages detected.`;
    if (category === "predator") return `Adult grooming pattern detected with high confidence.`;
    return `High-risk communication detected. Review immediately.`;
  }

  if (score >= 70) {
    if (category === "grooming") return `${contactNote} using grooming language patterns.`;
    if (category === "bullying") return `Bullying or threatening language detected.`;
    if (category === "scam") return `Scam or phishing attempt detected.`;
    return `Suspicious communication pattern. Review recommended.`;
  }

  return `Low-level risk signal detected. Monitoring.`;
}
