%% Insimul Characters: Urban Fantasy -- Veilhaven
%% Source: data/worlds/urban_fantasy/characters.pl
%% Created: 2026-04-03
%% Total: 20 characters (5 factions)
%%
%% Predicate schema:
%%   person/1, first_name/2, last_name/2, full_name/2
%%   gender/2, alive/1, generation/2, founder_family/1
%%   parent/2, child/2, spouse/2, location/2
%%   faction/2, species/2, occupation/2

%% ═══════════════════════════════════════════════════════════
%% Seelie Court (Fae nobility, The Eventide nightclub)
%% ═══════════════════════════════════════════════════════════

%% Rowan Ashwood -- Seelie Court Ambassador
person(rowan_ashwood).
first_name(rowan_ashwood, 'Rowan').
last_name(rowan_ashwood, 'Ashwood').
full_name(rowan_ashwood, 'Rowan Ashwood').
gender(rowan_ashwood, male).
alive(rowan_ashwood).
generation(rowan_ashwood, 0).
founder_family(rowan_ashwood).
species(rowan_ashwood, fae).
faction(rowan_ashwood, seelie_court).
occupation(rowan_ashwood, ambassador).
location(rowan_ashwood, veilhaven).

%% Ivy Ashwood -- Seelie Court Healer
person(ivy_ashwood).
first_name(ivy_ashwood, 'Ivy').
last_name(ivy_ashwood, 'Ashwood').
full_name(ivy_ashwood, 'Ivy Ashwood').
gender(ivy_ashwood, female).
alive(ivy_ashwood).
generation(ivy_ashwood, 0).
founder_family(ivy_ashwood).
species(ivy_ashwood, fae).
faction(ivy_ashwood, seelie_court).
occupation(ivy_ashwood, healer).
spouse(ivy_ashwood, rowan_ashwood).
location(ivy_ashwood, veilhaven).

%% Briar Ashwood -- Half-fae bartender at The Eventide
person(briar_ashwood).
first_name(briar_ashwood, 'Briar').
last_name(briar_ashwood, 'Ashwood').
full_name(briar_ashwood, 'Briar Ashwood').
gender(briar_ashwood, nonbinary).
alive(briar_ashwood).
generation(briar_ashwood, 1).
species(briar_ashwood, half_fae).
faction(briar_ashwood, seelie_court).
occupation(briar_ashwood, bartender).
parent(rowan_ashwood, briar_ashwood).
parent(ivy_ashwood, briar_ashwood).
location(briar_ashwood, veilhaven).

%% Thistle Moonshadow -- Seelie Court Spy
person(thistle_moonshadow).
first_name(thistle_moonshadow, 'Thistle').
last_name(thistle_moonshadow, 'Moonshadow').
full_name(thistle_moonshadow, 'Thistle Moonshadow').
gender(thistle_moonshadow, female).
alive(thistle_moonshadow).
generation(thistle_moonshadow, 0).
species(thistle_moonshadow, fae).
faction(thistle_moonshadow, seelie_court).
occupation(thistle_moonshadow, informant).
location(thistle_moonshadow, hollowmere).

%% ═══════════════════════════════════════════════════════════
%% Unseelie Court (Dark Fae, The Black Thorn bar)
%% ═══════════════════════════════════════════════════════════

%% Morrigan Blackthorn -- Unseelie Court Leader
person(morrigan_blackthorn).
first_name(morrigan_blackthorn, 'Morrigan').
last_name(morrigan_blackthorn, 'Blackthorn').
full_name(morrigan_blackthorn, 'Morrigan Blackthorn').
gender(morrigan_blackthorn, female).
alive(morrigan_blackthorn).
generation(morrigan_blackthorn, 0).
founder_family(morrigan_blackthorn).
species(morrigan_blackthorn, fae).
faction(morrigan_blackthorn, unseelie_court).
occupation(morrigan_blackthorn, court_leader).
location(morrigan_blackthorn, veilhaven).

%% Cade Nightfall -- Unseelie Enforcer
person(cade_nightfall).
first_name(cade_nightfall, 'Cade').
last_name(cade_nightfall, 'Nightfall').
full_name(cade_nightfall, 'Cade Nightfall').
gender(cade_nightfall, male).
alive(cade_nightfall).
generation(cade_nightfall, 0).
species(cade_nightfall, fae).
faction(cade_nightfall, unseelie_court).
occupation(cade_nightfall, enforcer).
location(cade_nightfall, veilhaven).

%% ═══════════════════════════════════════════════════════════
%% Docklands Pack (Werewolf pack, Salt and Anchor pub)
%% ═══════════════════════════════════════════════════════════

%% Marcus Reyes -- Pack Alpha, Werewolf Detective
person(marcus_reyes).
first_name(marcus_reyes, 'Marcus').
last_name(marcus_reyes, 'Reyes').
full_name(marcus_reyes, 'Marcus Reyes').
gender(marcus_reyes, male).
alive(marcus_reyes).
generation(marcus_reyes, 0).
founder_family(marcus_reyes).
species(marcus_reyes, werewolf).
faction(marcus_reyes, docklands_pack).
occupation(marcus_reyes, detective).
location(marcus_reyes, veilhaven).

%% Elena Reyes -- Pack Beta, Harbor Patrol
person(elena_reyes).
first_name(elena_reyes, 'Elena').
last_name(elena_reyes, 'Reyes').
full_name(elena_reyes, 'Elena Reyes').
gender(elena_reyes, female).
alive(elena_reyes).
generation(elena_reyes, 0).
founder_family(elena_reyes).
species(elena_reyes, werewolf).
faction(elena_reyes, docklands_pack).
occupation(elena_reyes, harbor_patrol).
spouse(elena_reyes, marcus_reyes).
location(elena_reyes, veilhaven).

%% Jake Reyes -- Young werewolf, university student
person(jake_reyes).
first_name(jake_reyes, 'Jake').
last_name(jake_reyes, 'Reyes').
full_name(jake_reyes, 'Jake Reyes').
gender(jake_reyes, male).
alive(jake_reyes).
generation(jake_reyes, 1).
species(jake_reyes, werewolf).
faction(jake_reyes, docklands_pack).
occupation(jake_reyes, student).
parent(marcus_reyes, jake_reyes).
parent(elena_reyes, jake_reyes).
location(jake_reyes, veilhaven).

%% Nadia Volkov -- Pack enforcer, bouncer at Salt and Anchor
person(nadia_volkov).
first_name(nadia_volkov, 'Nadia').
last_name(nadia_volkov, 'Volkov').
full_name(nadia_volkov, 'Nadia Volkov').
gender(nadia_volkov, female).
alive(nadia_volkov).
generation(nadia_volkov, 0).
species(nadia_volkov, werewolf).
faction(nadia_volkov, docklands_pack).
occupation(nadia_volkov, bouncer).
location(nadia_volkov, veilhaven).

%% ═══════════════════════════════════════════════════════════
%% Aldermere Conclave (Vampires, Silver Heights)
%% ═══════════════════════════════════════════════════════════

%% Victor Aldermere -- Vampire Elder, City Councilman
person(victor_aldermere).
first_name(victor_aldermere, 'Victor').
last_name(victor_aldermere, 'Aldermere').
full_name(victor_aldermere, 'Victor Aldermere').
gender(victor_aldermere, male).
alive(victor_aldermere).
generation(victor_aldermere, 0).
founder_family(victor_aldermere).
species(victor_aldermere, vampire).
faction(victor_aldermere, aldermere_conclave).
occupation(victor_aldermere, politician).
location(victor_aldermere, veilhaven).

%% Seraphina Aldermere -- Vampire, Art Gallery Owner
person(seraphina_aldermere).
first_name(seraphina_aldermere, 'Seraphina').
last_name(seraphina_aldermere, 'Aldermere').
full_name(seraphina_aldermere, 'Seraphina Aldermere').
gender(seraphina_aldermere, female).
alive(seraphina_aldermere).
generation(seraphina_aldermere, 0).
founder_family(seraphina_aldermere).
species(seraphina_aldermere, vampire).
faction(seraphina_aldermere, aldermere_conclave).
occupation(seraphina_aldermere, gallery_owner).
spouse(seraphina_aldermere, victor_aldermere).
location(seraphina_aldermere, veilhaven).

%% Damien Cross -- Vampire, Night Lawyer
person(damien_cross).
first_name(damien_cross, 'Damien').
last_name(damien_cross, 'Cross').
full_name(damien_cross, 'Damien Cross').
gender(damien_cross, male).
alive(damien_cross).
generation(damien_cross, 0).
species(damien_cross, vampire).
faction(damien_cross, aldermere_conclave).
occupation(damien_cross, lawyer).
location(damien_cross, veilhaven).

%% Lila Vasquez -- Recently turned vampire, conflicted
person(lila_vasquez).
first_name(lila_vasquez, 'Lila').
last_name(lila_vasquez, 'Vasquez').
full_name(lila_vasquez, 'Lila Vasquez').
gender(lila_vasquez, female).
alive(lila_vasquez).
generation(lila_vasquez, 1).
species(lila_vasquez, vampire).
faction(lila_vasquez, aldermere_conclave).
occupation(lila_vasquez, journalist).
location(lila_vasquez, veilhaven).

%% ═══════════════════════════════════════════════════════════
%% Unaffiliated / Human Practitioners
%% ═══════════════════════════════════════════════════════════

%% Helena Voss -- Fortune Teller, Human Witch
person(helena_voss).
first_name(helena_voss, 'Helena').
last_name(helena_voss, 'Voss').
full_name(helena_voss, 'Helena Voss').
gender(helena_voss, female).
alive(helena_voss).
generation(helena_voss, 0).
founder_family(helena_voss).
species(helena_voss, human).
faction(helena_voss, unaffiliated).
occupation(helena_voss, fortune_teller).
location(helena_voss, veilhaven).

%% Ezra Cole -- Occult Bookshop Owner, Hedge Mage
person(ezra_cole).
first_name(ezra_cole, 'Ezra').
last_name(ezra_cole, 'Cole').
full_name(ezra_cole, 'Ezra Cole').
gender(ezra_cole, male).
alive(ezra_cole).
generation(ezra_cole, 0).
species(ezra_cole, human).
faction(ezra_cole, unaffiliated).
occupation(ezra_cole, bookshop_owner).
location(ezra_cole, veilhaven).

%% Dr. Sable Okonkwo -- University Professor, Supernatural Anthropologist
person(sable_okonkwo).
first_name(sable_okonkwo, 'Sable').
last_name(sable_okonkwo, 'Okonkwo').
full_name(sable_okonkwo, 'Sable Okonkwo').
gender(sable_okonkwo, female).
alive(sable_okonkwo).
generation(sable_okonkwo, 0).
species(sable_okonkwo, human).
faction(sable_okonkwo, unaffiliated).
occupation(sable_okonkwo, professor).
location(sable_okonkwo, veilhaven).

%% Kai Chen -- Pharmacy Owner, Potion Brewer
person(kai_chen).
first_name(kai_chen, 'Kai').
last_name(kai_chen, 'Chen').
full_name(kai_chen, 'Kai Chen').
gender(kai_chen, male).
alive(kai_chen).
generation(kai_chen, 0).
species(kai_chen, human).
faction(kai_chen, unaffiliated).
occupation(kai_chen, pharmacist).
location(kai_chen, veilhaven).

%% Nyx -- Underreach Market Dealer, Unknown Species
person(nyx).
first_name(nyx, 'Nyx').
last_name(nyx, '').
full_name(nyx, 'Nyx').
gender(nyx, nonbinary).
alive(nyx).
generation(nyx, 0).
species(nyx, unknown).
faction(nyx, unaffiliated).
occupation(nyx, black_market_dealer).
location(nyx, underreach).
