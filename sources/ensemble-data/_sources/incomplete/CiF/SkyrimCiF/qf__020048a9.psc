;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 12
Scriptname QF__020048A9 Extends Quest Hidden

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
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Insult Quest successful")
GM.successfulQuest("insult",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(),result)
GM.successfulQuest("fight",Alias_Target.getActorRef(), Alias_Initiator.getActorRef(),result)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_9
Function Fragment_9()
;BEGIN CODE
;WARNING: Unable to load fragment source from function Fragment_9 in script QF__020048A9
;Source NOT loaded
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

Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to insult " + GM.getTarget().getActorBase().GetName())

if(targ.HasKeyword(CIFKeyword))
 result = GM.ResponderRules("insult", GM.GetInitiator(), GM.GetTarget())


if(!targ.HasKeyword(AgressiveKeyword))
if(GM.GetTarget() != Game.GetPlayer())
if(result < -1 )
HateScene.ForceStart()
else
InsultScene.ForceStart()
endif
else
InsultPlayerScene.ForceStart()
endif
else
FightScene.ForceStart()
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
Debug.Notification("Insult Quest successful")
GM.successfulQuest("insult",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(),result)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property InsultScene  Auto  

Bool Property insult_bool = False Auto  

Scene Property InsultPlayerScene  Auto  

Scene Property HateScene  Auto  

Keyword Property CIFKeyword  Auto  

Scene Property NoResponseScene  Auto  

Int Property result = 0 Auto  

Keyword Property AgressiveKeyword  Auto  

Scene Property FightScene  Auto  
