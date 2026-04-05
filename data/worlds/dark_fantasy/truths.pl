%% Insimul Truths: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/truths.pl
%% Created: 2026-04-03
%% Total: 18 truths
%%
%% Predicate schema:
%%   truth/3 -- truth(AtomId, Title, EntryType)
%%   truth_content/2, truth_importance/2, truth_timestep/2

%% The Undying Curse
truth(the_undying_curse, 'The Undying Curse', world_law).
truth_content(the_undying_curse, 'A dark blight known as the Undying Curse saturates the land. Those who die within the cursed territories do not rest -- their bodies rise again within three nights unless ritually purified with sanctified ash and silver.').
truth_importance(the_undying_curse, 10).
truth_timestep(the_undying_curse, 0).

%% Hierarchy of the Undead
truth(undead_hierarchy, 'Hierarchy of the Undead', world_law).
truth_content(undead_hierarchy, 'The undead exist in a strict hierarchy. Mindless thralls serve wights, wights serve revenants, revenants serve liches. Lord Varek Draven sits at the apex as a lich-lord. Higher undead retain intellect and memory; lower ones are feral husks.').
truth_importance(undead_hierarchy, 9).
truth_timestep(undead_hierarchy, 0).

%% Dark Magic Source
truth(dark_magic_source, 'The Wellspring of Ruin', world_law).
truth_content(dark_magic_source, 'All dark magic in the cursed lands draws from the Wellspring of Ruin, a rift beneath Gravenhold where raw necrotic energy seeps into the world. Proximity to the Wellspring amplifies both curses and the power of undead creatures.').
truth_importance(dark_magic_source, 10).
truth_timestep(dark_magic_source, 0).

%% The Plague
truth(the_ashrot_plague, 'The Ashrot Plague', threat).
truth_content(the_ashrot_plague, 'Ashrot is a supernatural plague that turns living flesh gray and brittle before killing the host. It spreads through contact with cursed water and tainted soil. Plague doctors use herbal fumigants and leeching salts, but no permanent cure exists.').
truth_importance(the_ashrot_plague, 9).
truth_timestep(the_ashrot_plague, 0).

%% Sanctified Ash
truth(sanctified_ash, 'Sanctified Ash', world_law).
truth_content(sanctified_ash, 'Ash gathered from consecrated pyres and blessed by clergy can repel lesser undead, purify tainted water, and slow the Ashrot plague. It is the most valuable commodity in the cursed lands and is hoarded by the Cathedral of Ashes.').
truth_importance(sanctified_ash, 8).
truth_timestep(sanctified_ash, 0).

%% Silver Weakness
truth(silver_weakness, 'Silver Burns the Dead', world_law).
truth_content(silver_weakness, 'Silver is anathema to undead flesh. Weapons edged or tipped with silver deal grievous wounds to all undead. Even a silver coin pressed to a thralls forehead will cause it to recoil. Silver is scarce and strictly rationed.').
truth_importance(silver_weakness, 8).
truth_timestep(silver_weakness, 0).

%% The Black Throne Pact
truth(black_throne_pact, 'The Black Throne Pact', political_truth).
truth_content(black_throne_pact, 'Lord Varek Draven maintains a fragile non-aggression pact with Ashenvale. He refrains from sending his legions against the town in exchange for tribute -- living souls delivered monthly by desperate leaders who tell no one the full cost.').
truth_importance(black_throne_pact, 9).
truth_timestep(black_throne_pact, 0).

%% Corruption Mechanic
truth(corruption_mechanic, 'Soul Corruption', world_law).
truth_content(corruption_mechanic, 'Prolonged exposure to dark magic or the Wellspring corrupts the soul. Corruption is measured from 0 to 100. At 50, the afflicted hears whispers from the dead. At 75, they gain necrotic power but lose empathy. At 100, they become undead.').
truth_importance(corruption_mechanic, 10).
truth_timestep(corruption_mechanic, 0).

%% Fear as Currency
truth(fear_as_currency, 'Fear as Currency', cultural_norm).
truth_content(fear_as_currency, 'In the cursed lands, fear is a tangible force. Undead lords feed on mortal terror to sustain their power. Brave acts physically weaken nearby undead, while widespread panic strengthens them. Courage is both virtue and weapon.').
truth_importance(fear_as_currency, 8).
truth_timestep(fear_as_currency, 0).

%% The Veil Between Worlds
truth(the_veil, 'The Thinning Veil', world_law).
truth_content(the_veil, 'The barrier between the living world and the realm of the dead is dangerously thin in the cursed lands. Spirits can be seen at crossroads at dusk. Necromancers exploit this thinness; exorcists work to seal the breaches.').
truth_importance(the_veil, 7).
truth_timestep(the_veil, 0).

%% Exorcism Rites
truth(exorcism_rites, 'Rites of Exorcism', cultural_norm).
truth_content(exorcism_rites, 'Exorcism requires three components: sanctified ash drawn in a binding circle, a silver implement to anchor the spirit, and spoken prayers in the Old Tongue. Failed exorcisms can bind the exorcist to the spirit instead.').
truth_importance(exorcism_rites, 8).
truth_timestep(exorcism_rites, 0).

%% Necromancy Prohibition
truth(necromancy_ban, 'Necromancy Prohibition', political_truth).
truth_content(necromancy_ban, 'Ashenvale and Hollowmere have declared necromancy punishable by exile to the Blighted Wastes -- effectively a death sentence. Despite this, secret practitioners exist, arguing that understanding dark magic is the only path to defeating it.').
truth_importance(necromancy_ban, 7).
truth_timestep(necromancy_ban, 0).

%% The Ashen Vigil
truth(ashen_vigil, 'The Ashen Vigil', cultural_norm).
truth_content(ashen_vigil, 'Every night, watchers called the Ashen Vigil patrol settlement walls carrying silver-tipped spears and censers of burning ash. Missing a single night of vigil has historically resulted in undead breaching the walls by dawn.').
truth_importance(ashen_vigil, 7).
truth_timestep(ashen_vigil, 0).

%% Hollowmere Swamp Magic
truth(swamp_magic, 'Hollowmere Swamp Magic', world_law).
truth_content(swamp_magic, 'The swamps of Hollowmere contain ancient wards predating the curse. Morwen Greymist and other hedge witches maintain these wards using blood offerings and herbal rituals. The wards keep the worst undead out but attract restless spirits.').
truth_importance(swamp_magic, 7).
truth_timestep(swamp_magic, 0).

%% The Burned Calendar
truth(burned_calendar, 'The Burned Calendar', cultural_norm).
truth_content(burned_calendar, 'Time is measured from the Night of Burning, when the curse first fell. The current year is 47 After Burning (AB). Few written records survive from before the curse. Oral histories are unreliable and often contradictory.').
truth_importance(burned_calendar, 6).
truth_timestep(burned_calendar, 0).

%% Undead Memory Retention
truth(undead_memory, 'Undead Memory Retention', world_law).
truth_content(undead_memory, 'Higher undead such as revenants and liches retain memories from life, which makes them both more dangerous and more tragic. Edric Holloway remembers serving alongside Aldric Voss. Some revenants weep for what they have lost.').
truth_importance(undead_memory, 7).
truth_timestep(undead_memory, 0).

%% Blight Zones
truth(blight_zones, 'Blight Zones', threat).
truth_content(blight_zones, 'Areas of intense corruption called Blight Zones dot the landscape. Plants wither, water turns black, and the air itself becomes toxic. Entering without protection guarantees Ashrot infection within hours. The zones are slowly expanding.').
truth_importance(blight_zones, 8).
truth_timestep(blight_zones, 0).

%% The Old Tongue
truth(the_old_tongue, 'The Old Tongue', world_law).
truth_content(the_old_tongue, 'The Old Tongue is a dead language that predates the curse. It is the only language in which binding prayers and exorcism rites function. Only clergy and scholars know fragments of it. Complete fluency may hold the key to ending the curse.').
truth_importance(the_old_tongue, 8).
truth_timestep(the_old_tongue, 0).
