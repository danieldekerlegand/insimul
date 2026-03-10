;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 13
Scriptname QF__020058D9 Extends Quest Hidden

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_11
Function Fragment_11()
;BEGIN CODE
Debug.Notification("ShareFeelings Quest failed")
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
GM.failedQuest("sharefeelings",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
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
Debug.Notification( "" + GM.GetInitiator().GetActorBase().GetName() + " is going to share feelings with " + GM.GetTarget().GetActorBase().GetName())
if(targ.HasKeyword(CIFKeyword))
 result = GM.ResponderRules("sharefeelings", GM.GetInitiator(), GM.GetTarget())

if(result > 0)
FlirtScene.ForceStart()
else 
FailedScene.ForceStart()
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
Debug.Notification("Share Feelings Quest successful")
GM.successfulQuest("sharefeelings",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(),result)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property FailedScene  Auto  

Keyword Property CIFKeyword  Auto  

Scene Property NoResponseScene  Auto  

Int Property result = 0 Auto  
