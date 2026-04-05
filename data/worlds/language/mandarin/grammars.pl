%% Insimul Grammars (Tracery): Mandarin Watertown
%% Source: data/worlds/language/mandarin/grammars.pl
%% Created: 2026-04-03
%% Total: 3 grammars
%%
%% Predicate schema:
%%   grammar/2 -- grammar(AtomId, Name)
%%   grammar_description/2
%%   grammar_rule/3 -- grammar_rule(GrammarAtom, RuleKey, Expansion)

%% Chinese Character Names
grammar(chinese_character_names, 'chinese_character_names').
grammar_description(chinese_character_names, 'Authentic Chinese name generation for a contemporary Jiangnan water town. Names follow modern Chinese conventions with family name first.').
grammar_rule(chinese_character_names, origin, '#familyName# #givenName#').
grammar_rule(chinese_character_names, givenname, '#maleName#').
grammar_rule(chinese_character_names, givenname, '#femaleName#').
grammar_rule(chinese_character_names, malename, 'Guoqiang').
grammar_rule(chinese_character_names, malename, 'Jianguo').
grammar_rule(chinese_character_names, malename, 'Wenhua').
grammar_rule(chinese_character_names, malename, 'Dawei').
grammar_rule(chinese_character_names, malename, 'Zhonghe').
grammar_rule(chinese_character_names, malename, 'Changming').
grammar_rule(chinese_character_names, malename, 'Lei').
grammar_rule(chinese_character_names, malename, 'Wei').
grammar_rule(chinese_character_names, malename, 'Hao').
grammar_rule(chinese_character_names, malename, 'Ming').
grammar_rule(chinese_character_names, malename, 'Pengfei').
grammar_rule(chinese_character_names, malename, 'Jun').
grammar_rule(chinese_character_names, malename, 'Haoran').
grammar_rule(chinese_character_names, malename, 'Zixin').
grammar_rule(chinese_character_names, malename, 'Yichen').
grammar_rule(chinese_character_names, femalename, 'Fanghua').
grammar_rule(chinese_character_names, femalename, 'Yumei').
grammar_rule(chinese_character_names, femalename, 'Xiulan').
grammar_rule(chinese_character_names, femalename, 'Lihua').
grammar_rule(chinese_character_names, femalename, 'Qiuying').
grammar_rule(chinese_character_names, femalename, 'Cuiping').
grammar_rule(chinese_character_names, femalename, 'Meiling').
grammar_rule(chinese_character_names, femalename, 'Na').
grammar_rule(chinese_character_names, femalename, 'Yun').
grammar_rule(chinese_character_names, femalename, 'Jing').
grammar_rule(chinese_character_names, femalename, 'Lili').
grammar_rule(chinese_character_names, femalename, 'Xiaofang').
grammar_rule(chinese_character_names, femalename, 'Ruoxi').
grammar_rule(chinese_character_names, femalename, 'Yutong').
grammar_rule(chinese_character_names, femalename, 'Xinyi').
grammar_rule(chinese_character_names, familyname, 'Wang').
grammar_rule(chinese_character_names, familyname, 'Li').
grammar_rule(chinese_character_names, familyname, 'Zhang').
grammar_rule(chinese_character_names, familyname, 'Liu').
grammar_rule(chinese_character_names, familyname, 'Chen').
grammar_rule(chinese_character_names, familyname, 'Zhao').
grammar_rule(chinese_character_names, familyname, 'Sun').
grammar_rule(chinese_character_names, familyname, 'Zhou').
grammar_rule(chinese_character_names, familyname, 'Yang').
grammar_rule(chinese_character_names, familyname, 'Xu').
grammar_rule(chinese_character_names, familyname, 'He').
grammar_rule(chinese_character_names, familyname, 'Huang').

%% Chinese Place Names
grammar(chinese_place_names, 'chinese_place_names').
grammar_description(chinese_place_names, 'Generation of Chinese-style place names for streets, bridges, and landmarks.').
grammar_rule(chinese_place_names, origin, '#placeQuality# #placeType#').
grammar_rule(chinese_place_names, placetype, 'Lu').
grammar_rule(chinese_place_names, placetype, 'Jie').
grammar_rule(chinese_place_names, placetype, 'Xiang').
grammar_rule(chinese_place_names, placetype, 'Qiao').
grammar_rule(chinese_place_names, placetype, 'Yuan').
grammar_rule(chinese_place_names, placequality, 'Heping').
grammar_rule(chinese_place_names, placequality, 'Zhongshan').
grammar_rule(chinese_place_names, placequality, 'Xinhua').
grammar_rule(chinese_place_names, placequality, 'Renmin').
grammar_rule(chinese_place_names, placequality, 'Jiefang').
grammar_rule(chinese_place_names, placequality, 'Heqiao').
grammar_rule(chinese_place_names, placequality, 'Qingshi').
grammar_rule(chinese_place_names, placequality, 'Yuanlin').

%% Chinese Business Names
grammar(chinese_business_names, 'chinese_business_names').
grammar_description(chinese_business_names, 'Generation of Chinese-style business names for shops, restaurants, and teahouses.').
grammar_rule(chinese_business_names, origin, '#businessQuality# #businessType#').
grammar_rule(chinese_business_names, businesstype, 'Chaguan').
grammar_rule(chinese_business_names, businesstype, 'Fandian').
grammar_rule(chinese_business_names, businesstype, 'Shangdian').
grammar_rule(chinese_business_names, businesstype, 'Shudian').
grammar_rule(chinese_business_names, businesstype, 'Yaodian').
grammar_rule(chinese_business_names, businesstype, 'Mian Guan').
grammar_rule(chinese_business_names, businessquality, 'Lao').
grammar_rule(chinese_business_names, businessquality, 'Xin').
grammar_rule(chinese_business_names, businessquality, 'Mingqian').
grammar_rule(chinese_business_names, businessquality, 'Baohe').
grammar_rule(chinese_business_names, businessquality, 'Lianhua').
grammar_rule(chinese_business_names, businessquality, 'Hehua').
