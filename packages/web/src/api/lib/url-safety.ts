// KIDSbSAFE URL Safety Engine
// Uses local keyword/domain blocklist + optional Google Safe Browsing API

export type UrlCategory = "adult" | "violence" | "gambling" | "drugs" | "self_harm" | "phishing" | "malware" | "safe";

interface UrlCheckResult {
  safe: boolean;
  score: number;
  category: UrlCategory;
  reason: string;
}

// Local domain/keyword blocklists
const BLOCKED_DOMAINS = [
  // Adult content
  "pornhub.com", "xvideos.com", "xhamster.com", "redtube.com", "youporn.com",
  "brazzers.com", "onlyfans.com", "chaturbate.com", "livejasmin.com",
  // Gambling
  "bet365.com", "betway.com", "ladbrokes.com", "williamhill.com", "paddy.com",
  "pokerstars.com", "888casino.com", "unibet.com", "betfair.com",
  // Dark web / dangerous
  "darkweb", "tor2web", "onion.to",
];

const BLOCKED_KEYWORDS: { pattern: RegExp; weight: number; category: UrlCategory }[] = [
  // Adult
  { pattern: /\b(porn|xxx|sex|nude|naked|adult[-_]?content|hentai|erotic)\b/i, weight: 85, category: "adult" },
  { pattern: /\b(cam(girl|boy|show)|livecam|webcam[-_]?sex)\b/i, weight: 80, category: "adult" },
  // Violence
  { pattern: /\b(gore|beheading|torture|kill[-_]?(video|cam|stream))\b/i, weight: 85, category: "violence" },
  { pattern: /\b(snuff|death[-_]?video|real[-_]?murder)\b/i, weight: 90, category: "violence" },
  // Self harm
  { pattern: /\b(how[-_]?to[-_]?(cut|self[-_]?harm|suicide)|self[-_]?harm[-_]?tips)\b/i, weight: 80, category: "self_harm" },
  { pattern: /\b(pro[-_]?(ana|mia|anorexia)|thinspiration)\b/i, weight: 75, category: "self_harm" },
  // Drugs
  { pattern: /\b(buy[-_]?(weed|cocaine|meth|heroin|fentanyl)|drug[-_]?dealer|darknet[-_]?drugs)\b/i, weight: 85, category: "drugs" },
  // Gambling
  { pattern: /\b(online[-_]?casino|free[-_]?slots|poker[-_]?bonus|sports[-_]?betting)\b/i, weight: 60, category: "gambling" },
  // Phishing
  { pattern: /\b(paypa1|g00gle|amaz0n|faceb00k|app1e)\b/i, weight: 70, category: "phishing" },
  { pattern: /\b(verify[-_]?account|suspended[-_]?account|login[-_]?verify)\b/i, weight: 50, category: "phishing" },
];

function extractDomain(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return url.toLowerCase();
  }
}

export async function checkUrl(url: string, googleSafeBrowsingKey?: string): Promise<UrlCheckResult> {
  const domain = extractDomain(url);
  const fullUrl = url.toLowerCase();

  // 1. Domain blocklist check
  for (const blocked of BLOCKED_DOMAINS) {
    if (domain === blocked || domain.endsWith(`.${blocked}`)) {
      return {
        safe: false,
        score: 90,
        category: getCategoryForDomain(blocked),
        reason: `Domain ${domain} is on the blocked list`,
      };
    }
  }

  // 2. Keyword/pattern check on URL
  let maxScore = 0;
  let dominantCategory: UrlCategory = "safe";
  let matchedReason = "";

  for (const { pattern, weight, category } of BLOCKED_KEYWORDS) {
    if (pattern.test(fullUrl)) {
      if (weight > maxScore) {
        maxScore = weight;
        dominantCategory = category;
        matchedReason = `URL contains ${category}-related content`;
      }
    }
  }

  if (maxScore >= 60) {
    return { safe: false, score: maxScore, category: dominantCategory, reason: matchedReason };
  }

  // 3. Google Safe Browsing API (if key provided)
  if (googleSafeBrowsingKey) {
    try {
      const res = await fetch(
        `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${googleSafeBrowsingKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client: { clientId: "kidsbsafe", clientVersion: "1.0" },
            threatInfo: {
              threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
              platformTypes: ["ANY_PLATFORM"],
              threatEntryTypes: ["URL"],
              threatEntries: [{ url }],
            },
          }),
        }
      );
      const data = await res.json() as { matches?: { threatType: string }[] };
      if (data.matches && data.matches.length > 0) {
        const threatType = data.matches[0].threatType;
        return {
          safe: false,
          score: 85,
          category: threatType === "MALWARE" ? "malware" : "phishing",
          reason: `Google Safe Browsing flagged as ${threatType}`,
        };
      }
    } catch {
      // Safe Browsing API failed — don't block, just continue
    }
  }

  return { safe: true, score: 0, category: "safe", reason: "" };
}

function getCategoryForDomain(domain: string): UrlCategory {
  const gambling = ["bet365", "betway", "ladbrokes", "williamhill", "paddy", "pokerstars", "888casino", "unibet", "betfair"];
  if (gambling.some(g => domain.includes(g))) return "gambling";
  return "adult";
}
