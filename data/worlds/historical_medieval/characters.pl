%% Insimul Characters: Historical Medieval Europe
%% Source: data/worlds/historical_medieval/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters (5 families/groups)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Ashworth Family (Ruling Lords, Ashworth Keep)
%% ═══════════════════════════════════════════════════════════

%% Lord Godfrey de Ashworth
person(godfrey_de_ashworth).
first_name(godfrey_de_ashworth, 'Godfrey').
last_name(godfrey_de_ashworth, 'de Ashworth').
full_name(godfrey_de_ashworth, 'Godfrey de Ashworth').
gender(godfrey_de_ashworth, male).
alive(godfrey_de_ashworth).
generation(godfrey_de_ashworth, 0).
founder_family(godfrey_de_ashworth).
child(godfrey_de_ashworth, roland_de_ashworth).
child(godfrey_de_ashworth, eleanor_de_ashworth).
spouse(godfrey_de_ashworth, matilda_de_ashworth).
location(godfrey_de_ashworth, ashworth_keep).

%% Lady Matilda de Ashworth
person(matilda_de_ashworth).
first_name(matilda_de_ashworth, 'Matilda').
last_name(matilda_de_ashworth, 'de Ashworth').
full_name(matilda_de_ashworth, 'Matilda de Ashworth').
gender(matilda_de_ashworth, female).
alive(matilda_de_ashworth).
generation(matilda_de_ashworth, 0).
founder_family(matilda_de_ashworth).
child(matilda_de_ashworth, roland_de_ashworth).
child(matilda_de_ashworth, eleanor_de_ashworth).
spouse(matilda_de_ashworth, godfrey_de_ashworth).
location(matilda_de_ashworth, ashworth_keep).

%% Roland de Ashworth (heir)
person(roland_de_ashworth).
first_name(roland_de_ashworth, 'Roland').
last_name(roland_de_ashworth, 'de Ashworth').
full_name(roland_de_ashworth, 'Roland de Ashworth').
gender(roland_de_ashworth, male).
alive(roland_de_ashworth).
generation(roland_de_ashworth, 1).
parent(godfrey_de_ashworth, roland_de_ashworth).
parent(matilda_de_ashworth, roland_de_ashworth).
location(roland_de_ashworth, ashworth_keep).

%% Eleanor de Ashworth
person(eleanor_de_ashworth).
first_name(eleanor_de_ashworth, 'Eleanor').
last_name(eleanor_de_ashworth, 'de Ashworth').
full_name(eleanor_de_ashworth, 'Eleanor de Ashworth').
gender(eleanor_de_ashworth, female).
alive(eleanor_de_ashworth).
generation(eleanor_de_ashworth, 1).
parent(godfrey_de_ashworth, eleanor_de_ashworth).
parent(matilda_de_ashworth, eleanor_de_ashworth).
location(eleanor_de_ashworth, ashworth_keep).

%% ═══════════════════════════════════════════════════════════
%% Godwin Family (Blacksmiths, Ashworth Keep)
%% ═══════════════════════════════════════════════════════════

%% Wulfstan Godwin
person(wulfstan_godwin).
first_name(wulfstan_godwin, 'Wulfstan').
last_name(wulfstan_godwin, 'Godwin').
full_name(wulfstan_godwin, 'Wulfstan Godwin').
gender(wulfstan_godwin, male).
alive(wulfstan_godwin).
generation(wulfstan_godwin, 0).
founder_family(wulfstan_godwin).
child(wulfstan_godwin, osric_godwin).
spouse(wulfstan_godwin, aelswith_godwin).
location(wulfstan_godwin, ashworth_keep).

%% Aelswith Godwin
person(aelswith_godwin).
first_name(aelswith_godwin, 'Aelswith').
last_name(aelswith_godwin, 'Godwin').
full_name(aelswith_godwin, 'Aelswith Godwin').
gender(aelswith_godwin, female).
alive(aelswith_godwin).
generation(aelswith_godwin, 0).
founder_family(aelswith_godwin).
child(aelswith_godwin, osric_godwin).
spouse(aelswith_godwin, wulfstan_godwin).
location(aelswith_godwin, ashworth_keep).

%% Osric Godwin (apprentice smith)
person(osric_godwin).
first_name(osric_godwin, 'Osric').
last_name(osric_godwin, 'Godwin').
full_name(osric_godwin, 'Osric Godwin').
gender(osric_godwin, male).
alive(osric_godwin).
generation(osric_godwin, 1).
parent(wulfstan_godwin, osric_godwin).
parent(aelswith_godwin, osric_godwin).
location(osric_godwin, ashworth_keep).

%% ═══════════════════════════════════════════════════════════
%% Aldric Family (Wool Merchants, Ashworth Keep)
%% ═══════════════════════════════════════════════════════════

%% Hugh Aldric
person(hugh_aldric).
first_name(hugh_aldric, 'Hugh').
last_name(hugh_aldric, 'Aldric').
full_name(hugh_aldric, 'Hugh Aldric').
gender(hugh_aldric, male).
alive(hugh_aldric).
generation(hugh_aldric, 0).
founder_family(hugh_aldric).
child(hugh_aldric, agnes_aldric).
spouse(hugh_aldric, margery_aldric).
location(hugh_aldric, ashworth_keep).

%% Margery Aldric
person(margery_aldric).
first_name(margery_aldric, 'Margery').
last_name(margery_aldric, 'Aldric').
full_name(margery_aldric, 'Margery Aldric').
gender(margery_aldric, female).
alive(margery_aldric).
generation(margery_aldric, 0).
founder_family(margery_aldric).
child(margery_aldric, agnes_aldric).
spouse(margery_aldric, hugh_aldric).
location(margery_aldric, ashworth_keep).

%% Agnes Aldric
person(agnes_aldric).
first_name(agnes_aldric, 'Agnes').
last_name(agnes_aldric, 'Aldric').
full_name(agnes_aldric, 'Agnes Aldric').
gender(agnes_aldric, female).
alive(agnes_aldric).
generation(agnes_aldric, 1).
parent(hugh_aldric, agnes_aldric).
parent(margery_aldric, agnes_aldric).
location(agnes_aldric, ashworth_keep).

%% ═══════════════════════════════════════════════════════════
%% Monastic Brothers (St. Aldhelm Abbey / Ravenhold)
%% ═══════════════════════════════════════════════════════════

%% Brother Anselm (Abbot)
person(brother_anselm).
first_name(brother_anselm, 'Anselm').
last_name(brother_anselm, '').
full_name(brother_anselm, 'Brother Anselm').
gender(brother_anselm, male).
alive(brother_anselm).
generation(brother_anselm, 0).
location(brother_anselm, ashworth_keep).

%% Brother Caedmon (Scribe)
person(brother_caedmon).
first_name(brother_caedmon, 'Caedmon').
last_name(brother_caedmon, '').
full_name(brother_caedmon, 'Brother Caedmon').
gender(brother_caedmon, male).
alive(brother_caedmon).
generation(brother_caedmon, 0).
location(brother_caedmon, ashworth_keep).

%% Brother Dunstan (Herbalist)
person(brother_dunstan).
first_name(brother_dunstan, 'Dunstan').
last_name(brother_dunstan, '').
full_name(brother_dunstan, 'Brother Dunstan').
gender(brother_dunstan, male).
alive(brother_dunstan).
generation(brother_dunstan, 0).
location(brother_dunstan, ravenhold_priory).

%% Prior Benedict (Prior of Ravenhold)
person(prior_benedict).
first_name(prior_benedict, 'Benedict').
last_name(prior_benedict, '').
full_name(prior_benedict, 'Prior Benedict').
gender(prior_benedict, male).
alive(prior_benedict).
generation(prior_benedict, 0).
location(prior_benedict, ravenhold_priory).

%% ═══════════════════════════════════════════════════════════
%% Dunmere Village Folk (Serfs, Dunmere Village)
%% ═══════════════════════════════════════════════════════════

%% Edric the Miller
person(edric_miller).
first_name(edric_miller, 'Edric').
last_name(edric_miller, 'Miller').
full_name(edric_miller, 'Edric Miller').
gender(edric_miller, male).
alive(edric_miller).
generation(edric_miller, 0).
founder_family(edric_miller).
child(edric_miller, hild_miller).
spouse(edric_miller, gytha_miller).
location(edric_miller, dunmere_village).

%% Gytha Miller
person(gytha_miller).
first_name(gytha_miller, 'Gytha').
last_name(gytha_miller, 'Miller').
full_name(gytha_miller, 'Gytha Miller').
gender(gytha_miller, female).
alive(gytha_miller).
generation(gytha_miller, 0).
founder_family(gytha_miller).
child(gytha_miller, hild_miller).
spouse(gytha_miller, edric_miller).
location(gytha_miller, dunmere_village).

%% Hild Miller
person(hild_miller).
first_name(hild_miller, 'Hild').
last_name(hild_miller, 'Miller').
full_name(hild_miller, 'Hild Miller').
gender(hild_miller, female).
alive(hild_miller).
generation(hild_miller, 1).
parent(edric_miller, hild_miller).
parent(gytha_miller, hild_miller).
location(hild_miller, dunmere_village).
