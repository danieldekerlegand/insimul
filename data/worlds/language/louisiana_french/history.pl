%% Ensemble History: Louisiana French — Initial World State
%% Source: data/ensemble/history/louisiana-french.json
%% Converted: 2026-04-02T22:02:19.132Z
%% Timestep: 0 (initial state)
%% Total entries: 511
%%
%% Categories: trait, attribute, relationship, status, network,
%%             event, directed status, language

%% ─── Jacob Chauvin ───

trait(jacob_chauvin, male).
attribute(jacob_chauvin, propriety, 40).
trait(jacob_chauvin, provincial).
attribute(jacob_chauvin, self_assuredness, 60).
trait(jacob_chauvin, innocent_looking).
attribute(jacob_chauvin, cultural_knowledge, 1).
attribute(jacob_chauvin, nosiness, 60).
trait(jacob_chauvin, flirtatious).
trait(jacob_chauvin, charming).
trait(jacob_chauvin, wearing_a_first_responder_uniform).
trait(jacob_chauvin, elegantly_dressed).
trait(jacob_chauvin, disdainful).
attribute(jacob_chauvin, cunningness, 60).
trait(jacob_chauvin, young).
relationship(jacob_chauvin, renee_hebert, married).
trait(jacob_chauvin, joker).
relationship(jacob_chauvin, adrianne_billedeaux, ally).
relationship(jacob_chauvin, adrianne_billedeaux, friends).
relationship(jacob_chauvin, jeanne_moutard, lovers).
trait(jacob_chauvin, inconsistent).
language_proficiency(jacob_chauvin, french, 95).
language_proficiency(jacob_chauvin, english, 45).

%% ─── Alphonse Martin ───

trait(alphonse_martin, rich).
trait(alphonse_martin, male).
attribute(alphonse_martin, sensitiveness, 75).
status(alphonse_martin, upset).
% negated trait: rich
\+ trait(alphonse_martin, rich).
trait(alphonse_martin, innocent_looking).
trait(alphonse_martin, credulous).
relationship(alphonse_martin, christophe_bertrand, friends).
language_proficiency(alphonse_martin, french, 90).
language_proficiency(alphonse_martin, english, 35).

%% ─── Grace Huval ───

attribute(grace_huval, propriety, 25).
trait(grace_huval, female).
trait(grace_huval, beautiful).
trait(grace_huval, greedy).
attribute(grace_huval, charisma, 80).
% negated trait: rich
\+ trait(grace_huval, rich).
trait(grace_huval, charming).
language_proficiency(grace_huval, french, 85).
language_proficiency(grace_huval, english, 60).

%% ─── Ralph Aucoin ───

trait(ralph_aucoin, clergy).
status(ralph_aucoin, inebriated).
trait(ralph_aucoin, mocking).
trait(ralph_aucoin, hypocritical).
trait(ralph_aucoin, inconsistent).
relationship(ralph_aucoin, francois_leblanc, ally).
trait(ralph_aucoin, devout).
% negated trait: intelligent
\+ trait(ralph_aucoin, intelligent).
attribute(ralph_aucoin, charisma, 15).
attribute(ralph_aucoin, sophistication, 40).
trait(ralph_aucoin, modest).
network(ralph_aucoin, christophe_bertrand, affinity, 61).
language_proficiency(ralph_aucoin, french, 98).
language_proficiency(ralph_aucoin, english, 25).

%% ─── Cora DeCuir ───

trait(cora_decuir, stagehand).
network(cora_decuir, jacob_chauvin, affinity, 60).
attribute(cora_decuir, nosiness, 50).
trait(cora_decuir, female).
trait(cora_decuir, poor).
event(cora_decuir, flirted_with, jacob_chauvin).
% negated trait: virtuous
\+ trait(cora_decuir, virtuous).
% negated trait: devout
\+ trait(cora_decuir, devout).
trait(cora_decuir, indiscreet).
trait(cora_decuir, flirtatious).
language_proficiency(cora_decuir, french, 92).
language_proficiency(cora_decuir, english, 40).

%% ─── Francois LeBlanc ───

trait(francois_leblanc, stagehand).
attribute(francois_leblanc, sophistication, 45).
attribute(francois_leblanc, propriety, 45).
directed_status(francois_leblanc, alphonse_martin, financially_dependent_on).
trait(francois_leblanc, wearing_a_uniform).
network(francois_leblanc, alexandre_nezat, emulation, 61).
directed_status(francois_leblanc, alphonse_martin, resentful_of).
network(francois_leblanc, grace_huval, curiosity, 61).
relationship(francois_leblanc, alexandre_nezat, ally).
% negated trait: virtuous
\+ trait(francois_leblanc, virtuous).
trait(francois_leblanc, inconsistent).
trait(francois_leblanc, innocent_looking).
trait(francois_leblanc, joker).
trait(francois_leblanc, male).
trait(francois_leblanc, ambitious).
language_proficiency(francois_leblanc, french, 88).
language_proficiency(francois_leblanc, english, 55).

%% ─── Jean Billeaud ───

trait(jean_billeaud, child).
trait(jean_billeaud, shy).
trait(jean_billeaud, awkward).
% negated trait: rich
\+ trait(jean_billeaud, rich).
trait(jean_billeaud, unctuous).
% negated trait: modest
\+ trait(jean_billeaud, modest).
attribute(jean_billeaud, self_assuredness, 25).
attribute(jean_billeaud, sensitiveness, 80).
trait(jean_billeaud, male).
trait(jean_billeaud, provincial).
trait(jean_billeaud, intelligent).
network(jean_billeaud, victoria_guidry, affinity, 95).
relationship(jean_billeaud, victoria_guidry, friends).
language_proficiency(jean_billeaud, french, 80).
language_proficiency(jean_billeaud, english, 70).

%% ─── Christophe Bertrand ───

network(christophe_bertrand, ralph_aucoin, affinity, 31).
attribute(christophe_bertrand, propriety, 75).
trait(christophe_bertrand, virtuous).
trait(christophe_bertrand, clergy).
trait(christophe_bertrand, devout).
relationship(christophe_bertrand, alphonse_martin, friends).
trait(christophe_bertrand, male).
trait(christophe_bertrand, kind).
language_proficiency(christophe_bertrand, french, 95).
language_proficiency(christophe_bertrand, english, 30).

%% ─── Elizabeth Landry ───

trait(elizabeth_landry, stagehand).
attribute(elizabeth_landry, cunningness, 61).
attribute(elizabeth_landry, sophistication, 45).
attribute(elizabeth_landry, self_assuredness, 61).
directed_status(elizabeth_landry, grace_huval, jealous_of).
network(elizabeth_landry, francois_leblanc, affinity, 70).
relationship(elizabeth_landry, jean_billeaud, ally).
status(elizabeth_landry, happy).
trait(elizabeth_landry, innocent_looking).
trait(elizabeth_landry, beautiful).
trait(elizabeth_landry, wearing_a_uniform).
trait(elizabeth_landry, talkative).
trait(elizabeth_landry, young).
directed_status(elizabeth_landry, celila_broussard, financially_dependent_on).
directed_status(elizabeth_landry, celila_broussard, financially_dependent_on).
language_proficiency(elizabeth_landry, french, 90).
language_proficiency(elizabeth_landry, english, 50).

%% ─── Renee Hebert ───

attribute(renee_hebert, propriety, 50).
trait(renee_hebert, female).
trait(renee_hebert, devout).
trait(renee_hebert, credulous).
relationship(renee_hebert, jacob_chauvin, married).
% negated trait: young
\+ trait(renee_hebert, young).
directed_status(renee_hebert, jacob_chauvin, trusts).
attribute(renee_hebert, charisma, 40).
trait(renee_hebert, attendee).
trait(renee_hebert, talkative).
language_proficiency(renee_hebert, french, 93).
language_proficiency(renee_hebert, english, 38).

%% ─── Victoria Guidry ───

trait(victoria_guidry, female).
trait(victoria_guidry, young).
directed_status(victoria_guidry, jean_billeaud, cares_for).
network(victoria_guidry, jean_billeaud, affinity, 75).
trait(victoria_guidry, beautiful).
% negated trait: rich
\+ trait(victoria_guidry, rich).
trait(victoria_guidry, provincial).
relationship(victoria_guidry, jean_billeaud, friends).
language_proficiency(victoria_guidry, french, 87).
language_proficiency(victoria_guidry, english, 65).

%% ─── Adrianne Billedeaux ───

attribute(adrianne_billedeaux, propriety, 70).
trait(adrianne_billedeaux, rich).
attribute(adrianne_billedeaux, social_standing, 80).
trait(adrianne_billedeaux, male).
trait(adrianne_billedeaux, young).
attribute(adrianne_billedeaux, cultural_knowledge, 70).
trait(adrianne_billedeaux, penetrating).
relationship(adrianne_billedeaux, jacob_chauvin, ally).
relationship(adrianne_billedeaux, jacob_chauvin, friends).
network(adrianne_billedeaux, elizabeth_huff, credibility, 55).
network(adrianne_billedeaux, elizabeth_huff, curiosity, 65).
language_proficiency(adrianne_billedeaux, french, 75).
language_proficiency(adrianne_billedeaux, english, 80).

%% ─── Jeanne Comeaux ───

trait(jeanne_comeaux, male).
trait(jeanne_comeaux, child).
trait(jeanne_comeaux, shy).
relationship(jeanne_comeaux, jean_billeaud, friends).
trait(jeanne_comeaux, awkward).
% negated trait: beautiful
\+ trait(jeanne_comeaux, beautiful).
attribute(jeanne_comeaux, charisma, 15).
language_proficiency(jeanne_comeaux, french, 85).
language_proficiency(jeanne_comeaux, english, 60).

%% ─── Dustin Gaspard ───

trait(dustin_gaspard, male).
trait(dustin_gaspard, police_officer).
trait(dustin_gaspard, young).
trait(dustin_gaspard, provincial).
trait(dustin_gaspard, virtuous).
% negated trait: rich
\+ trait(dustin_gaspard, rich).
attribute(dustin_gaspard, self_assuredness, 70).
attribute(dustin_gaspard, charisma, 70).
trait(dustin_gaspard, innocent_looking).
relationship(dustin_gaspard, claude_robin, rivals).
relationship(dustin_gaspard, alexandre_nezat, friends).
attribute(dustin_gaspard, cultural_knowledge, 45).
event(dustin_gaspard, harmed, claude_robin).
language_proficiency(dustin_gaspard, french, 70).
language_proficiency(dustin_gaspard, english, 85).

%% ─── Mary Delahoussaye ───

attribute(mary_delahoussaye, propriety, 30).
trait(mary_delahoussaye, merchant).
trait(mary_delahoussaye, poor).
trait(mary_delahoussaye, provincial).
trait(mary_delahoussaye, boorish).
language_proficiency(mary_delahoussaye, french, 95).
language_proficiency(mary_delahoussaye, english, 20).

%% ─── Théo Arnaud ───

trait(theo_arnaud, stagehand).
% negated trait: rich
\+ trait(theo_arnaud, rich).
attribute(theo_arnaud, cunningness, 70).
trait(theo_arnaud, greedy).
language_proficiency(theo_arnaud, french, 92).
language_proficiency(theo_arnaud, english, 42).

%% ─── Celila Broussard ───

attribute(celila_broussard, propriety, 85).
trait(celila_broussard, rich).
trait(celila_broussard, female).
trait(celila_broussard, virtuous).
attribute(celila_broussard, cultural_knowledge, 75).
attribute(celila_broussard, sophistication, 70).
attribute(celila_broussard, charisma, 30).
trait(celila_broussard, generous).
status(celila_broussard, embarrassed).
% negated trait: beautiful
\+ trait(celila_broussard, beautiful).
trait(celila_broussard, kind).
trait(celila_broussard, rich).
relationship(celila_broussard, elizabeth_landry, ally).
directed_status(celila_broussard, dustin_gaspard, intimidates).
% negated trait: talkative
\+ trait(celila_broussard, talkative).
language_proficiency(celila_broussard, french, 88).
language_proficiency(celila_broussard, english, 55).

%% ─── Amy Robichaux ───

trait(amy_robichaux, female).
directed_status(amy_robichaux, jean_billeaud, intimidates).
trait(amy_robichaux, cold).
attribute(amy_robichaux, sensitiveness, 30).
trait(amy_robichaux, devout).
trait(amy_robichaux, disdainful).
% negated trait: beautiful
\+ trait(amy_robichaux, beautiful).
language_proficiency(amy_robichaux, french, 90).
language_proficiency(amy_robichaux, english, 48).

%% ─── Charles Devillier ───

attribute(charles_devillier, propriety, 25).
trait(charles_devillier, government_official).
status(charles_devillier, inebriated).
% negated trait: kind
\+ trait(charles_devillier, kind).
attribute(charles_devillier, cunningness, 60).
trait(charles_devillier, poorly_dressed).
trait(charles_devillier, boorish).
trait(charles_devillier, innocent_looking).
network(charles_devillier, elizabeth_huff, credibility, 65).
network(charles_devillier, elizabeth_huff, curiosity, 75).
language_proficiency(charles_devillier, french, 65).
language_proficiency(charles_devillier, english, 90).

%% ─── Elie Charpentier ───

trait(elie_charpentier, criminal).
trait(elie_charpentier, female).
trait(elie_charpentier, beautiful).
attribute(elie_charpentier, sophistication, 20).
% negated trait: rich
\+ trait(elie_charpentier, rich).
trait(elie_charpentier, flirtatious).
attribute(elie_charpentier, propriety, 20).
trait(elie_charpentier, security_guard).
language_proficiency(elie_charpentier, french, 93).
language_proficiency(elie_charpentier, english, 35).

%% ─── Claude Gaudet ───

trait(claude_gaudet, male).
attribute(claude_gaudet, propriety, 20).
attribute(claude_gaudet, self_assuredness, 80).
trait(claude_gaudet, flirtatious).
attribute(claude_gaudet, propriety, 50).
attribute(claude_gaudet, cultural_knowledge, 75).
network(claude_gaudet, dustin_gaspard, affinity, 78).
trait(claude_gaudet, young).
language_proficiency(claude_gaudet, french, 82).
language_proficiency(claude_gaudet, english, 72).

%% ─── Ralph Langlois ───

attribute(ralph_langlois, cultural_knowledge, 90).
attribute(ralph_langlois, charisma, 30).
attribute(ralph_langlois, nosiness, 60).
network(ralph_langlois, elie_charpentier, affinity, 41).
relationship(ralph_langlois, mary_delahoussaye, rivals).
network(ralph_langlois, charles_devillier, affinity, 51).
network(ralph_langlois, renee_hebert, affinity, 51).
trait(ralph_langlois, organizer).
trait(ralph_langlois, security_guard).
trait(ralph_langlois, talkative).
attribute(ralph_langlois, self_assuredness, 90).
network(ralph_langlois, elie_charpentier, emulation, 70).
trait(ralph_langlois, male).
trait(ralph_langlois, indiscreet).
language_proficiency(ralph_langlois, french, 78).
language_proficiency(ralph_langlois, english, 75).

%% ─── Jeanne Moutard ───

attribute(jeanne_moutard, propriety, 60).
trait(jeanne_moutard, female).
% negated trait: virtuous
\+ trait(jeanne_moutard, virtuous).
trait(jeanne_moutard, rich).
% negated trait: young
\+ trait(jeanne_moutard, young).
attribute(jeanne_moutard, charisma, 60).
network(jeanne_moutard, jacob_chauvin, affinity, 60).
attribute(jeanne_moutard, social_standing, 65).
trait(jeanne_moutard, elegantly_dressed).
relationship(jeanne_moutard, jacob_chauvin, lovers).
trait(jeanne_moutard, devout).
trait(jeanne_moutard, inconsistent).
language_proficiency(jeanne_moutard, french, 94).
language_proficiency(jeanne_moutard, english, 40).

%% ─── Alexandre Nezat ───

trait(alexandre_nezat, male).
trait(alexandre_nezat, young).
% negated trait: rich
\+ trait(alexandre_nezat, rich).
% negated trait: modest
\+ trait(alexandre_nezat, modest).
attribute(alexandre_nezat, charisma, 35).
trait(alexandre_nezat, unctuous).
attribute(alexandre_nezat, sensitiveness, 80).
network(alexandre_nezat, victoria_guidry, affinity, 90).
language_proficiency(alexandre_nezat, french, 86).
language_proficiency(alexandre_nezat, english, 62).

%% ─── Lucien Noel ───

attribute(lucien_noel, propriety, 55).
attribute(lucien_noel, self_assuredness, 60).
trait(lucien_noel, male).
directed_status(lucien_noel, jacob_chauvin, intimidates).
trait(lucien_noel, old).
% negated trait: talkative
\+ trait(lucien_noel, talkative).
relationship(lucien_noel, jacob_chauvin, strangers).
trait(lucien_noel, cold).
language_proficiency(lucien_noel, french, 97).
language_proficiency(lucien_noel, english, 28).

%% ─── Joseph Roy ───

trait(joseph_roy, male).
trait(joseph_roy, attendee).
attribute(joseph_roy, nosiness, 71).
attribute(joseph_roy, sophistication, 71).
attribute(joseph_roy, cultural_knowledge, 39).
attribute(joseph_roy, self_assuredness, 81).
trait(joseph_roy, intimidating).
trait(joseph_roy, impudent).
trait(joseph_roy, eccentric).
trait(joseph_roy, inconsistent).
trait(joseph_roy, indiscreet).
event(joseph_roy, flirted_with, jeanne_moutard).
event(joseph_roy, flirted_with, grace_huval).
trait(joseph_roy, flirtatious).
trait(joseph_roy, talkative).
attribute(joseph_roy, propriety, 45).
directed_status(joseph_roy, alexis_autin, cares_for).
language_proficiency(joseph_roy, french, 84).
language_proficiency(joseph_roy, english, 68).

%% ─── Marie-Claire Savoie ───

attribute(marie_claire_savoie, charisma, 71).
attribute(marie_claire_savoie, sensitiveness, 61).
directed_status(marie_claire_savoie, charles_devillier, financially_dependent_on).
directed_status(marie_claire_savoie, renee_hebert, trusts).
network(marie_claire_savoie, celila_broussard, affinity, 71).
relationship(marie_claire_savoie, amy_robichaux, esteem).
status(marie_claire_savoie, upset).
trait(marie_claire_savoie, beautiful).
trait(marie_claire_savoie, innocent_looking).
trait(marie_claire_savoie, charming).
trait(marie_claire_savoie, female).
trait(marie_claire_savoie, foreigner).
trait(marie_claire_savoie, honest).
trait(marie_claire_savoie, kind).
trait(marie_claire_savoie, modest).
% negated trait: rich
\+ trait(marie_claire_savoie, rich).
trait(marie_claire_savoie, young).
trait(marie_claire_savoie, virtuous).
language_proficiency(marie_claire_savoie, french, 91).
language_proficiency(marie_claire_savoie, english, 52).

%% ─── Claude Robin ───

trait(claude_robin, male).
trait(claude_robin, police_officer).
trait(claude_robin, young).
network(claude_robin, dustin_gaspard, affinity, 15).
relationship(claude_robin, dustin_gaspard, rivals).
trait(claude_robin, impudent).
attribute(claude_robin, propriety, 15).
attribute(claude_robin, cultural_knowledge, 25).
language_proficiency(claude_robin, french, 75).
language_proficiency(claude_robin, english, 78).

%% ─── Nicolas Bordelon ───

attribute(nicolas_bordelon, propriety, 5).
trait(nicolas_bordelon, rich).
trait(nicolas_bordelon, eccentric).
trait(nicolas_bordelon, intelligent).
trait(nicolas_bordelon, rich).
trait(nicolas_bordelon, mocking).
trait(nicolas_bordelon, penetrating).
language_proficiency(nicolas_bordelon, french, 88).
language_proficiency(nicolas_bordelon, english, 58).

%% ─── Alexis Autin ───

attribute(alexis_autin, charisma, 75).
attribute(alexis_autin, sophistication, 45).
directed_status(alexis_autin, joseph_roy, financially_dependent_on).
directed_status(alexis_autin, ralph_aucoin, offended_by).
trait(alexis_autin, beautiful).
trait(alexis_autin, impudent).
trait(alexis_autin, eccentric).
trait(alexis_autin, female).
trait(alexis_autin, deceitful).
trait(alexis_autin, talkative).
relationship(alexis_autin, elizabeth_landry, esteem).
status(alexis_autin, flattered).
trait(alexis_autin, criminal).
trait(alexis_autin, greedy).
language_proficiency(alexis_autin, french, 92).
language_proficiency(alexis_autin, english, 45).

%% ─── Judith Arceneaux ───

attribute(judith_arceneaux, propriety, 90).
attribute(judith_arceneaux, charisma, 51).
attribute(judith_arceneaux, cunningness, 60).
attribute(judith_arceneaux, nosiness, 70).
attribute(judith_arceneaux, cultural_knowledge, 70).
attribute(judith_arceneaux, sophistication, 60).
relationship(judith_arceneaux, dustin_gaspard, rivals).
status(judith_arceneaux, amused).
trait(judith_arceneaux, innocent_looking).
trait(judith_arceneaux, intelligent).
trait(judith_arceneaux, elegantly_dressed).
trait(judith_arceneaux, wearing_a_first_responder_uniform).
trait(judith_arceneaux, trustworthy).
trait(judith_arceneaux, penetrating).
trait(judith_arceneaux, deceptive).
language_proficiency(judith_arceneaux, french, 89).
language_proficiency(judith_arceneaux, english, 56).

%% ─── Marie Guidroz ───

attribute(marie_guidroz, propriety, 51).
attribute(marie_guidroz, cultural_knowledge, 61).
attribute(marie_guidroz, social_standing, 61).
attribute(marie_guidroz, self_assuredness, 61).
directed_status(marie_guidroz, ralph_aucoin, hates).
directed_status(marie_guidroz, theo_arnaud, owes_a_favor_to).
network(marie_guidroz, marie_claire_savoie, affinity, 61).
status(marie_guidroz, inebriated).
trait(marie_guidroz, ambitious).
trait(marie_guidroz, disdainful).
trait(marie_guidroz, flirtatious).
trait(marie_guidroz, male).
trait(marie_guidroz, mocking).
trait(marie_guidroz, intimidating).
trait(marie_guidroz, rich).
trait(marie_guidroz, unctuous).
trait(marie_guidroz, well_known).
trait(marie_guidroz, wearing_a_first_responder_uniform).
trait(marie_guidroz, rich).
directed_status(marie_guidroz, adrianne_billedeaux, jealous_of).
network(marie_guidroz, elizabeth_huff, credibility, 55).
network(marie_guidroz, elizabeth_huff, curiosity, 65).
language_proficiency(marie_guidroz, french, 80).
language_proficiency(marie_guidroz, english, 70).

%% ─── Elizabeth Huff ───

attribute(elizabeth_huff, charisma, 65).
attribute(elizabeth_huff, propriety, 55).
attribute(elizabeth_huff, sensitiveness, 80).
attribute(elizabeth_huff, social_standing, 30).
trait(elizabeth_huff, virtuous).
trait(elizabeth_huff, beautiful).
trait(elizabeth_huff, poor).
trait(elizabeth_huff, female).
trait(elizabeth_huff, innocent_looking).
language_proficiency(elizabeth_huff, french, 68).
language_proficiency(elizabeth_huff, english, 88).

%% ─── Marie Lavergne ───

trait(marie_lavergne, female).
trait(marie_lavergne, young).
attribute(marie_lavergne, propriety, 61).
trait(marie_lavergne, beautiful).
trait(marie_lavergne, attendee).
trait(marie_lavergne, innocent_looking).
trait(marie_lavergne, charming).
trait(marie_lavergne, ambitious).
trait(marie_lavergne, vain).
trait(marie_lavergne, unctuous).
trait(marie_lavergne, greedy).
attribute(marie_lavergne, cultural_knowledge, 61).
directed_status(marie_lavergne, ralph_aucoin, offended_by).
trait(marie_lavergne, deceitful).
% negated trait: modest
\+ trait(marie_lavergne, modest).
language_proficiency(marie_lavergne, french, 93).
language_proficiency(marie_lavergne, english, 42).

%% ─── Pierre Melancon ───

attribute(pierre_melancon, propriety, 40).
trait(pierre_melancon, charming).
trait(pierre_melancon, eccentric).
attribute(pierre_melancon, sophistication, 75).
attribute(pierre_melancon, cultural_knowledge, 75).
trait(pierre_melancon, provincial).
% negated trait: rich
\+ trait(pierre_melancon, rich).
trait(pierre_melancon, intelligent).
language_proficiency(pierre_melancon, french, 87).
language_proficiency(pierre_melancon, english, 64).

%% ─── Catherine Poirier ───

attribute(catherine_poirier, cultural_knowledge, 80).
trait(catherine_poirier, attendee).
trait(catherine_poirier, academic).
trait(catherine_poirier, innocent_looking).
trait(catherine_poirier, intelligent).
trait(catherine_poirier, joker).
trait(catherine_poirier, academic).
attribute(catherine_poirier, charisma, 61).
status(catherine_poirier, happy).
attribute(catherine_poirier, self_assuredness, 70).
network(catherine_poirier, marie_guidroz, affinity, 65).
relationship(catherine_poirier, marie_guidroz, friends).
attribute(catherine_poirier, propriety, 50).
language_proficiency(catherine_poirier, french, 85).
language_proficiency(catherine_poirier, english, 66).

%% ─── Marie-Louise Sorbier ───

attribute(marie_louise_sorbier, propriety, 71).
attribute(marie_louise_sorbier, sophistication, 61).
attribute(marie_louise_sorbier, sensitiveness, 61).
directed_status(marie_louise_sorbier, nicolas_bordelon, offended_by).
network(marie_louise_sorbier, marie_claire_savoie, affinity, 61).
network(marie_louise_sorbier, jeanne_moutard, emulation, 51).
% negated trait: beautiful
\+ trait(marie_louise_sorbier, beautiful).
trait(marie_louise_sorbier, female).
trait(marie_louise_sorbier, kind).
trait(marie_louise_sorbier, modest).
% negated trait: rich
\+ trait(marie_louise_sorbier, rich).
directed_status(marie_louise_sorbier, elizabeth_landry, ridicules).
language_proficiency(marie_louise_sorbier, french, 94).
language_proficiency(marie_louise_sorbier, english, 38).

%% ─── Anne Drouillon ───

trait(anne_drouillon, academic).
trait(anne_drouillon, security_guard).
attribute(anne_drouillon, cultural_knowledge, 95).
attribute(anne_drouillon, charisma, 30).
trait(anne_drouillon, poorly_dressed).
trait(anne_drouillon, poor).
% negated trait: virtuous
\+ trait(anne_drouillon, virtuous).
language_proficiency(anne_drouillon, french, 96).
language_proficiency(anne_drouillon, english, 32).

%% ─── Marcel Patin ───

trait(marcel_patin, male).
trait(marcel_patin, virtuous).
trait(marcel_patin, devout).
% negated trait: talkative
\+ trait(marcel_patin, talkative).
trait(marcel_patin, rich).
trait(marcel_patin, indifferent).
trait(marcel_patin, cold).
trait(marcel_patin, penetrating).
trait(marcel_patin, greedy).
language_proficiency(marcel_patin, french, 90).
language_proficiency(marcel_patin, english, 50).
