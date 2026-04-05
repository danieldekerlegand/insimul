%% Ensemble History: Realm of Aethermoor -- Initial World State
%% Source: data/worlds/realm_of_aethermoor/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% ─── King Aldric Stormborne ───
trait(human_king, male).
trait(human_king, noble).
trait(human_king, just).
trait(human_king, cautious).
trait(human_king, middle_aged).
attribute(human_king, charisma, 80).
attribute(human_king, leadership, 85).
attribute(human_king, combat_skill, 70).
attribute(human_king, magical_affinity, 40).
status(human_king, ruler_of_aethoria).

%% ─── Queen Eleanor Stormborne ───
trait(human_queen, female).
trait(human_queen, diplomatic).
trait(human_queen, perceptive).
trait(human_queen, compassionate).
attribute(human_queen, charisma, 85).
attribute(human_queen, intelligence, 80).
attribute(human_queen, propriety, 90).
attribute(human_queen, magical_affinity, 35).
relationship(human_queen, human_king, married).
status(human_queen, queen_consort).

%% ─── Prince Aragorn Stormborne ───
trait(human_prince, male).
trait(human_prince, young).
trait(human_prince, idealistic).
trait(human_prince, brave).
attribute(human_prince, charisma, 70).
attribute(human_prince, combat_skill, 75).
attribute(human_prince, leadership, 55).
attribute(human_prince, magical_affinity, 50).
status(human_prince, heir_apparent).

%% ─── Queen Galadriel Moonwhisper ───
trait(elf_queen, female).
trait(elf_queen, ancient).
trait(elf_queen, wise).
trait(elf_queen, reclusive).
attribute(elf_queen, charisma, 90).
attribute(elf_queen, magical_affinity, 95).
attribute(elf_queen, intelligence, 90).
attribute(elf_queen, propriety, 85).
status(elf_queen, ruler_of_silverwood).

%% ─── Princess Arwen Moonwhisper ───
trait(elf_princess, female).
trait(elf_princess, young_elf).
trait(elf_princess, curious).
trait(elf_princess, compassionate).
attribute(elf_princess, charisma, 80).
attribute(elf_princess, magical_affinity, 70).
attribute(elf_princess, empathy, 85).
attribute(elf_princess, combat_skill, 45).
relationship(elf_princess, human_prince, romantic_interest).

%% ─── Legolas Greenleaf ───
trait(elf_ranger, male).
trait(elf_ranger, stoic).
trait(elf_ranger, vigilant).
trait(elf_ranger, skilled_archer).
attribute(elf_ranger, combat_skill, 90).
attribute(elf_ranger, perception, 95).
attribute(elf_ranger, charisma, 60).
attribute(elf_ranger, magical_affinity, 55).
status(elf_ranger, guardian_of_silverwood).

%% ─── King Thorin Ironbeard ───
trait(dwarf_king, male).
trait(dwarf_king, proud).
trait(dwarf_king, stubborn).
trait(dwarf_king, master_smith).
attribute(dwarf_king, combat_skill, 80).
attribute(dwarf_king, craftsmanship, 95).
attribute(dwarf_king, leadership, 75).
attribute(dwarf_king, charisma, 65).
status(dwarf_king, ruler_of_ironpeak).

%% ─── Gimli Ironbeard ───
trait(dwarf_warrior, male).
trait(dwarf_warrior, fierce).
trait(dwarf_warrior, loyal).
trait(dwarf_warrior, boisterous).
attribute(dwarf_warrior, combat_skill, 85).
attribute(dwarf_warrior, craftsmanship, 70).
attribute(dwarf_warrior, endurance, 90).
attribute(dwarf_warrior, charisma, 55).

%% ─── Gandalf the Wizard ───
trait(wizard_gandalf, male).
trait(wizard_gandalf, mysterious).
trait(wizard_gandalf, knowledgeable).
trait(wizard_gandalf, patient).
attribute(wizard_gandalf, magical_affinity, 90).
attribute(wizard_gandalf, intelligence, 95).
attribute(wizard_gandalf, charisma, 75).
attribute(wizard_gandalf, combat_skill, 60).
status(wizard_gandalf, wandering_sage).

%% ─── Boromir the Warrior ───
trait(warrior_boromir, male).
trait(warrior_boromir, honorable).
trait(warrior_boromir, ambitious).
trait(warrior_boromir, proud).
attribute(warrior_boromir, combat_skill, 85).
attribute(warrior_boromir, leadership, 70).
attribute(warrior_boromir, charisma, 65).
attribute(warrior_boromir, endurance, 80).

%% ─── Cleric Galadriel ───
trait(cleric_galadriel, female).
trait(cleric_galadriel, devout).
trait(cleric_galadriel, gentle).
trait(cleric_galadriel, resolute).
attribute(cleric_galadriel, magical_affinity, 80).
attribute(cleric_galadriel, empathy, 90).
attribute(cleric_galadriel, charisma, 70).
attribute(cleric_galadriel, intelligence, 75).

%% ─── Grommash the Barbarian ───
trait(barbarian_grommash, male).
trait(barbarian_grommash, fierce).
trait(barbarian_grommash, pragmatic).
trait(barbarian_grommash, misunderstood).
attribute(barbarian_grommash, combat_skill, 90).
attribute(barbarian_grommash, endurance, 95).
attribute(barbarian_grommash, charisma, 40).
attribute(barbarian_grommash, intelligence, 50).

%% ─── Cross-character relationships ───
network(human_king, human_queen, trust, 9).
network(human_king, elf_queen, trust, 5).
network(human_king, dwarf_king, trust, 6).
network(human_prince, elf_princess, romance, 7).
network(elf_ranger, elf_queen, loyalty, 9).
network(dwarf_warrior, dwarf_king, loyalty, 8).
network(wizard_gandalf, human_king, trust, 7).
network(wizard_gandalf, elf_queen, trust, 8).
network(warrior_boromir, human_king, loyalty, 7).
network(barbarian_grommash, human_king, antagonism, 4).
network(barbarian_grommash, dwarf_king, antagonism, 5).
