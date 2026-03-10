Scriptname CIFRPGscript extends ObjectReference  

String gender



int top
String[] stack
Int[] target_stack
Int[] status_stack
String[] traits
String[] status


String[] desires
String[] intentions
String[] beliefs;
ObjectReference[] nearby;

int target_aux = -1
bool altered = false
bool notinitialized = true


Quest Property questRunning auto
Quest Property FlatterQuest auto
Quest Property FlatterOtherNpcQuest auto
Quest Property InsultQuest auto
Quest Property InsultOtherNpcQuest auto
Quest Property AttackQuest  Auto  
Quest Property LoveQuest  Auto  



CIFRPGPlayer Property pScript  Auto  

ObjectReference Property me auto

ObjectReference Property npc1 auto

ObjectReference Property npc2 auto

ObjectReference Property npc3 auto

CIFRPGscript Property npc1_script  Auto  

CIFRPGscript  Property npc2_script  Auto  

CIFRPGscript Property npc3_script  Auto  


String my_name 

int counter

 
Int[] social_points

String option

Event OnInit()

	counter= 0
	top = 0
	status = new String[20]
	stack = new String[20]
	target_stack = new Int[20]	
	status_stack = new Int[20]

	traits = new String[20]
	desires = new String[20]
	beliefs = new String[20]
	intentions = new String[20]
	nearby = new ObjectReference[20]
	social_points = new Int[20]
	int i = 0
	While i<5
			social_points[i] = 0
			i += 1
	endWhile
	
	 my_name ="what"

	FlatterQuest.Stop()
	FlatterOtherNpcQuest.Stop()
	InsultQuest.Stop()
	InsultOtherNpcQuest.Stop()
	AttackQuest.Stop()
	LoveQuest.Stop()

	;Debug.Notification( "Gender" + me.GetActorBase().GetSex())
	Actor se = me as Actor
	Debug.Notification( "Gender " + me.getBaseObject().GetName() + se.GetActorBase().GetSex())

	init()
	UpdateBeliefs()

	RegisterForUpdate(35)

endEvent

Event OnUpdate()
	Debug.Notification("Updating")
	BDI()
endEvent


Function init()
if(me.getBaseObject().GetName() == "NPC1" )

social_points[1] = 50



endif


if( me.getBaseObject().GetName() == "NPC2" )

Utility.Wait(10)
social_points[1] = 50


endif
if(me.getBaseObject().GetName() == "NPC3" )
Utility.Wait(20)
social_points[1] =  -30
social_points[2] = -30

endif
endFunction

Function randombelief()
int random = Utility.RandomInt(0, 20)

if(random < 4)
int random2 = Utility.RandomInt(1,2)
if(random2 == 1)
 beliefs[random] = "like"
endif
if(random2 == 2)
 beliefs[random] = "doesnotlike"
endif
if(random2 == 3) 
beliefs[random] = "love"
endif

altered = true
endif
endFunction

function selectOptions()
;Debug.Notification("selecting options: ")

	if(beliefs[0]== "doesnotlike" )
			if(!OnStack("kill", 0))
			pushAction("insult", 0)
			endif
	endif

	if(beliefs[0] == "likes" )
			if(!OnStack("flatter", 0))
			pushAction("flatter", 0)
			endif
	endif 

	if(beliefs[0]  == "love")
			if(!OnStack("love", 0))
			pushAction("love", 0)
			endif
	endif
	if(beliefs[1]  == "hates")
		if(!OnStack("kill", 1))
		pushAction("kill", 1)

		endif
	endif	
	if(beliefs[1]  == "despises")
		if(!OnStack("prejudicate", 1))
		pushAction("prejudicate", 1)
		endif
	endif	
	if(beliefs[1]  == "doesnotlike")
		if(!OnStack("insult", 1))
		pushAction("insult", 1)
		endif
	endif	

	if(beliefs[1] == "loves")
			if(!OnStack("love", 1))
			pushAction("love", 1)
			endif


	endif

	if(beliefs[1] == "adores")
			if(!OnStack("adore", 1))
			pushAction("adore", 1)
			endif


	endif

	if(beliefs[1] == "likes")
			if(!OnStack("flatter", 1))
			pushAction("flatter", 1)
			endif

	endif

	if(beliefs[2]  == "hates")
		if(!OnStack("kill", 2))
		pushAction("kill", 2)
			endif


	endif	
	if(beliefs[2]  == "despises")
		if(!OnStack("prejudicate", 2))
		pushAction("prejudicate", 2)
			endif


	endif	
	if(beliefs[2]  == "doesnotlike")
		if(!OnStack("insult", 2))
		pushAction("insult", 2)
			endif


	endif	

	if(beliefs[2] == "loves")
			if(!OnStack("love", 2))
			pushAction("love", 2)
		
			endif

	endif

	if(beliefs[2] == "adores")
		if(!OnStack("adore", 2))
			pushAction("adore", 2)
		
			endif

	endif

	if(beliefs[2] == "likes")
			if(!OnStack("flatter", 2))
			pushAction("flatter", 2)
		
			endif

	endif

	if(beliefs[3]  == "hates")
		if(!OnStack("kill", 3))
		pushAction("kill", 3)
				endif


	endif	
	if(beliefs[3]  == "despises")
		if(!OnStack("prejudicate", 3))
		pushAction("prejudicate", 3)
		
		endif


	endif	
	if(beliefs[3]  == "doesnotlike")
		if(!OnStack("insult", 3))
		pushAction("insult",3)
		
		endif


	endif	

	if(beliefs[3] == "loves")
			if(!OnStack("love", 3))
			pushAction("love", 3)
		
			endif


	endif

	if(beliefs[3] == "adores")
		if(!OnStack("adore", 3))
			pushAction("adore", 3)
		
			endif


	endif

	if(beliefs[3] == "likes")
			if(!OnStack("flatter", 3))
			pushAction("flatter", 3)
			
			endif

	endif


endFunction


String[] Function getBeliefs()
	return beliefs
endFunction


function IncSocialPoints(ObjectReference obj, int inc)

if(Game.GetPlayer() == obj)
social_points[0] =  social_points[0] + inc
	else
		if(npc1 == obj)
		social_points[1] =  social_points[1] + inc
		
		else
			if(npc2 == obj)
				social_points[2] =  social_points[2] + inc
				
			else
					if(npc3 == obj)
						social_points[3] =  social_points[3] + inc
endif
endif
endif
endif
UpdateBeliefs()
endFunction


function DecSocialPoints(ObjectReference obj, int dec)

if(Game.GetPlayer() == obj)
social_points[0] =  social_points[0] - dec
	else
		if(npc1 == obj)
		social_points[1] =  social_points[1] - dec
		
		else
			if(npc2 == obj)
				social_points[2] =  social_points[2] - dec
				
			else
					if(npc3 == obj)
						social_points[3] =  social_points[3] - dec
endif
endif
endif
endif
UpdateBeliefs()
endFunction



ObjectReference function GetNpcReference(int i)
if(i == 1)
return npc1
endif
 if(i == 2)
	return npc2
endif
 if(i ==3)
	return npc3
endif
endFunction



CIFRPGscript function GetNpcScript(int i)
if(i == 1)
return npc1_script
endif
 if(i == 2)
	return npc2_script
endif
 if(i ==3)
	return npc3_script
endif
endFunction


function UpdateBeliefs()
int i = 0
	While i<5
			if(social_points[i] >= 10)
				if(social_points[i] >=30 )
						if(social_points[i] >=50 )
							beliefs[i] = "loves"
			
					else
						beliefs[i] = "adores"
				endif
				else
					 beliefs[i] = "likes"

				endif			
			else 	
					if(social_points[i] <= -10)
								
							if(social_points[i] <=-30 )
						
											if(social_points[i] <=-50 )
												beliefs[i] = "hates"					
											else
												beliefs[i] = "despises"					
											endif
							else
								beliefs[i] = "doesnotlike"
							endif
			endif

endif
i +=1
endWhile	
endFunction



int function GetIndexOfNpc(ObjectReference obj)
if(npc1==obj)
return 1
endif
if(npc2 ==obj)
return 2
endif
if(npc3==obj)
return 3
endif
endFunction



function HelpOtherNpc(CIFRPGscript s)
String[] npc_beliefs = s.getBeliefs()
int aux = 0
ObjectReference aux2
int i = 0
	While i<5
			if( npc_beliefs[i] == "loves" || npc_beliefs[i] == "adores" )
			aux = i
			endif
i +=1
endWhile	
aux2 = s.GetNpcReference(i)

if(aux2)

target_aux = self.GetIndexOfNpc(aux2)

endif
endFunction




function PrejudicateOtherNpc(CIFRPGscript s)
String[] npc_beliefs = s.getBeliefs()
int aux = 0
ObjectReference aux2

int i = 0
	While i<5
			if( npc_beliefs[i] == "loves" || npc_beliefs[i] == "adores" )
			aux = i
			endif
i +=1
endWhile	


aux2 = s.GetNpcReference(aux)


target_aux = self.GetIndexOfNpc(aux2)


endFunction



function BDI()
int target
int stat

if(game.GetPlayer().GetCurrentLocation() == self.GetCurrentLocation())


if(!pscript.GetIsRunning())

selectOptions()
counter = 0

int s = top - 1
option = stack[s]
target = target_stack[s]
stat= status_stack[s]

if(stat == 1)
option = "nooption"
target = -1
endif


Debug.Notification("option " + option)
;Debug.Notification("Beliefs: " + beliefs[0] + " " + beliefs[1] + " " + beliefs[2])


if(target == 0)
	pscript.SetInitiator(me, self)
	pscript.SetIsTarget(true)

else 
	
	pscript.SetIsTarget(false)
endif
	if(target == 1)
			pscript.SetInitiator(me, self)
			pscript.SetTarget(npc1, npc1_script)
	else
			 if(target == 2)	
				pscript.SetInitiator(me, self)
				pscript.SetTarget(npc2, npc2_script)
	else
			 if(target == 3)
					pscript.SetInitiator(me, self)
					pscript.SetTarget(npc3, npc3_script)
endif
endif
endif




if(option == "love")
	lovequest.Stop()
	pscript.SetIsRunning(true)
	lovequest.Start()
	 questRunning = lovequest
	 status_stack[s] = 1
endif

if(option == "kill")
	attackquest.Stop()
 	pscript.SetIsRunning(true)
	attackquest.Start()
	attackquest.SetStage(30)

	questRunning = attackquest
	 status_stack[s] = 1
endif


if(option == "flatter" )
	FlatterQuest.Stop()
	pscript.SetIsRunning(true)
	FlatterQuest.Start()
	 status_stack[s] = 1
	questRunning = FlatterQuest
	
endif

if(option == "insult")
	InsultQuest.Stop()
	pscript.SetIsRunning(true)
	InsultQuest.Start()
	questRunning = InsultQuest
	 status_stack[s] = 1
endif

if(option == "adore")
	FlatterOtherNpcQuest.Stop()
	pscript.SetIsRunning(true)
	HelpOtherNpc(GetNpcScript(target))
	pscript.SetTargetAux(GetNpcReference(target_aux), GetNpcScript(target_aux))
	FlatterOtherNpcQuest.Start()
		 status_stack[s] = 1
	questRunning = FlatterOtherNpcQuest
	
endif

if(option == "prejudicate")
	InsultOtherNpcQuest.Stop()
	pscript.SetIsRunning(true)
	PrejudicateOtherNpc(GetNpcScript(target))
	pscript.SetTargetAux(GetNpcReference(target_aux), GetNpcScript(target_aux))

	InsultOtherNpcQuest.Start()
		 status_stack[s] = 1
	questRunning = InsultOtherNpcQuest
	
endif



endif


endif
endFunction







function pushAction(String item, Int target)
		stack[top] = item
	target_stack[top] = target
	status_stack[top] = 0
	top = top + 1
endFunction




bool function OnStack(String opt, int t)
int i = 0
While i<20
	if(stack[i] == opt && target_stack[i] == t)
				return true
	endif
	i+=1 
endWhile 
return false
endFunction


