
Scriptname CIFRPG20 extends ObjectReference  


GameManagerScript GM 
CIFRPGInitiatorRules Rules 

Int[] Goals
Int[] Current
String[] Status
int[] temp_Status
Int[] Status_Actors
String present_Received
Int Status_index
String[] Traits 
String[] Likes
Actor NPC
Actor[] NPCs
;Property GM auto
Actor Myself
String[] possible_options
Int[] possible_targets
Int volition_value
Int[] values
bool receivednothing
Int actor_number
String option
Int target = -1
String social_move_executed
Int social_move_executed_target
bool initialized

int Friends
int Lovers
int next_move_count
int relevant_Status
int relevant_Traits
int goal_value
int current_value
bool next_move
int Hostile_traits
int totalActions
String[] Actions

String embarrassing_move
Actor embarrassing_target
FormList Presentlist 
;; 2.0

Int[] attraction
Int[] friendship
Int[] attraction_beliefs
Int[] friendship_beliefs
Int[] attraction_goals
Int[] friendship_goals
String[] relationship_goals

;; PastSocialMoves

 String[] PastSocialMoves_name
 Actor[] PastSocialMoves_initiator
 Actor[] PastSocialMoves_target
 Int[] PastSocialMoves_result
Int PastSocialMoves_current
int liked_present 

Int NumberofNPCs


;Quest Property ComplimentQuest auto

Event  onLoad()

NumberofNPCs = 4


String[] gg = new String[4]
gg[0] = "Friendly"
gg[1] = "Hostile"
gg[2] = "Shy"
gg[3] = "Charming"
String[] gg2 = new String[4]
gg2[0] = "Weapon"
gg2[1] = "Book"
gg2[2] = "Soul Gem"
gg2[3] = "Potion"

volition_value = 0

totalActions = 11
liked_present = 0
initialized = false

receivednothing = true
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

next_move_count = 0
option = ""
Goals = new Int[3]
Current = new Int[3]
Traits = new String[4]
Status = new String[3]
temp_Status = new Int[3]
Likes = new String[3]
actor_number = 0
Status_Actors = new Int[3]
Status_index = 0
social_move_executed = ""
social_move_executed_target = -1
Friends = 0
Lovers = 0
relevant_Status = 0
relevant_Traits = 0
goal_value = 0
current_value = 0

present_Received = ""
int i = 0


i = 0
While i<Likes.length
if(i == 0) 
	 Likes[i] = gg2[Utility.RandomInt(0,3)]
  else 
Likes[i] = ""	
endif
	i = i+1
endWhile


ObjectReference obj = Game.GetPlayer() as ObjectReference
GM = obj as GameManagerScript



i = 0

While i< Status.length
	Status[i] = ""
	i = i+1
endWhile



 attraction = new Int[4]

 friendship  =  new Int[4]

 attraction_beliefs  =  new Int[4]

friendship_beliefs =  new Int[4]

attraction_goals  =  new Int[4]

 friendship_goals =  new Int[4]

 relationship_goals =  new String[4]


next_move = true

i = 0
While i<NumberofNPCs
	attraction[i] = 0
	i = i+1
endWhile

i = 0
While i<NumberofNPCs
	friendship[i] = 0
	i = i+1
endWhile

i = 0
While i<NumberofNPCs
	attraction_beliefs[i] = 0
	i = i+1
endWhile

i = 0
While i<NumberofNPCs
	friendship_beliefs[i] = 0
	i = i+1
endWhile

i = 0
While i<NumberofNPCs
	attraction_goals[i] = 0
	i = i+1
endWhile


i = 0
While i<NumberofNPCs
	friendship_goals[i] = 0
	i = i+1
endWhile

i = 0
While i<NumberofNPCs
	relationship_goals[i] = ""
	i = i+1
endWhile


PastSocialMoves_name = new String[4]
PastSocialMoves_initiator = new Actor[4]
PastSocialMoves_target = new Actor[4]
PastSocialMoves_result = new Int[4]

PastSocialMoves_current = 0




NPCs = new Actor[5]
Objectreference pls = self as ObjectReference
Myself = pls  as Actor
;Myself = Game.FindClosestActorFromRef(self, 1)

GetNpcs()





;Debug.TraceUser("myUserLog", " Actions: " +  Actions + " \n")



;Debug.MessageBox("NPCs: myself : " + Myself.GetActorBase().GetName() + " npc1: " + NPCs[0].GetActorBase().GetName() +  " npc2 "+ NPCs[1].GetActorBase().GetName() +  " npc3 "+ NPCs[2].GetActorBase().GetName()  + "Goals " + goals + " Traits " + traits)


int trait_count = 0

if(Myself.hasKeywordString("cif_t_friendly"))
Traits[trait_count] = "Friendly"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_charming"))
Traits[trait_count] = "Charming"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_hostile"))
Traits[trait_count] = "Hostile"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_shy"))
Traits[trait_count] = "Shy"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_attractive"))
Traits[trait_count] = "Attractive"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_ugly"))
Traits[trait_count] = "Ugly"
trait_count = trait_count + 1
endif

if(Myself.hasKeywordString("cif_t_agressive"))
Traits[trait_count] = "Aggresive"
trait_count = trait_count + 1
endif

int status_count = 0

if(Myself.hasKeywordString("cif_s_drunk"))
Status[status_count] = "Drunk"
status_count = status_count + 1
endif
if(Myself.hasKeywordString("cif_s_angry"))
Status[status_count] = "Angry"
status_count = status_count + 1
endif
if(Myself.hasKeywordString("cif_s_embarrassed"))
Status[status_count] = "Embarrassed"
status_count = status_count + 1
endif

ObjectReference m =Myself as ObjectReference
Rules = m  as CIFRPGInitiatorRules


GenerateGoals()

If(Myself.GetActorBase().GetName()== "Tom" || Myself.GetActorBase().GetName() == "James" || Myself.GetActorBase().GetName() == "Sarah" )
InitializeScriptedCif(Myself.getActorBase().GetName())
endif

Debug.OpenUserLog("myUserLog")
if(NPCs[3])
Debug.TraceUser("myUserLog", "NPCs: I am " + Myself.GetActorBase().GetName() + " npc1: " + NPCs[0].GetActorBase().GetName() +  " npc2 "+ NPCs[1].GetActorBase().GetName() +  " npc3 "+ NPCs[2].GetActorBase().GetName() + " npc4 "+ NPCs[3].GetActorBase().GetName() + " Attraction Goals " + attraction_goals + " Attraction " + attraction + " Friend Goals " + friendship_goals + " Friendship " + Friendship  + " Traits " + traits + " \n" + " \n")
else
Debug.TraceUser("myUserLog", "NPCs: I am : " + Myself.GetActorBase().GetName() + " npc1: " + NPCs[0].GetActorBase().GetName() +  " npc2 "+ NPCs[1].GetActorBase().GetName() +  " npc3 "+ NPCs[2].GetActorBase().GetName() + " Attraction Goals " + attraction_goals + " Attraction " + attraction + " Friend Goals " + friendship_goals + " Friendship " + Friendship  + " Traits " + traits + " \n" + " \n")
endif


BDI()
RegisterForUpdate(20) 



endEvent

bool Function GetInitialized()
return initialized
endFunction

Event OnUpdate()
if(next_move == true && Game.GetPlayer().getCurrentLocation() == myself.getCurrentLocation())
BDI()
else
next_move_count = next_move_count + 1
endif
if(next_move_count == 15)
next_move = true
next_move_count = 0
endif
UpdateStatus()
endEvent

function GetNpcs()
;Debug.Notification("uhm " + Myself.GetActorBase().GetName())

NPCs[0] = Game.GetPlayer()
actor_number = actor_number + 1
int  j = 0

NPC = Game.FindRandomActorFromRef(self, 3000.0)
while j < 50 
if(NPC != Myself && NPC != Game.GetPlayer() && !isInActorList(NPC, NPCs) && NPC.GetActorBase().HasKeywordString("cifrpg"))
NPCs[actor_number]  =  NPC
actor_number = actor_number + 1
else 
NPC = Game.FindRandomActorFromRef(self, 3000.0)
endif
j = j + 1
endwhile

;Debug.Notification("Myself afterif " + Myself.GetActorBase().GetName() )
endFunction


function BDI()


int rand = Utility.RandomInt(0,7)
Utility.Wait(rand)

String[] options = new String[4]
Int[] option_target = new Int[4]
Int[] option_volition = new Int[4]


String volition_option = ""
int m = 0
NormalizeAll()




while (NPCs[m])
if(!NPCs[m].isDead())
	options[m] = CalculateInitiatorVolitions(m)
	option_target[m] = m
	option_volition[m] = volition_value
;	Debug.TraceUser("myUserLog", "Myself " + myself.getActorBase().getName()  + " options " + options + " value " + volition_value  + " \n")
	volition_value = -1
	

	else
	options[m] = 0
	option_target[m] = m
	option_volition[m] = 0
	
	endif
	
	m = m +1
endwhile
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", myself.getActorBase().getName()  + " options " + options + " values " + option_volition + " Attraction Goals " + attraction_goals + " attraction_beliefs " + attraction_beliefs + " Attraction " + attraction + " Friend Goals " + friendship_goals + " friendship_beliefs"+ Friendship_beliefs + " Friendship " + Friendship  + " Traits " + traits + " \n" + " \n")
;Debug.Notification(myself.getActorBase().getName()  + " option " + options + " values " + option_volition )

int index = 0

index = getHighestIndex(option_volition)

if(options[index] != "" && option_volition[index] != 0 )

option  = options[index] 

target = option_target[index]
Actor PlayerREF = Game.GetPlayer()
ObjectReference obj = PlayerRef as ObjectReference
GM = obj as GameManagerScript
social_move_executed = option
social_move_executed_target = target
if(initialized == false)
initialized = true
GM.SetInitialized(myself)
endif
next_move = false
if(option == "breakup")
GM.LaunchQuest("breakup" , myself, NPCs[target])
else
GM.GMgo(self)
endif
;Debug.Notification( myself.getActorBase().getName() + " attraction beliefs  " + attraction_beliefs + " attraction " + attraction + " Goals " + attraction_goals  + " friendship beliefs  " + friendship_beliefs + " Goals " + friendship_goals + " Friendship " + Friendship + "option: "+  option + " target " + target)
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog",Myself.getActorBase().getName() + " Attraction Beliefs  " + attraction_beliefs + " Attraction Goals " + attraction_goals + " Attraction "  + Attraction+ " friendship_beliefs " + friendship_beliefs + " friendship_goals " + friendship_goals + " Friendship " + Friendship  + "option: "+  option + " target " + target +  " \n" + " \n")

endif

endFunction

function UpdateStatus()
int i = 0
while temp_Status[i]
if(temp_Status[i] <=  2) 
temp_Status[i] = 1 + temp_Status[i]
else 
cleanStatus(i)
temp_Status[i] = 0
endif
endWhile
endFunction

Function  NormalizeAll()
NormalizeValues(attraction)
NormalizeValues(attraction_beliefs)
NormalizeValues(attraction_goals)
NormalizeValues(friendship)
NormalizeValues(friendship_beliefs)
NormalizeValues(friendship_goals)
endFunction

function cleanStatus(int index)
if(status[index]== "isAngryAt")
Debug.Notification(Myself.getACTORbase().getName() + " no longer " + status[index] + " " + NPCs[Status_Actors[index]].getACTORbase().GetName())
else
Debug.Notification(Myself.getACTORbase().getName() + " no longer " + status[index])
endif
status[index]= ""
Status_Actors[index] = 0
endFunction


int function getHighestIndex(Int[] comparing)
int ret_index = 0
int compare_value=  comparing[0]
int runner = 0
int size = comparing.Length


while(runner < size)

if(comparing[runner] > compare_value)

compare_value = comparing[runner]
ret_index = runner
endif
runner = runner + 1
endWhile
return ret_index
endFunction


String  function getOption()
return option
endFunction

Actor function getInitiator()
return myself
endFunction

Actor function getTarget()
;Debug.Notification("Target is " + NPCs[target].getActorBase().getName())
return NPCs[target] 
endFunction


function setNPC(Actor _npc)
NPC =_npc
endFunction 

function InitializeScriptedCif(String myNameis)

int counter = 0

if(myNameis == "Tom" )



friendship_goals[0] = 7
friendship_beliefs[0] = 3
friendship[0] = 7



While counter <3
	if(NPCs[counter].getActorBase().getName() == "Sarah")
	Attraction_goals[counter] = 10
	Attraction[counter] = 7
	Attraction_beliefs[counter] = 6
	friendship_goals[counter] = 6
	friendship_beliefs[counter] = 6
	GM.SetLovers(myself, NPCs[counter])
	endif
	if(NPCs[counter].getActorBase().getName() == "James")
	friendship_goals[counter] = 2
	friendship_beliefs[counter] = 2
	friendship[counter] = 2
	endif
		
	counter = counter +1
endWhile

endif 

if ( myNameis == "James" )

friendship_goals[0] = 3
friendship_beliefs[0] = 0
friendship[0] = 3

While counter <3
	if(NPCs[counter].getActorBase().getName() == "Sarah")
	Attraction[counter] = 9
	Attraction_goals[counter] = 8
	Attraction_beliefs[counter] = 0
	friendship_goals[counter] = 6
	friendship[counter] = 6
	friendship_beliefs[counter] = 0
	endif
	if(NPCs[counter].getActorBase().getName() == "Tom")
	
	friendship_goals[counter] = 2
	friendship_beliefs[counter] = 2
	friendship[counter] = -3

	endif
		
	counter = counter +1
endWhile



endif

if( myNameis == "Sarah" )




friendship_goals[0] = 3
friendship[0] = 3
friendship_beliefs[0] = 3

While counter <3
	if(NPCs[counter].getActorBase().getName() == "Tom")
	
	Attraction_goals[counter] = 8
	Attraction_beliefs[counter] = 4
	attraction[counter] = 8
	friendship_goals[counter] = 6
	friendship_beliefs[counter] = 6
	friendship[counter]= 6
	GM.SetLovers(myself, NPCs[counter])

	endif
	if(NPCs[counter].getActorBase().getName()  == "James")
	attraction[counter] = 4
	friendship[counter]= 4
	endif
		
	counter = counter +1
	
endWhile


endif



endFunction


int  Function AreLovers(Actor l)
return GM.AreLovers(myself, l)
endFunction


bool Function AreFriends(Actor l)
return GM.AreFriends(myself, l)
endFunction


bool Function AreEnemies(Actor l)
return GM.AreEnemies(myself, l)
endFunction

int function getIndex(Actor np)
int  i = 0

int go = NPCs.length
while i < go
if(NPCs[i])
	if( NPCs[i].getActorBase().getName() == np.getActorBase().getName())
	return i
	endif
endif
i = i + 1
endwhile
return -1
endFunction



bool Function isAngryAt(Int act_index)
bool ret = false
int i = 0
int go = Status.length
while i < go
if(Status[i] == "isAngryAt" && Status_Actors[i] == act_index) 
ret = true
return true
endif
i = i + 1
endWhile
return ret
endFunction

int Function isDating(Int act_index)
int ret = 0
int i = 0
int go = Status.length
while i < go
if(Status[i] == "isDating" )
if(Status_Actors[i] == act_index) 
ret = 1
return ret
else
ret = -1
return ret
endif
endif
i = i + 1
endWhile
return ret
endFunction

bool function isInActorList(Actor n, Actor[] a)
int i = 0
int go = a.length
while i < go
if(a[i])
	if( a[i] == n)
	return true
	endif
else 
return false
endif
i = i + 1
endwhile
return false
endFunction

bool Function DoesNPCLike(String object)
return isInStringList(object, Likes)
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

int function getAttractionValue(Actor a)
int i= getIndex(A)
return attraction[i]
endFunction

int function getFriendshipValue(Actor a)
int i= getIndex(A)
return friendship[i]
endFunction


int function getAttractionGoalValue(Actor a)
int i= getIndex(A)
return attraction_goals[i]
endFunction

int function getFriendshipGoalValue(Actor a)
int i= getIndex(A)
return friendship_goals[i]
endFunction

int function getAttractionBeliefValue(Actor a)
int i= getIndex(A)
return attraction_beliefs[i]
endFunction

int function getFriendshipBeliefValue(Actor a)
int i= getIndex(A)
return friendship_beliefs[i]
endFunction

string Function GetLike()
return Likes[Utility.RandomInt(0,1)]
endFunction

function AddStatus(String stat, Actor _target)
temp_Status[Status_index] = 0
int actor_index = getIndex(_target)
Status[Status_index] = stat
Status_Actors[Status_index] = actor_index
if(Status_index <2)
Status_index = Status_index + 1
else
 Status_index = 0
endif
;Debug.MessageBox("Added status: " + stat + " target " + _target)
endFunction


function RemoveStatus(String stat, Actor _target)
int actor_index = 0
if(myself != _target)
actor_index = getIndex(_target)
endif
int runner = 0
int size = Status.length
while runner < size
	if(Status[runner] == stat)
		if(stat == "Embarrassed" || stat == "Drunk")
			Status[runner] = ""
			Status_Actors[runner] = 0
			temp_Status[runner] = 0
			return
		else

		if(Status_Actors[runner] == actor_index) 
			Status[runner] = ""
			Status_Actors[runner] = 0
			temp_Status[runner] = 0
			return
		endIf
		endif
	endIf

runner = runner + 1
endWhile

endFunction

bool function HasTrait(String s)
bool ret = false

ret = isInStringList(s, Traits)

return ret
endFunction


Function SetNextMove(bool b)
next_move = b
endFunction

String function CalculateInitiatorVolitions(Int index)
String ret

Int[] return_values = new Int[11]

int  l = AreLovers(NPCS[index])
bool f = AreFriends(NPCS[index])
bool angry =  isAngryAt(index)
int isDating = isDating(index)

Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", myself.getActorBase().getName() + " volition for NPC: " +  NPCs[index].getActorBase().getName() + " lovers: " + l + " angry at " + angry + " isdating " + isDating + " previous action " + social_move_executed)

ret = Rules.CalculateInitiatorVolitions(attraction_goals[index] ,  attraction_beliefs[index] , friendship_goals[index] , friendship_beliefs[index] , Traits , Status , l  , f ,angry, Actions, social_move_executed, NPCS[index], myself, attraction[index], friendship[index], isDating)

volition_value = Rules.GetVolitionValue()
;Debug.MessageBox("Me: " +  myself.getActorBase().getName() + " volition values " + return_values)

return ret
endFunction


Actor function getMostLikedNPC( Actor a)
int compare_value = 0
int ret_index = 0
int size =  NPCs.length
int i = 1
while i < size
if(attraction[i] >= compare_value && NPCs[i] != a)
compare_value = attraction[i]
ret_index = i
endif
i = i +1
;Debug.MessageBox("uhm " + NPCs[0].getActorBase().GetName() + " 1: " +  NPCs[0].getActorBase().GetName() + " 2: " +  NPCs[0].getActorBase().GetName()  + " ret_index " + ret_index + " size " + size)
endWhile
return NPCs[ret_index]

endFunction

Int Function ResponderInfluenceRules(String _action , Actor _actor )

int actor_index = getIndex(_actor)

int  l = AreLovers(NPCS[actor_index])

;Debug.TraceUser("myUserLog"," Responder Result Myself :" + myself.getActorBase().getName() + " actor " + _actor.getActorBase().getName() + " arelovers?: " + l + "\n ")

bool f =AreFriends(NPCS[actor_index])
bool angry =  isAngryAt(actor_index)
int isDating = isDating(actor_index)

int rules_result =  Rules.ResponderInfluenceRules( _action, attraction_goals[actor_index], attraction_beliefs[actor_index], friendship_goals[actor_index], friendship_beliefs[actor_index], traits, status,  l,  f,  angry, _Actor, Myself, attraction[actor_index], friendship[actor_index], isDating)
Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog"," Responder Result Initiator : " + _actor.getActorBase().getName() +  " Myself, the responder :" + myself.getActorBase().getName() + " action: " + _action + " result: " + rules_result + "\n ")

return rules_result

endFunction


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; Social Exchanges Consequences ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


function SucessfulQuest(string _socialmove, Actor init, Actor _target, int result)

Int relevantIndex = 0

if(myself == init)
relevantIndex = getIndex(_target)
next_move = true
else
if(myself == _target)
relevantIndex = getIndex(init)
endif
endif

if(_socialmove == "hello")
if(result < 0)
Myself.setRelationshipRank(_target, -1)
_target.setRelationshipRank(Myself, -1)
else
Myself.setRelationshipRank(_target, 1)
_target.setRelationshipRank(Myself, 1)
endif
endif

if(_socialmove == "flirt")
if(myself == init)
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
;Debug.Notification(Myself.GetActorBase().getName() + " attraction beliefs for " + NPCs[relevantIndex].getACTORbase().GetName() + " have increased")
else
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
attraction_goals[relevantIndex] = attraction_goals[relevantIndex] + 2
attraction[relevantIndex] = attraction[relevantIndex] + 2
Debug.Notification(Myself.GetActorBase().getName() + " attraction with " + NPCs[relevantIndex].getACTORbase().GetName() + " has increased")

if(AreLovers(init) == -1 ||  IsDating(getIndex(init)) == -1)
attraction_goals[relevantIndex ] = attraction_goals[relevantIndex ]  - 1
friendship_goals[relevantIndex ] = friendship_goals[relevantIndex ]  - 1
ObjectReference lover = GM.GetTheLover(_target)
CIFRPG20 lover_Script = lover as CIFRPG20
 lover_Script.TriedWithLover(init)
endif

endif
endif

if( _socialmove== "offerromanticgift")
if(myself == init)
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 2
else
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 2
attraction_goals[relevantIndex] = attraction_goals[relevantIndex] + 2
attraction[relevantIndex] = attraction[relevantIndex] + 2
friendship[relevantIndex] = friendship[relevantIndex] + 1
Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + NPCs[relevantIndex].getACTORbase().GetName() + " has increased")

if(AreLovers(init) == -1 ||  IsDating(getIndex(init)) == -1)
attraction_goals[relevantIndex ] = attraction_goals[relevantIndex ]  - 2
friendship_goals[relevantIndex ] = friendship_goals[relevantIndex ]  - 1
ObjectReference lover = GM.GetTheLover(_target)
CIFRPG20 lover_Script = lover as CIFRPG20
 lover_Script.TriedWithLover(init)
endif

endif
endif 
if( _socialmove== "askout")
if(myself == init)
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
else
attraction[relevantIndex ] = attraction[relevantIndex ]  + 1
attraction_goals[relevantIndex ] = attraction_goals[relevantIndex ]  + 1
endif
AddStatus("isDating", _target)
Debug.Notification(Myself.GetActorBase().getName() + " is Dating " + NPCS[relevantIndex].getACTORbase().GetName())
endif  
if( _socialmove== "sharefeelings")
if(myself == init)
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
else
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3
attraction[relevantIndex ] = attraction[relevantIndex ]  + 1
attraction_goals[relevantIndex ] = attraction_goals[relevantIndex ]  + 1
endif
GM.setLovers(init,_target)
endif 
if( _socialmove== "compliment")
if(Myself == _target)
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 3
friendship_goals[relevantIndex] = friendship_goals[relevantIndex] + 2
friendship[relevantIndex] = friendship[relevantIndex] + 3
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + NPCs[relevantIndex].getACTORbase().GetName() + " has increased")
else
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 3

endif
endif 
if( _socialmove== "offergift")
friendship_goals[relevantIndex] = friendship_goals[relevantIndex] + 1
friendship[relevantIndex] = friendship[relevantIndex] + 2
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 3
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + NPCs[relevantIndex].getACTORbase().GetName() + " has increased")
endif 
if( _socialmove== "insult")
if(Myself == _target)
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 3
friendship_goals[relevantIndex] = friendship_goals[relevantIndex] - 2
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  - 3
attraction[relevantIndex] = attraction[relevantIndex] - 3
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + NPCs[relevantIndex].getACTORbase().GetName() + " has decreased")
else

friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 3


endif
if(myself == _target)
if(isAngryAt(getIndex(init)) == false)
AddStatus("isAngryAt", init)
Debug.Notification(_target.GetActorBase().getName() + " is now Angry with " + init.getACTORbase().GetName())
endIf
endif
endif 
if( _socialmove== "embarass" || _socialmove== "blame")
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 3
friendship_goals[relevantIndex ] = friendship_goals[relevantIndex ] - 2
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + NPCs[relevantIndex].getACTORbase().GetName() + " has decreased")
if(Myself == _target)
AddStatus("isEmbarrassed", _target)
Debug.Notification(_target.GetActorBase().getName() + " is now Embarrassed")
endif 
endif
if( _socialmove== "breakup")

friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 6
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  - 6
if(Myself == init)
RemoveStatus("isDating", _target)
endIf

if(Myself == _target)
friendship_goals[relevantIndex] =  - 5
friendship[relevantIndex] = friendship[relevantIndex] - 10
attraction_goals[relevantIndex] = - 5
attraction[relevantIndex] = attraction[relevantIndex] - 10
RemoveStatus("isDating", init)
if(isAngryAt(getIndex(init)) == false)
AddStatus("isAngryAt", init)
Debug.Notification(_target.GetActorBase().getName() + " is now Angry with " + init.getACTORbase().GetName())
endIf
endif 
endif
if( _socialmove== "fight")
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 4
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  - 4
friendship_goals[relevantIndex] = friendship_goals[relevantIndex] - 4
friendship[relevantIndex] = friendship[relevantIndex] - 4
attraction_goals[relevantIndex] = attraction_goals[relevantIndex] - 4
attraction[relevantIndex] = attraction[relevantIndex] - 4
Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + NPCs[relevantIndex].getACTORbase().GetName() + " has decreased a lot")
if(Myself == _target)
if(isAngryAt(getIndex(init)) == false)
AddStatus("isAngryAt", init)
Debug.Notification(_target.GetActorBase().getName() + " is now Angry with " + init.getACTORbase().GetName())
endIf
endif 
endif
if( _socialmove== "insultothernpc")
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  + 2

endif

InformSocialMove(_socialmove, init, _target, result)

endFunction


function FailedQuest(string _socialmove, Actor init, Actor _target, int result)

if(result != -20)
Int relevantIndex = 0

if(myself == init)
relevantIndex = getIndex(_target)
next_move = true
else
if(myself == _target)
relevantIndex = getIndex(init)
endif
endif


if(_socialmove == "flirt" ||  _socialmove== "offerromanticgift" || _socialmove== "askout" || _socialmove== "sharefeelings")
if(myself==init)
attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  - 3
attraction_goals[relevantIndex] = attraction_goals[relevantIndex]  - 1
attraction[relevantIndex] = attraction[relevantIndex] - 1
if(_socialmove== "askout" || _socialmove== "sharefeelings")
attraction_goals[relevantIndex] = attraction_beliefs[relevantIndex ]  - 3
attraction[relevantIndex] = attraction[relevantIndex ]  - 2
else
attraction_goals[relevantIndex] = attraction_beliefs[relevantIndex ]  - 1
attraction[relevantIndex] = attraction[relevantIndex ]  - 1
endif
Debug.Notification(Myself.GetActorBase().getName() + " attraction with " + NPCs[relevantIndex].getACTORbase().GetName() + " has slightly decreased")
if(AreLovers(_target) == -1 ||  IsDating(getIndex(_target)) == -1)
int enemyind = getIndex(GM.GetTheLover(_target))
friendship_goals[enemyind] = friendship_goals[enemyind] - 2
friendship[enemyind] = friendship[enemyind] - 2
endif
else
if(myself == _target)

if(AreLovers(init) == -1 ||  IsDating(getIndex(init)) == -1)
attraction_goals[relevantIndex ] = attraction_goals[relevantIndex ]  - 1
friendship_goals[relevantIndex ] = friendship_goals[relevantIndex ]  - 1
ObjectReference lover = GM.GetTheLover(_target)
CIFRPG20 lover_Script = lover as CIFRPG20
 lover_Script.TriedWithLover(init)
endif

attraction_beliefs[relevantIndex ] = attraction_beliefs[relevantIndex ]  + 3

;Debug.Notification(Myself.GetActorBase().getName() + " attraction with " + init.getACTORbase().GetName() + " has slightly decreased")

endif
endif 
else
if( _socialmove== "compliment" || _socialmove== "offergift")
friendship_beliefs[relevantIndex ] = friendship_beliefs[relevantIndex ]  - 2
friendship_goals[relevantIndex ] = friendship_goals[relevantIndex ]  - 1
friendship[relevantIndex] = friendship[relevantIndex] - 1
if(myself == init)
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + _target.getACTORbase().GetName() + " has slightly decreased")
endif
endif
endif
InformSocialMove(_socialmove, init, _target, result)

endif
endFunction

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;; PastSocialMoves ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

function InformSocialMove(String _action, Actor _init, Actor _target, int _result)

PastSocialMoves_name[PastSocialMoves_current] = _action
PastSocialMoves_initiator[PastSocialMoves_current] = _init
PastSocialMoves_target[PastSocialMoves_current] = _target
PastSocialMoves_result[PastSocialMoves_current] = _result

if(PastSocialMoves_current == 3)
 PastSocialMoves_current = 0
else
PastSocialMoves_current = PastSocialMoves_current + 1
endif
endFunction

;;;;;;;;;;;;;;;;;;; Cheating Consequences;;;;;;;;;;;;;;;;;;;;;;;;

Function TriedWithLover(Actor enemy)
;Debug.Notification("Tried with lover  myself: " + myself.getActorbase().getName() + " enemy " + enemy.getACTORbase().getName() )
Int enemy_index = getIndex(enemy)

friendship_goals[enemy_index] = friendship_goals[enemy_index] - 3
friendship[enemy_index] = friendship[enemy_index] - 3
if(isAngryAt(getIndex(enemy)) == false)
AddStatus("isAngryAt", enemy)
Debug.Notification(myself.GetActorBase().getName() + " is now Angry with " + enemy.getACTORbase().GetName())
endIf
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + enemy.getACTORbase().GetName() + " has decreased")
endFunction


;;;;;;;;;;;;;;;;;;;;;; Player Dialogue Consequences ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;

function PlayerDialogue(String type, Actor about, int result)
Debug.TraceUser("myUserLog", "CIFRPG20: PlayerDialogue with " + myself.getActorBase().getName() + "  " +  type + " about " + about.getActorBase().getName() + " result: " + result + "\n")


if(type == "compliment")
	if(result > 0)
		friendship_beliefs[0] = friendship_beliefs[0] + 3
		friendship[0] = friendship[0] + 3
		friendship_goals[0] = friendship_goals[0] + 2

		Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + Game.GetPlayer().getACTORbase().GetName() + " has increased")
	else

			Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + Game.GetPlayer().getACTORbase().GetName() + " hasn't changed")

	
	endif
	
	
endif
	
if(type == "flirt")

		if(AreLovers(Game.GetPlayer()) == -1 || isDating(0) == -1)
			ObjectReference lover = GM.GetTheLover(Myself)
			CIFRPG20 lover_Script = lover as CIFRPG20
			lover_Script.TriedWithLover(Game.GetPlayer())
		endIf
 
		if(result >= 0)
			attraction_beliefs[0] = attraction_beliefs[0] + 3
			attraction[0] = attraction[0] + 3
			attraction_goals[0] = attraction_goals[0] + 2
			Debug.Notification(Myself.GetActorBase().getName() + " attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has increased")
			

		else
			attraction_beliefs[0] = attraction_beliefs[0] + 3
			attraction[0] = attraction[0] - 3
			attraction_goals[0] = attraction_goals[0] - 2
			Debug.Notification(Myself.GetActorBase().getName() + " attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has slightly decreased")
		endif
		
	endif
	
if(type == "insult")
	friendship_beliefs[0] = friendship_beliefs[0] - 3
	friendship[0] = friendship[0] - 3
	friendship_goals[0] = friendship_goals[0] - 2
	attraction_beliefs[0] = attraction_beliefs[0] - 3
	attraction[0] = attraction[0] - 2
	attraction_goals[0] = attraction_goals[0] - 3
	
	Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has decreased")

endif
if(type == "complimentother")
	if(result > 0)
		int relevantIndex = getIndex(about)
		attraction[relevantIndex] = attraction[relevantIndex] + 3
		friendship_goals[0] = friendship_goals[0] + 3
		friendship[relevantIndex] = friendship[relevantIndex] + 3
		attraction_goals[0] = attraction_goals[0] + 3
		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + about.getACTORbase().GetName() + " has increased")
	else 
	Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + about.getACTORbase().GetName() + " hasn't changed")
	endif
endif
if(type == "insultother")
	
if(result > 0)	
	int relevantIndex = getIndex(about)
		attraction[relevantIndex] = attraction[relevantIndex] - 3
		friendship_goals[0] = friendship_goals[0] - 2
		friendship[relevantIndex] = friendship[relevantIndex] - 3
		attraction_goals[0] = attraction_goals[0] - 2
		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + about.getACTORbase().GetName() + " has decreased")
	else 
	Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + about.getACTORbase().GetName() + " hasn't changed")
	endif
	
endif

if(type == "offergift")
	if(liked_present >= 5)
	if(AreLovers(Game.GetPlayer()) == -1 || isDating(0) == -1)
			ObjectReference lover = GM.GetTheLover(Myself)
			CIFRPG20 lover_Script = lover as CIFRPG20
			lover_Script.TriedWithLover(Game.GetPlayer())
		endIf
		
		attraction[0] = attraction[0] + 3
		friendship[0] = friendship[0] + 3
		attraction_beliefs[0] = attraction_beliefs[0] + 3
		friendship_goals[0] = friendship_goals[0] + 3
		attraction_goals[0] = attraction_goals[0] + 3
		friendship_beliefs[0] = friendship_beliefs[0] + 3
		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has significantly increased")
	else
	if(liked_present < 5 && liked_present >= 1)
		attraction[0] = attraction[0] + 2
		friendship[0] = friendship[0] + 2
		friendship_goals[0] = friendship_goals[0] + 2
		attraction_goals[0] = attraction_goals[0] + 2
		attraction_beliefs[0] = attraction_beliefs[0] + 3		
		friendship_beliefs[0] = friendship_beliefs[0] + 3
		
		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has slightly increased ")
	else
	if(liked_present <=0)
		attraction[0] = attraction[0] - 2
		friendship[0] = friendship[0] - 2
		attraction_beliefs[0] = attraction_beliefs[0] + 3
		friendship_beliefs[0] = friendship_beliefs[0] + 3
		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + Game.GetPlayer().getACTORbase().GetName() + " has slightly decreased")
	endif
	endif
	endif
	
endif
if(type == "askout")
	if(result > 0)
		attraction[0] = attraction[0] + 2
		attraction_beliefs[0] = attraction_beliefs[0] + 3
		attraction_goals[0] = attraction_goals[0] + 2
		Debug.Notification(Myself.GetActorBase().getName() + " is now Dating " + about.getACTORbase().GetName())
		AddStatus("isDating", Game.GetPlayer())
	else
	
		attraction_beliefs[0] = attraction_beliefs[0] + 3
		
	endif 
	

endif
if(type == "sharefeelings")
	if(result > 0)
		attraction[0] = attraction[0] + 3
		attraction_beliefs[0] = attraction_beliefs[0] + 5
		friendship[0] = friendship[0] + 2
		friendship_beliefs[0] = friendship_beliefs[0] + 3
		;Debug.Notification(Myself.GetActorBase().getName() + " attraction and friendship with " + about.getACTORbase().GetName() + " has increased")
		GM.SetLovers(Myself, Game.GetPlayer())
	else
		attraction[0] = attraction[0] - 2
		attraction_beliefs[0] = attraction_beliefs[0] + 5
		attraction_goals[0] = attraction_goals[0] - 2
		friendship_goals[0] = friendship_goals[0] - 2
		friendship[0] = friendship[0] - 2

		Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + about.getACTORbase().GetName() + " has slightly decreased")


	endif
	
endif

if(type == "breakup")
attraction_goals[0] =  - 6
attraction[0] =  - 6
friendship_goals[0] = - 3
friendship[0] = - 3
attraction_beliefs[0] =  - 3
friendship_beliefs[0] = 0

AddStatus("isAngryAt", Game.GetPlayer())
Debug.Notification(Myself.GetActorBase().getName() + " friendship and attraction with " + Game.GetPlayer().GetName() + " has significantly decreased ")
Debug.Notification(Myself.GetActorBase().getName() + " is Angry with " + Game.GetPlayer().getACTORbase().GetName())
GM.BreakUp(Myself, Game.GetPlayer())
endif
GM.PlayerDialogueEnded()
endFunction


;;;;;;;;;;;;;;;;;;;   Generate NPCs Goals ;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;



Function GenerateGoals()
int npc_index = 0
int go = NPCs.length

while (npc_index <go)

	if(NPCs[npc_index])
	Actor temp = NPCs[npc_index] 
		

	if(Myself.getActorBase().getSex() != temp.getActorBase().getSex() || Myself.hasKeywordString("cif_t_gay"))
	
	if(Myself.getActorBase().getRace() == temp.getActorBase().getRace()) ;;;;;;;;;;;  different sex and same race ;;;;;;;;;;;;
	
	if(myself.hasKeywordString("cif_t_friendly"))
	friendship_goals[npc_index] = friendship_goals[npc_index] + 5
	friendship[npc_index] = friendship[npc_index] + 3
	endif

	if(myself.hasKeywordString("cif_t_charming"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 4
	friendship_goals[npc_index] = friendship_goals[npc_index] + 4
	endif
	
	if(myself.hasKeywordString("cif_t_hostile"))
	attraction_goals[npc_index] = attraction_goals[npc_index] - 3
	friendship_goals[npc_index] = friendship_goals[npc_index] - 3
	friendship[npc_index] = friendship[npc_index] - 3
	endif
		
	if(temp.hasKeywordString("cif_t_attractive"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 4
	attraction[npc_index] = attraction[npc_index] + 4
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	endif

	if(temp.hasKeywordString("cif_t_ugly"))
	attraction[npc_index] = attraction[npc_index] - 5
	endif
	
	attraction_goals[npc_index] = attraction_goals[npc_index] + 2
	attraction[npc_index] = attraction[npc_index] + 2
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	friendship[npc_index] = friendship[npc_index] + 2
	
	else
	
	if(Myself.getActorBase().getRace() != temp.getActorBase().getRace())		;;;;;;;;;;;  different sex and different race ;;;;;;;;;;;;
	
	
	if(myself.hasKeywordString("cif_t_friendly"))	
	friendship_goals[npc_index] = friendship_goals[npc_index] + 3
	friendship[npc_index] = friendship[npc_index] + 2
	endif

	if(myself.hasKeywordString("cif_t_charming"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 3
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	endif
	
	if(myself.hasKeywordString("cif_t_hostile"))
	attraction_goals[npc_index] = attraction_goals[npc_index] - 4
	friendship_goals[npc_index] = friendship_goals[npc_index] - 4
	friendship[npc_index] = friendship[npc_index] - 4
	endif
		
	if(temp.hasKeywordString("cif_t_attractive"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 3
	attraction[npc_index] = attraction[npc_index] + 3
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	endif

	if(temp.hasKeywordString("cif_t_ugly"))
	attraction[npc_index] = attraction[npc_index] - 5
	endif
	
	friendship[npc_index] = friendship[npc_index] + 2
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	attraction[npc_index] = attraction[npc_index] - 2
	endif
	endif
	endif
	
	if(Myself.getActorBase().getSex() == temp.getActorBase().getSex())
	
	if(Myself.getActorBase().getRace() == temp.getActorBase().getRace()) ;;;;;;;;;;;  same sex and same race ;;;;;;;;;;;;
	
	if(Myself.hasKeywordString("cif_t_friendly"))
	friendship_goals[npc_index] = friendship_goals[npc_index] + 5
	friendship[npc_index] = friendship[npc_index] + 3
	endif

	if(Myself.hasKeywordString("cif_t_charming"))

	friendship_goals[npc_index] = friendship_goals[npc_index] + 3
	endif
	
	if(Myself.hasKeywordString("cif_t_hostile"))
	attraction_goals[npc_index] = attraction_goals[npc_index] - 3
	friendship_goals[npc_index] = friendship_goals[npc_index] - 3
	friendship[npc_index] = friendship[npc_index] - 3
	endif
		
	if(temp.hasKeywordString("cif_t_attractive"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 3
	attraction[npc_index] = attraction[npc_index] + 2
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	endif

	if(temp.hasKeywordString("cif_t_ugly"))
		attraction[npc_index] = attraction[npc_index] - 8
	endif
	
		friendship[npc_index] = friendship[npc_index] + 2
	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	
	else
	
	if(Myself.getActorBase().getRace() != temp.getActorBase().getRace())	;;;;;;;;;;;  same sex and different race ;;;;;;;;;;;;
	
	
	
	if(Myself.hasKeywordString("cif_t_friendly"))
	friendship_goals[npc_index] = friendship_goals[npc_index] + 3
	friendship[npc_index] = friendship[npc_index] + 3
	endif

	if(Myself.hasKeywordString("cif_t_charming"))

	friendship_goals[npc_index] = friendship_goals[npc_index] + 2
	endif
	
	if(Myself.hasKeywordString("cif_t_hostile"))
	attraction_goals[npc_index] = attraction_goals[npc_index] - 4
	friendship_goals[npc_index] = friendship_goals[npc_index] - 4
	friendship[npc_index] = friendship[npc_index] - 4
	endif
		
	if(temp.hasKeywordString("cif_t_attractive"))
	attraction_goals[npc_index] = attraction_goals[npc_index] + 2
	attraction[npc_index] = attraction[npc_index] + 1
	friendship_goals[npc_index] = friendship_goals[npc_index] + 1
	endif

	if(temp.hasKeywordString("cif_t_ugly"))
		attraction[npc_index] = attraction[npc_index] - 9
	endif
	
		friendship[npc_index] = friendship[npc_index] - 2
	friendship_goals[npc_index] = friendship_goals[npc_index] - 2
	
	endif
	endif	
	endif
	
	if(Myself.getRelationShipRank(NPCs[npc_index]) > 0)
	friendship_beliefs[npc_index] = friendship_beliefs[npc_index] + 3
	friendship[npc_index] = friendship[npc_index] + 3
	else
	if(Myself.getRelationShipRank(NPCs[npc_index]) < 0)
	friendship_beliefs[npc_index] = friendship_beliefs[npc_index] - 2
	friendship[npc_index] = friendship[npc_index] - 2
	endif
	endif
	endif
	
	npc_index = npc_index+ 1
	
	
endwhile
endFunction

;;;;;;;;;;;;;;;;;;;;;;;   Finding Embarrassing Events ;;;;;;;;;;;;;;;;

int Function findEmbarrassment()
int ret = -1
int inter = 0
while inter < 4
if(PastSocialMoves_name[inter])
if(PastSocialMoves_result[inter] <= 0 && (PastSocialMoves_name[inter] == "flirt" ||PastSocialMoves_name[inter] == "compliment" ) && PastSocialMoves_initiator[inter] == Myself)
embarrassing_move = PastSocialMoves_name[inter]
embarrassing_target = PastSocialMoves_target[inter]
;;Debug.TraceUser("myUserLog"," Embarrassment: " + embarrassing_move + " target " + embarrassing_target.getACTORbase().getName() + "\n ")
ret = inter
return ret
else
inter = inter + 1
endif
else
inter = inter + 1
endif

endWhile

return ret

endFunction


String Function getEmbarrassingMove()
int temp = findEmbarrassment()
;Debug.TraceUser("myUserLog"," Embarrassed Myself: " + myself.getACTORbase().getName() + " temp " + temp + "\n ")
return PastSocialMoves_name[temp]
endFunction

Actor Function getEmbarrassingMoveTarget()
int temp = findEmbarrassment()
return PastSocialMoves_target[temp]
endFunction



Function OfferGift(String gift)

Presentlist = GM.GetPresentList(gift)
present_Received = gift
Debug.TraceUser("myUserLog", "CIFRPG20: Present received: " + present_Received + " Gift: " +  gift + " Myself:  " + myself.getActorBase().getName()  + "\n")


Myself.ShowGiftMenu(True, PresentList)
LikedThePresent(gift)
return
EndFunction

Event OnItemAdded(Form akBaseItem, int aiItemCount, ObjectReference akItemReference, ObjectReference akSourceContainer)
	if(present_Received != "")
	if(akBaseItem)
	if(	PresentList.Find(akBaseItem))
		;Debug.Notification("present_Received " + present_Received)
		
	EndIf
	endif
	endif
	if(aiItemCount >0)
	

	receivednothing = false
	else
	receivednothing = true
	endif
	
	return
	
EndEvent

int Function LikedThePresent(String gift)
Debug.TraceUser("myUserLog", "CIFRPG20: LikedThePresent: Gift " + gift + " ReceivedNothing?: " +  receivednothing + " Myself:  " + myself.getActorBase().getName()  + "\n")


if(receivednothing)
liked_present = -1
GM.setLikedPresent(liked_present)
return -1
endif

if (gift == "soulgem")
if(Myself.getActorBase().getsex() == 1)
liked_present = 5
else
liked_present = -5
endif

GM.setLikedPresent(liked_present)
return liked_present
else
if(gift == "daggers")
if(Myself.getActorBase().getsex() == 0)
liked_present = 5
else
liked_present = -5
endif
GM.setLikedPresent(liked_present)
return liked_present
else
if (gift == "potions")

liked_present = 1
GM.setLikedPresent(liked_present)
return liked_present
else
if(gift == "booze")

if(Myself.getActorBase().getsex() == 0)
liked_present = 5
else
liked_present = -5
endif
GM.setLikedPresent(liked_present)
return liked_present

else
return -1
endif
endif
endif
endif
endFunction

Function LoverCheated()
int lover_index = GetIndex(GM.GetTheLover(Myself))
attraction_goals[lover_index] =  - 6
attraction[lover_index] =  - 6
friendship_goals[lover_index] = - 3
friendship[lover_index] = - 3
attraction_beliefs[lover_index] =  - 3
friendship_beliefs[lover_index] = 0
AddStatus("AngryAt", NPCs[lover_index])
GM.LaunchQuest("breakup", myself, NPCs[lover_index])
endFunction


Event OnCombatStateChanged(Actor akTarget, int aeCombatState)
  if (akTarget.getACTORbase().getName() == Game.GetPlayer().getACTORbase().GetName())

    if (aeCombatState == 1)
     SucessfulQuest("fight", Game.GetPlayer(), Myself, 0)
    endIf
  endIf
endEvent


Function NormalizeValues(Int[] list_to_normalize)
int i = 0
int go = list_to_normalize.length
while i < go
	if(list_to_normalize[i] > 10)
	list_to_normalize[i] = 10
	else 
	if(list_to_normalize[i] < -10)
	list_to_normalize[i] = -10
	endif
	endif
i = i + 1
endwhile
endFunction


Function PlayerHelpedActor()
friendship[0] = friendship[0] + 5
friendship_goals[0] = friendship_goals[0] + 2
friendship_beliefs[0] = friendship_beliefs[0] + 5
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + Game.getPlayer().getACTORbase().getName() + " has increased")
endFunction


Function KilledMyLover(Actor killer)
Myself.setRelationshipRank(killer, -4)
int enemy_index = GetIndex(killer)
friendship_goals[enemy_index] = - 8
friendship[enemy_index] = - 8
AddStatus("AngryAt", NPCs[enemy_index])
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + killer.getACTORbase().getName() + " has decreased a lot")
Debug.Notification(Myself.GetActorBase().getName() + " is angry with " + killer.getACTORbase().getName())
endFunction

Function PlayerHurtActor()
friendship[0] = friendship[0] - 5
friendship_goals[0] = friendship_goals[0] - 2
friendship_beliefs[0] = friendship_beliefs[0] - 5
Debug.Notification(Myself.GetActorBase().getName() + " friendship with " + Game.getPlayer().getACTORbase().getName() + " has decreased")
endFunction


Event onDeath(Actor akKiller)
GM.RIP(myself, akKiller)
UnregisterForUpdate()
endEvent