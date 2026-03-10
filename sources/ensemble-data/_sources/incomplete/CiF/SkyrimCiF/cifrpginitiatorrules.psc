Scriptname CIFRPGInitiatorRules extends ObjectReference  



String name
Int npc
Int attraction_goal
Int attraction_belief
Int attraction
Int friendship
Int friend_goal
Int friend_belief
String[] traits
String[] status
String[] Actions
CIFRPG20 Target_script
Actor target
Actor myself
; lovers = 1 they are lovers = -1 has a different lover
int lovers 
bool friends
bool has_embarrassing
bool angryAt
Int volition_value
String previous_action
int know_each_other
int isDating


EvenT onLoad()

name = ""
npc = 0
attraction_goal = 0
attraction_belief = 0
attraction = 0
friend_goal = 0
friend_belief = 0
friendship = 0
previous_action = ""
know_each_other = -1
isDating = 0


Actions = new String[13]

Actions[0] = "flirt"
Actions[1] = "offerromanticgift"
Actions[2] = "sharefeelings"
Actions[3] = "askout"
Actions[4] = "compliment"
Actions[5] = "offergift"
Actions[6] = "insult"
Actions[7] = "embarass"
Actions[8] = "fight"
Actions[9] = "insultothernpc"
Actions[10] = "breakup"
Actions[11] = "hello"


friends = false
lovers = 0
angryAt = false

volition_value = 0


endEvent


Int Function GetVolitionValue()
return volition_value
endFunction

String function CalculateInitiatorVolitions( int _attraction_goal, int _attraction_belief, int _friendgoal, int _friendbelief, String[] _traits, String[] _status, int _lovers, bool _friends, bool _angryAt, String[] _Actions , String _previous_action, Actor _target, Actor _myself, Int _Attraction, int _friendship,  int _isDating)



int  i = 0
previous_action = _previous_action
lovers = _lovers
friends = _friends
attraction_goal = _attraction_goal
attraction_belief = _attraction_belief
friend_goal = _friendgoal
friend_belief = _friendbelief
angryAt = _angryAt
traits = _traits
status = _status
Actions = _Actions
target = _target
Myself = _myself
attraction = _attraction
friendship = _friendship
isDating = _isDating
ObjectReference aux = target as ObjectReference
Target_script = aux as CIFRPG20


Int[] return_values = new Int[13]

while i < 13
return_values[i] = CalculateVolition(Actions[i])
i = i + 1
endwhile
;Debug.MessageBox("Me: " + " volition values " + return_values)

;Debug.TraceUser("myUserLog", "traits" + traits +  " volition values " + return_values + " \n")


int ind = getBiggestVolitionIndex(return_values)
volition_value = return_values[ind]

Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "volitions value" + return_values + " action: " + Actions[ind] +  " \n")
return Actions[ind]
endFunction


Int Function CalculateVolition(String a)

name = a
int ret = -1

if((attraction == 0 )&& (friend_goal == 0) && attraction_goal == 0 && friendship == 0)
return 0
else


if(a == "flirt")
ret = CalculateVolitionFlirt()
if(previous_action == "flirt")
ret = ret - 5
endif
return ret
endif 
if( a == "offerromanticgift")
ret = CalculateVolitionRomanticGift() - 5
if(previous_action == "offerromanticgift")
ret = ret - 5
endif
return ret
endif 
if( a == "askout")
ret = CalculateVolitionAskOut()
if(previous_action == "askout")
ret = ret - 5
endif
return ret
endif  
if( a == "sharefeelings")
ret = CalculateVolitionShareFeelings()
if(previous_action == "sharefeelings")
ret = ret - 5
endif
return ret
endif 
if( a == "compliment")
ret = CalculateVolitionCompliment()
if(previous_action == "compliment")
ret = ret - 5
endif
return ret
endif 
if( a == "offergift")
ret = CalculateVolitionOfferGift() - 5
if(previous_action == "offergift")
ret = ret - 5
endif
return ret
endif 
if( a == "insult")
ret = CalculateVolitionInsult()
if(previous_action == "insult")
ret = ret - 4
endif
return ret
endif  
if( a == "embarass")
ret = CalculateVolitionEmbarass()
if(previous_action == "embarass")
ret = ret - 5
endif
return ret
endif 
if( a == "breakup")
ret = CalculateVolitionBreakUp()
if(previous_action == "breakup")
ret = ret - 10
endif
return ret
endif

if( a == "fight")
ret = CalculateVolitionFight()
if(previous_action == "fight")
ret = ret - 5
endif
return ret
endif
if( a == "insultothernpc")
ret = CalculateVolitionInsultOtherNPC()
if(previous_action == "insultothernpc")
ret = ret - 5
endif
return ret
endif

if( a == "hello")
ret = CalculateVolitionHello()
return ret
endif


return ret
endif
endFunction

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;ROMANTIC GIFT;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

int Function CalculateVolitionRomanticGift()



int sum = attraction

if( attraction_goal <= attraction_belief && isDating != 1 && lovers != 1)
return 0
endif



if(lovers == 1 || isDating == 1)

	sum = sum + 3

else

if(lovers == 0)

if(attraction_belief > 5)
sum = sum + 3
else
if(attraction_goal > 5)
sum = sum + 4
else
sum = sum + 2
endif
endif

else

if(lovers == -1 || isDating == -1)

if(attraction_belief > 5)
sum = sum - 4
else
sum = sum - 2
endif
endif
endif
endif



if(friendship >= 0)
sum = sum + 1
else
if(friendship < 0 && -5 < friendship)
sum = sum - 1
else
if(friendship <= -5)
sum = sum - 2
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum - 2
endif
if(isInStringList("Friendly", traits))
sum = sum + 2
endif
if(isInStringList("Charming", traits))
sum = sum + 2
endif
if(isInStringList("Shy", traits))
sum = sum - 2
endif

if(isInStringList("Embarrassed", status))
sum  = sum - 2
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif
if(isInStringList("Angry", status))
sum  = sum - 2
endif



return sum 
 
endFunction

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; FLIRT  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


int Function CalculateVolitionFlirt()

int sum = attraction

if( attraction_goal <= attraction_belief && isDating != 1 && lovers != 1)
return 0
endif


if(lovers == 1|| isDating == 1)

	sum = sum + 2

else

if(lovers == 0)

if(attraction_belief > 5)
sum = sum + 3
else
sum = sum + 4
endif

else

if(lovers == -1 || isDating == -1)

if(attraction_belief > 5)
sum = sum - 6
else
sum = sum - 4
endif
endif
endif
endif



if(friendship >= 0)
sum = sum + 1
else
if(friendship < 0 && -5 < friendship)
sum = sum - 1
else
if(friendship <= -5)
sum = sum - 2
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum - 2
endif
if(isInStringList("Friendly", traits))
sum = sum + 2
endif
if(isInStringList("Charming", traits))
sum = sum + 2
endif
if(isInStringList("Shy", traits))
sum = sum - 2
endif

if(isInStringList("Embarrassed", status))
sum  = sum - 2
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif
if(isInStringList("Angry", status))
sum  = sum - 2
endif


return sum 
endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; ASK OUT  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


int Function CalculateVolitionAskOut()

if(attraction_goal >= 5 && attraction_belief >= 5 && attraction >=5 && lovers == 0 && isDating == 0)
return 10
else
return 0
endif
 
endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; SHARE FEELINGS  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
 
int Function CalculateVolitionShareFeelings()
int sum = 0

if(attraction_goal >= 8 && attraction_belief >= 8 && attraction >= 8 && lovers == 0 && isDating == 1)
return 10
else
return 0
endif
 
endFunction

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; COMPLIMENT  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


int Function CalculateVolitionCompliment()
int sum = friendship

if(friend_goal <= friend_belief)
return 0
endif

if(attraction > 0 )
sum = sum + 1
else
if(attraction < 0 )
if(lovers == 0)
sum = sum - 2
endif
endif
endif




if(isInStringList("Hostile", traits))
sum = sum - 2
endif
if(isInStringList("Friendly", traits))
sum = sum + 2
endif
if(isInStringList("Charming", traits))
sum = sum + 1
endif

if(isInStringList("Shy", traits))
sum = sum - 1
endif

if(isInStringList("Embarrassed", status))
sum  = sum - 1
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif

if(angryAt)
sum = sum - 4
endif

return sum 


endFunction


int Function CalculateVolitionOfferGift()
int sum = 0

if(friend_goal <= friend_belief)
return 0
endif

if(attraction >= 0 )
sum = sum + 1
else
if(attraction < 0 )
if(lovers == 0)
sum = sum - 1 
endif
endif
endif

if(friendship > 0)
sum = sum + 2
else
if(friendship < 0 && -5 < friendship)
sum = sum - 2
else
if(friendship <= -5)
sum = sum - 4
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum - 2
endif
if(isInStringList("Friendly", traits))
sum = sum + 2
endif
if(isInStringList("Charming", traits))
sum = sum + 1
endif
if(isInStringList("Attractive", traits))
sum = sum + 0
endif
if(isInStringList("Ugly", traits))
sum = sum - 1
endif
if(isInStringList("Shy", traits))
sum = sum - 1
endif

if(angryAt)
sum = sum - 1
endif

if(isInStringList("Embarrassed", status))
sum  = sum - 1
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif
if(isInStringList("Angry", status))
sum  = sum - 2
endif

return sum 

endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; INSULT  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


int Function CalculateVolitionInsult()
int sum = 0

if(friend_goal >= friend_belief && friendship > -5)
return 0 
endif

if(attraction  > 5)

sum = sum - 2

else

if(attraction  <= 5 && attraction > 0 )

sum = sum - 1

else

if(attraction <= 0 && attraction > -5)

if(lovers == 1)
sum = sum - 2
else
sum = sum + 2
endif

else
if(attraction <= -5)
sum = sum + 3
endif
endif
endif
endif


;Debug.Notification("insult: friends " + sum)
if(friendship > 0)
;Debug.Notification("insult: friend goal >0  " + sum)
if(friends)

sum = sum - 4
else
sum = sum - 2
endif
else
if(friendship <= 0 && -5 < friendship)
;Debug.Notification("insult: friend goal betweem -5 and 0  " + sum)
if(friend_belief < 0)
sum = sum + 4
else
sum = sum + 2
;Debug.Notification("insult: else " + sum)
endif
else
if(friendship <= -5)
sum = sum + 4
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum + 2
endif
if(isInStringList("Friendly", traits))
sum = sum - 2
endif
if(isInStringList("Charming", traits))
sum = sum - 2
endif

if(isInStringList("Shy", traits))
sum = sum - 2
endif

if(angryAt)
sum = sum + 3
endif

if(isInStringList("Embarrassed", status))
sum  = sum + 1
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif
;Debug.Notification("insult: final " + sum)
return sum 
endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; INSULT OTHER NPC  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

int Function CalculateVolitionInsultOtherNPC()
int sum = -friendship

if(friend_goal >= friend_belief)
return 0
endif

if(lovers != -1 || friends != -1)
return 0 
else 

if(attraction  > 5)

if(lovers == -1)
sum = sum + 4
else
sum = sum - 4
endif
else

if(attraction  <= 5 && attraction > 0 )

sum = sum - 1

else

if(attraction < 0 && attraction > -5)

if(lovers == 1)
sum = sum - 2
else
sum = sum + 2
endif

else
if(attraction <= -5)
sum = sum + 2
endif
endif
endif
endif

if(friendship > 0)
if(friends)
sum = sum - 4
else
sum = sum - 2
endif

endif


if(isInStringList("Hostile", traits))
sum = sum + 2
endif
if(isInStringList("Friendly", traits))
sum = sum - 2
endif
if(isInStringList("Charming", traits))
sum = sum - 2
endif
if(isInStringList("Shy", traits))
sum = sum - 2
endif

if(angryAt)
sum = sum + 5
endif

if(isInStringList("Embarrassed", status))
sum  = sum + 1
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif

return sum 
endif
endFunction



;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; EMBARASS ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


int Function CalculateVolitionEmbarass()
int sum = 0

if(friend_goal >= friend_belief)
return 0
endif

if(Target != Game.GetPlayer())
ObjectReference temporary = Target
CIFRPG20 temporary2 = temporary as CIFRPG20

if(temporary2.findEmbarrassment() != -1 && temporary2.getEmbarrassingMoveTarget() != myself)


sum = sum + 2

if(attraction  > 5)

sum = sum - 2

else

if(attraction  <= 5 && attraction > 0 )

sum = sum - 1

else

if(attraction < 0 && attraction > -5)
if(lovers != 1)
sum = sum - 1
else
sum = sum + 1
endif
else
if(attraction <= -5)
sum = sum + 2
endif
endif
endif
endif

if(friendship > 0)
if(friends)
sum = sum - 4
else
sum = sum - 2
endif
else
if(friendship < 0 && -5 < friendship)
sum = sum + 2
else
if(friendship <= -5)
sum = sum + 4
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum + 2
endif
if(isInStringList("Friendly", traits))
sum = sum - 1
endif
if(isInStringList("Charming", traits))
sum = sum - 1
endif
if(isInStringList("Attractive", traits))
sum = sum - 1
endif
if(isInStringList("Ugly", traits))
sum = sum + 1
endif
if(isInStringList("Shy", traits))
sum = sum - 1
endif

if(angryAt)
sum = sum - 1
endif

if(isInStringList("Embarrassed", status))
sum  = sum + 1
endif
if(isInStringList("Drunk", status))
sum  = sum + 2
endif
if(isInStringList("Angry", status))
sum  = sum + 2
endif

return sum 

else
sum = 0
return sum
endif
sum = 0
return sum
endif
sum = 0
return sum
endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; BREAK UP  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

int Function CalculateVolitionBreakUp()
int sum = 0

if(lovers == 1 )
if(attraction < 0 && friendship < 0)
sum = sum + 10
return sum
endif
return -10
else 
return -1
endif
endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; FIGHT  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
 

int Function CalculateVolitionFight()
int sum = 0

if((friend_goal >= friend_belief) && (friendship > -5))
return 0
endif

if(attraction  > 5)

sum = sum - 2

else

if(attraction  <= 5 && attraction > 0 )

sum = sum - 1

else

if(attraction < 0 && attraction > -5)
if(lovers != 1)
sum = sum + 1
else
sum = sum - 1
endif
else
if(attraction <= -5)
sum = sum + 2
endif
endif
endif
endif

if(friendship > 0)
if(friends)
sum = sum - 4
else
sum = sum - 2
endif
else
if(friendship < 0 && -5 < friendship)
sum = sum + 1
else
if(friendship <= -5)
if(friend_belief <= -5)
sum = sum + 2
else
sum = sum + 1
endif
endif
endif
endif


if(isInStringList("Hostile", traits))
sum = sum + 2
endif
if(isInStringList("Agressive", traits))
sum = sum + 4
endif
if(isInStringList("Friendly", traits))
sum = sum - 2
endif
if(isInStringList("Charming", traits))
sum = sum - 2
endif

if(isInStringList("Shy", traits))
sum = sum - 2
endif

if(angryAt)
sum = sum + 5
endif

if(isInStringList("Embarrassed", status))
sum  = sum - 2
endif
if(isInStringList("Drunk", status))
sum  = sum + 4
endif


return sum 
endFunction

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; Hello  ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
 

int Function CalculateVolitionHello()
int sum = 0
if(know_each_other == -1)

if(Target.getActorBase().GetName() == Game.GetPlayer().getActorBase().getName() && Myself.getRelationshipRank(Game.GetPlayer()) == 0)
return 10
else
if(Myself.getRelationshipRank(Target) == 0 && !SameFaction(Myself, target))

if(attraction > 5)

return 11

else 

if(friendship > 0)
return 10
else

if(friendship > 0 && attraction > 0)
return 1
else

return -10
endif
endif 
endif
else
return 0
endif
endif
else
return 0
endif

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


int Function getBiggestVolitionIndex(Int[] comparing)
int ret_index = -1
int compare_value=  comparing[0]
int runner = 0
int go = comparing.length
while(runner<go)
if((comparing[runner] >= compare_value))
compare_value = comparing[runner]
ret_index = runner
endif
runner = runner + 1
endWhile
volition_value = compare_value

return ret_index
endFunction


Int Function ResponderInfluenceRules(String _action, int _attraction_goal, int _attraction_belief, int _friendgoal, int _friendbelief, String[] _traits, String[] _status, int  _lovers, bool _friends, bool _angryAt, Actor _target, Actor _myself, int _attraction, int _friendship, int _isDating)
 
String ret
int  i = 0
previous_action = "no"
lovers = _lovers
friends = _friends
attraction_goal = _attraction_goal
attraction_belief = _attraction_belief
friend_goal = _friendgoal
friend_belief = _friendbelief
angryAt = _angryAt
traits = _traits
status = _status
Target = _target
Myself = _myself
attraction = _Attraction
friendship = _friendship
isDating = _isDating


 return CalculateVolition(_action)
endFunction

bool Function SameFaction(Actor NPC1, Actor NPC2)
bool know = false

Faction[] NPC1Factions = NPC1.GetFactions(-2, 2)
Faction[] NPC2Factions = NPC2.GetFactions(-2, 2)
;Debug.TraceUser("myUserLog","Myself :" + NPC1.getActorBase().getName() + " npc1Factions " + NPC1Factions + " Target " + NPC2.getActorBase().getName() + " NPC2 FACTIONS "+ NPC2Factions  + " \n")
int size1 = NPC1Factions.length
int size2 = NPC2Factions.length
int i = 0
int j = 0

While i < size1
While j < size2
if(NPC1Factions[i] == NPC2Factions[j])
know = true
know_each_other = 1
return know
else
j = j + 1
endif
endwhile
i = i + 1
endwhile
return know

endFunction