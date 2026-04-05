%% Ensemble History: Dark Fantasy Cursed Lands -- Initial World State
%% Source: data/worlds/dark_fantasy/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, corruption

%% ─── Aldric Voss ───
trait(aldric_voss, male).
trait(aldric_voss, stoic).
trait(aldric_voss, honorable).
trait(aldric_voss, haunted).
trait(aldric_voss, middle_aged).
attribute(aldric_voss, combat, 90).
attribute(aldric_voss, leadership, 80).
attribute(aldric_voss, willpower, 85).
attribute(aldric_voss, corruption, 15).
status(aldric_voss, knight_commander).
status(aldric_voss, cursed_undying).
relationship(aldric_voss, sera_voss, protective_father).
relationship(aldric_voss, elara_voss, grieving_spouse).
relationship(aldric_voss, edric_holloway, former_brother_in_arms).
relationship(aldric_voss, ambrose_kael, uneasy_alliance).

%% ─── Elara Voss ───
trait(elara_voss, female).
trait(elara_voss, gentle).
trait(elara_voss, sorrowful).
trait(elara_voss, spectral).
attribute(elara_voss, willpower, 60).
attribute(elara_voss, spiritual_presence, 85).
attribute(elara_voss, corruption, 30).
status(elara_voss, bound_spirit).
status(elara_voss, cathedral_haunting).
relationship(elara_voss, aldric_voss, longing).
relationship(elara_voss, sera_voss, watching_over).
relationship(elara_voss, ambrose_kael, resentment).

%% ─── Sera Voss ───
trait(sera_voss, female).
trait(sera_voss, brave).
trait(sera_voss, defiant).
trait(sera_voss, young).
trait(sera_voss, idealistic).
attribute(sera_voss, combat, 55).
attribute(sera_voss, willpower, 90).
attribute(sera_voss, corruption, 0).
status(sera_voss, squire).
status(sera_voss, curse_resistant).
relationship(sera_voss, aldric_voss, admiration_and_fear).
relationship(sera_voss, maren_thane, secret_friendship).
relationship(sera_voss, isolde_wren, mentor_student).

%% ─── Corvus Thane ───
trait(corvus_thane, male).
trait(corvus_thane, methodical).
trait(corvus_thane, pragmatic).
trait(corvus_thane, secretive).
trait(corvus_thane, middle_aged).
attribute(corvus_thane, medicine, 85).
attribute(corvus_thane, alchemy, 75).
attribute(corvus_thane, willpower, 65).
attribute(corvus_thane, corruption, 20).
status(corvus_thane, chief_plague_doctor).
relationship(corvus_thane, maren_thane, concerned_father).
relationship(corvus_thane, ambrose_kael, professional_respect).
relationship(corvus_thane, silas_fenwick, rivalry).

%% ─── Maren Thane ───
trait(maren_thane, female).
trait(maren_thane, curious).
trait(maren_thane, reckless).
trait(maren_thane, talented).
trait(maren_thane, young).
attribute(maren_thane, medicine, 60).
attribute(maren_thane, alchemy, 70).
attribute(maren_thane, dark_magic, 35).
attribute(maren_thane, corruption, 25).
status(maren_thane, apprentice_plague_doctor).
status(maren_thane, secret_necromancer).
relationship(maren_thane, corvus_thane, hiding_truth).
relationship(maren_thane, sera_voss, secret_friendship).
relationship(maren_thane, morwen_greymist, forbidden_student).

%% ─── Prior Ambrose Kael ───
trait(ambrose_kael, male).
trait(ambrose_kael, pious).
trait(ambrose_kael, authoritarian).
trait(ambrose_kael, burdened).
trait(ambrose_kael, elderly).
attribute(ambrose_kael, faith, 80).
attribute(ambrose_kael, exorcism, 70).
attribute(ambrose_kael, political_influence, 85).
attribute(ambrose_kael, corruption, 10).
status(ambrose_kael, prior_of_cathedral).
status(ambrose_kael, keeper_of_sanctified_ash).
relationship(ambrose_kael, isolde_wren, disappointment).
relationship(ambrose_kael, aldric_voss, mutual_dependence).
relationship(ambrose_kael, varek_draven, secret_negotiator).

%% ─── Isolde Wren ───
trait(isolde_wren, female).
trait(isolde_wren, scarred).
trait(isolde_wren, determined).
trait(isolde_wren, guilt_ridden).
attribute(isolde_wren, exorcism, 80).
attribute(isolde_wren, combat, 50).
attribute(isolde_wren, willpower, 70).
attribute(isolde_wren, corruption, 30).
status(isolde_wren, exorcist).
status(isolde_wren, failed_ritual_survivor).
relationship(isolde_wren, ambrose_kael, strained_loyalty).
relationship(isolde_wren, sera_voss, protective_mentor).
relationship(isolde_wren, elara_voss, pity).

%% ─── Ronan Blackwood ───
trait(ronan_blackwood, male).
trait(ronan_blackwood, gruff).
trait(ronan_blackwood, loyal).
trait(ronan_blackwood, weary).
trait(ronan_blackwood, middle_aged).
attribute(ronan_blackwood, combat, 60).
attribute(ronan_blackwood, charisma, 65).
attribute(ronan_blackwood, willpower, 55).
attribute(ronan_blackwood, corruption, 5).
status(ronan_blackwood, tavern_keeper).
status(ronan_blackwood, former_soldier).
relationship(ronan_blackwood, aldric_voss, old_comrade).
relationship(ronan_blackwood, vesper_ashmore, suspicious_of).
relationship(ronan_blackwood, dredge, protective_employer).

%% ─── Vesper Ashmore ───
trait(vesper_ashmore, female).
trait(vesper_ashmore, cunning).
trait(vesper_ashmore, enigmatic).
trait(vesper_ashmore, amoral).
attribute(vesper_ashmore, dark_magic, 50).
attribute(vesper_ashmore, charisma, 80).
attribute(vesper_ashmore, willpower, 70).
attribute(vesper_ashmore, corruption, 45).
status(vesper_ashmore, curios_dealer).
status(vesper_ashmore, curse_touched).
relationship(vesper_ashmore, ronan_blackwood, tolerates).
relationship(vesper_ashmore, morwen_greymist, wary_respect).
relationship(vesper_ashmore, nyx_sable, former_associate).

%% ─── Dredge ───
trait(dredge, male).
trait(dredge, simple).
trait(dredge, loyal).
trait(dredge, strong).
attribute(dredge, combat, 40).
attribute(dredge, willpower, 30).
attribute(dredge, corruption, 5).
status(dredge, gravedigger).
relationship(dredge, ronan_blackwood, devoted_friend).
relationship(dredge, garrett_holt, drinking_companion).

%% ─── Garrett Holt ───
trait(garrett_holt, male).
trait(garrett_holt, industrious).
trait(garrett_holt, stubborn).
trait(garrett_holt, dependable).
attribute(garrett_holt, craftsmanship, 85).
attribute(garrett_holt, combat, 50).
attribute(garrett_holt, willpower, 60).
attribute(garrett_holt, corruption, 0).
status(garrett_holt, blacksmith).
status(garrett_holt, silver_forger).
relationship(garrett_holt, aldric_voss, supplies_weapons).
relationship(garrett_holt, dredge, drinking_companion).

%% ─── Morwen Greymist ───
trait(morwen_greymist, female).
trait(morwen_greymist, ancient).
trait(morwen_greymist, cryptic).
trait(morwen_greymist, powerful).
attribute(morwen_greymist, dark_magic, 80).
attribute(morwen_greymist, herbalism, 90).
attribute(morwen_greymist, willpower, 85).
attribute(morwen_greymist, corruption, 55).
status(morwen_greymist, swamp_witch).
status(morwen_greymist, ward_keeper).
relationship(morwen_greymist, silas_fenwick, grudging_partnership).
relationship(morwen_greymist, maren_thane, dangerous_mentor).
relationship(morwen_greymist, vesper_ashmore, old_acquaintance).

%% ─── Silas Fenwick ───
trait(silas_fenwick, male).
trait(silas_fenwick, gentle).
trait(silas_fenwick, stubborn).
trait(silas_fenwick, hopeful).
attribute(silas_fenwick, herbalism, 80).
attribute(silas_fenwick, medicine, 65).
attribute(silas_fenwick, willpower, 70).
attribute(silas_fenwick, corruption, 0).
status(silas_fenwick, herbalist).
status(silas_fenwick, blight_researcher).
relationship(silas_fenwick, morwen_greymist, reluctant_partner).
relationship(silas_fenwick, corvus_thane, ideological_clash).

%% ─── Lord Varek Draven ───
trait(varek_draven, male).
trait(varek_draven, ancient).
trait(varek_draven, calculating).
trait(varek_draven, cruel).
trait(varek_draven, patient).
attribute(varek_draven, dark_magic, 95).
attribute(varek_draven, combat, 80).
attribute(varek_draven, leadership, 90).
attribute(varek_draven, corruption, 100).
status(varek_draven, lich_lord).
status(varek_draven, ruler_of_gravenhold).
relationship(varek_draven, nyx_sable, master_servant).
relationship(varek_draven, edric_holloway, bound_revenant).
relationship(varek_draven, ambrose_kael, contemptuous_tolerance).
relationship(varek_draven, aldric_voss, old_enemy).

%% ─── Nyx Sable ───
trait(nyx_sable, female).
trait(nyx_sable, ambitious).
trait(nyx_sable, ruthless).
trait(nyx_sable, proud).
attribute(nyx_sable, dark_magic, 75).
attribute(nyx_sable, charisma, 60).
attribute(nyx_sable, willpower, 65).
attribute(nyx_sable, corruption, 80).
status(nyx_sable, dark_sorceress).
status(nyx_sable, draven_vassal).
relationship(nyx_sable, varek_draven, resentful_servitude).
relationship(nyx_sable, vesper_ashmore, former_associate).
relationship(nyx_sable, edric_holloway, sees_as_tool).

%% ─── Edric Holloway ───
trait(edric_holloway, male).
trait(edric_holloway, tragic).
trait(edric_holloway, tormented).
trait(edric_holloway, honorable_remnant).
attribute(edric_holloway, combat, 75).
attribute(edric_holloway, willpower, 40).
attribute(edric_holloway, corruption, 70).
status(edric_holloway, revenant_knight).
status(edric_holloway, bound_to_draven).
relationship(edric_holloway, varek_draven, enslaved).
relationship(edric_holloway, aldric_voss, shattered_brotherhood).
relationship(edric_holloway, nyx_sable, controlled_by).
