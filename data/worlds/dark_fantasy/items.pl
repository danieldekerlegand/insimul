%% Insimul Items: Dark Fantasy Cursed Lands
%% Source: data/worlds/dark_fantasy/items.pl
%% Created: 2026-04-03
%% Total: 18 items
%%
%% Predicate schema:
%%   item/3 -- item(AtomId, Name, ItemType)
%%   item_description/2, item_value/2, item_sell_value/2, item_weight/2
%%   item_rarity/2, item_category/2, item_tag/2
%%   item_stackable/1, item_tradeable/1, item_possessable/1

%% Cursed Blade
item(cursed_blade, 'Cursed Blade', weapon).
item_description(cursed_blade, 'A dark iron sword that whispers to its wielder. It cuts deeper against the living but slowly drains the soul of whoever carries it.').
item_value(cursed_blade, 120).
item_sell_value(cursed_blade, 60).
item_weight(cursed_blade, 4).
item_rarity(cursed_blade, rare).
item_category(cursed_blade, weapon).
item_tradeable(cursed_blade).
item_possessable(cursed_blade).
item_tag(cursed_blade, cursed).
item_tag(cursed_blade, melee).

%% Silver Blade
item(silver_blade, 'Silver Blade', weapon).
item_description(silver_blade, 'A short sword edged with sanctified silver. Effective against undead and corrupted creatures.').
item_value(silver_blade, 80).
item_sell_value(silver_blade, 40).
item_weight(silver_blade, 3).
item_rarity(silver_blade, uncommon).
item_category(silver_blade, weapon).
item_tradeable(silver_blade).
item_possessable(silver_blade).
item_tag(silver_blade, holy).
item_tag(silver_blade, melee).

%% Soul Gem (Corrupted)
item(soul_gem_corrupted, 'Soul Gem (Corrupted)', material).
item_description(soul_gem_corrupted, 'A dark crystal pulsing with trapped spirit energy. Used in necromantic rituals and dark enchantments.').
item_value(soul_gem_corrupted, 200).
item_sell_value(soul_gem_corrupted, 100).
item_weight(soul_gem_corrupted, 0.5).
item_rarity(soul_gem_corrupted, rare).
item_category(soul_gem_corrupted, arcane).
item_tradeable(soul_gem_corrupted).
item_possessable(soul_gem_corrupted).
item_tag(soul_gem_corrupted, dark_magic).
item_tag(soul_gem_corrupted, crafting).

%% Soul Gem (Purified)
item(soul_gem_purified, 'Soul Gem (Purified)', material).
item_description(soul_gem_purified, 'A radiant crystal cleansed of corruption. The freed soul within grants protection against dark magic.').
item_value(soul_gem_purified, 250).
item_sell_value(soul_gem_purified, 150).
item_weight(soul_gem_purified, 0.5).
item_rarity(soul_gem_purified, rare).
item_category(soul_gem_purified, arcane).
item_tradeable(soul_gem_purified).
item_possessable(soul_gem_purified).
item_tag(soul_gem_purified, holy).
item_tag(soul_gem_purified, crafting).

%% Plague Mask
item(plague_mask, 'Plague Mask', equipment).
item_description(plague_mask, 'A beaked leather mask stuffed with aromatic herbs. Filters the corrupted air of the Plague Quarter and marks the wearer as a healer.').
item_value(plague_mask, 35).
item_sell_value(plague_mask, 18).
item_weight(plague_mask, 1).
item_rarity(plague_mask, uncommon).
item_category(plague_mask, armor).
item_possessable(plague_mask).
item_tradeable(plague_mask).
item_tag(plague_mask, protection).
item_tag(plague_mask, medical).

%% Eldritch Tome
item(eldritch_tome, 'Eldritch Tome', tool).
item_description(eldritch_tome, 'A leather-bound grimoire written in a dead language. Reading it grants dark knowledge but risks madness.').
item_value(eldritch_tome, 300).
item_sell_value(eldritch_tome, 150).
item_weight(eldritch_tome, 2).
item_rarity(eldritch_tome, legendary).
item_category(eldritch_tome, arcane).
item_possessable(eldritch_tome).
item_tag(eldritch_tome, dark_magic).
item_tag(eldritch_tome, knowledge).

%% Sanctified Salt
item(sanctified_salt, 'Sanctified Salt', consumable).
item_description(sanctified_salt, 'Coarse salt blessed by the Prior. Creates barriers that repel undead and breaks minor hexes when scattered.').
item_value(sanctified_salt, 10).
item_sell_value(sanctified_salt, 5).
item_weight(sanctified_salt, 0.5).
item_rarity(sanctified_salt, common).
item_category(sanctified_salt, holy).
item_stackable(sanctified_salt).
item_tradeable(sanctified_salt).
item_possessable(sanctified_salt).
item_tag(sanctified_salt, holy).
item_tag(sanctified_salt, ritual).

%% Blight Remedy
item(blight_remedy, 'Blight Remedy', consumable).
item_description(blight_remedy, 'A bitter herbal tincture that slows the progression of plague corruption. Does not cure, only delays.').
item_value(blight_remedy, 15).
item_sell_value(blight_remedy, 8).
item_weight(blight_remedy, 0.3).
item_rarity(blight_remedy, common).
item_category(blight_remedy, medical).
item_stackable(blight_remedy).
item_tradeable(blight_remedy).
item_possessable(blight_remedy).
item_tag(blight_remedy, medical).
item_tag(blight_remedy, consumable).

%% Warding Candle
item(warding_candle, 'Warding Candle', consumable).
item_description(warding_candle, 'A black wax candle inscribed with protective sigils. When lit, creates a small zone safe from spectral intrusion.').
item_value(warding_candle, 20).
item_sell_value(warding_candle, 10).
item_weight(warding_candle, 0.3).
item_rarity(warding_candle, uncommon).
item_category(warding_candle, holy).
item_stackable(warding_candle).
item_tradeable(warding_candle).
item_possessable(warding_candle).
item_tag(warding_candle, protection).
item_tag(warding_candle, ritual).

%% Bone Charm
item(bone_charm, 'Bone Charm', accessory).
item_description(bone_charm, 'A small fetish carved from human bone. Grants the wearer resistance to fear but attracts the attention of the dead.').
item_value(bone_charm, 40).
item_sell_value(bone_charm, 20).
item_weight(bone_charm, 0.1).
item_rarity(bone_charm, uncommon).
item_category(bone_charm, accessory).
item_tradeable(bone_charm).
item_possessable(bone_charm).
item_tag(bone_charm, dark_magic).
item_tag(bone_charm, protection).

%% Corrupted Heart
item(corrupted_heart, 'Corrupted Heart', material).
item_description(corrupted_heart, 'The still-beating heart of a blighted creature. Useful in dark alchemy but dangerous to carry for long.').
item_value(corrupted_heart, 50).
item_sell_value(corrupted_heart, 25).
item_weight(corrupted_heart, 1).
item_rarity(corrupted_heart, uncommon).
item_category(corrupted_heart, arcane).
item_tradeable(corrupted_heart).
item_possessable(corrupted_heart).
item_tag(corrupted_heart, dark_magic).
item_tag(corrupted_heart, crafting).

%% Exorcist Chain
item(exorcist_chain, 'Exorcist Chain', equipment).
item_description(exorcist_chain, 'A heavy iron chain etched with binding runes. Used to restrain possessed individuals during exorcism rituals.').
item_value(exorcist_chain, 60).
item_sell_value(exorcist_chain, 30).
item_weight(exorcist_chain, 5).
item_rarity(exorcist_chain, uncommon).
item_category(exorcist_chain, tool).
item_tradeable(exorcist_chain).
item_possessable(exorcist_chain).
item_tag(exorcist_chain, holy).
item_tag(exorcist_chain, ritual).

%% Nightshade Potion
item(nightshade_potion, 'Nightshade Potion', consumable).
item_description(nightshade_potion, 'A violet-black draught brewed from swamp nightshade. Grants dark vision but causes hallucinations if overused.').
item_value(nightshade_potion, 25).
item_sell_value(nightshade_potion, 12).
item_weight(nightshade_potion, 0.3).
item_rarity(nightshade_potion, uncommon).
item_category(nightshade_potion, potion).
item_stackable(nightshade_potion).
item_tradeable(nightshade_potion).
item_possessable(nightshade_potion).
item_tag(nightshade_potion, alchemy).
item_tag(nightshade_potion, dark_magic).

%% Censer of Purification
item(censer_of_purification, 'Censer of Purification', tool).
item_description(censer_of_purification, 'A brass censer filled with sanctified incense. Its smoke cleanses corruption from people and places when swung in ritual patterns.').
item_value(censer_of_purification, 75).
item_sell_value(censer_of_purification, 40).
item_weight(censer_of_purification, 2).
item_rarity(censer_of_purification, rare).
item_category(censer_of_purification, holy).
item_tradeable(censer_of_purification).
item_possessable(censer_of_purification).
item_tag(censer_of_purification, holy).
item_tag(censer_of_purification, ritual).

%% Wraith Lantern
item(wraith_lantern, 'Wraith Lantern', tool).
item_description(wraith_lantern, 'A lantern that burns with pale green flame. Reveals hidden spirits and spectral traces invisible to the naked eye.').
item_value(wraith_lantern, 90).
item_sell_value(wraith_lantern, 45).
item_weight(wraith_lantern, 1.5).
item_rarity(wraith_lantern, rare).
item_category(wraith_lantern, tool).
item_tradeable(wraith_lantern).
item_possessable(wraith_lantern).
item_tag(wraith_lantern, detection).
item_tag(wraith_lantern, arcane).

%% Darksteel Shield
item(darksteel_shield, 'Darksteel Shield', equipment).
item_description(darksteel_shield, 'A heavy shield forged from darksteel alloy. Absorbs magical attacks but grows heavier with each blow it deflects.').
item_value(darksteel_shield, 150).
item_sell_value(darksteel_shield, 80).
item_weight(darksteel_shield, 8).
item_rarity(darksteel_shield, rare).
item_category(darksteel_shield, armor).
item_tradeable(darksteel_shield).
item_possessable(darksteel_shield).
item_tag(darksteel_shield, defense).
item_tag(darksteel_shield, cursed).

%% Phylactery Shard
item(phylactery_shard, 'Phylactery Shard', material).
item_description(phylactery_shard, 'A fragment of a shattered phylactery. Contains residual necromantic energy that can be repurposed for warding or corruption.').
item_value(phylactery_shard, 180).
item_sell_value(phylactery_shard, 90).
item_weight(phylactery_shard, 0.2).
item_rarity(phylactery_shard, legendary).
item_category(phylactery_shard, arcane).
item_possessable(phylactery_shard).
item_tag(phylactery_shard, dark_magic).
item_tag(phylactery_shard, crafting).

%% Ashen Bread
item(ashen_bread, 'Ashen Bread', consumable).
item_description(ashen_bread, 'Coarse bread baked with ash-flour -- the staple food of Ashenvale. Sustaining but flavorless.').
item_value(ashen_bread, 2).
item_sell_value(ashen_bread, 1).
item_weight(ashen_bread, 0.5).
item_rarity(ashen_bread, common).
item_category(ashen_bread, food_drink).
item_stackable(ashen_bread).
item_tradeable(ashen_bread).
item_possessable(ashen_bread).
item_tag(ashen_bread, food).
