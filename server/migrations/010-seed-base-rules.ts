#!/usr/bin/env tsx
/**
 * Migration: Seed Base Rules
 *
 * Inserts global base rules (isBase=true, worldId=null) into the database.
 * These rules are available to all worlds and represent universal simulation
 * logic: employment, social dynamics, business, life events, personality,
 * memory/cognition, economics, and professional occupations.
 *
 * Usage:
 *   npx tsx server/migrations/010-seed-base-rules.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/insimul';

interface BaseRule {
  name: string;
  description: string;
  content: string;
  sourceFormat: string;
  ruleType: string;
  category: string;
  priority: number;
  likelihood: number;
  tags: string[];
  isBase: true;
  worldId: null;
  isActive: true;
}

const BASE_RULES: Omit<BaseRule, 'isBase' | 'worldId' | 'isActive'>[] = [
  // ============= EMPLOYMENT =============
  {
    name: "succession_planning",
    description: "Family members succeed retiring business owners",
    content: `rule succession_planning {
  when (
    age(?owner, ?age) and ?age > 65 and
    owns_business(?owner, ?business) and
    has_child(?owner, ?child) and
    age(?child, ?childAge) and ?childAge > 25 and
    occupation_level(?child, 3)
  )
  then {
    hire(?business, ?child, "Owner", "day")
    retire(?owner)
    add_thought(?child, "Taking over the family business!", "proud")
    add_thought(?owner, "Passing the torch to the next generation", "nostalgic")
  }
  priority: 8
  likelihood: 0.7
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "employment",
    priority: 8,
    likelihood: 0.7,
    tags: ["business", "family", "succession"]
  },
  {
    name: "promote_loyal_employee",
    description: "Promote experienced workers to management",
    content: `rule promote_loyal_employee {
  when (
    has_occupation(?person, "Worker") and
    years_experience(?person, 5) and
    works_at(?person, ?business) and
    business_has_vacancy(?business, "Manager") and
    personality_trait(?person, "conscientiousness", 0.3)
  )
  then {
    promote(?person)
    add_thought(?person, "Hard work finally paid off!", "excited")
  }
  priority: 6
  likelihood: 0.4
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "employment",
    priority: 6,
    likelihood: 0.4,
    tags: ["career", "promotion", "loyalty"]
  },
  {
    name: "unemployment_job_search",
    description: "Unemployed characters look for work",
    content: `rule unemployment_job_search {
  when (
    is_unemployed(?person) and
    age(?person, ?age) and ?age >= 18 and ?age <= 65 and
    not(is_retired(?person)) and
    business_has_vacancy(?business, ?occupation)
  )
  then {
    hire(?business, ?person, ?occupation, "day")
    add_thought(?person, "Finally found a job!", "relieved")
  }
  priority: 5
  likelihood: 0.2
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "employment",
    priority: 5,
    likelihood: 0.2,
    tags: ["employment", "job_search"]
  },

  // ============= SOCIAL =============
  {
    name: "workplace_romance",
    description: "Coworkers may develop romantic relationships",
    content: `rule workplace_romance {
  when (
    is_coworker(?person1, ?person2) and
    not(married(?person1)) and
    not(married(?person2)) and
    personalities_compatible(?person1, ?person2) and
    years_known(?person1, ?person2, 2)
  )
  then {
    trigger_marriage(?person1, ?person2)
    add_thought(?person1, "Found love at work", "happy")
    add_thought(?person2, "Found love at work", "happy")
  }
  priority: 4
  likelihood: 0.1
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "social",
    priority: 4,
    likelihood: 0.1,
    tags: ["romance", "workplace", "marriage"]
  },
  {
    name: "neighbor_friendship",
    description: "Neighbors become friends over time",
    content: `rule neighbor_friendship {
  when (
    are_neighbors(?person1, ?person2) and
    personality_trait(?person1, "extroversion", 0.2) and
    personality_trait(?person2, "agreeableness", 0.2) and
    not(are_friends(?person1, ?person2))
  )
  then {
    add_relationship(?person1, ?person2, "friend")
    update_belief(?person1, ?person2, {"trustworthy": true, "friendly": true})
    update_belief(?person2, ?person1, {"trustworthy": true, "friendly": true})
  }
  priority: 3
  likelihood: 0.3
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "social",
    priority: 3,
    likelihood: 0.3,
    tags: ["friendship", "neighbors", "social"]
  },
  {
    name: "extrovert_socializing",
    description: "Extroverts organize social events",
    content: `rule extrovert_socializing {
  when (
    personality_trait(?person, "extroversion", 0.6) and
    at_home(?person) and
    time_of_day("evening") and
    has_friends(?person)
  )
  then {
    organize_gathering(?person)
    invite_friends(?person)
    add_thought(?person, "Love having people over!", "happy")
  }
  priority: 3
  likelihood: 0.4
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "social",
    priority: 3,
    likelihood: 0.4,
    tags: ["social", "personality", "events"]
  },

  // ============= BUSINESS =============
  {
    name: "entrepreneurial_spirit",
    description: "Ambitious characters start businesses",
    content: `rule entrepreneurial_spirit {
  when (
    age(?person, ?age) and ?age >= 25 and ?age <= 45 and
    college_graduate(?person) and
    personality_trait(?person, "openness", 0.5) and
    personality_trait(?person, "conscientiousness", 0.5) and
    property_vacant(?lot) and
    has_savings(?person, 50000)
  )
  then {
    found_business(?person, "New Business", "Generic")
    purchase_property(?person, ?lot)
    add_thought(?person, "Taking the leap into entrepreneurship!", "excited")
  }
  priority: 6
  likelihood: 0.15
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "business",
    priority: 6,
    likelihood: 0.15,
    tags: ["business", "entrepreneurship", "ambition"]
  },
  {
    name: "business_expansion",
    description: "Successful businesses expand",
    content: `rule business_expansion {
  when (
    owns_business(?owner, ?business) and
    is_business_type(?business, "ApartmentComplex") and
    business_profitable(?business) and
    years_in_business(?business, 3)
  )
  then {
    expand_apartment_complex(?business)
    create_vacancy(?business, "HotelMaid", "day")
    add_thought(?owner, "Business is booming!", "proud")
  }
  priority: 5
  likelihood: 0.3
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "business",
    priority: 5,
    likelihood: 0.3,
    tags: ["business", "expansion", "real_estate"]
  },
  {
    name: "economic_hardship_closure",
    description: "Struggling businesses close",
    content: `rule economic_hardship_closure {
  when (
    owns_business(?owner, ?business) and
    business_losing_money(?business) and
    years_losing(?business, 2) and
    not(can_afford_losses(?owner))
  )
  then {
    close_business(?business, "economic_hardship")
    add_thought(?owner, "Had to close the business...", "sad")
  }
  priority: 7
  likelihood: 0.6
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "economics",
    priority: 7,
    likelihood: 0.6,
    tags: ["business", "economy", "closure"]
  },

  // ============= LIFE EVENTS =============
  {
    name: "retirement_decision",
    description: "Older workers decide to retire",
    content: `rule retirement_decision {
  when (
    age(?person, ?age) and ?age >= 65 and
    has_occupation(?person, ?occupation) and
    not(owns_business(?person)) and
    years_experience(?person, 20)
  )
  then {
    retire(?person)
    add_thought(?person, "Time to enjoy retirement", "content")
  }
  priority: 7
  likelihood: 0.5
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "life_events",
    priority: 7,
    likelihood: 0.5,
    tags: ["retirement", "life_event", "aging"]
  },
  {
    name: "starting_family",
    description: "Married couples have children",
    content: `rule starting_family {
  when (
    married(?person1, ?person2) and
    age(?person1, ?age1) and ?age1 >= 25 and ?age1 <= 35 and
    age(?person2, ?age2) and ?age2 >= 25 and ?age2 <= 35 and
    owns_property(?person1) and
    num_children(?person1, ?count) and ?count < 3
  )
  then {
    trigger_birth(?person1, ?person2)
    add_thought(?person1, "We're having a baby!", "excited")
    add_thought(?person2, "We're having a baby!", "excited")
  }
  priority: 6
  likelihood: 0.3
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "life_events",
    priority: 6,
    likelihood: 0.3,
    tags: ["family", "birth", "life_event"]
  },
  {
    name: "empty_nest_downsize",
    description: "Empty nesters move to smaller homes",
    content: `rule empty_nest_downsize {
  when (
    age(?person, ?age) and ?age > 55 and
    owns_property(?person) and
    lives_at(?person, ?largeHome) and
    all_children_moved_out(?person) and
    property_available(?smallerHome) and
    smaller_than(?smallerHome, ?largeHome)
  )
  then {
    purchase_home(?person, ?smallerHome)
    move_to(?person, ?smallerHome)
    add_thought(?person, "Time to downsize", "nostalgic")
  }
  priority: 4
  likelihood: 0.2
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "life_events",
    priority: 4,
    likelihood: 0.2,
    tags: ["real_estate", "aging", "downsizing"]
  },

  // ============= PERSONALITY =============
  {
    name: "conscientious_work_ethic",
    description: "Conscientious workers take on extra responsibilities",
    content: `rule conscientious_work_ethic {
  when (
    personality_trait(?person, "conscientiousness", 0.7) and
    at_work(?person) and
    works_at(?person, ?business) and
    business_has_vacancy(?business, ?supplemental)
  )
  then {
    take_supplemental_job(?person, ?business, ?supplemental)
    add_thought(?person, "I can handle the extra responsibility", "determined")
  }
  priority: 4
  likelihood: 0.3
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "personality",
    priority: 4,
    likelihood: 0.3,
    tags: ["work", "personality", "ambition"]
  },

  // ============= MEMORY & COGNITION =============
  {
    name: "remembering_old_friends",
    description: "Characters reconnect with old friends",
    content: `rule remembering_old_friends {
  when (
    remembers(?person1, ?person2) and
    not(is_coworker(?person1, ?person2)) and
    not(are_neighbors(?person1, ?person2)) and
    years_since_interaction(?person1, ?person2, 5) and
    has_thought_about(?person1, ?person2)
  )
  then {
    reconnect(?person1, ?person2)
    update_belief(?person1, ?person2, {"nostalgic": true})
    add_thought(?person1, "Should catch up with old friends", "nostalgic")
  }
  priority: 2
  likelihood: 0.1
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "cognition",
    priority: 2,
    likelihood: 0.1,
    tags: ["memory", "friendship", "reconnection"]
  },

  // ============= PROFESSIONAL OCCUPATIONS =============
  {
    name: "doctor_delivers_baby",
    description: "Doctors deliver babies for pregnant women",
    content: `rule doctor_delivers_baby {
  when (
    has_occupation(?doctor, "Doctor") and
    at_work(?doctor) and
    pregnant(?mother) and
    due_date(?mother)
  )
  then {
    doctor_deliver_baby(?doctor, ?mother)
    add_thought(?doctor, "Delivered another baby today", "satisfied")
    add_thought(?mother, "My baby is here!", "joyful")
  }
  priority: 9
  likelihood: 1.0
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "profession",
    priority: 9,
    likelihood: 1.0,
    tags: ["medical", "birth", "profession"]
  },
  {
    name: "lawyer_handles_divorce",
    description: "Lawyers handle divorce proceedings",
    content: `rule lawyer_handles_divorce {
  when (
    has_occupation(?lawyer, "Lawyer") and
    at_work(?lawyer) and
    want_divorce(?person1, ?person2) and
    married(?person1, ?person2)
  )
  then {
    lawyer_file_divorce(?lawyer, ?person1, ?person2)
    add_thought(?lawyer, "Another divorce case", "professional")
  }
  priority: 8
  likelihood: 1.0
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "profession",
    priority: 8,
    likelihood: 1.0,
    tags: ["legal", "divorce", "profession"]
  },

  // ============= GOVERNANCE & LAW =============
  {
    name: "crime_punishment",
    description: "Characters caught committing crimes face consequences",
    content: `rule crime_punishment {
  when (
    committed_crime(?person, ?crime) and
    witnessed_by(?crime, ?witness) and
    has_occupation(?officer, "Police") and
    same_location(?officer, ?person)
  )
  then {
    arrest(?officer, ?person)
    add_thought(?person, "I've been caught...", "fearful")
    add_thought(?officer, "Justice is served", "satisfied")
    update_reputation(?person, -20)
  }
  priority: 9
  likelihood: 0.8
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "governance",
    priority: 9,
    likelihood: 0.8,
    tags: ["crime", "law", "punishment"]
  },
  {
    name: "election_cycle",
    description: "Settlements hold elections for leadership positions",
    content: `rule election_cycle {
  when (
    settlement(?settlement) and
    time_since_election(?settlement, ?years) and ?years >= 4 and
    population(?settlement, ?pop) and ?pop >= 50 and
    has_candidates(?settlement)
  )
  then {
    hold_election(?settlement)
    add_event(?settlement, "election", "The people have spoken")
  }
  priority: 7
  likelihood: 1.0
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "governance",
    priority: 7,
    likelihood: 1.0,
    tags: ["politics", "election", "governance"]
  },

  // ============= TRADE & COMMERCE =============
  {
    name: "merchant_trade_route",
    description: "Merchants establish trade routes between settlements",
    content: `rule merchant_trade_route {
  when (
    has_occupation(?merchant, "Merchant") and
    lives_in(?merchant, ?settlement1) and
    settlement(?settlement2) and
    ?settlement1 \\= ?settlement2 and
    has_surplus(?settlement1, ?good) and
    has_demand(?settlement2, ?good) and
    not(trade_route(?settlement1, ?settlement2, ?good))
  )
  then {
    establish_trade_route(?merchant, ?settlement1, ?settlement2, ?good)
    add_thought(?merchant, "New trade opportunity!", "excited")
    update_prosperity(?settlement1, 5)
    update_prosperity(?settlement2, 5)
  }
  priority: 6
  likelihood: 0.3
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "commerce",
    priority: 6,
    likelihood: 0.3,
    tags: ["trade", "merchant", "commerce", "economy"]
  },
  {
    name: "supply_demand_pricing",
    description: "Prices adjust based on supply and demand",
    content: `rule supply_demand_pricing {
  when (
    sells(?business, ?good) and
    local_supply(?good, ?supply) and
    local_demand(?good, ?demand) and
    ?demand > ?supply * 1.5
  )
  then {
    increase_price(?business, ?good, 10)
    add_thought(owner_of(?business), "Prices are going up", "opportunistic")
  }
  priority: 5
  likelihood: 0.6
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "commerce",
    priority: 5,
    likelihood: 0.6,
    tags: ["economics", "pricing", "supply_demand"]
  },

  // ============= EDUCATION & KNOWLEDGE =============
  {
    name: "apprenticeship",
    description: "Young characters learn trades from masters",
    content: `rule apprenticeship {
  when (
    age(?youth, ?age) and ?age >= 14 and ?age <= 20 and
    not(has_occupation(?youth, _)) and
    has_occupation(?master, ?trade) and
    years_experience(?master, 10) and
    same_settlement(?youth, ?master) and
    not(has_apprentice(?master))
  )
  then {
    start_apprenticeship(?youth, ?master, ?trade)
    add_thought(?youth, "Learning a valuable trade", "hopeful")
    add_thought(?master, "Teaching the next generation", "proud")
  }
  priority: 5
  likelihood: 0.25
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "education",
    priority: 5,
    likelihood: 0.25,
    tags: ["education", "apprenticeship", "trade"]
  },
  {
    name: "knowledge_sharing",
    description: "Characters share knowledge with friends and family",
    content: `rule knowledge_sharing {
  when (
    knows(?person1, ?knowledge) and
    are_friends(?person1, ?person2) and
    not(knows(?person2, ?knowledge)) and
    same_location(?person1, ?person2)
  )
  then {
    share_knowledge(?person1, ?person2, ?knowledge)
    add_thought(?person2, "Learned something new today", "curious")
    strengthen_relationship(?person1, ?person2, 2)
  }
  priority: 3
  likelihood: 0.2
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "education",
    priority: 3,
    likelihood: 0.2,
    tags: ["knowledge", "learning", "social"]
  },

  // ============= HEALTH & WELLBEING =============
  {
    name: "illness_spread",
    description: "Illness spreads between characters in close contact",
    content: `rule illness_spread {
  when (
    is_sick(?person1, ?illness) and
    same_location(?person1, ?person2) and
    not(is_sick(?person2, ?illness)) and
    not(immune_to(?person2, ?illness))
  )
  then {
    infect(?person2, ?illness)
    add_thought(?person2, "Not feeling well...", "worried")
  }
  priority: 7
  likelihood: 0.15
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "health",
    priority: 7,
    likelihood: 0.15,
    tags: ["health", "illness", "contagion"]
  },
  {
    name: "seek_medical_help",
    description: "Sick characters visit doctors",
    content: `rule seek_medical_help {
  when (
    is_sick(?person, ?illness) and
    severity(?illness, ?sev) and ?sev > 3 and
    has_occupation(?doctor, "Doctor") and
    at_work(?doctor)
  )
  then {
    visit_doctor(?person, ?doctor)
    treat_illness(?doctor, ?person, ?illness)
    add_thought(?person, "Need to see a doctor", "worried")
  }
  priority: 8
  likelihood: 0.7
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "health",
    priority: 8,
    likelihood: 0.7,
    tags: ["health", "medical", "treatment"]
  },

  // ============= CONFLICT & RESOLUTION =============
  {
    name: "rivalry_formation",
    description: "Characters with opposing goals develop rivalries",
    content: `rule rivalry_formation {
  when (
    competing_for(?person1, ?person2, ?resource) and
    personality_trait(?person1, "agreeableness", -0.3) and
    not(are_friends(?person1, ?person2)) and
    interaction_count(?person1, ?person2, ?count) and ?count > 5
  )
  then {
    add_relationship(?person1, ?person2, "rival")
    add_thought(?person1, "They're always in my way", "resentful")
    update_belief(?person1, ?person2, {"rival": true, "untrustworthy": true})
  }
  priority: 4
  likelihood: 0.2
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "conflict",
    priority: 4,
    likelihood: 0.2,
    tags: ["rivalry", "conflict", "competition"]
  },
  {
    name: "conflict_mediation",
    description: "Respected community members mediate disputes",
    content: `rule conflict_mediation {
  when (
    in_conflict(?person1, ?person2) and
    respected_elder(?mediator) and
    same_settlement(?mediator, ?person1) and
    same_settlement(?mediator, ?person2) and
    not(?mediator = ?person1) and
    not(?mediator = ?person2)
  )
  then {
    mediate_conflict(?mediator, ?person1, ?person2)
    reduce_hostility(?person1, ?person2, 15)
    add_thought(?mediator, "Helping keep the peace", "dutiful")
  }
  priority: 5
  likelihood: 0.4
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "conflict",
    priority: 5,
    likelihood: 0.4,
    tags: ["conflict", "mediation", "community"]
  },

  // ============= REPUTATION & STATUS =============
  {
    name: "reputation_gossip",
    description: "Characters spread gossip about others",
    content: `rule reputation_gossip {
  when (
    knows_about(?gossiper, ?event, ?subject) and
    are_friends(?gossiper, ?listener) and
    not(knows_about(?listener, ?event, ?subject)) and
    same_location(?gossiper, ?listener) and
    personality_trait(?gossiper, "extroversion", 0.3)
  )
  then {
    spread_gossip(?gossiper, ?listener, ?event, ?subject)
    update_belief(?listener, ?subject, from_event(?event))
    add_thought(?gossiper, "Did you hear about...", "gossipy")
  }
  priority: 2
  likelihood: 0.4
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "social",
    priority: 2,
    likelihood: 0.4,
    tags: ["gossip", "reputation", "social"]
  },
  {
    name: "heroic_deed_reputation",
    description: "Heroic actions boost reputation significantly",
    content: `rule heroic_deed_reputation {
  when (
    performed_heroic_action(?person, ?action) and
    witnessed_by(?action, ?witnesses) and
    count(?witnesses, ?count) and ?count >= 3
  )
  then {
    update_reputation(?person, 30)
    add_title(?person, "Hero")
    add_thought(?person, "I did what needed to be done", "proud")
    spread_news(?action, ?person, settlement_of(?person))
  }
  priority: 8
  likelihood: 1.0
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "social",
    priority: 8,
    likelihood: 1.0,
    tags: ["reputation", "heroism", "status"]
  },

  // ============= SEASONAL & ENVIRONMENTAL =============
  {
    name: "harvest_season",
    description: "Farmers harvest crops in autumn",
    content: `rule harvest_season {
  when (
    season("autumn") and
    has_occupation(?farmer, "Farmer") and
    owns_farm(?farmer, ?farm) and
    crops_ready(?farm)
  )
  then {
    harvest_crops(?farmer, ?farm)
    sell_harvest(?farmer, ?farm)
    add_thought(?farmer, "Good harvest this year", "satisfied")
    update_prosperity(settlement_of(?farmer), 3)
  }
  priority: 7
  likelihood: 0.9
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "environment",
    priority: 7,
    likelihood: 0.9,
    tags: ["farming", "seasonal", "economy"]
  },
  {
    name: "natural_disaster_response",
    description: "Communities respond to natural disasters",
    content: `rule natural_disaster_response {
  when (
    natural_disaster(?disaster, ?settlement) and
    population(?settlement, ?pop) and ?pop > 0 and
    severity(?disaster, ?sev) and ?sev > 5
  )
  then {
    evacuate_affected(?settlement, ?disaster)
    organize_relief(?settlement)
    damage_infrastructure(?settlement, ?sev)
    add_event(?settlement, "disaster", description_of(?disaster))
  }
  priority: 10
  likelihood: 1.0
}`,
    sourceFormat: "insimul",
    ruleType: "action",
    category: "environment",
    priority: 10,
    likelihood: 1.0,
    tags: ["disaster", "environment", "community"]
  },
];

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const rulesCollection = db.collection('rules');

  // Check for existing base rules
  const existingCount = await rulesCollection.countDocuments({ isBase: true });
  console.log(`Found ${existingCount} existing base rules.`);

  let inserted = 0;
  let skipped = 0;

  for (const rule of BASE_RULES) {
    // Skip if a base rule with the same name already exists
    const existing = await rulesCollection.findOne({ name: rule.name, isBase: true });
    if (existing) {
      console.log(`  Skipping "${rule.name}" (already exists)`);
      skipped++;
      continue;
    }

    await rulesCollection.insertOne({
      ...rule,
      isBase: true,
      worldId: null,
      isActive: true,
      isCompiled: false,
      compiledOutput: {},
      conditions: [],
      effects: [],
      dependencies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log(`  Inserted "${rule.name}" [${rule.category}]`);
    inserted++;
  }

  console.log(`\nDone! Inserted ${inserted} base rules, skipped ${skipped}.`);
  console.log(`Total base rules in database: ${await rulesCollection.countDocuments({ isBase: true })}`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
