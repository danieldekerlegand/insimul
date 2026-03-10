;BEGIN FRAGMENT CODE - Do not edit anything between this and the end comment
;NEXT FRAGMENT INDEX 15
Scriptname QF__0200FAC4 Extends Quest Hidden

;BEGIN ALIAS PROPERTY soulgem_present
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_soulgem_present Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY Initiator
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_Initiator Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY present
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_present Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY book_present
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_book_present Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY weapon_present
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_weapon_present Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY target
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_target Auto
;END ALIAS PROPERTY

;BEGIN ALIAS PROPERTY armor_present
;ALIAS PROPERTY TYPE ReferenceAlias
ReferenceAlias Property Alias_armor_present Auto
;END ALIAS PROPERTY

;BEGIN FRAGMENT Fragment_10
Function Fragment_10()
;BEGIN CODE
Debug.Notification("Offer Gift Quest failed")
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
if(Alias_Initiator != None && Alias_Target != None )
GM.failedQuest("offergift",Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_11
Function Fragment_11()
;BEGIN CODE
Debug.Notification("offer gift failed")
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
Debug.Notification(GM.getInitiator().getActorBase().GetName() + " is going to offer a gift to " + GM.getTarget().getActorBase().GetName())

if(GM.GetGiftToOffer() == "Weapon" && Alias_Weapon_present != None)
Alias_present.ForceRefTo(Alias_Weapon_present.getref())
else 
if(GM.GetGiftToOffer() == "Armor" && Alias_Armor_present.getref() != None)
Alias_present.ForceRefTo(Alias_Armor_present.getref())
else
if(GM.GetGiftToOffer() == "Soulgem" && Alias_SoulGem_present.getref() != None)
Alias_present.ForceRefTo(Alias_SoulGem_present.getref())
else
if(Alias_Book_present.getref() != None)
Alias_present.ForceRefTo(Alias_Book_present.getref())
else
Debug.Notification("Couldn't find a gift nearby")
endif
endif
endif
endif
if(GM.GetOption() == "offerromanticgift")
result = GM.ResponderRules("offerromanticgift", GM.GetInitiator(), GM.GetTarget())
else
result = GM.ResponderRules("offergift", GM.GetInitiator(), GM.GetTarget())
endif
if(GM.GetTarget() != Game.GetPlayer())
if(result > 0)
FlirtScene.ForceStart()
else 
FailScene.ForceStart()
endif
else
FlirtPlayerScene.ForceStart()
endif
;END CODE
EndFunction
;END FRAGMENT

;BEGIN FRAGMENT Fragment_8
Function Fragment_8()
;BEGIN CODE
ObjectReference obj = Game.GetPlayer() as ObjectReference
GameManagerScript GM = obj as GameManagerScript
Debug.Notification("Offer Romantic Gift Quest successful")
GM.successfulQuest( "offergift", Alias_Initiator.getActorRef(), Alias_Target.getActorRef(), result)
Alias_Target.GetRef().AddItem(Alias_present.getref())
;END CODE
EndFunction
;END FRAGMENT

;END FRAGMENT CODE - Do not edit anything between this and the begin comment

Scene Property FlirtScene  Auto  

Scene Property FlirtPlayerScene  Auto  

Scene Property FailScene  Auto  

Int Property result = 0 Auto  
