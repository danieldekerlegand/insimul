;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 10
Scriptname QF__020166BF Extends Quest Hidden

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY TargetAux
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_TargetAux Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_9
Function Fragment_9()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Insult Others Quest failed ")
GM.failedQuest("insultothernpc",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
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
Alias_TargetAux.ForceRefTo(GM.GetTargetAux())
Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to spread rumours about " + GM.getTargetAux().getActorBase().GetName())
result = GM.ResponderRules("insultothernpc", GM.GetInitiator(), GM.GetTarget())



if(result > 0 )
if(GM.GetTarget().getActorBase().getSex() == 1)
HateScene.ForceStart()
else
TargetFemaleScene.ForceStart()
endif
else
InsultScene.ForceStart()
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_8
Function Fragment_8()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Insult Others Quest successful")
GM.successfulQuest("insultothernpc",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property InsultScene  Auto  

Bool Property insult_bool = False Auto  

Scene Property InsultPlayerScene  Auto  

Scene Property HateScene  Auto  

Int Property result = 0 Auto  

Scene Property TargetFemaleScene  Auto  
