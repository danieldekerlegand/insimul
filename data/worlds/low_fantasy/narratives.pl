%% Insimul Narratives: Low Fantasy
%% Source: data/worlds/low_fantasy/narratives.pl
%% Created: 2026-04-03
%% Total: 6 narratives
%%
%% Predicate schema:
%%   narrative/3 -- narrative(AtomId, Title, NarrativeType)
%%   narrative_description/2, narrative_trigger/2
%%   narrative_participants/2, narrative_outcome/3

%% The Bailiff Must Fall
narrative(bailiff_must_fall, 'The Bailiff Must Fall', event_chain).
narrative_description(bailiff_must_fall, 'Bailiff Wren has pushed the people of Grimhallow too far. Blackthorn wants the bailiff gone to run his operations freely. The merchants want fair taxes. The player must choose who benefits from the power vacuum.').
narrative_trigger(bailiff_must_fall, (unlocked(lot_lf_15), rumour_heard(_, lot_lf_1))).
narrative_participants(bailiff_must_fall, [bailiff_wren, roderick_blackthorn, aldric_copperton, marta_grieve]).
narrative_outcome(bailiff_must_fall, blackthorn_wins, 'Blackthorn replaces the bailiff with a puppet. Crime flourishes openly.').
narrative_outcome(bailiff_must_fall, merchants_win, 'The merchants petition the duke for a new bailiff. Order improves but slowly.').
narrative_outcome(bailiff_must_fall, wren_survives, 'Wren discovers the plot and punishes all involved. His grip tightens.').

%% The Salt War
narrative(the_salt_war, 'The Salt War', event_chain).
narrative_description(the_salt_war, 'Silas Marsh smuggling operation is threatened by a rival gang from the coast. Open conflict between smuggler factions could spill into Grimhallow, cut off the salt supply, and starve the region during winter.').
narrative_trigger(the_salt_war, (ambush_set(_, _), status(silas_marsh, smuggler_kingpin))).
narrative_participants(the_salt_war, [silas_marsh, veska, nils_inkblot, roderick_blackthorn]).
narrative_outcome(the_salt_war, marsh_wins, 'Silas Marsh crushes the rival gang. His monopoly strengthens. Prices rise.').
narrative_outcome(the_salt_war, rival_wins, 'The rival gang takes Saltmire. New management, same corruption, different faces.').
narrative_outcome(the_salt_war, truce, 'A brutal truce splits the coast. Salt flows but violence simmers beneath the surface.').

%% The Nobles Return
narrative(nobles_return, 'The Nobles Return', event_chain).
narrative_description(nobles_return, 'Lord Edric Vane has gathered enough allies and forged documents to make a claim for his ancestral lands. His bid could bring legitimate authority to the Ashenmarch or paint a target on everyone who helped him.').
narrative_trigger(nobles_return, (status(edric_vane, hidden_noble), has_item(edric_vane, forged_trade_permit, _))).
narrative_participants(nobles_return, [edric_vane, nils_inkblot, bailiff_wren, jorik_hale]).
narrative_outcome(nobles_return, claim_succeeds, 'Vane reclaims his title. He brings order but also the feudal system that dispossessed others.').
narrative_outcome(nobles_return, claim_fails, 'The duke rejects the claim. Vane is hunted. Those who helped him face reprisal.').
narrative_outcome(nobles_return, vane_betrayed, 'Someone sells Vane out for coin. He is captured and executed publicly.').

%% The Witch Trial
narrative(the_witch_trial, 'The Witch Trial', event_chain).
narrative_description(the_witch_trial, 'Bailiff Wren accuses Old Mag of witchcraft to seize her property and silence her knowledge. Brenna Ashwood could be next. The town must decide whether superstition or pragmatism wins the day.').
narrative_trigger(the_witch_trial, (status(old_mag, hedge_witch), status(bailiff_wren, bailiff))).
narrative_participants(the_witch_trial, [old_mag, brenna_ashwood, bailiff_wren, sister_ashara]).
narrative_outcome(the_witch_trial, mag_saved, 'The player exposes Wren motive. Old Mag is freed. The bailiff is humiliated.').
narrative_outcome(the_witch_trial, mag_hanged, 'Old Mag hangs at Gallows Square. Brenna flees. The town loses its only healers.').
narrative_outcome(the_witch_trial, magic_revealed, 'During the trial, Mag demonstrates genuine power. The crowd recoils. Nothing is the same.').

%% Winter Siege
narrative(winter_siege, 'Winter Siege', event_chain).
narrative_description(winter_siege, 'The harshest winter in memory descends. Roads are blocked. Thornfield is cut off from Grimhallow. Wolves grow bold. Bandits grow desperate. Captain Jorik Hale demands more coin to keep the Iron Thorn Company from leaving.').
narrative_trigger(winter_siege, (employed(veska, _), rumour_heard(_, lot_lf_17))).
narrative_participants(winter_siege, [jorik_hale, tilda_harrow, colm_harrow, brenna_ashwood]).
narrative_outcome(winter_siege, community_survives, 'The village bands together. Losses are heavy but Thornfield endures.').
narrative_outcome(winter_siege, mercenaries_leave, 'Jorik pulls his company out. The village is defenceless. Bandits overrun the farms.').
narrative_outcome(winter_siege, desperate_bargain, 'Thornfield makes a deal with Roderick Blackthorn for protection at a terrible price.').

%% The Copperton Debt
narrative(copperton_debt, 'The Copperton Debt', event_chain).
narrative_description(copperton_debt, 'Aldric Copperton owes money to both Blackthorn and the bailiff. One demands repayment in service, the other in coin. Caught between two predators, Aldric will sell his shop, his family, or his soul to escape.').
narrative_trigger(copperton_debt, (relationship(aldric_copperton, roderick_blackthorn, owes_debt), intimidated(aldric_copperton, _))).
narrative_participants(copperton_debt, [aldric_copperton, roderick_blackthorn, bailiff_wren, hilda_roth]).
narrative_outcome(copperton_debt, aldric_freed, 'The player clears Aldric debt through a smuggling scheme or theft. He keeps his shop.').
narrative_outcome(copperton_debt, aldric_bonded, 'Aldric is sold into debt bondage. His shop is seized. The Narrows loses its only honest merchant.').
narrative_outcome(copperton_debt, aldric_flees, 'Aldric vanishes in the night, leaving debts and enemies behind. Someone must answer for them.').
