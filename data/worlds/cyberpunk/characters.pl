%% Insimul Characters: Cyberpunk Megacity
%% Source: data/worlds/cyberpunk/characters.pl
%% Created: 2026-04-03
%% Total: 18 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Netrunners / Hackers
%% ═══════════════════════════════════════════════════════════

%% Kira Tanaka -- elite netrunner, freelance data thief
person(kira_tanaka).
first_name(kira_tanaka, 'Kira').
last_name(kira_tanaka, 'Tanaka').
full_name(kira_tanaka, 'Kira Tanaka').
gender(kira_tanaka, female).
alive(kira_tanaka).
generation(kira_tanaka, 0).
location(kira_tanaka, neo_cascade).

%% Zero -- anonymous hacktivist, real name unknown
person(zero).
first_name(zero, 'Zero').
last_name(zero, '').
full_name(zero, 'Zero').
gender(zero, nonbinary).
alive(zero).
generation(zero, 0).
location(zero, neo_cascade).

%% Dex "Glitch" Okonkwo -- young netrunner, idealist
person(dex_okonkwo).
first_name(dex_okonkwo, 'Dex').
last_name(dex_okonkwo, 'Okonkwo').
full_name(dex_okonkwo, 'Dex Okonkwo').
gender(dex_okonkwo, male).
alive(dex_okonkwo).
generation(dex_okonkwo, 1).
location(dex_okonkwo, neo_cascade).

%% ═══════════════════════════════════════════════════════════
%% Fixers / Brokers
%% ═══════════════════════════════════════════════════════════

%% Lena Vasquez -- fixer, connects clients to mercs
person(lena_vasquez).
first_name(lena_vasquez, 'Lena').
last_name(lena_vasquez, 'Vasquez').
full_name(lena_vasquez, 'Lena Vasquez').
gender(lena_vasquez, female).
alive(lena_vasquez).
generation(lena_vasquez, 0).
location(lena_vasquez, neo_cascade).

%% Rook -- information broker, knows everyone
person(rook).
first_name(rook, 'Rook').
last_name(rook, '').
full_name(rook, 'Rook').
gender(rook, male).
alive(rook).
generation(rook, 0).
location(rook, neo_cascade).

%% ═══════════════════════════════════════════════════════════
%% Corporate Executives
%% ═══════════════════════════════════════════════════════════

%% Director Yuki Arasaka-Murata -- Arasaka-Murata VP
person(yuki_arasaka).
first_name(yuki_arasaka, 'Yuki').
last_name(yuki_arasaka, 'Arasaka-Murata').
full_name(yuki_arasaka, 'Yuki Arasaka-Murata').
gender(yuki_arasaka, female).
alive(yuki_arasaka).
generation(yuki_arasaka, 0).
location(yuki_arasaka, neo_cascade).

%% Marcus Cole -- Nexus Dynamics security chief
person(marcus_cole).
first_name(marcus_cole, 'Marcus').
last_name(marcus_cole, 'Cole').
full_name(marcus_cole, 'Marcus Cole').
gender(marcus_cole, male).
alive(marcus_cole).
generation(marcus_cole, 0).
location(marcus_cole, neo_cascade).

%% Dr. Priya Sharma -- SynthLife Biotech lead researcher
person(priya_sharma).
first_name(priya_sharma, 'Priya').
last_name(priya_sharma, 'Sharma').
full_name(priya_sharma, 'Priya Sharma').
gender(priya_sharma, female).
alive(priya_sharma).
generation(priya_sharma, 0).
location(priya_sharma, neo_cascade).

%% ═══════════════════════════════════════════════════════════
%% Street Samurai / Mercenaries
%% ═══════════════════════════════════════════════════════════

%% Viktor "Razor" Petrov -- cybered-up street samurai
person(viktor_petrov).
first_name(viktor_petrov, 'Viktor').
last_name(viktor_petrov, 'Petrov').
full_name(viktor_petrov, 'Viktor Petrov').
gender(viktor_petrov, male).
alive(viktor_petrov).
generation(viktor_petrov, 0).
location(viktor_petrov, neo_cascade).

%% Jade -- solo merc, ex-military
person(jade).
first_name(jade, 'Jade').
last_name(jade, '').
full_name(jade, 'Jade').
gender(jade, female).
alive(jade).
generation(jade, 0).
location(jade, neo_cascade).

%% Axel Reeves -- gun-for-hire, has a code
person(axel_reeves).
first_name(axel_reeves, 'Axel').
last_name(axel_reeves, 'Reeves').
full_name(axel_reeves, 'Axel Reeves').
gender(axel_reeves, male).
alive(axel_reeves).
generation(axel_reeves, 0).
location(axel_reeves, neo_cascade).

%% ═══════════════════════════════════════════════════════════
%% Street Characters / Vendors
%% ═══════════════════════════════════════════════════════════

%% Doc Mori -- ripperdoc, installs cyberware
person(doc_mori).
first_name(doc_mori, 'Doc').
last_name(doc_mori, 'Mori').
full_name(doc_mori, 'Doc Mori').
gender(doc_mori, male).
alive(doc_mori).
generation(doc_mori, 0).
location(doc_mori, neo_cascade).

%% Mama Ling -- food stall owner, community elder
person(mama_ling).
first_name(mama_ling, 'Mama').
last_name(mama_ling, 'Ling').
full_name(mama_ling, 'Mama Ling').
gender(mama_ling, female).
alive(mama_ling).
generation(mama_ling, 0).
location(mama_ling, neo_cascade).

%% Santos -- arms dealer, black market vendor
person(santos).
first_name(santos, 'Santos').
last_name(santos, '').
full_name(santos, 'Santos').
gender(santos, male).
alive(santos).
generation(santos, 0).
location(santos, neo_cascade).

%% ═══════════════════════════════════════════════════════════
%% Other Key Characters
%% ═══════════════════════════════════════════════════════════

%% Officer Chen -- MetroSec cop, conflicted
person(officer_chen).
first_name(officer_chen, 'Wei').
last_name(officer_chen, 'Chen').
full_name(officer_chen, 'Wei Chen').
gender(officer_chen, male).
alive(officer_chen).
generation(officer_chen, 0).
location(officer_chen, neo_cascade).

%% Pixel -- street kid, courier and lookout
person(pixel).
first_name(pixel, 'Pixel').
last_name(pixel, '').
full_name(pixel, 'Pixel').
gender(pixel, female).
alive(pixel).
generation(pixel, 1).
location(pixel, neo_cascade).

%% Father Aleksei -- street preacher, helps the poor
person(father_aleksei).
first_name(father_aleksei, 'Aleksei').
last_name(father_aleksei, 'Volkov').
full_name(father_aleksei, 'Aleksei Volkov').
gender(father_aleksei, male).
alive(father_aleksei).
generation(father_aleksei, 0).
location(father_aleksei, neo_cascade).

%% Synth -- AI construct inhabiting a synthetic body
person(synth).
first_name(synth, 'Synth').
last_name(synth, '').
full_name(synth, 'Synth').
gender(synth, nonbinary).
alive(synth).
generation(synth, 0).
location(synth, neo_cascade).
