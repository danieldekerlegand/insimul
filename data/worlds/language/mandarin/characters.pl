%% Insimul Characters: Mandarin Watertown
%% Source: data/worlds/language/mandarin/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%
%% Note: Chinese names use family name FIRST (Wang Lei = family Wang, given Lei)

%% ===============================================================
%% Wang Family (Teahouse Owners, Shuixiang Zhen)
%% ===============================================================

%% Wang Guoqiang
person(wang_guoqiang).
first_name(wang_guoqiang, 'Guoqiang').
last_name(wang_guoqiang, 'Wang').
full_name(wang_guoqiang, 'Wang Guoqiang').
gender(wang_guoqiang, male).
alive(wang_guoqiang).
generation(wang_guoqiang, 0).
founder_family(wang_guoqiang).
child(wang_guoqiang, wang_lei).
child(wang_guoqiang, wang_meiling).
spouse(wang_guoqiang, sun_fanghua).
location(wang_guoqiang, shuixiang_zhen).

%% Sun Fanghua (nee Sun, married into Wang)
person(sun_fanghua).
first_name(sun_fanghua, 'Fanghua').
last_name(sun_fanghua, 'Sun').
full_name(sun_fanghua, 'Sun Fanghua').
gender(sun_fanghua, female).
alive(sun_fanghua).
generation(sun_fanghua, 0).
founder_family(sun_fanghua).
child(sun_fanghua, wang_lei).
child(sun_fanghua, wang_meiling).
spouse(sun_fanghua, wang_guoqiang).
location(sun_fanghua, shuixiang_zhen).

%% Wang Lei
person(wang_lei).
first_name(wang_lei, 'Lei').
last_name(wang_lei, 'Wang').
full_name(wang_lei, 'Wang Lei').
gender(wang_lei, male).
alive(wang_lei).
generation(wang_lei, 1).
parent(wang_guoqiang, wang_lei).
parent(sun_fanghua, wang_lei).
location(wang_lei, shuixiang_zhen).

%% Wang Meiling
person(wang_meiling).
first_name(wang_meiling, 'Meiling').
last_name(wang_meiling, 'Wang').
full_name(wang_meiling, 'Wang Meiling').
gender(wang_meiling, female).
alive(wang_meiling).
generation(wang_meiling, 1).
parent(wang_guoqiang, wang_meiling).
parent(sun_fanghua, wang_meiling).
location(wang_meiling, shuixiang_zhen).

%% ===============================================================
%% Li Family (Language School Teachers, Shuixiang Zhen)
%% ===============================================================

%% Li Jianguo
person(li_jianguo).
first_name(li_jianguo, 'Jianguo').
last_name(li_jianguo, 'Li').
full_name(li_jianguo, 'Li Jianguo').
gender(li_jianguo, male).
alive(li_jianguo).
generation(li_jianguo, 0).
founder_family(li_jianguo).
child(li_jianguo, li_wei).
child(li_jianguo, li_na).
spouse(li_jianguo, zhou_yumei).
location(li_jianguo, shuixiang_zhen).

%% Zhou Yumei (nee Zhou, married into Li)
person(zhou_yumei).
first_name(zhou_yumei, 'Yumei').
last_name(zhou_yumei, 'Zhou').
full_name(zhou_yumei, 'Zhou Yumei').
gender(zhou_yumei, female).
alive(zhou_yumei).
generation(zhou_yumei, 0).
founder_family(zhou_yumei).
child(zhou_yumei, li_wei).
child(zhou_yumei, li_na).
spouse(zhou_yumei, li_jianguo).
location(zhou_yumei, shuixiang_zhen).

%% Li Wei
person(li_wei).
first_name(li_wei, 'Wei').
last_name(li_wei, 'Li').
full_name(li_wei, 'Li Wei').
gender(li_wei, male).
alive(li_wei).
generation(li_wei, 1).
parent(li_jianguo, li_wei).
parent(zhou_yumei, li_wei).
location(li_wei, shuixiang_zhen).

%% Li Na
person(li_na).
first_name(li_na, 'Na').
last_name(li_na, 'Li').
full_name(li_na, 'Li Na').
gender(li_na, female).
alive(li_na).
generation(li_na, 1).
parent(li_jianguo, li_na).
parent(zhou_yumei, li_na).
location(li_na, shuixiang_zhen).

%% ===============================================================
%% Zhang Family (Silk Merchants, Shuixiang Zhen)
%% ===============================================================

%% Zhang Wenhua
person(zhang_wenhua).
first_name(zhang_wenhua, 'Wenhua').
last_name(zhang_wenhua, 'Zhang').
full_name(zhang_wenhua, 'Zhang Wenhua').
gender(zhang_wenhua, male).
alive(zhang_wenhua).
generation(zhang_wenhua, 0).
founder_family(zhang_wenhua).
child(zhang_wenhua, zhang_yun).
child(zhang_wenhua, zhang_hao).
spouse(zhang_wenhua, liu_xiulan).
location(zhang_wenhua, shuixiang_zhen).

%% Liu Xiulan (nee Liu, married into Zhang)
person(liu_xiulan).
first_name(liu_xiulan, 'Xiulan').
last_name(liu_xiulan, 'Liu').
full_name(liu_xiulan, 'Liu Xiulan').
gender(liu_xiulan, female).
alive(liu_xiulan).
generation(liu_xiulan, 0).
founder_family(liu_xiulan).
child(liu_xiulan, zhang_yun).
child(liu_xiulan, zhang_hao).
spouse(liu_xiulan, zhang_wenhua).
location(liu_xiulan, shuixiang_zhen).

%% Zhang Yun
person(zhang_yun).
first_name(zhang_yun, 'Yun').
last_name(zhang_yun, 'Zhang').
full_name(zhang_yun, 'Zhang Yun').
gender(zhang_yun, female).
alive(zhang_yun).
generation(zhang_yun, 1).
parent(zhang_wenhua, zhang_yun).
parent(liu_xiulan, zhang_yun).
location(zhang_yun, shuixiang_zhen).

%% Zhang Hao
person(zhang_hao).
first_name(zhang_hao, 'Hao').
last_name(zhang_hao, 'Zhang').
full_name(zhang_hao, 'Zhang Hao').
gender(zhang_hao, male).
alive(zhang_hao).
generation(zhang_hao, 1).
parent(zhang_wenhua, zhang_hao).
parent(liu_xiulan, zhang_hao).
location(zhang_hao, shuixiang_zhen).

%% ===============================================================
%% Chen Family (Doctors and Pharmacists, Shuixiang Zhen)
%% ===============================================================

%% Chen Dawei
person(chen_dawei).
first_name(chen_dawei, 'Dawei').
last_name(chen_dawei, 'Chen').
full_name(chen_dawei, 'Chen Dawei').
gender(chen_dawei, male).
alive(chen_dawei).
generation(chen_dawei, 0).
founder_family(chen_dawei).
child(chen_dawei, chen_jing).
child(chen_dawei, chen_ming).
spouse(chen_dawei, yang_lihua).
location(chen_dawei, shuixiang_zhen).

%% Yang Lihua (nee Yang, married into Chen)
person(yang_lihua).
first_name(yang_lihua, 'Lihua').
last_name(yang_lihua, 'Yang').
full_name(yang_lihua, 'Yang Lihua').
gender(yang_lihua, female).
alive(yang_lihua).
generation(yang_lihua, 0).
founder_family(yang_lihua).
child(yang_lihua, chen_jing).
child(yang_lihua, chen_ming).
spouse(yang_lihua, chen_dawei).
location(yang_lihua, shuixiang_zhen).

%% Chen Jing
person(chen_jing).
first_name(chen_jing, 'Jing').
last_name(chen_jing, 'Chen').
full_name(chen_jing, 'Chen Jing').
gender(chen_jing, female).
alive(chen_jing).
generation(chen_jing, 1).
parent(chen_dawei, chen_jing).
parent(yang_lihua, chen_jing).
location(chen_jing, shuixiang_zhen).

%% Chen Ming
person(chen_ming).
first_name(chen_ming, 'Ming').
last_name(chen_ming, 'Chen').
full_name(chen_ming, 'Chen Ming').
gender(chen_ming, male).
alive(chen_ming).
generation(chen_ming, 1).
parent(chen_dawei, chen_ming).
parent(yang_lihua, chen_ming).
location(chen_ming, shuixiang_zhen).

%% ===============================================================
%% Zhao Family (Tofu Makers, Hehua Cun)
%% ===============================================================

%% Zhao Zhonghe
person(zhao_zhonghe).
first_name(zhao_zhonghe, 'Zhonghe').
last_name(zhao_zhonghe, 'Zhao').
full_name(zhao_zhonghe, 'Zhao Zhonghe').
gender(zhao_zhonghe, male).
alive(zhao_zhonghe).
generation(zhao_zhonghe, 0).
founder_family(zhao_zhonghe).
child(zhao_zhonghe, zhao_pengfei).
child(zhao_zhonghe, zhao_lili).
spouse(zhao_zhonghe, xu_qiuying).
location(zhao_zhonghe, hehua_cun).

%% Xu Qiuying (nee Xu, married into Zhao)
person(xu_qiuying).
first_name(xu_qiuying, 'Qiuying').
last_name(xu_qiuying, 'Xu').
full_name(xu_qiuying, 'Xu Qiuying').
gender(xu_qiuying, female).
alive(xu_qiuying).
generation(xu_qiuying, 0).
founder_family(xu_qiuying).
child(xu_qiuying, zhao_pengfei).
child(xu_qiuying, zhao_lili).
spouse(xu_qiuying, zhao_zhonghe).
location(xu_qiuying, hehua_cun).

%% Zhao Pengfei
person(zhao_pengfei).
first_name(zhao_pengfei, 'Pengfei').
last_name(zhao_pengfei, 'Zhao').
full_name(zhao_pengfei, 'Zhao Pengfei').
gender(zhao_pengfei, male).
alive(zhao_pengfei).
generation(zhao_pengfei, 1).
parent(zhao_zhonghe, zhao_pengfei).
parent(xu_qiuying, zhao_pengfei).
location(zhao_pengfei, hehua_cun).

%% Zhao Lili
person(zhao_lili).
first_name(zhao_lili, 'Lili').
last_name(zhao_lili, 'Zhao').
full_name(zhao_lili, 'Zhao Lili').
gender(zhao_lili, female).
alive(zhao_lili).
generation(zhao_lili, 1).
parent(zhao_zhonghe, zhao_lili).
parent(xu_qiuying, zhao_lili).
location(zhao_lili, hehua_cun).

%% ===============================================================
%% Liu Family (Silk Workers, Hehua Cun)
%% ===============================================================

%% Liu Changming
person(liu_changming).
first_name(liu_changming, 'Changming').
last_name(liu_changming, 'Liu').
full_name(liu_changming, 'Liu Changming').
gender(liu_changming, male).
alive(liu_changming).
generation(liu_changming, 0).
founder_family(liu_changming).
child(liu_changming, liu_xiaofang).
child(liu_changming, liu_jun).
spouse(liu_changming, he_cuiping).
location(liu_changming, hehua_cun).

%% He Cuiping (nee He, married into Liu)
person(he_cuiping).
first_name(he_cuiping, 'Cuiping').
last_name(he_cuiping, 'He').
full_name(he_cuiping, 'He Cuiping').
gender(he_cuiping, female).
alive(he_cuiping).
generation(he_cuiping, 0).
founder_family(he_cuiping).
child(he_cuiping, liu_xiaofang).
child(he_cuiping, liu_jun).
spouse(he_cuiping, liu_changming).
location(he_cuiping, hehua_cun).

%% Liu Xiaofang
person(liu_xiaofang).
first_name(liu_xiaofang, 'Xiaofang').
last_name(liu_xiaofang, 'Liu').
full_name(liu_xiaofang, 'Liu Xiaofang').
gender(liu_xiaofang, female).
alive(liu_xiaofang).
generation(liu_xiaofang, 1).
parent(liu_changming, liu_xiaofang).
parent(he_cuiping, liu_xiaofang).
location(liu_xiaofang, hehua_cun).

%% Liu Jun
person(liu_jun).
first_name(liu_jun, 'Jun').
last_name(liu_jun, 'Liu').
full_name(liu_jun, 'Liu Jun').
gender(liu_jun, male).
alive(liu_jun).
generation(liu_jun, 1).
parent(liu_changming, liu_jun).
parent(he_cuiping, liu_jun).
location(liu_jun, hehua_cun).
