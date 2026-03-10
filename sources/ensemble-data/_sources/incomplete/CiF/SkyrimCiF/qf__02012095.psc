;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 10
Scriptname QF__02012095 Extends Quest Hidden

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
Debug.Notification("Insult Quest failed")
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

ObjectReference targ_obj = GM.GetTarget() as ObjectReference
CIFRPG20 target_script= targ_obj as CIFRPG20 

Embarrasing_social_exchange = target_script.getEmbarrassingMove()

embarrassing_target = target_script.getEmbarrassingMoveTarget()
TargetSex = embarrassing_Target.getactorbase().getSex()
Debug.Notification(GM.GetInitiator().getActorBase().getName() + " is going to embarass "  + GM.GetTarget().getActorBase().getName())
Debug.OpenUserLog("myUserLog")




ObjectReference targ= Alias_Target.GetReference() as ObjectReference
_result = GM.ResponderRules("embarass", GM.GetInitiator(), GM.GetTarget())


if( Embarrasing_social_exchange == "flirt")
ExchangeName = 1
else
if( Embarrasing_social_exchange == "compliment")
ExchangeName = 2
endif
endif

Debug.TraceUser("myUserLog"," Going to embarass, initator: " + GM.GetInitiator().getActorBase().getName() + " target: " + GM.GetTarget().getActorBase().getName() + " embarrassing quest: " + Embarrasing_social_exchange + " embarrassing_target " + embarrassing_target.getActorBasE().getName() + "  ExchangeName  "+ ExchangeName   + " \n")

if(targ.HasKeyword(CIFKeyword))
HateScene.ForceStart()
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
Debug.Notification("Embarass Quest successful")
GM.successfulQuest("embarass",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), _result)
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

Actor Property embarrassing_target  Auto  

Int Property _result  Auto  

String Property Embarrasing_social_exchange  Auto Conditional

Int Property TargetSex  Auto  Conditional

Int Property ExchangeName  Auto  Conditional
