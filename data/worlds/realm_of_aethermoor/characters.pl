%% Insimul Characters: Realm of Aethermoor
%% Source: data/insimul/fantasy/fantasy.insimul
%% Converted: 2026-04-02T22:06:25.798Z

%% Aldric Stormborne
person(human_king).
first_name(human_king, 'Aldric').
last_name(human_king, 'Stormborne').
full_name(human_king, 'Aldric Stormborne').
gender(human_king, male).
birth_year(human_king, 970).
alive(human_king).
occupation(human_king, king).
at_location(human_king, human_capital).
race(human_king, human).

%% Eleanor Stormborne
person(human_queen).
first_name(human_queen, 'Eleanor').
last_name(human_queen, 'Stormborne').
full_name(human_queen, 'Eleanor Stormborne').
gender(human_queen, female).
birth_year(human_queen, 975).
alive(human_queen).
occupation(human_queen, queen).
at_location(human_queen, human_capital).
race(human_queen, human).
married_to(human_queen, human_king).

%% Aragorn Stormborne
person(human_prince).
first_name(human_prince, 'Aragorn').
last_name(human_prince, 'Stormborne').
full_name(human_prince, 'Aragorn Stormborne').
gender(human_prince, male).
birth_year(human_prince, 995).
alive(human_prince).
occupation(human_prince, prince).
at_location(human_prince, human_capital).
race(human_prince, human).
child_of(human_prince, human_king).
parent_of(human_king, human_prince).
child_of(human_prince, human_queen).
parent_of(human_queen, human_prince).

%% Galadriel Moonwhisper
person(elf_queen).
first_name(elf_queen, 'Galadriel').
last_name(elf_queen, 'Moonwhisper').
full_name(elf_queen, 'Galadriel Moonwhisper').
gender(elf_queen, female).
birth_year(elf_queen, 500).
alive(elf_queen).
occupation(elf_queen, queen).
at_location(elf_queen, elvish_forest).
race(elf_queen, elf).

%% Arwen Moonwhisper
person(elf_princess).
first_name(elf_princess, 'Arwen').
last_name(elf_princess, 'Moonwhisper').
full_name(elf_princess, 'Arwen Moonwhisper').
gender(elf_princess, female).
birth_year(elf_princess, 850).
alive(elf_princess).
occupation(elf_princess, princess).
at_location(elf_princess, elvish_forest).
race(elf_princess, elf).
child_of(elf_princess, elf_queen).
parent_of(elf_queen, elf_princess).

%% Legolas Greenleaf
person(elf_ranger).
first_name(elf_ranger, 'Legolas').
last_name(elf_ranger, 'Greenleaf').
full_name(elf_ranger, 'Legolas Greenleaf').
gender(elf_ranger, male).
birth_year(elf_ranger, 700).
alive(elf_ranger).
occupation(elf_ranger, ranger).
at_location(elf_ranger, elvish_forest).
race(elf_ranger, elf).

%% Thorin Ironbeard
person(dwarf_king).
first_name(dwarf_king, 'Thorin').
last_name(dwarf_king, 'Ironbeard').
full_name(dwarf_king, 'Thorin Ironbeard').
gender(dwarf_king, male).
birth_year(dwarf_king, 950).
alive(dwarf_king).
occupation(dwarf_king, king).
at_location(dwarf_king, dwarven_hold).
race(dwarf_king, dwarf).

%% Gimli Ironbeard
person(dwarf_warrior).
first_name(dwarf_warrior, 'Gimli').
last_name(dwarf_warrior, 'Ironbeard').
full_name(dwarf_warrior, 'Gimli Ironbeard').
gender(dwarf_warrior, male).
birth_year(dwarf_warrior, 980).
alive(dwarf_warrior).
occupation(dwarf_warrior, warrior).
at_location(dwarf_warrior, dwarven_hold).
race(dwarf_warrior, dwarf).
child_of(dwarf_warrior, dwarf_king).
parent_of(dwarf_king, dwarf_warrior).

%% Gandalf Adventurer
person(wizard_gandalf).
first_name(wizard_gandalf, 'Gandalf').
last_name(wizard_gandalf, 'Adventurer').
full_name(wizard_gandalf, 'Gandalf Adventurer').
gender(wizard_gandalf, male).
birth_year(wizard_gandalf, 980).
alive(wizard_gandalf).
occupation(wizard_gandalf, wizard).
at_location(wizard_gandalf, mixed_town).
race(wizard_gandalf, human).

%% Boromir Adventurer
person(warrior_boromir).
first_name(warrior_boromir, 'Boromir').
last_name(warrior_boromir, 'Adventurer').
full_name(warrior_boromir, 'Boromir Adventurer').
gender(warrior_boromir, male).
birth_year(warrior_boromir, 980).
alive(warrior_boromir).
occupation(warrior_boromir, warrior).
at_location(warrior_boromir, mixed_town).
race(warrior_boromir, human).

%% Galadriel Adventurer
person(cleric_galadriel).
first_name(cleric_galadriel, 'Galadriel').
last_name(cleric_galadriel, 'Adventurer').
full_name(cleric_galadriel, 'Galadriel Adventurer').
gender(cleric_galadriel, female).
birth_year(cleric_galadriel, 980).
alive(cleric_galadriel).
occupation(cleric_galadriel, cleric).
at_location(cleric_galadriel, mixed_town).
race(cleric_galadriel, elf).

%% Grommash Adventurer
person(barbarian_grommash).
first_name(barbarian_grommash, 'Grommash').
last_name(barbarian_grommash, 'Adventurer').
full_name(barbarian_grommash, 'Grommash Adventurer').
gender(barbarian_grommash, male).
birth_year(barbarian_grommash, 980).
alive(barbarian_grommash).
occupation(barbarian_grommash, barbarian).
at_location(barbarian_grommash, mixed_town).
race(barbarian_grommash, orc).

%% ═══ Relationships ═══
relationship(wizard_gandalf, warrior_boromir, friends).
relationship(warrior_boromir, wizard_gandalf, friends).
relationship(wizard_gandalf, cleric_galadriel, friends).
relationship(cleric_galadriel, wizard_gandalf, friends).
relationship(wizard_gandalf, barbarian_grommash, friends).
relationship(barbarian_grommash, wizard_gandalf, friends).
relationship(human_prince, elf_princess, friends).
relationship(elf_princess, human_prince, friends).

