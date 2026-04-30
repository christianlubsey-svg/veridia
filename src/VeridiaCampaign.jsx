import React, { useMemo, useReducer, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  BadgeDollarSign,
  BarChart3,
  CalendarDays,
  ChevronRight,
  FileWarning,
  Handshake,
  HeartPulse,
  Megaphone,
  Newspaper,
  Radio,
  RotateCcw,
  ScrollText,
  Search,
  ShieldCheck,
  Siren,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  Users,
  Vote,
  WalletCards,
  X,
} from "lucide-react";

const DEMOS = [
  { key: "urban", label: "Urban Professionals", short: "Urban" },
  { key: "rural", label: "Rural Workers", short: "Rural" },
  { key: "suburban", label: "Suburban Families", short: "Suburban" },
  { key: "young", label: "Young Voters", short: "Young" },
];

const ISSUES = ["Economy", "Healthcare", "Crime", "Environment", "Education"];

const ISSUE_DEMO_BONUS = {
  Economy: ["rural", "suburban"],
  Healthcare: ["suburban", "urban"],
  Crime: ["suburban", "rural"],
  Environment: ["young", "urban"],
  Education: ["young", "suburban"],
};

const BACKGROUNDS = [
  {
    id: "lawyer",
    label: "Lawyer",
    blurb: "A courtroom veteran with a scary nice pen collection.",
    effectsText: "+Integrity, +Urban Pros",
    effects: { integrity: 9, demos: { urban: 7 } },
  },
  {
    id: "veteran",
    label: "Veteran",
    blurb: "Knows logistics, ceremonies, and which folding chairs squeak.",
    effectsText: "+Rural, +Suburban",
    effects: { nameRec: 2, demos: { rural: 6, suburban: 6 } },
  },
  {
    id: "founder",
    label: "Tech Founder",
    blurb: "Promises to disrupt potholes through responsible synergy.",
    effectsText: "+Money, +Young Voters",
    effects: { money: 25000, demos: { young: 7, rural: -2 } },
  },
  {
    id: "activist",
    label: "Activist",
    blurb: "A megaphone, a mailing list, and suspiciously good stamina.",
    effectsText: "+Approval, -Money",
    effects: { approval: 7, money: -15000, demos: { young: 4, urban: 2 } },
  },
  {
    id: "politician",
    label: "Career Politician",
    blurb: "Has shaken every hand in Veridia, some twice.",
    effectsText: "+Name Rec, -Integrity",
    effects: { nameRec: 14, integrity: -12, demos: { suburban: 2 } },
  },
];

const PARTIES = {
  eagles: {
    id: "eagles",
    label: "Crested Eagles",
    short: "Eagles",
    color: "red",
    opponent: "doves",
    opponentName: "Nera Vale",
    modifier: { money: 10000, approval: -1, demos: { urban: 1, suburban: 2 } },
  },
  doves: {
    id: "doves",
    label: "River Doves",
    short: "Doves",
    color: "blue",
    opponent: "eagles",
    opponentName: "Marcell Quill",
    modifier: { money: -5000, approval: 2, demos: { rural: 1, young: 2 } },
  },
};

const AVATARS = ["🦅", "🌊", "🎙️", "📚", "⚙️", "🧢"];

const AD_FORMATS = {
  tv: {
    id: "tv",
    label: "TV",
    cost: 28000,
    icon: Megaphone,
    reach: 1.15,
    targets: ["urban", "rural", "suburban", "young"],
    copy: "Broad, loud, and beloved by consultants.",
  },
  social: {
    id: "social",
    label: "Social",
    cost: 9000,
    icon: Sparkles,
    reach: 1.05,
    targets: ["young"],
    copy: "Cheap, fast, and haunted by reply threads.",
  },
  radio: {
    id: "radio",
    label: "Radio",
    cost: 14000,
    icon: Radio,
    reach: 1.1,
    targets: ["rural"],
    copy: "Drive-time persuasion for the truck and tractor crowd.",
  },
  oped: {
    id: "oped",
    label: "Op-ed",
    cost: 7000,
    icon: ScrollText,
    reach: 1,
    targets: ["urban"],
    copy: "Respectable columns for people who own three tote bags.",
  },
};

const AD_TONES = {
  positive: {
    id: "positive",
    label: "Positive",
    costMultiplier: 1,
    integrity: 0,
    scandal: 0,
    approval: 1.2,
    nameRec: 0.5,
    support: 1.6,
    backlash: 0,
    copy: "Warm smiles, soft music, suspiciously clean diners.",
  },
  attack: {
    id: "attack",
    label: "Attack",
    costMultiplier: 1.05,
    integrity: -3,
    scandal: 2,
    approval: -0.5,
    nameRec: 0.8,
    support: 2.2,
    backlash: -0.4,
    copy: "Technically sourced, emotionally flammable.",
  },
  dogwhistle: {
    id: "dogwhistle",
    label: "Dog-whistle",
    costMultiplier: 1.1,
    integrity: -6,
    scandal: 7,
    approval: -1.2,
    nameRec: 1,
    support: 4.6,
    backlash: -3.5,
    copy: "A coded wink so clumsy it needs its own legal team.",
  },
  inspirational: {
    id: "inspirational",
    label: "Inspirational",
    costMultiplier: 1.35,
    integrity: 0,
    scandal: 1,
    approval: 1.8,
    nameRec: 2.4,
    support: 1.4,
    backlash: 0,
    copy: "Big flags, bigger strings, and a choir nobody budgeted for.",
  },
};

const DONOR_TEMPLATES = [
  {
    name: "Helix Petrochemical PAC",
    description: "Smiles like a refinery brochure.",
    strings: "Praise Veridia's beautifully resilient smokestacks.",
    min: 28000,
    max: 80000,
    risk: 13,
    ongoing: 5,
    leakEffect: { urban: -5, rural: 2, young: -4 },
  },
  {
    name: "Concerned Citizens for Family Values",
    description: "Three trustees and one suspiciously ornate mailbox.",
    strings: "Condemn unregulated kite festivals in a noon press hit.",
    min: 12000,
    max: 47000,
    risk: 8,
    ongoing: 3,
    leakEffect: { suburban: 3, young: -4 },
  },
  {
    name: "An Anonymous Crypto Wallet",
    description: "The memo line is just six rocket icons and a threat.",
    strings: "Promise blockchain voting by Tuesday, ideally before lunch.",
    min: 18000,
    max: 78000,
    risk: 17,
    ongoing: 7,
    leakEffect: { young: 2, urban: -3, suburban: -5 },
  },
  {
    name: "Big Pharma Wellness Coalition",
    description: "Their tote bags say 'Side Effects Include Victory.'",
    strings: "Use the phrase prescription freedom smoothie on camera.",
    min: 20000,
    max: 70000,
    risk: 12,
    ongoing: 5,
    leakEffect: { urban: -3, suburban: -3, rural: 1 },
  },
  {
    name: "The Foreman's Union (with strings attached)",
    description: "Hard hats, hard bargains, and one very specific bridge.",
    strings: "Back the surprise bridge to somewhere near the chairman.",
    min: 10000,
    max: 42000,
    risk: 6,
    ongoing: 2,
    leakEffect: { rural: 4, urban: -3 },
  },
  {
    name: "Veridian Yacht Hospitality Board",
    description: "Nobody says yacht this many times by accident.",
    strings: "Oppose the luxury pier tax with a straight face.",
    min: 24000,
    max: 76000,
    risk: 11,
    ongoing: 4,
    leakEffect: { urban: -2, rural: -5, suburban: 1 },
  },
  {
    name: "League of Concerned Almond Importers",
    description: "A tiny industry with astonishing stationery.",
    strings: "Declare almonds a strategic mineral.",
    min: 6000,
    max: 26000,
    risk: 5,
    ongoing: 2,
    leakEffect: { suburban: 2, young: -2 },
  },
  {
    name: "South Coast Ferry Kings",
    description: "They deny the floating casino because it has not floated yet.",
    strings: "Ignore harbor licensing reform until everyone forgets boats.",
    min: 16000,
    max: 62000,
    risk: 12,
    ongoing: 4,
    leakEffect: { rural: 1, urban: -4, young: -2 },
  },
];

const INSULTS = [
  "committee in a trench coat",
  "spreadsheet with elbows",
  "weather vane wearing cufflinks",
  "lukewarm banquet soup",
  "memo that learned to frown",
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function roundMoney(value) {
  return Math.round(value / 1000) * 1000;
}

function formatMoney(value) {
  const sign = value < 0 ? "-" : "";
  return `${sign}${moneyFormatter.format(Math.abs(value))}`;
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function stableIndex(seed, length) {
  if (length <= 0) return 0;
  let total = 0;
  for (let index = 0; index < seed.length; index += 1) {
    total = (total + seed.charCodeAt(index) * (index + 3)) % 9973;
  }
  return total % length;
}

function weightedPick(items) {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const item of items) {
    roll -= item.weight;
    if (roll <= 0) return item.value;
  }
  return items[items.length - 1].value;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function demoLabel(key) {
  return DEMOS.find((demo) => demo.key === key)?.label || key;
}

function applyDemos(demos, deltas = {}) {
  const next = { ...demos };
  for (const [key, delta] of Object.entries(deltas)) {
    next[key] = clamp((next[key] || 0) + delta);
  }
  return next;
}

function summarizeDeltas(deltas = {}) {
  return Object.entries(deltas)
    .filter(([, value]) => Math.abs(value) >= 0.1)
    .map(([key, value]) => `${value > 0 ? "+" : ""}${value.toFixed(1)} ${demoLabel(key)}`)
    .join(", ");
}

function calculatePoll(state) {
  const demoAverage = average(DEMOS.map((demo) => state.demos[demo.key]));
  const approvalLift = (state.approval - 35) * 0.08;
  const nameLift = (state.nameRec - 20) * 0.06;
  const integrityLift = (state.integrity - 50) * 0.03;
  const scandalDrag = state.scandal * 0.075;
  return clamp(demoAverage + approvalLift + nameLift + integrityLift - scandalDrag, 18, 82);
}

function publicPollValue(value, hasIntel) {
  if (hasIntel) return `${Math.round(value)}%`;
  const rounded = Math.round(value / 5) * 5;
  return `${clamp(rounded - 3)}-${clamp(rounded + 3)}%`;
}

function createNews(text, tag = "HQ", tone = "neutral", week = 1) {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    tag,
    tone,
    week,
  };
}

function capNews(news) {
  return news.slice(0, 42);
}

function addNews(state, entries) {
  const list = Array.isArray(entries) ? entries : [entries];
  return { ...state, news: capNews([...list, ...state.news]) };
}

function getStartingStateShell() {
  return {
    phase: "setup",
    modal: "creation",
    profile: null,
    opponent: null,
    week: 1,
    ap: 3,
    apMax: 3,
    money: 50000,
    approval: 35,
    nameRec: 20,
    integrity: 80,
    scandal: 0,
    demos: { urban: 45, rural: 45, suburban: 45, young: 45 },
    offers: [],
    acceptedDonations: [],
    activeAds: [],
    pollHistory: [],
    news: [],
    lastSummary: null,
    pendingEvent: null,
    pollIntelWeeks: 0,
    dirtFiles: 0,
    negativeWeeks: 0,
    debateDone: false,
    result: null,
  };
}

function applyCreationEffects(base, effects = {}) {
  return {
    ...base,
    money: base.money + (effects.money || 0),
    approval: clamp(base.approval + (effects.approval || 0)),
    nameRec: clamp(base.nameRec + (effects.nameRec || 0)),
    integrity: clamp(base.integrity + (effects.integrity || 0)),
    demos: applyDemos(base.demos, effects.demos),
  };
}

function createInitialCampaign(profile) {
  const background = BACKGROUNDS.find((item) => item.id === profile.background) || BACKGROUNDS[0];
  const party = PARTIES[profile.party] || PARTIES.eagles;
  let state = {
    ...getStartingStateShell(),
    phase: "playing",
    modal: null,
    profile: {
      ...profile,
      name: profile.name.trim() || "Candidate Pendleton",
      backgroundLabel: background.label,
      partyLabel: party.label,
    },
    opponent: {
      party: party.opponent,
      partyLabel: PARTIES[party.opponent].label,
      name: party.opponentName,
      money: party.opponent === "eagles" ? 65000 : 52000,
    },
  };

  state = applyCreationEffects(state, background.effects);
  state = applyCreationEffects(state, party.modifier);
  state.money = Math.max(10000, state.money);
  const startingPoll = calculatePoll(state);
  state.pollHistory = [
    {
      label: "Start",
      week: 0,
      player: Number(startingPoll.toFixed(1)),
      opponent: Number((100 - startingPoll).toFixed(1)),
    },
  ];
  state.offers = generateDonorOffers(1, state);
  state.news = [
    createNews(
      `${state.profile.name} opens HQ under a leaky banner and a suspiciously enthusiastic coffee machine.`,
      "Launch",
      "good",
      1,
    ),
    createNews(
      `${state.opponent.name} begins the week with a crisp slogan and the facial expression of a budget hearing.`,
      "Opponent",
      "neutral",
      1,
    ),
  ];
  return state;
}

function generateDonorOffers(week, state) {
  const pressure = state && state.money < 15000 ? 0.18 : 0;
  const roll = Math.random();
  const count = roll < 0.18 - pressure / 2 ? 0 : roll < 0.72 - pressure ? 1 : 2;
  const templates = [...DONOR_TEMPLATES].sort(() => Math.random() - 0.5);

  return templates.slice(0, count).map((template, index) => {
    const amount = roundMoney(randomInt(template.min, template.max) + week * randomInt(500, 1400));
    const sizeRisk = amount > 55000 ? 3 : amount > 35000 ? 2 : 0;
    const lateRisk = week >= 9 ? 2 : week >= 6 ? 1 : 0;
    return {
      id: `donor-${week}-${index}-${Math.random().toString(16).slice(2)}`,
      ...template,
      amount,
      risk: template.risk + sizeRisk + lateRisk,
      ongoing: template.ongoing + (amount > 60000 ? 1 : 0),
      negotiated: false,
      week,
    };
  });
}

function buildHeadline(profile, opponent, draft) {
  const name = profile?.name || "The Candidate";
  const rival = opponent?.name || "the opponent";
  const topic = draft.topic.toUpperCase();
  const insult = INSULTS[stableIndex(`${name}-${rival}-${draft.format}-${draft.tone}-${draft.topic}`, INSULTS.length)];

  if (draft.tone === "attack") {
    return `${name} PROMISES TO FIX ${topic} — Calls ${rival} a "${insult}"`;
  }
  if (draft.tone === "dogwhistle") {
    return `${name} Launches "Real Veridia First-ish" ${topic} Blitz; Lawyers Begin Sweating`;
  }
  if (draft.tone === "inspirational") {
    return `${name} Asks Veridia to Believe in ${topic}, Decent Chairs, and Tomorrow`;
  }
  return `${name} Offers Sunny ${topic} Plan; Staff Confirms the Pie Charts Are Real`;
}

function buildAdPlan(state, draft) {
  const format = AD_FORMATS[draft.format] || AD_FORMATS.tv;
  const tone = AD_TONES[draft.tone] || AD_TONES.positive;
  const cost = roundMoney(format.cost * tone.costMultiplier);
  const supportDeltas = {};
  const targets = [...format.targets];
  const signatureTargets = ISSUE_DEMO_BONUS[draft.topic] || [];
  const isSignature = state.profile?.issue === draft.topic;

  for (const key of targets) {
    supportDeltas[key] = (supportDeltas[key] || 0) + tone.support * format.reach;
  }

  for (const key of signatureTargets) {
    supportDeltas[key] = (supportDeltas[key] || 0) + (isSignature ? 1.4 : 0.45);
  }

  if (draft.tone === "dogwhistle") {
    const fallbackTargets = signatureTargets.length ? signatureTargets : DEMOS.map((demo) => demo.key);
    const target = targets.length === 1 ? targets[0] : fallbackTargets[stableIndex(`${draft.format}-${draft.topic}`, fallbackTargets.length)];
    const backlashOptions = DEMOS.map((demo) => demo.key).filter((key) => key !== target);
    const backlash = backlashOptions[stableIndex(`${draft.tone}-${draft.topic}`, backlashOptions.length)];
    supportDeltas[target] = (supportDeltas[target] || 0) + 2.1;
    supportDeltas[backlash] = (supportDeltas[backlash] || 0) + tone.backlash;
  } else if (tone.backlash) {
    const weakest = DEMOS.map((demo) => demo.key).sort((a, b) => state.demos[a] - state.demos[b])[0];
    supportDeltas[weakest] = (supportDeltas[weakest] || 0) + tone.backlash;
  }

  return {
    id: `ad-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    format: draft.format,
    tone: draft.tone,
    topic: draft.topic,
    cost,
    headline: buildHeadline(state.profile, state.opponent, draft),
    remaining: 2,
    perWeek: {
      approval: tone.approval,
      nameRec: tone.nameRec + (format.id === "tv" ? 0.4 : 0),
      integrity: tone.integrity,
      scandal: tone.scandal,
      demos: supportDeltas,
    },
  };
}

function applyEffect(state, effect = {}) {
  return {
    ...state,
    money: state.money + (effect.money || 0),
    approval: clamp(state.approval + (effect.approval || 0)),
    nameRec: clamp(state.nameRec + (effect.nameRec || 0)),
    integrity: clamp(state.integrity + (effect.integrity || 0)),
    scandal: clamp(state.scandal + (effect.scandal || 0)),
    demos: applyDemos(state.demos, effect.demos),
  };
}

function canSpend(state, cost) {
  return state.money - cost >= -50000;
}

function finalizeImmediateState(state) {
  if (state.phase === "playing" && state.scandal >= 100) {
    const poll = calculatePoll(state);
    return {
      ...state,
      phase: "ended",
      modal: "election",
      result: {
        type: "scandal",
        won: false,
        title: "Forced Withdrawal",
        detail: "The Scandal Meter hit 100. The campaign exits under a cloud of microphones and legal invoices.",
        finalPoll: poll,
      },
    };
  }
  return state;
}

function actionReducer(state, action) {
  if (state.phase !== "playing") return state;
  if (state.ap <= 0) return addNews(state, createNews("The scheduler is out of squares. No action points remain this week.", "AP", "bad", state.week));

  if (action.kind === "rally") {
    const cost = 5000;
    if (!canSpend(state, cost)) return addNews(state, createNews("The bank says the rally budget has become performance art.", "Money", "bad", state.week));
    const target = action.target || "suburban";
    return finalizeImmediateState(
      addNews(
        applyEffect(
          {
            ...state,
            ap: state.ap - 1,
          },
          {
            money: -cost,
            nameRec: 4,
            demos: { [target]: 3.2 },
          },
        ),
        createNews(`${state.profile.name} packs a rally hall for ${demoLabel(target)}. The chant scans poorly but works.`, "Rally", "good", state.week),
      ),
    );
  }

  if (action.kind === "ground") {
    const cost = 10000;
    if (!canSpend(state, cost)) return addNews(state, createNews("Field organizers report that vibes are not legal tender.", "Money", "bad", state.week));
    return finalizeImmediateState(
      addNews(
        applyEffect(
          {
            ...state,
            ap: state.ap - 1,
          },
          {
            money: -cost,
            approval: 2,
            demos: { urban: 1.2, rural: 1.2, suburban: 1.2, young: 1.2 },
          },
        ),
        createNews("Ground teams knock doors, soothe pets, and convert porch skepticism into tiny poll gains.", "Ground", "good", state.week),
      ),
    );
  }

  if (action.kind === "hire") {
    const cost = 15000;
    if (state.apMax >= 6) return addNews(state, createNews("HQ is already full. Someone is campaigning from the supply closet.", "Staff", "neutral", state.week));
    if (!canSpend(state, cost)) return addNews(state, createNews("The staffing agency refuses payment in future cabinet rumors.", "Money", "bad", state.week));
    return finalizeImmediateState(
      addNews(
        applyEffect(
          {
            ...state,
            ap: state.ap - 1,
            apMax: clamp(state.apMax + 1, 3, 6),
          },
          { money: -cost, nameRec: 1 },
        ),
        createNews("A new field director joins HQ and immediately finds eleven missing clipboards.", "Staff", "good", state.week),
      ),
    );
  }

  if (action.kind === "research") {
    const cost = 8000;
    if (!canSpend(state, cost)) return addNews(state, createNews("The opposition researcher will not accept payment in ominous folders.", "Money", "bad", state.week));
    const success = Math.random() < 0.5 + (state.nameRec > 55 ? 0.08 : 0);
    const base = applyEffect(
      {
        ...state,
        ap: state.ap - 1,
        dirtFiles: state.dirtFiles + (success ? 1 : 0),
      },
      { money: -cost },
    );
    return addNews(
      base,
      createNews(
        success
          ? `Researchers uncover a file titled "${state.opponent.name} - Definitely Normal Ferry Receipts."`
          : "Opposition research finds only a parking ticket and a receipt for boring soup.",
        "Research",
        success ? "good" : "neutral",
        state.week,
      ),
    );
  }

  if (action.kind === "polling") {
    const cost = 3000;
    if (!canSpend(state, cost)) return addNews(state, createNews("The pollster hangs up after hearing the word exposure.", "Money", "bad", state.week));
    return addNews(
      applyEffect(
        {
          ...state,
          ap: state.ap - 1,
          pollIntelWeeks: 2,
        },
        { money: -cost },
      ),
      createNews("Internal pollsters return with exact numbers and the haunted eyes of people who have seen cross-tabs.", "Polling", "good", state.week),
    );
  }

  return state;
}

function applyActiveAds(state, summary, weekNews) {
  let next = state;
  const remainingAds = [];

  for (const ad of state.activeAds) {
    next = applyEffect(next, ad.perWeek);
    const deltaText = summarizeDeltas(ad.perWeek.demos);
    summary.push({
      label: "Ad impact",
      text: `"${ad.headline}" moved ${deltaText || "the public mood"} this week.`,
    });
    weekNews.push(createNews(`Ad buy lands: ${ad.headline}`, "Ads", "good", state.week));
    if (ad.remaining > 1) {
      remainingAds.push({ ...ad, remaining: ad.remaining - 1 });
    } else {
      weekNews.push(createNews(`${AD_FORMATS[ad.format].label} ad expires before consultants can order a sequel.`, "Ads", "neutral", state.week));
    }
  }

  return { ...next, activeAds: remainingAds };
}

function applyOpponentTurn(state, summary, weekNews) {
  let next = { ...state, opponent: { ...state.opponent } };
  const opponentParty = PARTIES[next.opponent.party];
  const income = opponentParty.id === "eagles" ? randomInt(28000, 43000) : randomInt(23000, 36000);
  next.opponent.money += income;

  const weakestDemo = DEMOS.map((demo) => demo.key).sort((a, b) => next.demos[a] - next.demos[b])[0];
  const adCost = randomInt(10000, 22000);
  if (next.opponent.money >= adCost) {
    next.opponent.money -= adCost;
    const hit = randomFloat(1.7, 3.5) + (next.scandal > 45 ? 0.7 : 0);
    next = applyEffect(next, {
      approval: next.scandal > 55 ? -0.8 : 0,
      demos: { [weakestDemo]: -hit },
    });
    summary.push({
      label: "Opponent move",
      text: `${next.opponent.name} targeted ${demoLabel(weakestDemo)} for -${hit.toFixed(1)} support.`,
    });
    weekNews.push(
      createNews(
        `${next.opponent.name} buys ads in ${demoLabel(weakestDemo)}: "Competence, But Make It Ominous."`,
        "Opponent",
        "bad",
        state.week,
      ),
    );
  }

  if (Math.random() < 0.32) {
    const target = pick(DEMOS).key;
    next = applyEffect(next, {
      approval: -1,
      demos: { [target]: -1.4 },
    });
    summary.push({
      label: "Opponent attack",
      text: `${next.opponent.name} landed a jab with ${demoLabel(target)}.`,
    });
    weekNews.push(
      createNews(
        `${next.opponent.name} accuses HQ of "reckless enthusiasm and suspiciously aligned chairs."`,
        "Opponent",
        "bad",
        state.week,
      ),
    );
  }

  return next;
}

function chooseWeeklyEvent(state) {
  if (!state.debateDone && state.week >= 5 && state.week <= 8 && Math.random() < 0.42) {
    return { type: "debate" };
  }
  if (!state.debateDone && state.week === 9) return { type: "debate" };

  const pool = [
    { weight: state.integrity < 48 ? 10 : 4, value: { type: "hotMic" } },
    { weight: 7, value: { type: "opponentScandal" } },
    { weight: 8, value: { type: "economyDip" } },
    { weight: state.apMax >= 5 ? 5 : 8, value: { type: "volunteerWave" } },
    { weight: state.money < 0 ? 9 : 4, value: { type: "vendorPanic" } },
    { weight: state.acceptedDonations.length ? 8 : 0, value: { type: "donorStrings" } },
    { weight: state.acceptedDonations.length && state.scandal > 30 ? 12 : state.acceptedDonations.length ? 5 : 0, value: { type: "whistleblower" } },
    { weight: state.integrity < 30 ? 12 : 0, value: { type: "paperTrail" } },
    { weight: state.nameRec < 35 ? 7 : 4, value: { type: "mascotBoost" } },
  ];

  return weightedPick(pool.filter((item) => item.weight > 0));
}

function resolveDebate(state, choice, summary, weekNews) {
  let next = { ...state, debateDone: true };
  const roll = randomFloat(-8, 8);
  let score = 0;
  let text = "";

  if (choice === "aggressive") {
    score = state.nameRec * 0.45 + (100 - state.integrity) * 0.22 + roll;
    if (score >= 38) {
      next = applyEffect(next, { nameRec: 4, demos: { urban: 1.5, rural: 1.5, suburban: 1.5, young: 1.5 }, integrity: -3, scandal: 2 });
      text = "Aggressive debate lines clip cleanly, even the one about municipal soup.";
    } else {
      next = applyEffect(next, { approval: -3, integrity: -4, scandal: 4, demos: { suburban: -1.5 } });
      text = "The aggressive strategy lands like a dropped filing cabinet.";
    }
  } else if (choice === "statesman") {
    score = state.integrity * 0.42 + state.approval * 0.35 + roll;
    if (score >= 46) {
      next = applyEffect(next, { approval: 4, integrity: 2, demos: { suburban: 2, urban: 1.2 } });
      text = "The statesman routine works; three pundits call it presidential before correcting themselves.";
    } else {
      next = applyEffect(next, { nameRec: -1, demos: { young: -1.6 } });
      text = "Statesman mode reads as sleep mode. The youth panel invents a yawn emoji.";
    }
  } else {
    score = state.nameRec * 0.2 + state.approval * 0.24 + (state.profile?.issue ? 16 : 0) + roll;
    if (score >= 36) {
      const issueTargets = ISSUE_DEMO_BONUS[state.profile.issue] || ["urban"];
      const deltas = Object.fromEntries(issueTargets.map((key) => [key, 2.6]));
      next = applyEffect(next, { approval: 2, nameRec: 2, demos: deltas });
      text = `Wonky answers on ${state.profile.issue} charm voters who own highlighters.`;
    } else {
      next = applyEffect(next, { nameRec: 1, approval: -2, demos: { rural: -1.3, young: -1.3 } });
      text = "The wonky answer uses six acronyms and injures morale.";
    }
  }

  summary.push({ label: "Debate night", text });
  weekNews.push(createNews(text, "Debate", score >= 36 ? "good" : "bad", state.week));
  return next;
}

function applyWeeklyEvent(state, event, debateChoice, summary, weekNews) {
  let next = state;

  if (event.type === "debate") {
    return resolveDebate(next, debateChoice, summary, weekNews);
  }

  if (event.type === "hotMic") {
    if (state.integrity < 48 || state.scandal > 45) {
      next = applyEffect(next, { approval: -4, scandal: 6, demos: { suburban: -1.5, urban: -1 } });
      summary.push({ label: "Hot mic", text: "A hot mic catches staff calling the platform 'mostly load-bearing.' Approval slips." });
      weekNews.push(createNews("Hot mic moment: HQ insists 'mostly load-bearing' was a compliment.", "Event", "bad", state.week));
    } else {
      next = applyEffect(next, { approval: 2, nameRec: 2 });
      summary.push({ label: "Hot mic", text: "A hot mic catches a sincere pep talk. Veridia briefly enjoys sincerity." });
      weekNews.push(createNews("Hot mic moment helps after the candidate says something accidentally wholesome.", "Event", "good", state.week));
    }
  }

  if (event.type === "opponentScandal") {
    next = applyEffect(next, { nameRec: 2, demos: { urban: 2.4, rural: 2.4, suburban: 2.4, young: 2.4 } });
    summary.push({ label: "Opponent scandal", text: `${state.opponent.name} is linked to a ceremonial scissors expense scandal. Your poll rises.` });
    weekNews.push(createNews(`${state.opponent.name} denies owning 43 ceremonial scissors. Nobody asked about 42.`, "Opponent", "good", state.week));
  }

  if (event.type === "economyDip") {
    if (state.profile.party === "eagles") {
      next = applyEffect(next, { approval: -2, demos: { rural: -2.4, suburban: -1.8 } });
      summary.push({ label: "Economy dips", text: "The ruling Crested Eagles get blamed for a wobbling economy. Your party eats the invoice." });
      weekNews.push(createNews("Economy dips; every economist on TV points at a different chart.", "Economy", "bad", state.week));
    } else {
      next = applyEffect(next, { approval: 1, demos: { rural: 1.8, suburban: 1.4, young: 1 } });
      summary.push({ label: "Economy dips", text: "The ruling Crested Eagles absorb the blame. River Dove challengers get a free gust." });
      weekNews.push(createNews("Economy dips; challenger message gets sharper without paying for a new font.", "Economy", "good", state.week));
    }
  }

  if (event.type === "volunteerWave") {
    const goodWave = state.approval >= 42 || state.integrity >= 70;
    next = applyEffect(next, goodWave
      ? { money: 6000, approval: 1, demos: { urban: 1.2, rural: 1.2, suburban: 1.2, young: 1.2 } }
      : { money: 3000, nameRec: 1, demos: { young: 0.8 } });
    summary.push({
      label: "Volunteer wave",
      text: goodWave
        ? "Volunteers flood HQ with clipboards, muffins, and measurable enthusiasm."
        : "A small volunteer wave arrives, then debates the playlist for ninety minutes.",
    });
    weekNews.push(createNews("Volunteer wave brings muffins and a whiteboard no one can erase.", "Field", goodWave ? "good" : "neutral", state.week));
  }

  if (event.type === "vendorPanic") {
    next = applyEffect(next, state.money < 0 ? { approval: -1, nameRec: -1, scandal: 3 } : { money: -4000 });
    summary.push({
      label: "Vendor panic",
      text: state.money < 0
        ? "Unpaid vendors leak grumpy invoices. The campaign's copier becomes a hostile witness."
        : "A podium vendor discovers rush fees and charges accordingly.",
    });
    weekNews.push(createNews("Vendor panic at HQ after someone orders a podium with cupholders.", "Money", state.money < 0 ? "bad" : "neutral", state.week));
  }

  if (event.type === "donorStrings") {
    const donor = pick(state.acceptedDonations);
    next = applyEffect(next, { integrity: -2, scandal: 3 });
    summary.push({ label: "Strings attached", text: `${donor.name} calls in a favor: ${donor.strings}` });
    weekNews.push(createNews(`${donor.name} calls in a favor. Staff adds three asterisks to the talking points.`, "Donor", "bad", state.week));
  }

  if (event.type === "whistleblower") {
    const donor = pick(state.acceptedDonations);
    next = applyEffect(next, {
      approval: -4,
      integrity: -5,
      scandal: 15,
      demos: donor.leakEffect,
    });
    next = {
      ...next,
      acceptedDonations: next.acceptedDonations.filter((item) => item.id !== donor.id),
    };
    summary.push({
      label: "Whistleblower",
      text: `${donor.name} leaks. ${summarizeDeltas(donor.leakEffect)}. Scandal risk spikes.`,
    });
    weekNews.push(createNews(`Whistleblower leaks ${donor.name}; the apology podium gets promoted to full-time.`, "Scandal", "bad", state.week));
  }

  if (event.type === "paperTrail") {
    next = applyEffect(next, { approval: -3, integrity: -4, scandal: 10, demos: { urban: -2, young: -2 } });
    summary.push({ label: "Paper trail", text: "Low-integrity paperwork begins reproducing in the dark. Reporters notice." });
    weekNews.push(createNews("Paper trail emerges from a drawer labeled 'Do Not Label This Drawer.'", "Scandal", "bad", state.week));
  }

  if (event.type === "mascotBoost") {
    next = applyEffect(next, { nameRec: 3, demos: { young: 1.5, suburban: 0.8 } });
    summary.push({ label: "Mascot boost", text: "A campaign mascot goes viral after falling off a tiny stage with dignity." });
    weekNews.push(createNews("Mascot clip goes viral; nobody can remember the policy, but everyone knows the hat.", "Culture", "good", state.week));
  }

  return next;
}

function applyScandalExposure(state, summary, weekNews) {
  const ongoingRisk = state.acceptedDonations.reduce((sum, donor) => sum + donor.ongoing, 0);
  const lowIntegrityRisk = state.integrity < 30 ? 0.12 : state.integrity < 45 ? 0.05 : 0;
  const chance = clamp(state.scandal * 0.004 + ongoingRisk * 0.008 + lowIntegrityRisk, 0, 0.58);
  let next = state;

  if (Math.random() < chance) {
    if (state.acceptedDonations.length > 0) {
      const donor = pick(state.acceptedDonations);
      next = applyEffect(next, {
        approval: -3,
        integrity: -4,
        scandal: 12,
        demos: donor.leakEffect,
      });
      next = {
        ...next,
        acceptedDonations: next.acceptedDonations.filter((item) => item.id !== donor.id),
      };
      summary.push({
        label: "Leak",
        text: `${donor.name} surfaces in a late-night leak. ${summarizeDeltas(donor.leakEffect)}.`,
      });
      weekNews.push(createNews(`Late leak ties HQ to ${donor.name}. Everyone says "routine compliance" too quickly.`, "Leak", "bad", state.week));
    } else {
      next = applyEffect(next, { approval: -2, integrity: -2, scandal: 7, demos: { urban: -1.3, suburban: -1.3 } });
      summary.push({ label: "Leak", text: "A minor ethics leak lands. Small, sticky, and expensive to explain." });
      weekNews.push(createNews("Minor ethics leak appears; the campaign lawyer starts speaking in footnotes.", "Leak", "bad", state.week));
    }
  } else {
    const cooldown = state.integrity >= 65 ? -3 : state.integrity >= 45 ? -2 : -1;
    next = applyEffect(next, { scandal: cooldown });
    if (state.scandal > 12) {
      summary.push({ label: "Scandal watch", text: "No fresh exposure this week. The meter cools slightly." });
    }
  }

  return next;
}

function finishWeek(state, event, debateChoice = null) {
  const startPoll = calculatePoll(state);
  const summary = [];
  const weekNews = [];
  let next = { ...state, modal: null, pendingEvent: null };

  next = applyActiveAds(next, summary, weekNews);
  next = applyOpponentTurn(next, summary, weekNews);
  next = applyWeeklyEvent(next, event, debateChoice, summary, weekNews);
  next = applyScandalExposure(next, summary, weekNews);

  const cleanFundraising = roundMoney(7000 + next.approval * 150 + next.nameRec * 120 + randomInt(0, 5000));
  next = applyEffect(next, { money: cleanFundraising });
  summary.push({ label: "Clean fundraising", text: `${formatMoney(cleanFundraising)} arrives from small donors and bake sales with receipts.` });

  const endPoll = calculatePoll(next);
  const negativeWeeks = next.money < 0 ? state.negativeWeeks + 1 : 0;
  const pollEntry = {
    label: `W${state.week}`,
    week: state.week,
    player: Number(endPoll.toFixed(1)),
    opponent: Number((100 - endPoll).toFixed(1)),
  };

  next = {
    ...next,
    news: capNews([...weekNews.reverse(), ...next.news]),
    pollHistory: [...next.pollHistory, pollEntry],
    pollIntelWeeks: Math.max(0, next.pollIntelWeeks - 1),
    negativeWeeks,
    lastSummary: {
      week: state.week,
      startPoll,
      endPoll,
      money: next.money,
      items: summary,
    },
  };

  if (next.scandal >= 100) {
    return {
      ...next,
      phase: "ended",
      modal: "election",
      result: {
        type: "scandal",
        won: false,
        title: "Forced Withdrawal",
        detail: "The Scandal Meter hit 100. Reporters form a semicircle. The campaign folds.",
        finalPoll: endPoll,
      },
    };
  }

  if (negativeWeeks >= 2) {
    return {
      ...next,
      phase: "ended",
      modal: "election",
      result: {
        type: "bank",
        won: false,
        title: "Campaign Collapse",
        detail: "The bank balance stayed negative for two straight weeks. The finance chair resigns via invoice.",
        finalPoll: endPoll,
      },
    };
  }

  if (state.week >= 12) {
    const won = endPoll > 50;
    return {
      ...next,
      phase: "ended",
      modal: "election",
      result: {
        type: "election",
        won,
        title: won ? "Victory in Veridia" : "Defeat at the Ballot Box",
        detail: won
          ? "Your coalition holds through Election Day. The confetti budget was somehow justified."
          : "The opponent leads the final poll. HQ quietly hides the victory cake.",
        finalPoll: endPoll,
      },
    };
  }

  return {
    ...next,
    week: state.week + 1,
    ap: next.apMax,
    offers: generateDonorOffers(state.week + 1, next),
    modal: "summary",
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "START":
      return createInitialCampaign(action.profile);
    case "RESET":
      return getStartingStateShell();
    case "CLOSE_MODAL":
      if (state.phase === "setup") return state;
      return { ...state, modal: null, pendingEvent: null };
    case "REVIEW_DONOR":
      return { ...state, modal: "donor", reviewingDonorId: action.offerId };
    case "DONOR_DECISION": {
      const offer = state.offers.find((item) => item.id === action.offerId);
      if (!offer) return { ...state, modal: null, reviewingDonorId: null };

      if (action.decision === "negotiate") {
        if (state.ap <= 0) return addNews(state, createNews("Negotiation requires an action point and one dry pastry.", "AP", "bad", state.week));
        const negotiated = {
          ...offer,
          amount: roundMoney(offer.amount * 0.72),
          risk: Math.max(2, Math.round(offer.risk * 0.58)),
          ongoing: Math.max(1, offer.ongoing - 2),
          negotiated: true,
          strings: `Watered down: ${offer.strings}`,
        };
        return addNews(
          {
            ...state,
            ap: state.ap - 1,
            modal: null,
            reviewingDonorId: null,
            offers: state.offers.map((item) => (item.id === offer.id ? negotiated : item)),
          },
          createNews(`Negotiators trim ${offer.name}'s check and most of the fingerprints.`, "Donor", "neutral", state.week),
        );
      }

      if (action.decision === "decline") {
        return addNews(
          {
            ...applyEffect(state, { integrity: 2 }),
            modal: null,
            reviewingDonorId: null,
            offers: state.offers.filter((item) => item.id !== offer.id),
          },
          createNews(`${offer.name} is declined. Integrity gets a tiny mint on the pillow.`, "Donor", "good", state.week),
        );
      }

      if (action.decision === "accept") {
        return finalizeImmediateState(
          addNews(
            {
              ...applyEffect(state, {
                money: offer.amount,
                integrity: -Math.ceil(offer.risk / 3),
                scandal: offer.risk,
              }),
              modal: null,
              reviewingDonorId: null,
              offers: state.offers.filter((item) => item.id !== offer.id),
              acceptedDonations: [...state.acceptedDonations, offer],
            },
            createNews(`${offer.name} wires ${formatMoney(offer.amount)}. The compliance binder gains weight.`, "Donor", "bad", state.week),
          ),
        );
      }
      return state;
    }
    case "ACTION":
      return actionReducer(state, action);
    case "OPEN_AD":
      return { ...state, modal: "ad" };
    case "CONFIRM_AD": {
      if (state.ap <= 0) return addNews(state, createNews("No action points remain for production crews.", "AP", "bad", state.week));
      const ad = buildAdPlan(state, action.draft);
      if (!canSpend(state, ad.cost)) return addNews(state, createNews("The media buyer asks whether exposure pays invoices. It does not.", "Money", "bad", state.week));
      return finalizeImmediateState(
        addNews(
          {
            ...applyEffect(state, { money: -ad.cost }),
            ap: state.ap - 1,
            modal: null,
            activeAds: [...state.activeAds, ad],
          },
          createNews(`Production wraps: ${ad.headline}`, "Ads", "good", state.week),
        ),
      );
    }
    case "RELEASE_DIRT": {
      if (state.dirtFiles <= 0) return state;
      return finalizeImmediateState(
        addNews(
          {
            ...applyEffect(state, {
              integrity: -4,
              scandal: 4,
              nameRec: 1,
              demos: { urban: 1.8, rural: 1.8, suburban: 1.8, young: 1.8 },
            }),
            dirtFiles: state.dirtFiles - 1,
          },
          createNews(`HQ releases the ferry receipts. ${state.opponent.name}'s smile briefly files for asylum.`, "Research", "good", state.week),
        ),
      );
    }
    case "END_WEEK": {
      const event = chooseWeeklyEvent(state);
      if (event.type === "debate") {
        return { ...state, modal: "debate", pendingEvent: event };
      }
      return finishWeek(state, event);
    }
    case "RESOLVE_DEBATE":
      return finishWeek(state, state.pendingEvent || { type: "debate" }, action.choice);
    default:
      return state;
  }
}

function StatPill({ icon: Icon, label, value, sub, tone = "blue" }) {
  const tones = {
    blue: "border-blue-700 bg-blue-950/60 text-blue-100",
    red: "border-red-700 bg-red-950/60 text-red-100",
    green: "border-emerald-700 bg-emerald-950/60 text-emerald-100",
    amber: "border-amber-700 bg-amber-950/60 text-amber-100",
    slate: "border-slate-700 bg-slate-900/70 text-slate-100",
  };
  return (
    <div className={`rounded-lg border px-3 py-2 shadow-sm transition-all ${tones[tone]}`}>
      <div className="flex items-center gap-2 text-xs uppercase tracking-wide opacity-80">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <div className="mt-1 flex items-end gap-2">
        <span className="text-lg font-bold leading-none">{value}</span>
        {sub ? <span className="text-xs opacity-75">{sub}</span> : null}
      </div>
    </div>
  );
}

function Modal({ children, wide = false, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-lg border border-slate-600 bg-slate-950 text-slate-100 shadow-2xl ${wide ? "max-w-5xl" : "max-w-2xl"}`}>
        {onClose ? (
          <div className="sticky top-0 z-10 flex justify-end border-b border-slate-800 bg-slate-950/95 p-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

function CreationModal({ onStart }) {
  const [draft, setDraft] = useState({
    name: "Mira Voss",
    avatar: AVATARS[0],
    background: "lawyer",
    issue: "Economy",
    party: "eagles",
  });

  const selectedBackground = BACKGROUNDS.find((background) => background.id === draft.background) || BACKGROUNDS[0];

  return (
    <Modal wide>
      <div className="grid gap-0 lg:grid-cols-[0.95fr_1.25fr]">
        <div className="border-b border-slate-800 bg-slate-900 p-6 lg:border-b-0 lg:border-r">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-slate-600 bg-white text-3xl">
              {draft.avatar}
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-red-200">Veridia Election Desk</p>
              <h1 className="text-3xl font-black tracking-normal text-white">Campaign HQ</h1>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">Candidate Name</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className="mt-2 w-full rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-white outline-none transition focus:border-blue-400"
                maxLength={28}
              />
            </label>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Portrait</p>
              <div className="mt-2 grid grid-cols-6 gap-2">
                {AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setDraft({ ...draft, avatar })}
                    className={`rounded-md border p-2 text-2xl transition ${draft.avatar === avatar ? "border-blue-400 bg-blue-900/60" : "border-slate-700 bg-slate-950 hover:border-slate-400"}`}
                  >
                    {avatar}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Party</p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {Object.values(PARTIES).map((party) => (
                  <button
                    key={party.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, party: party.id })}
                    className={`rounded-md border px-3 py-3 text-left transition ${draft.party === party.id ? "border-white bg-white text-slate-950" : "border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-400"}`}
                  >
                    <span className="block text-sm font-bold">{party.label}</span>
                    <span className="text-xs opacity-75">{party.id === "eagles" ? "Business-leaning establishment" : "Labor-leaning populists"}</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStart(draft)}
              disabled={!draft.name.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-3 font-bold text-white shadow-lg transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-700"
            >
              <Vote className="h-5 w-5" />
              Open Campaign
            </button>
          </div>
        </div>

        <div className="p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Background</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {BACKGROUNDS.map((background) => (
                <button
                  key={background.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, background: background.id })}
                  className={`rounded-lg border p-3 text-left transition ${draft.background === background.id ? "border-blue-400 bg-blue-950" : "border-slate-700 bg-slate-900 hover:border-slate-400"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-white">{background.label}</span>
                    <span className="rounded-md bg-slate-800 px-2 py-1 text-xs text-slate-200">{background.effectsText}</span>
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{background.blurb}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Signature Issue</p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
              {ISSUES.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => setDraft({ ...draft, issue })}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${draft.issue === issue ? "border-red-300 bg-red-900/70 text-white" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-400"}`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-700 bg-slate-900 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Opening Profile</p>
                <h2 className="mt-1 text-xl font-black text-white">
                  {draft.avatar} {draft.name || "Unnamed Candidate"}
                </h2>
                <p className="mt-1 text-sm text-slate-300">
                  {selectedBackground.label} for the {PARTIES[draft.party].label}. Signature issue: {draft.issue}.
                </p>
              </div>
              <div className="rounded-md border border-slate-600 bg-slate-950 px-3 py-2 text-right">
                <p className="text-xs text-slate-400">Opponent</p>
                <p className="font-bold text-white">{PARTIES[draft.party].opponentName}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-3">
              <div className="rounded-md bg-slate-950 p-3">Issue ads boost {ISSUE_DEMO_BONUS[draft.issue].map(demoLabel).join(" and ")}.</div>
              <div className="rounded-md bg-slate-950 p-3">Background changes your starting money, stats, and coalition.</div>
              <div className="rounded-md bg-slate-950 p-3">Twelve weeks. Three action points to start. One election.</div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function DonorModal({ state, dispatch }) {
  const offer = state.offers.find((item) => item.id === state.reviewingDonorId);
  if (!offer) return null;

  return (
    <Modal onClose={() => dispatch({ type: "CLOSE_MODAL" })}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-amber-300">Donation Review</p>
            <h2 className="mt-1 text-2xl font-black text-white">{offer.name}</h2>
            <p className="mt-2 text-slate-300">{offer.description}</p>
          </div>
          <div className="rounded-lg border border-amber-600 bg-amber-950 px-4 py-3 text-right">
            <p className="text-xs uppercase tracking-wide text-amber-200">Check</p>
            <p className="text-2xl font-black text-white">{formatMoney(offer.amount)}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">Strings</p>
            <p className="mt-2 text-sm text-slate-200">{offer.strings}</p>
          </div>
          <div className="rounded-lg border border-red-700 bg-red-950/50 p-3">
            <p className="text-xs uppercase tracking-wide text-red-200">Risk</p>
            <p className="mt-2 text-sm text-slate-200">+{offer.risk} Scandal now, +{offer.ongoing} weekly leak pressure</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-3">
            <p className="text-xs uppercase tracking-wide text-slate-400">If Leaked</p>
            <p className="mt-2 text-sm text-slate-200">{summarizeDeltas(offer.leakEffect) || "Mostly awkward silence"}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-2 md:grid-cols-3">
          <button
            type="button"
            onClick={() => dispatch({ type: "DONOR_DECISION", decision: "accept", offerId: offer.id })}
            className="flex items-center justify-center gap-2 rounded-md bg-amber-600 px-4 py-3 font-bold text-slate-950 transition hover:bg-amber-500"
          >
            <BadgeDollarSign className="h-5 w-5" />
            Accept
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "DONOR_DECISION", decision: "decline", offerId: offer.id })}
            className="flex items-center justify-center gap-2 rounded-md border border-emerald-600 bg-emerald-950 px-4 py-3 font-bold text-emerald-100 transition hover:bg-emerald-900"
          >
            <ShieldCheck className="h-5 w-5" />
            Decline
          </button>
          <button
            type="button"
            onClick={() => dispatch({ type: "DONOR_DECISION", decision: "negotiate", offerId: offer.id })}
            disabled={offer.negotiated || state.ap <= 0}
            className="flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-950 px-4 py-3 font-bold text-blue-100 transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:border-slate-700 disabled:bg-slate-800 disabled:text-slate-500"
          >
            <Handshake className="h-5 w-5" />
            Negotiate
          </button>
        </div>
      </div>
    </Modal>
  );
}

function AdCreatorModal({ state, dispatch }) {
  const [draft, setDraft] = useState({
    format: "social",
    tone: "positive",
    topic: state.profile?.issue || "Economy",
  });
  const plan = useMemo(() => buildAdPlan(state, draft), [state, draft]);
  const projected = {
    approval: plan.perWeek.approval * 2,
    nameRec: plan.perWeek.nameRec * 2,
    integrity: plan.perWeek.integrity,
    scandal: plan.perWeek.scandal,
    demos: Object.fromEntries(Object.entries(plan.perWeek.demos).map(([key, value]) => [key, value * 2])),
  };

  return (
    <Modal wide onClose={() => dispatch({ type: "CLOSE_MODAL" })}>
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border-b border-slate-800 p-6 lg:border-b-0 lg:border-r">
          <p className="text-xs uppercase tracking-widest text-blue-200">Propaganda Creator</p>
          <h2 className="mt-1 text-2xl font-black text-white">Produce an Ad</h2>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Format</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {Object.values(AD_FORMATS).map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => setDraft({ ...draft, format: format.id })}
                    className={`rounded-lg border p-3 text-left transition ${draft.format === format.id ? "border-blue-400 bg-blue-950" : "border-slate-700 bg-slate-900 hover:border-slate-400"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 font-bold text-white">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </span>
                      <span className="text-sm text-slate-300">{formatMoney(format.cost)}</span>
                    </div>
                    <p className="mt-2 text-sm text-slate-300">{format.copy}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Tone</p>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              {Object.values(AD_TONES).map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => setDraft({ ...draft, tone: tone.id })}
                  className={`rounded-lg border p-3 text-left transition ${draft.tone === tone.id ? "border-red-300 bg-red-950" : "border-slate-700 bg-slate-900 hover:border-slate-400"}`}
                >
                  <span className="font-bold text-white">{tone.label}</span>
                  <p className="mt-2 text-sm text-slate-300">{tone.copy}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-300">Topic</p>
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-5">
              {ISSUES.map((issue) => (
                <button
                  key={issue}
                  type="button"
                  onClick={() => setDraft({ ...draft, topic: issue })}
                  className={`rounded-md border px-3 py-2 text-sm font-semibold transition ${draft.topic === issue ? "border-white bg-white text-slate-950" : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-400"}`}
                >
                  {issue}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-slate-900 p-6">
          <p className="text-xs uppercase tracking-widest text-slate-400">Headline Preview</p>
          <div className="mt-3 rounded-lg border border-slate-600 bg-white p-4 text-slate-950 shadow">
            <p className="text-xs font-black uppercase tracking-widest text-red-700">The Veridia Clarion</p>
            <h3 className="mt-2 text-2xl font-black leading-tight">{plan.headline}</h3>
          </div>

          <div className="mt-5 rounded-lg border border-slate-700 bg-slate-950 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Projected Two-Week Effect</p>
            <div className="mt-3 space-y-2 text-sm text-slate-200">
              <div className="flex justify-between"><span>Cost</span><strong>{formatMoney(plan.cost)}</strong></div>
              <div className="flex justify-between"><span>Approval</span><strong>{projected.approval > 0 ? "+" : ""}{projected.approval.toFixed(1)}</strong></div>
              <div className="flex justify-between"><span>Name Rec</span><strong>{projected.nameRec > 0 ? "+" : ""}{projected.nameRec.toFixed(1)}</strong></div>
              <div className="flex justify-between"><span>Integrity</span><strong>{projected.integrity > 0 ? "+" : ""}{projected.integrity.toFixed(1)}</strong></div>
              <div className="flex justify-between"><span>Scandal</span><strong>{projected.scandal > 0 ? "+" : ""}{projected.scandal.toFixed(1)}</strong></div>
              <div className="rounded-md bg-slate-900 p-3 text-slate-300">{summarizeDeltas(projected.demos) || "Broad mood shift"}</div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dispatch({ type: "CONFIRM_AD", draft })}
            disabled={state.ap <= 0 || !canSpend(state, plan.cost)}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-slate-700"
          >
            <Megaphone className="h-5 w-5" />
            Produce Ad
          </button>
        </div>
      </div>
    </Modal>
  );
}

function DebateModal({ dispatch }) {
  const choices = [
    { id: "aggressive", label: "Aggressive", icon: Target, copy: "Best with high name recognition or a flexible relationship with dignity." },
    { id: "statesman", label: "Statesman", icon: ShieldCheck, copy: "Best with high integrity and steady approval." },
    { id: "wonky", label: "Wonky", icon: BarChart3, copy: "Best when your signature issue can carry a room full of charts." },
  ];

  return (
    <Modal>
      <div className="p-6">
        <p className="text-xs uppercase tracking-widest text-red-200">Live From Veridia Civic Hall</p>
        <h2 className="mt-1 text-3xl font-black text-white">Debate Night</h2>
        <p className="mt-2 text-slate-300">The moderator smiles like someone who has already read the closing statements.</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {choices.map((choice) => {
            const Icon = choice.icon;
            return (
              <button
                key={choice.id}
                type="button"
                onClick={() => dispatch({ type: "RESOLVE_DEBATE", choice: choice.id })}
                className="rounded-lg border border-slate-700 bg-slate-900 p-4 text-left transition hover:border-blue-400 hover:bg-blue-950"
              >
                <Icon className="h-6 w-6 text-blue-200" />
                <h3 className="mt-3 font-black text-white">{choice.label}</h3>
                <p className="mt-2 text-sm text-slate-300">{choice.copy}</p>
              </button>
            );
          })}
        </div>
      </div>
    </Modal>
  );
}

function SummaryModal({ state, dispatch }) {
  const summary = state.lastSummary;
  if (!summary) return null;
  const movement = summary.endPoll - summary.startPoll;

  return (
    <Modal>
      <div className="p-6">
        <p className="text-xs uppercase tracking-widest text-blue-200">Week {summary.week} Dispatch</p>
        <h2 className="mt-1 text-3xl font-black text-white">The Numbers Move</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Poll Shift</p>
            <p className={`mt-1 text-2xl font-black ${movement >= 0 ? "text-emerald-300" : "text-red-300"}`}>
              {movement >= 0 ? "+" : ""}{movement.toFixed(1)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Latest Poll</p>
            <p className="mt-1 text-2xl font-black text-white">{summary.endPoll.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900 p-4">
            <p className="text-xs uppercase tracking-wide text-slate-400">Bank</p>
            <p className={`mt-1 text-2xl font-black ${summary.money >= 0 ? "text-white" : "text-red-300"}`}>{formatMoney(summary.money)}</p>
          </div>
        </div>

        <div className="mt-5 space-y-2">
          {summary.items.map((item, index) => (
            <div key={`${item.label}-${index}`} className="rounded-lg border border-slate-700 bg-slate-900 p-3">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-1 text-sm text-slate-200">{item.text}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "CLOSE_MODAL" })}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-3 font-bold text-white transition hover:bg-blue-600"
        >
          Begin Week {state.week}
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </Modal>
  );
}

function EndModal({ state, dispatch }) {
  const result = state.result;
  if (!result) return null;
  const finalPoll = result.finalPoll;

  return (
    <Modal>
      <div className="p-6 text-center">
        <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-lg border ${result.won ? "border-amber-400 bg-amber-950 text-amber-200" : "border-red-500 bg-red-950 text-red-200"}`}>
          {result.won ? <Trophy className="h-9 w-9" /> : <FileWarning className="h-9 w-9" />}
        </div>
        <p className="mt-5 text-xs uppercase tracking-widest text-slate-400">Election Day</p>
        <h2 className="mt-1 text-3xl font-black text-white">{result.title}</h2>
        <p className="mx-auto mt-3 max-w-lg text-slate-300">{result.detail}</p>

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-700 bg-blue-950 p-5">
            <p className="text-xs uppercase tracking-wide text-blue-200">{state.profile?.name}</p>
            <p className="mt-1 text-4xl font-black text-white">{finalPoll.toFixed(1)}%</p>
          </div>
          <div className="rounded-lg border border-red-700 bg-red-950 p-5">
            <p className="text-xs uppercase tracking-wide text-red-200">{state.opponent?.name}</p>
            <p className="mt-1 text-4xl font-black text-white">{(100 - finalPoll).toFixed(1)}%</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "RESET" })}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-3 font-black text-slate-950 transition hover:bg-slate-200"
        >
          <RotateCcw className="h-5 w-5" />
          Restart Campaign
        </button>
      </div>
    </Modal>
  );
}

function ActionPanel({ state, dispatch }) {
  const [target, setTarget] = useState("suburban");
  const actionDisabled = state.phase !== "playing" || state.modal || state.ap <= 0;

  const actions = [
    {
      id: "rally",
      title: "Hold a Rally",
      cost: "$5K",
      icon: Users,
      detail: "+Name Rec in chosen bloc",
      onClick: () => dispatch({ type: "ACTION", kind: "rally", target }),
    },
    {
      id: "ground",
      title: "Ground Game",
      cost: "$10K",
      icon: Vote,
      detail: "+Approval across blocs",
      onClick: () => dispatch({ type: "ACTION", kind: "ground" }),
    },
    {
      id: "hire",
      title: "Hire Staff",
      cost: "$15K",
      icon: UserPlus,
      detail: "+1 AP/week, cap 6",
      onClick: () => dispatch({ type: "ACTION", kind: "hire" }),
      disabled: state.apMax >= 6,
    },
    {
      id: "research",
      title: "Opposition Research",
      cost: "$8K",
      icon: Search,
      detail: "50% chance to find dirt",
      onClick: () => dispatch({ type: "ACTION", kind: "research" }),
    },
    {
      id: "polling",
      title: "Internal Polling",
      cost: "$3K",
      icon: BarChart3,
      detail: "Exact demos + forecast",
      onClick: () => dispatch({ type: "ACTION", kind: "polling" }),
    },
    {
      id: "ad",
      title: "Produce Ad",
      cost: "Varies",
      icon: Megaphone,
      detail: "Format, tone, topic",
      onClick: () => dispatch({ type: "OPEN_AD" }),
    },
  ];

  return (
    <aside className="flex min-h-0 flex-col border-r border-slate-800 bg-slate-950/90 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Action Points</p>
          <p className="text-3xl font-black text-white">{state.ap}<span className="text-lg text-slate-500">/{state.apMax}</span></p>
        </div>
        <div className="rounded-lg border border-blue-700 bg-blue-950 p-3 text-blue-100">
          <CalendarDays className="h-6 w-6" />
        </div>
      </div>

      <label className="mt-4 block">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rally Bloc</span>
        <select
          value={target}
          onChange={(event) => setTarget(event.target.value)}
          className="mt-2 w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-blue-400"
        >
          {DEMOS.map((demo) => (
            <option key={demo.key} value={demo.key}>{demo.label}</option>
          ))}
        </select>
      </label>

      <div className="mt-4 space-y-2 overflow-y-auto pr-1">
        {actions.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={item.onClick}
              disabled={actionDisabled || item.disabled}
              className="w-full rounded-lg border border-slate-800 bg-slate-900 p-3 text-left transition hover:border-blue-500 hover:bg-blue-950 disabled:cursor-not-allowed disabled:border-slate-800 disabled:bg-slate-900/50 disabled:text-slate-600"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2 font-bold text-white">
                  <Icon className="h-4 w-4 text-blue-200" />
                  {item.title}
                </span>
                <span className="text-xs font-bold text-slate-400">{item.cost}</span>
              </div>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </button>
          );
        })}
      </div>

      {state.dirtFiles > 0 ? (
        <button
          type="button"
          onClick={() => dispatch({ type: "RELEASE_DIRT" })}
          disabled={state.modal || state.phase !== "playing"}
          className="mt-3 flex items-center justify-center gap-2 rounded-md border border-red-500 bg-red-950 px-3 py-2 text-sm font-bold text-red-100 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FileWarning className="h-4 w-4" />
          Release Dirt ({state.dirtFiles})
        </button>
      ) : null}

      <button
        type="button"
        onClick={() => dispatch({ type: "END_WEEK" })}
        disabled={state.phase !== "playing" || Boolean(state.modal)}
        className="mt-4 flex items-center justify-center gap-2 rounded-md bg-red-700 px-4 py-3 font-black text-white shadow transition hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-slate-700"
      >
        End Week
        <ChevronRight className="h-5 w-5" />
      </button>
    </aside>
  );
}

function PollingDashboard({ state, currentPoll }) {
  const hasIntel = state.pollIntelWeeks > 0;
  const projectedPoll = clamp(
    currentPoll
      + state.activeAds.reduce((sum, ad) => sum + average(Object.values(ad.perWeek.demos || {})) * 0.17, 0)
      - 1.4
      + (state.scandal > 60 ? -1.2 : 0),
    18,
    82,
  );

  return (
    <section className="min-h-0 overflow-y-auto bg-slate-100 p-4 text-slate-950">
      <div className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-red-700">Latest Poll</p>
              <h2 className="text-2xl font-black">{state.profile?.name || "Candidate"} vs {state.opponent?.name || "Opponent"}</h2>
            </div>
            <div className="flex gap-2">
              <div className="rounded-md bg-blue-800 px-3 py-2 text-center text-white">
                <p className="text-xs uppercase opacity-80">You</p>
                <p className="text-xl font-black">{currentPoll.toFixed(1)}%</p>
              </div>
              <div className="rounded-md bg-red-800 px-3 py-2 text-center text-white">
                <p className="text-xs uppercase opacity-80">Opponent</p>
                <p className="text-xl font-black">{(100 - currentPoll).toFixed(1)}%</p>
              </div>
            </div>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={state.pollHistory} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="label" stroke="#475569" tickLine={false} />
                <YAxis domain={[30, 70]} stroke="#475569" tickLine={false} tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Legend />
                <Line type="monotone" dataKey="player" name={state.profile?.name || "You"} stroke="#1d4ed8" strokeWidth={3} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="opponent" name={state.opponent?.name || "Opponent"} stroke="#b91c1c" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-800">Voter Blocs</p>
              <h2 className="text-xl font-black">{hasIntel ? "Internal Numbers" : "Public Estimates"}</h2>
            </div>
            {hasIntel ? (
              <div className="rounded-md bg-blue-100 px-3 py-2 text-xs font-bold text-blue-900">Forecast {projectedPoll.toFixed(1)}%</div>
            ) : (
              <div className="rounded-md bg-slate-100 px-3 py-2 text-xs font-bold text-slate-600">Commission polling</div>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {DEMOS.map((demo) => (
              <div key={demo.key}>
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-bold">{demo.label}</span>
                  <span className="font-mono text-slate-600">{publicPollValue(state.demos[demo.key], hasIntel)}</span>
                </div>
                <div className="mt-1 h-3 overflow-hidden rounded-md bg-slate-200">
                  <div
                    className="h-full rounded-md bg-blue-700 transition-all duration-500"
                    style={{ width: `${state.demos[demo.key]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-slate-300 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">News Feed</p>
            <h2 className="text-xl font-black">Campaign Desk</h2>
          </div>
          <Newspaper className="h-6 w-6 text-slate-500" />
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {state.news.slice(0, 10).map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className={`rounded-md px-2 py-1 text-xs font-black uppercase ${item.tone === "good" ? "bg-emerald-100 text-emerald-800" : item.tone === "bad" ? "bg-red-100 text-red-800" : "bg-slate-200 text-slate-700"}`}>
                  {item.tag}
                </span>
                <span className="text-xs font-bold text-slate-400">W{item.week}</span>
              </div>
              <p className="mt-2 text-sm font-medium leading-snug text-slate-800">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RightPanel({ state, dispatch }) {
  return (
    <aside className="min-h-0 overflow-y-auto border-l border-slate-800 bg-slate-950/95 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Donor Inbox</p>
          <h2 className="text-xl font-black text-white">{state.offers.length} Offers</h2>
        </div>
        <Handshake className="h-6 w-6 text-amber-300" />
      </div>
      <div className="mt-3 space-y-2">
        {state.offers.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">The inbox is quiet. This is either virtuous or concerning.</div>
        ) : (
          state.offers.map((offer) => (
            <div key={offer.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-white">{offer.name}</h3>
                  <p className="mt-1 text-xs text-slate-400">{offer.description}</p>
                </div>
                <span className="rounded-md bg-amber-400 px-2 py-1 text-xs font-black text-slate-950">{formatMoney(offer.amount)}</span>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className={`rounded-md px-2 py-1 text-xs font-bold ${offer.risk >= 14 ? "bg-red-900 text-red-100" : offer.risk >= 8 ? "bg-amber-900 text-amber-100" : "bg-slate-800 text-slate-200"}`}>
                  Risk +{offer.risk}
                </span>
                <button
                  type="button"
                  onClick={() => dispatch({ type: "REVIEW_DONOR", offerId: offer.id })}
                  disabled={Boolean(state.modal)}
                  className="rounded-md bg-white px-3 py-1.5 text-xs font-black text-slate-950 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
                >
                  Review
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Active Ads</p>
          <h2 className="text-xl font-black text-white">{state.activeAds.length} Running</h2>
        </div>
        <Megaphone className="h-6 w-6 text-blue-300" />
      </div>
      <div className="mt-3 space-y-2">
        {state.activeAds.length === 0 ? (
          <div className="rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-400">No paid media is running. Consultants are pacing.</div>
        ) : (
          state.activeAds.map((ad) => (
            <div key={ad.id} className="rounded-lg border border-slate-800 bg-slate-900 p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-black uppercase tracking-wide text-blue-200">{AD_FORMATS[ad.format].label} · {AD_TONES[ad.tone].label}</span>
                <span className="rounded-md bg-blue-900 px-2 py-1 text-xs font-bold text-blue-100">{ad.remaining}w</span>
              </div>
              <p className="mt-2 text-sm font-semibold leading-snug text-white">{ad.headline}</p>
              <p className="mt-2 text-xs text-slate-400">{ad.topic}</p>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 rounded-lg border border-slate-800 bg-slate-900 p-3">
        <p className="text-xs uppercase tracking-widest text-slate-400">Liabilities</p>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-2 text-slate-300">
            <span>Accepted shady donors</span>
            <strong className="text-white">{state.acceptedDonations.length}</strong>
          </div>
          <div className="flex justify-between gap-2 text-slate-300">
            <span>Negative weeks</span>
            <strong className={state.negativeWeeks > 0 ? "text-red-300" : "text-white"}>{state.negativeWeeks}/2</strong>
          </div>
          <div className="flex justify-between gap-2 text-slate-300">
            <span>Dirt files</span>
            <strong className="text-white">{state.dirtFiles}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ state, currentPoll }) {
  const days = Math.max(0, (13 - state.week) * 7);
  const scandalTone = state.scandal >= 70 ? "red" : state.scandal >= 35 ? "amber" : "green";
  const integrityTone = state.integrity < 35 ? "red" : state.integrity < 60 ? "amber" : "green";

  return (
    <header className="border-b border-slate-800 bg-slate-950 p-3">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-8">
        <div className="rounded-lg border border-slate-700 bg-white p-2 text-slate-950 md:col-span-3 xl:col-span-2">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-slate-950 text-2xl">
              {state.profile?.avatar || "🎙️"}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black">{state.profile?.name || "Candidate"}</p>
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-500">
                {state.profile?.partyLabel || "Party"} · {state.profile?.backgroundLabel || "Background"}
              </p>
            </div>
          </div>
        </div>
        <StatPill icon={CalendarDays} label="Week" value={`${state.week}/12`} sub={`${days} days`} tone="slate" />
        <StatPill icon={WalletCards} label="Money" value={formatMoney(state.money)} tone={state.money < 0 ? "red" : "green"} />
        <StatPill icon={HeartPulse} label="Approval" value={`${Math.round(state.approval)}%`} tone={state.approval >= 50 ? "green" : state.approval < 32 ? "red" : "amber"} />
        <StatPill icon={Megaphone} label="Name Rec" value={`${Math.round(state.nameRec)}%`} tone={state.nameRec >= 55 ? "green" : "blue"} />
        <StatPill icon={ShieldCheck} label="Integrity" value={`${Math.round(state.integrity)}%`} tone={integrityTone} />
        <StatPill icon={Siren} label="Scandal" value={`${Math.round(state.scandal)}%`} sub={`Poll ${currentPoll.toFixed(1)}%`} tone={scandalTone} />
      </div>
    </header>
  );
}

function ShellBackdrop() {
  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-lg border border-slate-800 bg-slate-900 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-2xl">🗳️</div>
          <div>
            <p className="text-xs uppercase tracking-widest text-red-200">Veridia Election Desk</p>
            <h1 className="text-3xl font-black text-white">Campaign HQ</h1>
          </div>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="h-44 rounded-lg border border-slate-800 bg-slate-950" />
          <div className="h-44 rounded-lg border border-slate-800 bg-slate-950" />
          <div className="h-44 rounded-lg border border-slate-800 bg-slate-950" />
        </div>
      </div>
    </div>
  );
}

export default function VeridiaCampaign() {
  const [state, dispatch] = useReducer(reducer, undefined, getStartingStateShell);
  const currentPoll = useMemo(() => (state.phase === "setup" ? 45 : calculatePoll(state)), [state]);

  if (state.phase === "setup") {
    return (
      <>
        <ShellBackdrop />
        <CreationModal onStart={(profile) => dispatch({ type: "START", profile })} />
      </>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-100">
      <TopBar state={state} currentPoll={currentPoll} />
      <main className="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)_320px]">
        <ActionPanel state={state} dispatch={dispatch} />
        <PollingDashboard state={state} currentPoll={currentPoll} />
        <RightPanel state={state} dispatch={dispatch} />
      </main>

      {state.modal === "donor" ? <DonorModal state={state} dispatch={dispatch} /> : null}
      {state.modal === "ad" ? <AdCreatorModal state={state} dispatch={dispatch} /> : null}
      {state.modal === "debate" ? <DebateModal dispatch={dispatch} /> : null}
      {state.modal === "summary" ? <SummaryModal state={state} dispatch={dispatch} /> : null}
      {state.modal === "election" ? <EndModal state={state} dispatch={dispatch} /> : null}
    </div>
  );
}
