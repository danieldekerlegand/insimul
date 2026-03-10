;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 11
Scriptname QF__020058DA Extends Quest Hidden

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_9
Function Fragment_9()
;BEGIN CODE
Debug.Notification("AskOut Quest failed")
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
GM.failedQuest("askout",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
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
if(targ.HasKeyword(CIFKeyword))
result = GM.ResponderRules("askout", GM.GetInitiator(), GM.GetTarget())
Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to ask " + GM.getTarget().getActorBase().GetName() + " out" )
if(  result> 0 )
FlirtScene.ForceStart()
else
AskOutFailedScene.ForceStart()
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
Debug.Notification("Ask Out Quest successful")
GM.successfulQuest("askout",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  


Scene Property AskOutFailedScene  Auto  

Scene Property NoResponseScene  Auto  

Keyword Property CIFKeyword  Auto  

Int Property result  Auto  

  
