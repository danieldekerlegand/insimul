%% Insimul Narratives: Realm of Aethermoor
%% Source: data/worlds/realm_of_aethermoor/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narrative templates
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3, narrative_outcome/3

%% Narrative: The Fading Wells
narrative(fading_wells, 'The Fading Wells', environmental).
narrative_description(fading_wells, 'The Aether Wells are losing power. As magic fades across the realm, settlements lose their protective wards and the prophecy of the Crystal Spire begins to unfold.').
narrative_trigger(fading_wells, quest_complete(crystal_prophecy)).
narrative_step(fading_wells, 0, 'The Grand Aether Well in Aethoria City flickers and dims for the first time in centuries.').
narrative_step(fading_wells, 1, 'Without wards, dark creatures begin encroaching on the outer villages.').
narrative_step(fading_wells, 2, 'The four realm leaders must convene at Crossroads Haven to find a solution.').
narrative_outcome(fading_wells, forge_aetherblade, 'The Aetherblade restores the wells and the realm enters a new golden age.').
narrative_outcome(fading_wells, wells_collapse, 'Magic fades entirely and the realm must adapt to a mundane existence.').

%% Narrative: The Forbidden Love
narrative(forbidden_love, 'The Forbidden Love', romance).
narrative_description(forbidden_love, 'Prince Aragorn and Princess Arwen deepen their bond despite political opposition. Their union could forge peace between humans and elves or ignite war.').
narrative_trigger(forbidden_love, network(human_prince, elf_princess, romance, 8)).
narrative_step(forbidden_love, 0, 'Aragorn and Arwen meet secretly at the Crossroads Aether Well.').
narrative_step(forbidden_love, 1, 'Queen Galadriel discovers the relationship and forbids Arwen from seeing the prince.').
narrative_step(forbidden_love, 2, 'King Aldric proposes a political marriage alliance that legitimizes the union.').
narrative_outcome(forbidden_love, marriage, 'The union creates a historic human-elf alliance.').
narrative_outcome(forbidden_love, separation, 'The lovers are separated and inter-racial tensions deepen.').

%% Narrative: The Ironpeak Succession
narrative(ironpeak_succession, 'The Ironpeak Succession', political).
narrative_description(ironpeak_succession, 'King Thorin grows old and Gimli must prove worthy of inheriting the throne. Rival clans within the hold challenge his claim.').
narrative_trigger(ironpeak_succession, attribute(dwarf_king, age, 80)).
narrative_step(ironpeak_succession, 0, 'Thorin announces he will step down after the Forging Festival.').
narrative_step(ironpeak_succession, 1, 'A rival clan leader challenges Gimli to a trial by combat at The Great Forge.').
narrative_step(ironpeak_succession, 2, 'The player must help Gimli prepare or support the challenger.').
narrative_outcome(ironpeak_succession, gimli_wins, 'Gimli is crowned King and strengthens the dwarven alliance with Aethoria.').
narrative_outcome(ironpeak_succession, rival_wins, 'The rival clan isolates Ironpeak from the other settlements.').

%% Narrative: The Shadow Below
narrative(shadow_below, 'The Shadow Below', horror).
narrative_description(shadow_below, 'The corruption seeping from beneath Silverwood grows stronger. An ancient evil awakens in the deep places of the world.').
narrative_trigger(shadow_below, quest_complete(whispering_grove)).
narrative_step(shadow_below, 0, 'The sealed rift reopens and dark creatures pour into the Silverwood.').
narrative_step(shadow_below, 1, 'Legolas leads a desperate defense of the forest while the player seeks the source.').
narrative_step(shadow_below, 2, 'Deep beneath the roots, an imprisoned dark mage attempts to break free.').
narrative_outcome(shadow_below, seal_forever, 'The dark mage is permanently sealed using all four Aether Well crystals.').
narrative_outcome(shadow_below, dark_mage_freed, 'The dark mage escapes and the realm faces its greatest threat.').

%% Narrative: The Orc Question
narrative(orc_question, 'The Orc Question', diplomacy).
narrative_description(orc_question, 'Grommash seeks a homeland for his people. The settled races must decide whether to grant territory or face continued raiding.').
narrative_trigger(orc_question, quest_complete(war_of_holds)).
narrative_step(orc_question, 0, 'Grommash presents his case at the Adventurer Guild in Crossroads Haven.').
narrative_step(orc_question, 1, 'King Aldric and King Thorin oppose granting land. Queen Galadriel is open to negotiation.').
narrative_step(orc_question, 2, 'The player must broker a deal or prepare for war.').
narrative_outcome(orc_question, peace_accord, 'The orcs are granted the Ashlands as a recognized territory.').
narrative_outcome(orc_question, war, 'War breaks out across the realm as orc clans unite against the settlements.').

%% Narrative: The Crown Conspiracy
narrative(crown_conspiracy, 'The Crown Conspiracy', mystery).
narrative_description(crown_conspiracy, 'An assassination plot against King Aldric reveals a web of corruption among the noble houses of Aethoria.').
narrative_trigger(crown_conspiracy, quest_complete(crown_of_thorns)).
narrative_step(crown_conspiracy, 0, 'The conspirators are identified but their patron remains hidden.').
narrative_step(crown_conspiracy, 1, 'Evidence points to a connection between the plot and the dark grimoire theft.').
narrative_step(crown_conspiracy, 2, 'The true mastermind is revealed, forcing a confrontation at the Royal Palace.').
narrative_outcome(crown_conspiracy, justice, 'The conspiracy is crushed and the Stormborne dynasty is strengthened.').
narrative_outcome(crown_conspiracy, coup, 'The king is overthrown and a new, darker regime takes power.').
