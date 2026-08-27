/**
 * AI Harvest & Market Decision Support Service
 * 
 * Provides automated harvest recommendations, market optimization,
 * expected profit forecasting, confidence scoring, risk classification,
 * weather risk alerts, and multilingual "Why this decision?" explanations.
 */

const defaultCrops = {
  Tomato: {
    icon: "🍅",
    basePrice: 32,
    futureGrowth: 1.08,
    baseSpoilage: 5,
    care: "Monitor moisture, support plants and harvest ripe produce on time."
  },
  Onion: {
    icon: "🧅",
    basePrice: 30,
    futureGrowth: 1.06,
    baseSpoilage: 4,
    care: "Avoid excess irrigation near maturity and keep harvested bulbs dry."
  },
  Potato: {
    icon: "🥔",
    basePrice: 28,
    futureGrowth: 1.04,
    baseSpoilage: 4,
    care: "Maintain soil moisture and monitor for pest or disease symptoms."
  },
  Carrot: {
    icon: "🥕",
    basePrice: 35,
    futureGrowth: 1.03,
    baseSpoilage: 5,
    care: "Maintain consistent moisture and harvest when roots reach market size."
  },
  Brinjal: {
    icon: "🍆",
    basePrice: 34,
    futureGrowth: 1.07,
    baseSpoilage: 6,
    care: "Check regularly for fruit damage and harvest market-ready fruits."
  },
  Cabbage: {
    icon: "🥬",
    basePrice: 25,
    futureGrowth: 1.04,
    baseSpoilage: 5,
    care: "Monitor for caterpillars and avoid excess moisture during storage."
  }
};

const defaultMarketsList = [
  { id: "tiruppur", name: "Tiruppur Local Market", currentMultiplier: 1.0, distance: 12, available: true },
  { id: "coimbatore", name: "Coimbatore Market", currentMultiplier: 1.06, distance: 55, available: true },
  { id: "kangeyam", name: "Kangeyam Market", currentMultiplier: 1.03, distance: 35, available: true },
  { id: "koyambedu", name: "Chennai Koyambedu", currentMultiplier: 1.12, distance: 470, available: true }
];

const explanationTemplates = {
  English: {
    harvestNow: (market, profit, spoilage) => [
      `Selling now at ${market} yields the highest expected net return of ₹${profit.toLocaleString("en-IN")}.`,
      `Immediate harvest avoids an estimated +${spoilage}% additional spoilage risk from waiting.`,
      `Eliminates cold storage and warehousing holding costs.`,
      `Transport distance and market price provide the best profit-to-cost efficiency.`
    ],
    wait: (market, profit, diff, days) => [
      `Waiting ${days} days is projected to deliver ₹${diff.toLocaleString("en-IN")} higher profit at ${market}.`,
      `Anticipated market price growth offsets storage expenses and spoilage allowance.`,
      `${market} offers a strong price premium for well-matured produce.`,
      `Weather conditions over the waiting window remain within acceptable harvest safety limits.`
    ],
    weatherAlertRain: "Rain risk possible around Day 3-4. Monitor field drainage and moisture closely.",
    weatherAlertClear: "Stable weather conditions expected over the next 48 hours for harvest operations."
  },

  Tamil: {
    harvestNow: (market, profit, spoilage) => [
      `${market}-ல் இப்போது விற்பனை செய்வது அதிகபட்ச நிகர லாபமாக ₹${profit.toLocaleString("en-IN")} தரும்.`,
      `உடனடி அறுவடை மூலம் காத்திருப்பதால் ஏற்படும் +${spoilage}% கூடுதல் அழுகல் அபாயம் தவிர்க்கப்படுகிறது.`,
      `சேமிப்பு மற்றும் கிடங்கு வாடகைக் கட்டணங்கள் மிச்சமாகிறது.`,
      `குறைந்த போக்குவரத்து தூரத்தில் சிறந்த சந்தை விலை கிடைக்கிறது.`
    ],
    wait: (market, profit, diff, days) => [
      `${days} நாட்கள் காத்திருந்தால் ${market}-ல் ₹${diff.toLocaleString("en-IN")} கூடுதல் லாபம் கிடைக்க வாய்ப்புள்ளது.`,
      `எதிர்பார்க்கப்படும் விலை உயர்வு சேமிப்பு செலவை விட அதிகம்.`,
      `${market}-ல் முதிர்ந்த பயிருக்கு கூடுதல் விலை கிடைக்கிறது.`,
      `காத்திருக்கும் காலத்தில் வானிலை அறுவடைக்கு ஏற்றவாறு உள்ளது.`
    ],
    weatherAlertRain: "3-4 ஆம் நாளில் மழை பெய்ய வாய்ப்புள்ளது. அறுவடை திட்டத்தை கவனமாக கண்காணிக்கவும்.",
    weatherAlertClear: "அடுத்த 48 மணிநேரத்திற்கு சாதகமான வானிலை நிலவும்."
  },

  Hindi: {
    harvestNow: (market, profit, spoilage) => [
      `${market} में अभी बेचने पर सबसे अधिक ₹${profit.toLocaleString("en-IN")} का शुद्ध लाभ प्राप्त होगा।`,
      `तुरंत कटाई से लगभग +${spoilage}% अतिरिक्त सड़न का नुकसान बचता है।`,
      `भंडारण और होल्डिंग लागत पूरी तरह शून्य हो जाती है।`,
      `परिवहन दूरी और मौजूदा मंडी भाव का सबसे अच्छा संतुलन मिल रहा है।`
    ],
    wait: (market, profit, diff, days) => [
      `${days} दिन रुकने पर ${market} में ₹${diff.toLocaleString("en-IN")} अधिक लाभ मिलने का अनुमान है।`,
      `भाव में संभावित बढ़ोतरी भंडारण खर्च की तुलना में अधिक फायदेमंद है।`,
      `${market} में अच्छी गुणवत्ता वाली फसल के लिए बेहतर प्रीमियम मिल रहा है।`,
      `प्रतीक्षा अवधि के दौरान मौसम सामान्य रहने की उम्मीद है।`
    ],
    weatherAlertRain: "तीसरे-चौथे दिन बारिश की संभावना है। नमी की निगरानी रखें।",
    weatherAlertClear: "अगले 48 घंटों में कटाई के लिए मौसम बिल्कुल अनुकूल रहेगा।"
  },

  Telugu: {
    harvestNow: (market, profit, spoilage) => [
      `${market} లో ఇప్పుడే విక్రయించడం ద్వారా అత్యధికంగా ₹${profit.toLocaleString("en-IN")} నికర లాభం వస్తుంది.`,
      `వెంటనే కోయడం వల్ల వేచి ఉండటం వల్ల వచ్చే +${spoilage}% నష్టాన్ని నివారించవచ్చు.`,
      `నిల్వ మరియు నిర్వహణ ఖర్చులు ఆదా అవుతాయి.`,
      `తక్కువ రవాణా ఖర్చుతో ఉత్తమ మార్కెట్ ధర లభిస్తుంది.`
    ],
    wait: (market, profit, diff, days) => [
      `${days} రోజులు వేచి ఉంటే ${market} లో ₹${diff.toLocaleString("en-IN")} అదనపు లాభం పొందే అవకాశం ఉంది.`,
      `ఆశించిన ధర పెరుగుదల నిల్వ ఖర్చులను అధిగమిస్తుంది.`,
      `${market} లో నాణ్యమైన పంటకు మంచి ప్రీమియం ధర ఉంది.`,
      `వాతావరణం కోతకు అనుకూలంగా ఉంది.`
    ],
    weatherAlertRain: "3-4 రోజుల్లో వర్షం కురిసే అవకాశం ఉంది. అప్రమత్తంగా ఉండండి.",
    weatherAlertClear: "రాబోయే 48 గంటల్లో వాతావరణం అనుకూలంగా ఉంటుంది."
  },

  Kannada: {
    harvestNow: (market, profit, spoilage) => [
      `${market} ನಲ್ಲಿ ಈಗ ಮಾರಾಟ ಮಾಡುವುದರಿಂದ ಗರಿಷ್ಠ ₹${profit.toLocaleString("en-IN")} ನಿವ್ವಳ ಲಾಭ ದೊರೆಯುತ್ತದೆ.`,
      `ತಕ್ಷಣದ ಕೊಯ್ಲು +${spoilage}% ಹೆಚ್ಚುವರಿ ಹಾಳಾಗುವ ಅಪಾಯವನ್ನು ತಪ್ಪಿಸುತ್ತದೆ.`,
      `ಶೇಖರಣಾ ವೆಚ್ಚ ಮತ್ತು ನಿರ್ವಹಣಾ ಶುಲ್ಕ ಉಳಿತಾಯವಾಗುತ್ತದೆ.`,
      `ಸಾರಿಗೆ ವೆಚ್ಚ ಮತ್ತು ಮಾರುಕಟ್ಟೆ ಬೆಲೆಯ ಸಮತೋಲನ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.`
    ],
    wait: (market, profit, diff, days) => [
      `${days} ದಿನ ಕಾಯುವುದರಿಂದ ${market} ನಲ್ಲಿ ₹${diff.toLocaleString("en-IN")} ಹೆಚ್ಚಿನ ಲಾಭ ಸಿಗುವ ನಿರೀಕ್ಷೆಯಿದೆ.`,
      `ನಿರೀಕ್ಷಿತ ಬೆಲೆ ಏರಿಕೆಯು ಶೇಖರಣಾ ವೆಚ್ಚಕ್ಕಿಂತ ಅಧಿಕ ಲಾಭ ನೀಡುತ್ತದೆ.`,
      `${market} ನಲ್ಲಿ ಉತ್ತಮ ಗುಣಮಟ್ಟದ ಬೆಳೆಗೆ ಉತ್ತಮ ಬೆಲೆ ಲಭ್ಯವಿದೆ.`,
      `ಮುಂದಿನ ದಿನಗಳಲ್ಲಿ ಹವಾಮಾನ ಕೊಯ್ಲಿಗೆ ಪೂರಕವಾಗಿದೆ.`
    ],
    weatherAlertRain: "3-4 ನೇ ದಿನದಲ್ಲಿ ಮಳೆಯಾಗುವ ಸಾಧ್ಯತೆಯಿದೆ. ಜಾಗರೂಕರಾಗಿರಿ.",
    weatherAlertClear: "ಮುಂದಿನ 48 ಗಂಟೆಗಳಲ್ಲಿ ಹವಾಮಾನ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ."
  },

  Malayalam: {
    harvestNow: (market, profit, spoilage) => [
      `${market}-ൽ ഇപ്പോൾ വിൽക്കുന്നത് ₹${profit.toLocaleString("en-IN")} പരമാവധി ലാഭം നൽകും.`,
      `ഉടൻ വിളവെടുക്കുന്നത് കാത്തിരിപ്പ് മൂലമുണ്ടാകുന്ന +${spoilage}% കേടുപാടുകൾ ഒഴിവാക്കുന്നു.`,
      `സംഭരണച്ചെലവ് പൂർണ്ണമായും ലാഭിക്കാം.`,
      `കുറഞ്ഞ യാത്രാച്ചെലവിൽ മികച്ച വിപണി വില ലഭിക്കുന്നു.`
    ],
    wait: (market, profit, diff, days) => [
      `${days} ദിവസം കാത്തിരുന്നാൽ ${market}-ൽ ₹${diff.toLocaleString("en-IN")} അധിക ലാഭം പ്രതീക്ഷിക്കാം.`,
      `പ്രതീക്ഷിക്കുന്ന വിലക്കയറ്റം സംഭരണച്ചെലവിനേക്കാൾ ഗുണകരമാണ്.`,
      `${market}-ൽ മികച്ച വിളവിന് നല്ല വില ലഭിക്കുന്നു.`,
      `കാലാവസ്ഥ വിളവെടുപ്പിന് അനുകൂലമാണ്.`
    ],
    weatherAlertRain: "3-4 ദിവസത്തിനുള്ളിൽ മഴയ്ക്ക് സാധ്യതയുണ്ട്. ശ്രദ്ധിക്കുക.",
    weatherAlertClear: "അടുത്ത 48 മണിക്കൂറിൽ അനുകൂല കാലാവസ്ഥ പ്രതീക്ഷിക്കുന്നു."
  }
};

/**
 * Calculates AI Harvest and Market Advice based on net profit comparison,
 * transportation costs, handling costs, storage costs, spoilage losses,
 * storage capacity limits, and active market availability.
 */
function calculateAiHarvestAdvice({
  crop = "Tomato",
  quantity = 1000,
  waitingDays = 3,
  language = "English",
  costSettings = {},
  markets = []
}) {
  const selectedCrop = defaultCrops[crop] || defaultCrops.Tomato;
  const qty = Math.max(0, Number(quantity) || 0);
  const waitDays = Math.max(1, Number(waitingDays) || 3);

  const transportPerKm = Math.max(0, costSettings.transportPerKm !== undefined && !isNaN(costSettings.transportPerKm) ? Number(costSettings.transportPerKm) : 5);
  const storagePerKgDay = Math.max(0, costSettings.storagePerKgDay !== undefined && !isNaN(costSettings.storagePerKgDay) ? Number(costSettings.storagePerKgDay) : 1);
  const handling = Math.max(0, costSettings.handling !== undefined && !isNaN(costSettings.handling) ? Number(costSettings.handling) : 300);
  const storageCapacity = (costSettings.storageCapacity !== undefined && costSettings.storageCapacity !== null && costSettings.storageCapacity !== "" && !isNaN(costSettings.storageCapacity)) ? Number(costSettings.storageCapacity) : null;

  // Filter available markets
  const marketList = (Array.isArray(markets) && markets.length > 0)
    ? markets.filter(m => m.available !== false)
    : defaultMarketsList.filter(m => m.available !== false);

  if (qty <= 0 || marketList.length === 0) {
    return {
      recommendation: "HARVEST NOW",
      recommendedHarvestDate: "Today / Tomorrow",
      bestMarket: marketList[0]?.name || "Local Field Market",
      expectedProfit: 0,
      confidenceScore: 70,
      riskLevel: "MEDIUM",
      why: marketList.length === 0
        ? ["No active/available markets found. Please check operational markets."]
        : ["Harvest quantity is 0 kg."],
      weatherRiskAlert: "No market operational.",
      evaluatedMarkets: [],
      metrics: {
        crop,
        quantity: qty,
        waitingDays: waitDays,
        currentBestProfit: 0,
        waitingBestProfit: 0,
        currentSaleableKg: 0,
        waitingSaleableKg: 0,
        spoilageRateCurrent: "0%",
        spoilageRateWaiting: "0%"
      }
    };
  }

  const currentSpoilage = selectedCrop.baseSpoilage;
  const waitingSpoilage = Math.min(95, currentSpoilage + waitDays * 2);
  const addedSpoilage = waitingSpoilage - currentSpoilage;

  const currentSaleable = qty * (1 - currentSpoilage / 100);
  const waitingSaleable = qty * (1 - waitingSpoilage / 100);

  const evaluatedMarkets = marketList.map((m) => {
    const multiplier = Number(m.currentMultiplier) || 1.0;
    const distance = Number(m.distance) || 0;
    const transportCost = distance * transportPerKm;

    const currentPrice = m.currentPrice !== undefined ? Number(m.currentPrice) : (selectedCrop.basePrice * multiplier);
    const futurePrice = m.futurePrice !== undefined ? Number(m.futurePrice) : (currentPrice * (m.futureGrowth || selectedCrop.futureGrowth));

    const currentRevenue = currentSaleable * currentPrice;
    const waitingRevenue = waitingSaleable * futurePrice;

    const currentProfit = currentRevenue - transportCost - handling;
    const storageCost = waitingSaleable * storagePerKgDay * waitDays;
    const waitingProfit = waitingRevenue - transportCost - handling - storageCost;

    return {
      id: m.id || m.name,
      name: m.name,
      distance,
      currentPrice,
      futurePrice,
      transportCost,
      handlingCost: handling,
      storageCost,
      currentSpoilage,
      waitingSpoilage,
      currentRevenue,
      waitingRevenue,
      currentProfit,
      waitingProfit,
      diff: waitingProfit - currentProfit,
      available: true
    };
  });

  const bestCurrent = [...evaluatedMarkets].sort((a, b) => b.currentProfit - a.currentProfit)[0] || evaluatedMarkets[0];
  const bestWaiting = [...evaluatedMarkets].sort((a, b) => b.waitingProfit - a.waitingProfit)[0] || evaluatedMarkets[0];

  // Storage Capacity Constraint Check
  const isStorageExceeded = storageCapacity !== null && qty > storageCapacity;

  // Decision rule: Net Profit Comparison + Storage Constraint
  const shouldWait = !isStorageExceeded && bestWaiting && bestWaiting.waitingProfit > bestCurrent.currentProfit;
  const recommendation = shouldWait ? "WAIT" : "HARVEST NOW";
  const bestMarket = shouldWait ? bestWaiting.name : bestCurrent.name;
  const expectedProfit = Math.round(shouldWait ? bestWaiting.waitingProfit : bestCurrent.currentProfit);
  const profitDiff = Math.abs(Math.round(bestWaiting.waitingProfit - bestCurrent.currentProfit));

  // Confidence Calculation
  let confidenceScore = 88;
  if (shouldWait) {
    const profitMarginGain = (profitDiff / Math.max(1, bestCurrent.currentProfit)) * 100;
    confidenceScore = Math.min(96, Math.max(82, Math.round(85 + profitMarginGain * 0.8)));
  } else {
    const spoilageRiskFactor = addedSpoilage * 1.5;
    confidenceScore = Math.min(95, Math.max(86, Math.round(88 + spoilageRiskFactor)));
  }

  // Risk Level Classification
  let riskLevel = "LOW";
  if (isStorageExceeded) {
    riskLevel = "HIGH";
  } else if (shouldWait) {
    if (waitDays >= 5 || waitingSpoilage >= 16) {
      riskLevel = "HIGH";
    } else if (waitDays >= 3 || waitingSpoilage >= 10) {
      riskLevel = "MEDIUM";
    } else {
      riskLevel = "LOW";
    }
  } else {
    riskLevel = "LOW";
  }

  // Multilingual explanation generation
  const langKey = explanationTemplates[language] ? language : "English";
  const templates = explanationTemplates[langKey];

  let why = shouldWait
    ? templates.wait(bestMarket, expectedProfit, profitDiff, waitDays)
    : templates.harvestNow(bestMarket, expectedProfit, addedSpoilage);

  if (isStorageExceeded) {
    why.unshift(`⚠️ STORAGE CAPACITY EXCEEDED: Harvest quantity (${qty} kg) exceeds maximum warehouse storage limit (${storageCapacity} kg). Recommendation forced to HARVEST NOW.`);
  }

  const weatherRiskAlert = (waitDays >= 3 || riskLevel === "MEDIUM" || riskLevel === "HIGH")
    ? templates.weatherAlertRain
    : templates.weatherAlertClear;

  return {
    recommendation,
    recommendedHarvestDate: shouldWait ? `In ${waitDays} days` : "Today / Tomorrow",
    bestMarket,
    expectedProfit,
    confidenceScore,
    riskLevel,
    why,
    weatherRiskAlert,
    storageCapacityExceeded: isStorageExceeded,
    evaluatedMarkets,
    metrics: {
      crop,
      quantity: qty,
      waitingDays: waitDays,
      currentBestProfit: Math.round(bestCurrent.currentProfit),
      waitingBestProfit: Math.round(bestWaiting.waitingProfit),
      currentSaleableKg: Math.round(currentSaleable),
      waitingSaleableKg: Math.round(waitingSaleable),
      spoilageRateCurrent: `${currentSpoilage}%`,
      spoilageRateWaiting: `${waitingSpoilage}%`
    }
  };
}

module.exports = {
  calculateAiHarvestAdvice,
  defaultCrops,
  defaultMarketsList
};
