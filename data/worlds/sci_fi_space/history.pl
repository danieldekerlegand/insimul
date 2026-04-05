%% Ensemble History: Sci-Fi Space -- Initial World State
%% Source: data/worlds/sci_fi_space/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% --- Elena Voss ---
trait(elena_voss, female).
trait(elena_voss, commanding).
trait(elena_voss, diplomatic).
trait(elena_voss, decisive).
trait(elena_voss, middle_aged).
attribute(elena_voss, charisma, 85).
attribute(elena_voss, cunningness, 60).
attribute(elena_voss, propriety, 80).
status(elena_voss, station_commander, nexus_prime).

%% --- Marcus Voss ---
trait(marcus_voss, male).
trait(marcus_voss, compassionate).
trait(marcus_voss, methodical).
trait(marcus_voss, calm).
attribute(marcus_voss, charisma, 65).
attribute(marcus_voss, cultural_knowledge, 70).
attribute(marcus_voss, propriety, 75).
relationship(marcus_voss, elena_voss, married).

%% --- Kira Voss ---
trait(kira_voss, female).
trait(kira_voss, young).
trait(kira_voss, ambitious).
trait(kira_voss, impulsive).
attribute(kira_voss, charisma, 70).
attribute(kira_voss, self_assuredness, 65).
attribute(kira_voss, cunningness, 50).

%% --- Jax Renn ---
trait(jax_renn, male).
trait(jax_renn, brilliant).
trait(jax_renn, gruff).
trait(jax_renn, reliable).
trait(jax_renn, middle_aged).
attribute(jax_renn, charisma, 50).
attribute(jax_renn, cunningness, 75).
attribute(jax_renn, self_assuredness, 70).
relationship(jax_renn, elena_voss, respects).

%% --- Sola Renn ---
trait(sola_renn, female).
trait(sola_renn, practical).
trait(sola_renn, adventurous).
trait(sola_renn, warm).
attribute(sola_renn, charisma, 65).
attribute(sola_renn, self_assuredness, 60).
attribute(sola_renn, cunningness, 55).
relationship(sola_renn, jax_renn, married).

%% --- Pip Renn ---
trait(pip_renn, male).
trait(pip_renn, young).
trait(pip_renn, curious).
trait(pip_renn, eager).
attribute(pip_renn, charisma, 55).
attribute(pip_renn, self_assuredness, 45).
attribute(pip_renn, cunningness, 40).
relationship(pip_renn, kira_voss, friends).

%% --- Zara Okonkwo ---
trait(zara_okonkwo, female).
trait(zara_okonkwo, intellectual).
trait(zara_okonkwo, passionate).
trait(zara_okonkwo, open_minded).
attribute(zara_okonkwo, charisma, 60).
attribute(zara_okonkwo, cultural_knowledge, 85).
attribute(zara_okonkwo, self_assuredness, 65).
relationship(zara_okonkwo, threx_ik_vaan, colleagues).

%% --- Dmitri Sorokin ---
trait(dmitri_sorokin, male).
trait(dmitri_sorokin, charming).
trait(dmitri_sorokin, unscrupulous).
trait(dmitri_sorokin, street_smart).
attribute(dmitri_sorokin, charisma, 80).
attribute(dmitri_sorokin, cunningness, 85).
attribute(dmitri_sorokin, self_assuredness, 75).
relationship(dmitri_sorokin, lian_chen, business_partner).

%% --- Lian Chen ---
trait(lian_chen, female).
trait(lian_chen, analytical).
trait(lian_chen, secretive).
trait(lian_chen, resourceful).
attribute(lian_chen, charisma, 55).
attribute(lian_chen, cunningness, 90).
attribute(lian_chen, self_assuredness, 60).
relationship(lian_chen, dmitri_sorokin, business_partner).

%% --- Threx Ik-Vaan ---
trait(threx_ik_vaan, neutral).
trait(threx_ik_vaan, diplomatic).
trait(threx_ik_vaan, alien).
trait(threx_ik_vaan, enigmatic).
attribute(threx_ik_vaan, charisma, 70).
attribute(threx_ik_vaan, cultural_knowledge, 95).
attribute(threx_ik_vaan, propriety, 90).
relationship(threx_ik_vaan, elena_voss, diplomatic_contact).

%% --- Quorra Zenn ---
trait(quorra_zenn, female).
trait(quorra_zenn, shrewd).
trait(quorra_zenn, alien).
trait(quorra_zenn, mercantile).
attribute(quorra_zenn, charisma, 75).
attribute(quorra_zenn, cunningness, 70).
attribute(quorra_zenn, self_assuredness, 65).
relationship(quorra_zenn, threx_ik_vaan, clan_ally).

%% --- Amara Osei ---
trait(amara_osei, female).
trait(amara_osei, determined).
trait(amara_osei, visionary).
trait(amara_osei, stubborn).
attribute(amara_osei, charisma, 75).
attribute(amara_osei, self_assuredness, 80).
attribute(amara_osei, cunningness, 55).
status(amara_osei, governor, kepler_colony).

%% --- Yuki Tanaka ---
trait(yuki_tanaka, female).
trait(yuki_tanaka, brilliant).
trait(yuki_tanaka, introverted).
trait(yuki_tanaka, dedicated).
attribute(yuki_tanaka, charisma, 45).
attribute(yuki_tanaka, cultural_knowledge, 80).
attribute(yuki_tanaka, self_assuredness, 50).
relationship(yuki_tanaka, zara_okonkwo, colleagues).

%% --- Silas Hargrove ---
trait(silas_hargrove, male).
trait(silas_hargrove, patient).
trait(silas_hargrove, practical).
trait(silas_hargrove, community_minded).
attribute(silas_hargrove, charisma, 60).
attribute(silas_hargrove, cultural_knowledge, 55).
attribute(silas_hargrove, propriety, 65).
relationship(silas_hargrove, amara_osei, loyal_to).

%% --- Zikri Maal ---
trait(zikri_maal, male).
trait(zikri_maal, opportunistic).
trait(zikri_maal, neutral).
trait(zikri_maal, experienced).
attribute(zikri_maal, charisma, 65).
attribute(zikri_maal, cunningness, 75).
attribute(zikri_maal, self_assuredness, 70).
relationship(zikri_maal, dmitri_sorokin, rivals).
