// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulDialogueWidget.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulDialogueWidget() {}

// ********** Begin Cross Module References ********************************************************
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulConversationComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDialogueWidget();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDialogueWidget_NoRegister();
UMG_API UClass* Z_Construct_UClass_UUserWidget();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulDialogueWidget Function BP_AddUtterance **************************
struct InsimulDialogueWidget_eventBP_AddUtterance_Parms
{
	FString Speaker;
	FString Text;
};
static FName NAME_UInsimulDialogueWidget_BP_AddUtterance = FName(TEXT("BP_AddUtterance"));
void UInsimulDialogueWidget::BP_AddUtterance(const FString& Speaker, const FString& Text)
{
	InsimulDialogueWidget_eventBP_AddUtterance_Parms Parms;
	Parms.Speaker=Speaker;
	Parms.Text=Text;
	UFunction* Func = FindFunctionChecked(NAME_UInsimulDialogueWidget_BP_AddUtterance);
	ProcessEvent(Func,&Parms);
}
struct Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Override in Blueprint to display a new utterance line in the conversation UI.\n\x09 * @param Speaker  The character ID or display name of the speaker\n\x09 * @param Text     The line of dialogue\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Override in Blueprint to display a new utterance line in the conversation UI.\n@param Speaker  The character ID or display name of the speaker\n@param Text     The line of dialogue" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Speaker_MetaData[] = {
		{ "NativeConst", "" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Text_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function BP_AddUtterance constinit property declarations ***********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Speaker;
	static const UECodeGen_Private::FStrPropertyParams NewProp_Text;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function BP_AddUtterance constinit property declarations *************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function BP_AddUtterance Property Definitions **********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::NewProp_Speaker = { "Speaker", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulDialogueWidget_eventBP_AddUtterance_Parms, Speaker), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Speaker_MetaData), NewProp_Speaker_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::NewProp_Text = { "Text", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulDialogueWidget_eventBP_AddUtterance_Parms, Text), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Text_MetaData), NewProp_Text_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::NewProp_Speaker,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::NewProp_Text,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::PropPointers) < 2048);
// ********** End Function BP_AddUtterance Property Definitions ************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulDialogueWidget, nullptr, "BP_AddUtterance", 	Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::PropPointers), 
sizeof(InsimulDialogueWidget_eventBP_AddUtterance_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08020800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(InsimulDialogueWidget_eventBP_AddUtterance_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance_Statics::FuncParams);
	}
	return ReturnFunction;
}
// ********** End Class UInsimulDialogueWidget Function BP_AddUtterance ****************************

// ********** Begin Class UInsimulDialogueWidget Function BP_ClearHistory **************************
static FName NAME_UInsimulDialogueWidget_BP_ClearHistory = FName(TEXT("BP_ClearHistory"));
void UInsimulDialogueWidget::BP_ClearHistory()
{
	UFunction* Func = FindFunctionChecked(NAME_UInsimulDialogueWidget_BP_ClearHistory);
	ProcessEvent(Func,NULL);
}
struct Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Override in Blueprint to clear all conversation history from the display */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Override in Blueprint to clear all conversation history from the display" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function BP_ClearHistory constinit property declarations ***********************
// ********** End Function BP_ClearHistory constinit property declarations *************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulDialogueWidget, nullptr, "BP_ClearHistory", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x08020800, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory_Statics::FuncParams);
	}
	return ReturnFunction;
}
// ********** End Class UInsimulDialogueWidget Function BP_ClearHistory ****************************

// ********** Begin Class UInsimulDialogueWidget Function CloseDialogue ****************************
struct Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Ends the conversation, restores game input, and removes this widget from the viewport */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Ends the conversation, restores game input, and removes this widget from the viewport" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function CloseDialogue constinit property declarations *************************
// ********** End Function CloseDialogue constinit property declarations ***************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulDialogueWidget, nullptr, "CloseDialogue", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulDialogueWidget::execCloseDialogue)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->CloseDialogue();
	P_NATIVE_END;
}
// ********** End Class UInsimulDialogueWidget Function CloseDialogue ******************************

// ********** Begin Class UInsimulDialogueWidget Function SetConversationComponent *****************
struct Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics
{
	struct InsimulDialogueWidget_eventSetConversationComponent_Parms
	{
		UInsimulConversationComponent* Comp;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Called by InsimulAICharacter to link this widget to the NPC's conversation component */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called by InsimulAICharacter to link this widget to the NPC's conversation component" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Comp_MetaData[] = {
		{ "EditInline", "true" },
	};
#endif // WITH_METADATA

// ********** Begin Function SetConversationComponent constinit property declarations **************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_Comp;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetConversationComponent constinit property declarations ****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetConversationComponent Property Definitions *************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::NewProp_Comp = { "Comp", nullptr, (EPropertyFlags)0x0010000000080080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulDialogueWidget_eventSetConversationComponent_Parms, Comp), Z_Construct_UClass_UInsimulConversationComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Comp_MetaData), NewProp_Comp_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::NewProp_Comp,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::PropPointers) < 2048);
// ********** End Function SetConversationComponent Property Definitions ***************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulDialogueWidget, nullptr, "SetConversationComponent", 	Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::InsimulDialogueWidget_eventSetConversationComponent_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::InsimulDialogueWidget_eventSetConversationComponent_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulDialogueWidget::execSetConversationComponent)
{
	P_GET_OBJECT(UInsimulConversationComponent,Z_Param_Comp);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetConversationComponent(Z_Param_Comp);
	P_NATIVE_END;
}
// ********** End Class UInsimulDialogueWidget Function SetConversationComponent *******************

// ********** Begin Class UInsimulDialogueWidget Function SubmitPlayerMessage **********************
struct Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics
{
	struct InsimulDialogueWidget_eventSubmitPlayerMessage_Parms
	{
		FString Message;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Called by the Blueprint Send button to submit the player's typed message.\n\x09 * Forwards the message to the conversation component which sends it to the Insimul API.\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Called by the Blueprint Send button to submit the player's typed message.\nForwards the message to the conversation component which sends it to the Insimul API." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Message_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function SubmitPlayerMessage constinit property declarations *******************
	static const UECodeGen_Private::FStrPropertyParams NewProp_Message;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SubmitPlayerMessage constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SubmitPlayerMessage Property Definitions ******************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::NewProp_Message = { "Message", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulDialogueWidget_eventSubmitPlayerMessage_Parms, Message), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Message_MetaData), NewProp_Message_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::NewProp_Message,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::PropPointers) < 2048);
// ********** End Function SubmitPlayerMessage Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulDialogueWidget, nullptr, "SubmitPlayerMessage", 	Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::InsimulDialogueWidget_eventSubmitPlayerMessage_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::InsimulDialogueWidget_eventSubmitPlayerMessage_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulDialogueWidget::execSubmitPlayerMessage)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_Message);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SubmitPlayerMessage(Z_Param_Message);
	P_NATIVE_END;
}
// ********** End Class UInsimulDialogueWidget Function SubmitPlayerMessage ************************

// ********** Begin Class UInsimulDialogueWidget ***************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulDialogueWidget;
UClass* UInsimulDialogueWidget::GetPrivateStaticClass()
{
	using TClass = UInsimulDialogueWidget;
	if (!Z_Registration_Info_UClass_UInsimulDialogueWidget.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulDialogueWidget"),
			Z_Registration_Info_UClass_UInsimulDialogueWidget.InnerSingleton,
			StaticRegisterNativesUInsimulDialogueWidget,
			sizeof(TClass),
			alignof(TClass),
			TClass::StaticClassFlags,
			TClass::StaticClassCastFlags(),
			TClass::StaticConfigName(),
			(UClass::ClassConstructorType)InternalConstructor<TClass>,
			(UClass::ClassVTableHelperCtorCallerType)InternalVTableHelperCtorCaller<TClass>,
			UOBJECT_CPPCLASS_STATICFUNCTIONS_FORCLASS(TClass),
			&TClass::Super::StaticClass,
			&TClass::WithinClass::StaticClass
		);
	}
	return Z_Registration_Info_UClass_UInsimulDialogueWidget.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulDialogueWidget_NoRegister()
{
	return UInsimulDialogueWidget::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulDialogueWidget_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintType", "true" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Base C++ class for the Insimul player dialogue UI.\n * Create a Blueprint child class (WBP_InsimulDialogue) in the editor with the actual layout:\n *   - A scroll box or text block to show conversation history (bound to BP_AddUtterance)\n *   - An editable text box for player input\n *   - A \"Send\" button that calls SubmitPlayerMessage with the text box contents\n *   - A \"Close\" button that calls CloseDialogue\n */" },
#endif
		{ "IncludePath", "InsimulDialogueWidget.h" },
		{ "IsBlueprintBase", "true" },
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Base C++ class for the Insimul player dialogue UI.\nCreate a Blueprint child class (WBP_InsimulDialogue) in the editor with the actual layout:\n  - A scroll box or text block to show conversation history (bound to BP_AddUtterance)\n  - An editable text box for player input\n  - A \"Send\" button that calls SubmitPlayerMessage with the text box contents\n  - A \"Close\" button that calls CloseDialogue" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ConversationComponent_MetaData[] = {
		{ "Category", "Insimul" },
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulDialogueWidget.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulDialogueWidget constinit property declarations *******************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_ConversationComponent;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulDialogueWidget constinit property declarations *********************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("CloseDialogue"), .Pointer = &UInsimulDialogueWidget::execCloseDialogue },
		{ .NameUTF8 = UTF8TEXT("SetConversationComponent"), .Pointer = &UInsimulDialogueWidget::execSetConversationComponent },
		{ .NameUTF8 = UTF8TEXT("SubmitPlayerMessage"), .Pointer = &UInsimulDialogueWidget::execSubmitPlayerMessage },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulDialogueWidget_BP_AddUtterance, "BP_AddUtterance" }, // 2574398918
		{ &Z_Construct_UFunction_UInsimulDialogueWidget_BP_ClearHistory, "BP_ClearHistory" }, // 2078724440
		{ &Z_Construct_UFunction_UInsimulDialogueWidget_CloseDialogue, "CloseDialogue" }, // 2865141582
		{ &Z_Construct_UFunction_UInsimulDialogueWidget_SetConversationComponent, "SetConversationComponent" }, // 2624133734
		{ &Z_Construct_UFunction_UInsimulDialogueWidget_SubmitPlayerMessage, "SubmitPlayerMessage" }, // 3182138217
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulDialogueWidget>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulDialogueWidget_Statics

// ********** Begin Class UInsimulDialogueWidget Property Definitions ******************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulDialogueWidget_Statics::NewProp_ConversationComponent = { "ConversationComponent", nullptr, (EPropertyFlags)0x002008000008201c, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulDialogueWidget, ConversationComponent), Z_Construct_UClass_UInsimulConversationComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ConversationComponent_MetaData), NewProp_ConversationComponent_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulDialogueWidget_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulDialogueWidget_Statics::NewProp_ConversationComponent,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDialogueWidget_Statics::PropPointers) < 2048);
// ********** End Class UInsimulDialogueWidget Property Definitions ********************************
UObject* (*const Z_Construct_UClass_UInsimulDialogueWidget_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UUserWidget,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDialogueWidget_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulDialogueWidget_Statics::ClassParams = {
	&UInsimulDialogueWidget::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulDialogueWidget_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDialogueWidget_Statics::PropPointers),
	0,
	0x00B010A1u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDialogueWidget_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulDialogueWidget_Statics::Class_MetaDataParams)
};
void UInsimulDialogueWidget::StaticRegisterNativesUInsimulDialogueWidget()
{
	UClass* Class = UInsimulDialogueWidget::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulDialogueWidget_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulDialogueWidget()
{
	if (!Z_Registration_Info_UClass_UInsimulDialogueWidget.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulDialogueWidget.OuterSingleton, Z_Construct_UClass_UInsimulDialogueWidget_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulDialogueWidget.OuterSingleton;
}
UInsimulDialogueWidget::UInsimulDialogueWidget(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulDialogueWidget);
UInsimulDialogueWidget::~UInsimulDialogueWidget() {}
// ********** End Class UInsimulDialogueWidget *****************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulDialogueWidget, UInsimulDialogueWidget::StaticClass, TEXT("UInsimulDialogueWidget"), &Z_Registration_Info_UClass_UInsimulDialogueWidget, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulDialogueWidget), 3404557776U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h__Script_InsimulRuntime_4124826916{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
