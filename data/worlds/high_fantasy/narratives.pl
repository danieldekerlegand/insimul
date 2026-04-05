%% Insimul Narratives: High Fantasy
%% Source: data/worlds/high_fantasy/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_participants/2, narrative_outcome/2

%% The Dragon Awakening
narrative(the_dragon_awakening, 'The Dragon Awakening', cataclysm).
narrative_description(the_dragon_awakening, 'Tremors shake the mountains and ancient wards flicker. The elven seers confirm what many feared: a dragon stirs in the depths beneath Khazad Dumrak. The three races must decide whether to fight, flee, or attempt to parley with a being of immense power.').
narrative_trigger(the_dragon_awakening, (status(deep_mines, tremors), timestep(T), T > 20)).
narrative_participants(the_dragon_awakening, [thalion_starweaver, thorgar_ironforge, aldric_thornwall, ithrandil_moonwhisper]).
narrative_outcome(the_dragon_awakening, 'The dragon is either defeated through combined effort, bargained with through ancient pacts, or escapes to terrorize the frontier. The outcome reshapes alliances for a generation.').

%% The Mithril Conspiracy
narrative(the_mithril_conspiracy, 'The Mithril Conspiracy', intrigue).
narrative_description(the_mithril_conspiracy, 'Mithril is disappearing from the Ironforge vaults. Thorgar suspects smuggling but the trail leads to an unlikely source. Rurik Brightshard has been selling to humans at Thornhaven, violating dwarven law.').
narrative_trigger(the_mithril_conspiracy, (status(mithril_vault, shortage))).
narrative_participants(the_mithril_conspiracy, [thorgar_ironforge, rurik_brightshard, aldric_thornwall, brenna_ironforge]).
narrative_outcome(the_mithril_conspiracy, 'Rurik is either exposed and punished, or proves the trade was necessary to fund frontier defenses. The verdict tests the Deepstone Pact and dwarven-human relations.').

%% The Veil Weakens
narrative(the_veil_weakens, 'The Veil Weakens', supernatural).
narrative_description(the_veil_weakens, 'Strange spirits appear in the Grove Ward and the enchanted forest grows restless. Faelina senses the Veil between worlds thinning. Something is coming through, and only combined elven and dwarven magic can seal the breach.').
narrative_trigger(the_veil_weakens, (status(grove_ward, spirit_activity))).
narrative_participants(the_veil_weakens, [faelina_dawnpetal, ithrandil_moonwhisper, hilda_ironforge, lyraniel_silvershade]).
narrative_outcome(the_veil_weakens, 'The breach is sealed through a ritual combining elven nature magic and dwarven rune craft. The cooperation either heals old wounds or reveals deeper dangers yet to come.').

%% The Squire and the Princess
narrative(the_squire_and_the_princess, 'The Squire and the Princess', romance).
narrative_description(the_squire_and_the_princess, 'Rowan Thornwall and Caelindra Starweaver have formed an unlikely friendship that deepens into something more. Their bond challenges the unspoken rule that elves and humans do not intermarry. Both families disapprove.').
narrative_trigger(the_squire_and_the_princess, (relationship(caelindra_starweaver, rowan_thornwall, friends), timestep(T), T > 15)).
narrative_participants(the_squire_and_the_princess, [rowan_thornwall, caelindra_starweaver, thalion_starweaver, aldric_thornwall]).
narrative_outcome(the_squire_and_the_princess, 'The couple either wins acceptance through a shared act of heroism or is forced apart by political pressure. Orin Duskmantle, himself half-elven, serves as a cautionary or hopeful example.').

%% The Forbidden Tome
narrative(the_forbidden_tome, 'The Forbidden Tome', temptation).
narrative_description(the_forbidden_tome, 'Lyraniel Silvershade discovers a hidden grimoire in the Academy archives that promises power beyond anything taught in sanctioned courses. Its knowledge comes at a terrible cost, and Ithrandil senses his student drifting toward darkness.').
narrative_trigger(the_forbidden_tome, (trait(lyraniel_silvershade, ambitious), status(lyraniel_silvershade, restless))).
narrative_participants(the_forbidden_tome, [lyraniel_silvershade, ithrandil_moonwhisper, orin_duskmantle, elowen_starweaver]).
narrative_outcome(the_forbidden_tome, 'Lyraniel either destroys the tome and recommits to sanctioned study, or uses its power and faces exile from Aelindor. The incident forces the Academy to reckon with what it hides.').

%% The Frontier Siege
narrative(the_frontier_siege, 'The Frontier Siege', war).
narrative_description(the_frontier_siege, 'A massive goblin horde, organized under a cunning warlord, besieges Thornhaven. The human garrison cannot hold alone. Sera Blackthorn sends runners to both Aelindor and Khazad Dumrak, but aid is not guaranteed.').
narrative_trigger(the_frontier_siege, (status(thornhaven, under_siege))).
narrative_participants(the_frontier_siege, [sera_blackthorn, aldric_thornwall, gareth_steelheart, rowan_thornwall, dolgrim_stonebeard]).
narrative_outcome(the_frontier_siege, 'If allies arrive, the siege breaks and the alliance is renewed. If help is denied, Thornhaven falls or survives at great cost, and bitterness poisons relations between the races.').
