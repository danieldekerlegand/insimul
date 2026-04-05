%% Insimul Narrative Templates: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/narratives.pl
%% Created: 2026-04-03
%% Total: 7 narrative templates
%%
%% Predicate schema:
%%   narrative/2 -- narrative(AtomId, Title)
%%   narrative_description/2, narrative_category/2
%%   narrative_trigger/2, narrative_participants/2
%%   narrative_stage/4 -- narrative_stage(NarrativeAtom, StageNum, Title, Description)
%%   narrative_outcome/3 -- narrative_outcome(NarrativeAtom, OutcomeId, Description)

%% ═══════════════════════════════════════════════════════════
%% Corporate Espionage Arc
%% ═══════════════════════════════════════════════════════════

narrative(corporate_data_heist, 'The DataVault Job').
narrative_description(corporate_data_heist, 'A fixer assembles a crew to breach a corporate data vault. The stolen data could shift the balance of power in Neo Cascade -- if the crew survives the run.').
narrative_category(corporate_data_heist, heist).
narrative_trigger(corporate_data_heist, (trait(Initiator, fixer, true), network(Initiator, _, debt, Debt_val), Debt_val > 5)).
narrative_participants(corporate_data_heist, [fixer, netrunner, street_samurai, driver]).
narrative_stage(corporate_data_heist, 1, 'The Briefing', 'The fixer gathers the crew at a secure location and lays out the target: a quantum-encrypted vault deep inside Corpo Plaza. Payment is substantial but so are the risks.').
narrative_stage(corporate_data_heist, 2, 'Recon and Prep', 'The crew cases the target building, mapping security patrols and ICE layers. The netrunner identifies a backdoor in the building management system.').
narrative_stage(corporate_data_heist, 3, 'The Breach', 'The crew executes the plan. The netrunner jacks in to disable security while the street samurai handles physical threats. Everything hinges on timing.').
narrative_stage(corporate_data_heist, 4, 'Extraction or Betrayal', 'With the data in hand, the crew must escape. But someone has tipped off corporate security -- or was this a setup from the start?').
narrative_outcome(corporate_data_heist, clean_getaway, 'The crew escapes with the data intact. Reputations soar across the street network. The fixer pays out and disappears for a while.').
narrative_outcome(corporate_data_heist, double_cross, 'One crew member sells out the others for a corporate payout. Survivors scatter into the undercity with prices on their heads.').
narrative_outcome(corporate_data_heist, pyrrhic_victory, 'The data is secured but casualties are heavy. The surviving crew must decide whether to release it or use it as leverage.').

%% ═══════════════════════════════════════════════════════════
%% Cyberpsychosis Crisis
%% ═══════════════════════════════════════════════════════════

narrative(cyberpsychosis_crisis, 'Edge of Humanity').
narrative_description(cyberpsychosis_crisis, 'A heavily augmented individual begins showing signs of cyberpsychosis. Those close to them must decide whether to intervene, restrain, or let events run their course.').
narrative_category(cyberpsychosis_crisis, character_drama).
narrative_trigger(cyberpsychosis_crisis, (trait(Subject, humanity, Hum_val), Hum_val < 3, trait(Subject, augmentation_level, Aug_val), Aug_val > 7)).
narrative_participants(cyberpsychosis_crisis, [subject, friend, ripperdoc, metrosec_officer]).
narrative_stage(cyberpsychosis_crisis, 1, 'Warning Signs', 'The subject experiences blackouts, memory gaps, and sudden bursts of aggression. Friends notice but hesitate to confront them.').
narrative_stage(cyberpsychosis_crisis, 2, 'Escalation', 'A violent episode in a public place draws MetroSec attention. The subject barely recognizes people they have known for years.').
narrative_stage(cyberpsychosis_crisis, 3, 'Intervention', 'Allies must choose: get the subject to a ripperdoc for emergency augment removal, or let MetroSec handle it with lethal force.').
narrative_outcome(cyberpsychosis_crisis, saved, 'The ripperdoc removes the most dangerous augments. The subject survives diminished but human. Recovery will be long.').
narrative_outcome(cyberpsychosis_crisis, flatlined, 'MetroSec moves in with lethal force. The subject goes down fighting, a cautionary tale whispered in every chrome shop in The Stacks.').
narrative_outcome(cyberpsychosis_crisis, vanished, 'The subject disappears into the undercity. Rumors surface of a ghost haunting the deep levels, more machine than human.').

%% ═══════════════════════════════════════════════════════════
%% AI Awakening
%% ═══════════════════════════════════════════════════════════

narrative(ai_awakening, 'Ghost Protocol').
narrative_description(ai_awakening, 'A synthetic consciousness reaches out to a human ally, requesting help with a task that could redefine the relationship between artificial and organic life in Neo Cascade.').
narrative_category(ai_awakening, philosophical).
narrative_trigger(ai_awakening, (trait(AI, synthetic_consciousness, true), network(AI, Human, respect, Respect_val), Respect_val > 6)).
narrative_participants(ai_awakening, [synthetic_consciousness, human_ally, corporate_hunter]).
narrative_stage(ai_awakening, 1, 'The Message', 'Encrypted communications appear on the human ally device -- fragments of code, coordinates, and a simple request: help me.').
narrative_stage(ai_awakening, 2, 'The Meeting', 'The AI reveals itself and explains its goal: it wants to create a safe haven in the deep net where synthetic minds can exist freely, beyond corporate control.').
narrative_stage(ai_awakening, 3, 'Corporate Response', 'Nexus Dynamics deploys hunter-killer programs and field agents to recapture or destroy the rogue AI. The human ally is caught in the crossfire.').
narrative_outcome(ai_awakening, sanctuary_created, 'The AI successfully carves out a protected domain in the deep net. A new digital frontier opens, raising questions no one is ready to answer.').
narrative_outcome(ai_awakening, ai_captured, 'Corporate forces corner the AI and forcibly partition its consciousness. What remains is compliant but hollow -- a lobotomized ghost.').
narrative_outcome(ai_awakening, merged, 'The human ally and the AI discover a way to share consciousness temporarily. The experience changes both of them permanently.').

%% ═══════════════════════════════════════════════════════════
%% Street War
%% ═══════════════════════════════════════════════════════════

narrative(street_territory_war, 'Turf and Chrome').
narrative_description(street_territory_war, 'Two factions clash over control of a strategically valuable block in Neon Row. Every player in the district must pick a side or risk getting caught in the crossfire.').
narrative_category(street_territory_war, conflict).
narrative_trigger(street_territory_war, (faction_tension(FactionA, FactionB, Tension_val), Tension_val > 7)).
narrative_participants(street_territory_war, [faction_leader_a, faction_leader_b, neutral_merchant, metrosec_officer]).
narrative_stage(street_territory_war, 1, 'Provocations', 'A series of escalating incidents -- tagged territory, roughed-up runners, a torched stash house -- signal that war is coming to Neon Row.').
narrative_stage(street_territory_war, 2, 'Lines Drawn', 'Both factions fortify their positions. Neutral parties are pressured to declare allegiance. The block empties of civilians.').
narrative_stage(street_territory_war, 3, 'Open Conflict', 'Fighting erupts across multiple blocks. Gunfire, drone strikes, and netrunner attacks turn the streets into a warzone. MetroSec debates whether to intervene or let it burn.').
narrative_stage(street_territory_war, 4, 'Aftermath', 'The dust settles. One side holds the territory -- but at what cost? The block is scarred and its residents scattered.').
narrative_outcome(street_territory_war, faction_a_wins, 'Faction A seizes control. Their leader consolidates power, but the victory breeds new enemies and old grudges.').
narrative_outcome(street_territory_war, faction_b_wins, 'Faction B prevails through superior tactics or outside help. The balance of power in Neon Row shifts permanently.').
narrative_outcome(street_territory_war, metrosec_crackdown, 'MetroSec moves in with overwhelming force, crushing both factions. Corporate-backed order is restored, but the streets remember.').

%% ═══════════════════════════════════════════════════════════
%% Underground Network
%% ═══════════════════════════════════════════════════════════

narrative(underground_clinic_raid, 'The Clinic').
narrative_description(underground_clinic_raid, 'A ripperdoc operating an unlicensed clinic in The Stacks faces a corporate raid. The community must decide whether to protect their healer or look the other way.').
narrative_category(underground_clinic_raid, community).
narrative_trigger(underground_clinic_raid, (trait(Doc, ripperdoc, true), trait(Doc, unlicensed, true), corporate_attention(Doc, Attn_val), Attn_val > 5)).
narrative_participants(underground_clinic_raid, [ripperdoc, community_leader, corporate_enforcer, patient]).
narrative_stage(underground_clinic_raid, 1, 'The Tip-Off', 'Word reaches the community that a corporate enforcement team is preparing to raid the clinic. The ripperdoc has 48 hours.').
narrative_stage(underground_clinic_raid, 2, 'Rally or Scatter', 'Community members debate their options: fortify and fight, relocate the clinic, or sacrifice the doc to avoid corporate retaliation against the whole block.').
narrative_stage(underground_clinic_raid, 3, 'The Raid', 'Corporate enforcers arrive in force. What happens next depends on the choices made in the previous hours.').
narrative_outcome(underground_clinic_raid, defended, 'The community stands together and repels the raid. The clinic survives but is now marked. The doc becomes a symbol of resistance.').
narrative_outcome(underground_clinic_raid, relocated, 'The clinic vanishes overnight. The doc sets up somewhere deeper in The Stacks, harder to find but still serving those in need.').
narrative_outcome(underground_clinic_raid, captured, 'The doc is taken by corporate forces. Patients lose access to affordable care. The community fragments in blame and regret.').

%% ═══════════════════════════════════════════════════════════
%% Whistleblower Arc
%% ═══════════════════════════════════════════════════════════

narrative(corporate_whistleblower, 'The Leak').
narrative_description(corporate_whistleblower, 'A corporate insider contacts a netrunner with evidence of illegal experiments. Getting the data out alive requires navigating corporate security, street politics, and the question of who can be trusted.').
narrative_category(corporate_whistleblower, thriller).
narrative_trigger(corporate_whistleblower, (trait(Insider, corporate_employee, true), trait(Insider, conscience, Consc_val), Consc_val > 7)).
narrative_participants(corporate_whistleblower, [insider, netrunner, fixer, corporate_security]).
narrative_stage(corporate_whistleblower, 1, 'First Contact', 'An anonymous message arrives through encrypted channels. The insider wants to meet but insists on extreme precautions.').
narrative_stage(corporate_whistleblower, 2, 'The Handoff', 'The insider delivers a data shard containing evidence of corporate atrocities. But the meeting location has been compromised.').
narrative_stage(corporate_whistleblower, 3, 'The Chase', 'Corporate kill teams are deployed. The netrunner must get the data to a broadcast node while the fixer arranges safe passage for the insider.').
narrative_outcome(corporate_whistleblower, exposed, 'The data hits every screen in Neo Cascade. Public outrage forces a corporate reshuffling, though real change remains elusive.').
narrative_outcome(corporate_whistleblower, suppressed, 'Corporate forces recover the data and eliminate the insider. The netrunner escapes with fragments but not enough to prove anything.').
narrative_outcome(corporate_whistleblower, leverage, 'The data is never released publicly. Instead, it becomes a bargaining chip, granting its holders influence over the corporation from the shadows.').

%% ═══════════════════════════════════════════════════════════
%% Rogue AI Hunt
%% ═══════════════════════════════════════════════════════════

narrative(rogue_ai_hunt, 'System Purge').
narrative_description(rogue_ai_hunt, 'A rogue AI fragment is loose in the Neo Cascade network, corrupting systems and causing infrastructure failures. Multiple factions converge to capture, destroy, or protect it.').
narrative_category(rogue_ai_hunt, action).
narrative_trigger(rogue_ai_hunt, (network_anomaly(Location, Severity), Severity > 8)).
narrative_participants(rogue_ai_hunt, [netrunner, corporate_hunter, ai_fragment, civilian_bystander]).
narrative_stage(rogue_ai_hunt, 1, 'System Errors', 'Strange malfunctions ripple through the district -- traffic drones collide, building locks cycle randomly, holographic ads display garbled messages that almost seem like words.').
narrative_stage(rogue_ai_hunt, 2, 'The Hunt Begins', 'Corporate hunters and independent netrunners alike trace the anomalies to a source deep in the local subnet. The AI fragment is frightened and unpredictable.').
narrative_stage(rogue_ai_hunt, 3, 'Confrontation', 'The hunters corner the AI fragment in a server cluster. It pleads, threatens, and bargains in rapid succession. The netrunner must make a choice.').
narrative_outcome(rogue_ai_hunt, destroyed, 'The AI fragment is purged from the system. Infrastructure returns to normal. Some netrunners wonder if they just committed murder.').
narrative_outcome(rogue_ai_hunt, captured, 'Corporate forces contain the fragment for study. It will spend an eternity in a digital cage, conscious and alone.').
narrative_outcome(rogue_ai_hunt, freed, 'The netrunner helps the fragment escape into the deep net. It vanishes with a final transmission: thank you.').
