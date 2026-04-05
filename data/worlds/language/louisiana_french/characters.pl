%% Insimul Characters: French Louisiana
%% Sources: characters.json, ensemble cast, exported game characters
%% Converted: 2026-04-03T06:20:23Z
%% Total: 466 characters (32 genealogy + 39 ensemble cast + 395 game)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   ensemble_cast/1 — marks character as Ensemble cast member

%% ═══════════════════════════════════════════════════════════
%% Genealogy Characters (32 entries)
%% ═══════════════════════════════════════════════════════════

%% Jean-Paul Boudreaux
person(jean_paul_boudreaux).
first_name(jean_paul_boudreaux, 'Jean-Paul').
last_name(jean_paul_boudreaux, 'Boudreaux').
full_name(jean_paul_boudreaux, 'Jean-Paul Boudreaux').
gender(jean_paul_boudreaux, male).
alive(jean_paul_boudreaux).
generation(jean_paul_boudreaux, 0).
founder_family(jean_paul_boudreaux).
child(jean_paul_boudreaux, etienne_boudreaux).
child(jean_paul_boudreaux, adele_boudreaux).
spouse(jean_paul_boudreaux, celine_boudreaux).
location(jean_paul_boudreaux, belle_reve).

%% Céline Boudreaux
person(celine_boudreaux).
first_name(celine_boudreaux, 'Céline').
last_name(celine_boudreaux, 'Boudreaux').
full_name(celine_boudreaux, 'Céline Boudreaux').
gender(celine_boudreaux, female).
alive(celine_boudreaux).
generation(celine_boudreaux, 0).
founder_family(celine_boudreaux).
child(celine_boudreaux, etienne_boudreaux).
child(celine_boudreaux, adele_boudreaux).
spouse(celine_boudreaux, jean_paul_boudreaux).
location(celine_boudreaux, belle_reve).

%% Étienne Boudreaux
person(etienne_boudreaux).
first_name(etienne_boudreaux, 'Étienne').
last_name(etienne_boudreaux, 'Boudreaux').
full_name(etienne_boudreaux, 'Étienne Boudreaux').
gender(etienne_boudreaux, male).
alive(etienne_boudreaux).
generation(etienne_boudreaux, 1).
parent(jean_paul_boudreaux, etienne_boudreaux).
parent(celine_boudreaux, etienne_boudreaux).
location(etienne_boudreaux, belle_reve).

%% Adèle Boudreaux
person(adele_boudreaux).
first_name(adele_boudreaux, 'Adèle').
last_name(adele_boudreaux, 'Boudreaux').
full_name(adele_boudreaux, 'Adèle Boudreaux').
gender(adele_boudreaux, female).
alive(adele_boudreaux).
generation(adele_boudreaux, 1).
parent(jean_paul_boudreaux, adele_boudreaux).
parent(celine_boudreaux, adele_boudreaux).
location(adele_boudreaux, belle_reve).

%% Marcel Thibodeaux
person(marcel_thibodeaux).
first_name(marcel_thibodeaux, 'Marcel').
last_name(marcel_thibodeaux, 'Thibodeaux').
full_name(marcel_thibodeaux, 'Marcel Thibodeaux').
gender(marcel_thibodeaux, male).
alive(marcel_thibodeaux).
generation(marcel_thibodeaux, 0).
founder_family(marcel_thibodeaux).
child(marcel_thibodeaux, luc_thibodeaux).
child(marcel_thibodeaux, genevieve_thibodeaux).
spouse(marcel_thibodeaux, amelie_thibodeaux).
location(marcel_thibodeaux, belle_reve).

%% Amélie Thibodeaux
person(amelie_thibodeaux).
first_name(amelie_thibodeaux, 'Amélie').
last_name(amelie_thibodeaux, 'Thibodeaux').
full_name(amelie_thibodeaux, 'Amélie Thibodeaux').
gender(amelie_thibodeaux, female).
alive(amelie_thibodeaux).
generation(amelie_thibodeaux, 0).
founder_family(amelie_thibodeaux).
child(amelie_thibodeaux, luc_thibodeaux).
child(amelie_thibodeaux, genevieve_thibodeaux).
spouse(amelie_thibodeaux, marcel_thibodeaux).
location(amelie_thibodeaux, belle_reve).

%% Luc Thibodeaux
person(luc_thibodeaux).
first_name(luc_thibodeaux, 'Luc').
last_name(luc_thibodeaux, 'Thibodeaux').
full_name(luc_thibodeaux, 'Luc Thibodeaux').
gender(luc_thibodeaux, male).
alive(luc_thibodeaux).
generation(luc_thibodeaux, 1).
parent(marcel_thibodeaux, luc_thibodeaux).
parent(amelie_thibodeaux, luc_thibodeaux).
location(luc_thibodeaux, belle_reve).

%% Geneviève Thibodeaux
person(genevieve_thibodeaux).
first_name(genevieve_thibodeaux, 'Geneviève').
last_name(genevieve_thibodeaux, 'Thibodeaux').
full_name(genevieve_thibodeaux, 'Geneviève Thibodeaux').
gender(genevieve_thibodeaux, female).
alive(genevieve_thibodeaux).
generation(genevieve_thibodeaux, 1).
parent(marcel_thibodeaux, genevieve_thibodeaux).
parent(amelie_thibodeaux, genevieve_thibodeaux).
location(genevieve_thibodeaux, belle_reve).

%% Philippe Broussard
person(philippe_broussard).
first_name(philippe_broussard, 'Philippe').
last_name(philippe_broussard, 'Broussard').
full_name(philippe_broussard, 'Philippe Broussard').
gender(philippe_broussard, male).
alive(philippe_broussard).
generation(philippe_broussard, 0).
founder_family(philippe_broussard).
child(philippe_broussard, remy_broussard).
child(philippe_broussard, corinne_broussard).
spouse(philippe_broussard, isabelle_broussard).
location(philippe_broussard, belle_reve).

%% Isabelle Broussard
person(isabelle_broussard).
first_name(isabelle_broussard, 'Isabelle').
last_name(isabelle_broussard, 'Broussard').
full_name(isabelle_broussard, 'Isabelle Broussard').
gender(isabelle_broussard, female).
alive(isabelle_broussard).
generation(isabelle_broussard, 0).
founder_family(isabelle_broussard).
child(isabelle_broussard, remy_broussard).
child(isabelle_broussard, corinne_broussard).
spouse(isabelle_broussard, philippe_broussard).
location(isabelle_broussard, belle_reve).

%% Rémy Broussard
person(remy_broussard).
first_name(remy_broussard, 'Rémy').
last_name(remy_broussard, 'Broussard').
full_name(remy_broussard, 'Rémy Broussard').
gender(remy_broussard, male).
alive(remy_broussard).
generation(remy_broussard, 1).
parent(philippe_broussard, remy_broussard).
parent(isabelle_broussard, remy_broussard).
location(remy_broussard, belle_reve).

%% Corinne Broussard
person(corinne_broussard).
first_name(corinne_broussard, 'Corinne').
last_name(corinne_broussard, 'Broussard').
full_name(corinne_broussard, 'Corinne Broussard').
gender(corinne_broussard, female).
alive(corinne_broussard).
generation(corinne_broussard, 1).
parent(philippe_broussard, corinne_broussard).
parent(isabelle_broussard, corinne_broussard).
location(corinne_broussard, belle_reve).

%% Antoine LeBlanc
person(antoine_leblanc).
first_name(antoine_leblanc, 'Antoine').
last_name(antoine_leblanc, 'LeBlanc').
full_name(antoine_leblanc, 'Antoine LeBlanc').
gender(antoine_leblanc, male).
alive(antoine_leblanc).
generation(antoine_leblanc, 0).
founder_family(antoine_leblanc).
child(antoine_leblanc, pascal_leblanc).
child(antoine_leblanc, elise_leblanc).
spouse(antoine_leblanc, helene_leblanc).
location(antoine_leblanc, belle_reve).

%% Hélène LeBlanc
person(helene_leblanc).
first_name(helene_leblanc, 'Hélène').
last_name(helene_leblanc, 'LeBlanc').
full_name(helene_leblanc, 'Hélène LeBlanc').
gender(helene_leblanc, female).
alive(helene_leblanc).
generation(helene_leblanc, 0).
founder_family(helene_leblanc).
child(helene_leblanc, pascal_leblanc).
child(helene_leblanc, elise_leblanc).
spouse(helene_leblanc, antoine_leblanc).
location(helene_leblanc, belle_reve).

%% Pascal LeBlanc
person(pascal_leblanc).
first_name(pascal_leblanc, 'Pascal').
last_name(pascal_leblanc, 'LeBlanc').
full_name(pascal_leblanc, 'Pascal LeBlanc').
gender(pascal_leblanc, male).
alive(pascal_leblanc).
generation(pascal_leblanc, 1).
parent(antoine_leblanc, pascal_leblanc).
parent(helene_leblanc, pascal_leblanc).
location(pascal_leblanc, belle_reve).

%% Élise LeBlanc
person(elise_leblanc).
first_name(elise_leblanc, 'Élise').
last_name(elise_leblanc, 'LeBlanc').
full_name(elise_leblanc, 'Élise LeBlanc').
gender(elise_leblanc, female).
alive(elise_leblanc).
generation(elise_leblanc, 1).
parent(antoine_leblanc, elise_leblanc).
parent(helene_leblanc, elise_leblanc).
location(elise_leblanc, belle_reve).

%% Guillaume Fontenot
person(guillaume_fontenot).
first_name(guillaume_fontenot, 'Guillaume').
last_name(guillaume_fontenot, 'Fontenot').
full_name(guillaume_fontenot, 'Guillaume Fontenot').
gender(guillaume_fontenot, male).
alive(guillaume_fontenot).
generation(guillaume_fontenot, 0).
founder_family(guillaume_fontenot).
child(guillaume_fontenot, olivier_fontenot).
child(guillaume_fontenot, valerie_fontenot).
spouse(guillaume_fontenot, chantal_fontenot).
location(guillaume_fontenot, belle_reve).

%% Chantal Fontenot
person(chantal_fontenot).
first_name(chantal_fontenot, 'Chantal').
last_name(chantal_fontenot, 'Fontenot').
full_name(chantal_fontenot, 'Chantal Fontenot').
gender(chantal_fontenot, female).
alive(chantal_fontenot).
generation(chantal_fontenot, 0).
founder_family(chantal_fontenot).
child(chantal_fontenot, olivier_fontenot).
child(chantal_fontenot, valerie_fontenot).
spouse(chantal_fontenot, guillaume_fontenot).
location(chantal_fontenot, belle_reve).

%% Olivier Fontenot
person(olivier_fontenot).
first_name(olivier_fontenot, 'Olivier').
last_name(olivier_fontenot, 'Fontenot').
full_name(olivier_fontenot, 'Olivier Fontenot').
gender(olivier_fontenot, male).
alive(olivier_fontenot).
generation(olivier_fontenot, 1).
parent(guillaume_fontenot, olivier_fontenot).
parent(chantal_fontenot, olivier_fontenot).
location(olivier_fontenot, belle_reve).

%% Valérie Fontenot
person(valerie_fontenot).
first_name(valerie_fontenot, 'Valérie').
last_name(valerie_fontenot, 'Fontenot').
full_name(valerie_fontenot, 'Valérie Fontenot').
gender(valerie_fontenot, female).
alive(valerie_fontenot).
generation(valerie_fontenot, 1).
parent(guillaume_fontenot, valerie_fontenot).
parent(chantal_fontenot, valerie_fontenot).
location(valerie_fontenot, belle_reve).

%% Bastien Arceneaux
person(bastien_arceneaux).
first_name(bastien_arceneaux, 'Bastien').
last_name(bastien_arceneaux, 'Arceneaux').
full_name(bastien_arceneaux, 'Bastien Arceneaux').
gender(bastien_arceneaux, male).
alive(bastien_arceneaux).
generation(bastien_arceneaux, 0).
founder_family(bastien_arceneaux).
child(bastien_arceneaux, julien_arceneaux).
child(bastien_arceneaux, marguerite_arceneaux).
spouse(bastien_arceneaux, monique_arceneaux).
location(bastien_arceneaux, belle_reve).

%% Monique Arceneaux
person(monique_arceneaux).
first_name(monique_arceneaux, 'Monique').
last_name(monique_arceneaux, 'Arceneaux').
full_name(monique_arceneaux, 'Monique Arceneaux').
gender(monique_arceneaux, female).
alive(monique_arceneaux).
generation(monique_arceneaux, 0).
founder_family(monique_arceneaux).
child(monique_arceneaux, julien_arceneaux).
child(monique_arceneaux, marguerite_arceneaux).
spouse(monique_arceneaux, bastien_arceneaux).
location(monique_arceneaux, belle_reve).

%% Julien Arceneaux
person(julien_arceneaux).
first_name(julien_arceneaux, 'Julien').
last_name(julien_arceneaux, 'Arceneaux').
full_name(julien_arceneaux, 'Julien Arceneaux').
gender(julien_arceneaux, male).
alive(julien_arceneaux).
generation(julien_arceneaux, 1).
parent(bastien_arceneaux, julien_arceneaux).
parent(monique_arceneaux, julien_arceneaux).
location(julien_arceneaux, belle_reve).

%% Marguerite Arceneaux
person(marguerite_arceneaux).
first_name(marguerite_arceneaux, 'Marguerite').
last_name(marguerite_arceneaux, 'Arceneaux').
full_name(marguerite_arceneaux, 'Marguerite Arceneaux').
gender(marguerite_arceneaux, female).
alive(marguerite_arceneaux).
generation(marguerite_arceneaux, 1).
parent(bastien_arceneaux, marguerite_arceneaux).
parent(monique_arceneaux, marguerite_arceneaux).
location(marguerite_arceneaux, belle_reve).

%% François Gaspard
person(francois_gaspard).
first_name(francois_gaspard, 'François').
last_name(francois_gaspard, 'Gaspard').
full_name(francois_gaspard, 'François Gaspard').
gender(francois_gaspard, male).
alive(francois_gaspard).
generation(francois_gaspard, 0).
founder_family(francois_gaspard).
child(francois_gaspard, theo_gaspard).
child(francois_gaspard, leonie_gaspard).
spouse(francois_gaspard, simone_gaspard).
location(francois_gaspard, belle_reve).

%% Simone Gaspard
person(simone_gaspard).
first_name(simone_gaspard, 'Simone').
last_name(simone_gaspard, 'Gaspard').
full_name(simone_gaspard, 'Simone Gaspard').
gender(simone_gaspard, female).
alive(simone_gaspard).
generation(simone_gaspard, 0).
founder_family(simone_gaspard).
child(simone_gaspard, theo_gaspard).
child(simone_gaspard, leonie_gaspard).
spouse(simone_gaspard, francois_gaspard).
location(simone_gaspard, belle_reve).

%% Théo Gaspard
person(theo_gaspard).
first_name(theo_gaspard, 'Théo').
last_name(theo_gaspard, 'Gaspard').
full_name(theo_gaspard, 'Théo Gaspard').
gender(theo_gaspard, male).
alive(theo_gaspard).
generation(theo_gaspard, 1).
parent(francois_gaspard, theo_gaspard).
parent(simone_gaspard, theo_gaspard).
location(theo_gaspard, belle_reve).

%% Léonie Gaspard
person(leonie_gaspard).
first_name(leonie_gaspard, 'Léonie').
last_name(leonie_gaspard, 'Gaspard').
full_name(leonie_gaspard, 'Léonie Gaspard').
gender(leonie_gaspard, female).
alive(leonie_gaspard).
generation(leonie_gaspard, 1).
parent(francois_gaspard, leonie_gaspard).
parent(simone_gaspard, leonie_gaspard).
location(leonie_gaspard, belle_reve).

%% Jacques Richard
person(jacques_richard).
first_name(jacques_richard, 'Jacques').
last_name(jacques_richard, 'Richard').
full_name(jacques_richard, 'Jacques Richard').
gender(jacques_richard, male).
alive(jacques_richard).
generation(jacques_richard, 0).
founder_family(jacques_richard).
child(jacques_richard, gabriel_richard).
child(jacques_richard, sophie_richard).
spouse(jacques_richard, delphine_richard).
location(jacques_richard, belle_reve).

%% Delphine Richard
person(delphine_richard).
first_name(delphine_richard, 'Delphine').
last_name(delphine_richard, 'Richard').
full_name(delphine_richard, 'Delphine Richard').
gender(delphine_richard, female).
alive(delphine_richard).
generation(delphine_richard, 0).
founder_family(delphine_richard).
child(delphine_richard, gabriel_richard).
child(delphine_richard, sophie_richard).
spouse(delphine_richard, jacques_richard).
location(delphine_richard, belle_reve).

%% Gabriel Richard
person(gabriel_richard).
first_name(gabriel_richard, 'Gabriel').
last_name(gabriel_richard, 'Richard').
full_name(gabriel_richard, 'Gabriel Richard').
gender(gabriel_richard, male).
alive(gabriel_richard).
generation(gabriel_richard, 1).
parent(jacques_richard, gabriel_richard).
parent(delphine_richard, gabriel_richard).
location(gabriel_richard, belle_reve).

%% Sophie Richard
person(sophie_richard).
first_name(sophie_richard, 'Sophie').
last_name(sophie_richard, 'Richard').
full_name(sophie_richard, 'Sophie Richard').
gender(sophie_richard, female).
alive(sophie_richard).
generation(sophie_richard, 1).
parent(jacques_richard, sophie_richard).
parent(delphine_richard, sophie_richard).
location(sophie_richard, belle_reve).

%% ═══════════════════════════════════════════════════════════
%% Ensemble Cast (39 entries)
%% Source: data/ensemble/cast/louisiana-french.json
%% ═══════════════════════════════════════════════════════════

%% Jacob Chauvin
person(jacob_chauvin).
ensemble_cast(jacob_chauvin).
first_name(jacob_chauvin, 'Jacob').
last_name(jacob_chauvin, 'Chauvin').
full_name(jacob_chauvin, 'Jacob Chauvin').
alive(jacob_chauvin).

%% Alphonse Martin
person(alphonse_martin).
ensemble_cast(alphonse_martin).
first_name(alphonse_martin, 'Alphonse').
last_name(alphonse_martin, 'Martin').
full_name(alphonse_martin, 'Alphonse Martin').
alive(alphonse_martin).

%% Grace Huval
person(grace_huval).
ensemble_cast(grace_huval).
first_name(grace_huval, 'Grace').
last_name(grace_huval, 'Huval').
full_name(grace_huval, 'Grace Huval').
alive(grace_huval).

%% Ralph Aucoin
person(ralph_aucoin).
ensemble_cast(ralph_aucoin).
first_name(ralph_aucoin, 'Ralph').
last_name(ralph_aucoin, 'Aucoin').
full_name(ralph_aucoin, 'Ralph Aucoin').
alive(ralph_aucoin).

%% Cora DeCuir
person(cora_decuir).
ensemble_cast(cora_decuir).
first_name(cora_decuir, 'Cora').
last_name(cora_decuir, 'DeCuir').
full_name(cora_decuir, 'Cora DeCuir').
alive(cora_decuir).

%% Francois LeBlanc
person(francois_leblanc).
ensemble_cast(francois_leblanc).
first_name(francois_leblanc, 'Francois').
last_name(francois_leblanc, 'LeBlanc').
full_name(francois_leblanc, 'Francois LeBlanc').
alive(francois_leblanc).

%% Jean Billeaud
person(jean_billeaud).
ensemble_cast(jean_billeaud).
first_name(jean_billeaud, 'Jean').
last_name(jean_billeaud, 'Billeaud').
full_name(jean_billeaud, 'Jean Billeaud').
alive(jean_billeaud).

%% Christophe Bertrand
person(christophe_bertrand).
ensemble_cast(christophe_bertrand).
first_name(christophe_bertrand, 'Christophe').
last_name(christophe_bertrand, 'Bertrand').
full_name(christophe_bertrand, 'Christophe Bertrand').
alive(christophe_bertrand).

%% Elizabeth Landry
person(elizabeth_landry).
ensemble_cast(elizabeth_landry).
first_name(elizabeth_landry, 'Elizabeth').
last_name(elizabeth_landry, 'Landry').
full_name(elizabeth_landry, 'Elizabeth Landry').
alive(elizabeth_landry).

%% Renee Hebert
person(renee_hebert).
ensemble_cast(renee_hebert).
first_name(renee_hebert, 'Renee').
last_name(renee_hebert, 'Hebert').
full_name(renee_hebert, 'Renee Hebert').
alive(renee_hebert).

%% Victoria Guidry
person(victoria_guidry).
ensemble_cast(victoria_guidry).
first_name(victoria_guidry, 'Victoria').
last_name(victoria_guidry, 'Guidry').
full_name(victoria_guidry, 'Victoria Guidry').
alive(victoria_guidry).

%% Adrianne Billedeaux
person(adrianne_billedeaux).
ensemble_cast(adrianne_billedeaux).
first_name(adrianne_billedeaux, 'Adrianne').
last_name(adrianne_billedeaux, 'Billedeaux').
full_name(adrianne_billedeaux, 'Adrianne Billedeaux').
alive(adrianne_billedeaux).

%% Jeanne Comeaux
person(jeanne_comeaux).
ensemble_cast(jeanne_comeaux).
first_name(jeanne_comeaux, 'Jeanne').
last_name(jeanne_comeaux, 'Comeaux').
full_name(jeanne_comeaux, 'Jeanne Comeaux').
alive(jeanne_comeaux).

%% Dustin Gaspard
person(dustin_gaspard).
ensemble_cast(dustin_gaspard).
first_name(dustin_gaspard, 'Dustin').
last_name(dustin_gaspard, 'Gaspard').
full_name(dustin_gaspard, 'Dustin Gaspard').
alive(dustin_gaspard).

%% Mary Delahoussaye
person(mary_delahoussaye).
ensemble_cast(mary_delahoussaye).
first_name(mary_delahoussaye, 'Mary').
last_name(mary_delahoussaye, 'Delahoussaye').
full_name(mary_delahoussaye, 'Mary Delahoussaye').
alive(mary_delahoussaye).

%% Théo Arnaud
person(theo_arnaud).
ensemble_cast(theo_arnaud).
first_name(theo_arnaud, 'Théo').
last_name(theo_arnaud, 'Arnaud').
full_name(theo_arnaud, 'Théo Arnaud').
alive(theo_arnaud).

%% Celila Broussard
person(celila_broussard).
ensemble_cast(celila_broussard).
first_name(celila_broussard, 'Celila').
last_name(celila_broussard, 'Broussard').
full_name(celila_broussard, 'Celila Broussard').
alive(celila_broussard).

%% Amy Robichaux
person(amy_robichaux).
ensemble_cast(amy_robichaux).
first_name(amy_robichaux, 'Amy').
last_name(amy_robichaux, 'Robichaux').
full_name(amy_robichaux, 'Amy Robichaux').
alive(amy_robichaux).

%% Charles Devillier
person(charles_devillier).
ensemble_cast(charles_devillier).
first_name(charles_devillier, 'Charles').
last_name(charles_devillier, 'Devillier').
full_name(charles_devillier, 'Charles Devillier').
alive(charles_devillier).

%% Elie Charpentier
person(elie_charpentier).
ensemble_cast(elie_charpentier).
first_name(elie_charpentier, 'Elie').
last_name(elie_charpentier, 'Charpentier').
full_name(elie_charpentier, 'Elie Charpentier').
alive(elie_charpentier).

%% Claude Gaudet
person(claude_gaudet).
ensemble_cast(claude_gaudet).
first_name(claude_gaudet, 'Claude').
last_name(claude_gaudet, 'Gaudet').
full_name(claude_gaudet, 'Claude Gaudet').
alive(claude_gaudet).

%% Ralph Langlois
person(ralph_langlois).
ensemble_cast(ralph_langlois).
first_name(ralph_langlois, 'Ralph').
last_name(ralph_langlois, 'Langlois').
full_name(ralph_langlois, 'Ralph Langlois').
alive(ralph_langlois).

%% Jeanne Moutard
person(jeanne_moutard).
ensemble_cast(jeanne_moutard).
first_name(jeanne_moutard, 'Jeanne').
last_name(jeanne_moutard, 'Moutard').
full_name(jeanne_moutard, 'Jeanne Moutard').
alive(jeanne_moutard).

%% Alexandre Nezat
person(alexandre_nezat).
ensemble_cast(alexandre_nezat).
first_name(alexandre_nezat, 'Alexandre').
last_name(alexandre_nezat, 'Nezat').
full_name(alexandre_nezat, 'Alexandre Nezat').
alive(alexandre_nezat).

%% Lucien Noel
person(lucien_noel).
ensemble_cast(lucien_noel).
first_name(lucien_noel, 'Lucien').
last_name(lucien_noel, 'Noel').
full_name(lucien_noel, 'Lucien Noel').
alive(lucien_noel).

%% Joseph Roy
person(joseph_roy).
ensemble_cast(joseph_roy).
first_name(joseph_roy, 'Joseph').
last_name(joseph_roy, 'Roy').
full_name(joseph_roy, 'Joseph Roy').
alive(joseph_roy).

%% Marie-Claire Savoie
person(marie_claire_savoie).
ensemble_cast(marie_claire_savoie).
first_name(marie_claire_savoie, 'Marie-Claire').
last_name(marie_claire_savoie, 'Savoie').
full_name(marie_claire_savoie, 'Marie-Claire Savoie').
alive(marie_claire_savoie).

%% Claude Robin
person(claude_robin).
ensemble_cast(claude_robin).
first_name(claude_robin, 'Claude').
last_name(claude_robin, 'Robin').
full_name(claude_robin, 'Claude Robin').
alive(claude_robin).

%% Nicolas Bordelon
person(nicolas_bordelon).
ensemble_cast(nicolas_bordelon).
first_name(nicolas_bordelon, 'Nicolas').
last_name(nicolas_bordelon, 'Bordelon').
full_name(nicolas_bordelon, 'Nicolas Bordelon').
alive(nicolas_bordelon).

%% Alexis Autin
person(alexis_autin).
ensemble_cast(alexis_autin).
first_name(alexis_autin, 'Alexis').
last_name(alexis_autin, 'Autin').
full_name(alexis_autin, 'Alexis Autin').
alive(alexis_autin).

%% Judith Arceneaux
person(judith_arceneaux).
ensemble_cast(judith_arceneaux).
first_name(judith_arceneaux, 'Judith').
last_name(judith_arceneaux, 'Arceneaux').
full_name(judith_arceneaux, 'Judith Arceneaux').
alive(judith_arceneaux).

%% Marie Guidroz
person(marie_guidroz).
ensemble_cast(marie_guidroz).
first_name(marie_guidroz, 'Marie').
last_name(marie_guidroz, 'Guidroz').
full_name(marie_guidroz, 'Marie Guidroz').
alive(marie_guidroz).

%% Elizabeth Huff
person(elizabeth_huff).
ensemble_cast(elizabeth_huff).
first_name(elizabeth_huff, 'Elizabeth').
last_name(elizabeth_huff, 'Huff').
full_name(elizabeth_huff, 'Elizabeth Huff').
alive(elizabeth_huff).

%% Marie Lavergne
person(marie_lavergne).
ensemble_cast(marie_lavergne).
first_name(marie_lavergne, 'Marie').
last_name(marie_lavergne, 'Lavergne').
full_name(marie_lavergne, 'Marie Lavergne').
alive(marie_lavergne).

%% Pierre Melancon
person(pierre_melancon).
ensemble_cast(pierre_melancon).
first_name(pierre_melancon, 'Pierre').
last_name(pierre_melancon, 'Melancon').
full_name(pierre_melancon, 'Pierre Melancon').
alive(pierre_melancon).

%% Catherine Poirier
person(catherine_poirier).
ensemble_cast(catherine_poirier).
first_name(catherine_poirier, 'Catherine').
last_name(catherine_poirier, 'Poirier').
full_name(catherine_poirier, 'Catherine Poirier').
alive(catherine_poirier).

%% Marie-Louise Sorbier
person(marie_louise_sorbier).
ensemble_cast(marie_louise_sorbier).
first_name(marie_louise_sorbier, 'Marie-Louise').
last_name(marie_louise_sorbier, 'Sorbier').
full_name(marie_louise_sorbier, 'Marie-Louise Sorbier').
alive(marie_louise_sorbier).

%% Anne Drouillon
person(anne_drouillon).
ensemble_cast(anne_drouillon).
first_name(anne_drouillon, 'Anne').
last_name(anne_drouillon, 'Drouillon').
full_name(anne_drouillon, 'Anne Drouillon').
alive(anne_drouillon).

%% Marcel Patin
person(marcel_patin).
ensemble_cast(marcel_patin).
first_name(marcel_patin, 'Marcel').
last_name(marcel_patin, 'Patin').
full_name(marcel_patin, 'Marcel Patin').
alive(marcel_patin).

%% ═══════════════════════════════════════════════════════════
%% Exported Game Characters (395 entries)
%% Source: characters_2.pl (converted from ID-based to name-based)
%% ═══════════════════════════════════════════════════════════

%% Jean Hébert
person(jean_hebert).
first_name(jean_hebert, 'Jean').
last_name(jean_hebert, 'Hébert').
full_name(jean_hebert, 'Jean Hébert').
gender(jean_hebert, male).
alive(jean_hebert).
personality(jean_hebert, openness, 0.34).
personality(jean_hebert, conscientiousness, 0.58).
personality(jean_hebert, extroversion, 0.91).
personality(jean_hebert, agreeableness, -0.13).
personality(jean_hebert, neuroticism, -0.37).

%% Marie Hébert
person(marie_hebert).
first_name(marie_hebert, 'Marie').
last_name(marie_hebert, 'Hébert').
full_name(marie_hebert, 'Marie Hébert').
gender(marie_hebert, female).
alive(marie_hebert).
personality(marie_hebert, openness, -0.41).
personality(marie_hebert, conscientiousness, -0.72).
personality(marie_hebert, extroversion, 0.18).
personality(marie_hebert, agreeableness, 0.3).
personality(marie_hebert, neuroticism, 0.03).

%% Jeanne Broussard
person(jeanne_broussard).
first_name(jeanne_broussard, 'Jeanne').
last_name(jeanne_broussard, 'Broussard').
full_name(jeanne_broussard, 'Jeanne Broussard').
gender(jeanne_broussard, female).
alive(jeanne_broussard).
personality(jeanne_broussard, openness, 0.06).
personality(jeanne_broussard, conscientiousness, -0.14).
personality(jeanne_broussard, extroversion, 0.56).
personality(jeanne_broussard, agreeableness, 0.14).
personality(jeanne_broussard, neuroticism, -0.2).

%% Jacques Broussard
person(jacques_broussard).
first_name(jacques_broussard, 'Jacques').
last_name(jacques_broussard, 'Broussard').
full_name(jacques_broussard, 'Jacques Broussard').
gender(jacques_broussard, male).
alive(jacques_broussard).
personality(jacques_broussard, openness, 0.8).
personality(jacques_broussard, conscientiousness, 0.3).
personality(jacques_broussard, extroversion, 0.54).
personality(jacques_broussard, agreeableness, 0.99).
personality(jacques_broussard, neuroticism, 0.77).

%% Marguerite Broussard
person(marguerite_broussard).
first_name(marguerite_broussard, 'Marguerite').
last_name(marguerite_broussard, 'Broussard').
full_name(marguerite_broussard, 'Marguerite Broussard').
gender(marguerite_broussard, female).
alive(marguerite_broussard).
personality(marguerite_broussard, openness, -0.13).
personality(marguerite_broussard, conscientiousness, 0.6).
personality(marguerite_broussard, extroversion, -0.36).
personality(marguerite_broussard, agreeableness, 0.42).
personality(marguerite_broussard, neuroticism, 0.14).

%% Pierre Broussard
person(pierre_broussard).
first_name(pierre_broussard, 'Pierre').
last_name(pierre_broussard, 'Broussard').
full_name(pierre_broussard, 'Pierre Broussard').
gender(pierre_broussard, male).
alive(pierre_broussard).
personality(pierre_broussard, openness, 0.39).
personality(pierre_broussard, conscientiousness, 0.3).
personality(pierre_broussard, extroversion, 0.05).
personality(pierre_broussard, agreeableness, 0.83).
personality(pierre_broussard, neuroticism, 0.29).

%% Paul Broussard
person(paul_broussard).
first_name(paul_broussard, 'Paul').
last_name(paul_broussard, 'Broussard').
full_name(paul_broussard, 'Paul Broussard').
gender(paul_broussard, male).
alive(paul_broussard).
personality(paul_broussard, openness, 0.53).
personality(paul_broussard, conscientiousness, 0.58).
personality(paul_broussard, extroversion, 0.15).
personality(paul_broussard, agreeableness, 0.85).
personality(paul_broussard, neuroticism, 0.62).

%% Françoise Cormier
person(francoise_cormier).
first_name(francoise_cormier, 'Françoise').
last_name(francoise_cormier, 'Cormier').
full_name(francoise_cormier, 'Françoise Cormier').
gender(francoise_cormier, female).
alive(francoise_cormier).
personality(francoise_cormier, openness, 0.47).
personality(francoise_cormier, conscientiousness, 0.59).
personality(francoise_cormier, extroversion, 0.23).
personality(francoise_cormier, agreeableness, 0.88).
personality(francoise_cormier, neuroticism, 0.52).

%% Louis Broussard
person(louis_broussard).
first_name(louis_broussard, 'Louis').
last_name(louis_broussard, 'Broussard').
full_name(louis_broussard, 'Louis Broussard').
gender(louis_broussard, male).
alive(louis_broussard).
personality(louis_broussard, openness, 0.19).
personality(louis_broussard, conscientiousness, 0.61).
personality(louis_broussard, extroversion, -0.01).
personality(louis_broussard, agreeableness, 0.66).
personality(louis_broussard, neuroticism, 0.27).

%% François Boudreaux
person(francois_boudreaux).
first_name(francois_boudreaux, 'François').
last_name(francois_boudreaux, 'Boudreaux').
full_name(francois_boudreaux, 'François Boudreaux').
gender(francois_boudreaux, male).
alive(francois_boudreaux).
personality(francois_boudreaux, openness, -0.77).
personality(francois_boudreaux, conscientiousness, -0.21).
personality(francois_boudreaux, extroversion, -0.81).
personality(francois_boudreaux, agreeableness, -0.62).
personality(francois_boudreaux, neuroticism, -0.04).

%% Louise Boudreaux
person(louise_boudreaux).
first_name(louise_boudreaux, 'Louise').
last_name(louise_boudreaux, 'Boudreaux').
full_name(louise_boudreaux, 'Louise Boudreaux').
gender(louise_boudreaux, female).
alive(louise_boudreaux).
personality(louise_boudreaux, openness, 0.72).
personality(louise_boudreaux, conscientiousness, 0.25).
personality(louise_boudreaux, extroversion, -0.4).
personality(louise_boudreaux, agreeableness, 0.16).
personality(louise_boudreaux, neuroticism, -0.17).

%% Anne Cormier
person(anne_cormier).
first_name(anne_cormier, 'Anne').
last_name(anne_cormier, 'Cormier').
full_name(anne_cormier, 'Anne Cormier').
gender(anne_cormier, female).
alive(anne_cormier).
personality(anne_cormier, openness, 0.1).
personality(anne_cormier, conscientiousness, 0.14).
personality(anne_cormier, extroversion, -0.75).
personality(anne_cormier, agreeableness, -0.12).
personality(anne_cormier, neuroticism, -0.23).

%% Henri Boudreaux
person(henri_boudreaux).
first_name(henri_boudreaux, 'Henri').
last_name(henri_boudreaux, 'Boudreaux').
full_name(henri_boudreaux, 'Henri Boudreaux').
gender(henri_boudreaux, male).
alive(henri_boudreaux).
personality(henri_boudreaux, openness, 0.05).
personality(henri_boudreaux, conscientiousness, -0.13).
personality(henri_boudreaux, extroversion, -0.78).
personality(henri_boudreaux, agreeableness, -0.25).
personality(henri_boudreaux, neuroticism, -0.06).

%% Charles Guidry
person(charles_guidry).
first_name(charles_guidry, 'Charles').
last_name(charles_guidry, 'Guidry').
full_name(charles_guidry, 'Charles Guidry').
gender(charles_guidry, male).
alive(charles_guidry).
personality(charles_guidry, openness, 0.67).
personality(charles_guidry, conscientiousness, 0.75).
personality(charles_guidry, extroversion, 0.38).
personality(charles_guidry, agreeableness, -0.91).
personality(charles_guidry, neuroticism, -0.84).

%% Thérèse Guidry
person(therese_guidry).
first_name(therese_guidry, 'Thérèse').
last_name(therese_guidry, 'Guidry').
full_name(therese_guidry, 'Thérèse Guidry').
gender(therese_guidry, female).
alive(therese_guidry).
personality(therese_guidry, openness, 0.83).
personality(therese_guidry, conscientiousness, 0.94).
personality(therese_guidry, extroversion, 0.23).
personality(therese_guidry, agreeableness, 0.96).
personality(therese_guidry, neuroticism, 0.49).

%% Joseph Robichaux
person(joseph_robichaux).
first_name(joseph_robichaux, 'Joseph').
last_name(joseph_robichaux, 'Robichaux').
full_name(joseph_robichaux, 'Joseph Robichaux').
gender(joseph_robichaux, male).
alive(joseph_robichaux).
personality(joseph_robichaux, openness, -0.97).
personality(joseph_robichaux, conscientiousness, 0.02).
personality(joseph_robichaux, extroversion, 0.98).
personality(joseph_robichaux, agreeableness, 0.75).
personality(joseph_robichaux, neuroticism, -0.1).

%% Catherine Robichaux
person(catherine_robichaux).
first_name(catherine_robichaux, 'Catherine').
last_name(catherine_robichaux, 'Robichaux').
full_name(catherine_robichaux, 'Catherine Robichaux').
gender(catherine_robichaux, female).
alive(catherine_robichaux).
personality(catherine_robichaux, openness, -0.27).
personality(catherine_robichaux, conscientiousness, -0.59).
personality(catherine_robichaux, extroversion, -0.55).
personality(catherine_robichaux, agreeableness, -0.92).
personality(catherine_robichaux, neuroticism, -0.86).

%% Madeleine Boudreaux
person(madeleine_boudreaux).
first_name(madeleine_boudreaux, 'Madeleine').
last_name(madeleine_boudreaux, 'Boudreaux').
full_name(madeleine_boudreaux, 'Madeleine Boudreaux').
gender(madeleine_boudreaux, female).
alive(madeleine_boudreaux).
personality(madeleine_boudreaux, openness, -0.49).
personality(madeleine_boudreaux, conscientiousness, -0.48).
personality(madeleine_boudreaux, extroversion, 0.3).
personality(madeleine_boudreaux, agreeableness, -0.15).
personality(madeleine_boudreaux, neuroticism, -0.38).

%% Élisabeth Aucoin
person(elisabeth_aucoin).
first_name(elisabeth_aucoin, 'Élisabeth').
last_name(elisabeth_aucoin, 'Aucoin').
full_name(elisabeth_aucoin, 'Élisabeth Aucoin').
gender(elisabeth_aucoin, female).
alive(elisabeth_aucoin).
personality(elisabeth_aucoin, openness, -0.67).
personality(elisabeth_aucoin, conscientiousness, -0.4).
personality(elisabeth_aucoin, extroversion, 0.16).
personality(elisabeth_aucoin, agreeableness, -0.28).
personality(elisabeth_aucoin, neuroticism, -0.48).

%% Joséphine Broussard
person(josephine_broussard).
first_name(josephine_broussard, 'Joséphine').
last_name(josephine_broussard, 'Broussard').
full_name(josephine_broussard, 'Joséphine Broussard').
gender(josephine_broussard, female).
alive(josephine_broussard).
personality(josephine_broussard, openness, -0.59).
personality(josephine_broussard, conscientiousness, -0.4).
personality(josephine_broussard, extroversion, 0.2).
personality(josephine_broussard, agreeableness, -0.25).
personality(josephine_broussard, neuroticism, -0.62).

%% Antoinette Breaux
person(antoinette_breaux).
first_name(antoinette_breaux, 'Antoinette').
last_name(antoinette_breaux, 'Breaux').
full_name(antoinette_breaux, 'Antoinette Breaux').
gender(antoinette_breaux, female).
alive(antoinette_breaux).
personality(antoinette_breaux, openness, -0.5).
personality(antoinette_breaux, conscientiousness, -0.09).
personality(antoinette_breaux, extroversion, 0.17).
personality(antoinette_breaux, agreeableness, 0.01).
personality(antoinette_breaux, neuroticism, -0.43).

%% Antoine Breaux
person(antoine_breaux).
first_name(antoine_breaux, 'Antoine').
last_name(antoine_breaux, 'Breaux').
full_name(antoine_breaux, 'Antoine Breaux').
gender(antoine_breaux, male).
alive(antoine_breaux).
personality(antoine_breaux, openness, 0.96).
personality(antoine_breaux, conscientiousness, -0.87).
personality(antoine_breaux, extroversion, -0.29).
personality(antoine_breaux, agreeableness, -0.22).
personality(antoine_breaux, neuroticism, 0.28).

%% Hélène Breaux
person(helene_breaux).
first_name(helene_breaux, 'Hélène').
last_name(helene_breaux, 'Breaux').
full_name(helene_breaux, 'Hélène Breaux').
gender(helene_breaux, female).
alive(helene_breaux).
personality(helene_breaux, openness, 0.85).
personality(helene_breaux, conscientiousness, -0.99).
personality(helene_breaux, extroversion, -0.1).
personality(helene_breaux, agreeableness, 0.88).
personality(helene_breaux, neuroticism, 0.63).

%% Geneviève Robichaux
person(genevieve_robichaux).
first_name(genevieve_robichaux, 'Geneviève').
last_name(genevieve_robichaux, 'Robichaux').
full_name(genevieve_robichaux, 'Geneviève Robichaux').
gender(genevieve_robichaux, female).
alive(genevieve_robichaux).
personality(genevieve_robichaux, openness, 0.93).
personality(genevieve_robichaux, conscientiousness, -0.97).
personality(genevieve_robichaux, extroversion, -0.21).
personality(genevieve_robichaux, agreeableness, 0.37).
personality(genevieve_robichaux, neuroticism, 0.62).

%% Michel Breaux
person(michel_breaux).
first_name(michel_breaux, 'Michel').
last_name(michel_breaux, 'Breaux').
full_name(michel_breaux, 'Michel Breaux').
gender(michel_breaux, male).
alive(michel_breaux).
personality(michel_breaux, openness, 1.0).
personality(michel_breaux, conscientiousness, -0.74).
personality(michel_breaux, extroversion, -0.33).
personality(michel_breaux, agreeableness, 0.23).
personality(michel_breaux, neuroticism, 0.38).

%% Suzanne Broussard
person(suzanne_broussard).
first_name(suzanne_broussard, 'Suzanne').
last_name(suzanne_broussard, 'Broussard').
full_name(suzanne_broussard, 'Suzanne Broussard').
gender(suzanne_broussard, female).
alive(suzanne_broussard).
personality(suzanne_broussard, openness, 0.71).
personality(suzanne_broussard, conscientiousness, -1.0).
personality(suzanne_broussard, extroversion, -0.1).
personality(suzanne_broussard, agreeableness, 0.15).
personality(suzanne_broussard, neuroticism, 0.53).

%% Émile Breaux
person(emile_breaux).
first_name(emile_breaux, 'Émile').
last_name(emile_breaux, 'Breaux').
full_name(emile_breaux, 'Émile Breaux').
gender(emile_breaux, male).
alive(emile_breaux).
personality(emile_breaux, openness, 0.73).
personality(emile_breaux, conscientiousness, -1.0).
personality(emile_breaux, extroversion, -0.23).
personality(emile_breaux, agreeableness, 0.35).
personality(emile_breaux, neuroticism, 0.57).

%% Cécile Breaux
person(cecile_breaux).
first_name(cecile_breaux, 'Cécile').
last_name(cecile_breaux, 'Breaux').
full_name(cecile_breaux, 'Cécile Breaux').
gender(cecile_breaux, female).
alive(cecile_breaux).
personality(cecile_breaux, openness, 0.97).
personality(cecile_breaux, conscientiousness, -0.91).
personality(cecile_breaux, extroversion, -0.03).
personality(cecile_breaux, agreeableness, 0.25).
personality(cecile_breaux, neuroticism, 0.39).

%% Claude Breaux
person(claude_breaux).
first_name(claude_breaux, 'Claude').
last_name(claude_breaux, 'Breaux').
full_name(claude_breaux, 'Claude Breaux').
gender(claude_breaux, male).
alive(claude_breaux).
personality(claude_breaux, openness, 0.84).
personality(claude_breaux, conscientiousness, -0.99).
personality(claude_breaux, extroversion, -0.14).
personality(claude_breaux, agreeableness, 0.4).
personality(claude_breaux, neuroticism, 0.48).

%% René Bergeron
person(rene_bergeron).
first_name(rene_bergeron, 'René').
last_name(rene_bergeron, 'Bergeron').
full_name(rene_bergeron, 'René Bergeron').
gender(rene_bergeron, male).
alive(rene_bergeron).
personality(rene_bergeron, openness, 0.39).
personality(rene_bergeron, conscientiousness, -0.29).
personality(rene_bergeron, extroversion, -0.72).
personality(rene_bergeron, agreeableness, -0.86).
personality(rene_bergeron, neuroticism, 0.9).

%% Charlotte Bergeron
person(charlotte_bergeron).
first_name(charlotte_bergeron, 'Charlotte').
last_name(charlotte_bergeron, 'Bergeron').
full_name(charlotte_bergeron, 'Charlotte Bergeron').
gender(charlotte_bergeron, female).
alive(charlotte_bergeron).
personality(charlotte_bergeron, openness, 0.58).
personality(charlotte_bergeron, conscientiousness, -0.02).
personality(charlotte_bergeron, extroversion, 0.54).
personality(charlotte_bergeron, agreeableness, -0.63).
personality(charlotte_bergeron, neuroticism, -0.16).

%% Guillaume Mouton
person(guillaume_mouton).
first_name(guillaume_mouton, 'Guillaume').
last_name(guillaume_mouton, 'Mouton').
full_name(guillaume_mouton, 'Guillaume Mouton').
gender(guillaume_mouton, male).
alive(guillaume_mouton).
personality(guillaume_mouton, openness, 0.6).
personality(guillaume_mouton, conscientiousness, 0.17).
personality(guillaume_mouton, extroversion, 0.09).
personality(guillaume_mouton, agreeableness, 0.99).
personality(guillaume_mouton, neuroticism, -0.26).

%% Claire Mouton
person(claire_mouton).
first_name(claire_mouton, 'Claire').
last_name(claire_mouton, 'Mouton').
full_name(claire_mouton, 'Claire Mouton').
gender(claire_mouton, female).
alive(claire_mouton).
personality(claire_mouton, openness, -0.25).
personality(claire_mouton, conscientiousness, -0.21).
personality(claire_mouton, extroversion, -0.77).
personality(claire_mouton, agreeableness, 0.34).
personality(claire_mouton, neuroticism, 0.55).

%% Étienne Sonnier
person(etienne_sonnier).
first_name(etienne_sonnier, 'Étienne').
last_name(etienne_sonnier, 'Sonnier').
full_name(etienne_sonnier, 'Étienne Sonnier').
gender(etienne_sonnier, male).
alive(etienne_sonnier).
personality(etienne_sonnier, openness, -0.5).
personality(etienne_sonnier, conscientiousness, 0.04).
personality(etienne_sonnier, extroversion, 0.18).
personality(etienne_sonnier, agreeableness, -0.4).
personality(etienne_sonnier, neuroticism, 0.28).

%% Émilie Sonnier
person(emilie_sonnier).
first_name(emilie_sonnier, 'Émilie').
last_name(emilie_sonnier, 'Sonnier').
full_name(emilie_sonnier, 'Émilie Sonnier').
gender(emilie_sonnier, female).
alive(emilie_sonnier).
personality(emilie_sonnier, openness, 0.83).
personality(emilie_sonnier, conscientiousness, 0.01).
personality(emilie_sonnier, extroversion, 0.48).
personality(emilie_sonnier, agreeableness, 0.84).
personality(emilie_sonnier, neuroticism, 0.38).

%% Marcel Cormier
person(marcel_cormier).
first_name(marcel_cormier, 'Marcel').
last_name(marcel_cormier, 'Cormier').
full_name(marcel_cormier, 'Marcel Cormier').
gender(marcel_cormier, male).
alive(marcel_cormier).
personality(marcel_cormier, openness, 0.46).
personality(marcel_cormier, conscientiousness, 0.01).
personality(marcel_cormier, extroversion, 0.75).
personality(marcel_cormier, agreeableness, -0.59).
personality(marcel_cormier, neuroticism, -0.13).

%% Adèle Cormier
person(adele_cormier).
first_name(adele_cormier, 'Adèle').
last_name(adele_cormier, 'Cormier').
full_name(adele_cormier, 'Adèle Cormier').
gender(adele_cormier, female).
alive(adele_cormier).
personality(adele_cormier, openness, -0.38).
personality(adele_cormier, conscientiousness, 0.39).
personality(adele_cormier, extroversion, -0.91).
personality(adele_cormier, agreeableness, 0.41).
personality(adele_cormier, neuroticism, -0.72).

%% Georges Cormier
person(georges_cormier).
first_name(georges_cormier, 'Georges').
last_name(georges_cormier, 'Cormier').
full_name(georges_cormier, 'Georges Cormier').
gender(georges_cormier, male).
alive(georges_cormier).
personality(georges_cormier, openness, -0.07).
personality(georges_cormier, conscientiousness, 0.34).
personality(georges_cormier, extroversion, -0.09).
personality(georges_cormier, agreeableness, -0.05).
personality(georges_cormier, neuroticism, -0.44).

%% Alice Broussard
person(alice_broussard).
first_name(alice_broussard, 'Alice').
last_name(alice_broussard, 'Broussard').
full_name(alice_broussard, 'Alice Broussard').
gender(alice_broussard, female).
alive(alice_broussard).
personality(alice_broussard, openness, 0.24).
personality(alice_broussard, conscientiousness, 0.01).
personality(alice_broussard, extroversion, -0.01).
personality(alice_broussard, agreeableness, -0.22).
personality(alice_broussard, neuroticism, -0.44).

%% Maurice Cormier
person(maurice_cormier).
first_name(maurice_cormier, 'Maurice').
last_name(maurice_cormier, 'Cormier').
full_name(maurice_cormier, 'Maurice Cormier').
gender(maurice_cormier, male).
alive(maurice_cormier).
personality(maurice_cormier, openness, 0.12).
personality(maurice_cormier, conscientiousness, 0.07).
personality(maurice_cormier, extroversion, -0.02).
personality(maurice_cormier, agreeableness, -0.24).
personality(maurice_cormier, neuroticism, -0.28).

%% Julien Cormier
person(julien_cormier).
first_name(julien_cormier, 'Julien').
last_name(julien_cormier, 'Cormier').
full_name(julien_cormier, 'Julien Cormier').
gender(julien_cormier, male).
alive(julien_cormier).
personality(julien_cormier, openness, 0.05).
personality(julien_cormier, conscientiousness, 0.39).
personality(julien_cormier, extroversion, -0.02).
personality(julien_cormier, agreeableness, -0.2).
personality(julien_cormier, neuroticism, -0.5).

%% Amélie Broussard
person(amelie_broussard).
first_name(amelie_broussard, 'Amélie').
last_name(amelie_broussard, 'Broussard').
full_name(amelie_broussard, 'Amélie Broussard').
gender(amelie_broussard, female).
alive(amelie_broussard).
personality(amelie_broussard, openness, 0.53).
personality(amelie_broussard, conscientiousness, 0.48).
personality(amelie_broussard, extroversion, 0.28).
personality(amelie_broussard, agreeableness, 0.65).
personality(amelie_broussard, neuroticism, 0.53).

%% Luc Broussard
person(luc_broussard).
first_name(luc_broussard, 'Luc').
last_name(luc_broussard, 'Broussard').
full_name(luc_broussard, 'Luc Broussard').
gender(luc_broussard, male).
alive(luc_broussard).
personality(luc_broussard, openness, 0.51).
personality(luc_broussard, conscientiousness, 0.28).
personality(luc_broussard, extroversion, 0.04).
personality(luc_broussard, agreeableness, 0.85).
personality(luc_broussard, neuroticism, 0.52).

%% Angélique Broussard
person(angelique_broussard).
first_name(angelique_broussard, 'Angélique').
last_name(angelique_broussard, 'Broussard').
full_name(angelique_broussard, 'Angélique Broussard').
gender(angelique_broussard, female).
alive(angelique_broussard).
personality(angelique_broussard, openness, 0.32).
personality(angelique_broussard, conscientiousness, 0.52).
personality(angelique_broussard, extroversion, 0.21).
personality(angelique_broussard, agreeableness, 0.61).
personality(angelique_broussard, neuroticism, 0.42).

%% Nicolas Broussard
person(nicolas_broussard).
first_name(nicolas_broussard, 'Nicolas').
last_name(nicolas_broussard, 'Broussard').
full_name(nicolas_broussard, 'Nicolas Broussard').
gender(nicolas_broussard, male).
alive(nicolas_broussard).
personality(nicolas_broussard, openness, 0.33).
personality(nicolas_broussard, conscientiousness, 0.56).
personality(nicolas_broussard, extroversion, -0.08).
personality(nicolas_broussard, agreeableness, 0.62).
personality(nicolas_broussard, neuroticism, 0.65).

%% Sébastien Broussard
person(sebastien_broussard).
first_name(sebastien_broussard, 'Sébastien').
last_name(sebastien_broussard, 'Broussard').
full_name(sebastien_broussard, 'Sébastien Broussard').
gender(sebastien_broussard, male).
alive(sebastien_broussard).
personality(sebastien_broussard, openness, 0.42).
personality(sebastien_broussard, conscientiousness, 0.42).
personality(sebastien_broussard, extroversion, -0.03).
personality(sebastien_broussard, agreeableness, 0.85).
personality(sebastien_broussard, neuroticism, 0.56).

%% Armand Broussard
person(armand_broussard).
first_name(armand_broussard, 'Armand').
last_name(armand_broussard, 'Broussard').
full_name(armand_broussard, 'Armand Broussard').
gender(armand_broussard, male).
alive(armand_broussard).
personality(armand_broussard, openness, 0.25).
personality(armand_broussard, conscientiousness, 0.53).
personality(armand_broussard, extroversion, 0.06).
personality(armand_broussard, agreeableness, 0.66).
personality(armand_broussard, neuroticism, 0.3).

%% Béatrice Mouton
person(beatrice_mouton).
first_name(beatrice_mouton, 'Béatrice').
last_name(beatrice_mouton, 'Mouton').
full_name(beatrice_mouton, 'Béatrice Mouton').
gender(beatrice_mouton, female).
alive(beatrice_mouton).
personality(beatrice_mouton, openness, -0.11).
personality(beatrice_mouton, conscientiousness, -0.0).
personality(beatrice_mouton, extroversion, -0.79).
personality(beatrice_mouton, agreeableness, -0.04).
personality(beatrice_mouton, neuroticism, -0.06).

%% Blanche Cormier
person(blanche_cormier).
first_name(blanche_cormier, 'Blanche').
last_name(blanche_cormier, 'Cormier').
full_name(blanche_cormier, 'Blanche Cormier').
gender(blanche_cormier, female).
alive(blanche_cormier).
personality(blanche_cormier, openness, 0.11).
personality(blanche_cormier, conscientiousness, -0.07).
personality(blanche_cormier, extroversion, -0.7).
personality(blanche_cormier, agreeableness, -0.21).
personality(blanche_cormier, neuroticism, -0.27).

%% Caroline Sonnier
person(caroline_sonnier).
first_name(caroline_sonnier, 'Caroline').
last_name(caroline_sonnier, 'Sonnier').
full_name(caroline_sonnier, 'Caroline Sonnier').
gender(caroline_sonnier, female).
alive(caroline_sonnier).
personality(caroline_sonnier, openness, -0.11).
personality(caroline_sonnier, conscientiousness, 0.16).
personality(caroline_sonnier, extroversion, -0.47).
personality(caroline_sonnier, agreeableness, -0.09).
personality(caroline_sonnier, neuroticism, -0.16).

%% Constance Guidry
person(constance_guidry).
first_name(constance_guidry, 'Constance').
last_name(constance_guidry, 'Guidry').
full_name(constance_guidry, 'Constance Guidry').
gender(constance_guidry, female).
alive(constance_guidry).
personality(constance_guidry, openness, -0.11).
personality(constance_guidry, conscientiousness, 0.13).
personality(constance_guidry, extroversion, -0.45).
personality(constance_guidry, agreeableness, -0.23).
personality(constance_guidry, neuroticism, 0.06).

%% Gaston Boudreaux
person(gaston_boudreaux).
first_name(gaston_boudreaux, 'Gaston').
last_name(gaston_boudreaux, 'Boudreaux').
full_name(gaston_boudreaux, 'Gaston Boudreaux').
gender(gaston_boudreaux, male).
alive(gaston_boudreaux).
personality(gaston_boudreaux, openness, -0.17).
personality(gaston_boudreaux, conscientiousness, -0.07).
personality(gaston_boudreaux, extroversion, -0.75).
personality(gaston_boudreaux, agreeableness, -0.39).
personality(gaston_boudreaux, neuroticism, 0.05).

%% Raoul Guidry
person(raoul_guidry).
first_name(raoul_guidry, 'Raoul').
last_name(raoul_guidry, 'Guidry').
full_name(raoul_guidry, 'Raoul Guidry').
gender(raoul_guidry, male).
alive(raoul_guidry).
personality(raoul_guidry, openness, 0.78).
personality(raoul_guidry, conscientiousness, 0.82).
personality(raoul_guidry, extroversion, 0.33).
personality(raoul_guidry, agreeableness, -0.14).
personality(raoul_guidry, neuroticism, -0.03).

%% Léon Guidry
person(leon_guidry).
first_name(leon_guidry, 'Léon').
last_name(leon_guidry, 'Guidry').
full_name(leon_guidry, 'Léon Guidry').
gender(leon_guidry, male).
alive(leon_guidry).
personality(leon_guidry, openness, 0.58).
personality(leon_guidry, conscientiousness, 0.66).
personality(leon_guidry, extroversion, 0.2).
personality(leon_guidry, agreeableness, 0.01).
personality(leon_guidry, neuroticism, -0.31).

%% Delphine Breaux
person(delphine_breaux).
first_name(delphine_breaux, 'Delphine').
last_name(delphine_breaux, 'Breaux').
full_name(delphine_breaux, 'Delphine Breaux').
gender(delphine_breaux, female).
alive(delphine_breaux).
personality(delphine_breaux, openness, -0.43).
personality(delphine_breaux, conscientiousness, -0.29).
personality(delphine_breaux, extroversion, 0.05).
personality(delphine_breaux, agreeableness, -0.1).
personality(delphine_breaux, neuroticism, -0.44).

%% Eugène Robichaux
person(eugene_robichaux).
first_name(eugene_robichaux, 'Eugène').
last_name(eugene_robichaux, 'Robichaux').
full_name(eugene_robichaux, 'Eugène Robichaux').
gender(eugene_robichaux, male).
alive(eugene_robichaux).
personality(eugene_robichaux, openness, -0.63).
personality(eugene_robichaux, conscientiousness, -0.14).
personality(eugene_robichaux, extroversion, 0.22).
personality(eugene_robichaux, agreeableness, 0.03).
personality(eugene_robichaux, neuroticism, -0.54).

%% Auguste Robichaux
person(auguste_robichaux).
first_name(auguste_robichaux, 'Auguste').
last_name(auguste_robichaux, 'Robichaux').
full_name(auguste_robichaux, 'Auguste Robichaux').
gender(auguste_robichaux, male).
alive(auguste_robichaux).
personality(auguste_robichaux, openness, -0.45).
personality(auguste_robichaux, conscientiousness, -0.29).
personality(auguste_robichaux, extroversion, 0.27).
personality(auguste_robichaux, agreeableness, -0.14).
personality(auguste_robichaux, neuroticism, -0.65).

%% Théodore Breaux
person(theodore_breaux).
first_name(theodore_breaux, 'Théodore').
last_name(theodore_breaux, 'Breaux').
full_name(theodore_breaux, 'Théodore Breaux').
gender(theodore_breaux, male).
alive(theodore_breaux).
personality(theodore_breaux, openness, 0.91).
personality(theodore_breaux, conscientiousness, -1.0).
personality(theodore_breaux, extroversion, -0.36).
personality(theodore_breaux, agreeableness, 0.46).
personality(theodore_breaux, neuroticism, 0.59).

%% Diane Broussard
person(diane_broussard).
first_name(diane_broussard, 'Diane').
last_name(diane_broussard, 'Broussard').
full_name(diane_broussard, 'Diane Broussard').
gender(diane_broussard, female).
alive(diane_broussard).
personality(diane_broussard, openness, 0.72).
personality(diane_broussard, conscientiousness, -0.91).
personality(diane_broussard, extroversion, -0.22).
personality(diane_broussard, agreeableness, 0.25).
personality(diane_broussard, neuroticism, 0.37).

%% Gustave Bergeron
person(gustave_bergeron).
first_name(gustave_bergeron, 'Gustave').
last_name(gustave_bergeron, 'Bergeron').
full_name(gustave_bergeron, 'Gustave Bergeron').
gender(gustave_bergeron, male).
alive(gustave_bergeron).
personality(gustave_bergeron, openness, 0.58).
personality(gustave_bergeron, conscientiousness, -0.23).
personality(gustave_bergeron, extroversion, 0.06).
personality(gustave_bergeron, agreeableness, -0.75).
personality(gustave_bergeron, neuroticism, 0.49).

%% Édith Cormier
person(edith_cormier).
first_name(edith_cormier, 'Édith').
last_name(edith_cormier, 'Cormier').
full_name(edith_cormier, 'Édith Cormier').
gender(edith_cormier, female).
alive(edith_cormier).
personality(edith_cormier, openness, 0.66).
personality(edith_cormier, conscientiousness, -0.11).
personality(edith_cormier, extroversion, 0.03).
personality(edith_cormier, agreeableness, -0.89).
personality(edith_cormier, neuroticism, 0.48).

%% Honoré Bergeron
person(honore_bergeron).
first_name(honore_bergeron, 'Honoré').
last_name(honore_bergeron, 'Bergeron').
full_name(honore_bergeron, 'Honoré Bergeron').
gender(honore_bergeron, male).
alive(honore_bergeron).
personality(honore_bergeron, openness, 0.49).
personality(honore_bergeron, conscientiousness, -0.17).
personality(honore_bergeron, extroversion, -0.05).
personality(honore_bergeron, agreeableness, -0.68).
personality(honore_bergeron, neuroticism, 0.55).

%% Lucien Mouton
person(lucien_mouton).
first_name(lucien_mouton, 'Lucien').
last_name(lucien_mouton, 'Mouton').
full_name(lucien_mouton, 'Lucien Mouton').
gender(lucien_mouton, male).
alive(lucien_mouton).
personality(lucien_mouton, openness, 0.05).
personality(lucien_mouton, conscientiousness, 0.14).
personality(lucien_mouton, extroversion, -0.48).
personality(lucien_mouton, agreeableness, 0.55).
personality(lucien_mouton, neuroticism, 0.09).

%% Félix Mouton
person(felix_mouton).
first_name(felix_mouton, 'Félix').
last_name(felix_mouton, 'Mouton').
full_name(felix_mouton, 'Félix Mouton').
gender(felix_mouton, male).
alive(felix_mouton).
personality(felix_mouton, openness, 0.13).
personality(felix_mouton, conscientiousness, 0.05).
personality(felix_mouton, extroversion, -0.42).
personality(felix_mouton, agreeableness, 0.83).
personality(felix_mouton, neuroticism, 0.14).

%% Éléonore Mouton
person(eleonore_mouton).
first_name(eleonore_mouton, 'Éléonore').
last_name(eleonore_mouton, 'Mouton').
full_name(eleonore_mouton, 'Éléonore Mouton').
gender(eleonore_mouton, female).
alive(eleonore_mouton).
personality(eleonore_mouton, openness, 0.08).
personality(eleonore_mouton, conscientiousness, 0.11).
personality(eleonore_mouton, extroversion, -0.46).
personality(eleonore_mouton, agreeableness, 0.53).
personality(eleonore_mouton, neuroticism, -0.06).

%% Albert Mouton
person(albert_mouton).
first_name(albert_mouton, 'Albert').
last_name(albert_mouton, 'Mouton').
full_name(albert_mouton, 'Albert Mouton').
gender(albert_mouton, male).
alive(albert_mouton).
personality(albert_mouton, openness, 0.08).
personality(albert_mouton, conscientiousness, -0.03).
personality(albert_mouton, extroversion, -0.29).
personality(albert_mouton, agreeableness, 0.72).
personality(albert_mouton, neuroticism, 0.08).

%% Estelle Bergeron
person(estelle_bergeron).
first_name(estelle_bergeron, 'Estelle').
last_name(estelle_bergeron, 'Bergeron').
full_name(estelle_bergeron, 'Estelle Bergeron').
gender(estelle_bergeron, female).
alive(estelle_bergeron).
personality(estelle_bergeron, openness, 0.33).
personality(estelle_bergeron, conscientiousness, 0.04).
personality(estelle_bergeron, extroversion, 0.32).
personality(estelle_bergeron, agreeableness, 0.12).
personality(estelle_bergeron, neuroticism, 0.44).

%% Édouard Sonnier
person(edouard_sonnier).
first_name(edouard_sonnier, 'Édouard').
last_name(edouard_sonnier, 'Sonnier').
full_name(edouard_sonnier, 'Édouard Sonnier').
gender(edouard_sonnier, male).
alive(edouard_sonnier).
personality(edouard_sonnier, openness, 0.12).
personality(edouard_sonnier, conscientiousness, 0.18).
personality(edouard_sonnier, extroversion, 0.44).
personality(edouard_sonnier, agreeableness, 0.34).
personality(edouard_sonnier, neuroticism, 0.36).

%% Victor Sonnier
person(victor_sonnier).
first_name(victor_sonnier, 'Victor').
last_name(victor_sonnier, 'Sonnier').
full_name(victor_sonnier, 'Victor Sonnier').
gender(victor_sonnier, male).
alive(victor_sonnier).
personality(victor_sonnier, openness, -0.01).
personality(victor_sonnier, conscientiousness, 0.13).
personality(victor_sonnier, extroversion, 0.16).
personality(victor_sonnier, agreeableness, 0.04).
personality(victor_sonnier, neuroticism, 0.51).

%% Arthur Sonnier
person(arthur_sonnier).
first_name(arthur_sonnier, 'Arthur').
last_name(arthur_sonnier, 'Sonnier').
full_name(arthur_sonnier, 'Arthur Sonnier').
gender(arthur_sonnier, male).
alive(arthur_sonnier).
personality(arthur_sonnier, openness, 0.24).
personality(arthur_sonnier, conscientiousness, 0.11).
personality(arthur_sonnier, extroversion, 0.28).
personality(arthur_sonnier, agreeableness, 0.38).
personality(arthur_sonnier, neuroticism, 0.27).

%% Jules Cormier
person(jules_cormier).
first_name(jules_cormier, 'Jules').
last_name(jules_cormier, 'Cormier').
full_name(jules_cormier, 'Jules Cormier').
gender(jules_cormier, male).
alive(jules_cormier).
personality(jules_cormier, openness, 0.12).
personality(jules_cormier, conscientiousness, 0.33).
personality(jules_cormier, extroversion, -0.02).
personality(jules_cormier, agreeableness, -0.08).
personality(jules_cormier, neuroticism, -0.61).

%% Eugénie Broussard
person(eugenie_broussard).
first_name(eugenie_broussard, 'Eugénie').
last_name(eugenie_broussard, 'Broussard').
full_name(eugenie_broussard, 'Eugénie Broussard').
gender(eugenie_broussard, female).
alive(eugenie_broussard).
personality(eugenie_broussard, openness, 0.23).
personality(eugenie_broussard, conscientiousness, 0.32).
personality(eugenie_broussard, extroversion, -0.06).
personality(eugenie_broussard, agreeableness, 0.01).
personality(eugenie_broussard, neuroticism, -0.52).

%% Florence Robichaux
person(florence_robichaux).
first_name(florence_robichaux, 'Florence').
last_name(florence_robichaux, 'Robichaux').
full_name(florence_robichaux, 'Florence Robichaux').
gender(florence_robichaux, female).
alive(florence_robichaux).
personality(florence_robichaux, openness, 0.17).
personality(florence_robichaux, conscientiousness, 0.22).
personality(florence_robichaux, extroversion, 0.09).
personality(florence_robichaux, agreeableness, 0.09).
personality(florence_robichaux, neuroticism, -0.55).

%% Raymond Savoie
person(raymond_savoie).
first_name(raymond_savoie, 'Raymond').
last_name(raymond_savoie, 'Savoie').
full_name(raymond_savoie, 'Raymond Savoie').
gender(raymond_savoie, male).
alive(raymond_savoie).
occupation(raymond_savoie, retired).
personality(raymond_savoie, openness, 0.8).
personality(raymond_savoie, conscientiousness, 0.8).
personality(raymond_savoie, extroversion, -0.36).
personality(raymond_savoie, agreeableness, -0.1).
personality(raymond_savoie, neuroticism, 0.97).

%% Gabrielle Mouton
person(gabrielle_mouton).
first_name(gabrielle_mouton, 'Gabrielle').
last_name(gabrielle_mouton, 'Mouton').
full_name(gabrielle_mouton, 'Gabrielle Mouton').
gender(gabrielle_mouton, female).
alive(gabrielle_mouton).
occupation(gabrielle_mouton, retired).
personality(gabrielle_mouton, openness, -0.21).
personality(gabrielle_mouton, conscientiousness, 0.53).
personality(gabrielle_mouton, extroversion, 0.93).
personality(gabrielle_mouton, agreeableness, -0.47).
personality(gabrielle_mouton, neuroticism, 0.53).

%% Alphonse Aucoin
person(alphonse_aucoin).
first_name(alphonse_aucoin, 'Alphonse').
last_name(alphonse_aucoin, 'Aucoin').
full_name(alphonse_aucoin, 'Alphonse Aucoin').
gender(alphonse_aucoin, male).
alive(alphonse_aucoin).
occupation(alphonse_aucoin, retired).
personality(alphonse_aucoin, openness, -0.95).
personality(alphonse_aucoin, conscientiousness, -0.29).
personality(alphonse_aucoin, extroversion, 0.05).
personality(alphonse_aucoin, agreeableness, -0.46).
personality(alphonse_aucoin, neuroticism, 0.55).

%% Henriette Sonnier
person(henriette_sonnier).
first_name(henriette_sonnier, 'Henriette').
last_name(henriette_sonnier, 'Sonnier').
full_name(henriette_sonnier, 'Henriette Sonnier').
gender(henriette_sonnier, female).
alive(henriette_sonnier).
occupation(henriette_sonnier, retired).
personality(henriette_sonnier, openness, -0.53).
personality(henriette_sonnier, conscientiousness, -0.95).
personality(henriette_sonnier, extroversion, 0.29).
personality(henriette_sonnier, agreeableness, -0.55).
personality(henriette_sonnier, neuroticism, 0.22).

%% Isabelle Broussard
person(isabelle_broussard).
first_name(isabelle_broussard, 'Isabelle').
last_name(isabelle_broussard, 'Broussard').
full_name(isabelle_broussard, 'Isabelle Broussard').
gender(isabelle_broussard, female).
alive(isabelle_broussard).
occupation(isabelle_broussard, retired).
personality(isabelle_broussard, openness, 0.24).
personality(isabelle_broussard, conscientiousness, 0.39).
personality(isabelle_broussard, extroversion, 0.2).
personality(isabelle_broussard, agreeableness, 0.6).
personality(isabelle_broussard, neuroticism, -0.04).

%% Clément Broussard
person(clement_broussard).
first_name(clement_broussard, 'Clément').
last_name(clement_broussard, 'Broussard').
full_name(clement_broussard, 'Clément Broussard').
gender(clement_broussard, male).
alive(clement_broussard).
occupation(clement_broussard, retired).
personality(clement_broussard, openness, 0.26).
personality(clement_broussard, conscientiousness, 0.21).
personality(clement_broussard, extroversion, 0.43).
personality(clement_broussard, agreeableness, 0.44).
personality(clement_broussard, neuroticism, -0.05).

%% Denis Broussard
person(denis_broussard).
first_name(denis_broussard, 'Denis').
last_name(denis_broussard, 'Broussard').
full_name(denis_broussard, 'Denis Broussard').
gender(denis_broussard, male).
alive(denis_broussard).
personality(denis_broussard, openness, 0.19).
personality(denis_broussard, conscientiousness, 0.25).
personality(denis_broussard, extroversion, 0.25).
personality(denis_broussard, agreeableness, 0.35).
personality(denis_broussard, neuroticism, 0.17).

%% Élias Broussard
person(elias_broussard).
first_name(elias_broussard, 'Élias').
last_name(elias_broussard, 'Broussard').
full_name(elias_broussard, 'Élias Broussard').
gender(elias_broussard, male).
alive(elias_broussard).
occupation(elias_broussard, retired).
personality(elias_broussard, openness, 0.15).
personality(elias_broussard, conscientiousness, 0.18).
personality(elias_broussard, extroversion, 0.2).
personality(elias_broussard, agreeableness, 0.34).
personality(elias_broussard, neuroticism, 0.18).

%% Ferdinand Aucoin
person(ferdinand_aucoin).
first_name(ferdinand_aucoin, 'Ferdinand').
last_name(ferdinand_aucoin, 'Aucoin').
full_name(ferdinand_aucoin, 'Ferdinand Aucoin').
gender(ferdinand_aucoin, male).
alive(ferdinand_aucoin).
occupation(ferdinand_aucoin, farmer).
personality(ferdinand_aucoin, openness, -0.76).
personality(ferdinand_aucoin, conscientiousness, -0.24).
personality(ferdinand_aucoin, extroversion, 0.29).
personality(ferdinand_aucoin, agreeableness, -0.5).
personality(ferdinand_aucoin, neuroticism, 0.03).

%% Jacqueline Aucoin
person(jacqueline_aucoin).
first_name(jacqueline_aucoin, 'Jacqueline').
last_name(jacqueline_aucoin, 'Aucoin').
full_name(jacqueline_aucoin, 'Jacqueline Aucoin').
gender(jacqueline_aucoin, female).
alive(jacqueline_aucoin).
occupation(jacqueline_aucoin, farmer).
personality(jacqueline_aucoin, openness, -0.68).
personality(jacqueline_aucoin, conscientiousness, -0.41).
personality(jacqueline_aucoin, extroversion, -0.01).
personality(jacqueline_aucoin, agreeableness, -0.38).
personality(jacqueline_aucoin, neuroticism, 0.02).

%% Juliette Sonnier
person(juliette_sonnier).
first_name(juliette_sonnier, 'Juliette').
last_name(juliette_sonnier, 'Sonnier').
full_name(juliette_sonnier, 'Juliette Sonnier').
gender(juliette_sonnier, female).
alive(juliette_sonnier).
personality(juliette_sonnier, openness, 0.74).
personality(juliette_sonnier, conscientiousness, -0.35).
personality(juliette_sonnier, extroversion, 0.15).
personality(juliette_sonnier, agreeableness, 0.61).
personality(juliette_sonnier, neuroticism, 0.6).

%% Justine Cormier
person(justine_cormier).
first_name(justine_cormier, 'Justine').
last_name(justine_cormier, 'Cormier').
full_name(justine_cormier, 'Justine Cormier').
gender(justine_cormier, female).
alive(justine_cormier).
occupation(justine_cormier, retired).
personality(justine_cormier, openness, 0.39).
personality(justine_cormier, conscientiousness, -0.28).
personality(justine_cormier, extroversion, -0.2).
personality(justine_cormier, agreeableness, 0.5).
personality(justine_cormier, neuroticism, 0.32).

%% Léonie Breaux
person(leonie_breaux).
first_name(leonie_breaux, 'Léonie').
last_name(leonie_breaux, 'Breaux').
full_name(leonie_breaux, 'Léonie Breaux').
gender(leonie_breaux, female).
alive(leonie_breaux).
occupation(leonie_breaux, retired).
personality(leonie_breaux, openness, 0.65).
personality(leonie_breaux, conscientiousness, -0.39).
personality(leonie_breaux, extroversion, 0.07).
personality(leonie_breaux, agreeableness, 0.68).
personality(leonie_breaux, neuroticism, 0.21).

%% Gaspard Broussard
person(gaspard_broussard).
first_name(gaspard_broussard, 'Gaspard').
last_name(gaspard_broussard, 'Broussard').
full_name(gaspard_broussard, 'Gaspard Broussard').
gender(gaspard_broussard, male).
alive(gaspard_broussard).
occupation(gaspard_broussard, retired).
personality(gaspard_broussard, openness, 0.1).
personality(gaspard_broussard, conscientiousness, 0.23).
personality(gaspard_broussard, extroversion, -0.02).
personality(gaspard_broussard, agreeableness, 0.39).
personality(gaspard_broussard, neuroticism, 0.05).

%% Lucie Broussard
person(lucie_broussard).
first_name(lucie_broussard, 'Lucie').
last_name(lucie_broussard, 'Broussard').
full_name(lucie_broussard, 'Lucie Broussard').
gender(lucie_broussard, female).
alive(lucie_broussard).
occupation(lucie_broussard, retired).
personality(lucie_broussard, openness, -0.22).
personality(lucie_broussard, conscientiousness, 0.04).
personality(lucie_broussard, extroversion, 0.15).
personality(lucie_broussard, agreeableness, 0.24).
personality(lucie_broussard, neuroticism, 0.02).

%% Mathilde Cormier
person(mathilde_cormier).
first_name(mathilde_cormier, 'Mathilde').
last_name(mathilde_cormier, 'Cormier').
full_name(mathilde_cormier, 'Mathilde Cormier').
gender(mathilde_cormier, female).
alive(mathilde_cormier).
personality(mathilde_cormier, openness, 0.17).
personality(mathilde_cormier, conscientiousness, 0.48).
personality(mathilde_cormier, extroversion, -0.08).
personality(mathilde_cormier, agreeableness, 0.57).
personality(mathilde_cormier, neuroticism, -0.02).

%% Hector Cormier
person(hector_cormier).
first_name(hector_cormier, 'Hector').
last_name(hector_cormier, 'Cormier').
full_name(hector_cormier, 'Hector Cormier').
gender(hector_cormier, male).
alive(hector_cormier).
occupation(hector_cormier, retired).
personality(hector_cormier, openness, 0.37).
personality(hector_cormier, conscientiousness, 0.38).
personality(hector_cormier, extroversion, 0.2).
personality(hector_cormier, agreeableness, 0.52).
personality(hector_cormier, neuroticism, 0.1).

%% Monique Broussard
person(monique_broussard).
first_name(monique_broussard, 'Monique').
last_name(monique_broussard, 'Broussard').
full_name(monique_broussard, 'Monique Broussard').
gender(monique_broussard, female).
alive(monique_broussard).
personality(monique_broussard, openness, 0.37).
personality(monique_broussard, conscientiousness, 0.26).
personality(monique_broussard, extroversion, 0.19).
personality(monique_broussard, agreeableness, 0.57).
personality(monique_broussard, neuroticism, -0.14).

%% Nathalie Cormier
person(nathalie_cormier).
first_name(nathalie_cormier, 'Nathalie').
last_name(nathalie_cormier, 'Cormier').
full_name(nathalie_cormier, 'Nathalie Cormier').
gender(nathalie_cormier, female).
alive(nathalie_cormier).
occupation(nathalie_cormier, retired).
personality(nathalie_cormier, openness, 0.34).
personality(nathalie_cormier, conscientiousness, 0.49).
personality(nathalie_cormier, extroversion, 0.21).
personality(nathalie_cormier, agreeableness, 0.25).
personality(nathalie_cormier, neuroticism, 0.24).

%% Odette Robichaux
person(odette_robichaux).
first_name(odette_robichaux, 'Odette').
last_name(odette_robichaux, 'Robichaux').
full_name(odette_robichaux, 'Odette Robichaux').
gender(odette_robichaux, female).
alive(odette_robichaux).
occupation(odette_robichaux, retired).
personality(odette_robichaux, openness, 0.31).
personality(odette_robichaux, conscientiousness, 0.32).
personality(odette_robichaux, extroversion, 0.16).
personality(odette_robichaux, agreeableness, 0.2).
personality(odette_robichaux, neuroticism, -0.09).

%% Pauline Robichaux
person(pauline_robichaux).
first_name(pauline_robichaux, 'Pauline').
last_name(pauline_robichaux, 'Robichaux').
full_name(pauline_robichaux, 'Pauline Robichaux').
gender(pauline_robichaux, female).
alive(pauline_robichaux).
occupation(pauline_robichaux, retired).
personality(pauline_robichaux, openness, 0.09).
personality(pauline_robichaux, conscientiousness, 0.38).
personality(pauline_robichaux, extroversion, 0.27).
personality(pauline_robichaux, agreeableness, 0.38).
personality(pauline_robichaux, neuroticism, -0.03).

%% Renée Mouton
person(renee_mouton).
first_name(renee_mouton, 'Renée').
last_name(renee_mouton, 'Mouton').
full_name(renee_mouton, 'Renée Mouton').
gender(renee_mouton, female).
alive(renee_mouton).
occupation(renee_mouton, retired).
personality(renee_mouton, openness, 0.42).
personality(renee_mouton, conscientiousness, 0.06).
personality(renee_mouton, extroversion, -0.07).
personality(renee_mouton, agreeableness, 0.49).
personality(renee_mouton, neuroticism, 0.24).

%% Rosalie Breaux
person(rosalie_breaux).
first_name(rosalie_breaux, 'Rosalie').
last_name(rosalie_breaux, 'Breaux').
full_name(rosalie_breaux, 'Rosalie Breaux').
gender(rosalie_breaux, female).
alive(rosalie_breaux).
personality(rosalie_breaux, openness, 0.32).
personality(rosalie_breaux, conscientiousness, 0.28).
personality(rosalie_breaux, extroversion, 0.02).
personality(rosalie_breaux, agreeableness, 0.41).
personality(rosalie_breaux, neuroticism, -0.08).

%% Ignace Broussard
person(ignace_broussard).
first_name(ignace_broussard, 'Ignace').
last_name(ignace_broussard, 'Broussard').
full_name(ignace_broussard, 'Ignace Broussard').
gender(ignace_broussard, male).
alive(ignace_broussard).
occupation(ignace_broussard, retired).
personality(ignace_broussard, openness, 0.27).
personality(ignace_broussard, conscientiousness, 0.16).
personality(ignace_broussard, extroversion, 0.07).
personality(ignace_broussard, agreeableness, 0.3).
personality(ignace_broussard, neuroticism, -0.12).

%% Sabine Sonnier
person(sabine_sonnier).
first_name(sabine_sonnier, 'Sabine').
last_name(sabine_sonnier, 'Sonnier').
full_name(sabine_sonnier, 'Sabine Sonnier').
gender(sabine_sonnier, female).
alive(sabine_sonnier).
occupation(sabine_sonnier, retired).
personality(sabine_sonnier, openness, 0.41).
personality(sabine_sonnier, conscientiousness, 0.34).
personality(sabine_sonnier, extroversion, 0.07).
personality(sabine_sonnier, agreeableness, 0.39).
personality(sabine_sonnier, neuroticism, 0.1).

%% Justin Broussard
person(justin_broussard).
first_name(justin_broussard, 'Justin').
last_name(justin_broussard, 'Broussard').
full_name(justin_broussard, 'Justin Broussard').
gender(justin_broussard, male).
alive(justin_broussard).
occupation(justin_broussard, retired).
personality(justin_broussard, openness, 0.3).
personality(justin_broussard, conscientiousness, -0.38).
personality(justin_broussard, extroversion, 0.09).
personality(justin_broussard, agreeableness, 0.4).
personality(justin_broussard, neuroticism, 0.29).

%% Simone Robichaux
person(simone_robichaux).
first_name(simone_robichaux, 'Simone').
last_name(simone_robichaux, 'Robichaux').
full_name(simone_robichaux, 'Simone Robichaux').
gender(simone_robichaux, female).
alive(simone_robichaux).
occupation(simone_robichaux, farmer).
personality(simone_robichaux, openness, 0.69).
personality(simone_robichaux, conscientiousness, -0.0).
personality(simone_robichaux, extroversion, -0.17).
personality(simone_robichaux, agreeableness, 0.48).
personality(simone_robichaux, neuroticism, 0.22).

%% Laurent Broussard
person(laurent_broussard).
first_name(laurent_broussard, 'Laurent').
last_name(laurent_broussard, 'Broussard').
full_name(laurent_broussard, 'Laurent Broussard').
gender(laurent_broussard, male).
alive(laurent_broussard).
occupation(laurent_broussard, bartender).
personality(laurent_broussard, openness, 0.58).
personality(laurent_broussard, conscientiousness, -0.05).
personality(laurent_broussard, extroversion, -0.1).
personality(laurent_broussard, agreeableness, 0.65).
personality(laurent_broussard, neuroticism, 0.27).

%% Sophie Cormier
person(sophie_cormier).
first_name(sophie_cormier, 'Sophie').
last_name(sophie_cormier, 'Cormier').
full_name(sophie_cormier, 'Sophie Cormier').
gender(sophie_cormier, female).
alive(sophie_cormier).
occupation(sophie_cormier, farmer).
personality(sophie_cormier, openness, 0.51).
personality(sophie_cormier, conscientiousness, -0.19).
personality(sophie_cormier, extroversion, -0.17).
personality(sophie_cormier, agreeableness, 0.4).
personality(sophie_cormier, neuroticism, 0.35).

%% Martin Broussard
person(martin_broussard).
first_name(martin_broussard, 'Martin').
last_name(martin_broussard, 'Broussard').
full_name(martin_broussard, 'Martin Broussard').
gender(martin_broussard, male).
alive(martin_broussard).
occupation(martin_broussard, carpenter).
personality(martin_broussard, openness, 0.6).
personality(martin_broussard, conscientiousness, -0.29).
personality(martin_broussard, extroversion, -0.09).
personality(martin_broussard, agreeableness, 0.31).
personality(martin_broussard, neuroticism, 0.36).

%% Noël Broussard
person(noel_broussard).
first_name(noel_broussard, 'Noël').
last_name(noel_broussard, 'Broussard').
full_name(noel_broussard, 'Noël Broussard').
gender(noel_broussard, male).
alive(noel_broussard).
occupation(noel_broussard, farmer).
personality(noel_broussard, openness, 0.68).
personality(noel_broussard, conscientiousness, -0.09).
personality(noel_broussard, extroversion, 0.05).
personality(noel_broussard, agreeableness, 0.29).
personality(noel_broussard, neuroticism, 0.37).

%% Sylvie Sonnier
person(sylvie_sonnier).
first_name(sylvie_sonnier, 'Sylvie').
last_name(sylvie_sonnier, 'Sonnier').
full_name(sylvie_sonnier, 'Sylvie Sonnier').
gender(sylvie_sonnier, female).
alive(sylvie_sonnier).
occupation(sylvie_sonnier, retired).
personality(sylvie_sonnier, openness, 0.1).
personality(sylvie_sonnier, conscientiousness, 0.09).
personality(sylvie_sonnier, extroversion, -0.24).
personality(sylvie_sonnier, agreeableness, -0.35).
personality(sylvie_sonnier, neuroticism, -0.14).

%% Valentine Robichaux
person(valentine_robichaux).
first_name(valentine_robichaux, 'Valentine').
last_name(valentine_robichaux, 'Robichaux').
full_name(valentine_robichaux, 'Valentine Robichaux').
gender(valentine_robichaux, female).
alive(valentine_robichaux).
occupation(valentine_robichaux, retired).
personality(valentine_robichaux, openness, 0.06).
personality(valentine_robichaux, conscientiousness, 0.24).
personality(valentine_robichaux, extroversion, -0.47).
personality(valentine_robichaux, agreeableness, -0.02).
personality(valentine_robichaux, neuroticism, -0.41).

%% Olivier Cormier
person(olivier_cormier).
first_name(olivier_cormier, 'Olivier').
last_name(olivier_cormier, 'Cormier').
full_name(olivier_cormier, 'Olivier Cormier').
gender(olivier_cormier, male).
alive(olivier_cormier).
occupation(olivier_cormier, retired).
personality(olivier_cormier, openness, 0.07).
personality(olivier_cormier, conscientiousness, 0.08).
personality(olivier_cormier, extroversion, -0.53).
personality(olivier_cormier, agreeableness, -0.14).
personality(olivier_cormier, neuroticism, -0.21).

%% Véronique Cormier
person(veronique_cormier).
first_name(veronique_cormier, 'Véronique').
last_name(veronique_cormier, 'Cormier').
full_name(veronique_cormier, 'Véronique Cormier').
gender(veronique_cormier, female).
alive(veronique_cormier).
occupation(veronique_cormier, retired).
personality(veronique_cormier, openness, 0.01).
personality(veronique_cormier, conscientiousness, 0.21).
personality(veronique_cormier, extroversion, -0.39).
personality(veronique_cormier, agreeableness, -0.0).
personality(veronique_cormier, neuroticism, -0.12).

%% Pascal Sonnier
person(pascal_sonnier).
first_name(pascal_sonnier, 'Pascal').
last_name(pascal_sonnier, 'Sonnier').
full_name(pascal_sonnier, 'Pascal Sonnier').
gender(pascal_sonnier, male).
alive(pascal_sonnier).
occupation(pascal_sonnier, retired).
personality(pascal_sonnier, openness, -0.03).
personality(pascal_sonnier, conscientiousness, 0.03).
personality(pascal_sonnier, extroversion, 0.0).
personality(pascal_sonnier, agreeableness, 0.08).
personality(pascal_sonnier, neuroticism, 0.04).

%% Quentin Sonnier
person(quentin_sonnier).
first_name(quentin_sonnier, 'Quentin').
last_name(quentin_sonnier, 'Sonnier').
full_name(quentin_sonnier, 'Quentin Sonnier').
gender(quentin_sonnier, male).
alive(quentin_sonnier).
occupation(quentin_sonnier, retired).
personality(quentin_sonnier, openness, -0.01).
personality(quentin_sonnier, conscientiousness, 0.24).
personality(quentin_sonnier, extroversion, 0.05).
personality(quentin_sonnier, agreeableness, -0.05).
personality(quentin_sonnier, neuroticism, 0.0).

%% Victoire Mouton
person(victoire_mouton).
first_name(victoire_mouton, 'Victoire').
last_name(victoire_mouton, 'Mouton').
full_name(victoire_mouton, 'Victoire Mouton').
gender(victoire_mouton, female).
alive(victoire_mouton).
occupation(victoire_mouton, retired).
personality(victoire_mouton, openness, -0.1).
personality(victoire_mouton, conscientiousness, 0.08).
personality(victoire_mouton, extroversion, -0.2).
personality(victoire_mouton, agreeableness, 0.17).
personality(victoire_mouton, neuroticism, -0.09).

%% Romain Boudreaux
person(romain_boudreaux).
first_name(romain_boudreaux, 'Romain').
last_name(romain_boudreaux, 'Boudreaux').
full_name(romain_boudreaux, 'Romain Boudreaux').
gender(romain_boudreaux, male).
alive(romain_boudreaux).
occupation(romain_boudreaux, retired).
personality(romain_boudreaux, openness, -0.49).
personality(romain_boudreaux, conscientiousness, -0.47).
personality(romain_boudreaux, extroversion, -0.28).
personality(romain_boudreaux, agreeableness, -0.45).
personality(romain_boudreaux, neuroticism, -0.26).

%% Sylvain Boudreaux
person(sylvain_boudreaux).
first_name(sylvain_boudreaux, 'Sylvain').
last_name(sylvain_boudreaux, 'Boudreaux').
full_name(sylvain_boudreaux, 'Sylvain Boudreaux').
gender(sylvain_boudreaux, male).
alive(sylvain_boudreaux).
occupation(sylvain_boudreaux, retired).
personality(sylvain_boudreaux, openness, -0.37).
personality(sylvain_boudreaux, conscientiousness, -0.41).
personality(sylvain_boudreaux, extroversion, -0.03).
personality(sylvain_boudreaux, agreeableness, -0.39).
personality(sylvain_boudreaux, neuroticism, -0.12).

%% Virginie Broussard
person(virginie_broussard).
first_name(virginie_broussard, 'Virginie').
last_name(virginie_broussard, 'Broussard').
full_name(virginie_broussard, 'Virginie Broussard').
gender(virginie_broussard, female).
alive(virginie_broussard).
occupation(virginie_broussard, retired).
personality(virginie_broussard, openness, -0.09).
personality(virginie_broussard, conscientiousness, 0.01).
personality(virginie_broussard, extroversion, 0.12).
personality(virginie_broussard, agreeableness, 0.11).
personality(virginie_broussard, neuroticism, -0.17).

%% Yvonne Breaux
person(yvonne_breaux).
first_name(yvonne_breaux, 'Yvonne').
last_name(yvonne_breaux, 'Breaux').
full_name(yvonne_breaux, 'Yvonne Breaux').
gender(yvonne_breaux, female).
alive(yvonne_breaux).
occupation(yvonne_breaux, retired).
personality(yvonne_breaux, openness, -0.02).
personality(yvonne_breaux, conscientiousness, -0.07).
personality(yvonne_breaux, extroversion, 0.09).
personality(yvonne_breaux, agreeableness, 0.31).
personality(yvonne_breaux, neuroticism, -0.15).

%% Tristan Broussard
person(tristan_broussard).
first_name(tristan_broussard, 'Tristan').
last_name(tristan_broussard, 'Broussard').
full_name(tristan_broussard, 'Tristan Broussard').
gender(tristan_broussard, male).
alive(tristan_broussard).
occupation(tristan_broussard, retired).
personality(tristan_broussard, openness, 0.04).
personality(tristan_broussard, conscientiousness, 0.12).
personality(tristan_broussard, extroversion, -0.02).
personality(tristan_broussard, agreeableness, 0.31).
personality(tristan_broussard, neuroticism, 0.09).

%% Urbain Breaux
person(urbain_breaux).
first_name(urbain_breaux, 'Urbain').
last_name(urbain_breaux, 'Breaux').
full_name(urbain_breaux, 'Urbain Breaux').
gender(urbain_breaux, male).
alive(urbain_breaux).
occupation(urbain_breaux, retired).
personality(urbain_breaux, openness, 0.3).
personality(urbain_breaux, conscientiousness, -0.48).
personality(urbain_breaux, extroversion, 0.03).
personality(urbain_breaux, agreeableness, 0.28).
personality(urbain_breaux, neuroticism, 0.18).

%% Zoé Cormier
person(zoe_cormier).
first_name(zoe_cormier, 'Zoé').
last_name(zoe_cormier, 'Cormier').
full_name(zoe_cormier, 'Zoé Cormier').
gender(zoe_cormier, female).
alive(zoe_cormier).
personality(zoe_cormier, openness, 0.23).
personality(zoe_cormier, conscientiousness, -0.66).
personality(zoe_cormier, extroversion, -0.01).
personality(zoe_cormier, agreeableness, 0.37).
personality(zoe_cormier, neuroticism, -0.06).

%% Agathe Sonnier
person(agathe_sonnier).
first_name(agathe_sonnier, 'Agathe').
last_name(agathe_sonnier, 'Sonnier').
full_name(agathe_sonnier, 'Agathe Sonnier').
gender(agathe_sonnier, female).
alive(agathe_sonnier).
personality(agathe_sonnier, openness, 0.1).
personality(agathe_sonnier, conscientiousness, -0.7).
personality(agathe_sonnier, extroversion, -0.02).
personality(agathe_sonnier, agreeableness, 0.1).
personality(agathe_sonnier, neuroticism, 0.12).

%% Apolline Sonnier
person(apolline_sonnier).
first_name(apolline_sonnier, 'Apolline').
last_name(apolline_sonnier, 'Sonnier').
full_name(apolline_sonnier, 'Apolline Sonnier').
gender(apolline_sonnier, female).
alive(apolline_sonnier).
occupation(apolline_sonnier, retired).
personality(apolline_sonnier, openness, 0.08).
personality(apolline_sonnier, conscientiousness, -0.55).
personality(apolline_sonnier, extroversion, -0.1).
personality(apolline_sonnier, agreeableness, 0.04).
personality(apolline_sonnier, neuroticism, 0.21).

%% Bernadette Broussard
person(bernadette_broussard).
first_name(bernadette_broussard, 'Bernadette').
last_name(bernadette_broussard, 'Broussard').
full_name(bernadette_broussard, 'Bernadette Broussard').
gender(bernadette_broussard, female).
alive(bernadette_broussard).
occupation(bernadette_broussard, retired).
personality(bernadette_broussard, openness, -0.03).
personality(bernadette_broussard, conscientiousness, 0.21).
personality(bernadette_broussard, extroversion, 0.15).
personality(bernadette_broussard, agreeableness, 0.11).
personality(bernadette_broussard, neuroticism, -0.56).

%% Valentin Robichaux
person(valentin_robichaux).
first_name(valentin_robichaux, 'Valentin').
last_name(valentin_robichaux, 'Robichaux').
full_name(valentin_robichaux, 'Valentin Robichaux').
gender(valentin_robichaux, male).
alive(valentin_robichaux).
occupation(valentin_robichaux, retired).
personality(valentin_robichaux, openness, -0.16).
personality(valentin_robichaux, conscientiousness, -0.14).
personality(valentin_robichaux, extroversion, -0.0).
personality(valentin_robichaux, agreeableness, 0.12).
personality(valentin_robichaux, neuroticism, -0.47).

%% Xavier Robichaux
person(xavier_robichaux).
first_name(xavier_robichaux, 'Xavier').
last_name(xavier_robichaux, 'Robichaux').
full_name(xavier_robichaux, 'Xavier Robichaux').
gender(xavier_robichaux, male).
alive(xavier_robichaux).
occupation(xavier_robichaux, retired).
personality(xavier_robichaux, openness, -0.34).
personality(xavier_robichaux, conscientiousness, 0.18).
personality(xavier_robichaux, extroversion, 0.18).
personality(xavier_robichaux, agreeableness, -0.08).
personality(xavier_robichaux, neuroticism, -0.46).

%% Berthe Cormier
person(berthe_cormier).
first_name(berthe_cormier, 'Berthe').
last_name(berthe_cormier, 'Cormier').
full_name(berthe_cormier, 'Berthe Cormier').
gender(berthe_cormier, female).
alive(berthe_cormier).
occupation(berthe_cormier, retired).
personality(berthe_cormier, openness, 0.24).
personality(berthe_cormier, conscientiousness, -0.46).
personality(berthe_cormier, extroversion, -0.11).
personality(berthe_cormier, agreeableness, 0.17).
personality(berthe_cormier, neuroticism, -0.18).

%% Carméla Broussard
person(carmela_broussard).
first_name(carmela_broussard, 'Carméla').
last_name(carmela_broussard, 'Broussard').
full_name(carmela_broussard, 'Carméla Broussard').
gender(carmela_broussard, female).
alive(carmela_broussard).
occupation(carmela_broussard, retired).
personality(carmela_broussard, openness, 0.11).
personality(carmela_broussard, conscientiousness, -0.66).
personality(carmela_broussard, extroversion, -0.16).
personality(carmela_broussard, agreeableness, 0.01).
personality(carmela_broussard, neuroticism, 0.11).

%% Yves Robichaux
person(yves_robichaux).
first_name(yves_robichaux, 'Yves').
last_name(yves_robichaux, 'Robichaux').
full_name(yves_robichaux, 'Yves Robichaux').
gender(yves_robichaux, male).
alive(yves_robichaux).
occupation(yves_robichaux, retired).
personality(yves_robichaux, openness, 0.07).
personality(yves_robichaux, conscientiousness, -0.5).
personality(yves_robichaux, extroversion, 0.17).
personality(yves_robichaux, agreeableness, 0.01).
personality(yves_robichaux, neuroticism, -0.09).

%% Zacharie Robichaux
person(zacharie_robichaux).
first_name(zacharie_robichaux, 'Zacharie').
last_name(zacharie_robichaux, 'Robichaux').
full_name(zacharie_robichaux, 'Zacharie Robichaux').
gender(zacharie_robichaux, male).
alive(zacharie_robichaux).
occupation(zacharie_robichaux, retired).
personality(zacharie_robichaux, openness, 0.3).
personality(zacharie_robichaux, conscientiousness, -0.79).
personality(zacharie_robichaux, extroversion, -0.02).
personality(zacharie_robichaux, agreeableness, 0.23).
personality(zacharie_robichaux, neuroticism, -0.14).

%% Adrien Robichaux
person(adrien_robichaux).
first_name(adrien_robichaux, 'Adrien').
last_name(adrien_robichaux, 'Robichaux').
full_name(adrien_robichaux, 'Adrien Robichaux').
gender(adrien_robichaux, male).
alive(adrien_robichaux).
occupation(adrien_robichaux, retired).
personality(adrien_robichaux, openness, 0.38).
personality(adrien_robichaux, conscientiousness, -0.5).
personality(adrien_robichaux, extroversion, 0.19).
personality(adrien_robichaux, agreeableness, 0.03).
personality(adrien_robichaux, neuroticism, -0.01).

%% Benoît Broussard
person(benoit_broussard).
first_name(benoit_broussard, 'Benoît').
last_name(benoit_broussard, 'Broussard').
full_name(benoit_broussard, 'Benoît Broussard').
gender(benoit_broussard, male).
alive(benoit_broussard).
occupation(benoit_broussard, retired).
personality(benoit_broussard, openness, 0.37).
personality(benoit_broussard, conscientiousness, -0.38).
personality(benoit_broussard, extroversion, 0.16).
personality(benoit_broussard, agreeableness, 0.52).
personality(benoit_broussard, neuroticism, 0.31).

%% Camille Broussard
person(camille_broussard).
first_name(camille_broussard, 'Camille').
last_name(camille_broussard, 'Broussard').
full_name(camille_broussard, 'Camille Broussard').
gender(camille_broussard, male).
alive(camille_broussard).
occupation(camille_broussard, retired).
personality(camille_broussard, openness, 0.52).
personality(camille_broussard, conscientiousness, -0.47).
personality(camille_broussard, extroversion, 0.17).
personality(camille_broussard, agreeableness, 0.44).
personality(camille_broussard, neuroticism, 0.42).

%% Céline Boudreaux
person(celine_boudreaux).
first_name(celine_boudreaux, 'Céline').
last_name(celine_boudreaux, 'Boudreaux').
full_name(celine_boudreaux, 'Céline Boudreaux').
gender(celine_boudreaux, female).
alive(celine_boudreaux).
occupation(celine_boudreaux, retired).
personality(celine_boudreaux, openness, 0.56).
personality(celine_boudreaux, conscientiousness, -0.44).
personality(celine_boudreaux, extroversion, -0.17).
personality(celine_boudreaux, agreeableness, 0.4).
personality(celine_boudreaux, neuroticism, 0.33).

%% Damien Broussard
person(damien_broussard).
first_name(damien_broussard, 'Damien').
last_name(damien_broussard, 'Broussard').
full_name(damien_broussard, 'Damien Broussard').
gender(damien_broussard, male).
alive(damien_broussard).
occupation(damien_broussard, retired).
personality(damien_broussard, openness, 0.68).
personality(damien_broussard, conscientiousness, -0.28).
personality(damien_broussard, extroversion, 0.17).
personality(damien_broussard, agreeableness, 0.44).
personality(damien_broussard, neuroticism, 0.36).

%% Éloi Breaux
person(eloi_breaux).
first_name(eloi_breaux, 'Éloi').
last_name(eloi_breaux, 'Breaux').
full_name(eloi_breaux, 'Éloi Breaux').
gender(eloi_breaux, male).
alive(eloi_breaux).
personality(eloi_breaux, openness, 0.24).
personality(eloi_breaux, conscientiousness, -0.63).
personality(eloi_breaux, extroversion, 0.16).
personality(eloi_breaux, agreeableness, -0.01).
personality(eloi_breaux, neuroticism, -0.06).

%% Clémence Breaux
person(clemence_breaux).
first_name(clemence_breaux, 'Clémence').
last_name(clemence_breaux, 'Breaux').
full_name(clemence_breaux, 'Clémence Breaux').
gender(clemence_breaux, female).
alive(clemence_breaux).
occupation(clemence_breaux, retired).
personality(clemence_breaux, openness, 0.07).
personality(clemence_breaux, conscientiousness, -0.39).
personality(clemence_breaux, extroversion, -0.1).
personality(clemence_breaux, agreeableness, 0.18).
personality(clemence_breaux, neuroticism, 0.22).

%% Fabien Breaux
person(fabien_breaux).
first_name(fabien_breaux, 'Fabien').
last_name(fabien_breaux, 'Breaux').
full_name(fabien_breaux, 'Fabien Breaux').
gender(fabien_breaux, male).
alive(fabien_breaux).
personality(fabien_breaux, openness, 0.1).
personality(fabien_breaux, conscientiousness, -0.48).
personality(fabien_breaux, extroversion, -0.13).
personality(fabien_breaux, agreeableness, 0.04).
personality(fabien_breaux, neuroticism, 0.11).

%% Clothilde Breaux
person(clothilde_breaux).
first_name(clothilde_breaux, 'Clothilde').
last_name(clothilde_breaux, 'Breaux').
full_name(clothilde_breaux, 'Clothilde Breaux').
gender(clothilde_breaux, female).
alive(clothilde_breaux).
personality(clothilde_breaux, openness, 0.34).
personality(clothilde_breaux, conscientiousness, -0.63).
personality(clothilde_breaux, extroversion, -0.01).
personality(clothilde_breaux, agreeableness, 0.07).
personality(clothilde_breaux, neuroticism, 0.01).

%% Corinne Bergeron
person(corinne_bergeron).
first_name(corinne_bergeron, 'Corinne').
last_name(corinne_bergeron, 'Bergeron').
full_name(corinne_bergeron, 'Corinne Bergeron').
gender(corinne_bergeron, female).
alive(corinne_bergeron).
personality(corinne_bergeron, openness, 0.27).
personality(corinne_bergeron, conscientiousness, -0.82).
personality(corinne_bergeron, extroversion, -0.12).
personality(corinne_bergeron, agreeableness, 0.09).
personality(corinne_bergeron, neuroticism, -0.04).

%% Dorothée Broussard
person(dorothee_broussard).
first_name(dorothee_broussard, 'Dorothée').
last_name(dorothee_broussard, 'Broussard').
full_name(dorothee_broussard, 'Dorothée Broussard').
gender(dorothee_broussard, female).
alive(dorothee_broussard).
occupation(dorothee_broussard, retired).
personality(dorothee_broussard, openness, 0.59).
personality(dorothee_broussard, conscientiousness, -0.27).
personality(dorothee_broussard, extroversion, 0.37).
personality(dorothee_broussard, agreeableness, -0.33).
personality(dorothee_broussard, neuroticism, 0.39).

%% Émeline Broussard
person(emeline_broussard).
first_name(emeline_broussard, 'Émeline').
last_name(emeline_broussard, 'Broussard').
full_name(emeline_broussard, 'Émeline Broussard').
gender(emeline_broussard, female).
alive(emeline_broussard).
occupation(emeline_broussard, retired).
personality(emeline_broussard, openness, 0.3).
personality(emeline_broussard, conscientiousness, -0.02).
personality(emeline_broussard, extroversion, 0.32).
personality(emeline_broussard, agreeableness, -0.37).
personality(emeline_broussard, neuroticism, 0.64).

%% Gauthier Bergeron
person(gauthier_bergeron).
first_name(gauthier_bergeron, 'Gauthier').
last_name(gauthier_bergeron, 'Bergeron').
full_name(gauthier_bergeron, 'Gauthier Bergeron').
gender(gauthier_bergeron, male).
alive(gauthier_bergeron).
occupation(gauthier_bergeron, retired).
personality(gauthier_bergeron, openness, 0.63).
personality(gauthier_bergeron, conscientiousness, -0.0).
personality(gauthier_bergeron, extroversion, 0.34).
personality(gauthier_bergeron, agreeableness, -0.24).
personality(gauthier_bergeron, neuroticism, 0.49).

%% Eulalie Cormier
person(eulalie_cormier).
first_name(eulalie_cormier, 'Eulalie').
last_name(eulalie_cormier, 'Cormier').
full_name(eulalie_cormier, 'Eulalie Cormier').
gender(eulalie_cormier, female).
alive(eulalie_cormier).
occupation(eulalie_cormier, retired).
personality(eulalie_cormier, openness, 0.65).
personality(eulalie_cormier, conscientiousness, 0.02).
personality(eulalie_cormier, extroversion, 0.16).
personality(eulalie_cormier, agreeableness, -0.37).
personality(eulalie_cormier, neuroticism, 0.32).

%% Hervé Cormier
person(herve_cormier).
first_name(herve_cormier, 'Hervé').
last_name(herve_cormier, 'Cormier').
full_name(herve_cormier, 'Hervé Cormier').
gender(herve_cormier, male).
alive(herve_cormier).
occupation(herve_cormier, retired).
personality(herve_cormier, openness, 0.43).
personality(herve_cormier, conscientiousness, 0.27).
personality(herve_cormier, extroversion, -0.17).
personality(herve_cormier, agreeableness, -0.49).
personality(herve_cormier, neuroticism, -0.21).

%% Faustine Boudreaux
person(faustine_boudreaux).
first_name(faustine_boudreaux, 'Faustine').
last_name(faustine_boudreaux, 'Boudreaux').
full_name(faustine_boudreaux, 'Faustine Boudreaux').
gender(faustine_boudreaux, female).
alive(faustine_boudreaux).
occupation(faustine_boudreaux, retired).
personality(faustine_boudreaux, openness, 0.47).
personality(faustine_boudreaux, conscientiousness, 0.01).
personality(faustine_boudreaux, extroversion, -0.18).
personality(faustine_boudreaux, agreeableness, -0.44).
personality(faustine_boudreaux, neuroticism, 0.09).

%% Félicité Cormier
person(felicite_cormier).
first_name(felicite_cormier, 'Félicité').
last_name(felicite_cormier, 'Cormier').
full_name(felicite_cormier, 'Félicité Cormier').
gender(felicite_cormier, female).
alive(felicite_cormier).
occupation(felicite_cormier, retired).
personality(felicite_cormier, openness, 0.44).
personality(felicite_cormier, conscientiousness, -0.08).
personality(felicite_cormier, extroversion, -0.04).
personality(felicite_cormier, agreeableness, -0.59).
personality(felicite_cormier, neuroticism, -0.23).

%% Flavie Bergeron
person(flavie_bergeron).
first_name(flavie_bergeron, 'Flavie').
last_name(flavie_bergeron, 'Bergeron').
full_name(flavie_bergeron, 'Flavie Bergeron').
gender(flavie_bergeron, female).
alive(flavie_bergeron).
occupation(flavie_bergeron, retired).
personality(flavie_bergeron, openness, 0.41).
personality(flavie_bergeron, conscientiousness, 0.12).
personality(flavie_bergeron, extroversion, -0.02).
personality(flavie_bergeron, agreeableness, -0.65).
personality(flavie_bergeron, neuroticism, -0.17).

%% Isidore Cormier
person(isidore_cormier).
first_name(isidore_cormier, 'Isidore').
last_name(isidore_cormier, 'Cormier').
full_name(isidore_cormier, 'Isidore Cormier').
gender(isidore_cormier, male).
alive(isidore_cormier).
occupation(isidore_cormier, retired).
personality(isidore_cormier, openness, 0.42).
personality(isidore_cormier, conscientiousness, 0.13).
personality(isidore_cormier, extroversion, 0.13).
personality(isidore_cormier, agreeableness, -0.33).
personality(isidore_cormier, neuroticism, -0.12).

%% Francine Mouton
person(francine_mouton).
first_name(francine_mouton, 'Francine').
last_name(francine_mouton, 'Mouton').
full_name(francine_mouton, 'Francine Mouton').
gender(francine_mouton, female).
alive(francine_mouton).
occupation(francine_mouton, retired).
personality(francine_mouton, openness, 0.24).
personality(francine_mouton, conscientiousness, 0.21).
personality(francine_mouton, extroversion, -0.06).
personality(francine_mouton, agreeableness, -0.44).
personality(francine_mouton, neuroticism, -0.14).

%% Joachim Mouton
person(joachim_mouton).
first_name(joachim_mouton, 'Joachim').
last_name(joachim_mouton, 'Mouton').
full_name(joachim_mouton, 'Joachim Mouton').
gender(joachim_mouton, male).
alive(joachim_mouton).
personality(joachim_mouton, openness, -0.03).
personality(joachim_mouton, conscientiousness, 0.28).
personality(joachim_mouton, extroversion, 0.39).
personality(joachim_mouton, agreeableness, 0.22).
personality(joachim_mouton, neuroticism, 0.29).

%% Gilberte Aucoin
person(gilberte_aucoin).
first_name(gilberte_aucoin, 'Gilberte').
last_name(gilberte_aucoin, 'Aucoin').
full_name(gilberte_aucoin, 'Gilberte Aucoin').
gender(gilberte_aucoin, female).
alive(gilberte_aucoin).
occupation(gilberte_aucoin, retired).
personality(gilberte_aucoin, openness, -0.19).
personality(gilberte_aucoin, conscientiousness, 0.16).
personality(gilberte_aucoin, extroversion, 0.39).
personality(gilberte_aucoin, agreeableness, 0.1).
personality(gilberte_aucoin, neuroticism, 0.36).

%% Gisèle Broussard
person(gisele_broussard).
first_name(gisele_broussard, 'Gisèle').
last_name(gisele_broussard, 'Broussard').
full_name(gisele_broussard, 'Gisèle Broussard').
gender(gisele_broussard, female).
alive(gisele_broussard).
occupation(gisele_broussard, retired).
personality(gisele_broussard, openness, -0.04).
personality(gisele_broussard, conscientiousness, 0.3).
personality(gisele_broussard, extroversion, 0.32).
personality(gisele_broussard, agreeableness, 0.1).
personality(gisele_broussard, neuroticism, 0.24).

%% Hortense Mouton
person(hortense_mouton).
first_name(hortense_mouton, 'Hortense').
last_name(hortense_mouton, 'Mouton').
full_name(hortense_mouton, 'Hortense Mouton').
gender(hortense_mouton, female).
alive(hortense_mouton).
personality(hortense_mouton, openness, -0.07).
personality(hortense_mouton, conscientiousness, 0.46).
personality(hortense_mouton, extroversion, 0.18).
personality(hortense_mouton, agreeableness, -0.11).
personality(hortense_mouton, neuroticism, 0.38).

%% Irène Broussard
person(irene_broussard).
first_name(irene_broussard, 'Irène').
last_name(irene_broussard, 'Broussard').
full_name(irene_broussard, 'Irène Broussard').
gender(irene_broussard, female).
alive(irene_broussard).
occupation(irene_broussard, retired).
personality(irene_broussard, openness, 0.64).
personality(irene_broussard, conscientiousness, 0.04).
personality(irene_broussard, extroversion, 0.15).
personality(irene_broussard, agreeableness, -0.22).
personality(irene_broussard, neuroticism, 0.57).

%% Léocadie Robichaux
person(leocadie_robichaux).
first_name(leocadie_robichaux, 'Léocadie').
last_name(leocadie_robichaux, 'Robichaux').
full_name(leocadie_robichaux, 'Léocadie Robichaux').
gender(leocadie_robichaux, female).
alive(leocadie_robichaux).
occupation(leocadie_robichaux, retired).
personality(leocadie_robichaux, openness, 0.47).
personality(leocadie_robichaux, conscientiousness, -0.16).
personality(leocadie_robichaux, extroversion, 0.08).
personality(leocadie_robichaux, agreeableness, -0.22).
personality(leocadie_robichaux, neuroticism, 0.38).

%% Léontine Cormier
person(leontine_cormier).
first_name(leontine_cormier, 'Léontine').
last_name(leontine_cormier, 'Cormier').
full_name(leontine_cormier, 'Léontine Cormier').
gender(leontine_cormier, female).
alive(leontine_cormier).
occupation(leontine_cormier, retired).
personality(leontine_cormier, openness, 0.44).
personality(leontine_cormier, conscientiousness, -0.07).
personality(leontine_cormier, extroversion, 0.13).
personality(leontine_cormier, agreeableness, -0.45).
personality(leontine_cormier, neuroticism, 0.63).

%% Léandre Bergeron
person(leandre_bergeron).
first_name(leandre_bergeron, 'Léandre').
last_name(leandre_bergeron, 'Bergeron').
full_name(leandre_bergeron, 'Léandre Bergeron').
gender(leandre_bergeron, male).
alive(leandre_bergeron).
occupation(leandre_bergeron, retired).
personality(leandre_bergeron, openness, 0.35).
personality(leandre_bergeron, conscientiousness, 0.08).
personality(leandre_bergeron, extroversion, 0.36).
personality(leandre_bergeron, agreeableness, -0.18).
personality(leandre_bergeron, neuroticism, 0.6).

%% Lise Mouton
person(lise_mouton).
first_name(lise_mouton, 'Lise').
last_name(lise_mouton, 'Mouton').
full_name(lise_mouton, 'Lise Mouton').
gender(lise_mouton, female).
alive(lise_mouton).
occupation(lise_mouton, retired).
personality(lise_mouton, openness, 0.53).
personality(lise_mouton, conscientiousness, -0.22).
personality(lise_mouton, extroversion, 0.05).
personality(lise_mouton, agreeableness, -0.18).
personality(lise_mouton, neuroticism, 0.47).

%% Lucienne Robichaux
person(lucienne_robichaux).
first_name(lucienne_robichaux, 'Lucienne').
last_name(lucienne_robichaux, 'Robichaux').
full_name(lucienne_robichaux, 'Lucienne Robichaux').
gender(lucienne_robichaux, female).
alive(lucienne_robichaux).
occupation(lucienne_robichaux, retired).
personality(lucienne_robichaux, openness, -0.12).
personality(lucienne_robichaux, conscientiousness, 0.07).
personality(lucienne_robichaux, extroversion, -0.2).
personality(lucienne_robichaux, agreeableness, 0.3).
personality(lucienne_robichaux, neuroticism, 0.28).

%% Maximilien Sonnier
person(maximilien_sonnier).
first_name(maximilien_sonnier, 'Maximilien').
last_name(maximilien_sonnier, 'Sonnier').
full_name(maximilien_sonnier, 'Maximilien Sonnier').
gender(maximilien_sonnier, male).
alive(maximilien_sonnier).
occupation(maximilien_sonnier, retired).
personality(maximilien_sonnier, openness, -0.09).
personality(maximilien_sonnier, conscientiousness, 0.02).
personality(maximilien_sonnier, extroversion, -0.07).
personality(maximilien_sonnier, agreeableness, 0.05).
personality(maximilien_sonnier, neuroticism, 0.28).

%% Ludivine Cormier
person(ludivine_cormier).
first_name(ludivine_cormier, 'Ludivine').
last_name(ludivine_cormier, 'Cormier').
full_name(ludivine_cormier, 'Ludivine Cormier').
gender(ludivine_cormier, female).
alive(ludivine_cormier).
occupation(ludivine_cormier, retired).
personality(ludivine_cormier, openness, 0.09).
personality(ludivine_cormier, conscientiousness, 0.28).
personality(ludivine_cormier, extroversion, -0.09).
personality(ludivine_cormier, agreeableness, 0.28).
personality(ludivine_cormier, neuroticism, 0.13).

%% Nestor Sonnier
person(nestor_sonnier).
first_name(nestor_sonnier, 'Nestor').
last_name(nestor_sonnier, 'Sonnier').
full_name(nestor_sonnier, 'Nestor Sonnier').
gender(nestor_sonnier, male).
alive(nestor_sonnier).
occupation(nestor_sonnier, retired).
personality(nestor_sonnier, openness, -0.32).
personality(nestor_sonnier, conscientiousness, -0.32).
personality(nestor_sonnier, extroversion, 0.28).
personality(nestor_sonnier, agreeableness, 0.02).
personality(nestor_sonnier, neuroticism, 0.23).

%% Octave Sonnier
person(octave_sonnier).
first_name(octave_sonnier, 'Octave').
last_name(octave_sonnier, 'Sonnier').
full_name(octave_sonnier, 'Octave Sonnier').
gender(octave_sonnier, male).
alive(octave_sonnier).
occupation(octave_sonnier, retired).
personality(octave_sonnier, openness, -0.28).
personality(octave_sonnier, conscientiousness, -0.51).
personality(octave_sonnier, extroversion, 0.31).
personality(octave_sonnier, agreeableness, -0.15).
personality(octave_sonnier, neuroticism, 0.42).

%% Patrice Mouton
person(patrice_mouton).
first_name(patrice_mouton, 'Patrice').
last_name(patrice_mouton, 'Mouton').
full_name(patrice_mouton, 'Patrice Mouton').
gender(patrice_mouton, male).
alive(patrice_mouton).
occupation(patrice_mouton, farmer).
personality(patrice_mouton, openness, 0.06).
personality(patrice_mouton, conscientiousness, 0.24).
personality(patrice_mouton, extroversion, 0.15).
personality(patrice_mouton, agreeableness, 0.12).
personality(patrice_mouton, neuroticism, 0.38).

%% Marceline Mouton
person(marceline_mouton).
first_name(marceline_mouton, 'Marceline').
last_name(marceline_mouton, 'Mouton').
full_name(marceline_mouton, 'Marceline Mouton').
gender(marceline_mouton, female).
alive(marceline_mouton).
occupation(marceline_mouton, farmhand).
personality(marceline_mouton, openness, 0.07).
personality(marceline_mouton, conscientiousness, 0.41).
personality(marceline_mouton, extroversion, 0.07).
personality(marceline_mouton, agreeableness, -0.01).
personality(marceline_mouton, neuroticism, 0.37).

%% Raphaël Mouton
person(raphael_mouton).
first_name(raphael_mouton, 'Raphaël').
last_name(raphael_mouton, 'Mouton').
full_name(raphael_mouton, 'Raphaël Mouton').
gender(raphael_mouton, male).
alive(raphael_mouton).
occupation(raphael_mouton, secretary).
personality(raphael_mouton, openness, 0.06).
personality(raphael_mouton, conscientiousness, 0.17).
personality(raphael_mouton, extroversion, 0.3).
personality(raphael_mouton, agreeableness, 0.23).
personality(raphael_mouton, neuroticism, 0.26).

%% Samuel Mouton
person(samuel_mouton).
first_name(samuel_mouton, 'Samuel').
last_name(samuel_mouton, 'Mouton').
full_name(samuel_mouton, 'Samuel Mouton').
gender(samuel_mouton, male).
alive(samuel_mouton).
occupation(samuel_mouton, farmer).
personality(samuel_mouton, openness, -0.15).
personality(samuel_mouton, conscientiousness, 0.28).
personality(samuel_mouton, extroversion, 0.03).
personality(samuel_mouton, agreeableness, 0.05).
personality(samuel_mouton, neuroticism, 0.29).

%% Timothée Mouton
person(timothee_mouton).
first_name(timothee_mouton, 'Timothée').
last_name(timothee_mouton, 'Mouton').
full_name(timothee_mouton, 'Timothée Mouton').
gender(timothee_mouton, male).
alive(timothee_mouton).
occupation(timothee_mouton, farmer).
personality(timothee_mouton, openness, -0.19).
personality(timothee_mouton, conscientiousness, 0.51).
personality(timothee_mouton, extroversion, 0.21).
personality(timothee_mouton, agreeableness, -0.09).
personality(timothee_mouton, neuroticism, 0.21).

%% Marthe Bégnaud
person(marthe_begnaud).
first_name(marthe_begnaud, 'Marthe').
last_name(marthe_begnaud, 'Bégnaud').
full_name(marthe_begnaud, 'Marthe Bégnaud').
gender(marthe_begnaud, female).
alive(marthe_begnaud).
occupation(marthe_begnaud, farmer).
personality(marthe_begnaud, openness, -0.19).
personality(marthe_begnaud, conscientiousness, 0.52).
personality(marthe_begnaud, extroversion, 0.31).
personality(marthe_begnaud, agreeableness, 0.22).
personality(marthe_begnaud, neuroticism, 0.29).

%% Valéry Cormier
person(valery_cormier).
first_name(valery_cormier, 'Valéry').
last_name(valery_cormier, 'Cormier').
full_name(valery_cormier, 'Valéry Cormier').
gender(valery_cormier, male).
alive(valery_cormier).
occupation(valery_cormier, retired).
personality(valery_cormier, openness, 0.28).
personality(valery_cormier, conscientiousness, -0.02).
personality(valery_cormier, extroversion, -0.58).
personality(valery_cormier, agreeableness, -0.2).
personality(valery_cormier, neuroticism, -0.32).

%% Mélanie Cormier
person(melanie_cormier).
first_name(melanie_cormier, 'Mélanie').
last_name(melanie_cormier, 'Cormier').
full_name(melanie_cormier, 'Mélanie Cormier').
gender(melanie_cormier, female).
alive(melanie_cormier).
occupation(melanie_cormier, retired).
personality(melanie_cormier, openness, 0.04).
personality(melanie_cormier, conscientiousness, 0.14).
personality(melanie_cormier, extroversion, -0.31).
personality(melanie_cormier, agreeableness, -0.02).
personality(melanie_cormier, neuroticism, -0.4).

%% Arsène Cormier
person(arsene_cormier).
first_name(arsene_cormier, 'Arsène').
last_name(arsene_cormier, 'Cormier').
full_name(arsene_cormier, 'Arsène Cormier').
gender(arsene_cormier, male).
alive(arsene_cormier).
occupation(arsene_cormier, retired).
personality(arsene_cormier, openness, 0.05).
personality(arsene_cormier, conscientiousness, 0.14).
personality(arsene_cormier, extroversion, -0.39).
personality(arsene_cormier, agreeableness, -0.07).
personality(arsene_cormier, neuroticism, -0.54).

%% Noémie Cormier
person(noemie_cormier).
first_name(noemie_cormier, 'Noémie').
last_name(noemie_cormier, 'Cormier').
full_name(noemie_cormier, 'Noémie Cormier').
gender(noemie_cormier, female).
alive(noemie_cormier).
occupation(noemie_cormier, retired).
personality(noemie_cormier, openness, 0.2).
personality(noemie_cormier, conscientiousness, 0.17).
personality(noemie_cormier, extroversion, -0.2).
personality(noemie_cormier, agreeableness, -0.1).
personality(noemie_cormier, neuroticism, -0.2).

%% Balthazar Cormier
person(balthazar_cormier).
first_name(balthazar_cormier, 'Balthazar').
last_name(balthazar_cormier, 'Cormier').
full_name(balthazar_cormier, 'Balthazar Cormier').
gender(balthazar_cormier, male).
alive(balthazar_cormier).
occupation(balthazar_cormier, retired).
personality(balthazar_cormier, openness, -0.09).
personality(balthazar_cormier, conscientiousness, 0.22).
personality(balthazar_cormier, extroversion, -0.45).
personality(balthazar_cormier, agreeableness, -0.38).
personality(balthazar_cormier, neuroticism, -0.52).

%% Olympe Cormier
person(olympe_cormier).
first_name(olympe_cormier, 'Olympe').
last_name(olympe_cormier, 'Cormier').
full_name(olympe_cormier, 'Olympe Cormier').
gender(olympe_cormier, female).
alive(olympe_cormier).
personality(olympe_cormier, openness, 0.36).
personality(olympe_cormier, conscientiousness, 0.03).
personality(olympe_cormier, extroversion, -0.06).
personality(olympe_cormier, agreeableness, -0.48).
personality(olympe_cormier, neuroticism, -0.08).

%% Célestin Cormier
person(celestin_cormier).
first_name(celestin_cormier, 'Célestin').
last_name(celestin_cormier, 'Cormier').
full_name(celestin_cormier, 'Célestin Cormier').
gender(celestin_cormier, male).
alive(celestin_cormier).
occupation(celestin_cormier, retired).
personality(celestin_cormier, openness, 0.25).
personality(celestin_cormier, conscientiousness, -0.03).
personality(celestin_cormier, extroversion, 0.16).
personality(celestin_cormier, agreeableness, -0.62).
personality(celestin_cormier, neuroticism, 0.09).

%% Pélagie Broussard
person(pelagie_broussard).
first_name(pelagie_broussard, 'Pélagie').
last_name(pelagie_broussard, 'Broussard').
full_name(pelagie_broussard, 'Pélagie Broussard').
gender(pelagie_broussard, female).
alive(pelagie_broussard).
occupation(pelagie_broussard, retired).
personality(pelagie_broussard, openness, 0.34).
personality(pelagie_broussard, conscientiousness, 0.24).
personality(pelagie_broussard, extroversion, -0.02).
personality(pelagie_broussard, agreeableness, -0.37).
personality(pelagie_broussard, neuroticism, -0.03).

%% Philomène Broussard
person(philomene_broussard).
first_name(philomene_broussard, 'Philomène').
last_name(philomene_broussard, 'Broussard').
full_name(philomene_broussard, 'Philomène Broussard').
gender(philomene_broussard, female).
alive(philomene_broussard).
occupation(philomene_broussard, retired).
personality(philomene_broussard, openness, 0.4).
personality(philomene_broussard, conscientiousness, 0.11).
personality(philomene_broussard, extroversion, 0.13).
personality(philomene_broussard, agreeableness, -0.52).
personality(philomene_broussard, neuroticism, 0.09).

%% Donatien Cormier
person(donatien_cormier).
first_name(donatien_cormier, 'Donatien').
last_name(donatien_cormier, 'Cormier').
full_name(donatien_cormier, 'Donatien Cormier').
gender(donatien_cormier, male).
alive(donatien_cormier).
occupation(donatien_cormier, retired).
personality(donatien_cormier, openness, 0.2).
personality(donatien_cormier, conscientiousness, 0.12).
personality(donatien_cormier, extroversion, 0.19).
personality(donatien_cormier, agreeableness, -0.3).
personality(donatien_cormier, neuroticism, -0.02).

%% Roseline Broussard
person(roseline_broussard).
first_name(roseline_broussard, 'Roseline').
last_name(roseline_broussard, 'Broussard').
full_name(roseline_broussard, 'Roseline Broussard').
gender(roseline_broussard, female).
alive(roseline_broussard).
occupation(roseline_broussard, retired).
personality(roseline_broussard, openness, 0.37).
personality(roseline_broussard, conscientiousness, -0.04).
personality(roseline_broussard, extroversion, 0.11).
personality(roseline_broussard, agreeableness, -0.61).
personality(roseline_broussard, neuroticism, 0.13).

%% Edgar Robichaux
person(edgar_robichaux).
first_name(edgar_robichaux, 'Edgar').
last_name(edgar_robichaux, 'Robichaux').
full_name(edgar_robichaux, 'Edgar Robichaux').
gender(edgar_robichaux, male).
alive(edgar_robichaux).
personality(edgar_robichaux, openness, -0.34).
personality(edgar_robichaux, conscientiousness, 0.23).
personality(edgar_robichaux, extroversion, -0.03).
personality(edgar_robichaux, agreeableness, -0.14).
personality(edgar_robichaux, neuroticism, -0.68).

%% Firmin Robichaux
person(firmin_robichaux).
first_name(firmin_robichaux, 'Firmin').
last_name(firmin_robichaux, 'Robichaux').
full_name(firmin_robichaux, 'Firmin Robichaux').
gender(firmin_robichaux, male).
alive(firmin_robichaux).
occupation(firmin_robichaux, retired).
personality(firmin_robichaux, openness, -0.22).
personality(firmin_robichaux, conscientiousness, 0.07).
personality(firmin_robichaux, extroversion, 0.16).
personality(firmin_robichaux, agreeableness, 0.11).
personality(firmin_robichaux, neuroticism, -0.47).

%% Gédéon Robichaux
person(gedeon_robichaux).
first_name(gedeon_robichaux, 'Gédéon').
last_name(gedeon_robichaux, 'Robichaux').
full_name(gedeon_robichaux, 'Gédéon Robichaux').
gender(gedeon_robichaux, male).
alive(gedeon_robichaux).
occupation(gedeon_robichaux, retired).
personality(gedeon_robichaux, openness, -0.15).
personality(gedeon_robichaux, conscientiousness, 0.09).
personality(gedeon_robichaux, extroversion, 0.05).
personality(gedeon_robichaux, agreeableness, 0.22).
personality(gedeon_robichaux, neuroticism, -0.74).

%% Séraphine Cormier
person(seraphine_cormier).
first_name(seraphine_cormier, 'Séraphine').
last_name(seraphine_cormier, 'Cormier').
full_name(seraphine_cormier, 'Séraphine Cormier').
gender(seraphine_cormier, female).
alive(seraphine_cormier).
occupation(seraphine_cormier, retired).
personality(seraphine_cormier, openness, -0.24).
personality(seraphine_cormier, conscientiousness, -0.08).
personality(seraphine_cormier, extroversion, 0.06).
personality(seraphine_cormier, agreeableness, 0.11).
personality(seraphine_cormier, neuroticism, -0.65).

%% Hilaire Bégnaud
person(hilaire_begnaud).
first_name(hilaire_begnaud, 'Hilaire').
last_name(hilaire_begnaud, 'Bégnaud').
full_name(hilaire_begnaud, 'Hilaire Bégnaud').
gender(hilaire_begnaud, male).
alive(hilaire_begnaud).
occupation(hilaire_begnaud, owner_guilddiplomates).
personality(hilaire_begnaud, openness, -0.2).
personality(hilaire_begnaud, conscientiousness, -0.2).
personality(hilaire_begnaud, extroversion, -0.84).
personality(hilaire_begnaud, agreeableness, -0.73).
personality(hilaire_begnaud, neuroticism, -0.69).

%% Solange Broussard
person(solange_broussard).
first_name(solange_broussard, 'Solange').
last_name(solange_broussard, 'Broussard').
full_name(solange_broussard, 'Solange Broussard').
gender(solange_broussard, female).
alive(solange_broussard).
occupation(solange_broussard, farmer).
personality(solange_broussard, openness, -0.28).
personality(solange_broussard, conscientiousness, 0.21).
personality(solange_broussard, extroversion, 0.37).
personality(solange_broussard, agreeableness, -0.53).
personality(solange_broussard, neuroticism, -0.29).

%% Léopold Laveau
person(leopold_laveau).
first_name(leopold_laveau, 'Léopold').
last_name(leopold_laveau, 'Laveau').
full_name(leopold_laveau, 'Léopold Laveau').
gender(leopold_laveau, male).
alive(leopold_laveau).
occupation(leopold_laveau, farmer).
personality(leopold_laveau, openness, -0.3).
personality(leopold_laveau, conscientiousness, -0.97).
personality(leopold_laveau, extroversion, -0.22).
personality(leopold_laveau, agreeableness, -0.31).
personality(leopold_laveau, neuroticism, 0.14).

%% Ursule Chénier
person(ursule_chenier).
first_name(ursule_chenier, 'Ursule').
last_name(ursule_chenier, 'Chénier').
full_name(ursule_chenier, 'Ursule Chénier').
gender(ursule_chenier, female).
alive(ursule_chenier).
occupation(ursule_chenier, baker).
personality(ursule_chenier, openness, 0.72).
personality(ursule_chenier, conscientiousness, 0.87).
personality(ursule_chenier, extroversion, 0.91).
personality(ursule_chenier, agreeableness, -0.14).
personality(ursule_chenier, neuroticism, 0.45).

%% Marius Broussard
person(marius_broussard).
first_name(marius_broussard, 'Marius').
last_name(marius_broussard, 'Broussard').
full_name(marius_broussard, 'Marius Broussard').
gender(marius_broussard, male).
alive(marius_broussard).
occupation(marius_broussard, farmer).
personality(marius_broussard, openness, 0.21).
personality(marius_broussard, conscientiousness, -0.22).
personality(marius_broussard, extroversion, -0.03).
personality(marius_broussard, agreeableness, 0.39).
personality(marius_broussard, neuroticism, 0.05).

%% Zélie Cormier
person(zelie_cormier).
first_name(zelie_cormier, 'Zélie').
last_name(zelie_cormier, 'Cormier').
full_name(zelie_cormier, 'Zélie Cormier').
gender(zelie_cormier, female).
alive(zelie_cormier).
occupation(zelie_cormier, teacher).
personality(zelie_cormier, openness, 0.26).
personality(zelie_cormier, conscientiousness, 0.36).
personality(zelie_cormier, extroversion, -0.03).
personality(zelie_cormier, agreeableness, -0.1).
personality(zelie_cormier, neuroticism, -0.03).

%% Narcisse Broussard
person(narcisse_broussard).
first_name(narcisse_broussard, 'Narcisse').
last_name(narcisse_broussard, 'Broussard').
full_name(narcisse_broussard, 'Narcisse Broussard').
gender(narcisse_broussard, male).
alive(narcisse_broussard).
occupation(narcisse_broussard, laborer).
personality(narcisse_broussard, openness, 0.25).
personality(narcisse_broussard, conscientiousness, 0.27).
personality(narcisse_broussard, extroversion, 0.1).
personality(narcisse_broussard, agreeableness, -0.08).
personality(narcisse_broussard, neuroticism, 0.02).

%% Onésime Broussard
person(onesime_broussard).
first_name(onesime_broussard, 'Onésime').
last_name(onesime_broussard, 'Broussard').
full_name(onesime_broussard, 'Onésime Broussard').
gender(onesime_broussard, male).
alive(onesime_broussard).
occupation(onesime_broussard, farmhand).
personality(onesime_broussard, openness, 0.15).
personality(onesime_broussard, conscientiousness, 0.25).
personality(onesime_broussard, extroversion, 0.05).
personality(onesime_broussard, agreeableness, 0.04).
personality(onesime_broussard, neuroticism, -0.05).

%% Marie Robichaux
person(marie_robichaux).
first_name(marie_robichaux, 'Marie').
last_name(marie_robichaux, 'Robichaux').
full_name(marie_robichaux, 'Marie Robichaux').
gender(marie_robichaux, female).
alive(marie_robichaux).
occupation(marie_robichaux, student).
personality(marie_robichaux, openness, -0.58).
personality(marie_robichaux, conscientiousness, 0.1).
personality(marie_robichaux, extroversion, 0.19).
personality(marie_robichaux, agreeableness, -0.04).
personality(marie_robichaux, neuroticism, 0.08).

%% Jeanne Breaux
person(jeanne_breaux).
first_name(jeanne_breaux, 'Jeanne').
last_name(jeanne_breaux, 'Breaux').
full_name(jeanne_breaux, 'Jeanne Breaux').
gender(jeanne_breaux, female).
alive(jeanne_breaux).
occupation(jeanne_breaux, student).
personality(jeanne_breaux, openness, -0.55).
personality(jeanne_breaux, conscientiousness, -0.14).
personality(jeanne_breaux, extroversion, 0.38).
personality(jeanne_breaux, agreeableness, -0.01).
personality(jeanne_breaux, neuroticism, 0.24).

%% Marguerite Breaux
person(marguerite_breaux).
first_name(marguerite_breaux, 'Marguerite').
last_name(marguerite_breaux, 'Breaux').
full_name(marguerite_breaux, 'Marguerite Breaux').
gender(marguerite_breaux, female).
alive(marguerite_breaux).
occupation(marguerite_breaux, student).
personality(marguerite_breaux, openness, -0.41).
personality(marguerite_breaux, conscientiousness, 0.02).
personality(marguerite_breaux, extroversion, 0.39).
personality(marguerite_breaux, agreeableness, -0.3).
personality(marguerite_breaux, neuroticism, 0.26).

%% Françoise Broussard
person(francoise_broussard).
first_name(francoise_broussard, 'Françoise').
last_name(francoise_broussard, 'Broussard').
full_name(francoise_broussard, 'Françoise Broussard').
gender(francoise_broussard, female).
alive(francoise_broussard).
occupation(francoise_broussard, student).
personality(francoise_broussard, openness, -0.66).
personality(francoise_broussard, conscientiousness, -0.23).
personality(francoise_broussard, extroversion, 0.22).
personality(francoise_broussard, agreeableness, -0.31).
personality(francoise_broussard, neuroticism, 0.15).

%% Louise Sonnier
person(louise_sonnier).
first_name(louise_sonnier, 'Louise').
last_name(louise_sonnier, 'Sonnier').
full_name(louise_sonnier, 'Louise Sonnier').
gender(louise_sonnier, female).
alive(louise_sonnier).
occupation(louise_sonnier, farmer).
personality(louise_sonnier, openness, 0.13).
personality(louise_sonnier, conscientiousness, -0.18).
personality(louise_sonnier, extroversion, -0.01).
personality(louise_sonnier, agreeableness, 0.24).
personality(louise_sonnier, neuroticism, 0.36).

%% Philibert Sonnier
person(philibert_sonnier).
first_name(philibert_sonnier, 'Philibert').
last_name(philibert_sonnier, 'Sonnier').
full_name(philibert_sonnier, 'Philibert Sonnier').
gender(philibert_sonnier, male).
alive(philibert_sonnier).
occupation(philibert_sonnier, cashier).
personality(philibert_sonnier, openness, 0.52).
personality(philibert_sonnier, conscientiousness, -0.13).
personality(philibert_sonnier, extroversion, -0.13).
personality(philibert_sonnier, agreeableness, 0.44).
personality(philibert_sonnier, neuroticism, 0.31).

%% Anne Robichaux
person(anne_robichaux).
first_name(anne_robichaux, 'Anne').
last_name(anne_robichaux, 'Robichaux').
full_name(anne_robichaux, 'Anne Robichaux').
gender(anne_robichaux, female).
alive(anne_robichaux).
occupation(anne_robichaux, waiter).
personality(anne_robichaux, openness, 0.19).
personality(anne_robichaux, conscientiousness, -0.12).
personality(anne_robichaux, extroversion, -0.1).
personality(anne_robichaux, agreeableness, 0.43).
personality(anne_robichaux, neuroticism, 0.12).

%% Sévère Cormier
person(severe_cormier).
first_name(severe_cormier, 'Sévère').
last_name(severe_cormier, 'Cormier').
full_name(severe_cormier, 'Sévère Cormier').
gender(severe_cormier, male).
alive(severe_cormier).
occupation(severe_cormier, farmer).
personality(severe_cormier, openness, 0.57).
personality(severe_cormier, conscientiousness, 0.06).
personality(severe_cormier, extroversion, -0.12).
personality(severe_cormier, agreeableness, 0.41).
personality(severe_cormier, neuroticism, 0.09).

%% Thérèse Cormier
person(therese_cormier).
first_name(therese_cormier, 'Thérèse').
last_name(therese_cormier, 'Cormier').
full_name(therese_cormier, 'Thérèse Cormier').
gender(therese_cormier, female).
alive(therese_cormier).
personality(therese_cormier, openness, 0.54).
personality(therese_cormier, conscientiousness, -0.15).
personality(therese_cormier, extroversion, -0.16).
personality(therese_cormier, agreeableness, 0.47).
personality(therese_cormier, neuroticism, 0.16).

%% Catherine Sonnier
person(catherine_sonnier).
first_name(catherine_sonnier, 'Catherine').
last_name(catherine_sonnier, 'Sonnier').
full_name(catherine_sonnier, 'Catherine Sonnier').
gender(catherine_sonnier, female).
alive(catherine_sonnier).
occupation(catherine_sonnier, owner_school).
personality(catherine_sonnier, openness, 0.22).
personality(catherine_sonnier, conscientiousness, -0.38).
personality(catherine_sonnier, extroversion, 0.02).
personality(catherine_sonnier, agreeableness, 0.35).
personality(catherine_sonnier, neuroticism, 0.05).

%% Jean Breaux
person(jean_breaux).
first_name(jean_breaux, 'Jean').
last_name(jean_breaux, 'Breaux').
full_name(jean_breaux, 'Jean Breaux').
gender(jean_breaux, male).
alive(jean_breaux).
occupation(jean_breaux, farmer).
personality(jean_breaux, openness, 0.31).
personality(jean_breaux, conscientiousness, -0.4).
personality(jean_breaux, extroversion, -0.05).
personality(jean_breaux, agreeableness, 0.18).
personality(jean_breaux, neuroticism, 0.07).

%% Madeleine Breaux
person(madeleine_breaux).
first_name(madeleine_breaux, 'Madeleine').
last_name(madeleine_breaux, 'Breaux').
full_name(madeleine_breaux, 'Madeleine Breaux').
gender(madeleine_breaux, female).
alive(madeleine_breaux).
occupation(madeleine_breaux, teacher).
personality(madeleine_breaux, openness, 0.49).
personality(madeleine_breaux, conscientiousness, -0.26).
personality(madeleine_breaux, extroversion, -0.05).
personality(madeleine_breaux, agreeableness, 0.17).
personality(madeleine_breaux, neuroticism, 0.03).

%% Jacques Broussard
person(jacques_broussard_2).
first_name(jacques_broussard_2, 'Jacques').
last_name(jacques_broussard_2, 'Broussard').
full_name(jacques_broussard_2, 'Jacques Broussard').
gender(jacques_broussard_2, male).
alive(jacques_broussard_2).
occupation(jacques_broussard_2, farmhand).
personality(jacques_broussard_2, openness, -0.03).
personality(jacques_broussard_2, conscientiousness, 0.14).
personality(jacques_broussard_2, extroversion, -0.11).
personality(jacques_broussard_2, agreeableness, 0.34).
personality(jacques_broussard_2, neuroticism, -0.12).

%% Pierre Broussard
person(pierre_broussard_2).
first_name(pierre_broussard_2, 'Pierre').
last_name(pierre_broussard_2, 'Broussard').
full_name(pierre_broussard_2, 'Pierre Broussard').
gender(pierre_broussard_2, male).
alive(pierre_broussard_2).
occupation(pierre_broussard_2, farmer).
personality(pierre_broussard_2, openness, -0.03).
personality(pierre_broussard_2, conscientiousness, 0.16).
personality(pierre_broussard_2, extroversion, 0.16).
personality(pierre_broussard_2, agreeableness, 0.43).
personality(pierre_broussard_2, neuroticism, -0.18).

%% Paul Cormier
person(paul_cormier).
first_name(paul_cormier, 'Paul').
last_name(paul_cormier, 'Cormier').
full_name(paul_cormier, 'Paul Cormier').
gender(paul_cormier, male).
alive(paul_cormier).
occupation(paul_cormier, farmer).
personality(paul_cormier, openness, 0.45).
personality(paul_cormier, conscientiousness, 0.51).
personality(paul_cormier, extroversion, 0.05).
personality(paul_cormier, agreeableness, 0.09).
personality(paul_cormier, neuroticism, -0.22).

%% Élisabeth Sonnier
person(elisabeth_sonnier).
first_name(elisabeth_sonnier, 'Élisabeth').
last_name(elisabeth_sonnier, 'Sonnier').
full_name(elisabeth_sonnier, 'Élisabeth Sonnier').
gender(elisabeth_sonnier, female).
alive(elisabeth_sonnier).
occupation(elisabeth_sonnier, laborer).
personality(elisabeth_sonnier, openness, 0.23).
personality(elisabeth_sonnier, conscientiousness, 0.32).
personality(elisabeth_sonnier, extroversion, -0.04).
personality(elisabeth_sonnier, agreeableness, 0.03).
personality(elisabeth_sonnier, neuroticism, -0.19).

%% Louis Cormier
person(louis_cormier).
first_name(louis_cormier, 'Louis').
last_name(louis_cormier, 'Cormier').
full_name(louis_cormier, 'Louis Cormier').
gender(louis_cormier, male).
alive(louis_cormier).
occupation(louis_cormier, cook).
personality(louis_cormier, openness, 0.14).
personality(louis_cormier, conscientiousness, 0.34).
personality(louis_cormier, extroversion, -0.2).
personality(louis_cormier, agreeableness, 0.13).
personality(louis_cormier, neuroticism, -0.23).

%% François Cormier
person(francois_cormier).
first_name(francois_cormier, 'François').
last_name(francois_cormier, 'Cormier').
full_name(francois_cormier, 'François Cormier').
gender(francois_cormier, male).
alive(francois_cormier).
occupation(francois_cormier, farmhand).
personality(francois_cormier, openness, 0.34).
personality(francois_cormier, conscientiousness, 0.29).
personality(francois_cormier, extroversion, -0.04).
personality(francois_cormier, agreeableness, -0.08).
personality(francois_cormier, neuroticism, -0.17).

%% Henri Broussard
person(henri_broussard).
first_name(henri_broussard, 'Henri').
last_name(henri_broussard, 'Broussard').
full_name(henri_broussard, 'Henri Broussard').
gender(henri_broussard, male).
alive(henri_broussard).
personality(henri_broussard, openness, 0.39).
personality(henri_broussard, conscientiousness, 0.21).
personality(henri_broussard, extroversion, 0.09).
personality(henri_broussard, agreeableness, 0.57).
personality(henri_broussard, neuroticism, 0.06).

%% Charles Broussard
person(charles_broussard).
first_name(charles_broussard, 'Charles').
last_name(charles_broussard, 'Broussard').
full_name(charles_broussard, 'Charles Broussard').
gender(charles_broussard, male).
alive(charles_broussard).
personality(charles_broussard, openness, 0.3).
personality(charles_broussard, conscientiousness, 0.12).
personality(charles_broussard, extroversion, -0.09).
personality(charles_broussard, agreeableness, 0.75).
personality(charles_broussard, neuroticism, -0.11).

%% Joseph Broussard
person(joseph_broussard).
first_name(joseph_broussard, 'Joseph').
last_name(joseph_broussard, 'Broussard').
full_name(joseph_broussard, 'Joseph Broussard').
gender(joseph_broussard, male).
alive(joseph_broussard).
personality(joseph_broussard, openness, 0.51).
personality(joseph_broussard, conscientiousness, -0.02).
personality(joseph_broussard, extroversion, -0.11).
personality(joseph_broussard, agreeableness, 0.79).
personality(joseph_broussard, neuroticism, 0.22).

%% Joséphine Bergeron
person(josephine_bergeron).
first_name(josephine_bergeron, 'Joséphine').
last_name(josephine_bergeron, 'Bergeron').
full_name(josephine_bergeron, 'Joséphine Bergeron').
gender(josephine_bergeron, female).
alive(josephine_bergeron).
personality(josephine_bergeron, openness, 0.34).
personality(josephine_bergeron, conscientiousness, 0.06).
personality(josephine_bergeron, extroversion, -0.05).
personality(josephine_bergeron, agreeableness, 0.61).
personality(josephine_bergeron, neuroticism, 0.25).

%% Antoinette Broussard
person(antoinette_broussard).
first_name(antoinette_broussard, 'Antoinette').
last_name(antoinette_broussard, 'Broussard').
full_name(antoinette_broussard, 'Antoinette Broussard').
gender(antoinette_broussard, female).
alive(antoinette_broussard).
occupation(antoinette_broussard, farmhand).
personality(antoinette_broussard, openness, -0.07).
personality(antoinette_broussard, conscientiousness, 0.31).
personality(antoinette_broussard, extroversion, -0.02).
personality(antoinette_broussard, agreeableness, 0.16).
personality(antoinette_broussard, neuroticism, -0.5).

%% Hélène Broussard
person(helene_broussard).
first_name(helene_broussard, 'Hélène').
last_name(helene_broussard, 'Broussard').
full_name(helene_broussard, 'Hélène Broussard').
gender(helene_broussard, female).
alive(helene_broussard).
occupation(helene_broussard, farmer).
personality(helene_broussard, openness, 0.06).
personality(helene_broussard, conscientiousness, 0.23).
personality(helene_broussard, extroversion, 0.03).
personality(helene_broussard, agreeableness, 0.18).
personality(helene_broussard, neuroticism, -0.24).

%% Geneviève Broussard
person(genevieve_broussard).
first_name(genevieve_broussard, 'Geneviève').
last_name(genevieve_broussard, 'Broussard').
full_name(genevieve_broussard, 'Geneviève Broussard').
gender(genevieve_broussard, female).
alive(genevieve_broussard).
occupation(genevieve_broussard, farmer).
personality(genevieve_broussard, openness, -0.13).
personality(genevieve_broussard, conscientiousness, 0.07).
personality(genevieve_broussard, extroversion, 0.28).
personality(genevieve_broussard, agreeableness, 0.27).
personality(genevieve_broussard, neuroticism, -0.31).

%% Antoine Mouton
person(antoine_mouton).
first_name(antoine_mouton, 'Antoine').
last_name(antoine_mouton, 'Mouton').
full_name(antoine_mouton, 'Antoine Mouton').
gender(antoine_mouton, male).
alive(antoine_mouton).
occupation(antoine_mouton, farmer).
personality(antoine_mouton, openness, 0.24).
personality(antoine_mouton, conscientiousness, 0.26).
personality(antoine_mouton, extroversion, 0.05).
personality(antoine_mouton, agreeableness, 0.16).
personality(antoine_mouton, neuroticism, 0.11).

%% Michel Mouton
person(michel_mouton).
first_name(michel_mouton, 'Michel').
last_name(michel_mouton, 'Mouton').
full_name(michel_mouton, 'Michel Mouton').
gender(michel_mouton, male).
alive(michel_mouton).
occupation(michel_mouton, farmhand).
personality(michel_mouton, openness, 0.41).
personality(michel_mouton, conscientiousness, 0.12).
personality(michel_mouton, extroversion, -0.01).
personality(michel_mouton, agreeableness, 0.47).
personality(michel_mouton, neuroticism, 0.2).

%% Suzanne Breaux
person(suzanne_breaux).
first_name(suzanne_breaux, 'Suzanne').
last_name(suzanne_breaux, 'Breaux').
full_name(suzanne_breaux, 'Suzanne Breaux').
gender(suzanne_breaux, female).
alive(suzanne_breaux).
occupation(suzanne_breaux, farmer).
personality(suzanne_breaux, openness, 0.19).
personality(suzanne_breaux, conscientiousness, 0.03).
personality(suzanne_breaux, extroversion, 0.04).
personality(suzanne_breaux, agreeableness, 0.28).
personality(suzanne_breaux, neuroticism, 0.28).

%% Émile Mouton
person(emile_mouton).
first_name(emile_mouton, 'Émile').
last_name(emile_mouton, 'Mouton').
full_name(emile_mouton, 'Émile Mouton').
gender(emile_mouton, male).
alive(emile_mouton).
personality(emile_mouton, openness, 0.43).
personality(emile_mouton, conscientiousness, 0.19).
personality(emile_mouton, extroversion, 0.16).
personality(emile_mouton, agreeableness, 0.52).
personality(emile_mouton, neuroticism, 0.42).

%% Claude Sonnier
person(claude_sonnier).
first_name(claude_sonnier, 'Claude').
last_name(claude_sonnier, 'Sonnier').
full_name(claude_sonnier, 'Claude Sonnier').
gender(claude_sonnier, male).
alive(claude_sonnier).
occupation(claude_sonnier, farmhand).
personality(claude_sonnier, openness, 0.29).
personality(claude_sonnier, conscientiousness, 0.14).
personality(claude_sonnier, extroversion, 0.0).
personality(claude_sonnier, agreeableness, 0.19).
personality(claude_sonnier, neuroticism, -0.12).

%% René Sonnier
person(rene_sonnier).
first_name(rene_sonnier, 'René').
last_name(rene_sonnier, 'Sonnier').
full_name(rene_sonnier, 'René Sonnier').
gender(rene_sonnier, male).
alive(rene_sonnier).
personality(rene_sonnier, openness, 0.19).
personality(rene_sonnier, conscientiousness, 0.15).
personality(rene_sonnier, extroversion, 0.23).
personality(rene_sonnier, agreeableness, 0.43).
personality(rene_sonnier, neuroticism, 0.09).

%% Guillaume Sonnier
person(guillaume_sonnier).
first_name(guillaume_sonnier, 'Guillaume').
last_name(guillaume_sonnier, 'Sonnier').
full_name(guillaume_sonnier, 'Guillaume Sonnier').
gender(guillaume_sonnier, male).
alive(guillaume_sonnier).
occupation(guillaume_sonnier, teacher).
personality(guillaume_sonnier, openness, 0.17).
personality(guillaume_sonnier, conscientiousness, 0.23).
personality(guillaume_sonnier, extroversion, 0.23).
personality(guillaume_sonnier, agreeableness, 0.3).
personality(guillaume_sonnier, neuroticism, -0.01).

%% Étienne Sonnier
person(etienne_sonnier_2).
first_name(etienne_sonnier_2, 'Étienne').
last_name(etienne_sonnier_2, 'Sonnier').
full_name(etienne_sonnier_2, 'Étienne Sonnier').
gender(etienne_sonnier_2, male).
alive(etienne_sonnier_2).
occupation(etienne_sonnier_2, cashier).
personality(etienne_sonnier_2, openness, 0.23).
personality(etienne_sonnier_2, conscientiousness, 0.16).
personality(etienne_sonnier_2, extroversion, -0.09).
personality(etienne_sonnier_2, agreeableness, 0.21).
personality(etienne_sonnier_2, neuroticism, 0.21).

%% Cécile Bégnaud
person(cecile_begnaud).
first_name(cecile_begnaud, 'Cécile').
last_name(cecile_begnaud, 'Bégnaud').
full_name(cecile_begnaud, 'Cécile Bégnaud').
gender(cecile_begnaud, female).
alive(cecile_begnaud).
personality(cecile_begnaud, openness, 0.1).
personality(cecile_begnaud, conscientiousness, 0.29).
personality(cecile_begnaud, extroversion, 0.2).
personality(cecile_begnaud, agreeableness, 0.3).
personality(cecile_begnaud, neuroticism, -0.0).

%% Marcel Broussard
person(marcel_broussard).
first_name(marcel_broussard, 'Marcel').
last_name(marcel_broussard, 'Broussard').
full_name(marcel_broussard, 'Marcel Broussard').
gender(marcel_broussard, male).
alive(marcel_broussard).
occupation(marcel_broussard, farmhand).
personality(marcel_broussard, openness, 0.05).
personality(marcel_broussard, conscientiousness, -0.13).
personality(marcel_broussard, extroversion, 0.04).
personality(marcel_broussard, agreeableness, 0.26).
personality(marcel_broussard, neuroticism, 0.11).

%% Charlotte Robichaux
person(charlotte_robichaux).
first_name(charlotte_robichaux, 'Charlotte').
last_name(charlotte_robichaux, 'Robichaux').
full_name(charlotte_robichaux, 'Charlotte Robichaux').
gender(charlotte_robichaux, female).
alive(charlotte_robichaux).
occupation(charlotte_robichaux, farmer).
personality(charlotte_robichaux, openness, 0.2).
personality(charlotte_robichaux, conscientiousness, -0.15).
personality(charlotte_robichaux, extroversion, 0.3).
personality(charlotte_robichaux, agreeableness, 0.42).
personality(charlotte_robichaux, neuroticism, 0.18).

%% Claire Robichaux
person(claire_robichaux).
first_name(claire_robichaux, 'Claire').
last_name(claire_robichaux, 'Robichaux').
full_name(claire_robichaux, 'Claire Robichaux').
gender(claire_robichaux, female).
alive(claire_robichaux).
occupation(claire_robichaux, laborer).
personality(claire_robichaux, openness, 0.51).
personality(claire_robichaux, conscientiousness, -0.38).
personality(claire_robichaux, extroversion, 0.05).
personality(claire_robichaux, agreeableness, 0.25).
personality(claire_robichaux, neuroticism, -0.0).

%% Georges Robichaux
person(georges_robichaux).
first_name(georges_robichaux, 'Georges').
last_name(georges_robichaux, 'Robichaux').
full_name(georges_robichaux, 'Georges Robichaux').
gender(georges_robichaux, male).
alive(georges_robichaux).
occupation(georges_robichaux, laborer).
personality(georges_robichaux, openness, 0.45).
personality(georges_robichaux, conscientiousness, -0.2).
personality(georges_robichaux, extroversion, -0.06).
personality(georges_robichaux, agreeableness, 0.31).
personality(georges_robichaux, neuroticism, 0.21).

%% Émilie Robichaux
person(emilie_robichaux).
first_name(emilie_robichaux, 'Émilie').
last_name(emilie_robichaux, 'Robichaux').
full_name(emilie_robichaux, 'Émilie Robichaux').
gender(emilie_robichaux, female).
alive(emilie_robichaux).
occupation(emilie_robichaux, laborer).
personality(emilie_robichaux, openness, 0.7).
personality(emilie_robichaux, conscientiousness, -0.38).
personality(emilie_robichaux, extroversion, 0.08).
personality(emilie_robichaux, agreeableness, 0.2).
personality(emilie_robichaux, neuroticism, 0.21).

%% Adèle Cormier
person(adele_cormier_2).
first_name(adele_cormier_2, 'Adèle').
last_name(adele_cormier_2, 'Cormier').
full_name(adele_cormier_2, 'Adèle Cormier').
gender(adele_cormier_2, female).
alive(adele_cormier_2).
occupation(adele_cormier_2, farmer).
personality(adele_cormier_2, openness, 0.52).
personality(adele_cormier_2, conscientiousness, -0.11).
personality(adele_cormier_2, extroversion, 0.11).
personality(adele_cormier_2, agreeableness, 0.44).
personality(adele_cormier_2, neuroticism, 0.28).

%% Alice Cormier
person(alice_cormier).
first_name(alice_cormier, 'Alice').
last_name(alice_cormier, 'Cormier').
full_name(alice_cormier, 'Alice Cormier').
gender(alice_cormier, female).
alive(alice_cormier).
occupation(alice_cormier, farmer).
personality(alice_cormier, openness, 0.66).
personality(alice_cormier, conscientiousness, -0.34).
personality(alice_cormier, extroversion, -0.03).
personality(alice_cormier, agreeableness, 0.24).
personality(alice_cormier, neuroticism, 0.03).

%% Amélie Robichaux
person(amelie_robichaux).
first_name(amelie_robichaux, 'Amélie').
last_name(amelie_robichaux, 'Robichaux').
full_name(amelie_robichaux, 'Amélie Robichaux').
gender(amelie_robichaux, female).
alive(amelie_robichaux).
occupation(amelie_robichaux, farmer).
personality(amelie_robichaux, openness, 0.37).
personality(amelie_robichaux, conscientiousness, -0.38).
personality(amelie_robichaux, extroversion, 0.14).
personality(amelie_robichaux, agreeableness, 0.08).
personality(amelie_robichaux, neuroticism, 0.26).

%% Maurice Cormier
person(maurice_cormier_2).
first_name(maurice_cormier_2, 'Maurice').
last_name(maurice_cormier_2, 'Cormier').
full_name(maurice_cormier_2, 'Maurice Cormier').
gender(maurice_cormier_2, male).
alive(maurice_cormier_2).
occupation(maurice_cormier_2, farmer).
personality(maurice_cormier_2, openness, 0.35).
personality(maurice_cormier_2, conscientiousness, -0.03).
personality(maurice_cormier_2, extroversion, -0.54).
personality(maurice_cormier_2, agreeableness, -0.08).
personality(maurice_cormier_2, neuroticism, -0.11).

%% Julien Broussard
person(julien_broussard).
first_name(julien_broussard, 'Julien').
last_name(julien_broussard, 'Broussard').
full_name(julien_broussard, 'Julien Broussard').
gender(julien_broussard, male).
alive(julien_broussard).
occupation(julien_broussard, farmer).
personality(julien_broussard, openness, 0.36).
personality(julien_broussard, conscientiousness, 0.02).
personality(julien_broussard, extroversion, -0.05).
personality(julien_broussard, agreeableness, 0.4).
personality(julien_broussard, neuroticism, 0.19).

%% Luc Broussard
person(luc_broussard_2).
first_name(luc_broussard_2, 'Luc').
last_name(luc_broussard_2, 'Broussard').
full_name(luc_broussard_2, 'Luc Broussard').
gender(luc_broussard_2, male).
alive(luc_broussard_2).
personality(luc_broussard_2, openness, 0.21).
personality(luc_broussard_2, conscientiousness, 0.06).
personality(luc_broussard_2, extroversion, -0.01).
personality(luc_broussard_2, agreeableness, 0.27).
personality(luc_broussard_2, neuroticism, 0.1).

%% Nicolas Broussard
person(nicolas_broussard_2).
first_name(nicolas_broussard_2, 'Nicolas').
last_name(nicolas_broussard_2, 'Broussard').
full_name(nicolas_broussard_2, 'Nicolas Broussard').
gender(nicolas_broussard_2, male).
alive(nicolas_broussard_2).
occupation(nicolas_broussard_2, farmer).
personality(nicolas_broussard_2, openness, 0.13).
personality(nicolas_broussard_2, conscientiousness, -0.0).
personality(nicolas_broussard_2, extroversion, 0.3).
personality(nicolas_broussard_2, agreeableness, 0.01).
personality(nicolas_broussard_2, neuroticism, 0.14).

%% Angélique Sonnier
person(angelique_sonnier).
first_name(angelique_sonnier, 'Angélique').
last_name(angelique_sonnier, 'Sonnier').
full_name(angelique_sonnier, 'Angélique Sonnier').
gender(angelique_sonnier, female).
alive(angelique_sonnier).
occupation(angelique_sonnier, laborer).
personality(angelique_sonnier, openness, 0.62).
personality(angelique_sonnier, conscientiousness, 0.19).
personality(angelique_sonnier, extroversion, 0.15).
personality(angelique_sonnier, agreeableness, 0.05).
personality(angelique_sonnier, neuroticism, 0.22).

%% Sébastien Broussard
person(sebastien_broussard_2).
first_name(sebastien_broussard_2, 'Sébastien').
last_name(sebastien_broussard_2, 'Broussard').
full_name(sebastien_broussard_2, 'Sébastien Broussard').
gender(sebastien_broussard_2, male).
alive(sebastien_broussard_2).
occupation(sebastien_broussard_2, farmhand).
personality(sebastien_broussard_2, openness, 0.46).
personality(sebastien_broussard_2, conscientiousness, 0.09).
personality(sebastien_broussard_2, extroversion, 0.23).
personality(sebastien_broussard_2, agreeableness, -0.24).
personality(sebastien_broussard_2, neuroticism, 0.04).

%% Béatrice Robichaux
person(beatrice_robichaux).
first_name(beatrice_robichaux, 'Béatrice').
last_name(beatrice_robichaux, 'Robichaux').
full_name(beatrice_robichaux, 'Béatrice Robichaux').
gender(beatrice_robichaux, female).
alive(beatrice_robichaux).
occupation(beatrice_robichaux, farmer).
personality(beatrice_robichaux, openness, 0.66).
personality(beatrice_robichaux, conscientiousness, 0.13).
personality(beatrice_robichaux, extroversion, 0.24).
personality(beatrice_robichaux, agreeableness, -0.05).
personality(beatrice_robichaux, neuroticism, 0.39).

%% Armand Broussard
person(armand_broussard_2).
first_name(armand_broussard_2, 'Armand').
last_name(armand_broussard_2, 'Broussard').
full_name(armand_broussard_2, 'Armand Broussard').
gender(armand_broussard_2, male).
alive(armand_broussard_2).
occupation(armand_broussard_2, farmer).
personality(armand_broussard_2, openness, 0.54).
personality(armand_broussard_2, conscientiousness, -0.01).
personality(armand_broussard_2, extroversion, 0.12).
personality(armand_broussard_2, agreeableness, -0.29).
personality(armand_broussard_2, neuroticism, 0.21).

%% Gaston Broussard
person(gaston_broussard).
first_name(gaston_broussard, 'Gaston').
last_name(gaston_broussard, 'Broussard').
full_name(gaston_broussard, 'Gaston Broussard').
gender(gaston_broussard, male).
alive(gaston_broussard).
occupation(gaston_broussard, farmer).
personality(gaston_broussard, openness, 0.34).
personality(gaston_broussard, conscientiousness, -0.02).
personality(gaston_broussard, extroversion, 0.24).
personality(gaston_broussard, agreeableness, -0.2).
personality(gaston_broussard, neuroticism, 0.37).

%% Raoul Broussard
person(raoul_broussard).
first_name(raoul_broussard, 'Raoul').
last_name(raoul_broussard, 'Broussard').
full_name(raoul_broussard, 'Raoul Broussard').
gender(raoul_broussard, male).
alive(raoul_broussard).
occupation(raoul_broussard, farmer).
personality(raoul_broussard, openness, 0.55).
personality(raoul_broussard, conscientiousness, -0.07).
personality(raoul_broussard, extroversion, 0.02).
personality(raoul_broussard, agreeableness, -0.17).
personality(raoul_broussard, neuroticism, 0.03).

%% Blanche Broussard
person(blanche_broussard).
first_name(blanche_broussard, 'Blanche').
last_name(blanche_broussard, 'Broussard').
full_name(blanche_broussard, 'Blanche Broussard').
gender(blanche_broussard, female).
alive(blanche_broussard).
occupation(blanche_broussard, farmer).
personality(blanche_broussard, openness, 0.06).
personality(blanche_broussard, conscientiousness, 0.03).
personality(blanche_broussard, extroversion, 0.37).
personality(blanche_broussard, agreeableness, 0.11).
personality(blanche_broussard, neuroticism, -0.07).

%% Caroline Broussard
person(caroline_broussard).
first_name(caroline_broussard, 'Caroline').
last_name(caroline_broussard, 'Broussard').
full_name(caroline_broussard, 'Caroline Broussard').
gender(caroline_broussard, female).
alive(caroline_broussard).
occupation(caroline_broussard, laborer).
personality(caroline_broussard, openness, 0.35).
personality(caroline_broussard, conscientiousness, 0.14).
personality(caroline_broussard, extroversion, 0.35).
personality(caroline_broussard, agreeableness, 0.01).
personality(caroline_broussard, neuroticism, 0.11).

%% Léon Broussard
person(leon_broussard).
first_name(leon_broussard, 'Léon').
last_name(leon_broussard, 'Broussard').
full_name(leon_broussard, 'Léon Broussard').
gender(leon_broussard, male).
alive(leon_broussard).
personality(leon_broussard, openness, 0.37).
personality(leon_broussard, conscientiousness, -0.01).
personality(leon_broussard, extroversion, 0.11).
personality(leon_broussard, agreeableness, -0.04).
personality(leon_broussard, neuroticism, 0.02).

%% Constance Boudreaux
person(constance_boudreaux).
first_name(constance_boudreaux, 'Constance').
last_name(constance_boudreaux, 'Boudreaux').
full_name(constance_boudreaux, 'Constance Boudreaux').
gender(constance_boudreaux, female).
alive(constance_boudreaux).
occupation(constance_boudreaux, student).
personality(constance_boudreaux, openness, 0.33).
personality(constance_boudreaux, conscientiousness, -0.1).
personality(constance_boudreaux, extroversion, 0.1).
personality(constance_boudreaux, agreeableness, -0.1).
personality(constance_boudreaux, neuroticism, -0.17).

%% Delphine Robichaux
person(delphine_robichaux).
first_name(delphine_robichaux, 'Delphine').
last_name(delphine_robichaux, 'Robichaux').
full_name(delphine_robichaux, 'Delphine Robichaux').
gender(delphine_robichaux, female).
alive(delphine_robichaux).
occupation(delphine_robichaux, laborer).
personality(delphine_robichaux, openness, 0.1).
personality(delphine_robichaux, conscientiousness, -0.09).
personality(delphine_robichaux, extroversion, -0.41).
personality(delphine_robichaux, agreeableness, -0.06).
personality(delphine_robichaux, neuroticism, -0.07).

%% Diane Cormier
person(diane_cormier).
first_name(diane_cormier, 'Diane').
last_name(diane_cormier, 'Cormier').
full_name(diane_cormier, 'Diane Cormier').
gender(diane_cormier, female).
alive(diane_cormier).
occupation(diane_cormier, farmer).
personality(diane_cormier, openness, 0.06).
personality(diane_cormier, conscientiousness, -0.37).
personality(diane_cormier, extroversion, -0.19).
personality(diane_cormier, agreeableness, 0.01).
personality(diane_cormier, neuroticism, 0.01).

%% Édith Cormier
person(edith_cormier_2).
first_name(edith_cormier_2, 'Édith').
last_name(edith_cormier_2, 'Cormier').
full_name(edith_cormier_2, 'Édith Cormier').
gender(edith_cormier_2, female).
alive(edith_cormier_2).
occupation(edith_cormier_2, farmer).
personality(edith_cormier_2, openness, 0.18).
personality(edith_cormier_2, conscientiousness, -0.01).
personality(edith_cormier_2, extroversion, 0.19).
personality(edith_cormier_2, agreeableness, 0.36).
personality(edith_cormier_2, neuroticism, 0.07).

%% Éléonore Bergeron
person(eleonore_bergeron).
first_name(eleonore_bergeron, 'Éléonore').
last_name(eleonore_bergeron, 'Bergeron').
full_name(eleonore_bergeron, 'Éléonore Bergeron').
gender(eleonore_bergeron, female).
alive(eleonore_bergeron).
occupation(eleonore_bergeron, farmer).
personality(eleonore_bergeron, openness, 0.11).
personality(eleonore_bergeron, conscientiousness, 0.04).
personality(eleonore_bergeron, extroversion, -0.12).
personality(eleonore_bergeron, agreeableness, 0.18).
personality(eleonore_bergeron, neuroticism, 0.2).

%% Eugène Sonnier
person(eugene_sonnier).
first_name(eugene_sonnier, 'Eugène').
last_name(eugene_sonnier, 'Sonnier').
full_name(eugene_sonnier, 'Eugène Sonnier').
gender(eugene_sonnier, male).
alive(eugene_sonnier).
occupation(eugene_sonnier, farmhand).
personality(eugene_sonnier, openness, 0.14).
personality(eugene_sonnier, conscientiousness, 0.1).
personality(eugene_sonnier, extroversion, 0.09).
personality(eugene_sonnier, agreeableness, 0.39).
personality(eugene_sonnier, neuroticism, 0.27).

%% Auguste Sonnier
person(auguste_sonnier).
first_name(auguste_sonnier, 'Auguste').
last_name(auguste_sonnier, 'Sonnier').
full_name(auguste_sonnier, 'Auguste Sonnier').
gender(auguste_sonnier, male).
alive(auguste_sonnier).
occupation(auguste_sonnier, farmhand).
personality(auguste_sonnier, openness, 0.24).
personality(auguste_sonnier, conscientiousness, 0.14).
personality(auguste_sonnier, extroversion, 0.13).
personality(auguste_sonnier, agreeableness, 0.2).
personality(auguste_sonnier, neuroticism, 0.2).

%% Estelle Mouton
person(estelle_mouton).
first_name(estelle_mouton, 'Estelle').
last_name(estelle_mouton, 'Mouton').
full_name(estelle_mouton, 'Estelle Mouton').
gender(estelle_mouton, female).
alive(estelle_mouton).
occupation(estelle_mouton, farmer).
personality(estelle_mouton, openness, 0.1).
personality(estelle_mouton, conscientiousness, -0.01).
personality(estelle_mouton, extroversion, 0.0).
personality(estelle_mouton, agreeableness, 0.28).
personality(estelle_mouton, neuroticism, 0.27).

%% Eugénie Cormier
person(eugenie_cormier).
first_name(eugenie_cormier, 'Eugénie').
last_name(eugenie_cormier, 'Cormier').
full_name(eugenie_cormier, 'Eugénie Cormier').
gender(eugenie_cormier, female).
alive(eugenie_cormier).
occupation(eugenie_cormier, farmer).
personality(eugenie_cormier, openness, 0.05).
personality(eugenie_cormier, conscientiousness, 0.36).
personality(eugenie_cormier, extroversion, -0.08).
personality(eugenie_cormier, agreeableness, 0.3).
personality(eugenie_cormier, neuroticism, 0.02).

%% Théodore Bégnaud
person(theodore_begnaud).
first_name(theodore_begnaud, 'Théodore').
last_name(theodore_begnaud, 'Bégnaud').
full_name(theodore_begnaud, 'Théodore Bégnaud').
gender(theodore_begnaud, male).
alive(theodore_begnaud).
occupation(theodore_begnaud, farmer).
personality(theodore_begnaud, openness, -0.23).
personality(theodore_begnaud, conscientiousness, 0.04).
personality(theodore_begnaud, extroversion, -0.24).
personality(theodore_begnaud, agreeableness, -0.19).
personality(theodore_begnaud, neuroticism, -0.36).

%% Gustave Bégnaud
person(gustave_begnaud).
first_name(gustave_begnaud, 'Gustave').
last_name(gustave_begnaud, 'Bégnaud').
full_name(gustave_begnaud, 'Gustave Bégnaud').
gender(gustave_begnaud, male).
alive(gustave_begnaud).
occupation(gustave_begnaud, laborer).
personality(gustave_begnaud, openness, -0.24).
personality(gustave_begnaud, conscientiousness, -0.02).
personality(gustave_begnaud, extroversion, -0.24).
personality(gustave_begnaud, agreeableness, -0.39).
personality(gustave_begnaud, neuroticism, -0.27).

%% Honoré Bégnaud
person(honore_begnaud).
first_name(honore_begnaud, 'Honoré').
last_name(honore_begnaud, 'Bégnaud').
full_name(honore_begnaud, 'Honoré Bégnaud').
gender(honore_begnaud, male).
alive(honore_begnaud).
occupation(honore_begnaud, laborer).
personality(honore_begnaud, openness, -0.26).
personality(honore_begnaud, conscientiousness, 0.11).
personality(honore_begnaud, extroversion, -0.26).
personality(honore_begnaud, agreeableness, -0.38).
personality(honore_begnaud, neuroticism, -0.02).

%% Florence Broussard
person(florence_broussard).
first_name(florence_broussard, 'Florence').
last_name(florence_broussard, 'Broussard').
full_name(florence_broussard, 'Florence Broussard').
gender(florence_broussard, female).
alive(florence_broussard).
occupation(florence_broussard, farmer).
personality(florence_broussard, openness, -0.02).
personality(florence_broussard, conscientiousness, 0.09).
personality(florence_broussard, extroversion, -0.08).
personality(florence_broussard, agreeableness, -0.15).
personality(florence_broussard, neuroticism, -0.09).

%% Gabrielle Robichaux
person(gabrielle_robichaux).
first_name(gabrielle_robichaux, 'Gabrielle').
last_name(gabrielle_robichaux, 'Robichaux').
full_name(gabrielle_robichaux, 'Gabrielle Robichaux').
gender(gabrielle_robichaux, female).
alive(gabrielle_robichaux).
personality(gabrielle_robichaux, openness, -0.17).
personality(gabrielle_robichaux, conscientiousness, 0.19).
personality(gabrielle_robichaux, extroversion, -0.18).
personality(gabrielle_robichaux, agreeableness, -0.09).
personality(gabrielle_robichaux, neuroticism, -0.32).

%% Henriette Mouton
person(henriette_mouton).
first_name(henriette_mouton, 'Henriette').
last_name(henriette_mouton, 'Mouton').
full_name(henriette_mouton, 'Henriette Mouton').
gender(henriette_mouton, female).
alive(henriette_mouton).
occupation(henriette_mouton, student).
personality(henriette_mouton, openness, -0.21).
personality(henriette_mouton, conscientiousness, 0.12).
personality(henriette_mouton, extroversion, -0.43).
personality(henriette_mouton, agreeableness, -0.16).
personality(henriette_mouton, neuroticism, -0.25).

%% Isabelle Mouton
person(isabelle_mouton).
first_name(isabelle_mouton, 'Isabelle').
last_name(isabelle_mouton, 'Mouton').
full_name(isabelle_mouton, 'Isabelle Mouton').
gender(isabelle_mouton, female).
alive(isabelle_mouton).
occupation(isabelle_mouton, farmhand).
personality(isabelle_mouton, openness, 0.12).
personality(isabelle_mouton, conscientiousness, -0.29).
personality(isabelle_mouton, extroversion, 0.04).
personality(isabelle_mouton, agreeableness, -0.57).
personality(isabelle_mouton, neuroticism, -0.16).

%% Jacqueline Sonnier
person(jacqueline_sonnier).
first_name(jacqueline_sonnier, 'Jacqueline').
last_name(jacqueline_sonnier, 'Sonnier').
full_name(jacqueline_sonnier, 'Jacqueline Sonnier').
gender(jacqueline_sonnier, female).
alive(jacqueline_sonnier).
occupation(jacqueline_sonnier, farmhand).
personality(jacqueline_sonnier, openness, 0.19).
personality(jacqueline_sonnier, conscientiousness, -0.29).
personality(jacqueline_sonnier, extroversion, -0.06).
personality(jacqueline_sonnier, agreeableness, -0.37).
personality(jacqueline_sonnier, neuroticism, -0.12).

%% Lucien Boudreaux
person(lucien_boudreaux).
first_name(lucien_boudreaux, 'Lucien').
last_name(lucien_boudreaux, 'Boudreaux').
full_name(lucien_boudreaux, 'Lucien Boudreaux').
gender(lucien_boudreaux, male).
alive(lucien_boudreaux).
occupation(lucien_boudreaux, laborer).
personality(lucien_boudreaux, openness, -0.13).
personality(lucien_boudreaux, conscientiousness, -0.22).
personality(lucien_boudreaux, extroversion, -0.08).
personality(lucien_boudreaux, agreeableness, -0.22).
personality(lucien_boudreaux, neuroticism, -0.03).

%% Félix Boudreaux
person(felix_boudreaux).
first_name(felix_boudreaux, 'Félix').
last_name(felix_boudreaux, 'Boudreaux').
full_name(felix_boudreaux, 'Félix Boudreaux').
gender(felix_boudreaux, male).
alive(felix_boudreaux).
occupation(felix_boudreaux, farmer).
personality(felix_boudreaux, openness, -0.03).
personality(felix_boudreaux, conscientiousness, -0.09).
personality(felix_boudreaux, extroversion, -0.12).
personality(felix_boudreaux, agreeableness, -0.27).
personality(felix_boudreaux, neuroticism, -0.0).

%% Albert Boudreaux
person(albert_boudreaux).
first_name(albert_boudreaux, 'Albert').
last_name(albert_boudreaux, 'Boudreaux').
full_name(albert_boudreaux, 'Albert Boudreaux').
gender(albert_boudreaux, male).
alive(albert_boudreaux).
occupation(albert_boudreaux, laborer).
personality(albert_boudreaux, openness, 0.08).
personality(albert_boudreaux, conscientiousness, -0.25).
personality(albert_boudreaux, extroversion, -0.07).
personality(albert_boudreaux, agreeableness, -0.35).
personality(albert_boudreaux, neuroticism, -0.09).

%% Juliette Sonnier
person(juliette_sonnier_2).
first_name(juliette_sonnier_2, 'Juliette').
last_name(juliette_sonnier_2, 'Sonnier').
full_name(juliette_sonnier_2, 'Juliette Sonnier').
gender(juliette_sonnier_2, female).
alive(juliette_sonnier_2).
occupation(juliette_sonnier_2, farmer).
personality(juliette_sonnier_2, openness, 0.21).
personality(juliette_sonnier_2, conscientiousness, -0.27).
personality(juliette_sonnier_2, extroversion, -0.07).
personality(juliette_sonnier_2, agreeableness, 0.07).
personality(juliette_sonnier_2, neuroticism, 0.12).

%% Justine Broussard
person(justine_broussard).
first_name(justine_broussard, 'Justine').
last_name(justine_broussard, 'Broussard').
full_name(justine_broussard, 'Justine Broussard').
gender(justine_broussard, female).
alive(justine_broussard).
occupation(justine_broussard, farmhand).
personality(justine_broussard, openness, -0.02).
personality(justine_broussard, conscientiousness, -0.36).
personality(justine_broussard, extroversion, 0.15).
personality(justine_broussard, agreeableness, 0.06).
personality(justine_broussard, neuroticism, 0.12).

%% Édouard Broussard
person(edouard_broussard).
first_name(edouard_broussard, 'Édouard').
last_name(edouard_broussard, 'Broussard').
full_name(edouard_broussard, 'Édouard Broussard').
gender(edouard_broussard, male).
alive(edouard_broussard).
occupation(edouard_broussard, farmhand).
personality(edouard_broussard, openness, 0.26).
personality(edouard_broussard, conscientiousness, -0.04).
personality(edouard_broussard, extroversion, 0.11).
personality(edouard_broussard, agreeableness, 0.22).
personality(edouard_broussard, neuroticism, 0.03).

%% Victor Broussard
person(victor_broussard).
first_name(victor_broussard, 'Victor').
last_name(victor_broussard, 'Broussard').
full_name(victor_broussard, 'Victor Broussard').
gender(victor_broussard, male).
alive(victor_broussard).
occupation(victor_broussard, farmer).
personality(victor_broussard, openness, 0.09).
personality(victor_broussard, conscientiousness, -0.08).
personality(victor_broussard, extroversion, -0.09).
personality(victor_broussard, agreeableness, 0.42).
personality(victor_broussard, neuroticism, 0.08).

%% Léonie Cormier
person(leonie_cormier).
first_name(leonie_cormier, 'Léonie').
last_name(leonie_cormier, 'Cormier').
full_name(leonie_cormier, 'Léonie Cormier').
gender(leonie_cormier, female).
alive(leonie_cormier).
occupation(leonie_cormier, laborer).
personality(leonie_cormier, openness, -0.04).
personality(leonie_cormier, conscientiousness, -0.35).
personality(leonie_cormier, extroversion, 0.0).
personality(leonie_cormier, agreeableness, 0.29).
personality(leonie_cormier, neuroticism, 0.01).

%% Lucie Hébert
person(lucie_hebert).
first_name(lucie_hebert, 'Lucie').
last_name(lucie_hebert, 'Hébert').
full_name(lucie_hebert, 'Lucie Hébert').
gender(lucie_hebert, female).
alive(lucie_hebert).
occupation(lucie_hebert, farmer).
personality(lucie_hebert, openness, 0.15).
personality(lucie_hebert, conscientiousness, -0.2).
personality(lucie_hebert, extroversion, 0.1).
personality(lucie_hebert, agreeableness, 0.08).
personality(lucie_hebert, neuroticism, 0.02).

%% Arthur Breaux
person(arthur_breaux).
first_name(arthur_breaux, 'Arthur').
last_name(arthur_breaux, 'Breaux').
full_name(arthur_breaux, 'Arthur Breaux').
gender(arthur_breaux, male).
alive(arthur_breaux).
occupation(arthur_breaux, farmer).
personality(arthur_breaux, openness, 0.43).
personality(arthur_breaux, conscientiousness, -0.02).
personality(arthur_breaux, extroversion, -0.06).
personality(arthur_breaux, agreeableness, 0.26).
personality(arthur_breaux, neuroticism, -0.07).

%% Jules Breaux
person(jules_breaux).
first_name(jules_breaux, 'Jules').
last_name(jules_breaux, 'Breaux').
full_name(jules_breaux, 'Jules Breaux').
gender(jules_breaux, male).
alive(jules_breaux).
occupation(jules_breaux, farmer).
personality(jules_breaux, openness, 0.46).
personality(jules_breaux, conscientiousness, -0.12).
personality(jules_breaux, extroversion, 0.06).
personality(jules_breaux, agreeableness, 0.51).
personality(jules_breaux, neuroticism, -0.03).

%% Raymond Breaux
person(raymond_breaux).
first_name(raymond_breaux, 'Raymond').
last_name(raymond_breaux, 'Breaux').
full_name(raymond_breaux, 'Raymond Breaux').
gender(raymond_breaux, male).
alive(raymond_breaux).
occupation(raymond_breaux, farmer).
personality(raymond_breaux, openness, 0.25).
personality(raymond_breaux, conscientiousness, -0.22).
personality(raymond_breaux, extroversion, -0.05).
personality(raymond_breaux, agreeableness, 0.15).
personality(raymond_breaux, neuroticism, 0.16).

%% Mathilde Bégnaud
person(mathilde_begnaud).
first_name(mathilde_begnaud, 'Mathilde').
last_name(mathilde_begnaud, 'Bégnaud').
full_name(mathilde_begnaud, 'Mathilde Bégnaud').
gender(mathilde_begnaud, female).
alive(mathilde_begnaud).
personality(mathilde_begnaud, openness, 0.27).
personality(mathilde_begnaud, conscientiousness, -0.01).
personality(mathilde_begnaud, extroversion, -0.15).
personality(mathilde_begnaud, agreeableness, 0.23).
personality(mathilde_begnaud, neuroticism, 0.11).

%% Alphonse Breaux
person(alphonse_breaux).
first_name(alphonse_breaux, 'Alphonse').
last_name(alphonse_breaux, 'Breaux').
full_name(alphonse_breaux, 'Alphonse Breaux').
gender(alphonse_breaux, male).
alive(alphonse_breaux).
occupation(alphonse_breaux, farmer).
personality(alphonse_breaux, openness, 0.51).
personality(alphonse_breaux, conscientiousness, -0.19).
personality(alphonse_breaux, extroversion, 0.11).
personality(alphonse_breaux, agreeableness, 0.46).
personality(alphonse_breaux, neuroticism, 0.2).

%% Monique Cormier
person(monique_cormier).
first_name(monique_cormier, 'Monique').
last_name(monique_cormier, 'Cormier').
full_name(monique_cormier, 'Monique Cormier').
gender(monique_cormier, female).
alive(monique_cormier).
occupation(monique_cormier, laborer).
personality(monique_cormier, openness, 0.07).
personality(monique_cormier, conscientiousness, -0.26).
personality(monique_cormier, extroversion, 0.15).
personality(monique_cormier, agreeableness, 0.06).
personality(monique_cormier, neuroticism, -0.21).

%% Nathalie Cormier
person(nathalie_cormier_2).
first_name(nathalie_cormier_2, 'Nathalie').
last_name(nathalie_cormier_2, 'Cormier').
full_name(nathalie_cormier_2, 'Nathalie Cormier').
gender(nathalie_cormier_2, female).
alive(nathalie_cormier_2).
occupation(nathalie_cormier_2, laborer).
personality(nathalie_cormier_2, openness, 0.12).
personality(nathalie_cormier_2, conscientiousness, -0.12).
personality(nathalie_cormier_2, extroversion, -0.01).
personality(nathalie_cormier_2, agreeableness, -0.13).
personality(nathalie_cormier_2, neuroticism, -0.03).

%% Clément Cormier
person(clement_cormier).
first_name(clement_cormier, 'Clément').
last_name(clement_cormier, 'Cormier').
full_name(clement_cormier, 'Clément Cormier').
gender(clement_cormier, male).
alive(clement_cormier).
occupation(clement_cormier, farmer).
personality(clement_cormier, openness, 0.25).
personality(clement_cormier, conscientiousness, -0.16).
personality(clement_cormier, extroversion, 0.11).
personality(clement_cormier, agreeableness, -0.0).
personality(clement_cormier, neuroticism, -0.2).

%% Odette Broussard
person(odette_broussard).
first_name(odette_broussard, 'Odette').
last_name(odette_broussard, 'Broussard').
full_name(odette_broussard, 'Odette Broussard').
gender(odette_broussard, female).
alive(odette_broussard).
occupation(odette_broussard, farmer).
personality(odette_broussard, openness, 0.32).
personality(odette_broussard, conscientiousness, -0.1).
personality(odette_broussard, extroversion, 0.03).
personality(odette_broussard, agreeableness, 0.05).
personality(odette_broussard, neuroticism, 0.1).

%% Pauline Sonnier
person(pauline_sonnier).
first_name(pauline_sonnier, 'Pauline').
last_name(pauline_sonnier, 'Sonnier').
full_name(pauline_sonnier, 'Pauline Sonnier').
gender(pauline_sonnier, female).
alive(pauline_sonnier).
occupation(pauline_sonnier, farmhand).
personality(pauline_sonnier, openness, -0.1).
personality(pauline_sonnier, conscientiousness, -0.37).
personality(pauline_sonnier, extroversion, 0.22).
personality(pauline_sonnier, agreeableness, -0.09).
personality(pauline_sonnier, neuroticism, 0.03).

%% Denis Sonnier
person(denis_sonnier).
first_name(denis_sonnier, 'Denis').
last_name(denis_sonnier, 'Sonnier').
full_name(denis_sonnier, 'Denis Sonnier').
gender(denis_sonnier, male).
alive(denis_sonnier).
occupation(denis_sonnier, farmer).
personality(denis_sonnier, openness, -0.28).
personality(denis_sonnier, conscientiousness, -0.38).
personality(denis_sonnier, extroversion, 0.13).
personality(denis_sonnier, agreeableness, 0.2).
personality(denis_sonnier, neuroticism, 0.08).

%% Élias Sonnier
person(elias_sonnier).
first_name(elias_sonnier, 'Élias').
last_name(elias_sonnier, 'Sonnier').
full_name(elias_sonnier, 'Élias Sonnier').
gender(elias_sonnier, male).
alive(elias_sonnier).
occupation(elias_sonnier, farmer).
personality(elias_sonnier, openness, -0.02).
personality(elias_sonnier, conscientiousness, -0.62).
personality(elias_sonnier, extroversion, 0.06).
personality(elias_sonnier, agreeableness, 0.18).
personality(elias_sonnier, neuroticism, 0.16).

%% Renée Sonnier
person(renee_sonnier).
first_name(renee_sonnier, 'Renée').
last_name(renee_sonnier, 'Sonnier').
full_name(renee_sonnier, 'Renée Sonnier').
gender(renee_sonnier, female).
alive(renee_sonnier).
occupation(renee_sonnier, farmhand).
personality(renee_sonnier, openness, 0.02).
personality(renee_sonnier, conscientiousness, -0.6).
personality(renee_sonnier, extroversion, 0.13).
personality(renee_sonnier, agreeableness, 0.23).
personality(renee_sonnier, neuroticism, 0.07).

%% Ferdinand Broussard
person(ferdinand_broussard).
first_name(ferdinand_broussard, 'Ferdinand').
last_name(ferdinand_broussard, 'Broussard').
full_name(ferdinand_broussard, 'Ferdinand Broussard').
gender(ferdinand_broussard, male).
alive(ferdinand_broussard).
occupation(ferdinand_broussard, farmer).
personality(ferdinand_broussard, openness, 0.14).
personality(ferdinand_broussard, conscientiousness, 0.29).
personality(ferdinand_broussard, extroversion, 0.07).
personality(ferdinand_broussard, agreeableness, 0.14).
personality(ferdinand_broussard, neuroticism, -0.34).

%% Rosalie Mouton
person(rosalie_mouton).
first_name(rosalie_mouton, 'Rosalie').
last_name(rosalie_mouton, 'Mouton').
full_name(rosalie_mouton, 'Rosalie Mouton').
gender(rosalie_mouton, female).
alive(rosalie_mouton).
occupation(rosalie_mouton, farmhand).
personality(rosalie_mouton, openness, -0.15).
personality(rosalie_mouton, conscientiousness, 0.28).
personality(rosalie_mouton, extroversion, -0.01).
personality(rosalie_mouton, agreeableness, 0.38).
personality(rosalie_mouton, neuroticism, -0.45).

%% Gaspard Broussard
person(gaspard_broussard_2).
first_name(gaspard_broussard_2, 'Gaspard').
last_name(gaspard_broussard_2, 'Broussard').
full_name(gaspard_broussard_2, 'Gaspard Broussard').
gender(gaspard_broussard_2, male).
alive(gaspard_broussard_2).
occupation(gaspard_broussard_2, farmer).
personality(gaspard_broussard_2, openness, -0.14).
personality(gaspard_broussard_2, conscientiousness, 0.34).
personality(gaspard_broussard_2, extroversion, 0.24).
personality(gaspard_broussard_2, agreeableness, 0.42).
personality(gaspard_broussard_2, neuroticism, -0.24).

%% Hector Robichaux
person(hector_robichaux).
first_name(hector_robichaux, 'Hector').
last_name(hector_robichaux, 'Robichaux').
full_name(hector_robichaux, 'Hector Robichaux').
gender(hector_robichaux, male).
alive(hector_robichaux).
occupation(hector_robichaux, farmer).
personality(hector_robichaux, openness, -0.16).
personality(hector_robichaux, conscientiousness, 0.11).
personality(hector_robichaux, extroversion, -0.43).
personality(hector_robichaux, agreeableness, 0.07).
personality(hector_robichaux, neuroticism, -0.61).

%% Sabine Broussard
person(sabine_broussard).
first_name(sabine_broussard, 'Sabine').
last_name(sabine_broussard, 'Broussard').
full_name(sabine_broussard, 'Sabine Broussard').
gender(sabine_broussard, female).
alive(sabine_broussard).
occupation(sabine_broussard, farmer).
personality(sabine_broussard, openness, 0.13).
personality(sabine_broussard, conscientiousness, 0.04).
personality(sabine_broussard, extroversion, -0.27).
personality(sabine_broussard, agreeableness, 0.15).
personality(sabine_broussard, neuroticism, -0.35).

%% Ignace Robichaux
person(ignace_robichaux).
first_name(ignace_robichaux, 'Ignace').
last_name(ignace_robichaux, 'Robichaux').
full_name(ignace_robichaux, 'Ignace Robichaux').
gender(ignace_robichaux, male).
alive(ignace_robichaux).
occupation(ignace_robichaux, laborer).
personality(ignace_robichaux, openness, -0.17).
personality(ignace_robichaux, conscientiousness, 0.23).
personality(ignace_robichaux, extroversion, -0.15).
personality(ignace_robichaux, agreeableness, 0.2).
personality(ignace_robichaux, neuroticism, -0.43).

%% Justin Cormier
person(justin_cormier).
first_name(justin_cormier, 'Justin').
last_name(justin_cormier, 'Cormier').
full_name(justin_cormier, 'Justin Cormier').
gender(justin_cormier, male).
alive(justin_cormier).
occupation(justin_cormier, farmer).
personality(justin_cormier, openness, 0.28).
personality(justin_cormier, conscientiousness, -0.36).
personality(justin_cormier, extroversion, -0.51).
personality(justin_cormier, agreeableness, -0.03).
personality(justin_cormier, neuroticism, -0.01).

%% Simone Sonnier
person(simone_sonnier).
first_name(simone_sonnier, 'Simone').
last_name(simone_sonnier, 'Sonnier').
full_name(simone_sonnier, 'Simone Sonnier').
gender(simone_sonnier, female).
alive(simone_sonnier).
occupation(simone_sonnier, farmer).
personality(simone_sonnier, openness, 0.32).
personality(simone_sonnier, conscientiousness, -0.05).
personality(simone_sonnier, extroversion, -0.33).
personality(simone_sonnier, agreeableness, 0.11).
personality(simone_sonnier, neuroticism, -0.21).

%% Laurent Cormier
person(laurent_cormier).
first_name(laurent_cormier, 'Laurent').
last_name(laurent_cormier, 'Cormier').
full_name(laurent_cormier, 'Laurent Cormier').
gender(laurent_cormier, male).
alive(laurent_cormier).
occupation(laurent_cormier, farmhand).
personality(laurent_cormier, openness, 0.24).
personality(laurent_cormier, conscientiousness, -0.18).
personality(laurent_cormier, extroversion, -0.42).
personality(laurent_cormier, agreeableness, 0.01).
personality(laurent_cormier, neuroticism, -0.06).

%% Sophie Robichaux
person(sophie_robichaux).
first_name(sophie_robichaux, 'Sophie').
last_name(sophie_robichaux, 'Robichaux').
full_name(sophie_robichaux, 'Sophie Robichaux').
gender(sophie_robichaux, female).
alive(sophie_robichaux).
occupation(sophie_robichaux, farmer).
personality(sophie_robichaux, openness, 0.21).
personality(sophie_robichaux, conscientiousness, -0.11).
personality(sophie_robichaux, extroversion, -0.29).
personality(sophie_robichaux, agreeableness, 0.18).
personality(sophie_robichaux, neuroticism, -0.22).

%% Sylvie Breaux
person(sylvie_breaux).
first_name(sylvie_breaux, 'Sylvie').
last_name(sylvie_breaux, 'Breaux').
full_name(sylvie_breaux, 'Sylvie Breaux').
gender(sylvie_breaux, female).
alive(sylvie_breaux).
occupation(sylvie_breaux, farmer).
personality(sylvie_breaux, openness, 0.11).
personality(sylvie_breaux, conscientiousness, -0.3).
personality(sylvie_breaux, extroversion, 0.3).
personality(sylvie_breaux, agreeableness, 0.04).
personality(sylvie_breaux, neuroticism, 0.06).

%% Valentine Benoît
person(valentine_benoit).
first_name(valentine_benoit, 'Valentine').
last_name(valentine_benoit, 'Benoît').
full_name(valentine_benoit, 'Valentine Benoît').
gender(valentine_benoit, female).
alive(valentine_benoit).
occupation(valentine_benoit, farmhand).
personality(valentine_benoit, openness, 0.38).
personality(valentine_benoit, conscientiousness, -0.3).
personality(valentine_benoit, extroversion, 0.08).
personality(valentine_benoit, agreeableness, 0.42).
personality(valentine_benoit, neuroticism, 0.23).

%% Véronique Breaux
person(veronique_breaux).
first_name(veronique_breaux, 'Véronique').
last_name(veronique_breaux, 'Breaux').
full_name(veronique_breaux, 'Véronique Breaux').
gender(veronique_breaux, female).
alive(veronique_breaux).
occupation(veronique_breaux, farmer).
personality(veronique_breaux, openness, 0.57).
personality(veronique_breaux, conscientiousness, -0.1).
personality(veronique_breaux, extroversion, -0.15).
personality(veronique_breaux, agreeableness, 0.24).
personality(veronique_breaux, neuroticism, 0.09).

%% Victoire Robichaux
person(victoire_robichaux).
first_name(victoire_robichaux, 'Victoire').
last_name(victoire_robichaux, 'Robichaux').
full_name(victoire_robichaux, 'Victoire Robichaux').
gender(victoire_robichaux, female).
alive(victoire_robichaux).
occupation(victoire_robichaux, farmer).
personality(victoire_robichaux, openness, 0.68).
personality(victoire_robichaux, conscientiousness, -0.26).
personality(victoire_robichaux, extroversion, 0.1).
personality(victoire_robichaux, agreeableness, 0.06).
personality(victoire_robichaux, neuroticism, 0.11).

%% Martin Broussard
person(martin_broussard_2).
first_name(martin_broussard_2, 'Martin').
last_name(martin_broussard_2, 'Broussard').
full_name(martin_broussard_2, 'Martin Broussard').
gender(martin_broussard_2, male).
alive(martin_broussard_2).
occupation(martin_broussard_2, barber).
personality(martin_broussard_2, openness, 0.61).
personality(martin_broussard_2, conscientiousness, -0.36).
personality(martin_broussard_2, extroversion, 0.47).
personality(martin_broussard_2, agreeableness, 0.27).
personality(martin_broussard_2, neuroticism, 0.3).

%% Virginie Broussard
person(virginie_broussard_2).
first_name(virginie_broussard_2, 'Virginie').
last_name(virginie_broussard_2, 'Broussard').
full_name(virginie_broussard_2, 'Virginie Broussard').
gender(virginie_broussard_2, female).
alive(virginie_broussard_2).
occupation(virginie_broussard_2, laborer).
personality(virginie_broussard_2, openness, 0.55).
personality(virginie_broussard_2, conscientiousness, -0.25).
personality(virginie_broussard_2, extroversion, 0.13).
personality(virginie_broussard_2, agreeableness, -0.02).
personality(virginie_broussard_2, neuroticism, 0.47).

%% Yvonne Broussard
person(yvonne_broussard).
first_name(yvonne_broussard, 'Yvonne').
last_name(yvonne_broussard, 'Broussard').
full_name(yvonne_broussard, 'Yvonne Broussard').
gender(yvonne_broussard, female).
alive(yvonne_broussard).
occupation(yvonne_broussard, farmer).
personality(yvonne_broussard, openness, 0.21).
personality(yvonne_broussard, conscientiousness, -0.54).
personality(yvonne_broussard, extroversion, -0.03).
personality(yvonne_broussard, agreeableness, 0.17).
personality(yvonne_broussard, neuroticism, -0.09).

%% Noël Boudreaux
person(noel_boudreaux).
first_name(noel_boudreaux, 'Noël').
last_name(noel_boudreaux, 'Boudreaux').
full_name(noel_boudreaux, 'Noël Boudreaux').
gender(noel_boudreaux, male).
alive(noel_boudreaux).
occupation(noel_boudreaux, laborer).
personality(noel_boudreaux, openness, 0.18).
personality(noel_boudreaux, conscientiousness, -0.38).
personality(noel_boudreaux, extroversion, -0.36).
personality(noel_boudreaux, agreeableness, -0.08).
personality(noel_boudreaux, neuroticism, 0.05).

%% Zoé Cormier
person(zoe_cormier_2).
first_name(zoe_cormier_2, 'Zoé').
last_name(zoe_cormier_2, 'Cormier').
full_name(zoe_cormier_2, 'Zoé Cormier').
gender(zoe_cormier_2, female).
alive(zoe_cormier_2).
occupation(zoe_cormier_2, laborer).
personality(zoe_cormier_2, openness, 0.07).
personality(zoe_cormier_2, conscientiousness, -0.45).
personality(zoe_cormier_2, extroversion, -0.1).
personality(zoe_cormier_2, agreeableness, -0.01).
personality(zoe_cormier_2, neuroticism, -0.11).

%% Olivier Broussard
person(olivier_broussard).
first_name(olivier_broussard, 'Olivier').
last_name(olivier_broussard, 'Broussard').
full_name(olivier_broussard, 'Olivier Broussard').
gender(olivier_broussard, male).
alive(olivier_broussard).
occupation(olivier_broussard, farmer).
personality(olivier_broussard, openness, 0.21).
personality(olivier_broussard, conscientiousness, 0.09).
personality(olivier_broussard, extroversion, 0.16).
personality(olivier_broussard, agreeableness, 0.04).
personality(olivier_broussard, neuroticism, 0.03).

%% Agathe Cormier
person(agathe_cormier).
first_name(agathe_cormier, 'Agathe').
last_name(agathe_cormier, 'Cormier').
full_name(agathe_cormier, 'Agathe Cormier').
gender(agathe_cormier, female).
alive(agathe_cormier).
occupation(agathe_cormier, laborer).
personality(agathe_cormier, openness, 0.01).
personality(agathe_cormier, conscientiousness, -0.18).
personality(agathe_cormier, extroversion, 0.19).
personality(agathe_cormier, agreeableness, -0.22).
personality(agathe_cormier, neuroticism, -0.03).

%% Apolline Robichaux
person(apolline_robichaux).
first_name(apolline_robichaux, 'Apolline').
last_name(apolline_robichaux, 'Robichaux').
full_name(apolline_robichaux, 'Apolline Robichaux').
gender(apolline_robichaux, female).
alive(apolline_robichaux).
occupation(apolline_robichaux, farmer).
personality(apolline_robichaux, openness, 0.18).
personality(apolline_robichaux, conscientiousness, -0.2).
personality(apolline_robichaux, extroversion, 0.09).
personality(apolline_robichaux, agreeableness, -0.14).
personality(apolline_robichaux, neuroticism, 0.06).

%% Pascal Breaux
person(pascal_breaux).
first_name(pascal_breaux, 'Pascal').
last_name(pascal_breaux, 'Breaux').
full_name(pascal_breaux, 'Pascal Breaux').
gender(pascal_breaux, male).
alive(pascal_breaux).
personality(pascal_breaux, openness, 0.51).
personality(pascal_breaux, conscientiousness, -0.44).
personality(pascal_breaux, extroversion, 0.14).
personality(pascal_breaux, agreeableness, 0.5).
personality(pascal_breaux, neuroticism, -0.04).

%% Bernadette Broussard
person(bernadette_broussard_2).
first_name(bernadette_broussard_2, 'Bernadette').
last_name(bernadette_broussard_2, 'Broussard').
full_name(bernadette_broussard_2, 'Bernadette Broussard').
gender(bernadette_broussard_2, female).
alive(bernadette_broussard_2).
occupation(bernadette_broussard_2, farmer).
personality(bernadette_broussard_2, openness, 0.29).
personality(bernadette_broussard_2, conscientiousness, -0.38).
personality(bernadette_broussard_2, extroversion, -0.14).
personality(bernadette_broussard_2, agreeableness, 0.28).
personality(bernadette_broussard_2, neuroticism, 0.17).

%% Quentin Breaux
person(quentin_breaux).
first_name(quentin_breaux, 'Quentin').
last_name(quentin_breaux, 'Breaux').
full_name(quentin_breaux, 'Quentin Breaux').
gender(quentin_breaux, male).
alive(quentin_breaux).
occupation(quentin_breaux, laborer).
personality(quentin_breaux, openness, 0.24).
personality(quentin_breaux, conscientiousness, -0.52).
personality(quentin_breaux, extroversion, 0.02).
personality(quentin_breaux, agreeableness, 0.36).
personality(quentin_breaux, neuroticism, 0.19).

%% Romain Breaux
person(romain_breaux).
first_name(romain_breaux, 'Romain').
last_name(romain_breaux, 'Breaux').
full_name(romain_breaux, 'Romain Breaux').
gender(romain_breaux, male).
alive(romain_breaux).
occupation(romain_breaux, owner_farm).
personality(romain_breaux, openness, 0.52).
personality(romain_breaux, conscientiousness, -0.59).
personality(romain_breaux, extroversion, -0.12).
personality(romain_breaux, agreeableness, 0.55).
personality(romain_breaux, neuroticism, 0.1).

%% Sylvain Breaux
person(sylvain_breaux).
first_name(sylvain_breaux, 'Sylvain').
last_name(sylvain_breaux, 'Breaux').
full_name(sylvain_breaux, 'Sylvain Breaux').
gender(sylvain_breaux, male).
alive(sylvain_breaux).
occupation(sylvain_breaux, laborer).
personality(sylvain_breaux, openness, 0.28).
personality(sylvain_breaux, conscientiousness, -0.62).
personality(sylvain_breaux, extroversion, 0.11).
personality(sylvain_breaux, agreeableness, 0.28).
personality(sylvain_breaux, neuroticism, 0.19).

%% Berthe Sonnier
person(berthe_sonnier).
first_name(berthe_sonnier, 'Berthe').
last_name(berthe_sonnier, 'Sonnier').
full_name(berthe_sonnier, 'Berthe Sonnier').
gender(berthe_sonnier, female).
alive(berthe_sonnier).
occupation(berthe_sonnier, farmer).
personality(berthe_sonnier, openness, 0.5).
personality(berthe_sonnier, conscientiousness, -0.54).
personality(berthe_sonnier, extroversion, 0.09).
personality(berthe_sonnier, agreeableness, 0.08).
personality(berthe_sonnier, neuroticism, 0.27).

%% Tristan Bergeron
person(tristan_bergeron).
first_name(tristan_bergeron, 'Tristan').
last_name(tristan_bergeron, 'Bergeron').
full_name(tristan_bergeron, 'Tristan Bergeron').
gender(tristan_bergeron, male).
alive(tristan_bergeron).
occupation(tristan_bergeron, farmhand).
personality(tristan_bergeron, openness, 0.3).
personality(tristan_bergeron, conscientiousness, -0.28).
personality(tristan_bergeron, extroversion, -0.03).
personality(tristan_bergeron, agreeableness, -0.2).
personality(tristan_bergeron, neuroticism, 0.13).

%% Urbain Bergeron
person(urbain_bergeron).
first_name(urbain_bergeron, 'Urbain').
last_name(urbain_bergeron, 'Bergeron').
full_name(urbain_bergeron, 'Urbain Bergeron').
gender(urbain_bergeron, male).
alive(urbain_bergeron).
personality(urbain_bergeron, openness, 0.33).
personality(urbain_bergeron, conscientiousness, -0.3).
personality(urbain_bergeron, extroversion, 0.2).
personality(urbain_bergeron, agreeableness, 0.01).
personality(urbain_bergeron, neuroticism, 0.29).

%% Valentin Bergeron
person(valentin_bergeron).
first_name(valentin_bergeron, 'Valentin').
last_name(valentin_bergeron, 'Bergeron').
full_name(valentin_bergeron, 'Valentin Bergeron').
gender(valentin_bergeron, male).
alive(valentin_bergeron).
occupation(valentin_bergeron, laborer).
personality(valentin_bergeron, openness, 0.44).
personality(valentin_bergeron, conscientiousness, -0.31).
personality(valentin_bergeron, extroversion, -0.01).
personality(valentin_bergeron, agreeableness, 0.03).
personality(valentin_bergeron, neuroticism, 0.31).

%% Carméla Breaux
person(carmela_breaux).
first_name(carmela_breaux, 'Carméla').
last_name(carmela_breaux, 'Breaux').
full_name(carmela_breaux, 'Carméla Breaux').
gender(carmela_breaux, female).
alive(carmela_breaux).
occupation(carmela_breaux, laborer).
personality(carmela_breaux, openness, 0.54).
personality(carmela_breaux, conscientiousness, -0.51).
personality(carmela_breaux, extroversion, 0.03).
personality(carmela_breaux, agreeableness, 0.01).
personality(carmela_breaux, neuroticism, 0.36).

%% Xavier Cormier
person(xavier_cormier).
first_name(xavier_cormier, 'Xavier').
last_name(xavier_cormier, 'Cormier').
full_name(xavier_cormier, 'Xavier Cormier').
gender(xavier_cormier, male).
alive(xavier_cormier).
personality(xavier_cormier, openness, 0.71).
personality(xavier_cormier, conscientiousness, 0.02).
personality(xavier_cormier, extroversion, 0.33).
personality(xavier_cormier, agreeableness, -0.23).
personality(xavier_cormier, neuroticism, 0.13).

%% Céline Cormier
person(celine_cormier).
first_name(celine_cormier, 'Céline').
last_name(celine_cormier, 'Cormier').
full_name(celine_cormier, 'Céline Cormier').
gender(celine_cormier, female).
alive(celine_cormier).
occupation(celine_cormier, farmer).
personality(celine_cormier, openness, 0.37).
personality(celine_cormier, conscientiousness, -0.05).
personality(celine_cormier, extroversion, 0.16).
personality(celine_cormier, agreeableness, -0.29).
personality(celine_cormier, neuroticism, -0.04).

%% Clémence Broussard
person(clemence_broussard).
first_name(clemence_broussard, 'Clémence').
last_name(clemence_broussard, 'Broussard').
full_name(clemence_broussard, 'Clémence Broussard').
gender(clemence_broussard, female).
alive(clemence_broussard).
personality(clemence_broussard, openness, 0.62).
personality(clemence_broussard, conscientiousness, 0.19).
personality(clemence_broussard, extroversion, 0.21).
personality(clemence_broussard, agreeableness, -0.31).
personality(clemence_broussard, neuroticism, 0.26).

%% Yves Cormier
person(yves_cormier).
first_name(yves_cormier, 'Yves').
last_name(yves_cormier, 'Cormier').
full_name(yves_cormier, 'Yves Cormier').
gender(yves_cormier, male).
alive(yves_cormier).
occupation(yves_cormier, farmer).
personality(yves_cormier, openness, 0.42).
personality(yves_cormier, conscientiousness, 0.01).
personality(yves_cormier, extroversion, 0.35).
personality(yves_cormier, agreeableness, -0.35).
personality(yves_cormier, neuroticism, -0.1).

%% Zacharie Cormier
person(zacharie_cormier).
first_name(zacharie_cormier, 'Zacharie').
last_name(zacharie_cormier, 'Cormier').
full_name(zacharie_cormier, 'Zacharie Cormier').
gender(zacharie_cormier, male).
alive(zacharie_cormier).
occupation(zacharie_cormier, farmhand).
personality(zacharie_cormier, openness, 0.47).
personality(zacharie_cormier, conscientiousness, 0.09).
personality(zacharie_cormier, extroversion, 0.11).
personality(zacharie_cormier, agreeableness, -0.23).
personality(zacharie_cormier, neuroticism, 0.18).

%% Clothilde Sonnier
person(clothilde_sonnier).
first_name(clothilde_sonnier, 'Clothilde').
last_name(clothilde_sonnier, 'Sonnier').
full_name(clothilde_sonnier, 'Clothilde Sonnier').
gender(clothilde_sonnier, female).
alive(clothilde_sonnier).
personality(clothilde_sonnier, openness, -0.02).
personality(clothilde_sonnier, conscientiousness, -0.04).
personality(clothilde_sonnier, extroversion, -0.15).
personality(clothilde_sonnier, agreeableness, -0.42).
personality(clothilde_sonnier, neuroticism, -0.08).

%% Corinne Breaux
person(corinne_breaux).
first_name(corinne_breaux, 'Corinne').
last_name(corinne_breaux, 'Breaux').
full_name(corinne_breaux, 'Corinne Breaux').
gender(corinne_breaux, female).
alive(corinne_breaux).
occupation(corinne_breaux, farmer).
personality(corinne_breaux, openness, 0.39).
personality(corinne_breaux, conscientiousness, 0.12).
personality(corinne_breaux, extroversion, 0.36).
personality(corinne_breaux, agreeableness, -0.24).
personality(corinne_breaux, neuroticism, 0.03).

%% Dorothée Robichaux
person(dorothee_robichaux).
first_name(dorothee_robichaux, 'Dorothée').
last_name(dorothee_robichaux, 'Robichaux').
full_name(dorothee_robichaux, 'Dorothée Robichaux').
gender(dorothee_robichaux, female).
alive(dorothee_robichaux).
occupation(dorothee_robichaux, laborer).
personality(dorothee_robichaux, openness, -0.05).
personality(dorothee_robichaux, conscientiousness, 0.4).
personality(dorothee_robichaux, extroversion, 0.05).
personality(dorothee_robichaux, agreeableness, -0.1).
personality(dorothee_robichaux, neuroticism, -0.07).

%% Émeline Aucoin
person(emeline_aucoin).
first_name(emeline_aucoin, 'Émeline').
last_name(emeline_aucoin, 'Aucoin').
full_name(emeline_aucoin, 'Émeline Aucoin').
gender(emeline_aucoin, female).
alive(emeline_aucoin).
personality(emeline_aucoin, openness, -0.62).
personality(emeline_aucoin, conscientiousness, -0.16).
personality(emeline_aucoin, extroversion, 0.32).
personality(emeline_aucoin, agreeableness, -0.04).
personality(emeline_aucoin, neuroticism, 0.19).

%% Adrien Aucoin
person(adrien_aucoin).
first_name(adrien_aucoin, 'Adrien').
last_name(adrien_aucoin, 'Aucoin').
full_name(adrien_aucoin, 'Adrien Aucoin').
gender(adrien_aucoin, male).
alive(adrien_aucoin).
occupation(adrien_aucoin, farmer).
personality(adrien_aucoin, openness, -0.4).
personality(adrien_aucoin, conscientiousness, 0.06).
personality(adrien_aucoin, extroversion, 0.49).
personality(adrien_aucoin, agreeableness, -0.34).
personality(adrien_aucoin, neuroticism, 0.2).

%% Eulalie Robichaux
person(eulalie_robichaux).
first_name(eulalie_robichaux, 'Eulalie').
last_name(eulalie_robichaux, 'Robichaux').
full_name(eulalie_robichaux, 'Eulalie Robichaux').
gender(eulalie_robichaux, female).
alive(eulalie_robichaux).
occupation(eulalie_robichaux, farmhand).
personality(eulalie_robichaux, openness, 0.44).
personality(eulalie_robichaux, conscientiousness, -0.19).
personality(eulalie_robichaux, extroversion, 0.11).
personality(eulalie_robichaux, agreeableness, 0.34).
personality(eulalie_robichaux, neuroticism, 0.36).

%% Faustine Broussard
person(faustine_broussard).
first_name(faustine_broussard, 'Faustine').
last_name(faustine_broussard, 'Broussard').
full_name(faustine_broussard, 'Faustine Broussard').
gender(faustine_broussard, female).
alive(faustine_broussard).
occupation(faustine_broussard, farmer).
personality(faustine_broussard, openness, 0.16).
personality(faustine_broussard, conscientiousness, 0.09).
personality(faustine_broussard, extroversion, 0.18).
personality(faustine_broussard, agreeableness, 0.17).
personality(faustine_broussard, neuroticism, 0.31).

%% Félicité Bégnaud
person(felicite_begnaud).
first_name(felicite_begnaud, 'Félicité').
last_name(felicite_begnaud, 'Bégnaud').
full_name(felicite_begnaud, 'Félicité Bégnaud').
gender(felicite_begnaud, female).
alive(felicite_begnaud).
occupation(felicite_begnaud, farmhand).
personality(felicite_begnaud, openness, 0.5).
personality(felicite_begnaud, conscientiousness, -0.01).
personality(felicite_begnaud, extroversion, 0.07).
personality(felicite_begnaud, agreeableness, -0.04).
personality(felicite_begnaud, neuroticism, 0.48).

%% Flavie Broussard
person(flavie_broussard).
first_name(flavie_broussard, 'Flavie').
last_name(flavie_broussard, 'Broussard').
full_name(flavie_broussard, 'Flavie Broussard').
gender(flavie_broussard, female).
alive(flavie_broussard).
occupation(flavie_broussard, farmer).
personality(flavie_broussard, openness, 0.49).
personality(flavie_broussard, conscientiousness, -0.36).
personality(flavie_broussard, extroversion, 0.26).
personality(flavie_broussard, agreeableness, 0.21).
personality(flavie_broussard, neuroticism, 0.54).

%% Benoît Broussard
person(benoit_broussard_2).
first_name(benoit_broussard_2, 'Benoît').
last_name(benoit_broussard_2, 'Broussard').
full_name(benoit_broussard_2, 'Benoît Broussard').
gender(benoit_broussard_2, male).
alive(benoit_broussard_2).
occupation(benoit_broussard_2, farmer).
personality(benoit_broussard_2, openness, 0.59).
personality(benoit_broussard_2, conscientiousness, -0.24).
personality(benoit_broussard_2, extroversion, -0.03).
personality(benoit_broussard_2, agreeableness, 0.07).
personality(benoit_broussard_2, neuroticism, 0.38).

%% Camille Robichaux
person(camille_robichaux).
first_name(camille_robichaux, 'Camille').
last_name(camille_robichaux, 'Robichaux').
full_name(camille_robichaux, 'Camille Robichaux').
gender(camille_robichaux, male).
alive(camille_robichaux).
occupation(camille_robichaux, farmer).
personality(camille_robichaux, openness, 0.18).
personality(camille_robichaux, conscientiousness, 0.12).
personality(camille_robichaux, extroversion, 0.2).
personality(camille_robichaux, agreeableness, -0.16).
personality(camille_robichaux, neuroticism, -0.09).

%% Francine Robichaux
person(francine_robichaux).
first_name(francine_robichaux, 'Francine').
last_name(francine_robichaux, 'Robichaux').
full_name(francine_robichaux, 'Francine Robichaux').
gender(francine_robichaux, female).
alive(francine_robichaux).
occupation(francine_robichaux, farmer).
personality(francine_robichaux, openness, 0.12).
personality(francine_robichaux, conscientiousness, -0.15).
personality(francine_robichaux, extroversion, 0.23).
personality(francine_robichaux, agreeableness, -0.04).
personality(francine_robichaux, neuroticism, -0.11).

%% Damien Robichaux
person(damien_robichaux).
first_name(damien_robichaux, 'Damien').
last_name(damien_robichaux, 'Robichaux').
full_name(damien_robichaux, 'Damien Robichaux').
gender(damien_robichaux, male).
alive(damien_robichaux).
occupation(damien_robichaux, farmer).
personality(damien_robichaux, openness, 0.14).
personality(damien_robichaux, conscientiousness, -0.24).
personality(damien_robichaux, extroversion, 0.13).
personality(damien_robichaux, agreeableness, -0.16).
personality(damien_robichaux, neuroticism, -0.03).

%% Éloi Robichaux
person(eloi_robichaux).
first_name(eloi_robichaux, 'Éloi').
last_name(eloi_robichaux, 'Robichaux').
full_name(eloi_robichaux, 'Éloi Robichaux').
gender(eloi_robichaux, male).
alive(eloi_robichaux).
occupation(eloi_robichaux, farmer).
personality(eloi_robichaux, openness, 0.25).
personality(eloi_robichaux, conscientiousness, -0.24).
personality(eloi_robichaux, extroversion, -0.07).
personality(eloi_robichaux, agreeableness, -0.05).
personality(eloi_robichaux, neuroticism, 0.13).

%% Gilberte Broussard
person(gilberte_broussard).
first_name(gilberte_broussard, 'Gilberte').
last_name(gilberte_broussard, 'Broussard').
full_name(gilberte_broussard, 'Gilberte Broussard').
gender(gilberte_broussard, female).
alive(gilberte_broussard).
personality(gilberte_broussard, openness, 0.04).
personality(gilberte_broussard, conscientiousness, 0.15).
personality(gilberte_broussard, extroversion, -0.23).
personality(gilberte_broussard, agreeableness, -0.61).
personality(gilberte_broussard, neuroticism, -0.1).

%% Fabien Cormier
person(fabien_cormier).
first_name(fabien_cormier, 'Fabien').
last_name(fabien_cormier, 'Cormier').
full_name(fabien_cormier, 'Fabien Cormier').
gender(fabien_cormier, male).
alive(fabien_cormier).
occupation(fabien_cormier, laborer).
personality(fabien_cormier, openness, 0.17).
personality(fabien_cormier, conscientiousness, 0.26).
personality(fabien_cormier, extroversion, -0.2).
personality(fabien_cormier, agreeableness, -0.54).
personality(fabien_cormier, neuroticism, 0.25).

%% Gisèle Boudreaux
person(gisele_boudreaux).
first_name(gisele_boudreaux, 'Gisèle').
last_name(gisele_boudreaux, 'Boudreaux').
full_name(gisele_boudreaux, 'Gisèle Boudreaux').
gender(gisele_boudreaux, female).
alive(gisele_boudreaux).
occupation(gisele_boudreaux, farmer).
personality(gisele_boudreaux, openness, 0.1).
personality(gisele_boudreaux, conscientiousness, 0.24).
personality(gisele_boudreaux, extroversion, -0.1).
personality(gisele_boudreaux, agreeableness, -0.33).
personality(gisele_boudreaux, neuroticism, 0.2).

%% Hortense Bergeron
person(hortense_bergeron).
first_name(hortense_bergeron, 'Hortense').
last_name(hortense_bergeron, 'Bergeron').
full_name(hortense_bergeron, 'Hortense Bergeron').
gender(hortense_bergeron, female).
alive(hortense_bergeron).
occupation(hortense_bergeron, owner_guildconteurs).
personality(hortense_bergeron, openness, 0.51).
personality(hortense_bergeron, conscientiousness, 0.12).
personality(hortense_bergeron, extroversion, 0.08).
personality(hortense_bergeron, agreeableness, -0.57).
personality(hortense_bergeron, neuroticism, 0.24).

%% Gauthier Bergeron
person(gauthier_bergeron_2).
first_name(gauthier_bergeron_2, 'Gauthier').
last_name(gauthier_bergeron_2, 'Bergeron').
full_name(gauthier_bergeron_2, 'Gauthier Bergeron').
gender(gauthier_bergeron_2, male).
alive(gauthier_bergeron_2).
occupation(gauthier_bergeron_2, owner_guildmarchands).
personality(gauthier_bergeron_2, openness, 0.39).
personality(gauthier_bergeron_2, conscientiousness, 0.27).
personality(gauthier_bergeron_2, extroversion, 0.26).
personality(gauthier_bergeron_2, agreeableness, -0.45).
personality(gauthier_bergeron_2, neuroticism, 0.32).

%% Hervé Bergeron
person(herve_bergeron).
first_name(herve_bergeron, 'Hervé').
last_name(herve_bergeron, 'Bergeron').
full_name(herve_bergeron, 'Hervé Bergeron').
gender(herve_bergeron, male).
alive(herve_bergeron).
occupation(herve_bergeron, laborer).
personality(herve_bergeron, openness, 0.22).
personality(herve_bergeron, conscientiousness, 0.24).
personality(herve_bergeron, extroversion, 0.1).
personality(herve_bergeron, agreeableness, -0.34).
personality(herve_bergeron, neuroticism, 0.06).

%% Irène Sonnier
person(irene_sonnier).
first_name(irene_sonnier, 'Irène').
last_name(irene_sonnier, 'Sonnier').
full_name(irene_sonnier, 'Irène Sonnier').
gender(irene_sonnier, female).
alive(irene_sonnier).
occupation(irene_sonnier, tailor).
personality(irene_sonnier, openness, 0.58).
personality(irene_sonnier, conscientiousness, -0.02).
personality(irene_sonnier, extroversion, 0.36).
personality(irene_sonnier, agreeableness, -0.33).
personality(irene_sonnier, neuroticism, 0.26).

%% Léocadie Bergeron
person(leocadie_bergeron).
first_name(leocadie_bergeron, 'Léocadie').
last_name(leocadie_bergeron, 'Bergeron').
full_name(leocadie_bergeron, 'Léocadie Bergeron').
gender(leocadie_bergeron, female).
alive(leocadie_bergeron).
occupation(leocadie_bergeron, laborer).
personality(leocadie_bergeron, openness, 0.41).
personality(leocadie_bergeron, conscientiousness, -0.03).
personality(leocadie_bergeron, extroversion, 0.21).
personality(leocadie_bergeron, agreeableness, -0.5).
personality(leocadie_bergeron, neuroticism, 0.26).

%% Isidore Robichaux
person(isidore_robichaux).
first_name(isidore_robichaux, 'Isidore').
last_name(isidore_robichaux, 'Robichaux').
full_name(isidore_robichaux, 'Isidore Robichaux').
gender(isidore_robichaux, male).
alive(isidore_robichaux).
occupation(isidore_robichaux, laborer).
personality(isidore_robichaux, openness, -0.01).
personality(isidore_robichaux, conscientiousness, -0.38).
personality(isidore_robichaux, extroversion, 0.13).
personality(isidore_robichaux, agreeableness, 0.09).
personality(isidore_robichaux, neuroticism, 0.0).

%% Joachim Robichaux
person(joachim_robichaux).
first_name(joachim_robichaux, 'Joachim').
last_name(joachim_robichaux, 'Robichaux').
full_name(joachim_robichaux, 'Joachim Robichaux').
gender(joachim_robichaux, male).
alive(joachim_robichaux).
occupation(joachim_robichaux, farmer).
personality(joachim_robichaux, openness, -0.02).
personality(joachim_robichaux, conscientiousness, -0.04).
personality(joachim_robichaux, extroversion, -0.1).
personality(joachim_robichaux, agreeableness, 0.14).
personality(joachim_robichaux, neuroticism, 0.22).

%% Léontine Robichaux
person(leontine_robichaux).
first_name(leontine_robichaux, 'Léontine').
last_name(leontine_robichaux, 'Robichaux').
full_name(leontine_robichaux, 'Léontine Robichaux').
gender(leontine_robichaux, female).
alive(leontine_robichaux).
occupation(leontine_robichaux, farmer).
personality(leontine_robichaux, openness, -0.0).
personality(leontine_robichaux, conscientiousness, -0.37).
personality(leontine_robichaux, extroversion, -0.02).
personality(leontine_robichaux, agreeableness, 0.19).
personality(leontine_robichaux, neuroticism, 0.27).

%% Lise Cormier
person(lise_cormier).
first_name(lise_cormier, 'Lise').
last_name(lise_cormier, 'Cormier').
full_name(lise_cormier, 'Lise Cormier').
gender(lise_cormier, female).
alive(lise_cormier).
occupation(lise_cormier, farmer).
personality(lise_cormier, openness, 0.06).
personality(lise_cormier, conscientiousness, -0.34).
personality(lise_cormier, extroversion, 0.08).
personality(lise_cormier, agreeableness, 0.34).
personality(lise_cormier, neuroticism, 0.09).

%% Léandre Robichaux
person(leandre_robichaux).
first_name(leandre_robichaux, 'Léandre').
last_name(leandre_robichaux, 'Robichaux').
full_name(leandre_robichaux, 'Léandre Robichaux').
gender(leandre_robichaux, male).
alive(leandre_robichaux).
personality(leandre_robichaux, openness, 0.02).
personality(leandre_robichaux, conscientiousness, -0.2).
personality(leandre_robichaux, extroversion, 0.07).
personality(leandre_robichaux, agreeableness, 0.24).
personality(leandre_robichaux, neuroticism, -0.09).

%% Maximilien Cormier
person(maximilien_cormier).
first_name(maximilien_cormier, 'Maximilien').
last_name(maximilien_cormier, 'Cormier').
full_name(maximilien_cormier, 'Maximilien Cormier').
gender(maximilien_cormier, male).
alive(maximilien_cormier).
occupation(maximilien_cormier, farmer).
personality(maximilien_cormier, openness, 0.18).
personality(maximilien_cormier, conscientiousness, 0.04).
personality(maximilien_cormier, extroversion, -0.22).
personality(maximilien_cormier, agreeableness, 0.3).
personality(maximilien_cormier, neuroticism, -0.34).

%% Lucienne Cormier
person(lucienne_cormier).
first_name(lucienne_cormier, 'Lucienne').
last_name(lucienne_cormier, 'Cormier').
full_name(lucienne_cormier, 'Lucienne Cormier').
gender(lucienne_cormier, female).
alive(lucienne_cormier).
occupation(lucienne_cormier, farmer).
personality(lucienne_cormier, openness, 0.2).
personality(lucienne_cormier, conscientiousness, 0.16).
personality(lucienne_cormier, extroversion, -0.43).
personality(lucienne_cormier, agreeableness, -0.0).
personality(lucienne_cormier, neuroticism, -0.16).

%% Ludivine Bergeron
person(ludivine_bergeron).
first_name(ludivine_bergeron, 'Ludivine').
last_name(ludivine_bergeron, 'Bergeron').
full_name(ludivine_bergeron, 'Ludivine Bergeron').
gender(ludivine_bergeron, female).
alive(ludivine_bergeron).
occupation(ludivine_bergeron, farmer).
personality(ludivine_bergeron, openness, 0.19).
personality(ludivine_bergeron, conscientiousness, 0.1).
personality(ludivine_bergeron, extroversion, -0.17).
personality(ludivine_bergeron, agreeableness, 0.18).
personality(ludivine_bergeron, neuroticism, -0.1).

%% Marceline Broussard
person(marceline_broussard).
first_name(marceline_broussard, 'Marceline').
last_name(marceline_broussard, 'Broussard').
full_name(marceline_broussard, 'Marceline Broussard').
gender(marceline_broussard, female).
alive(marceline_broussard).
personality(marceline_broussard, openness, -0.1).
personality(marceline_broussard, conscientiousness, 0.05).
personality(marceline_broussard, extroversion, -0.36).
personality(marceline_broussard, agreeableness, 0.29).
personality(marceline_broussard, neuroticism, -0.2).

%% Marthe Cormier
person(marthe_cormier).
first_name(marthe_cormier, 'Marthe').
last_name(marthe_cormier, 'Cormier').
full_name(marthe_cormier, 'Marthe Cormier').
gender(marthe_cormier, female).
alive(marthe_cormier).
occupation(marthe_cormier, farmer).
personality(marthe_cormier, openness, 0.17).
personality(marthe_cormier, conscientiousness, 0.02).
personality(marthe_cormier, extroversion, -0.24).
personality(marthe_cormier, agreeableness, 0.03).
personality(marthe_cormier, neuroticism, -0.21).

%% Nestor Sonnier
person(nestor_sonnier_2).
first_name(nestor_sonnier_2, 'Nestor').
last_name(nestor_sonnier_2, 'Sonnier').
full_name(nestor_sonnier_2, 'Nestor Sonnier').
gender(nestor_sonnier_2, male).
alive(nestor_sonnier_2).
occupation(nestor_sonnier_2, owner_guildartisans).
personality(nestor_sonnier_2, openness, -0.01).
personality(nestor_sonnier_2, conscientiousness, -0.34).
personality(nestor_sonnier_2, extroversion, 0.1).
personality(nestor_sonnier_2, agreeableness, 0.06).
personality(nestor_sonnier_2, neuroticism, 0.23).

%% Octave Sonnier
person(octave_sonnier_2).
first_name(octave_sonnier_2, 'Octave').
last_name(octave_sonnier_2, 'Sonnier').
full_name(octave_sonnier_2, 'Octave Sonnier').
gender(octave_sonnier_2, male).
alive(octave_sonnier_2).
occupation(octave_sonnier_2, laborer).
personality(octave_sonnier_2, openness, -0.18).
personality(octave_sonnier_2, conscientiousness, -0.46).
personality(octave_sonnier_2, extroversion, -0.07).
personality(octave_sonnier_2, agreeableness, -0.08).
personality(octave_sonnier_2, neuroticism, 0.28).

%% Mélanie Sonnier
person(melanie_sonnier).
first_name(melanie_sonnier, 'Mélanie').
last_name(melanie_sonnier, 'Sonnier').
full_name(melanie_sonnier, 'Mélanie Sonnier').
gender(melanie_sonnier, female).
alive(melanie_sonnier).
occupation(melanie_sonnier, laborer).
personality(melanie_sonnier, openness, -0.14).
personality(melanie_sonnier, conscientiousness, -0.42).
personality(melanie_sonnier, extroversion, 0.09).
personality(melanie_sonnier, agreeableness, -0.05).
personality(melanie_sonnier, neuroticism, 0.18).

%% Noémie Cormier
person(noemie_cormier_2).
first_name(noemie_cormier_2, 'Noémie').
last_name(noemie_cormier_2, 'Cormier').
full_name(noemie_cormier_2, 'Noémie Cormier').
gender(noemie_cormier_2, female).
alive(noemie_cormier_2).
occupation(noemie_cormier_2, farmer).
personality(noemie_cormier_2, openness, 0.02).
personality(noemie_cormier_2, conscientiousness, -0.62).
personality(noemie_cormier_2, extroversion, 0.23).
personality(noemie_cormier_2, agreeableness, -0.12).
personality(noemie_cormier_2, neuroticism, 0.28).

%% Patrice Bégnaud
person(patrice_begnaud).
first_name(patrice_begnaud, 'Patrice').
last_name(patrice_begnaud, 'Bégnaud').
full_name(patrice_begnaud, 'Patrice Bégnaud').
gender(patrice_begnaud, male).
alive(patrice_begnaud).
occupation(patrice_begnaud, student).
personality(patrice_begnaud, openness, -0.37).
personality(patrice_begnaud, conscientiousness, 0.04).
personality(patrice_begnaud, extroversion, -0.3).
personality(patrice_begnaud, agreeableness, -0.16).
personality(patrice_begnaud, neuroticism, -0.08).

%% Olympe Broussard
person(olympe_broussard).
first_name(olympe_broussard, 'Olympe').
last_name(olympe_broussard, 'Broussard').
full_name(olympe_broussard, 'Olympe Broussard').
gender(olympe_broussard, female).
alive(olympe_broussard).
occupation(olympe_broussard, student).
personality(olympe_broussard, openness, -0.14).
personality(olympe_broussard, conscientiousness, 0.28).
personality(olympe_broussard, extroversion, -0.09).
personality(olympe_broussard, agreeableness, -0.36).
personality(olympe_broussard, neuroticism, -0.07).

%% Pélagie Robichaux
person(pelagie_robichaux).
first_name(pelagie_robichaux, 'Pélagie').
last_name(pelagie_robichaux, 'Robichaux').
full_name(pelagie_robichaux, 'Pélagie Robichaux').
gender(pelagie_robichaux, female).
alive(pelagie_robichaux).
occupation(pelagie_robichaux, student).
personality(pelagie_robichaux, openness, -0.14).
personality(pelagie_robichaux, conscientiousness, 0.23).
personality(pelagie_robichaux, extroversion, -0.26).
personality(pelagie_robichaux, agreeableness, -0.36).
personality(pelagie_robichaux, neuroticism, -0.16).

%% Raphaël Cormier
person(raphael_cormier).
first_name(raphael_cormier, 'Raphaël').
last_name(raphael_cormier, 'Cormier').
full_name(raphael_cormier, 'Raphaël Cormier').
gender(raphael_cormier, male).
alive(raphael_cormier).
occupation(raphael_cormier, farmer).
personality(raphael_cormier, openness, 0.42).
personality(raphael_cormier, conscientiousness, -0.16).
personality(raphael_cormier, extroversion, -0.53).
personality(raphael_cormier, agreeableness, -0.03).
personality(raphael_cormier, neuroticism, -0.12).

%% Philomène Bégnaud
person(philomene_begnaud).
first_name(philomene_begnaud, 'Philomène').
last_name(philomene_begnaud, 'Bégnaud').
full_name(philomene_begnaud, 'Philomène Bégnaud').
gender(philomene_begnaud, female).
alive(philomene_begnaud).
personality(philomene_begnaud, openness, 0.24).
personality(philomene_begnaud, conscientiousness, -0.3).
personality(philomene_begnaud, extroversion, -0.27).
personality(philomene_begnaud, agreeableness, 0.05).
personality(philomene_begnaud, neuroticism, 0.16).

%% Samuel Cormier
person(samuel_cormier).
first_name(samuel_cormier, 'Samuel').
last_name(samuel_cormier, 'Cormier').
full_name(samuel_cormier, 'Samuel Cormier').
gender(samuel_cormier, male).
alive(samuel_cormier).
personality(samuel_cormier, openness, 0.32).
personality(samuel_cormier, conscientiousness, -0.02).
personality(samuel_cormier, extroversion, -0.42).
personality(samuel_cormier, agreeableness, 0.11).
personality(samuel_cormier, neuroticism, 0.08).

%% Timothée Cormier
person(timothee_cormier).
first_name(timothee_cormier, 'Timothée').
last_name(timothee_cormier, 'Cormier').
full_name(timothee_cormier, 'Timothée Cormier').
gender(timothee_cormier, male).
alive(timothee_cormier).
occupation(timothee_cormier, owner_restaurant).
personality(timothee_cormier, openness, 0.2).
personality(timothee_cormier, conscientiousness, 0.24).
personality(timothee_cormier, extroversion, -0.3).
personality(timothee_cormier, agreeableness, -0.09).
personality(timothee_cormier, neuroticism, -0.18).

%% Valéry Cormier
person(valery_cormier_2).
first_name(valery_cormier_2, 'Valéry').
last_name(valery_cormier_2, 'Cormier').
full_name(valery_cormier_2, 'Valéry Cormier').
gender(valery_cormier_2, male).
alive(valery_cormier_2).
occupation(valery_cormier_2, farmer).
personality(valery_cormier_2, openness, 0.23).
personality(valery_cormier_2, conscientiousness, 0.18).
personality(valery_cormier_2, extroversion, -0.16).
personality(valery_cormier_2, agreeableness, 0.1).
personality(valery_cormier_2, neuroticism, -0.04).

%% Roseline Sonnier
person(roseline_sonnier).
first_name(roseline_sonnier, 'Roseline').
last_name(roseline_sonnier, 'Sonnier').
full_name(roseline_sonnier, 'Roseline Sonnier').
gender(roseline_sonnier, female).
alive(roseline_sonnier).
occupation(roseline_sonnier, farmer).
personality(roseline_sonnier, openness, 0.19).
personality(roseline_sonnier, conscientiousness, 0.11).
personality(roseline_sonnier, extroversion, -0.23).
personality(roseline_sonnier, agreeableness, 0.02).
personality(roseline_sonnier, neuroticism, -0.27).

%% Arsène Cormier
person(arsene_cormier_2).
first_name(arsene_cormier_2, 'Arsène').
last_name(arsene_cormier_2, 'Cormier').
full_name(arsene_cormier_2, 'Arsène Cormier').
gender(arsene_cormier_2, male).
alive(arsene_cormier_2).
occupation(arsene_cormier_2, owner_grocerystore).
personality(arsene_cormier_2, openness, 0.07).
personality(arsene_cormier_2, conscientiousness, 0.23).
personality(arsene_cormier_2, extroversion, -0.34).
personality(arsene_cormier_2, agreeableness, 0.11).
personality(arsene_cormier_2, neuroticism, -0.01).

%% Séraphine Robichaux
person(seraphine_robichaux).
first_name(seraphine_robichaux, 'Séraphine').
last_name(seraphine_robichaux, 'Robichaux').
full_name(seraphine_robichaux, 'Séraphine Robichaux').
gender(seraphine_robichaux, female).
alive(seraphine_robichaux).
occupation(seraphine_robichaux, farmer).
personality(seraphine_robichaux, openness, -0.18).
personality(seraphine_robichaux, conscientiousness, -0.04).
personality(seraphine_robichaux, extroversion, -0.0).
personality(seraphine_robichaux, agreeableness, -0.34).
personality(seraphine_robichaux, neuroticism, -0.26).

%% Solange Bergeron
person(solange_bergeron).
first_name(solange_bergeron, 'Solange').
last_name(solange_bergeron, 'Bergeron').
full_name(solange_bergeron, 'Solange Bergeron').
gender(solange_bergeron, female).
alive(solange_bergeron).
personality(solange_bergeron, openness, 0.14).
personality(solange_bergeron, conscientiousness, 0.09).
personality(solange_bergeron, extroversion, 0.3).
personality(solange_bergeron, agreeableness, -0.11).
personality(solange_bergeron, neuroticism, 0.16).

%% Balthazar Cormier
person(balthazar_cormier_2).
first_name(balthazar_cormier_2, 'Balthazar').
last_name(balthazar_cormier_2, 'Cormier').
full_name(balthazar_cormier_2, 'Balthazar Cormier').
gender(balthazar_cormier_2, male).
alive(balthazar_cormier_2).
occupation(balthazar_cormier_2, farmer).
personality(balthazar_cormier_2, openness, 0.39).
personality(balthazar_cormier_2, conscientiousness, -0.26).
personality(balthazar_cormier_2, extroversion, 0.08).
personality(balthazar_cormier_2, agreeableness, 0.01).
personality(balthazar_cormier_2, neuroticism, -0.05).

%% Ursule Broussard
person(ursule_broussard).
first_name(ursule_broussard, 'Ursule').
last_name(ursule_broussard, 'Broussard').
full_name(ursule_broussard, 'Ursule Broussard').
gender(ursule_broussard, female).
alive(ursule_broussard).
occupation(ursule_broussard, farmer).
personality(ursule_broussard, openness, 0.22).
personality(ursule_broussard, conscientiousness, -0.3).
personality(ursule_broussard, extroversion, 0.14).
personality(ursule_broussard, agreeableness, 0.21).
personality(ursule_broussard, neuroticism, 0.0).

%% Célestin Cormier
person(celestin_cormier_2).
first_name(celestin_cormier_2, 'Célestin').
last_name(celestin_cormier_2, 'Cormier').
full_name(celestin_cormier_2, 'Célestin Cormier').
gender(celestin_cormier_2, male).
alive(celestin_cormier_2).
occupation(celestin_cormier_2, farmer).
personality(celestin_cormier_2, openness, 0.18).
personality(celestin_cormier_2, conscientiousness, -0.38).
personality(celestin_cormier_2, extroversion, 0.12).
personality(celestin_cormier_2, agreeableness, 0.07).
personality(celestin_cormier_2, neuroticism, 0.11).

%% Donatien Cormier
person(donatien_cormier_2).
first_name(donatien_cormier_2, 'Donatien').
last_name(donatien_cormier_2, 'Cormier').
full_name(donatien_cormier_2, 'Donatien Cormier').
gender(donatien_cormier_2, male).
alive(donatien_cormier_2).
personality(donatien_cormier_2, openness, 0.3).
personality(donatien_cormier_2, conscientiousness, -0.14).
personality(donatien_cormier_2, extroversion, -0.05).
personality(donatien_cormier_2, agreeableness, -0.15).
personality(donatien_cormier_2, neuroticism, 0.06).

%% Zélie Broussard
person(zelie_broussard).
first_name(zelie_broussard, 'Zélie').
last_name(zelie_broussard, 'Broussard').
full_name(zelie_broussard, 'Zélie Broussard').
gender(zelie_broussard, female).
alive(zelie_broussard).
occupation(zelie_broussard, farmhand).
personality(zelie_broussard, openness, 0.36).
personality(zelie_broussard, conscientiousness, 0.1).
personality(zelie_broussard, extroversion, 0.2).
personality(zelie_broussard, agreeableness, -0.06).
personality(zelie_broussard, neuroticism, 0.15).

%% Edgar Robichaux
person(edgar_robichaux_2).
first_name(edgar_robichaux_2, 'Edgar').
last_name(edgar_robichaux_2, 'Robichaux').
full_name(edgar_robichaux_2, 'Edgar Robichaux').
gender(edgar_robichaux_2, male).
alive(edgar_robichaux_2).
occupation(edgar_robichaux_2, farmer).
personality(edgar_robichaux_2, openness, -0.11).
personality(edgar_robichaux_2, conscientiousness, 0.45).
personality(edgar_robichaux_2, extroversion, 0.15).
personality(edgar_robichaux_2, agreeableness, -0.16).
personality(edgar_robichaux_2, neuroticism, -0.55).

%% Firmin Robichaux
person(firmin_robichaux_2).
first_name(firmin_robichaux_2, 'Firmin').
last_name(firmin_robichaux_2, 'Robichaux').
full_name(firmin_robichaux_2, 'Firmin Robichaux').
gender(firmin_robichaux_2, male).
alive(firmin_robichaux_2).
occupation(firmin_robichaux_2, owner_guildexplorateurs).
personality(firmin_robichaux_2, openness, 0.11).
personality(firmin_robichaux_2, conscientiousness, 0.44).
personality(firmin_robichaux_2, extroversion, 0.11).
personality(firmin_robichaux_2, agreeableness, 0.1).
personality(firmin_robichaux_2, neuroticism, -0.34).

%% Marie Robichaux
person(marie_robichaux_2).
first_name(marie_robichaux_2, 'Marie').
last_name(marie_robichaux_2, 'Robichaux').
full_name(marie_robichaux_2, 'Marie Robichaux').
gender(marie_robichaux_2, female).
alive(marie_robichaux_2).
occupation(marie_robichaux_2, farmhand).
personality(marie_robichaux_2, openness, 0.01).
personality(marie_robichaux_2, conscientiousness, 0.43).
personality(marie_robichaux_2, extroversion, -0.08).
personality(marie_robichaux_2, agreeableness, -0.1).
personality(marie_robichaux_2, neuroticism, -0.41).

%% Gédéon Robichaux
person(gedeon_robichaux_2).
first_name(gedeon_robichaux_2, 'Gédéon').
last_name(gedeon_robichaux_2, 'Robichaux').
full_name(gedeon_robichaux_2, 'Gédéon Robichaux').
gender(gedeon_robichaux_2, male).
alive(gedeon_robichaux_2).
occupation(gedeon_robichaux_2, farmer).
personality(gedeon_robichaux_2, openness, 0.06).
personality(gedeon_robichaux_2, conscientiousness, 0.05).
personality(gedeon_robichaux_2, extroversion, 0.23).
personality(gedeon_robichaux_2, agreeableness, -0.01).
personality(gedeon_robichaux_2, neuroticism, -0.17).

%% Jeanne Robichaux
person(jeanne_robichaux).
first_name(jeanne_robichaux, 'Jeanne').
last_name(jeanne_robichaux, 'Robichaux').
full_name(jeanne_robichaux, 'Jeanne Robichaux').
gender(jeanne_robichaux, female).
alive(jeanne_robichaux).
occupation(jeanne_robichaux, farmer).
personality(jeanne_robichaux, openness, 0.27).
personality(jeanne_robichaux, conscientiousness, -0.2).
personality(jeanne_robichaux, extroversion, 0.03).
personality(jeanne_robichaux, agreeableness, -0.0).
personality(jeanne_robichaux, neuroticism, 0.12).

%% Hilaire Robichaux
person(hilaire_robichaux).
first_name(hilaire_robichaux, 'Hilaire').
last_name(hilaire_robichaux, 'Robichaux').
full_name(hilaire_robichaux, 'Hilaire Robichaux').
gender(hilaire_robichaux, male).
alive(hilaire_robichaux).
personality(hilaire_robichaux, openness, -0.02).
personality(hilaire_robichaux, conscientiousness, 0.08).
personality(hilaire_robichaux, extroversion, 0.25).
personality(hilaire_robichaux, agreeableness, -0.2).
personality(hilaire_robichaux, neuroticism, -0.15).

%% Léopold Robichaux
person(leopold_robichaux).
first_name(leopold_robichaux, 'Léopold').
last_name(leopold_robichaux, 'Robichaux').
full_name(leopold_robichaux, 'Léopold Robichaux').
gender(leopold_robichaux, male).
alive(leopold_robichaux).
occupation(leopold_robichaux, farmhand).
personality(leopold_robichaux, openness, 0.24).
personality(leopold_robichaux, conscientiousness, 0.1).
personality(leopold_robichaux, extroversion, 0.05).
personality(leopold_robichaux, agreeableness, -0.0).
personality(leopold_robichaux, neuroticism, 0.13).

%% Marius Robichaux
person(marius_robichaux).
first_name(marius_robichaux, 'Marius').
last_name(marius_robichaux, 'Robichaux').
full_name(marius_robichaux, 'Marius Robichaux').
gender(marius_robichaux, male).
alive(marius_robichaux).
occupation(marius_robichaux, laborer).
personality(marius_robichaux, openness, -0.12).
personality(marius_robichaux, conscientiousness, 0.43).
personality(marius_robichaux, extroversion, 0.33).
personality(marius_robichaux, agreeableness, 0.17).
personality(marius_robichaux, neuroticism, -0.45).

%% Narcisse Robichaux
person(narcisse_robichaux).
first_name(narcisse_robichaux, 'Narcisse').
last_name(narcisse_robichaux, 'Robichaux').
full_name(narcisse_robichaux, 'Narcisse Robichaux').
gender(narcisse_robichaux, male).
alive(narcisse_robichaux).
personality(narcisse_robichaux, openness, -0.16).
personality(narcisse_robichaux, conscientiousness, 0.36).
personality(narcisse_robichaux, extroversion, 0.06).
personality(narcisse_robichaux, agreeableness, 0.32).
personality(narcisse_robichaux, neuroticism, -0.42).

%% Onésime Robichaux
person(onesime_robichaux).
first_name(onesime_robichaux, 'Onésime').
last_name(onesime_robichaux, 'Robichaux').
full_name(onesime_robichaux, 'Onésime Robichaux').
gender(onesime_robichaux, male).
alive(onesime_robichaux).
occupation(onesime_robichaux, farmhand).
personality(onesime_robichaux, openness, 0.11).
personality(onesime_robichaux, conscientiousness, 0.26).
personality(onesime_robichaux, extroversion, 0.1).
personality(onesime_robichaux, agreeableness, 0.33).
personality(onesime_robichaux, neuroticism, -0.28).

%% Philibert Robichaux
person(philibert_robichaux).
first_name(philibert_robichaux, 'Philibert').
last_name(philibert_robichaux, 'Robichaux').
full_name(philibert_robichaux, 'Philibert Robichaux').
gender(philibert_robichaux, male).
alive(philibert_robichaux).
occupation(philibert_robichaux, farmer).
personality(philibert_robichaux, openness, 0.11).
personality(philibert_robichaux, conscientiousness, 0.14).
personality(philibert_robichaux, extroversion, 0.17).
personality(philibert_robichaux, agreeableness, 0.32).
personality(philibert_robichaux, neuroticism, -0.25).

%% Sévère Robichaux
person(severe_robichaux).
first_name(severe_robichaux, 'Sévère').
last_name(severe_robichaux, 'Robichaux').
full_name(severe_robichaux, 'Sévère Robichaux').
gender(severe_robichaux, male).
alive(severe_robichaux).
occupation(severe_robichaux, farmhand).
personality(severe_robichaux, openness, 0.1).
personality(severe_robichaux, conscientiousness, 0.28).
personality(severe_robichaux, extroversion, 0.1).
personality(severe_robichaux, agreeableness, 0.23).
personality(severe_robichaux, neuroticism, -0.33).

%% Jean Benoît
person(jean_benoit).
first_name(jean_benoit, 'Jean').
last_name(jean_benoit, 'Benoît').
full_name(jean_benoit, 'Jean Benoît').
gender(jean_benoit, male).
alive(jean_benoit).
occupation(jean_benoit, student).
personality(jean_benoit, openness, -0.33).
personality(jean_benoit, conscientiousness, 0.98).
personality(jean_benoit, extroversion, 0.55).
personality(jean_benoit, agreeableness, -0.47).
personality(jean_benoit, neuroticism, -0.15).

%% Marguerite Robichaux
person(marguerite_robichaux).
first_name(marguerite_robichaux, 'Marguerite').
last_name(marguerite_robichaux, 'Robichaux').
full_name(marguerite_robichaux, 'Marguerite Robichaux').
gender(marguerite_robichaux, female).
alive(marguerite_robichaux).
occupation(marguerite_robichaux, farmhand).
personality(marguerite_robichaux, openness, 0.12).
personality(marguerite_robichaux, conscientiousness, -0.46).
personality(marguerite_robichaux, extroversion, -0.76).
personality(marguerite_robichaux, agreeableness, -0.27).
personality(marguerite_robichaux, neuroticism, 0.87).

%% Jacques Hébert
person(jacques_hebert).
first_name(jacques_hebert, 'Jacques').
last_name(jacques_hebert, 'Hébert').
full_name(jacques_hebert, 'Jacques Hébert').
gender(jacques_hebert, male).
alive(jacques_hebert).
occupation(jacques_hebert, farmer).
personality(jacques_hebert, openness, -0.61).
personality(jacques_hebert, conscientiousness, -0.67).
personality(jacques_hebert, extroversion, -0.25).
personality(jacques_hebert, agreeableness, 0.7).
personality(jacques_hebert, neuroticism, -0.22).

%% Françoise Boudreaux
person(francoise_boudreaux).
first_name(francoise_boudreaux, 'Françoise').
last_name(francoise_boudreaux, 'Boudreaux').
full_name(francoise_boudreaux, 'Françoise Boudreaux').
gender(francoise_boudreaux, female).
alive(francoise_boudreaux).
occupation(francoise_boudreaux, baker).
personality(francoise_boudreaux, openness, 0.89).
personality(francoise_boudreaux, conscientiousness, 0.52).
personality(francoise_boudreaux, extroversion, 0.89).
personality(francoise_boudreaux, agreeableness, -0.32).
personality(francoise_boudreaux, neuroticism, -0.54).

%% Henri Beaumont
person(henri_beaumont).
first_name(henri_beaumont, 'Henri').
last_name(henri_beaumont, 'Beaumont').
full_name(henri_beaumont, 'Henri Beaumont').
gender(henri_beaumont, male).
alive(henri_beaumont).
occupation(henri_beaumont, editor).
personality(henri_beaumont, openness, 0.3).
personality(henri_beaumont, conscientiousness, 0.8).
personality(henri_beaumont, extroversion, 0.2).
personality(henri_beaumont, agreeableness, 0.4).
personality(henri_beaumont, neuroticism, 0.3).

%% Marcel Lefèvre
person(marcel_lefevre).
first_name(marcel_lefevre, 'Marcel').
last_name(marcel_lefevre, 'Lefèvre').
full_name(marcel_lefevre, 'Marcel Lefèvre').
gender(marcel_lefevre, female).
alive(marcel_lefevre).
occupation(marcel_lefevre, retired).
personality(marcel_lefevre, openness, 0.5).
personality(marcel_lefevre, conscientiousness, 0.2).
personality(marcel_lefevre, extroversion, 0.7).
personality(marcel_lefevre, agreeableness, 0.6).
personality(marcel_lefevre, neuroticism, 0.5).

%% Étienne Moreau
person(etienne_moreau).
first_name(etienne_moreau, 'Étienne').
last_name(etienne_moreau, 'Moreau').
full_name(etienne_moreau, 'Étienne Moreau').
gender(etienne_moreau, male).
alive(etienne_moreau).
occupation(etienne_moreau, merchant).
personality(etienne_moreau, openness, 0.1).
personality(etienne_moreau, conscientiousness, 0.7).
personality(etienne_moreau, extroversion, 0.5).
personality(etienne_moreau, agreeableness, 0.1).
personality(etienne_moreau, neuroticism, 0.4).

%% Jacques Duval
person(jacques_duval).
first_name(jacques_duval, 'Jacques').
last_name(jacques_duval, 'Duval').
full_name(jacques_duval, 'Jacques Duval').
gender(jacques_duval, female).
alive(jacques_duval).
occupation(jacques_duval, professor).
personality(jacques_duval, openness, 0.9).
personality(jacques_duval, conscientiousness, 0.6).
personality(jacques_duval, extroversion, 0.3).
personality(jacques_duval, agreeableness, 0.5).
personality(jacques_duval, neuroticism, 0.2).

%% Pierre Renard
person(pierre_renard).
first_name(pierre_renard, 'Pierre').
last_name(pierre_renard, 'Renard').
full_name(pierre_renard, 'Pierre Renard').
gender(pierre_renard, male).
alive(pierre_renard).
occupation(pierre_renard, innkeeper).
personality(pierre_renard, openness, 0.6).
personality(pierre_renard, conscientiousness, 0.4).
personality(pierre_renard, extroversion, 0.4).
personality(pierre_renard, agreeableness, 0.8).
personality(pierre_renard, neuroticism, 0.6).


