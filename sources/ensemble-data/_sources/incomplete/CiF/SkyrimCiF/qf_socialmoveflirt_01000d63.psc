;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 11
Scriptname QF_SocialMoveFlirt_01000D63 Extends Quest Hidden

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_10
Function Fragment_10()
;BEGIN CODE
Debug.Notification("Flirt Quest failed")
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
GM.failedQuest("flirt",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
Reset()
Start()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_3
Function Fragment_3()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Alias_Initiator.ForceRefTo(GM.GetInitiator())
Alias_Target.ForceRefTo(GM.GetTarget())

ObjectReference targ= Alias_Target.GetReference() as ObjectReference
result = GM.ResponderRules("flirt", GM.GetInitiator(), GM.GetTarget())

Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to flirt with " + GM.getTarget().getActorBase().GetName())
if(GM.GetTarget() != Game.GetPlayer())
if(result > 0)
if(GM.GetInitiator().getRelationShipRank(GM.GetTarget()) == 4)
FlirtLoversScene.ForceStart()
else
FlirtScene.ForceStart()
endif
else 
FailScene.ForceStart()

endif
else
NoResponseScene.ForceStart()
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_8
Function Fragment_8()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Flirt Quest successful")
GM.successfulQuest("flirt",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
Reset()
Start()
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property FlirtPlayerScene  Auto  

Scene Property FailScene  Auto  

Scene Property NoResponseScene  Auto  

Keyword Property CIFKeyword  Auto  

Int Property result = 0 Auto  

Scene Property FlirtLoversScene  Auto  

Scene Property LoversScene  Auto  
