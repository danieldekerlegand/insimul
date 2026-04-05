%% Ensemble History: Mandarin Watertown -- Initial World State
%% Source: data/worlds/language/mandarin/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Wang Guoqiang ---
trait(wang_guoqiang, male).
trait(wang_guoqiang, hospitable).
trait(wang_guoqiang, traditional).
trait(wang_guoqiang, patient).
trait(wang_guoqiang, middle_aged).
attribute(wang_guoqiang, charisma, 75).
attribute(wang_guoqiang, cultural_knowledge, 90).
attribute(wang_guoqiang, propriety, 80).
language_proficiency(wang_guoqiang, mandarin, 95).
language_proficiency(wang_guoqiang, english, 20).

%% --- Sun Fanghua ---
trait(sun_fanghua, female).
trait(sun_fanghua, nurturing).
trait(sun_fanghua, wise).
trait(sun_fanghua, community_minded).
attribute(sun_fanghua, charisma, 70).
attribute(sun_fanghua, cultural_knowledge, 85).
attribute(sun_fanghua, propriety, 85).
relationship(sun_fanghua, wang_guoqiang, married).
language_proficiency(sun_fanghua, mandarin, 95).
language_proficiency(sun_fanghua, english, 15).

%% --- Wang Lei ---
trait(wang_lei, male).
trait(wang_lei, young).
trait(wang_lei, tech_savvy).
trait(wang_lei, entrepreneurial).
attribute(wang_lei, charisma, 70).
attribute(wang_lei, cunningness, 55).
attribute(wang_lei, self_assuredness, 70).
language_proficiency(wang_lei, mandarin, 92).
language_proficiency(wang_lei, english, 65).

%% --- Wang Meiling ---
trait(wang_meiling, female).
trait(wang_meiling, young).
trait(wang_meiling, artistic).
trait(wang_meiling, quiet).
attribute(wang_meiling, charisma, 60).
attribute(wang_meiling, cultural_knowledge, 65).
attribute(wang_meiling, sensitiveness, 75).
language_proficiency(wang_meiling, mandarin, 90).
language_proficiency(wang_meiling, english, 55).

%% --- Li Jianguo ---
trait(li_jianguo, male).
trait(li_jianguo, educated).
trait(li_jianguo, formal).
trait(li_jianguo, intellectual).
trait(li_jianguo, middle_aged).
attribute(li_jianguo, charisma, 80).
attribute(li_jianguo, cultural_knowledge, 95).
attribute(li_jianguo, propriety, 85).
language_proficiency(li_jianguo, mandarin, 98).
language_proficiency(li_jianguo, english, 80).
language_proficiency(li_jianguo, japanese, 40).

%% --- Zhou Yumei ---
trait(zhou_yumei, female).
trait(zhou_yumei, articulate).
trait(zhou_yumei, passionate).
trait(zhou_yumei, modern).
attribute(zhou_yumei, charisma, 85).
attribute(zhou_yumei, cultural_knowledge, 80).
attribute(zhou_yumei, self_assuredness, 80).
relationship(zhou_yumei, li_jianguo, married).
language_proficiency(zhou_yumei, mandarin, 96).
language_proficiency(zhou_yumei, english, 75).

%% --- Li Wei ---
trait(li_wei, male).
trait(li_wei, young).
trait(li_wei, studious).
trait(li_wei, idealistic).
attribute(li_wei, charisma, 60).
attribute(li_wei, cultural_knowledge, 70).
attribute(li_wei, self_assuredness, 55).
language_proficiency(li_wei, mandarin, 93).
language_proficiency(li_wei, english, 85).

%% --- Li Na ---
trait(li_na, female).
trait(li_na, young).
trait(li_na, social).
trait(li_na, athletic).
attribute(li_na, charisma, 75).
attribute(li_na, self_assuredness, 70).
attribute(li_na, cunningness, 45).
language_proficiency(li_na, mandarin, 90).
language_proficiency(li_na, english, 65).

%% --- Zhang Wenhua ---
trait(zhang_wenhua, male).
trait(zhang_wenhua, shrewd).
trait(zhang_wenhua, experienced).
trait(zhang_wenhua, merchant).
trait(zhang_wenhua, middle_aged).
attribute(zhang_wenhua, charisma, 80).
attribute(zhang_wenhua, cunningness, 75).
attribute(zhang_wenhua, cultural_knowledge, 70).
relationship(zhang_wenhua, wang_guoqiang, friends).
language_proficiency(zhang_wenhua, mandarin, 95).
language_proficiency(zhang_wenhua, english, 40).

%% --- Liu Xiulan ---
trait(liu_xiulan, female).
trait(liu_xiulan, organized).
trait(liu_xiulan, warm).
trait(liu_xiulan, practical).
attribute(liu_xiulan, charisma, 65).
attribute(liu_xiulan, propriety, 75).
attribute(liu_xiulan, cultural_knowledge, 80).
relationship(liu_xiulan, zhang_wenhua, married).
relationship(liu_xiulan, sun_fanghua, friends).
language_proficiency(liu_xiulan, mandarin, 93).
language_proficiency(liu_xiulan, english, 25).

%% --- Zhang Yun ---
trait(zhang_yun, female).
trait(zhang_yun, young).
trait(zhang_yun, creative).
trait(zhang_yun, independent).
attribute(zhang_yun, charisma, 70).
attribute(zhang_yun, self_assuredness, 65).
attribute(zhang_yun, sensitiveness, 60).
relationship(zhang_yun, li_na, friends).
language_proficiency(zhang_yun, mandarin, 90).
language_proficiency(zhang_yun, english, 60).

%% --- Zhang Hao ---
trait(zhang_hao, male).
trait(zhang_hao, young).
trait(zhang_hao, entrepreneurial).
trait(zhang_hao, energetic).
attribute(zhang_hao, charisma, 70).
attribute(zhang_hao, cunningness, 60).
attribute(zhang_hao, self_assuredness, 65).
language_proficiency(zhang_hao, mandarin, 88).
language_proficiency(zhang_hao, english, 55).

%% --- Chen Dawei ---
trait(chen_dawei, male).
trait(chen_dawei, educated).
trait(chen_dawei, caring).
trait(chen_dawei, respected).
trait(chen_dawei, middle_aged).
attribute(chen_dawei, charisma, 75).
attribute(chen_dawei, cultural_knowledge, 70).
attribute(chen_dawei, propriety, 80).
relationship(chen_dawei, li_jianguo, friends).
language_proficiency(chen_dawei, mandarin, 95).
language_proficiency(chen_dawei, english, 70).

%% --- Yang Lihua ---
trait(yang_lihua, female).
trait(yang_lihua, elegant).
trait(yang_lihua, artistic).
trait(yang_lihua, cultured).
attribute(yang_lihua, charisma, 80).
attribute(yang_lihua, cultural_knowledge, 85).
attribute(yang_lihua, sensitiveness, 70).
relationship(yang_lihua, chen_dawei, married).
language_proficiency(yang_lihua, mandarin, 93).
language_proficiency(yang_lihua, english, 55).

%% --- Chen Jing ---
trait(chen_jing, female).
trait(chen_jing, young).
trait(chen_jing, diligent).
trait(chen_jing, kind).
attribute(chen_jing, charisma, 60).
attribute(chen_jing, propriety, 75).
attribute(chen_jing, cultural_knowledge, 65).
relationship(chen_jing, wang_meiling, friends).
language_proficiency(chen_jing, mandarin, 90).
language_proficiency(chen_jing, english, 70).

%% --- Chen Ming ---
trait(chen_ming, male).
trait(chen_ming, young).
trait(chen_ming, rebellious).
trait(chen_ming, musical).
attribute(chen_ming, charisma, 65).
attribute(chen_ming, self_assuredness, 55).
attribute(chen_ming, sensitiveness, 70).
relationship(chen_ming, zhang_hao, friends).
language_proficiency(chen_ming, mandarin, 88).
language_proficiency(chen_ming, english, 60).

%% --- Zhao Zhonghe ---
trait(zhao_zhonghe, male).
trait(zhao_zhonghe, patient).
trait(zhao_zhonghe, traditional).
trait(zhao_zhonghe, proud).
trait(zhao_zhonghe, elderly).
attribute(zhao_zhonghe, charisma, 60).
attribute(zhao_zhonghe, cultural_knowledge, 90).
attribute(zhao_zhonghe, propriety, 70).
relationship(zhao_zhonghe, liu_changming, friends).
language_proficiency(zhao_zhonghe, mandarin, 95).
language_proficiency(zhao_zhonghe, english, 5).

%% --- Xu Qiuying ---
trait(xu_qiuying, female).
trait(xu_qiuying, gentle).
trait(xu_qiuying, resourceful).
trait(xu_qiuying, observant).
attribute(xu_qiuying, charisma, 55).
attribute(xu_qiuying, cultural_knowledge, 85).
attribute(xu_qiuying, propriety, 70).
relationship(xu_qiuying, zhao_zhonghe, married).
language_proficiency(xu_qiuying, mandarin, 93).
language_proficiency(xu_qiuying, english, 5).

%% --- Zhao Pengfei ---
trait(zhao_pengfei, male).
trait(zhao_pengfei, young).
trait(zhao_pengfei, restless).
trait(zhao_pengfei, ambitious).
attribute(zhao_pengfei, charisma, 60).
attribute(zhao_pengfei, self_assuredness, 50).
attribute(zhao_pengfei, cunningness, 40).
language_proficiency(zhao_pengfei, mandarin, 88).
language_proficiency(zhao_pengfei, english, 35).

%% --- Zhao Lili ---
trait(zhao_lili, female).
trait(zhao_lili, young).
trait(zhao_lili, curious).
trait(zhao_lili, cheerful).
attribute(zhao_lili, charisma, 70).
attribute(zhao_lili, sensitiveness, 60).
attribute(zhao_lili, self_assuredness, 45).
language_proficiency(zhao_lili, mandarin, 87).
language_proficiency(zhao_lili, english, 40).

%% --- Liu Changming ---
trait(liu_changming, male).
trait(liu_changming, rugged).
trait(liu_changming, hardworking).
trait(liu_changming, storyteller).
trait(liu_changming, middle_aged).
attribute(liu_changming, charisma, 65).
attribute(liu_changming, cultural_knowledge, 75).
attribute(liu_changming, propriety, 55).
language_proficiency(liu_changming, mandarin, 92).
language_proficiency(liu_changming, english, 10).

%% --- He Cuiping ---
trait(he_cuiping, female).
trait(he_cuiping, resilient).
trait(he_cuiping, resourceful).
trait(he_cuiping, community_minded).
attribute(he_cuiping, charisma, 60).
attribute(he_cuiping, propriety, 65).
attribute(he_cuiping, cultural_knowledge, 70).
relationship(he_cuiping, liu_changming, married).
language_proficiency(he_cuiping, mandarin, 90).
language_proficiency(he_cuiping, english, 5).

%% --- Liu Xiaofang ---
trait(liu_xiaofang, female).
trait(liu_xiaofang, young).
trait(liu_xiaofang, determined).
trait(liu_xiaofang, nature_loving).
attribute(liu_xiaofang, charisma, 55).
attribute(liu_xiaofang, self_assuredness, 60).
attribute(liu_xiaofang, sensitiveness, 65).
language_proficiency(liu_xiaofang, mandarin, 88).
language_proficiency(liu_xiaofang, english, 45).

%% --- Liu Jun ---
trait(liu_jun, male).
trait(liu_jun, young).
trait(liu_jun, quiet).
trait(liu_jun, dutiful).
attribute(liu_jun, charisma, 45).
attribute(liu_jun, propriety, 65).
attribute(liu_jun, cultural_knowledge, 60).
language_proficiency(liu_jun, mandarin, 87).
language_proficiency(liu_jun, english, 30).
