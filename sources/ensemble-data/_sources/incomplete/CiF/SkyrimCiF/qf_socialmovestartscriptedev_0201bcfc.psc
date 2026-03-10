;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 34
Scriptname QF_SocialMoveStartScriptedEv_0201BCFC Extends Quest Hidden

;BEGIN ALIAS PROPERTY James
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_James Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Tom
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Tom Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY ciflocation
;ALIAS PROPERTY TYPE LocationAlias
LocationAlias Property Alias_ciflocation Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Sarah
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Sarah Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Note
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Note Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY questlocation
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_questlocation Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_22
Function Fragment_22()
;BEGIN CODE
ObjectReference obj = Alias_Tom.GetActorReference() as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerHurtActor()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_25
Function Fragment_25()
;BEGIN CODE
ObjectReference obj = Alias_Tom.GetActorReference() as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerHelpedActor()
cif_script.LoverCheated()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_5
Function Fragment_5()
;BEGIN CODE
SetObjectiveDisplayed(10)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_20
Function Fragment_20()
;BEGIN CODE
SetObjectiveCompleted(20)
SetObjectiveDisplayed(30)
ObjectReference obj = Alias_Tom.GetActorReference() as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerHurtActor()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_32
Function Fragment_32()
;BEGIN CODE
ObjectReference obj2 = Alias_Sarah.GetActorReference() as ObjectReference
CIFRPG20 cif_script2 = obj2 as CIFRPG20 
cif_script2.PlayerHurtActor()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_2
Function Fragment_2()
;BEGIN CODE
SetObjectiveCompleted(10)
ScriptedScene.Stop()
ScriptedScene.ForceStart()
SetObjectiveDisplayed(20)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_27
Function Fragment_27()
;BEGIN CODE
ObjectReference obj = Alias_Tom.GetActorReference() as ObjectReference
CIFRPG20 cif_script = obj as CIFRPG20 
cif_script.PlayerHelpedActor()
ObjectReference obj2 = Alias_Sarah.GetActorReference() as ObjectReference
CIFRPG20 cif_script2 = obj2 as CIFRPG20 
cif_script2.PlayerHelpedActor()
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_29
Function Fragment_29()
;BEGIN CODE
alias_Note.ForceRefTo(Game.GetPlayer().PlaceAtMe(Note))
(WICourier as WICourierScript).addAliasToContainer(alias_Note)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_12
Function Fragment_12()
;BEGIN CODE
SetObjectiveCompleted(20)
SetObjectiveDisplayed(30)
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_23
Function Fragment_23()
;BEGIN CODE
setObjectiveCompleted(30)
setObjectiveDisplayed(40)
SocialMoveStartScriptedHelpJames.start()
SocialMoveStartScriptedHelpJames.setstage(10)
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Quest Property WICourier  Auto  

Book Property Note  Auto  

Scene Property ScriptedScene  Auto  

Quest Property SocialMoveStartScriptedHelpJames  Auto  
