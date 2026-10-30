import type { AIMessage, KnowledgeGraph, ResearchEvent } from "@/types";

export const ROME_GRAPH: KnowledgeGraph = {
  nodes: [
    {
      id: "fall_of_west",
      label: "Fall of the Western Empire",
      type: "event",
      description:
        "The collapse of Roman rule in the West, traditionally dated to 476 AD.",
      confidence: 0.97,
      sourceIds: ["src_britannica_rome", "src_heather"],
    },
    {
      id: "political_instability",
      label: "Political instability",
      type: "concept",
      description:
        "Frequent civil wars and assassinations — dozens of emperors in the 3rd century alone.",
      confidence: 0.9,
      sourceIds: ["src_gibbon", "src_britannica_rome"],
    },
    {
      id: "economic_crisis",
      label: "Economic crisis",
      type: "concept",
      description:
        "Heavy taxes, coin debasement and inflation drained the state's ability to pay its army.",
      confidence: 0.86,
      sourceIds: ["src_rome_notes", "src_britannica_rome"],
    },
    {
      id: "barbarian_invasions",
      label: "Barbarian invasions",
      type: "event",
      description:
        "Goths, Vandals and Huns pushed across the frontiers throughout the 4th and 5th centuries.",
      confidence: 0.93,
      sourceIds: ["src_heather"],
    },
    {
      id: "sack_of_rome",
      label: "Sack of Rome (410)",
      type: "event",
      description:
        "The Visigoths under Alaric captured and looted Rome — a huge psychological blow.",
      confidence: 0.95,
      sourceIds: ["src_heather", "src_britannica_rome"],
    },
    {
      id: "plague_climate",
      label: "Plague & climate change",
      type: "event",
      description:
        "Epidemics and a cooling climate reduced population, harvests and tax income.",
      confidence: 0.74,
      sourceIds: ["src_harper"],
    },
    {
      id: "empire_split",
      label: "Division of the empire",
      type: "event",
      description:
        "From 395 the empire was ruled as separate Eastern and Western halves.",
      confidence: 0.92,
      sourceIds: ["src_britannica_rome"],
    },
    {
      id: "byzantine_empire",
      label: "Eastern Roman Empire",
      type: "organization",
      description:
        "The richer eastern half, later called the Byzantine Empire, which survived until 1453.",
      confidence: 0.95,
      sourceIds: ["src_britannica_rome"],
    },
    {
      id: "odoacer",
      label: "Odoacer",
      type: "person",
      description:
        "Germanic general who deposed the last Western emperor, Romulus Augustulus, in 476.",
      confidence: 0.94,
      sourceIds: ["src_britannica_rome"],
    },
    {
      id: "edward_gibbon",
      label: "Edward Gibbon",
      type: "person",
      description:
        "18th-century historian whose six-volume history shaped how the fall is understood.",
      confidence: 0.96,
      sourceIds: ["src_gibbon"],
    },
    {
      id: "decline_from_within",
      label: "\"Rome fell from within\"",
      type: "claim",
      description:
        "Gibbon's view that internal decay mattered more than outside attacks. Many modern historians disagree.",
      confidence: 0.6,
      sourceIds: ["src_gibbon", "src_heather"],
    },
  ],
  edges: [
    {
      id: "e_instability_fall",
      source: "political_instability",
      target: "fall_of_west",
      relationship: "weakened",
      confidence: 0.88,
    },
    {
      id: "e_economy_fall",
      source: "economic_crisis",
      target: "fall_of_west",
      relationship: "weakened",
      confidence: 0.84,
    },
    {
      id: "e_invasions_fall",
      source: "barbarian_invasions",
      target: "fall_of_west",
      relationship: "directly caused",
      confidence: 0.9,
    },
    {
      id: "e_plague_economy",
      source: "plague_climate",
      target: "economic_crisis",
      relationship: "worsened",
      confidence: 0.72,
    },
    {
      id: "e_economy_invasions",
      source: "economic_crisis",
      target: "barbarian_invasions",
      relationship: "left Rome unable to resist",
      confidence: 0.7,
    },
    {
      id: "e_invasions_sack",
      source: "barbarian_invasions",
      target: "sack_of_rome",
      relationship: "led to",
      confidence: 0.93,
    },
    {
      id: "e_split_byzantine",
      source: "empire_split",
      target: "byzantine_empire",
      relationship: "created",
      confidence: 0.9,
    },
    {
      id: "e_split_fall",
      source: "empire_split",
      target: "fall_of_west",
      relationship: "left the West isolated",
      confidence: 0.75,
    },
    {
      id: "e_odoacer_fall",
      source: "odoacer",
      target: "fall_of_west",
      relationship: "ended",
      confidence: 0.94,
    },
    {
      id: "e_gibbon_claim",
      source: "edward_gibbon",
      target: "decline_from_within",
      relationship: "argued",
      confidence: 0.95,
    },
    {
      id: "e_claim_instability",
      source: "decline_from_within",
      target: "political_instability",
      relationship: "emphasises",
      confidence: 0.8,
    },
  ],
};

export const ROME_MESSAGES: AIMessage[] = [
  {
    id: "msg_rome_1",
    role: "user",
    content: "Why did the Roman Empire fall?",
  },
  {
    id: "msg_rome_2",
    role: "assistant",
    content:
      "There was no single cause. The Western Roman Empire was worn down over about two centuries: constant civil wars and short-lived emperors, an economy squeezed by taxes and a debased currency, and plague and climate shifts that shrank the population. Once the empire was split into East and West, the poorer Western half faced waves of invasions on its own. Rome was sacked in 410, and in 476 the general Odoacer removed the last Western emperor. The wealthier Eastern half carried on for nearly a thousand more years.",
    citations: [
      {
        sourceId: "src_heather",
        text: "Argues that pressure from the Goths and Huns struck an empire that was still functioning.",
      },
      {
        sourceId: "src_harper",
        text: "Links pandemics and a changing climate to Rome's shrinking population and finances.",
      },
      {
        sourceId: "src_britannica_rome",
        text: "Dates the end of the Western empire to 476, when Odoacer deposed Romulus Augustulus.",
      },
    ],
  },
  {
    id: "msg_rome_3",
    role: "user",
    content: "Did it fall from within, or was it pushed?",
  },
  {
    id: "msg_rome_4",
    role: "assistant",
    content:
      "Historians disagree. Edward Gibbon, writing in the 1700s, argued Rome decayed from within. Many modern historians, such as Peter Heather, argue the empire was still strong and was brought down mainly by outside pressure. Most now see the two as connected: internal weakness made the invasions far harder to survive.",
    citations: [
      {
        sourceId: "src_gibbon",
        text: "The decline of Rome was the natural and inevitable effect of immoderate greatness.",
      },
      {
        sourceId: "src_heather",
        text: "Argues the Western empire might have survived without the knock-on effects of the Huns' arrival.",
      },
    ],
  },
];

export const ROME_EVENTS: ResearchEvent[] = [
  {
    id: "evt_answer_generation",
    type: "answer_generation",
    status: "completed",
    message: "Generated answer",
  },
  {
    id: "evt_graph_generation",
    type: "graph_generation",
    status: "completed",
    message: "Mapped 11 concepts & 11 relationships",
  },
];
