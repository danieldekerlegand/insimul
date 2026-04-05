%% Insimul Characters: High Fantasy
%% Source: data/worlds/high_fantasy/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   race/2, occupation/2

%% ═══════════════════════════════════════════════════════════
%% Elven Court (Aelindor)
%% ═══════════════════════════════════════════════════════════

%% Thalion Starweaver -- Elven King
person(thalion_starweaver).
first_name(thalion_starweaver, 'Thalion').
last_name(thalion_starweaver, 'Starweaver').
full_name(thalion_starweaver, 'Thalion Starweaver').
gender(thalion_starweaver, male).
alive(thalion_starweaver).
generation(thalion_starweaver, 0).
founder_family(thalion_starweaver).
race(thalion_starweaver, elf).
occupation(thalion_starweaver, king).
child(thalion_starweaver, caelindra_starweaver).
spouse(thalion_starweaver, elowen_starweaver).
location(thalion_starweaver, aelindor).

%% Elowen Starweaver -- Elven Queen
person(elowen_starweaver).
first_name(elowen_starweaver, 'Elowen').
last_name(elowen_starweaver, 'Starweaver').
full_name(elowen_starweaver, 'Elowen Starweaver').
gender(elowen_starweaver, female).
alive(elowen_starweaver).
generation(elowen_starweaver, 0).
founder_family(elowen_starweaver).
race(elowen_starweaver, elf).
occupation(elowen_starweaver, queen).
child(elowen_starweaver, caelindra_starweaver).
spouse(elowen_starweaver, thalion_starweaver).
location(elowen_starweaver, aelindor).

%% Caelindra Starweaver -- Elven Princess and Ranger
person(caelindra_starweaver).
first_name(caelindra_starweaver, 'Caelindra').
last_name(caelindra_starweaver, 'Starweaver').
full_name(caelindra_starweaver, 'Caelindra Starweaver').
gender(caelindra_starweaver, female).
alive(caelindra_starweaver).
generation(caelindra_starweaver, 1).
race(caelindra_starweaver, elf).
occupation(caelindra_starweaver, ranger).
parent(thalion_starweaver, caelindra_starweaver).
parent(elowen_starweaver, caelindra_starweaver).
location(caelindra_starweaver, aelindor).

%% Ithrandil Moonwhisper -- Archmage of the Academy
person(ithrandil_moonwhisper).
first_name(ithrandil_moonwhisper, 'Ithrandil').
last_name(ithrandil_moonwhisper, 'Moonwhisper').
full_name(ithrandil_moonwhisper, 'Ithrandil Moonwhisper').
gender(ithrandil_moonwhisper, male).
alive(ithrandil_moonwhisper).
generation(ithrandil_moonwhisper, 0).
race(ithrandil_moonwhisper, elf).
occupation(ithrandil_moonwhisper, archmage).
location(ithrandil_moonwhisper, aelindor).

%% Faelina Dawnpetal -- Druid of the Grove Ward
person(faelina_dawnpetal).
first_name(faelina_dawnpetal, 'Faelina').
last_name(faelina_dawnpetal, 'Dawnpetal').
full_name(faelina_dawnpetal, 'Faelina Dawnpetal').
gender(faelina_dawnpetal, female).
alive(faelina_dawnpetal).
generation(faelina_dawnpetal, 0).
race(faelina_dawnpetal, elf).
occupation(faelina_dawnpetal, druid).
location(faelina_dawnpetal, aelindor).

%% Lyraniel Silvershade -- Enchantress
person(lyraniel_silvershade).
first_name(lyraniel_silvershade, 'Lyraniel').
last_name(lyraniel_silvershade, 'Silvershade').
full_name(lyraniel_silvershade, 'Lyraniel Silvershade').
gender(lyraniel_silvershade, female).
alive(lyraniel_silvershade).
generation(lyraniel_silvershade, 0).
race(lyraniel_silvershade, elf).
occupation(lyraniel_silvershade, enchantress).
location(lyraniel_silvershade, aelindor).

%% ═══════════════════════════════════════════════════════════
%% Dwarven Stronghold (Khazad Dumrak)
%% ═══════════════════════════════════════════════════════════

%% Thorgar Ironforge -- Dwarven Forge Master
person(thorgar_ironforge).
first_name(thorgar_ironforge, 'Thorgar').
last_name(thorgar_ironforge, 'Ironforge').
full_name(thorgar_ironforge, 'Thorgar Ironforge').
gender(thorgar_ironforge, male).
alive(thorgar_ironforge).
generation(thorgar_ironforge, 0).
founder_family(thorgar_ironforge).
race(thorgar_ironforge, dwarf).
occupation(thorgar_ironforge, forge_master).
child(thorgar_ironforge, brenna_ironforge).
spouse(thorgar_ironforge, hilda_ironforge).
location(thorgar_ironforge, khazad_dumrak).

%% Hilda Ironforge -- Dwarven Rune Mistress
person(hilda_ironforge).
first_name(hilda_ironforge, 'Hilda').
last_name(hilda_ironforge, 'Ironforge').
full_name(hilda_ironforge, 'Hilda Ironforge').
gender(hilda_ironforge, female).
alive(hilda_ironforge).
generation(hilda_ironforge, 0).
founder_family(hilda_ironforge).
race(hilda_ironforge, dwarf).
occupation(hilda_ironforge, rune_mistress).
child(hilda_ironforge, brenna_ironforge).
spouse(hilda_ironforge, thorgar_ironforge).
location(hilda_ironforge, khazad_dumrak).

%% Brenna Ironforge -- Dwarven Warrior
person(brenna_ironforge).
first_name(brenna_ironforge, 'Brenna').
last_name(brenna_ironforge, 'Ironforge').
full_name(brenna_ironforge, 'Brenna Ironforge').
gender(brenna_ironforge, female).
alive(brenna_ironforge).
generation(brenna_ironforge, 1).
race(brenna_ironforge, dwarf).
occupation(brenna_ironforge, warrior).
parent(thorgar_ironforge, brenna_ironforge).
parent(hilda_ironforge, brenna_ironforge).
location(brenna_ironforge, khazad_dumrak).

%% Dolgrim Stonebeard -- Mine Overseer
person(dolgrim_stonebeard).
first_name(dolgrim_stonebeard, 'Dolgrim').
last_name(dolgrim_stonebeard, 'Stonebeard').
full_name(dolgrim_stonebeard, 'Dolgrim Stonebeard').
gender(dolgrim_stonebeard, male).
alive(dolgrim_stonebeard).
generation(dolgrim_stonebeard, 0).
race(dolgrim_stonebeard, dwarf).
occupation(dolgrim_stonebeard, mine_overseer).
location(dolgrim_stonebeard, khazad_dumrak).

%% Rurik Brightshard -- Gemcutter and Merchant
person(rurik_brightshard).
first_name(rurik_brightshard, 'Rurik').
last_name(rurik_brightshard, 'Brightshard').
full_name(rurik_brightshard, 'Rurik Brightshard').
gender(rurik_brightshard, male).
alive(rurik_brightshard).
generation(rurik_brightshard, 0).
race(rurik_brightshard, dwarf).
occupation(rurik_brightshard, gemcutter).
location(rurik_brightshard, khazad_dumrak).

%% ═══════════════════════════════════════════════════════════
%% Human Frontier (Thornhaven)
%% ═══════════════════════════════════════════════════════════

%% Aldric Thornwall -- Lord of Thornhaven
person(aldric_thornwall).
first_name(aldric_thornwall, 'Aldric').
last_name(aldric_thornwall, 'Thornwall').
full_name(aldric_thornwall, 'Aldric Thornwall').
gender(aldric_thornwall, male).
alive(aldric_thornwall).
generation(aldric_thornwall, 0).
founder_family(aldric_thornwall).
race(aldric_thornwall, human).
occupation(aldric_thornwall, lord).
child(aldric_thornwall, rowan_thornwall).
spouse(aldric_thornwall, maren_thornwall).
location(aldric_thornwall, thornhaven).

%% Maren Thornwall -- Healer and Lady of Thornhaven
person(maren_thornwall).
first_name(maren_thornwall, 'Maren').
last_name(maren_thornwall, 'Thornwall').
full_name(maren_thornwall, 'Maren Thornwall').
gender(maren_thornwall, female).
alive(maren_thornwall).
generation(maren_thornwall, 0).
founder_family(maren_thornwall).
race(maren_thornwall, human).
occupation(maren_thornwall, healer).
child(maren_thornwall, rowan_thornwall).
spouse(maren_thornwall, aldric_thornwall).
location(maren_thornwall, thornhaven).

%% Rowan Thornwall -- Squire and Aspiring Knight
person(rowan_thornwall).
first_name(rowan_thornwall, 'Rowan').
last_name(rowan_thornwall, 'Thornwall').
full_name(rowan_thornwall, 'Rowan Thornwall').
gender(rowan_thornwall, male).
alive(rowan_thornwall).
generation(rowan_thornwall, 1).
race(rowan_thornwall, human).
occupation(rowan_thornwall, squire).
parent(aldric_thornwall, rowan_thornwall).
parent(maren_thornwall, rowan_thornwall).
location(rowan_thornwall, thornhaven).

%% Sera Blackthorn -- Adventurer Guild Master
person(sera_blackthorn).
first_name(sera_blackthorn, 'Sera').
last_name(sera_blackthorn, 'Blackthorn').
full_name(sera_blackthorn, 'Sera Blackthorn').
gender(sera_blackthorn, female).
alive(sera_blackthorn).
generation(sera_blackthorn, 0).
race(sera_blackthorn, human).
occupation(sera_blackthorn, guild_master).
location(sera_blackthorn, thornhaven).

%% Gareth Steelheart -- Blacksmith
person(gareth_steelheart).
first_name(gareth_steelheart, 'Gareth').
last_name(gareth_steelheart, 'Steelheart').
full_name(gareth_steelheart, 'Gareth Steelheart').
gender(gareth_steelheart, male).
alive(gareth_steelheart).
generation(gareth_steelheart, 0).
race(gareth_steelheart, human).
occupation(gareth_steelheart, blacksmith).
location(gareth_steelheart, thornhaven).

%% Orin Duskmantle -- Half-Elf Wandering Wizard
person(orin_duskmantle).
first_name(orin_duskmantle, 'Orin').
last_name(orin_duskmantle, 'Duskmantle').
full_name(orin_duskmantle, 'Orin Duskmantle').
gender(orin_duskmantle, male).
alive(orin_duskmantle).
generation(orin_duskmantle, 0).
race(orin_duskmantle, half_elf).
occupation(orin_duskmantle, wizard).
location(orin_duskmantle, thornhaven).
