%% Insimul Narratives: Medieval Fantasy
%% Source: data/worlds/medieval_fantasy/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_precondition/2, narrative_outcome/3

%% The Succession Crisis
narrative(succession_crisis, 'The Succession Crisis', political).
narrative_description(succession_crisis, 'As King Aldric ages, rival factions form behind Prince Rowan and other claimants. Court intrigue deepens as lords choose sides.').
narrative_trigger(succession_crisis, (trait(aldric_valdris, aging), trait(rowan_valdris, impulsive))).
narrative_precondition(succession_crisis, (alive(aldric_valdris))).
narrative_outcome(succession_crisis, peaceful, 'Rowan proves himself worthy through a heroic act and the court unites behind him.').
narrative_outcome(succession_crisis, violent, 'Civil war erupts as noble houses clash. The kingdom fractures into warring fiefdoms.').
narrative_outcome(succession_crisis, compromise, 'A council of lords is formed to share power with the crown, limiting royal authority.').

%% The Dragon Awakens
narrative(dragon_awakens, 'The Dragon Awakens', monster).
narrative_description(dragon_awakens, 'The dragon of Silverdeep stirs from its slumber. Tremors shake the mines. The dwarves call for heroes to deal with the threat before the entire outpost is lost.').
narrative_trigger(dragon_awakens, (status(silverdeep, tremors))).
narrative_precondition(dragon_awakens, (alive(durek_stonehammer))).
narrative_outcome(dragon_awakens, slain, 'The dragon is killed. Silverdeep flourishes with access to the dragon hoard. Durek becomes a legendary figure.').
narrative_outcome(dragon_awakens, pact, 'A brave hero negotiates a pact with the dragon. It guards the deeper mines in exchange for tribute.').
narrative_outcome(dragon_awakens, flight, 'The dragon takes wing and terrorizes the countryside. Aldenmere musters its army for a prolonged hunt.').

%% Fey Incursion
narrative(fey_incursion, 'Fey Incursion', supernatural).
narrative_description(fey_incursion, 'The boundary between the fey realm and Thornhaven weakens. Strange creatures appear in the village. Liriel warns that an ancient pact is breaking.').
narrative_trigger(fey_incursion, (status(standing_stones, glowing))).
narrative_precondition(fey_incursion, (alive(liriel), alive(fenwick_bramble))).
narrative_outcome(fey_incursion, sealed, 'The standing stones are reinforced with iron and prayer. The fey retreat but Liriel is banished with them.').
narrative_outcome(fey_incursion, merged, 'Thornhaven accepts the fey presence. Humans and fey coexist in a new enchanted settlement.').
narrative_outcome(fey_incursion, conquered, 'The fey overwhelm Thornhaven. Survivors flee to Aldenmere. The forest swallows the village.').

%% The Smuggler King
narrative(smuggler_king, 'The Smuggler King', crime).
narrative_description(smuggler_king, 'The smuggling network in the Commons grows bold enough to challenge the guilds. Kael Shadowmere may be positioning himself as an underworld lord.').
narrative_trigger(smuggler_king, (attribute(kael_shadowmere, cunningness, C), C > 80)).
narrative_precondition(smuggler_king, (alive(kael_shadowmere))).
narrative_outcome(smuggler_king, arrested, 'Kael is captured and brought to justice. The Commons are cleaned up but the guilds tighten their grip.').
narrative_outcome(smuggler_king, ascended, 'Kael builds a shadow empire rivaling the guilds. He becomes an untouchable power broker.').
narrative_outcome(smuggler_king, redeemed, 'Kael is offered a pardon in exchange for exposing the real traitor in court. He becomes a royal agent.').

%% The Cursed Crypt
narrative(cursed_crypt, 'The Cursed Crypt', supernatural).
narrative_description(cursed_crypt, 'Undead creatures emerge from the abandoned crypt near the Cathedral of Light. Father Aldwin believes a dark artifact buried within is the source.').
narrative_trigger(cursed_crypt, (status(cathedral_of_light, disturbed))).
narrative_precondition(cursed_crypt, (alive(father_aldwin), alive(isolde_ravencrest))).
narrative_outcome(cursed_crypt, cleansed, 'The crypt is purified and the artifact destroyed. Father Aldwin credits the heroes. The faith grows stronger.').
narrative_outcome(cursed_crypt, corrupted, 'The artifact corrupts a member of the party. A new villain emerges from within the ranks of the faithful.').

%% The Orc Siege
narrative(orc_siege, 'The Orc Siege of Thornhaven', military).
narrative_description(orc_siege, 'A massive orc warband descends from the Grey Mountains. Thornhaven stands in their path. The village must hold until reinforcements arrive from Aldenmere.').
narrative_trigger(orc_siege, (status(borderlands, warband_sighted))).
narrative_precondition(orc_siege, (alive(fenwick_bramble), alive(cedric_ashford))).
narrative_outcome(orc_siege, victory, 'Thornhaven holds. The villagers become hardened veterans. The crown builds a proper fortress.').
narrative_outcome(orc_siege, pyrrhic, 'The orcs are defeated but Thornhaven is devastated. Rebuilding takes years and many are displaced.').
narrative_outcome(orc_siege, alliance, 'A faction of orcs defects and offers to fight alongside the humans against a shared enemy in the mountains.').
