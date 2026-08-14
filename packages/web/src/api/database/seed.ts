import { db } from "./index";
import { domainBlacklist } from "./schema";

async function seedBlacklist() {
  console.log("🌱 Seeding Domain Blacklist...");

  const categories = {
    ADULT: "adult content",
    GAMBLING: "gambling & betting",
    VIOLENCE: "extreme violence",
    DRUGS: "illegal substances",
    SCAM: "phishing & scams",
  };

  const domains = [
    // Adult Content
    { domain: "pornhub.com", category: categories.ADULT, riskScore: 100 },
    { domain: "xvideos.com", category: categories.ADULT, riskScore: 100 },
    { domain: "chatroulette.com", category: categories.ADULT, riskScore: 90 },
    { domain: "onlyfans.com", category: categories.ADULT, riskScore: 95 },

    // Gambling
    { domain: "bet365.com", category: categories.GAMBLING, riskScore: 85 },
    { domain: "draftkings.com", category: categories.GAMBLING, riskScore: 85 },
    { domain: "stake.com", category: categories.GAMBLING, riskScore: 90 },

    // Drugs / Illegal
    { domain: "darkweb.market", category: categories.DRUGS, riskScore: 100 },
    { domain: "silkroad.com", category: categories.DRUGS, riskScore: 100 },

    // Scams / Phishing
    { domain: "free-robux.com", category: categories.SCAM, riskScore: 95 },
    { domain: "get-free-vbucks.net", category: categories.SCAM, riskScore: 95 },
    { domain: "claim-iphone-prize.com", category: categories.SCAM, riskScore: 90 },

    // High-Risk Social/Communication (Often used for grooming)
    { domain: "omegle.com", category: categories.ADULT, riskScore: 80 },
    { domain: "monkey.app", category: categories.ADULT, riskScore: 80 },
  ];

  for (const item of domains) {
    try {
      await db.insert(domainBlacklist).values({
        id: Math.random().toString(36).substring(2, 15),
        domain: item.domain,
        category: item.category,
        riskScore: item.riskScore,
        createdAt: new Date(),
      }).onConflictDoNothing();
    } catch (err) {
      console.error(`Failed to seed ${item.domain}:`, err);
    }
  }

  console.log("✅ Domain Blacklist populated successfully.");
}

seedBlacklist();
