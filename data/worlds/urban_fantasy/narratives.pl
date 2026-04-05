%% Insimul Narratives: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_step/3 -- narrative_step(NarrativeAtom, StepIndex, StepContent)
%%   narrative_faction/2, narrative_location/2

%% The Compact Unravels
narrative(the_compact_unravels, 'The Compact Unravels', main_arc).
narrative_description(the_compact_unravels, 'The 1847 Founding Compact that holds the factions together is showing cracks. Someone is working to dissolve it.').
narrative_faction(the_compact_unravels, all).
narrative_location(the_compact_unravels, veilhaven).
narrative_trigger(the_compact_unravels, (timestep(T), T > 5)).
narrative_step(the_compact_unravels, 0, 'Rumors spread that one of the founding families wants to renegotiate the Compact.').
narrative_step(the_compact_unravels, 1, 'A copy of the original Compact goes missing from the Blackwood Library.').
narrative_step(the_compact_unravels, 2, 'Faction tensions escalate as accusations fly at the Council of Shadows.').
narrative_step(the_compact_unravels, 3, 'The player must find the stolen Compact and identify the faction trying to rewrite it.').
narrative_step(the_compact_unravels, 4, 'Confrontation at the Briar Hollow -- the truth is revealed under the thin Veil.').

%% Blood in the Water
narrative(blood_in_the_water, 'Blood in the Water', faction_arc).
narrative_description(blood_in_the_water, 'A rogue vampire is hunting in the Docklands, threatening the truce between the Aldermere Conclave and the Docklands Pack.').
narrative_faction(blood_in_the_water, aldermere_conclave).
narrative_faction(blood_in_the_water, docklands_pack).
narrative_location(blood_in_the_water, veilhaven).
narrative_trigger(blood_in_the_water, (relationship(marcus_reyes, victor_aldermere, R), R \= respectful)).
narrative_step(blood_in_the_water, 0, 'Dockworkers report strange bite marks. Marcus Reyes begins investigating.').
narrative_step(blood_in_the_water, 1, 'Evidence points to the Aldermere Conclave. Victor denies involvement.').
narrative_step(blood_in_the_water, 2, 'The player discovers the rogue vampire is Lila Vasquez, struggling with her new nature.').
narrative_step(blood_in_the_water, 3, 'Choose: help Lila control her hunger, or expose her to both factions.').

%% The Wild Hunt
narrative(the_wild_hunt, 'The Wild Hunt', faction_arc).
narrative_description(the_wild_hunt, 'The Unseelie Court is preparing a Wild Hunt through the streets of Veilhaven, which would shatter the Veil completely.').
narrative_faction(the_wild_hunt, unseelie_court).
narrative_faction(the_wild_hunt, seelie_court).
narrative_location(the_wild_hunt, veilhaven).
narrative_trigger(the_wild_hunt, (relationship(morrigan_blackthorn, rowan_ashwood, R), R == hostile)).
narrative_step(the_wild_hunt, 0, 'Strange fae creatures are spotted in the Old Quarter after midnight.').
narrative_step(the_wild_hunt, 1, 'Morrigan Blackthorn issues a challenge to Rowan Ashwood at The Black Thorn.').
narrative_step(the_wild_hunt, 2, 'The player must gather allies from all factions to prevent the Hunt.').
narrative_step(the_wild_hunt, 3, 'The Wild Hunt begins at the Briarwood crossing. Stop it or the Veil falls.').

%% Ivory Tower
narrative(ivory_tower, 'Ivory Tower', side_arc).
narrative_description(ivory_tower, 'Dr. Okonkwo discovers that Veilhaven University was built on a ley line nexus and someone is siphoning its energy.').
narrative_faction(ivory_tower, unaffiliated).
narrative_location(ivory_tower, veilhaven).
narrative_trigger(ivory_tower, (attribute(sable_okonkwo, cultural_knowledge, K), K > 85)).
narrative_step(ivory_tower, 0, 'Strange power fluctuations affect magical devices across University Hill.').
narrative_step(ivory_tower, 1, 'Dr. Okonkwo asks the player to help investigate the restricted archives.').
narrative_step(ivory_tower, 2, 'A hidden chamber beneath the Bell Tower contains an ancient siphoning device.').
narrative_step(ivory_tower, 3, 'Trace the siphon back to its creator and decide what to do with the stored energy.').

%% The New Blood
narrative(the_new_blood, 'The New Blood', character_arc).
narrative_description(the_new_blood, 'Lila Vasquez was turned against her will and is torn between her human past and vampire future. Her journalist instincts threaten the Masquerade.').
narrative_faction(the_new_blood, aldermere_conclave).
narrative_location(the_new_blood, veilhaven).
narrative_trigger(the_new_blood, (trait(lila_vasquez, conflicted))).
narrative_step(the_new_blood, 0, 'Lila confides in the player about her unwilling transformation.').
narrative_step(the_new_blood, 1, 'She has been secretly writing an expose on supernatural Veilhaven.').
narrative_step(the_new_blood, 2, 'Victor Aldermere discovers her notes and demands the player intervene.').
narrative_step(the_new_blood, 3, 'Choose: help Lila publish (breaking the Masquerade) or convince her to destroy the article.').

%% Undermarket Rising
narrative(undermarket_rising, 'Undermarket Rising', side_arc).
narrative_description(undermarket_rising, 'Nyx is consolidating power in the Underreach and building a shadow faction that answers to no one on the Council.').
narrative_faction(undermarket_rising, unaffiliated).
narrative_location(undermarket_rising, underreach).
narrative_trigger(undermarket_rising, (attribute(nyx, cunningness, C), C > 90)).
narrative_step(undermarket_rising, 0, 'Prices at the Waystation market become unpredictable. Nyx is cornering supply.').
narrative_step(undermarket_rising, 1, 'Several minor supernatural beings swear allegiance to Nyx.').
narrative_step(undermarket_rising, 2, 'The Council of Shadows demands the player investigate the Underreach power shift.').
narrative_step(undermarket_rising, 3, 'Confront Nyx at Gate 13 -- negotiate, fight, or join the new faction.').
