%% Ensemble History: Wild West -- Redemption Gulch Initial World State
%% Source: data/worlds/wild_west/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% ─── Eli Holden ───
trait(eli_holden, male).
trait(eli_holden, stoic).
trait(eli_holden, just).
trait(eli_holden, experienced).
trait(eli_holden, middle_aged).
attribute(eli_holden, charisma, 70).
attribute(eli_holden, marksmanship, 85).
attribute(eli_holden, propriety, 75).
attribute(eli_holden, cunningness, 60).
status(eli_holden, sheriff).

%% ─── Clara Holden ───
trait(clara_holden, female).
trait(clara_holden, educated).
trait(clara_holden, compassionate).
trait(clara_holden, resolute).
attribute(clara_holden, charisma, 75).
attribute(clara_holden, cultural_knowledge, 80).
attribute(clara_holden, propriety, 85).
relationship(clara_holden, eli_holden, married).

%% ─── Sam Holden ───
trait(sam_holden, male).
trait(sam_holden, young).
trait(sam_holden, eager).
trait(sam_holden, loyal).
attribute(sam_holden, charisma, 60).
attribute(sam_holden, marksmanship, 55).
attribute(sam_holden, cunningness, 40).
relationship(sam_holden, eli_holden, sibling).
status(sam_holden, deputy).

%% ─── Ruby Callahan ───
trait(ruby_callahan, female).
trait(ruby_callahan, shrewd).
trait(ruby_callahan, charismatic).
trait(ruby_callahan, independent).
trait(ruby_callahan, middle_aged).
attribute(ruby_callahan, charisma, 90).
attribute(ruby_callahan, cunningness, 80).
attribute(ruby_callahan, propriety, 55).

%% ─── Silas Hendricks ───
trait(silas_hendricks, male).
trait(silas_hendricks, cautious).
trait(silas_hendricks, honest).
trait(silas_hendricks, middle_aged).
attribute(silas_hendricks, charisma, 55).
attribute(silas_hendricks, cunningness, 50).
attribute(silas_hendricks, propriety, 80).

%% ─── Doc Whitfield ───
trait(doc_whitfield, male).
trait(doc_whitfield, educated).
trait(doc_whitfield, weary).
trait(doc_whitfield, compassionate).
trait(doc_whitfield, middle_aged).
attribute(doc_whitfield, charisma, 60).
attribute(doc_whitfield, cultural_knowledge, 85).
attribute(doc_whitfield, propriety, 70).

%% ─── Abigail Whitfield ───
trait(abigail_whitfield, female).
trait(abigail_whitfield, steady).
trait(abigail_whitfield, capable).
trait(abigail_whitfield, kind).
attribute(abigail_whitfield, charisma, 65).
attribute(abigail_whitfield, cultural_knowledge, 60).
attribute(abigail_whitfield, propriety, 75).
relationship(abigail_whitfield, doc_whitfield, married).

%% ─── Josiah Crane ───
trait(josiah_crane, male).
trait(josiah_crane, pious).
trait(josiah_crane, eloquent).
trait(josiah_crane, middle_aged).
attribute(josiah_crane, charisma, 80).
attribute(josiah_crane, cultural_knowledge, 70).
attribute(josiah_crane, propriety, 90).

%% ─── Jack Ketchum ───
trait(jack_ketchum, male).
trait(jack_ketchum, ruthless).
trait(jack_ketchum, cunning).
trait(jack_ketchum, bold).
trait(jack_ketchum, middle_aged).
attribute(jack_ketchum, charisma, 65).
attribute(jack_ketchum, marksmanship, 80).
attribute(jack_ketchum, cunningness, 85).
attribute(jack_ketchum, propriety, 20).
status(jack_ketchum, wanted).

%% ─── Rosa Delgado ───
trait(rosa_delgado, female).
trait(rosa_delgado, sharp_eyed).
trait(rosa_delgado, defiant).
trait(rosa_delgado, young).
attribute(rosa_delgado, charisma, 60).
attribute(rosa_delgado, marksmanship, 90).
attribute(rosa_delgado, cunningness, 70).
relationship(rosa_delgado, jack_ketchum, subordinate).

%% ─── Billy Tate ───
trait(billy_tate, male).
trait(billy_tate, reckless).
trait(billy_tate, loyal).
trait(billy_tate, young).
attribute(billy_tate, charisma, 45).
attribute(billy_tate, marksmanship, 50).
attribute(billy_tate, cunningness, 55).
relationship(billy_tate, jack_ketchum, subordinate).

%% ─── Walt McCoy ───
trait(walt_mccoy, male).
trait(walt_mccoy, stubborn).
trait(walt_mccoy, hardworking).
trait(walt_mccoy, traditional).
trait(walt_mccoy, middle_aged).
attribute(walt_mccoy, charisma, 55).
attribute(walt_mccoy, cunningness, 45).
attribute(walt_mccoy, propriety, 70).

%% ─── Martha McCoy ───
trait(martha_mccoy, female).
trait(martha_mccoy, practical).
trait(martha_mccoy, tough).
trait(martha_mccoy, middle_aged).
attribute(martha_mccoy, charisma, 60).
attribute(martha_mccoy, cunningness, 55).
attribute(martha_mccoy, propriety, 75).
relationship(martha_mccoy, walt_mccoy, married).

%% ─── Jesse McCoy ───
trait(jesse_mccoy, male).
trait(jesse_mccoy, young).
trait(jesse_mccoy, restless).
trait(jesse_mccoy, idealistic).
attribute(jesse_mccoy, charisma, 55).
attribute(jesse_mccoy, marksmanship, 45).
attribute(jesse_mccoy, cunningness, 35).
relationship(jesse_mccoy, walt_mccoy, child_of).
relationship(jesse_mccoy, martha_mccoy, child_of).

%% ─── Hank Dalton ───
trait(hank_dalton, male).
trait(hank_dalton, quiet).
trait(hank_dalton, dependable).
trait(hank_dalton, middle_aged).
attribute(hank_dalton, charisma, 40).
attribute(hank_dalton, marksmanship, 65).
attribute(hank_dalton, cunningness, 50).
relationship(hank_dalton, walt_mccoy, employer).

%% ─── Cornelius Thorne ───
trait(cornelius_thorne, male).
trait(cornelius_thorne, ambitious).
trait(cornelius_thorne, persuasive).
trait(cornelius_thorne, ruthless).
trait(cornelius_thorne, middle_aged).
attribute(cornelius_thorne, charisma, 85).
attribute(cornelius_thorne, cunningness, 90).
attribute(cornelius_thorne, propriety, 65).

%% ─── Mae Li ───
trait(mae_li, female).
trait(mae_li, tough).
trait(mae_li, pragmatic).
trait(mae_li, respected).
attribute(mae_li, charisma, 65).
attribute(mae_li, cunningness, 60).
attribute(mae_li, propriety, 55).

%% ─── Eustace Polk ───
trait(eustace_polk, male).
trait(eustace_polk, curious).
trait(eustace_polk, opinionated).
trait(eustace_polk, middle_aged).
attribute(eustace_polk, charisma, 70).
attribute(eustace_polk, cunningness, 75).
attribute(eustace_polk, cultural_knowledge, 80).

%% ─── Lottie Briggs ───
trait(lottie_briggs, female).
trait(lottie_briggs, observant).
trait(lottie_briggs, gossipy).
trait(lottie_briggs, middle_aged).
attribute(lottie_briggs, charisma, 70).
attribute(lottie_briggs, cunningness, 80).
attribute(lottie_briggs, propriety, 60).

%% ─── Chen Wei ───
trait(chen_wei, male).
trait(chen_wei, strong).
trait(chen_wei, reserved).
trait(chen_wei, skilled).
attribute(chen_wei, charisma, 45).
attribute(chen_wei, cunningness, 40).
attribute(chen_wei, propriety, 65).

%% ─── Key Relationships ───
relationship(eli_holden, jack_ketchum, adversary).
relationship(jack_ketchum, eli_holden, adversary).
relationship(ruby_callahan, eli_holden, ally).
relationship(ruby_callahan, lottie_briggs, friend).
relationship(cornelius_thorne, walt_mccoy, rival).
relationship(walt_mccoy, cornelius_thorne, rival).
relationship(eustace_polk, ruby_callahan, informant).
relationship(mae_li, jack_ketchum, wary).
relationship(silas_hendricks, eli_holden, supportive).
relationship(josiah_crane, doc_whitfield, friend).
