;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 13
Scriptname QF__02025ED9 Extends Quest Hidden

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
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Actor init =Alias_Initiator.getActorRef()
Actor targ = Alias_Target.getActorRef()

GM.failedQuest("hello",init , targ, HelloResult)
Debug.Notification("Hello Quest failed")

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

if(GM.GetTarget() != Game.GetPlayer())
ObjectReference targ= Alias_Target.GetReference() as ObjectReference
HelloResult = GM.ResponderRules("hello", GM.GetInitiator(), GM.GetTarget())
Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to greet " + GM.getTarget().getActorBase().GetName())
if(result > 0)
FlirtScene.ForceStart()
else 
FailScene.ForceStart()
endif
else
Debug.Notification("Going to greet " + " Initiator " +GM.getInitiator().getActorBase().GetName() + " Target: " + GM.getTarget().getActorBase().GetName())
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
Actor init =Alias_Initiator.getActorRef()
Actor targ = Alias_Target.getActorRef()


Debug.Notification("Hello Quest Completed")

GM.successfulQuest("hello",init , targ, HelloResult)
Reset()
Start()
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Quest Property PlayerScene  Auto  

Scene Property PlayerComplimentScene  Auto  

Scene Property FailScene  Auto  

Scene Property NoResponseScene  Auto  

Keyword Property CIFKeyword  Auto  

Int Property result  Auto  

Int Property HelloResult  Auto  Conditional
