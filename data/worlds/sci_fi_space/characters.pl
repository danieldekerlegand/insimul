%% Insimul Characters: Sci-Fi Space
%% Source: data/worlds/sci_fi_space/characters.pl
%% Created: 2026-04-03
%% Total: 16 characters
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ═══════════════════════════════════════════════════════════
%% Voss Family (Station Command, Nexus Prime)
%% ═══════════════════════════════════════════════════════════

%% Elena Voss -- Station Commander
person(elena_voss).
first_name(elena_voss, 'Elena').
last_name(elena_voss, 'Voss').
full_name(elena_voss, 'Elena Voss').
gender(elena_voss, female).
alive(elena_voss).
generation(elena_voss, 0).
founder_family(elena_voss).
child(elena_voss, kira_voss).
spouse(elena_voss, marcus_voss).
location(elena_voss, nexus_prime).

%% Marcus Voss -- Chief Medical Officer
person(marcus_voss).
first_name(marcus_voss, 'Marcus').
last_name(marcus_voss, 'Voss').
full_name(marcus_voss, 'Marcus Voss').
gender(marcus_voss, male).
alive(marcus_voss).
generation(marcus_voss, 0).
founder_family(marcus_voss).
child(marcus_voss, kira_voss).
spouse(marcus_voss, elena_voss).
location(marcus_voss, nexus_prime).

%% Kira Voss -- Junior Officer
person(kira_voss).
first_name(kira_voss, 'Kira').
last_name(kira_voss, 'Voss').
full_name(kira_voss, 'Kira Voss').
gender(kira_voss, female).
alive(kira_voss).
generation(kira_voss, 1).
parent(elena_voss, kira_voss).
parent(marcus_voss, kira_voss).
location(kira_voss, nexus_prime).

%% ═══════════════════════════════════════════════════════════
%% Renn Family (Engineers, Nexus Prime)
%% ═══════════════════════════════════════════════════════════

%% Jax Renn -- Chief Engineer
person(jax_renn).
first_name(jax_renn, 'Jax').
last_name(jax_renn, 'Renn').
full_name(jax_renn, 'Jax Renn').
gender(jax_renn, male).
alive(jax_renn).
generation(jax_renn, 0).
founder_family(jax_renn).
child(jax_renn, pip_renn).
spouse(jax_renn, sola_renn).
location(jax_renn, nexus_prime).

%% Sola Renn -- Shuttle Mechanic
person(sola_renn).
first_name(sola_renn, 'Sola').
last_name(sola_renn, 'Renn').
full_name(sola_renn, 'Sola Renn').
gender(sola_renn, female).
alive(sola_renn).
generation(sola_renn, 0).
founder_family(sola_renn).
child(sola_renn, pip_renn).
spouse(sola_renn, jax_renn).
location(sola_renn, nexus_prime).

%% Pip Renn -- Engineering Apprentice
person(pip_renn).
first_name(pip_renn, 'Pip').
last_name(pip_renn, 'Renn').
full_name(pip_renn, 'Pip Renn').
gender(pip_renn, male).
alive(pip_renn).
generation(pip_renn, 1).
parent(jax_renn, pip_renn).
parent(sola_renn, pip_renn).
location(pip_renn, nexus_prime).

%% ═══════════════════════════════════════════════════════════
%% Independent Characters (Nexus Prime)
%% ═══════════════════════════════════════════════════════════

%% Zara Okonkwo -- Xenobiologist
person(zara_okonkwo).
first_name(zara_okonkwo, 'Zara').
last_name(zara_okonkwo, 'Okonkwo').
full_name(zara_okonkwo, 'Zara Okonkwo').
gender(zara_okonkwo, female).
alive(zara_okonkwo).
generation(zara_okonkwo, 0).
location(zara_okonkwo, nexus_prime).

%% Dmitri Sorokin -- Smuggler
person(dmitri_sorokin).
first_name(dmitri_sorokin, 'Dmitri').
last_name(dmitri_sorokin, 'Sorokin').
full_name(dmitri_sorokin, 'Dmitri Sorokin').
gender(dmitri_sorokin, male).
alive(dmitri_sorokin).
generation(dmitri_sorokin, 0).
location(dmitri_sorokin, nexus_prime).

%% Lian Chen -- Data Broker
person(lian_chen).
first_name(lian_chen, 'Lian').
last_name(lian_chen, 'Chen').
full_name(lian_chen, 'Lian Chen').
gender(lian_chen, female).
alive(lian_chen).
generation(lian_chen, 0).
location(lian_chen, nexus_prime).

%% ═══════════════════════════════════════════════════════════
%% Alien Characters
%% ═══════════════════════════════════════════════════════════

%% Threx Ik-Vaan -- Thassari Ambassador
person(threx_ik_vaan).
first_name(threx_ik_vaan, 'Threx').
last_name(threx_ik_vaan, 'Ik-Vaan').
full_name(threx_ik_vaan, 'Threx Ik-Vaan').
gender(threx_ik_vaan, neutral).
alive(threx_ik_vaan).
generation(threx_ik_vaan, 0).
location(threx_ik_vaan, nexus_prime).

%% Quorra Zenn -- Thassari Trader
person(quorra_zenn).
first_name(quorra_zenn, 'Quorra').
last_name(quorra_zenn, 'Zenn').
full_name(quorra_zenn, 'Quorra Zenn').
gender(quorra_zenn, female).
alive(quorra_zenn).
generation(quorra_zenn, 0).
location(quorra_zenn, thassari_drift).

%% ═══════════════════════════════════════════════════════════
%% Kepler Colony Characters
%% ═══════════════════════════════════════════════════════════

%% Governor Amara Osei -- Colony Governor
person(amara_osei).
first_name(amara_osei, 'Amara').
last_name(amara_osei, 'Osei').
full_name(amara_osei, 'Amara Osei').
gender(amara_osei, female).
alive(amara_osei).
generation(amara_osei, 0).
founder_family(amara_osei).
location(amara_osei, kepler_colony).

%% Dr. Yuki Tanaka -- Lead Researcher
person(yuki_tanaka).
first_name(yuki_tanaka, 'Yuki').
last_name(yuki_tanaka, 'Tanaka').
full_name(yuki_tanaka, 'Yuki Tanaka').
gender(yuki_tanaka, female).
alive(yuki_tanaka).
generation(yuki_tanaka, 0).
location(yuki_tanaka, kepler_colony).

%% Silas Hargrove -- Head Farmer
person(silas_hargrove).
first_name(silas_hargrove, 'Silas').
last_name(silas_hargrove, 'Hargrove').
full_name(silas_hargrove, 'Silas Hargrove').
gender(silas_hargrove, male).
alive(silas_hargrove).
generation(silas_hargrove, 0).
location(silas_hargrove, kepler_colony).

%% ═══════════════════════════════════════════════════════════
%% Thassari Drift Characters
%% ═══════════════════════════════════════════════════════════

%% Zikri Maal -- Salvage Dealer
person(zikri_maal).
first_name(zikri_maal, 'Zikri').
last_name(zikri_maal, 'Maal').
full_name(zikri_maal, 'Zikri Maal').
gender(zikri_maal, male).
alive(zikri_maal).
generation(zikri_maal, 0).
location(zikri_maal, thassari_drift).
