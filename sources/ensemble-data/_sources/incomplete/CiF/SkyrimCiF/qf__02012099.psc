;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 10
Scriptname QF__02012099 Extends Quest Hidden

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_8
Function Fragment_8()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Blame Quest successful")
GM.successfulQuest("blame",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_9
Function Fragment_9()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Blame Quest failed")
GM.failedQuest("blame",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
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
result = GM.ResponderRules("blame", GM.GetInitiator(), GM.GetTarget())
Debug.Notification("Going to blame " + result)

HateScene.ForceStart()
else
NoResponseScene.ForceStart()
endif
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property InsultScene  Auto  

Bool Property insult_bool = False Auto  

Scene Property InsultPlayerScene  Auto  

Scene Property HateScene  Auto  

Scene Property NoResponseScene  Auto  

Keyword Property CIFKeyword  Auto  

Int Property result  Auto  
