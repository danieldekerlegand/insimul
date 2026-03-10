;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 23
Scriptname QF__0202A1CE Extends Quest Hidden

;BEGIN ALIAS PROPERTY James
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_James Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_2
Function Fragment_2()
;BEGIN CODE
SetObjectiveDisplayed(20)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_20
Function Fragment_20()
;BEGIN CODE
CompleteScene.ForceStart()
SetObjectiveCompleted(20)
ObjectReference obj = Alias_James.GetActorReference() as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_Script.PlayerHelpedActor()

if(SocialMoveHello.getStage() != 0)
SocialMoveHello.setStage(30)
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_22
Function Fragment_22()
;BEGIN CODE
if(Alias_James.GetActorReference().GetRelationShipRank(Game.GetPlayer()) == 0)
Alias_James.GetActorReference().SetRelationShipRank(Game.GetPlayer(), 1)
endif

if(SocialMoveHello.getStage() != 0)
SocialMoveHello.setStage(30)
endif
ScriptedScene.ForceStart()
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Quest Property WICourier  Auto  

Book Property Note  Auto  

Scene Property ScriptedScene  Auto  

Scene Property CompleteScene  Auto  

Quest Property SocialMoveHello  Auto  
