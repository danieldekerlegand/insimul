%% Ensemble History: Urban Fantasy -- Veilhaven Initial World State
%% Source: data/worlds/urban_fantasy/history.pl
%% Created: 2026-04-03
%% Timestep: 0 (initial state)
%%
%% Categories: trait, attribute, relationship, status

%% ─── Rowan Ashwood ───
trait(rowan_ashwood, male).
trait(rowan_ashwood, diplomatic).
trait(rowan_ashwood, patient).
trait(rowan_ashwood, ancient).
attribute(rowan_ashwood, charisma, 85).
attribute(rowan_ashwood, magical_power, 90).
attribute(rowan_ashwood, propriety, 80).
attribute(rowan_ashwood, cunningness, 70).

%% ─── Ivy Ashwood ───
trait(ivy_ashwood, female).
trait(ivy_ashwood, nurturing).
trait(ivy_ashwood, perceptive).
trait(ivy_ashwood, ancient).
attribute(ivy_ashwood, charisma, 75).
attribute(ivy_ashwood, magical_power, 85).
attribute(ivy_ashwood, propriety, 75).
relationship(ivy_ashwood, rowan_ashwood, married).

%% ─── Briar Ashwood ───
trait(briar_ashwood, nonbinary).
trait(briar_ashwood, young).
trait(briar_ashwood, rebellious).
trait(briar_ashwood, charming).
attribute(briar_ashwood, charisma, 80).
attribute(briar_ashwood, magical_power, 50).
attribute(briar_ashwood, cunningness, 65).
relationship(briar_ashwood, rowan_ashwood, child_of).
relationship(briar_ashwood, ivy_ashwood, child_of).

%% ─── Thistle Moonshadow ───
trait(thistle_moonshadow, female).
trait(thistle_moonshadow, secretive).
trait(thistle_moonshadow, observant).
trait(thistle_moonshadow, cautious).
attribute(thistle_moonshadow, charisma, 60).
attribute(thistle_moonshadow, magical_power, 70).
attribute(thistle_moonshadow, cunningness, 90).

%% ─── Morrigan Blackthorn ───
trait(morrigan_blackthorn, female).
trait(morrigan_blackthorn, ruthless).
trait(morrigan_blackthorn, charismatic).
trait(morrigan_blackthorn, ancient).
attribute(morrigan_blackthorn, charisma, 90).
attribute(morrigan_blackthorn, magical_power, 95).
attribute(morrigan_blackthorn, cunningness, 85).
attribute(morrigan_blackthorn, propriety, 40).
relationship(morrigan_blackthorn, rowan_ashwood, rival).

%% ─── Cade Nightfall ───
trait(cade_nightfall, male).
trait(cade_nightfall, aggressive).
trait(cade_nightfall, loyal).
trait(cade_nightfall, intimidating).
attribute(cade_nightfall, charisma, 55).
attribute(cade_nightfall, magical_power, 75).
attribute(cade_nightfall, cunningness, 60).
relationship(cade_nightfall, morrigan_blackthorn, subordinate).

%% ─── Marcus Reyes ───
trait(marcus_reyes, male).
trait(marcus_reyes, protective).
trait(marcus_reyes, disciplined).
trait(marcus_reyes, middle_aged).
attribute(marcus_reyes, charisma, 70).
attribute(marcus_reyes, physical_power, 90).
attribute(marcus_reyes, cunningness, 65).
attribute(marcus_reyes, propriety, 70).
status(marcus_reyes, pack_alpha).

%% ─── Elena Reyes ───
trait(elena_reyes, female).
trait(elena_reyes, strategic).
trait(elena_reyes, fierce).
trait(elena_reyes, middle_aged).
attribute(elena_reyes, charisma, 65).
attribute(elena_reyes, physical_power, 85).
attribute(elena_reyes, cunningness, 75).
relationship(elena_reyes, marcus_reyes, married).
status(elena_reyes, pack_beta).

%% ─── Jake Reyes ───
trait(jake_reyes, male).
trait(jake_reyes, young).
trait(jake_reyes, impulsive).
trait(jake_reyes, curious).
attribute(jake_reyes, charisma, 65).
attribute(jake_reyes, physical_power, 60).
attribute(jake_reyes, cunningness, 45).
relationship(jake_reyes, marcus_reyes, child_of).
relationship(jake_reyes, elena_reyes, child_of).

%% ─── Nadia Volkov ───
trait(nadia_volkov, female).
trait(nadia_volkov, stoic).
trait(nadia_volkov, territorial).
trait(nadia_volkov, loyal).
attribute(nadia_volkov, charisma, 50).
attribute(nadia_volkov, physical_power, 88).
attribute(nadia_volkov, cunningness, 55).
relationship(nadia_volkov, marcus_reyes, subordinate).

%% ─── Victor Aldermere ───
trait(victor_aldermere, male).
trait(victor_aldermere, calculating).
trait(victor_aldermere, sophisticated).
trait(victor_aldermere, ancient).
attribute(victor_aldermere, charisma, 95).
attribute(victor_aldermere, cunningness, 90).
attribute(victor_aldermere, propriety, 85).
attribute(victor_aldermere, magical_power, 60).
status(victor_aldermere, city_councilman).

%% ─── Seraphina Aldermere ───
trait(seraphina_aldermere, female).
trait(seraphina_aldermere, artistic).
trait(seraphina_aldermere, perceptive).
trait(seraphina_aldermere, ancient).
attribute(seraphina_aldermere, charisma, 85).
attribute(seraphina_aldermere, cunningness, 80).
attribute(seraphina_aldermere, propriety, 75).
relationship(seraphina_aldermere, victor_aldermere, married).

%% ─── Damien Cross ───
trait(damien_cross, male).
trait(damien_cross, meticulous).
trait(damien_cross, amoral).
trait(damien_cross, eloquent).
attribute(damien_cross, charisma, 80).
attribute(damien_cross, cunningness, 85).
attribute(damien_cross, propriety, 70).
relationship(damien_cross, victor_aldermere, subordinate).

%% ─── Lila Vasquez ───
trait(lila_vasquez, female).
trait(lila_vasquez, young).
trait(lila_vasquez, conflicted).
trait(lila_vasquez, determined).
attribute(lila_vasquez, charisma, 70).
attribute(lila_vasquez, cunningness, 60).
attribute(lila_vasquez, self_assuredness, 45).
relationship(lila_vasquez, victor_aldermere, reluctant_subordinate).

%% ─── Helena Voss ───
trait(helena_voss, female).
trait(helena_voss, mysterious).
trait(helena_voss, empathic).
trait(helena_voss, middle_aged).
attribute(helena_voss, charisma, 75).
attribute(helena_voss, magical_power, 65).
attribute(helena_voss, cunningness, 70).

%% ─── Ezra Cole ───
trait(ezra_cole, male).
trait(ezra_cole, scholarly).
trait(ezra_cole, cautious).
trait(ezra_cole, middle_aged).
attribute(ezra_cole, charisma, 60).
attribute(ezra_cole, magical_power, 55).
attribute(ezra_cole, cultural_knowledge, 95).

%% ─── Sable Okonkwo ───
trait(sable_okonkwo, female).
trait(sable_okonkwo, analytical).
trait(sable_okonkwo, brave).
trait(sable_okonkwo, middle_aged).
attribute(sable_okonkwo, charisma, 70).
attribute(sable_okonkwo, cultural_knowledge, 90).
attribute(sable_okonkwo, cunningness, 55).

%% ─── Kai Chen ───
trait(kai_chen, male).
trait(kai_chen, meticulous).
trait(kai_chen, pragmatic).
trait(kai_chen, middle_aged).
attribute(kai_chen, charisma, 55).
attribute(kai_chen, magical_power, 45).
attribute(kai_chen, cultural_knowledge, 70).

%% ─── Nyx ───
trait(nyx, nonbinary).
trait(nyx, enigmatic).
trait(nyx, shrewd).
trait(nyx, ageless).
attribute(nyx, charisma, 75).
attribute(nyx, cunningness, 95).
attribute(nyx, magical_power, 40).

%% ─── Faction Relationships ───
relationship(rowan_ashwood, morrigan_blackthorn, rival).
relationship(rowan_ashwood, victor_aldermere, uneasy_ally).
relationship(rowan_ashwood, marcus_reyes, respectful).
relationship(morrigan_blackthorn, victor_aldermere, distrustful).
relationship(marcus_reyes, victor_aldermere, wary).
relationship(marcus_reyes, rowan_ashwood, respectful).
relationship(victor_aldermere, helena_voss, patron).
relationship(ezra_cole, sable_okonkwo, colleague).
relationship(ezra_cole, helena_voss, old_friend).
relationship(nyx, morrigan_blackthorn, business).
relationship(nyx, victor_aldermere, business).
