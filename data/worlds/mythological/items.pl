%% Insimul Items: Greek Mythological World
%% Source: data/worlds/mythological/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Golden Fleece
item(golden_fleece, 'Golden Fleece', artifact).
item_description(golden_fleece, 'The legendary fleece of the winged ram Chrysomallos. It radiates divine power and grants protection to its bearer.').
item_value(golden_fleece, 1000).
item_sell_value(golden_fleece, 500).
item_weight(golden_fleece, 3).
item_rarity(golden_fleece, legendary).
item_category(golden_fleece, artifact).
item_possessable(golden_fleece).
item_tag(golden_fleece, divine).
item_tag(golden_fleece, quest_item).

%% Ambrosia
item(ambrosia, 'Ambrosia', consumable).
item_description(ambrosia, 'Food of the gods. Consuming even a small portion heals wounds and restores vitality beyond mortal limits.').
item_value(ambrosia, 200).
item_sell_value(ambrosia, 100).
item_weight(ambrosia, 0.5).
item_rarity(ambrosia, legendary).
item_category(ambrosia, food_drink).
item_stackable(ambrosia).
item_possessable(ambrosia).
item_tag(ambrosia, divine).
item_tag(ambrosia, healing).

%% Nectar of the Gods
item(nectar_divine, 'Nectar of the Gods', consumable).
item_description(nectar_divine, 'The divine drink of Olympus. A single sip fills a mortal with euphoria and temporary supernatural strength.').
item_value(nectar_divine, 180).
item_sell_value(nectar_divine, 90).
item_weight(nectar_divine, 0.3).
item_rarity(nectar_divine, legendary).
item_category(nectar_divine, food_drink).
item_stackable(nectar_divine).
item_possessable(nectar_divine).
item_tag(nectar_divine, divine).
item_tag(nectar_divine, beverage).

%% Trident of the Deep
item(trident_of_the_deep, 'Trident of the Deep', weapon).
item_description(trident_of_the_deep, 'A bronze trident blessed by Poseidon. It commands the tides and strikes with the force of crashing waves.').
item_value(trident_of_the_deep, 500).
item_sell_value(trident_of_the_deep, 250).
item_weight(trident_of_the_deep, 5).
item_rarity(trident_of_the_deep, epic).
item_category(trident_of_the_deep, weapon).
item_possessable(trident_of_the_deep).
item_tag(trident_of_the_deep, divine).
item_tag(trident_of_the_deep, weapon).

%% Aegis Shield
item(aegis_shield, 'Aegis Shield', equipment).
item_description(aegis_shield, 'A shield bearing the face of Medusa, forged under the guidance of Athena. It strikes terror into enemies.').
item_value(aegis_shield, 600).
item_sell_value(aegis_shield, 300).
item_weight(aegis_shield, 8).
item_rarity(aegis_shield, legendary).
item_category(aegis_shield, armor).
item_possessable(aegis_shield).
item_tag(aegis_shield, divine).
item_tag(aegis_shield, armor).

%% Lyre of Orpheus
item(lyre_of_orpheus, 'Lyre of Orpheus', tool).
item_description(lyre_of_orpheus, 'A seven-stringed lyre whose music can charm beasts, move stones, and sway the hearts of gods and mortals alike.').
item_value(lyre_of_orpheus, 400).
item_sell_value(lyre_of_orpheus, 200).
item_weight(lyre_of_orpheus, 2).
item_rarity(lyre_of_orpheus, epic).
item_category(lyre_of_orpheus, instrument).
item_possessable(lyre_of_orpheus).
item_tag(lyre_of_orpheus, magical).
item_tag(lyre_of_orpheus, musical).

%% Helm of Darkness
item(helm_of_darkness, 'Helm of Darkness', equipment).
item_description(helm_of_darkness, 'The cap of invisibility forged by the Cyclopes for Hades. Its wearer vanishes from mortal and divine sight.').
item_value(helm_of_darkness, 800).
item_sell_value(helm_of_darkness, 400).
item_weight(helm_of_darkness, 2).
item_rarity(helm_of_darkness, legendary).
item_category(helm_of_darkness, armor).
item_possessable(helm_of_darkness).
item_tag(helm_of_darkness, divine).
item_tag(helm_of_darkness, stealth).

%% Bronze Xiphos
item(bronze_xiphos, 'Bronze Xiphos', weapon).
item_description(bronze_xiphos, 'A double-edged short sword of polished bronze. The standard weapon of Greek warriors.').
item_value(bronze_xiphos, 30).
item_sell_value(bronze_xiphos, 15).
item_weight(bronze_xiphos, 3).
item_rarity(bronze_xiphos, common).
item_category(bronze_xiphos, weapon).
item_tradeable(bronze_xiphos).
item_possessable(bronze_xiphos).
item_tag(bronze_xiphos, weapon).
item_tag(bronze_xiphos, martial).

%% Olive Wreath
item(olive_wreath, 'Olive Wreath', accessory).
item_description(olive_wreath, 'A crown of olive branches awarded to victors in athletic contests. A symbol of honor and achievement.').
item_value(olive_wreath, 20).
item_sell_value(olive_wreath, 10).
item_weight(olive_wreath, 0.2).
item_rarity(olive_wreath, uncommon).
item_category(olive_wreath, accessory).
item_tradeable(olive_wreath).
item_possessable(olive_wreath).
item_tag(olive_wreath, honor).
item_tag(olive_wreath, cultural).

%% Laurel Crown
item(laurel_crown, 'Laurel Crown', accessory).
item_description(laurel_crown, 'A wreath of laurel leaves sacred to Apollo. Worn by poets, prophets, and those who have earned divine favor.').
item_value(laurel_crown, 25).
item_sell_value(laurel_crown, 12).
item_weight(laurel_crown, 0.2).
item_rarity(laurel_crown, uncommon).
item_category(laurel_crown, accessory).
item_tradeable(laurel_crown).
item_possessable(laurel_crown).
item_tag(laurel_crown, divine).
item_tag(laurel_crown, cultural).

%% Vial of Styx Water
item(styx_water, 'Vial of Styx Water', consumable).
item_description(styx_water, 'Water drawn from the River Styx. Even the gods swear binding oaths upon it. Grants temporary invulnerability.').
item_value(styx_water, 300).
item_sell_value(styx_water, 150).
item_weight(styx_water, 0.3).
item_rarity(styx_water, epic).
item_category(styx_water, potion).
item_stackable(styx_water).
item_possessable(styx_water).
item_tag(styx_water, divine).
item_tag(styx_water, underworld).

%% Winged Sandals
item(winged_sandals, 'Winged Sandals', equipment).
item_description(winged_sandals, 'Sandals with golden wings, like those of Hermes. They grant the wearer the power of flight.').
item_value(winged_sandals, 350).
item_sell_value(winged_sandals, 175).
item_weight(winged_sandals, 1).
item_rarity(winged_sandals, epic).
item_category(winged_sandals, armor).
item_possessable(winged_sandals).
item_tag(winged_sandals, divine).
item_tag(winged_sandals, mobility).

%% Clay Amphora of Wine
item(wine_amphora, 'Clay Amphora of Wine', consumable).
item_description(wine_amphora, 'A large clay vessel of dark red wine. Essential for offerings, feasts, and libations to the gods.').
item_value(wine_amphora, 8).
item_sell_value(wine_amphora, 4).
item_weight(wine_amphora, 5).
item_rarity(wine_amphora, common).
item_category(wine_amphora, food_drink).
item_stackable(wine_amphora).
item_tradeable(wine_amphora).
item_possessable(wine_amphora).
item_tag(wine_amphora, offering).
item_tag(wine_amphora, beverage).

%% Sacrificial Lamb
item(sacrificial_lamb, 'Sacrificial Lamb', offering).
item_description(sacrificial_lamb, 'A white lamb without blemish, prepared for ritual sacrifice to appease or honor the gods.').
item_value(sacrificial_lamb, 15).
item_sell_value(sacrificial_lamb, 8).
item_weight(sacrificial_lamb, 10).
item_rarity(sacrificial_lamb, common).
item_category(sacrificial_lamb, offering).
item_tradeable(sacrificial_lamb).
item_possessable(sacrificial_lamb).
item_tag(sacrificial_lamb, offering).
item_tag(sacrificial_lamb, ritual).

%% Thread of Ariadne
item(thread_of_ariadne, 'Thread of Ariadne', tool).
item_description(thread_of_ariadne, 'An enchanted spool of golden thread. Unraveling it marks a safe path through any maze or labyrinth.').
item_value(thread_of_ariadne, 100).
item_sell_value(thread_of_ariadne, 50).
item_weight(thread_of_ariadne, 0.2).
item_rarity(thread_of_ariadne, rare).
item_category(thread_of_ariadne, tool).
item_possessable(thread_of_ariadne).
item_tag(thread_of_ariadne, magical).
item_tag(thread_of_ariadne, quest_item).

%% Prophecy Tablet
item(prophecy_tablet, 'Prophecy Tablet', tool).
item_description(prophecy_tablet, 'A clay tablet inscribed with cryptic oracle verses. Its meaning becomes clear only when the foretold events unfold.').
item_value(prophecy_tablet, 50).
item_sell_value(prophecy_tablet, 25).
item_weight(prophecy_tablet, 1).
item_rarity(prophecy_tablet, rare).
item_category(prophecy_tablet, scroll).
item_tradeable(prophecy_tablet).
item_possessable(prophecy_tablet).
item_tag(prophecy_tablet, oracle).
item_tag(prophecy_tablet, knowledge).

%% Celestial Bronze Ingot
item(celestial_bronze, 'Celestial Bronze Ingot', material).
item_description(celestial_bronze, 'A bar of divinely forged bronze, harder than any mortal metal. Used to craft weapons capable of harming supernatural beings.').
item_value(celestial_bronze, 75).
item_sell_value(celestial_bronze, 40).
item_weight(celestial_bronze, 4).
item_rarity(celestial_bronze, rare).
item_category(celestial_bronze, material).
item_tradeable(celestial_bronze).
item_possessable(celestial_bronze).
item_tag(celestial_bronze, crafting).
item_tag(celestial_bronze, divine).

%% Moly Herb
item(moly_herb, 'Moly Herb', consumable).
item_description(moly_herb, 'A rare white-flowered herb with a black root. It protects against enchantments and magical transformations.').
item_value(moly_herb, 60).
item_sell_value(moly_herb, 30).
item_weight(moly_herb, 0.1).
item_rarity(moly_herb, rare).
item_category(moly_herb, potion).
item_stackable(moly_herb).
item_possessable(moly_herb).
item_tag(moly_herb, magical).
item_tag(moly_herb, protection).
