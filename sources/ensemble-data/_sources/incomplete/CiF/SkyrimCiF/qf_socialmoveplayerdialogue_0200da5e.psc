;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 42
Scriptname QF_SocialMovePlayerDialogue_0200DA5E Extends Quest Conditional

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY TargetAux3
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_TargetAux3 Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Player
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Player Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY TargetAux
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_TargetAux Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Follower
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Follower Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY TargetAux2
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_TargetAux2 Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_0
Function Fragment_0()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("insult",Alias_Target.getActorRef(), insultresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_14
Function Fragment_14()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("complimentother", Alias_TargetAux2.getActorRef(), insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_15
Function Fragment_15()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("insultother", Alias_TargetAux2.getActorRef(), insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_31
Function Fragment_31()
;BEGIN CODE
ObjectReference temp = Game.GetPlayer() as ObjectReference
GameManager = temp as GameManagerScript
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_2
Function Fragment_2()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("flirt",Alias_Target.getActorRef(), flirtresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_18
Function Fragment_18()
;BEGIN CODE
;Debug.Notification("Talking to : " + GameManager.GetSpeaker().getActorBase().getName())
speaker =  GameManager.GetSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
FlirtResult = GameManager.ResponderRules("flirt", Game.GetPlayer(),  speaker)
ComplimentResult = GameManager.ResponderRules("compliment", Game.GetPlayer(),  speaker)
InsultResult = GameManager.ResponderRules("insult", Game.GetPlayer(),  speaker)
InsultOtherResult =cif_script.getFriendShipValue(Game.getPlayer()) 
AskOutResult = GameManager.ResponderRules("askout", Game.GetPlayer(),  speaker)
isDating = cif_script.isDating(0)
ShareFeelingsResult = GameManager.ResponderRules("sharefeelings", Game.GetPlayer(),  speaker)

Debug.OpenUserLog("myUserLog")
Debug.TraceUser("myUserLog", "Player Dialogue results: Talking to: "+ speaker.getActorBase().getName() + " Flirtresult "+ Flirtresult  + " Compliment "+Complimentresult + " Insultresult "+ Insultresult + " InsultOtherresult "+ InsultOtherresult +  " Askoutresult "+ Askoutresult + " isDating "+ isDating + " sharefeelingsresult "+ sharefeelingsresult + " \n"+  " \n")
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_33
Function Fragment_33()
;BEGIN CODE
HatedPresentScene.ForceStart()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_34
Function Fragment_34()
;BEGIN CODE
ReceivedNoPresentScene.ForceStart()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_17
Function Fragment_17()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("insultother", Alias_TargetAux3.getActorRef(), insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_35
Function Fragment_35()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("askout",Alias_Target.getActorRef(), askoutresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_8
Function Fragment_8()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("insult",Alias_Target.getActorRef(), insultresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_12
Function Fragment_12()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("complimentother", Alias_TargetAux.getActorRef(),insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_16
Function Fragment_16()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("complimentother", Alias_TargetAux3.getActorRef(), insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_4
Function Fragment_4()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("compliment",Alias_Target.getActorRef(), complimentresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_32
Function Fragment_32()
;BEGIN CODE
LikedPresentScene.ForceStart()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_37
Function Fragment_37()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("sharefeelings",Alias_Target.getActorRef(), sharefeelingsresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_13
Function Fragment_13()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("insultother", Alias_TargetAux.getActorRef(), insultotherresult)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_27
Function Fragment_27()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("offergift",Alias_Target.getActorRef(), likedpresent)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_29
Function Fragment_29()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("offergift",Alias_Target.getActorRef(), likedpresent)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_23
Function Fragment_23()
;BEGIN CODE
Alias_Initiator.ForceRefTo(GameManager.GetSpeaker())
Alias_Target.ForceRefTo(Game.GetPlayer())
LikedPresent = GameManager.LikedPresent()
Debug.TraceUser("myUserLog", "PlayerDialogue: LikedThePresent: " + LikedPresent  + " speaker: " +GameManager.GetSpeaker().getActorBase().getName() + "\n")

if(LikedPresent > -1)
setstage(150)
else
if(LikedPresent  < -1)
setstage(160)
else
if(LikedPresent  == -1)
setstage(120)
endif
endif
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_25
Function Fragment_25()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("offergift",Alias_Target.getActorRef(), likedpresent)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_39
Function Fragment_39()
;BEGIN CODE
speaker = GameManager.getSpeaker()
ObjectReference obj = speaker as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerDialogue("breakup",Alias_Target.getActorRef(), insultresult)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Int Property result = 0 Auto Conditional

Int Property FlirtResult  Auto Conditional

Int Property InsultResult  Auto Conditional

Int Property ComplimentResult = 0 Auto Conditional 

Actor Property Speaker  Auto  Conditional 

FormList Property FoodList  Auto  

FormList Property WeaponList  Auto  

Int Property LikedPresent = 0 Auto  Conditional

GameManagerScript Property GameManager  Auto  

Scene Property LikedPresentScene  Auto  

Scene Property HatedPresentScene  Auto  

Int Property NoPresentScene  Auto  

Scene Property ReceivedNoPresentScene  Auto  

Keyword Property AggresiveKeyword  Auto  

Scene Property AttackPlayerScene  Auto  

Int Property InsultOtherResult  Auto  Conditional

Int Property AskOutResult  Auto  Conditional

Int Property ShareFeelingsResult  Auto Conditional 

Int Property isDating  Auto  Conditional
