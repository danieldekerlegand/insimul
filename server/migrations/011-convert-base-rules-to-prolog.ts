#!/usr/bin/env tsx
/**
 * Migration: Convert Base Rules to Prolog
 *
 * Rewrites the `content` field of all 33 seeded base rules from the Insimul DSL
 * format to proper Prolog. Also sets sourceFormat to 'prolog' and populates
 * the prologContent field so that the rules are immediately usable in-game.
 *
 * Rules that cannot be meaningfully expressed in Prolog are removed.
 *
 * Usage:
 *   npx tsx server/migrations/011-convert-base-rules-to-prolog.ts
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

/**
 * Each entry maps a base rule name to its new Prolog content.
 * The Prolog follows the Insimul predicate schema:
 *   rule_applies(RuleName, Actor, Target) :- <conditions>.
 *   rule_effect(RuleName, Actor, Target, Effect).
 *   rule_active(RuleName).
 *   rule_priority(RuleName, Priority).
 *   rule_likelihood(RuleName, Likelihood).
 */
const PROLOG_RULES: Record<string, string> = {

  // ═══ EMPLOYMENT ═══

  succession_planning: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(succession_planning).
rule_priority(succession_planning, 8).
rule_likelihood(succession_planning, 0.7).

rule_applies(succession_planning, Owner, Child) :-
    person(Owner), person(Child),
    age(Owner, Age), Age > 65,
    business_owner(_, Owner),
    parent_of(Owner, Child),
    age(Child, ChildAge), ChildAge > 25.

rule_effect(succession_planning, Owner, Child, hire(Child, owner)).
rule_effect(succession_planning, Owner, _, retire(Owner)).
`,

  promote_loyal_employee: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(promote_loyal_employee).
rule_priority(promote_loyal_employee, 6).
rule_likelihood(promote_loyal_employee, 0.4).

rule_applies(promote_loyal_employee, Person, Business) :-
    person(Person),
    occupation(Person, worker),
    personality(Person, conscientiousness, C), C > 0.3.

rule_effect(promote_loyal_employee, Person, _, promote(Person)).
`,

  unemployment_job_search: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(unemployment_job_search).
rule_priority(unemployment_job_search, 5).
rule_likelihood(unemployment_job_search, 0.2).

rule_applies(unemployment_job_search, Person, _) :-
    person(Person),
    \\+ occupation(Person, _),
    age(Person, Age), Age >= 18, Age =< 65,
    alive(Person).

rule_effect(unemployment_job_search, Person, _, seek_employment(Person)).
`,

  // ═══ SOCIAL ═══

  workplace_romance: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(workplace_romance).
rule_priority(workplace_romance, 4).
rule_likelihood(workplace_romance, 0.1).

rule_applies(workplace_romance, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    \\+ married_to(Person1, _),
    \\+ married_to(Person2, _),
    alive(Person1), alive(Person2).

rule_effect(workplace_romance, Person1, Person2, trigger_marriage(Person1, Person2)).
`,

  neighbor_friendship: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(neighbor_friendship).
rule_priority(neighbor_friendship, 3).
rule_likelihood(neighbor_friendship, 0.3).

rule_applies(neighbor_friendship, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    personality(Person1, extraversion, E), E > 0.2,
    personality(Person2, agreeableness, A), A > 0.2,
    \\+ friend_of(Person1, Person2).

rule_effect(neighbor_friendship, Person1, Person2, add_relationship(Person1, Person2, friend)).
`,

  extrovert_socializing: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(extrovert_socializing).
rule_priority(extrovert_socializing, 3).
rule_likelihood(extrovert_socializing, 0.4).

rule_applies(extrovert_socializing, Person, _) :-
    person(Person),
    personality(Person, extraversion, E), E > 0.6,
    alive(Person).

rule_effect(extrovert_socializing, Person, _, organize_gathering(Person)).
`,

  // ═══ BUSINESS ═══

  entrepreneurial_spirit: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(entrepreneurial_spirit).
rule_priority(entrepreneurial_spirit, 6).
rule_likelihood(entrepreneurial_spirit, 0.15).

rule_applies(entrepreneurial_spirit, Person, _) :-
    person(Person),
    age(Person, Age), Age >= 25, Age =< 45,
    personality(Person, openness, O), O > 0.5,
    personality(Person, conscientiousness, C), C > 0.5,
    alive(Person).

rule_effect(entrepreneurial_spirit, Person, _, found_business(Person)).
`,

  business_expansion: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(business_expansion).
rule_priority(business_expansion, 5).
rule_likelihood(business_expansion, 0.3).

rule_applies(business_expansion, Owner, Business) :-
    person(Owner),
    business_owner(Business, Owner),
    business(Business).

rule_effect(business_expansion, Owner, Business, expand_business(Business)).
`,

  economic_hardship_closure: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(economic_hardship_closure).
rule_priority(economic_hardship_closure, 7).
rule_likelihood(economic_hardship_closure, 0.6).

rule_applies(economic_hardship_closure, Owner, Business) :-
    person(Owner),
    business_owner(Business, Owner),
    business(Business),
    \\+ business_out_of_business(Business).

rule_effect(economic_hardship_closure, _, Business, close_business(Business, economic_hardship)).
`,

  // ═══ LIFE EVENTS ═══

  retirement_decision: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(retirement_decision).
rule_priority(retirement_decision, 7).
rule_likelihood(retirement_decision, 0.5).

rule_applies(retirement_decision, Person, _) :-
    person(Person),
    age(Person, Age), Age >= 65,
    occupation(Person, _),
    \\+ business_owner(_, Person),
    alive(Person).

rule_effect(retirement_decision, Person, _, retire(Person)).
`,

  starting_family: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(starting_family).
rule_priority(starting_family, 6).
rule_likelihood(starting_family, 0.3).

rule_applies(starting_family, Person1, Person2) :-
    person(Person1), person(Person2),
    married_to(Person1, Person2),
    age(Person1, Age1), Age1 >= 25, Age1 =< 35,
    age(Person2, Age2), Age2 >= 25, Age2 =< 35,
    alive(Person1), alive(Person2).

rule_effect(starting_family, Person1, Person2, trigger_birth(Person1, Person2)).
`,

  empty_nest_downsize: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(empty_nest_downsize).
rule_priority(empty_nest_downsize, 4).
rule_likelihood(empty_nest_downsize, 0.2).

rule_applies(empty_nest_downsize, Person, _) :-
    person(Person),
    age(Person, Age), Age > 55,
    alive(Person).

rule_effect(empty_nest_downsize, Person, _, downsize_home(Person)).
`,

  // ═══ PERSONALITY ═══

  conscientious_work_ethic: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(conscientious_work_ethic).
rule_priority(conscientious_work_ethic, 4).
rule_likelihood(conscientious_work_ethic, 0.3).

rule_applies(conscientious_work_ethic, Person, _) :-
    person(Person),
    personality(Person, conscientiousness, C), C > 0.7,
    occupation(Person, _),
    alive(Person).

rule_effect(conscientious_work_ethic, Person, _, take_extra_responsibility(Person)).
`,

  // ═══ MEMORY & COGNITION ═══

  remembering_old_friends: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(remembering_old_friends).
rule_priority(remembering_old_friends, 2).
rule_likelihood(remembering_old_friends, 0.1).

rule_applies(remembering_old_friends, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(remembering_old_friends, Person1, Person2, reconnect(Person1, Person2)).
`,

  // ═══ PROFESSIONAL OCCUPATIONS ═══

  doctor_delivers_baby: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(doctor_delivers_baby).
rule_priority(doctor_delivers_baby, 9).
rule_likelihood(doctor_delivers_baby, 1.0).

rule_applies(doctor_delivers_baby, Doctor, Mother) :-
    person(Doctor), person(Mother),
    occupation(Doctor, doctor),
    alive(Doctor), alive(Mother).

rule_effect(doctor_delivers_baby, Doctor, Mother, deliver_baby(Doctor, Mother)).
`,

  lawyer_handles_divorce: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(lawyer_handles_divorce).
rule_priority(lawyer_handles_divorce, 8).
rule_likelihood(lawyer_handles_divorce, 1.0).

rule_applies(lawyer_handles_divorce, Lawyer, Person) :-
    person(Lawyer), person(Person),
    occupation(Lawyer, lawyer),
    married_to(Person, _),
    alive(Lawyer), alive(Person).

rule_effect(lawyer_handles_divorce, Lawyer, Person, file_divorce(Lawyer, Person)).
`,

  // ═══ GOVERNANCE & LAW ═══

  crime_punishment: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(crime_punishment).
rule_priority(crime_punishment, 9).
rule_likelihood(crime_punishment, 0.8).

rule_applies(crime_punishment, Officer, Person) :-
    person(Officer), person(Person),
    Officer \\= Person,
    occupation(Officer, police),
    alive(Officer), alive(Person).

rule_effect(crime_punishment, Officer, Person, arrest(Officer, Person)).
`,

  election_cycle: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(election_cycle).
rule_priority(election_cycle, 7).
rule_likelihood(election_cycle, 1.0).

rule_applies(election_cycle, Settlement, _) :-
    settlement(Settlement),
    settlement_population(Settlement, Pop), Pop >= 50.

rule_effect(election_cycle, Settlement, _, hold_election(Settlement)).
`,

  // ═══ TRADE & COMMERCE ═══

  merchant_trade_route: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(merchant_trade_route).
rule_priority(merchant_trade_route, 6).
rule_likelihood(merchant_trade_route, 0.3).

rule_applies(merchant_trade_route, Merchant, _) :-
    person(Merchant),
    occupation(Merchant, merchant),
    alive(Merchant).

rule_effect(merchant_trade_route, Merchant, _, establish_trade_route(Merchant)).
`,

  supply_demand_pricing: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(supply_demand_pricing).
rule_priority(supply_demand_pricing, 5).
rule_likelihood(supply_demand_pricing, 0.6).

rule_applies(supply_demand_pricing, Business, _) :-
    business(Business),
    \\+ business_out_of_business(Business).

rule_effect(supply_demand_pricing, Business, _, adjust_prices(Business)).
`,

  // ═══ EDUCATION & KNOWLEDGE ═══

  apprenticeship: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(apprenticeship).
rule_priority(apprenticeship, 5).
rule_likelihood(apprenticeship, 0.25).

rule_applies(apprenticeship, Youth, Master) :-
    person(Youth), person(Master),
    Youth \\= Master,
    age(Youth, Age), Age >= 14, Age =< 20,
    \\+ occupation(Youth, _),
    occupation(Master, _),
    alive(Youth), alive(Master).

rule_effect(apprenticeship, Youth, Master, start_apprenticeship(Youth, Master)).
`,

  knowledge_sharing: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(knowledge_sharing).
rule_priority(knowledge_sharing, 3).
rule_likelihood(knowledge_sharing, 0.2).

rule_applies(knowledge_sharing, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(knowledge_sharing, Person1, Person2, share_knowledge(Person1, Person2)).
`,

  // ═══ HEALTH & WELLBEING ═══

  illness_spread: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(illness_spread).
rule_priority(illness_spread, 7).
rule_likelihood(illness_spread, 0.15).

rule_applies(illness_spread, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    at_location(Person1, Loc),
    at_location(Person2, Loc),
    alive(Person1), alive(Person2).

rule_effect(illness_spread, _, Person2, infect(Person2)).
`,

  seek_medical_help: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(seek_medical_help).
rule_priority(seek_medical_help, 8).
rule_likelihood(seek_medical_help, 0.7).

rule_applies(seek_medical_help, Person, Doctor) :-
    person(Person), person(Doctor),
    Person \\= Doctor,
    occupation(Doctor, doctor),
    alive(Person), alive(Doctor).

rule_effect(seek_medical_help, Person, Doctor, treat(Doctor, Person)).
`,

  // ═══ CONFLICT & RESOLUTION ═══

  rivalry_formation: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(rivalry_formation).
rule_priority(rivalry_formation, 4).
rule_likelihood(rivalry_formation, 0.2).

rule_applies(rivalry_formation, Person1, Person2) :-
    person(Person1), person(Person2),
    Person1 \\= Person2,
    personality(Person1, agreeableness, A), A < 0.3,
    \\+ friend_of(Person1, Person2),
    alive(Person1), alive(Person2).

rule_effect(rivalry_formation, Person1, Person2, add_relationship(Person1, Person2, rival)).
`,

  conflict_mediation: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(conflict_mediation).
rule_priority(conflict_mediation, 5).
rule_likelihood(conflict_mediation, 0.4).

rule_applies(conflict_mediation, Mediator, Person1) :-
    person(Mediator), person(Person1),
    Mediator \\= Person1,
    age(Mediator, Age), Age >= 50,
    personality(Mediator, agreeableness, A), A > 0.6,
    alive(Mediator), alive(Person1).

rule_effect(conflict_mediation, Mediator, Person1, mediate_conflict(Mediator, Person1)).
`,

  // ═══ REPUTATION & STATUS ═══

  reputation_gossip: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(reputation_gossip).
rule_priority(reputation_gossip, 2).
rule_likelihood(reputation_gossip, 0.4).

rule_applies(reputation_gossip, Gossiper, Listener) :-
    person(Gossiper), person(Listener),
    Gossiper \\= Listener,
    friend_of(Gossiper, Listener),
    at_location(Gossiper, Loc),
    at_location(Listener, Loc),
    personality(Gossiper, extraversion, E), E > 0.3,
    alive(Gossiper), alive(Listener).

rule_effect(reputation_gossip, Gossiper, Listener, spread_gossip(Gossiper, Listener)).
`,

  heroic_deed_reputation: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(heroic_deed_reputation).
rule_priority(heroic_deed_reputation, 8).
rule_likelihood(heroic_deed_reputation, 1.0).

rule_applies(heroic_deed_reputation, Person, _) :-
    person(Person),
    alive(Person).

rule_effect(heroic_deed_reputation, Person, _, update_reputation(Person, 30)).
rule_effect(heroic_deed_reputation, Person, _, add_title(Person, hero)).
`,

  // ═══ SEASONAL & ENVIRONMENTAL ═══

  harvest_season: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(harvest_season).
rule_priority(harvest_season, 7).
rule_likelihood(harvest_season, 0.9).

rule_applies(harvest_season, Farmer, _) :-
    person(Farmer),
    occupation(Farmer, farmer),
    alive(Farmer).

rule_effect(harvest_season, Farmer, _, harvest_crops(Farmer)).
`,

  natural_disaster_response: `
:- discontiguous rule_applies/3, rule_effect/4.

rule_active(natural_disaster_response).
rule_priority(natural_disaster_response, 10).
rule_likelihood(natural_disaster_response, 1.0).

rule_applies(natural_disaster_response, Settlement, _) :-
    settlement(Settlement),
    settlement_population(Settlement, Pop), Pop > 0.

rule_effect(natural_disaster_response, Settlement, _, organize_relief(Settlement)).
`,
};

async function main() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGO_URL);
  console.log('Connected.');

  const db = mongoose.connection.db!;
  const rulesCollection = db.collection('rules');

  let updated = 0;
  let notFound = 0;

  for (const [ruleName, prologContent] of Object.entries(PROLOG_RULES)) {
    const trimmed = prologContent.trim();

    const result = await rulesCollection.updateOne(
      { name: ruleName, isBase: true },
      {
        $set: {
          content: trimmed,
          prologContent: trimmed,
          sourceFormat: 'prolog',
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount > 0) {
      console.log(`  ✅ Updated "${ruleName}"`);
      updated++;
    } else {
      console.log(`  ⚠️  Not found: "${ruleName}"`);
      notFound++;
    }
  }

  console.log(`\nDone! Updated ${updated} base rules to Prolog, ${notFound} not found.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
