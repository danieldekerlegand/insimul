// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulQuestManager.h"
#include "Engine/GameInstance.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulQuestManager() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UClass_NoRegister();
COREUOBJECT_API UClass* Z_Construct_UClass_UObject();
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FVector2D();
ENGINE_API UClass* Z_Construct_UClass_APlayerController_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
ENGINE_API UClass* Z_Construct_UClass_UGameInstanceSubsystem();
ENGINE_API UClass* Z_Construct_UClass_UWorld_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestDisplayComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestDisplayComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestHUDComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestHUDComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestManager();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestManager_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestWidget_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulQuestManager Function ConfigureQuestSystem ***********************
struct Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics
{
	struct InsimulQuestManager_eventConfigureQuestSystem_Parms
	{
		FString ServerURL;
		bool bAutoRefresh;
		float RefreshInterval;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Configure the quest system\n\x09 */" },
#endif
		{ "CPP_Default_bAutoRefresh", "true" },
		{ "CPP_Default_RefreshInterval", "5.000000" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Configure the quest system" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function ConfigureQuestSystem constinit property declarations ******************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static void NewProp_bAutoRefresh_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutoRefresh;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_RefreshInterval;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function ConfigureQuestSystem constinit property declarations ********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function ConfigureQuestSystem Property Definitions *****************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestManager_eventConfigureQuestSystem_Parms, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
void Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_bAutoRefresh_SetBit(void* Obj)
{
	((InsimulQuestManager_eventConfigureQuestSystem_Parms*)Obj)->bAutoRefresh = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_bAutoRefresh = { "bAutoRefresh", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulQuestManager_eventConfigureQuestSystem_Parms), &Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_bAutoRefresh_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_RefreshInterval = { "RefreshInterval", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestManager_eventConfigureQuestSystem_Parms, RefreshInterval), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_ServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_bAutoRefresh,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::NewProp_RefreshInterval,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::PropPointers) < 2048);
// ********** End Function ConfigureQuestSystem Property Definitions *******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "ConfigureQuestSystem", 	Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::InsimulQuestManager_eventConfigureQuestSystem_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::InsimulQuestManager_eventConfigureQuestSystem_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execConfigureQuestSystem)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_ServerURL);
	P_GET_UBOOL(Z_Param_bAutoRefresh);
	P_GET_PROPERTY(FFloatProperty,Z_Param_RefreshInterval);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ConfigureQuestSystem(Z_Param_ServerURL,Z_Param_bAutoRefresh,Z_Param_RefreshInterval);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function ConfigureQuestSystem *************************

// ********** Begin Class UInsimulQuestManager Function GetQuestWidget *****************************
struct Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics
{
	struct InsimulQuestManager_eventGetQuestWidget_Parms
	{
		UInsimulQuestWidget* ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get the quest widget instance\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get the quest widget instance" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ReturnValue_MetaData[] = {
		{ "EditInline", "true" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetQuestWidget constinit property declarations ************************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetQuestWidget constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetQuestWidget Property Definitions ***********************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000080588, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestManager_eventGetQuestWidget_Parms, ReturnValue), Z_Construct_UClass_UInsimulQuestWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ReturnValue_MetaData), NewProp_ReturnValue_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::PropPointers) < 2048);
// ********** End Function GetQuestWidget Property Definitions *************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "GetQuestWidget", 	Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::InsimulQuestManager_eventGetQuestWidget_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::InsimulQuestManager_eventGetQuestWidget_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execGetQuestWidget)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(UInsimulQuestWidget**)Z_Param__Result=P_THIS->GetQuestWidget();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function GetQuestWidget *******************************

// ********** Begin Class UInsimulQuestManager Function HideQuestPanel *****************************
struct Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Hide the quest panel\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Hide the quest panel" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function HideQuestPanel constinit property declarations ************************
// ********** End Function HideQuestPanel constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "HideQuestPanel", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execHideQuestPanel)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->HideQuestPanel();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function HideQuestPanel *******************************

// ********** Begin Class UInsimulQuestManager Function IsQuestPanelVisible ************************
struct Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics
{
	struct InsimulQuestManager_eventIsQuestPanelVisible_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Check if quest panel is visible\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Check if quest panel is visible" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsQuestPanelVisible constinit property declarations *******************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsQuestPanelVisible constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsQuestPanelVisible Property Definitions ******************************
void Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulQuestManager_eventIsQuestPanelVisible_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulQuestManager_eventIsQuestPanelVisible_Parms), &Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::PropPointers) < 2048);
// ********** End Function IsQuestPanelVisible Property Definitions ********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "IsQuestPanelVisible", 	Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::InsimulQuestManager_eventIsQuestPanelVisible_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::InsimulQuestManager_eventIsQuestPanelVisible_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execIsQuestPanelVisible)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->IsQuestPanelVisible();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function IsQuestPanelVisible **************************

// ********** Begin Class UInsimulQuestManager Function ShowQuestPanel *****************************
struct Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics
{
	struct InsimulQuestManager_eventShowQuestPanel_Parms
	{
		FString CharacterId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Show the quest panel for a character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Show the quest panel for a character" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function ShowQuestPanel constinit property declarations ************************
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function ShowQuestPanel constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function ShowQuestPanel Property Definitions ***********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulQuestManager_eventShowQuestPanel_Parms, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::NewProp_CharacterId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::PropPointers) < 2048);
// ********** End Function ShowQuestPanel Property Definitions *************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "ShowQuestPanel", 	Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::InsimulQuestManager_eventShowQuestPanel_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::InsimulQuestManager_eventShowQuestPanel_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execShowQuestPanel)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_CharacterId);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ShowQuestPanel(Z_Param_CharacterId);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function ShowQuestPanel *******************************

// ********** Begin Class UInsimulQuestManager Function ToggleQuestPanel ***************************
struct Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Toggle quest panel visibility\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Toggle quest panel visibility" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function ToggleQuestPanel constinit property declarations **********************
// ********** End Function ToggleQuestPanel constinit property declarations ************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestManager, nullptr, "ToggleQuestPanel", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestManager::execToggleQuestPanel)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ToggleQuestPanel();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestManager Function ToggleQuestPanel *****************************

// ********** Begin Class UInsimulQuestManager *****************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulQuestManager;
UClass* UInsimulQuestManager::GetPrivateStaticClass()
{
	using TClass = UInsimulQuestManager;
	if (!Z_Registration_Info_UClass_UInsimulQuestManager.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulQuestManager"),
			Z_Registration_Info_UClass_UInsimulQuestManager.InnerSingleton,
			StaticRegisterNativesUInsimulQuestManager,
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
	return Z_Registration_Info_UClass_UInsimulQuestManager.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulQuestManager_NoRegister()
{
	return UInsimulQuestManager::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulQuestManager_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Game Instance Subsystem that manages the quest UI\n * Automatically creates and updates the quest widget\n */" },
#endif
		{ "IncludePath", "InsimulQuestManager.h" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Game Instance Subsystem that manages the quest UI\nAutomatically creates and updates the quest widget" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestWidgetClass_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Widget class to use for quest panel (set in Project Settings or override in Blueprint)\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Widget class to use for quest panel (set in Project Settings or override in Blueprint)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestWidget_MetaData[] = {
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulQuestManager constinit property declarations *********************
	static const UECodeGen_Private::FClassPropertyParams NewProp_QuestWidgetClass;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_QuestWidget;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulQuestManager constinit property declarations ***********************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("ConfigureQuestSystem"), .Pointer = &UInsimulQuestManager::execConfigureQuestSystem },
		{ .NameUTF8 = UTF8TEXT("GetQuestWidget"), .Pointer = &UInsimulQuestManager::execGetQuestWidget },
		{ .NameUTF8 = UTF8TEXT("HideQuestPanel"), .Pointer = &UInsimulQuestManager::execHideQuestPanel },
		{ .NameUTF8 = UTF8TEXT("IsQuestPanelVisible"), .Pointer = &UInsimulQuestManager::execIsQuestPanelVisible },
		{ .NameUTF8 = UTF8TEXT("ShowQuestPanel"), .Pointer = &UInsimulQuestManager::execShowQuestPanel },
		{ .NameUTF8 = UTF8TEXT("ToggleQuestPanel"), .Pointer = &UInsimulQuestManager::execToggleQuestPanel },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulQuestManager_ConfigureQuestSystem, "ConfigureQuestSystem" }, // 2115596301
		{ &Z_Construct_UFunction_UInsimulQuestManager_GetQuestWidget, "GetQuestWidget" }, // 3609689164
		{ &Z_Construct_UFunction_UInsimulQuestManager_HideQuestPanel, "HideQuestPanel" }, // 1368962493
		{ &Z_Construct_UFunction_UInsimulQuestManager_IsQuestPanelVisible, "IsQuestPanelVisible" }, // 211779795
		{ &Z_Construct_UFunction_UInsimulQuestManager_ShowQuestPanel, "ShowQuestPanel" }, // 1986158916
		{ &Z_Construct_UFunction_UInsimulQuestManager_ToggleQuestPanel, "ToggleQuestPanel" }, // 446902203
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulQuestManager>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulQuestManager_Statics

// ********** Begin Class UInsimulQuestManager Property Definitions ********************************
const UECodeGen_Private::FClassPropertyParams Z_Construct_UClass_UInsimulQuestManager_Statics::NewProp_QuestWidgetClass = { "QuestWidgetClass", nullptr, (EPropertyFlags)0x0014000000004005, UECodeGen_Private::EPropertyGenFlags::Class, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestManager, QuestWidgetClass), Z_Construct_UClass_UClass_NoRegister, Z_Construct_UClass_UInsimulQuestWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestWidgetClass_MetaData), NewProp_QuestWidgetClass_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulQuestManager_Statics::NewProp_QuestWidget = { "QuestWidget", nullptr, (EPropertyFlags)0x0040000000080008, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestManager, QuestWidget), Z_Construct_UClass_UInsimulQuestWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestWidget_MetaData), NewProp_QuestWidget_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulQuestManager_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestManager_Statics::NewProp_QuestWidgetClass,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestManager_Statics::NewProp_QuestWidget,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestManager_Statics::PropPointers) < 2048);
// ********** End Class UInsimulQuestManager Property Definitions **********************************
UObject* (*const Z_Construct_UClass_UInsimulQuestManager_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UGameInstanceSubsystem,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestManager_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulQuestManager_Statics::ClassParams = {
	&UInsimulQuestManager::StaticClass,
	"Game",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulQuestManager_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestManager_Statics::PropPointers),
	0,
	0x009000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestManager_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulQuestManager_Statics::Class_MetaDataParams)
};
void UInsimulQuestManager::StaticRegisterNativesUInsimulQuestManager()
{
	UClass* Class = UInsimulQuestManager::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulQuestManager_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulQuestManager()
{
	if (!Z_Registration_Info_UClass_UInsimulQuestManager.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulQuestManager.OuterSingleton, Z_Construct_UClass_UInsimulQuestManager_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulQuestManager.OuterSingleton;
}
UInsimulQuestManager::UInsimulQuestManager() {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulQuestManager);
UInsimulQuestManager::~UInsimulQuestManager() {}
// ********** End Class UInsimulQuestManager *******************************************************

// ********** Begin Class UInsimulQuestDisplayComponent Function RefreshQuests *********************
struct Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Refresh the quest display\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Refresh the quest display" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function RefreshQuests constinit property declarations *************************
// ********** End Function RefreshQuests constinit property declarations ***************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestDisplayComponent, nullptr, "RefreshQuests", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestDisplayComponent::execRefreshQuests)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->RefreshQuests();
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestDisplayComponent Function RefreshQuests ***********************

// ********** Begin Class UInsimulQuestDisplayComponent Function SetQuestPanelVisible **************
struct Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics
{
	struct InsimulQuestDisplayComponent_eventSetQuestPanelVisible_Parms
	{
		bool bVisible;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Show/hide the quest panel\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Show/hide the quest panel" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function SetQuestPanelVisible constinit property declarations ******************
	static void NewProp_bVisible_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bVisible;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetQuestPanelVisible constinit property declarations ********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetQuestPanelVisible Property Definitions *****************************
void Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::NewProp_bVisible_SetBit(void* Obj)
{
	((InsimulQuestDisplayComponent_eventSetQuestPanelVisible_Parms*)Obj)->bVisible = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::NewProp_bVisible = { "bVisible", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulQuestDisplayComponent_eventSetQuestPanelVisible_Parms), &Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::NewProp_bVisible_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::NewProp_bVisible,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::PropPointers) < 2048);
// ********** End Function SetQuestPanelVisible Property Definitions *******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulQuestDisplayComponent, nullptr, "SetQuestPanelVisible", 	Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::InsimulQuestDisplayComponent_eventSetQuestPanelVisible_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::InsimulQuestDisplayComponent_eventSetQuestPanelVisible_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulQuestDisplayComponent::execSetQuestPanelVisible)
{
	P_GET_UBOOL(Z_Param_bVisible);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetQuestPanelVisible(Z_Param_bVisible);
	P_NATIVE_END;
}
// ********** End Class UInsimulQuestDisplayComponent Function SetQuestPanelVisible ****************

// ********** Begin Class UInsimulQuestDisplayComponent ********************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulQuestDisplayComponent;
UClass* UInsimulQuestDisplayComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulQuestDisplayComponent;
	if (!Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulQuestDisplayComponent"),
			Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.InnerSingleton,
			StaticRegisterNativesUInsimulQuestDisplayComponent,
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
	return Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulQuestDisplayComponent_NoRegister()
{
	return UInsimulQuestDisplayComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "BlueprintType", "true" },
		{ "ClassGroupNames", "Custom" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Component to automatically show quests for the owning character\n * Attach to player character to automatically display their quests\n */" },
#endif
		{ "IncludePath", "InsimulQuestManager.h" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Component to automatically show quests for the owning character\nAttach to player character to automatically display their quests" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bAutoShowOnBeginPlay_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Automatically show quest panel on begin play\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Automatically show quest panel on begin play" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bAutoHideOnEndPlay_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Hide quest panel when this component is destroyed\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Hide quest panel when this component is destroyed" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bUseCharacterMapping_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get character ID from this actor's InsimulCharacterMappingComponent\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get character ID from this actor's InsimulCharacterMappingComponent" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterIdOverride_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Manual character ID override (if not using character mapping)\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Manual character ID override (if not using character mapping)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ScreenPosition_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Quest panel screen position\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Quest panel screen position" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulQuestDisplayComponent constinit property declarations ************
	static void NewProp_bAutoShowOnBeginPlay_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutoShowOnBeginPlay;
	static void NewProp_bAutoHideOnEndPlay_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutoHideOnEndPlay;
	static void NewProp_bUseCharacterMapping_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bUseCharacterMapping;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterIdOverride;
	static const UECodeGen_Private::FStructPropertyParams NewProp_ScreenPosition;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulQuestDisplayComponent constinit property declarations **************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("RefreshQuests"), .Pointer = &UInsimulQuestDisplayComponent::execRefreshQuests },
		{ .NameUTF8 = UTF8TEXT("SetQuestPanelVisible"), .Pointer = &UInsimulQuestDisplayComponent::execSetQuestPanelVisible },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulQuestDisplayComponent_RefreshQuests, "RefreshQuests" }, // 3879074908
		{ &Z_Construct_UFunction_UInsimulQuestDisplayComponent_SetQuestPanelVisible, "SetQuestPanelVisible" }, // 776659617
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulQuestDisplayComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics

// ********** Begin Class UInsimulQuestDisplayComponent Property Definitions ***********************
void Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoShowOnBeginPlay_SetBit(void* Obj)
{
	((UInsimulQuestDisplayComponent*)Obj)->bAutoShowOnBeginPlay = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoShowOnBeginPlay = { "bAutoShowOnBeginPlay", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulQuestDisplayComponent), &Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoShowOnBeginPlay_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bAutoShowOnBeginPlay_MetaData), NewProp_bAutoShowOnBeginPlay_MetaData) };
void Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoHideOnEndPlay_SetBit(void* Obj)
{
	((UInsimulQuestDisplayComponent*)Obj)->bAutoHideOnEndPlay = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoHideOnEndPlay = { "bAutoHideOnEndPlay", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulQuestDisplayComponent), &Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoHideOnEndPlay_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bAutoHideOnEndPlay_MetaData), NewProp_bAutoHideOnEndPlay_MetaData) };
void Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bUseCharacterMapping_SetBit(void* Obj)
{
	((UInsimulQuestDisplayComponent*)Obj)->bUseCharacterMapping = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bUseCharacterMapping = { "bUseCharacterMapping", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulQuestDisplayComponent), &Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bUseCharacterMapping_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bUseCharacterMapping_MetaData), NewProp_bUseCharacterMapping_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_CharacterIdOverride = { "CharacterIdOverride", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestDisplayComponent, CharacterIdOverride), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterIdOverride_MetaData), NewProp_CharacterIdOverride_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_ScreenPosition = { "ScreenPosition", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestDisplayComponent, ScreenPosition), Z_Construct_UScriptStruct_FVector2D, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ScreenPosition_MetaData), NewProp_ScreenPosition_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoShowOnBeginPlay,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bAutoHideOnEndPlay,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_bUseCharacterMapping,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_CharacterIdOverride,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::NewProp_ScreenPosition,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::PropPointers) < 2048);
// ********** End Class UInsimulQuestDisplayComponent Property Definitions *************************
UObject* (*const Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::ClassParams = {
	&UInsimulQuestDisplayComponent::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::PropPointers),
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::Class_MetaDataParams)
};
void UInsimulQuestDisplayComponent::StaticRegisterNativesUInsimulQuestDisplayComponent()
{
	UClass* Class = UInsimulQuestDisplayComponent::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulQuestDisplayComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.OuterSingleton, Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulQuestDisplayComponent.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulQuestDisplayComponent);
UInsimulQuestDisplayComponent::~UInsimulQuestDisplayComponent() {}
// ********** End Class UInsimulQuestDisplayComponent **********************************************

// ********** Begin Class UInsimulQuestHUDComponent ************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulQuestHUDComponent;
UClass* UInsimulQuestHUDComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulQuestHUDComponent;
	if (!Z_Registration_Info_UClass_UInsimulQuestHUDComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulQuestHUDComponent"),
			Z_Registration_Info_UClass_UInsimulQuestHUDComponent.InnerSingleton,
			StaticRegisterNativesUInsimulQuestHUDComponent,
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
	return Z_Registration_Info_UClass_UInsimulQuestHUDComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulQuestHUDComponent_NoRegister()
{
	return UInsimulQuestHUDComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulQuestHUDComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * HUD component for displaying quests\n * Add to your HUD class to automatically manage quest display\n */" },
#endif
		{ "IncludePath", "InsimulQuestManager.h" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "HUD component for displaying quests\nAdd to your HUD class to automatically manage quest display" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestWidgetClass_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Widget class for quests\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Widget class for quests" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_QuestWidget_MetaData[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Current quest widget instance\n\x09 */" },
#endif
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Current quest widget instance" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AnchorPosition_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Quest panel anchor position (0-1 for screen space)\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Quest panel anchor position (0-1 for screen space)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Offset_MetaData[] = {
		{ "Category", "Quest" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Quest panel offset from anchor\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Quest panel offset from anchor" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CachedWorld_MetaData[] = {
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CachedPlayerController_MetaData[] = {
		{ "ModuleRelativePath", "Public/InsimulQuestManager.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulQuestHUDComponent constinit property declarations ****************
	static const UECodeGen_Private::FClassPropertyParams NewProp_QuestWidgetClass;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_QuestWidget;
	static const UECodeGen_Private::FStructPropertyParams NewProp_AnchorPosition;
	static const UECodeGen_Private::FStructPropertyParams NewProp_Offset;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CachedWorld;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CachedPlayerController;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulQuestHUDComponent constinit property declarations ******************
	static UObject* (*const DependentSingletons[])();
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulQuestHUDComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulQuestHUDComponent_Statics

// ********** Begin Class UInsimulQuestHUDComponent Property Definitions ***************************
const UECodeGen_Private::FClassPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_QuestWidgetClass = { "QuestWidgetClass", nullptr, (EPropertyFlags)0x0014000000000001, UECodeGen_Private::EPropertyGenFlags::Class, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, QuestWidgetClass), Z_Construct_UClass_UClass_NoRegister, Z_Construct_UClass_UInsimulQuestWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestWidgetClass_MetaData), NewProp_QuestWidgetClass_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_QuestWidget = { "QuestWidget", nullptr, (EPropertyFlags)0x0010000000080008, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, QuestWidget), Z_Construct_UClass_UInsimulQuestWidget_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_QuestWidget_MetaData), NewProp_QuestWidget_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_AnchorPosition = { "AnchorPosition", nullptr, (EPropertyFlags)0x0010000000000001, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, AnchorPosition), Z_Construct_UScriptStruct_FVector2D, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AnchorPosition_MetaData), NewProp_AnchorPosition_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_Offset = { "Offset", nullptr, (EPropertyFlags)0x0010000000000001, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, Offset), Z_Construct_UScriptStruct_FVector2D, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Offset_MetaData), NewProp_Offset_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_CachedWorld = { "CachedWorld", nullptr, (EPropertyFlags)0x0020080000000000, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, CachedWorld), Z_Construct_UClass_UWorld_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CachedWorld_MetaData), NewProp_CachedWorld_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_CachedPlayerController = { "CachedPlayerController", nullptr, (EPropertyFlags)0x0020080000000000, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulQuestHUDComponent, CachedPlayerController), Z_Construct_UClass_APlayerController_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CachedPlayerController_MetaData), NewProp_CachedPlayerController_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_QuestWidgetClass,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_QuestWidget,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_AnchorPosition,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_Offset,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_CachedWorld,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::NewProp_CachedPlayerController,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::PropPointers) < 2048);
// ********** End Class UInsimulQuestHUDComponent Property Definitions *****************************
UObject* (*const Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UObject,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::ClassParams = {
	&UInsimulQuestHUDComponent::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	nullptr,
	Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	0,
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::PropPointers),
	0,
	0x009000A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::Class_MetaDataParams)
};
void UInsimulQuestHUDComponent::StaticRegisterNativesUInsimulQuestHUDComponent()
{
}
UClass* Z_Construct_UClass_UInsimulQuestHUDComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulQuestHUDComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulQuestHUDComponent.OuterSingleton, Z_Construct_UClass_UInsimulQuestHUDComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulQuestHUDComponent.OuterSingleton;
}
UInsimulQuestHUDComponent::UInsimulQuestHUDComponent(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulQuestHUDComponent);
UInsimulQuestHUDComponent::~UInsimulQuestHUDComponent() {}
// ********** End Class UInsimulQuestHUDComponent **************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulQuestManager, UInsimulQuestManager::StaticClass, TEXT("UInsimulQuestManager"), &Z_Registration_Info_UClass_UInsimulQuestManager, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulQuestManager), 1263951954U) },
		{ Z_Construct_UClass_UInsimulQuestDisplayComponent, UInsimulQuestDisplayComponent::StaticClass, TEXT("UInsimulQuestDisplayComponent"), &Z_Registration_Info_UClass_UInsimulQuestDisplayComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulQuestDisplayComponent), 3191248327U) },
		{ Z_Construct_UClass_UInsimulQuestHUDComponent, UInsimulQuestHUDComponent::StaticClass, TEXT("UInsimulQuestHUDComponent"), &Z_Registration_Info_UClass_UInsimulQuestHUDComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulQuestHUDComponent), 1717656289U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h__Script_InsimulRuntime_2125589082{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
