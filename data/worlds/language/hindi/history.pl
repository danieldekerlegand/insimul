%% Ensemble History: Hindi Town -- Initial World State
%% Source: data/worlds/language/hindi/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status, language

%% --- Rajesh Sharma ---
trait(rajesh_sharma, male).
trait(rajesh_sharma, hospitable).
trait(rajesh_sharma, generous).
trait(rajesh_sharma, traditional).
trait(rajesh_sharma, middle_aged).
attribute(rajesh_sharma, charisma, 75).
attribute(rajesh_sharma, cultural_knowledge, 85).
attribute(rajesh_sharma, propriety, 70).
language_proficiency(rajesh_sharma, hindi, 95).
language_proficiency(rajesh_sharma, english, 30).

%% --- Sunita Sharma ---
trait(sunita_sharma, female).
trait(sunita_sharma, nurturing).
trait(sunita_sharma, wise).
trait(sunita_sharma, community_minded).
attribute(sunita_sharma, charisma, 70).
attribute(sunita_sharma, cultural_knowledge, 90).
attribute(sunita_sharma, propriety, 80).
relationship(sunita_sharma, rajesh_sharma, married).
language_proficiency(sunita_sharma, hindi, 95).
language_proficiency(sunita_sharma, english, 20).

%% --- Priya Sharma ---
trait(priya_sharma, female).
trait(priya_sharma, young).
trait(priya_sharma, ambitious).
trait(priya_sharma, tech_savvy).
attribute(priya_sharma, charisma, 65).
attribute(priya_sharma, cunningness, 50).
attribute(priya_sharma, self_assuredness, 70).
language_proficiency(priya_sharma, hindi, 90).
language_proficiency(priya_sharma, english, 75).

%% --- Arjun Sharma ---
trait(arjun_sharma, male).
trait(arjun_sharma, young).
trait(arjun_sharma, athletic).
trait(arjun_sharma, social).
attribute(arjun_sharma, charisma, 70).
attribute(arjun_sharma, self_assuredness, 65).
attribute(arjun_sharma, sensitiveness, 50).
language_proficiency(arjun_sharma, hindi, 88).
language_proficiency(arjun_sharma, english, 60).

%% --- Vinod Gupta ---
trait(vinod_gupta, male).
trait(vinod_gupta, shrewd).
trait(vinod_gupta, experienced).
trait(vinod_gupta, merchant).
trait(vinod_gupta, middle_aged).
attribute(vinod_gupta, charisma, 75).
attribute(vinod_gupta, cunningness, 80).
attribute(vinod_gupta, cultural_knowledge, 70).
relationship(vinod_gupta, rajesh_sharma, friends).
language_proficiency(vinod_gupta, hindi, 95).
language_proficiency(vinod_gupta, english, 35).

%% --- Meena Gupta ---
trait(meena_gupta, female).
trait(meena_gupta, organized).
trait(meena_gupta, warm).
trait(meena_gupta, practical).
attribute(meena_gupta, charisma, 65).
attribute(meena_gupta, propriety, 75).
attribute(meena_gupta, cultural_knowledge, 80).
relationship(meena_gupta, vinod_gupta, married).
relationship(meena_gupta, sunita_sharma, friends).
language_proficiency(meena_gupta, hindi, 93).
language_proficiency(meena_gupta, english, 25).

%% --- Neha Gupta ---
trait(neha_gupta, female).
trait(neha_gupta, young).
trait(neha_gupta, studious).
trait(neha_gupta, idealistic).
attribute(neha_gupta, charisma, 60).
attribute(neha_gupta, cultural_knowledge, 65).
attribute(neha_gupta, self_assuredness, 55).
relationship(neha_gupta, kavita_singh, friends).
language_proficiency(neha_gupta, hindi, 92).
language_proficiency(neha_gupta, english, 80).

%% --- Rohit Gupta ---
trait(rohit_gupta, male).
trait(rohit_gupta, young).
trait(rohit_gupta, entrepreneurial).
trait(rohit_gupta, energetic).
attribute(rohit_gupta, charisma, 70).
attribute(rohit_gupta, cunningness, 60).
attribute(rohit_gupta, self_assuredness, 65).
language_proficiency(rohit_gupta, hindi, 88).
language_proficiency(rohit_gupta, english, 55).

%% --- Devendra Singh ---
trait(devendra_singh, male).
trait(devendra_singh, educated).
trait(devendra_singh, formal).
trait(devendra_singh, intellectual).
trait(devendra_singh, middle_aged).
attribute(devendra_singh, charisma, 80).
attribute(devendra_singh, cultural_knowledge, 75).
attribute(devendra_singh, propriety, 85).
language_proficiency(devendra_singh, hindi, 95).
language_proficiency(devendra_singh, english, 85).

%% --- Anita Singh ---
trait(anita_singh, female).
trait(anita_singh, articulate).
trait(anita_singh, passionate).
trait(anita_singh, modern).
attribute(anita_singh, charisma, 85).
attribute(anita_singh, cultural_knowledge, 70).
attribute(anita_singh, self_assuredness, 80).
relationship(anita_singh, devendra_singh, married).
language_proficiency(anita_singh, hindi, 93).
language_proficiency(anita_singh, english, 80).

%% --- Kavita Singh ---
trait(kavita_singh, female).
trait(kavita_singh, young).
trait(kavita_singh, creative).
trait(kavita_singh, independent).
attribute(kavita_singh, charisma, 70).
attribute(kavita_singh, self_assuredness, 65).
attribute(kavita_singh, sensitiveness, 60).
relationship(kavita_singh, priya_sharma, friends).
language_proficiency(kavita_singh, hindi, 90).
language_proficiency(kavita_singh, english, 75).

%% --- Amit Singh ---
trait(amit_singh, male).
trait(amit_singh, young).
trait(amit_singh, rebellious).
trait(amit_singh, musical).
attribute(amit_singh, charisma, 65).
attribute(amit_singh, self_assuredness, 55).
attribute(amit_singh, sensitiveness, 70).
relationship(amit_singh, sanjay_verma, friends).
language_proficiency(amit_singh, hindi, 88).
language_proficiency(amit_singh, english, 65).

%% --- Prakash Verma ---
trait(prakash_verma, male).
trait(prakash_verma, hardworking).
trait(prakash_verma, cheerful).
trait(prakash_verma, storyteller).
trait(prakash_verma, middle_aged).
attribute(prakash_verma, charisma, 70).
attribute(prakash_verma, cultural_knowledge, 75).
attribute(prakash_verma, propriety, 55).
language_proficiency(prakash_verma, hindi, 95).
language_proficiency(prakash_verma, english, 15).

%% --- Savitri Verma ---
trait(savitri_verma, female).
trait(savitri_verma, resilient).
trait(savitri_verma, resourceful).
trait(savitri_verma, community_minded).
attribute(savitri_verma, charisma, 60).
attribute(savitri_verma, propriety, 70).
attribute(savitri_verma, cultural_knowledge, 75).
relationship(savitri_verma, prakash_verma, married).
language_proficiency(savitri_verma, hindi, 93).
language_proficiency(savitri_verma, english, 10).

%% --- Deepa Verma ---
trait(deepa_verma, female).
trait(deepa_verma, young).
trait(deepa_verma, curious).
trait(deepa_verma, cheerful).
attribute(deepa_verma, charisma, 70).
attribute(deepa_verma, sensitiveness, 60).
attribute(deepa_verma, self_assuredness, 45).
relationship(deepa_verma, ritu_mishra, friends).
language_proficiency(deepa_verma, hindi, 90).
language_proficiency(deepa_verma, english, 40).

%% --- Sanjay Verma ---
trait(sanjay_verma, male).
trait(sanjay_verma, young).
trait(sanjay_verma, restless).
trait(sanjay_verma, ambitious).
attribute(sanjay_verma, charisma, 60).
attribute(sanjay_verma, self_assuredness, 50).
attribute(sanjay_verma, cunningness, 45).
language_proficiency(sanjay_verma, hindi, 88).
language_proficiency(sanjay_verma, english, 45).

%% --- Ramesh Patel ---
trait(ramesh_patel, male).
trait(ramesh_patel, patient).
trait(ramesh_patel, traditional).
trait(ramesh_patel, proud).
trait(ramesh_patel, middle_aged).
attribute(ramesh_patel, charisma, 60).
attribute(ramesh_patel, cultural_knowledge, 85).
attribute(ramesh_patel, propriety, 70).
relationship(ramesh_patel, prakash_verma, friends).
language_proficiency(ramesh_patel, hindi, 95).
language_proficiency(ramesh_patel, english, 10).

%% --- Kamla Patel ---
trait(kamla_patel, female).
trait(kamla_patel, gentle).
trait(kamla_patel, herbalist).
trait(kamla_patel, observant).
attribute(kamla_patel, charisma, 55).
attribute(kamla_patel, cultural_knowledge, 85).
attribute(kamla_patel, propriety, 75).
relationship(kamla_patel, ramesh_patel, married).
language_proficiency(kamla_patel, hindi, 93).
language_proficiency(kamla_patel, english, 5).

%% --- Pooja Patel ---
trait(pooja_patel, female).
trait(pooja_patel, young).
trait(pooja_patel, determined).
trait(pooja_patel, nature_loving).
attribute(pooja_patel, charisma, 55).
attribute(pooja_patel, self_assuredness, 60).
attribute(pooja_patel, sensitiveness, 65).
language_proficiency(pooja_patel, hindi, 90).
language_proficiency(pooja_patel, english, 35).

%% --- Vikram Patel ---
trait(vikram_patel, male).
trait(vikram_patel, young).
trait(vikram_patel, quiet).
trait(vikram_patel, dutiful).
attribute(vikram_patel, charisma, 45).
attribute(vikram_patel, propriety, 65).
attribute(vikram_patel, cultural_knowledge, 60).
language_proficiency(vikram_patel, hindi, 90).
language_proficiency(vikram_patel, english, 25).

%% --- Suresh Mishra ---
trait(suresh_mishra, male).
trait(suresh_mishra, jovial).
trait(suresh_mishra, caring).
trait(suresh_mishra, respected).
trait(suresh_mishra, middle_aged).
attribute(suresh_mishra, charisma, 80).
attribute(suresh_mishra, cultural_knowledge, 80).
attribute(suresh_mishra, propriety, 75).
relationship(suresh_mishra, vinod_gupta, friends).
language_proficiency(suresh_mishra, hindi, 95).
language_proficiency(suresh_mishra, english, 25).

%% --- Geeta Mishra ---
trait(geeta_mishra, female).
trait(geeta_mishra, elegant).
trait(geeta_mishra, devotional).
trait(geeta_mishra, cultured).
attribute(geeta_mishra, charisma, 75).
attribute(geeta_mishra, cultural_knowledge, 90).
attribute(geeta_mishra, sensitiveness, 70).
relationship(geeta_mishra, suresh_mishra, married).
language_proficiency(geeta_mishra, hindi, 95).
language_proficiency(geeta_mishra, english, 20).

%% --- Ritu Mishra ---
trait(ritu_mishra, female).
trait(ritu_mishra, young).
trait(ritu_mishra, diligent).
trait(ritu_mishra, kind).
attribute(ritu_mishra, charisma, 60).
attribute(ritu_mishra, propriety, 70).
attribute(ritu_mishra, cultural_knowledge, 65).
relationship(ritu_mishra, neha_gupta, friends).
language_proficiency(ritu_mishra, hindi, 92).
language_proficiency(ritu_mishra, english, 60).

%% --- Manish Mishra ---
trait(manish_mishra, male).
trait(manish_mishra, young).
trait(manish_mishra, artistic).
trait(manish_mishra, quiet).
attribute(manish_mishra, charisma, 55).
attribute(manish_mishra, cultural_knowledge, 60).
attribute(manish_mishra, sensitiveness, 75).
language_proficiency(manish_mishra, hindi, 90).
language_proficiency(manish_mishra, english, 50).
