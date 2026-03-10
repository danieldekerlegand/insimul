Scriptname GameManagerScript extends ObjectReference  



CIFRPG20 npcscript
Actor[] Initiator
Actor[] TargetAux
Actor[] Target
String[] option
Int current
bool clearing
Int started
Int stack
Int currentquest_time
int current_aux
Int npclikedpresent
Quest Property SocialMoveFlirt auto
Quest Property SocialMoveInsult auto
Quest Property SocialMoveShareFeelings auto
Quest Property SocialMoveCompliment auto
Quest Property SocialMoveAskOut auto
Quest Property SocialMoveFight auto
Quest Property SocialMoveInsultOtherNPC auto
FormList Property BoozeList Auto
FormList Property DaggerList Auto
FormList Property HeallingPotionsList Auto
FormList Property SoulGemList Auto
ObjectReference Property Riverwood Auto
Quest current_quest
Quest aux_current_quest
Actor aux_initiator
Actor aux_target
Int queststarted;
Int social_value_initiator_target
Int social_value_target_initiator
String[] Romantic_CKB
String[] CKB
Actor[] CKB_Actors
String gift_to_offer
int time_manager
Actor speaker
bool pause
bool terminated_by_Time

Actor[] RomanticNetwork
Actor[] RomanticNetwork2

Actor[] BuddyNetwork
Actor[] InitializedNPCs
Actor[] BuddyNetwork2
 
Int initialized_count



Event onInit()
pause = false
int i = 0
current = 1
stack = 0
npclikedpresent = 0
current_aux = 0
started = 0
gift_to_offer = ""
 queststarted = 0
Romantic_CKB = new String[2]
Romantic_CKB[0] = "Book"
Romantic_CKB[1] = "Soul Gem"
terminated_by_Time = false
Initiator = new Actor[11]
Target = new Actor[11]
TargetAux = new Actor[11]
Option = new String[11]
InitializedNPCs = new Actor[10]
RomanticNetwork = new Actor[5]
RomanticNetwork2 = new Actor[5]
initialized_count = 0
clearing = false
current_quest = SocialMoveHello
initialized_count = 0
time_manager = 0

BuddyNetwork = new Actor[5]
BuddyNetwork2 = new Actor[5]

social_value_initiator_target = 0
social_value_target_initiator = 0
currentquest_time = 0

;SocialQuestScriptedEventStart.Start()
Utility.wait(10)
Update()
RegisterForUpdate(5)
endEvent


;Event OnUpdateGameTime()
 ;     if( Riverwood.CanFastTravelToMarker() == True)
;	  Debug.Notification(" Started")
;          SocialQuestScriptedEventStart.Start()
;      Else
;          RegisterForSingleUpdateGameTime(1)
;      Endif
;EndEvent

Function GMgo(CIFRPG20 s)
npcscript = s

;Debug.Notification("Pushing: " + s .getOption()  + " Target is " +s.getTarget().getActorBase().GetName())
push()
endFunction

Function GMPause()
pause = true
endFunction

Function GMUnPause()
pause = false
endFunction


Function push()


Initiator[stack] =  npcscript.getInitiator()
Target[stack]=  npcscript.getTarget()

option[stack] = npcscript.getOption() 
 if(option[stack] == "insultothernpc")
ObjectReference targ =  target[stack]
CIFRPG20 targ_Script = targ as CIFRPG20
Actor target_aux = npcscript.getMostLikedNPC(initiator[stack])
TargetAux[stack] = target_aux
endif 
if(stack == 10)
stack = 0
else
stack = stack + 1
endif
;Debug.Notification("GameManager " +  getOption() + " Initiator " + getInitiator().getActorBase().GetName() + " Target: " + getTarget().getActorBase().GetName() + " current: "  + current )

endFunction



Event OnUpdate()
GameManagerUpdateManager()
endEvent

Event OnLocationChange(Location akOldLoc, Location akNewLoc)

if(option[0] != "")
Debug.TraceUser("myUserLog", "Game Manager: location changed " + " \n")
ClearGMQueue()
endif
endEvent

Function setSpeaker(Actor spek)
speaker = spek
endFunction


Actor Function getSpeaker()
return speaker
endFunction

int function likedPresent()
int aux = npclikedpresent
npclikedpresent = 0
return aux
endFunction


CIFRPG20 Function getSpeakerScript()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
return cif_script
endFunction

Function Update()
String print = ""
String print2 = ""




If(getInitiator() && getTarget()  && !pause)



if(current_quest)
ReferenceAlias toPrint = current_quest.getAliasByName("Initiator") as ReferenceAlias
if(toPrint.getActorReference())
 print = toPrint.getActorReference().getActorBase().GetName()
 endif
ReferenceAlias toPrint2 = current_quest.getAliasByName("Target") as ReferenceAlias
if(toPrint2.getActorReference())
 print2 = toPrint2.getActorReference().getActorBase().GetName()
 endif
 endif
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "Game Manager: option: " + getOption() +" Initiator " + getInitiator().getActorBase().getName() +  " target " + getTarget().getactorbase().getname() + " Current Quest completed? " + current_quest.isCompleted() + " CurrentQuestStage " + current_quest.getStage() + " CurrentQuestName: " + current_quest.getName()+ "  CurrentQuestInitiator: " + print + " CurrentQuestTarget: " + print2 + " currentquest_time: " + currentquest_time + " \n") 
Debug.TraceUser("myUserLog", "Game Manager: queue " + option  +  " current: " + current + " \n")


if( currentquest_time >= 1 && current_quest.getStage() == 0)
current_quest.setStage(20)
endif

;Debug.Notification("Game Manager: option: " + getOption() + " target " + getTarget().getactorbase().getname()) 
if(getOption() == "flirt" && current_aux != current)

current_quest = SocialMoveFlirt
currentquest_time = 0
current_aux = current
current_quest.Start()
current_quest.SetStage(20)
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName()  + " Current Quest Stage " + current_quest.getStage() + " \n" + "\n")

else

if(getOption() == "insult" && current_aux != current)

current_quest = SocialMoveInsult
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else

if(getOption() == "breakup" && current_aux != current)

current_quest = SocialMoveBreakUp
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else

if(getOption() == "insultothernpc" && current_aux != current)
current_quest = SocialMoveInsultOtherNPC
currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else


if(getOption() == "compliment" && current_aux != current)
current_quest = SocialMoveCompliment

currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else


if(getOption() == "fight" && current_aux != current)
current_quest = SocialMoveFight

currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() +  " \n" + "\n")

else


if(getOption() == "askout" && current_aux != current)
current_quest = SocialMoveAskOut

currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else

if(getOption() == "embarass" && current_aux != current)
current_quest = SocialMoveEmbarass

currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n" + "\n")

else


if(getOption() == "sharefeelings" && current_aux != current)
current_quest = SocialMoveShareFeelings

currentquest_time = 0
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName()  + " \n" + "\n")

else

if(getOption() == "offerromanticgift" && current_aux != current)
current_quest = SocialMoveOfferGift  

currentquest_time = 0
gift_to_offer = Romantic_CKB[Utility.RandomInt(0,1)]
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName()  + " \n" + "\n")

else

if(getOption() == "offergift" && current_aux != current)
current_quest = SocialMoveOfferGift  

currentquest_time = 0
gift_to_offer = "Book"
current_quest.Start()
current_quest.SetStage(20)
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName()  + " \n" + "\n")

else
if(getOption() == "hello" && current_aux != current)
SocialMoveHello.reset()

current_quest = SocialMoveHello
current_quest.Start()
if(getInitiator().getRelationShipRank(getTarget()) != 0)
current_quest.SetStage(30)
else
current_quest.SetStage(20)
endif
current_aux = current
aux_current_quest = current_quest
aux_initiator = getInitiator()
aux_target = getTarget()
Debug.TraceUser("myUserLog", "Game Manager: Launched Quest " + getOption()   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName()  + " \n" + "\n")


endif
endif
endif
endif
endif
endif
endif
endif
endif
endif
endif
endif


if(aux_current_quest == current_quest && aux_initiator == getInitiator() && aux_target == getTarget())
currentquest_time = currentquest_time + 1
;Debug.OpenUserLog("myUserLog")
;Debug.TraceUser("myUserLog", "Game Manager: time " + currentquest_time   + " CurrentInitiator " + aux_initiator.getActorBase().getName()+ " Current Target " + aux_target.getActorBase().getName() + " \n")

if(currentquest_time >= 8 || (currentquest_time >= 3 && current_quest.getStage() == 0))
Debug.TraceUser("myUserLog", "Game Manager: quest terminated by time " + current_quest.getName() + "current_quest_time " + currentquest_time + " \n"  + " \n")
terminated_by_Time = true
current_quest.SetStage(40)
current_quest.Stop()
currentquest_time = 0
endif
endif

started = 1
;RegisterForUpdateGameTime(1.0)
endif
endFunction

Function SetLikedPresent(int value)
;Debug.Notification("Present value: " + value)
;Debug.TraceUser("myUserLog", "Game Manager: PresentValue " + value + " \n")
npclikedpresent = value
endFunction

Actor Function getInitiator()

int i = current - 1
return Initiator[i]

endFunction

String Function getOption()
int i = current - 1
return Option[i]
endFunction




Actor Function getTarget()
int i = current - 1
return Target[i]
endFunction

Actor Function getTargetAux()
int i = current - 1
return TargetAux[i]
endFunction


Function GameManagerUpdateManager()
if(time_manager == 0)
Update()
time_manager = 1
else 
time_manager = 0
endif
endFunction



Function ClearGMQueue()

clearing = true
int i = 0
current = 1
stack = 0
current_aux = 0
started = 0
gift_to_offer = ""
Initiator = new Actor[11]
Target = new Actor[11]
TargetAux = new Actor[11]
Option = new String[11]
InitializedNPCs = new Actor[10]
initialized_count = 0
SocialMovePlayerDialogue.Stop()
SocialMovePlayerDialogue.setStage(0)
current_quest = SocialMoveHello
current_quest.setstage(0)
initialized_count = 0
time_manager = 0

social_value_initiator_target = 0
social_value_target_initiator = 0
currentquest_time = 0
Debug.TraceUser("myUserLog", "Game Manager: cleared queue " + option  + " \n")
Utility.wait(10)

Update()
RegisterForUpdate(5)

endFunction


Function successfulQuest(String q, Actor i, Actor t, int _result)
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "Game Manager: successful quest " + q   + " Initiator " + i.getActorBase().getName()+ " Target " + t.getActorBase().getName()  + " \n")
started = 0


ObjectReference init = i
CIFRPG20 init_Script = init as CIFRPG20
CIFRPG20 targ_Script
if(t != game.getPlayer())
ObjectReference targ = t
targ_Script = targ as CIFRPG20
targ_Script.SucessfulQuest(q, i, t, _result)
endif

init_Script.SucessfulQuest(q, i, t, _result)

if(t != game.getPlayer())
if(init_Script.getFriendshipGoalValue(t) > 5 && targ_Script.getFriendshipGoalValue(i) > 5 && init_Script.getFriendshipBeliefValue(t) > 5 && init_Script.getFriendshipBeliefValue(t) > 5 && !AreFriends(i,t) && !AreLovers(i,t))
setBuddies(i,t)
endif
else
if(init_Script.getFriendshipGoalValue(t) > 5 && init_Script.getFriendshipBeliefValue(t) > 5 && !AreLovers(i,t))
setBuddies(i,t)
endif
endif

if(t != game.getPlayer())
if(init_Script.getFriendshipGoalValue(t) < -5 && targ_Script.getFriendshipGoalValue(i) < -5 && init_Script.getFriendshipBeliefValue(t) < -5 && init_Script.getFriendshipBeliefValue(t) < -5 && !AreEnemies(i,t))
setEnemies(i,t)
endif
else
if(init_Script.getFriendshipGoalValue(t) < -5 && init_Script.getFriendshipBeliefValue(t) < -5)
setEnemies(i,t)
endif
endif

if(q == "breakup")
i.setRelationshipRank(t, -2)
t.setRelationshipRank(i, -2)
BreakUp(i,t)
endif

if( ( i.getActorBase().getName() == "Tom" || i.getActorBase().getName() == "Sarah")  &&  ( t.getActorBase().getName() == "Tom" || t.getActorBase().getName() == "Sarah") &&  q == "breakup")

SocialMoveStartScriptedHelpJames.setStage(30)
endif


if(current == 11)
current = 1
else
current = current + 1

endif
current_quest.Stop()
currentquest_time = 0
time_manager = 1

Utility.Wait(6)


Update()
endFunction


bool function isInStringList(String n, String[] in)
int i = 0
int go = in.length
while i < go
if(in[i])
	if( in[i] == n)
	return true
	endif
else 
return false
endif
i = i + 1
endwhile
return false
endFunction


bool function HasTrait(String stat, Actor a)
bool ret = false
ObjectReference act = a
CIFRPG20 actor_Script = act as CIFRPG20
ret = actor_Script.HasTrait(stat)
return ret
endFunction

String Function getGiftToOffer()
return gift_to_offer
endFunction


Function setBuddies(Actor one, Actor two)
one.setRelationshipRank(two, 3)
two.setRelationshipRank(one, 3)
int j = 0
while (BuddyNetwork[j])
j = j + 1
endwhile
BuddyNetwork[j] = one
BuddyNetwork2[j] = two
Debug.Notification(one.getActorBase().getName()+ " and " + two.getActorBase().getName()  + " became allies " )
endFunction

Function setEnemies(Actor one, Actor two)
one.setRelationshipRank(two, -3)
two.setRelationshipRank(one, -3)

Debug.Notification(one.getActorBase().getName()+ " and " + two.getActorBase().getName()  + " became enemies " )
endFunction

Function setLovers(Actor one, Actor two)
one.setRelationshipRank(two, 4)
two.setRelationshipRank(one, 4)
int j = 0
while (RomanticNetwork[j])
j = j + 1
endwhile
RomanticNetwork[j] = one
RomanticNetwork2[j] = two


Debug.TraceUser("myUserLog", "Game Manager: Became lovers " + one.getActorBase().getName()+ "  " + two.getActorBase().getName()  + "\n")
if(one.getActorBase().getName() != "Tom" && two.getActorBase().getName() != "Tom" )
Debug.Notification(one.getActorBase().getName()+ " and " + two.getActorBase().getName()  + " became lovers " )
endif
PartiallyCleanQueue()
endFunction


Actor[] Function getBuddy(Actor a)

Actor[] ret = new Actor[5]
int curr = 0

int j = 0

while (BuddyNetwork[j] && BuddyNetwork2[j])
	
	
	if(BuddyNetwork[j]  == a)
		ret[curr] = BuddyNetwork2[j]
		curr = curr + 1
	endif

	if(BuddyNetwork2[j]  == a)
		ret[curr] = BuddyNetwork[j]
		curr = curr + 1
	endif
endwhile
return ret
endFunction


Function SetInitialized(Actor NPC)

;Debug.Notification(" Initializing " + NPC.getActorBase().getName() + " find result " + InitializedNPCs.Find(NPC) + " NPCs list" +  InitializedNPCs)
if(InitializedNPCs.Find(NPC) == -1) 
int i = InitializedNPCs.Find(none)
InitializedNPCs[i] = NPC
initialized_Count = initialized_count + 1
endif
;Debug.Notification(" Initialized " + NPC.getActorBase().getName() + " initialized_Count " +  initialized_count  )
endFunction 


Actor Function getTheLover(Actor a)

Actor[] ret = new Actor[5]
int curr = 0

int j = 0

while (RomanticNetwork[j] && RomanticNetwork2[j])
	
	
	if(RomanticNetwork[j]  == a)
		ret[curr] = RomanticNetwork2[j]
		return ret[curr]
	endif

	if(RomanticNetwork2[j]  == a)
		ret[curr] = RomanticNetwork[j]
		return ret[curr]
	endif
	j = j + 1
endwhile
return ret[curr]
endFunction



int function get_social_value_initiator_target()
return social_value_initiator_target
endFunction

int function get_social_value_target_initiator()
return social_value_target_initiator
endFunction




Function failedQuest(String q, Actor i, Actor t, int _result)
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "Game Manager: failed quest " + q   + " Initiator " + i.getActorBase().getName()+ " Target " + t.getActorBase().getName()  + " \n")

if(i != None && t != None )
started = 0

ObjectReference init = i
CIFRPG20 init_Script = init as CIFRPG20
ObjectReference targ = t
CIFRPG20 targ_Script = targ as CIFRPG20

if(terminated_by_Time || clearing )
_result = -20
terminated_by_Time = false
clearing = false
endif



init_Script.FailedQuest(q, i, t, _result)
if(t != Game.GetPlayer())
targ_Script.FailedQuest(q, i, t, _result)
endif
if(current == 11)
current = 1
else
current = current + 1
endif

currentquest_time = 0

time_manager = 1
current_quest.Stop()

endif
Utility.Wait(6)



Update()
endFunction


int Function AreLovers(Actor a, Actor b)
if(a.GetRelationshipRank(b) == 4 && getTheLover(a) == b)
;Debug.Notification("returning 1 " + a.getActorBase().getName() + "  " + b.getActorBase().getName()  )
return 1
else
if(a.GetHighestRelationshipRank() == 4)
;Debug.Notification("returning -1 " + a.getActorBase().getName() + "  " + b.getActorBase().getName()  )
return -1
else
;Debug.Notification("returning 0 " + a.getActorBase().getName() + "  " + b.getActorBase().getName()  )
 return 0
endif
endif
return 0
endFunction

bool Function AreFriends(Actor a, Actor b)
if(a.GetRelationshipRank(b) >= 2)
return true
else
return false
endif
endFunction

bool Function AreEnemies(Actor a, Actor b)
if(a.GetRelationshipRank(b) <= -3)
return true
else
return false
endif
endFunction

Function LaunchQuest(String questname, Actor _initiator, Actor _target)
PartiallyCleanQueue()

Initiator[stack] =  _initiator
Target[stack]=  _target
option[stack] = questname

if(stack == 10)
stack = 0
else
stack = stack + 1
endif

time_manager = 1
Update()
endFunction


Function PartiallyCleanQueue()

clearing = true
int i = 0
current = 1
stack = 0
current_aux = 0
current_quest.stop()
current_quest.start()
started = 0
gift_to_offer = ""
Initiator = new Actor[11]
Target = new Actor[11]
TargetAux = new Actor[11]
Option = new String[11]
int index = 0


while InitializedNPCs[index]
if(!InitializedNPCs[index].isDead())
ObjectReference aux = InitializedNPCs[index]
CIFRPG20 aux_Script = aux as CIFRPG20
aux_Script.setNextMove(true)
endif
index = index + 1
endwhile


InitializedNPCs = new Actor[10]
initialized_count = 0

current_quest = SocialMoveHello
current_quest.setstage(0)
initialized_count = 0
time_manager = 0

social_value_initiator_target = 0
social_value_target_initiator = 0
currentquest_time = 0


Update()
RegisterForUpdate(5)

EndFunction

Function PlayerHelpedActor(Actor a)
ObjectReference aux = a as ObjectReference
CIFRPG20 aux_Script = aux as CIFRPG20
aux_Script.PlayerHelpedActor()
endFunction

int Function ResponderRules(String a, Actor _init, Actor _resp)

ObjectReference targ = _resp
CIFRPG20 responder_Script = targ as CIFRPG20
if(GetTarget() != Game.GetPlayer())
return responder_Script.ResponderInfluenceRules(a,_init)
else 
return 0
endif
endFunction

FormList Function getPresentList(String list)
if(list == "potions")
return HeallingPotionsList
else
if(list == "daggers")
return DaggerList
else
if(list == "booze")
return BoozeList
else
if(list == "soulgem")
return SoulGemList
endif
endif
endif
endif
endFunction

Function BreakUp(Actor one, Actor two)

Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "Game Manager: breaking up: " + one.getActorBase().getName() + " and " + two.getActorBase().getName()  + " \n")

int curr = 0

int j = 0

while (RomanticNetwork[j] && RomanticNetwork2[j])
	
	
	if(RomanticNetwork[j]  == one)
		
	if(RomanticNetwork2[j]  == two)
		RomanticNetwork[j] = None
		RomanticNetwork2[j] = None

		endif
	endif
	
	if(RomanticNetwork2[j]  == one)
		
	if(RomanticNetwork[j]  == two)
		RomanticNetwork[j] =None
		RomanticNetwork2[j] =None
		endif
	endif
	j = j + 1
endwhile

one.setRelationshipRank(two, -2)
two.setRelationshipRank(one, -2)

if(SocialQuestScriptedEventStart.getStage() == 70 && (one.getActorBase().getName() == "Tom" || one.getActorBase().getName() == "Sarah"))
SocialQuestScriptedEventStart.setStage(100)
endif
endFunction


Function RIP(Actor dead, Actor killer)

if(GetTheLover(dead) != None)
Actor two = GetTheLover(dead) 
BreakUp(dead, two)
ObjectReference victim = two as ObjectReference
CIFRPG20 victim_script = victim as CIFRPG20
victim_script.KilledMyLover(killer)
endif



PartiallyCleanQueue()

endFunction


Function PlayerDialogueEnded()
SocialMovePlayerDialogue.stop()
SocialMovePlayerDialogue.start()

endFunction


Quest Property SocialMoveOfferGift  Auto  

Quest Property SocialMoveBlame  Auto  

Quest Property SocialMoveEmbarass  Auto 

Quest Property SocialMoveBreakUp  Auto  

Quest Property SocialQuestScriptedEventStart  Auto  

Quest Property SocialMovePlayerDialogue  Auto  

Quest Property SocialMoveHello  Auto  

Quest Property SocialMoveStartScriptedHelpJames  Auto  
