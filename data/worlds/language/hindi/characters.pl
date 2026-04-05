%% Insimul Characters: Hindi Town
%% Source: data/worlds/language/hindi/characters.pl
%% Created: 2026-04-03
%% Total: 24 characters (6 families)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2

%% ===============================================================
%% Sharma Family (Chai Stall Owners, Surajpur)
%% ===============================================================

%% Rajesh Sharma
person(rajesh_sharma).
first_name(rajesh_sharma, 'Rajesh').
last_name(rajesh_sharma, 'Sharma').
full_name(rajesh_sharma, 'Rajesh Sharma').
gender(rajesh_sharma, male).
alive(rajesh_sharma).
generation(rajesh_sharma, 0).
founder_family(rajesh_sharma).
child(rajesh_sharma, priya_sharma).
child(rajesh_sharma, arjun_sharma).
spouse(rajesh_sharma, sunita_sharma).
location(rajesh_sharma, surajpur).

%% Sunita Sharma
person(sunita_sharma).
first_name(sunita_sharma, 'Sunita').
last_name(sunita_sharma, 'Sharma').
full_name(sunita_sharma, 'Sunita Sharma').
gender(sunita_sharma, female).
alive(sunita_sharma).
generation(sunita_sharma, 0).
founder_family(sunita_sharma).
child(sunita_sharma, priya_sharma).
child(sunita_sharma, arjun_sharma).
spouse(sunita_sharma, rajesh_sharma).
location(sunita_sharma, surajpur).

%% Priya Sharma
person(priya_sharma).
first_name(priya_sharma, 'Priya').
last_name(priya_sharma, 'Sharma').
full_name(priya_sharma, 'Priya Sharma').
gender(priya_sharma, female).
alive(priya_sharma).
generation(priya_sharma, 1).
parent(rajesh_sharma, priya_sharma).
parent(sunita_sharma, priya_sharma).
location(priya_sharma, surajpur).

%% Arjun Sharma
person(arjun_sharma).
first_name(arjun_sharma, 'Arjun').
last_name(arjun_sharma, 'Sharma').
full_name(arjun_sharma, 'Arjun Sharma').
gender(arjun_sharma, male).
alive(arjun_sharma).
generation(arjun_sharma, 1).
parent(rajesh_sharma, arjun_sharma).
parent(sunita_sharma, arjun_sharma).
location(arjun_sharma, surajpur).

%% ===============================================================
%% Gupta Family (Kirana Store Owners, Surajpur)
%% ===============================================================

%% Vinod Gupta
person(vinod_gupta).
first_name(vinod_gupta, 'Vinod').
last_name(vinod_gupta, 'Gupta').
full_name(vinod_gupta, 'Vinod Gupta').
gender(vinod_gupta, male).
alive(vinod_gupta).
generation(vinod_gupta, 0).
founder_family(vinod_gupta).
child(vinod_gupta, neha_gupta).
child(vinod_gupta, rohit_gupta).
spouse(vinod_gupta, meena_gupta).
location(vinod_gupta, surajpur).

%% Meena Gupta
person(meena_gupta).
first_name(meena_gupta, 'Meena').
last_name(meena_gupta, 'Gupta').
full_name(meena_gupta, 'Meena Gupta').
gender(meena_gupta, female).
alive(meena_gupta).
generation(meena_gupta, 0).
founder_family(meena_gupta).
child(meena_gupta, neha_gupta).
child(meena_gupta, rohit_gupta).
spouse(meena_gupta, vinod_gupta).
location(meena_gupta, surajpur).

%% Neha Gupta
person(neha_gupta).
first_name(neha_gupta, 'Neha').
last_name(neha_gupta, 'Gupta').
full_name(neha_gupta, 'Neha Gupta').
gender(neha_gupta, female).
alive(neha_gupta).
generation(neha_gupta, 1).
parent(vinod_gupta, neha_gupta).
parent(meena_gupta, neha_gupta).
location(neha_gupta, surajpur).

%% Rohit Gupta
person(rohit_gupta).
first_name(rohit_gupta, 'Rohit').
last_name(rohit_gupta, 'Gupta').
full_name(rohit_gupta, 'Rohit Gupta').
gender(rohit_gupta, male).
alive(rohit_gupta).
generation(rohit_gupta, 1).
parent(vinod_gupta, rohit_gupta).
parent(meena_gupta, rohit_gupta).
location(rohit_gupta, surajpur).

%% ===============================================================
%% Singh Family (IT Professionals, Surajpur)
%% ===============================================================

%% Devendra Singh
person(devendra_singh).
first_name(devendra_singh, 'Devendra').
last_name(devendra_singh, 'Singh').
full_name(devendra_singh, 'Devendra Singh').
gender(devendra_singh, male).
alive(devendra_singh).
generation(devendra_singh, 0).
founder_family(devendra_singh).
child(devendra_singh, kavita_singh).
child(devendra_singh, amit_singh).
spouse(devendra_singh, anita_singh).
location(devendra_singh, surajpur).

%% Anita Singh
person(anita_singh).
first_name(anita_singh, 'Anita').
last_name(anita_singh, 'Singh').
full_name(anita_singh, 'Anita Singh').
gender(anita_singh, female).
alive(anita_singh).
generation(anita_singh, 0).
founder_family(anita_singh).
child(anita_singh, kavita_singh).
child(anita_singh, amit_singh).
spouse(anita_singh, devendra_singh).
location(anita_singh, surajpur).

%% Kavita Singh
person(kavita_singh).
first_name(kavita_singh, 'Kavita').
last_name(kavita_singh, 'Singh').
full_name(kavita_singh, 'Kavita Singh').
gender(kavita_singh, female).
alive(kavita_singh).
generation(kavita_singh, 1).
parent(devendra_singh, kavita_singh).
parent(anita_singh, kavita_singh).
location(kavita_singh, surajpur).

%% Amit Singh
person(amit_singh).
first_name(amit_singh, 'Amit').
last_name(amit_singh, 'Singh').
full_name(amit_singh, 'Amit Singh').
gender(amit_singh, male).
alive(amit_singh).
generation(amit_singh, 1).
parent(devendra_singh, amit_singh).
parent(anita_singh, amit_singh).
location(amit_singh, surajpur).

%% ===============================================================
%% Verma Family (Street Food Vendors, Surajpur)
%% ===============================================================

%% Prakash Verma
person(prakash_verma).
first_name(prakash_verma, 'Prakash').
last_name(prakash_verma, 'Verma').
full_name(prakash_verma, 'Prakash Verma').
gender(prakash_verma, male).
alive(prakash_verma).
generation(prakash_verma, 0).
founder_family(prakash_verma).
child(prakash_verma, deepa_verma).
child(prakash_verma, sanjay_verma).
spouse(prakash_verma, savitri_verma).
location(prakash_verma, surajpur).

%% Savitri Verma
person(savitri_verma).
first_name(savitri_verma, 'Savitri').
last_name(savitri_verma, 'Verma').
full_name(savitri_verma, 'Savitri Verma').
gender(savitri_verma, female).
alive(savitri_verma).
generation(savitri_verma, 0).
founder_family(savitri_verma).
child(savitri_verma, deepa_verma).
child(savitri_verma, sanjay_verma).
spouse(savitri_verma, prakash_verma).
location(savitri_verma, surajpur).

%% Deepa Verma
person(deepa_verma).
first_name(deepa_verma, 'Deepa').
last_name(deepa_verma, 'Verma').
full_name(deepa_verma, 'Deepa Verma').
gender(deepa_verma, female).
alive(deepa_verma).
generation(deepa_verma, 1).
parent(prakash_verma, deepa_verma).
parent(savitri_verma, deepa_verma).
location(deepa_verma, surajpur).

%% Sanjay Verma
person(sanjay_verma).
first_name(sanjay_verma, 'Sanjay').
last_name(sanjay_verma, 'Verma').
full_name(sanjay_verma, 'Sanjay Verma').
gender(sanjay_verma, male).
alive(sanjay_verma).
generation(sanjay_verma, 1).
parent(prakash_verma, sanjay_verma).
parent(savitri_verma, sanjay_verma).
location(sanjay_verma, surajpur).

%% ===============================================================
%% Patel Family (Dairy Farmers, Kishanpura)
%% ===============================================================

%% Ramesh Patel
person(ramesh_patel).
first_name(ramesh_patel, 'Ramesh').
last_name(ramesh_patel, 'Patel').
full_name(ramesh_patel, 'Ramesh Patel').
gender(ramesh_patel, male).
alive(ramesh_patel).
generation(ramesh_patel, 0).
founder_family(ramesh_patel).
child(ramesh_patel, pooja_patel).
child(ramesh_patel, vikram_patel).
spouse(ramesh_patel, kamla_patel).
location(ramesh_patel, kishanpura).

%% Kamla Patel
person(kamla_patel).
first_name(kamla_patel, 'Kamla').
last_name(kamla_patel, 'Patel').
full_name(kamla_patel, 'Kamla Patel').
gender(kamla_patel, female).
alive(kamla_patel).
generation(kamla_patel, 0).
founder_family(kamla_patel).
child(kamla_patel, pooja_patel).
child(kamla_patel, vikram_patel).
spouse(kamla_patel, ramesh_patel).
location(kamla_patel, kishanpura).

%% Pooja Patel
person(pooja_patel).
first_name(pooja_patel, 'Pooja').
last_name(pooja_patel, 'Patel').
full_name(pooja_patel, 'Pooja Patel').
gender(pooja_patel, female).
alive(pooja_patel).
generation(pooja_patel, 1).
parent(ramesh_patel, pooja_patel).
parent(kamla_patel, pooja_patel).
location(pooja_patel, kishanpura).

%% Vikram Patel
person(vikram_patel).
first_name(vikram_patel, 'Vikram').
last_name(vikram_patel, 'Patel').
full_name(vikram_patel, 'Vikram Patel').
gender(vikram_patel, male).
alive(vikram_patel).
generation(vikram_patel, 1).
parent(ramesh_patel, vikram_patel).
parent(kamla_patel, vikram_patel).
location(vikram_patel, kishanpura).

%% ===============================================================
%% Mishra Family (Sweet Shop Owners, Surajpur)
%% ===============================================================

%% Suresh Mishra
person(suresh_mishra).
first_name(suresh_mishra, 'Suresh').
last_name(suresh_mishra, 'Mishra').
full_name(suresh_mishra, 'Suresh Mishra').
gender(suresh_mishra, male).
alive(suresh_mishra).
generation(suresh_mishra, 0).
founder_family(suresh_mishra).
child(suresh_mishra, ritu_mishra).
child(suresh_mishra, manish_mishra).
spouse(suresh_mishra, geeta_mishra).
location(suresh_mishra, surajpur).

%% Geeta Mishra
person(geeta_mishra).
first_name(geeta_mishra, 'Geeta').
last_name(geeta_mishra, 'Mishra').
full_name(geeta_mishra, 'Geeta Mishra').
gender(geeta_mishra, female).
alive(geeta_mishra).
generation(geeta_mishra, 0).
founder_family(geeta_mishra).
child(geeta_mishra, ritu_mishra).
child(geeta_mishra, manish_mishra).
spouse(geeta_mishra, suresh_mishra).
location(geeta_mishra, surajpur).

%% Ritu Mishra
person(ritu_mishra).
first_name(ritu_mishra, 'Ritu').
last_name(ritu_mishra, 'Mishra').
full_name(ritu_mishra, 'Ritu Mishra').
gender(ritu_mishra, female).
alive(ritu_mishra).
generation(ritu_mishra, 1).
parent(suresh_mishra, ritu_mishra).
parent(geeta_mishra, ritu_mishra).
location(ritu_mishra, surajpur).

%% Manish Mishra
person(manish_mishra).
first_name(manish_mishra, 'Manish').
last_name(manish_mishra, 'Mishra').
full_name(manish_mishra, 'Manish Mishra').
gender(manish_mishra, male).
alive(manish_mishra).
generation(manish_mishra, 1).
parent(suresh_mishra, manish_mishra).
parent(geeta_mishra, manish_mishra).
location(manish_mishra, surajpur).
