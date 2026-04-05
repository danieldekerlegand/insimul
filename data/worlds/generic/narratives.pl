%% Insimul Narratives: Generic Fantasy World
%% Source: data/worlds/generic/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_participants/2, narrative_outcome/2

%% The Bandit Threat
narrative(the_bandit_threat, 'The Bandit Threat', conflict).
narrative_description(the_bandit_threat, 'A band of outlaws has been raiding caravans on the road between Stonehaven and Willowmere. The guard captain calls for volunteers to track them down before winter trade is strangled.').
narrative_trigger(the_bandit_threat, (status(road_to_willowmere, unsafe))).
narrative_participants(the_bandit_threat, [renna_marsh, mira_aldric, gareth_aldric]).
narrative_outcome(the_bandit_threat, 'The bandits are driven off or destroyed, restoring safe travel. Participants gain respect and the gratitude of local merchants.').

%% The Merchant Feud
narrative(the_merchant_feud, 'The Merchant Feud', intrigue).
narrative_description(the_merchant_feud, 'Cedric Voss accuses Bram Thorne of watering down ale to undercut his wine imports. The dispute threatens to split the town into factions and disrupt market day.').
narrative_trigger(the_merchant_feud, (relationship(cedric_voss, bram_thorne, rivals))).
narrative_participants(the_merchant_feud, [cedric_voss, bram_thorne, mathilde_voss, wren_thorne]).
narrative_outcome(the_merchant_feud, 'The elder council mediates the dispute. Depending on the outcome, one merchant gains dominance or a fragile truce is struck.').

%% The Missing Shepherd
narrative(the_missing_shepherd, 'The Missing Shepherd', mystery).
narrative_description(the_missing_shepherd, 'Young Cole Ashwood goes missing while tending sheep in the highland pastures. His family fears wolves, but strange tracks suggest something more unusual is at work.').
narrative_trigger(the_missing_shepherd, (status(cole_ashwood, missing))).
narrative_participants(the_missing_shepherd, [cole_ashwood, hale_ashwood, brynn_ashwood, ivy_ashwood]).
narrative_outcome(the_missing_shepherd, 'Cole is found sheltering in an ancient ruin. The discovery hints at forgotten tunnels beneath the hills, opening new exploration possibilities.').

%% The Wandering Healer
narrative(the_wandering_healer, 'The Wandering Healer', social).
narrative_description(the_wandering_healer, 'A mysterious healer arrives in Stonehaven offering cures for ailments that have plagued the town. Some welcome the stranger, while others suspect dark magic.').
narrative_trigger(the_wandering_healer, (timestep(T), T > 10)).
narrative_participants(the_wandering_healer, [elara_aldric, brother_aldwin, liora_voss]).
narrative_outcome(the_wandering_healer, 'The healer proves genuine, teaching Elara new techniques. Alternatively, suspicions prove founded and the stranger must be confronted.').

%% The Apprentice Trial
narrative(the_apprentice_trial, 'The Apprentice Trial', coming_of_age).
narrative_description(the_apprentice_trial, 'Rowan Aldric must complete his masterwork at the forge to earn full guild membership. His father Gareth sets a demanding standard, and failure would shame the family.').
narrative_trigger(the_apprentice_trial, (trait(rowan_aldric, ambitious), status(rowan_aldric, apprentice))).
narrative_participants(the_apprentice_trial, [rowan_aldric, gareth_aldric, sera_thorne]).
narrative_outcome(the_apprentice_trial, 'Rowan forges a blade that earns guild acceptance. The experience either strengthens or strains his relationship with his father.').

%% Harvest Moon Festival
narrative(harvest_moon_festival, 'The Harvest Moon Festival', celebration).
narrative_description(harvest_moon_festival, 'The annual harvest festival brings all settlements together. Competitions, feasting, and courtship dances fill the week. Old grudges may surface or be set aside in the revelry.').
narrative_trigger(harvest_moon_festival, (season(autumn))).
narrative_participants(harvest_moon_festival, [bram_thorne, sera_thorne, finn_thorne, mira_aldric, ivy_ashwood]).
narrative_outcome(harvest_moon_festival, 'New alliances form through the festivities. A surprise announcement or event changes the social landscape of the realm.').
