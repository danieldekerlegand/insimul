// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulCrowdIntegration.h"
#include "Engine/GameInstance.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulCrowdIntegration() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UObject_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_AActor_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UBlueprintFunctionLibrary();
ENGINE_API UClass* Z_Construct_UClass_UGameInstanceSubsystem();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdBlueprintLibrary();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdIntegration();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdIntegration_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulCrowdIntegration Function AddInsimulMappingToActor ***************
struct Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics
{
	struct InsimulCrowdIntegration_eventAddInsimulMappingToActor_Parms
	{
		AActor* Actor;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Manually add Insimul mapping to an actor\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Manually add Insimul mapping to an actor" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function AddInsimulMappingToActor constinit property declarations **************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_Actor;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function AddInsimulMappingToActor constinit property declarations ****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function AddInsimulMappingToActor Property Definitions *************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::NewProp_Actor = { "Actor", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdIntegration_eventAddInsimulMappingToActor_Parms, Actor), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::NewProp_Actor,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::PropPointers) < 2048);
// ********** End Function AddInsimulMappingToActor Property Definitions ***************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdIntegration, nullptr, "AddInsimulMappingToActor", 	Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::InsimulCrowdIntegration_eventAddInsimulMappingToActor_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::InsimulCrowdIntegration_eventAddInsimulMappingToActor_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdIntegration::execAddInsimulMappingToActor)
{
	P_GET_OBJECT(AActor,Z_Param_Actor);
	P_FINISH;
	P_NATIVE_BEGIN;
	UInsimulCrowdIntegration::AddInsimulMappingToActor(Z_Param_Actor);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdIntegration Function AddInsimulMappingToActor *****************

// ********** Begin Class UInsimulCrowdIntegration Function ConfigureInsimul ***********************
struct Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics
{
	struct InsimulCrowdIntegration_eventConfigureInsimul_Parms
	{
		FString ServerURL;
		FString WorldId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Set the Insimul server URL and world ID for character loading\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Set the Insimul server URL and world ID for character loading" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "NativeConst", "" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function ConfigureInsimul constinit property declarations **********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function ConfigureInsimul constinit property declarations ************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function ConfigureInsimul Property Definitions *********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdIntegration_eventConfigureInsimul_Parms, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdIntegration_eventConfigureInsimul_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::NewProp_ServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::NewProp_WorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::PropPointers) < 2048);
// ********** End Function ConfigureInsimul Property Definitions ***********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdIntegration, nullptr, "ConfigureInsimul", 	Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::InsimulCrowdIntegration_eventConfigureInsimul_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::InsimulCrowdIntegration_eventConfigureInsimul_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdIntegration::execConfigureInsimul)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_ServerURL);
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ConfigureInsimul(Z_Param_ServerURL,Z_Param_WorldId);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdIntegration Function ConfigureInsimul *************************

// ********** Begin Class UInsimulCrowdIntegration Function EnableAutomaticMapping *****************
struct Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics
{
	struct InsimulCrowdIntegration_eventEnableAutomaticMapping_Parms
	{
		bool bEnable;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Enable automatic mapping of crowd characters to Insimul\n\x09 */" },
#endif
		{ "CPP_Default_bEnable", "true" },
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Enable automatic mapping of crowd characters to Insimul" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function EnableAutomaticMapping constinit property declarations ****************
	static void NewProp_bEnable_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bEnable;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function EnableAutomaticMapping constinit property declarations ******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function EnableAutomaticMapping Property Definitions ***************************
void Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::NewProp_bEnable_SetBit(void* Obj)
{
	((InsimulCrowdIntegration_eventEnableAutomaticMapping_Parms*)Obj)->bEnable = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::NewProp_bEnable = { "bEnable", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulCrowdIntegration_eventEnableAutomaticMapping_Parms), &Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::NewProp_bEnable_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::NewProp_bEnable,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::PropPointers) < 2048);
// ********** End Function EnableAutomaticMapping Property Definitions *****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdIntegration, nullptr, "EnableAutomaticMapping", 	Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::InsimulCrowdIntegration_eventEnableAutomaticMapping_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::InsimulCrowdIntegration_eventEnableAutomaticMapping_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdIntegration::execEnableAutomaticMapping)
{
	P_GET_UBOOL(Z_Param_bEnable);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->EnableAutomaticMapping(Z_Param_bEnable);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdIntegration Function EnableAutomaticMapping *******************

// ********** Begin Class UInsimulCrowdIntegration Function IsAutomaticMappingEnabled **************
struct Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics
{
	struct InsimulCrowdIntegration_eventIsAutomaticMappingEnabled_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Check if automatic mapping is enabled\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Check if automatic mapping is enabled" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsAutomaticMappingEnabled constinit property declarations *************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsAutomaticMappingEnabled constinit property declarations ***************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsAutomaticMappingEnabled Property Definitions ************************
void Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulCrowdIntegration_eventIsAutomaticMappingEnabled_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulCrowdIntegration_eventIsAutomaticMappingEnabled_Parms), &Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::PropPointers) < 2048);
// ********** End Function IsAutomaticMappingEnabled Property Definitions **************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdIntegration, nullptr, "IsAutomaticMappingEnabled", 	Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::InsimulCrowdIntegration_eventIsAutomaticMappingEnabled_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::InsimulCrowdIntegration_eventIsAutomaticMappingEnabled_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdIntegration::execIsAutomaticMappingEnabled)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->IsAutomaticMappingEnabled();
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdIntegration Function IsAutomaticMappingEnabled ****************

// ********** Begin Class UInsimulCrowdIntegration *************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulCrowdIntegration;
UClass* UInsimulCrowdIntegration::GetPrivateStaticClass()
{
	using TClass = UInsimulCrowdIntegration;
	if (!Z_Registration_Info_UClass_UInsimulCrowdIntegration.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulCrowdIntegration"),
			Z_Registration_Info_UClass_UInsimulCrowdIntegration.InnerSingleton,
			StaticRegisterNativesUInsimulCrowdIntegration,
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
	return Z_Registration_Info_UClass_UInsimulCrowdIntegration.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulCrowdIntegration_NoRegister()
{
	return UInsimulCrowdIntegration::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulCrowdIntegration_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Game Instance Subsystem that automatically integrates Insimul with CitySample's crowd system\n * Listens for crowd character spawns and automatically adds mapping components\n */" },
#endif
		{ "IncludePath", "InsimulCrowdIntegration.h" },
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Game Instance Subsystem that automatically integrates Insimul with CitySample's crowd system\nListens for crowd character spawns and automatically adds mapping components" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bAutomaticMappingEnabled_MetaData[] = {
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulCrowdIntegration constinit property declarations *****************
	static void NewProp_bAutomaticMappingEnabled_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutomaticMappingEnabled;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulCrowdIntegration constinit property declarations *******************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("AddInsimulMappingToActor"), .Pointer = &UInsimulCrowdIntegration::execAddInsimulMappingToActor },
		{ .NameUTF8 = UTF8TEXT("ConfigureInsimul"), .Pointer = &UInsimulCrowdIntegration::execConfigureInsimul },
		{ .NameUTF8 = UTF8TEXT("EnableAutomaticMapping"), .Pointer = &UInsimulCrowdIntegration::execEnableAutomaticMapping },
		{ .NameUTF8 = UTF8TEXT("IsAutomaticMappingEnabled"), .Pointer = &UInsimulCrowdIntegration::execIsAutomaticMappingEnabled },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulCrowdIntegration_AddInsimulMappingToActor, "AddInsimulMappingToActor" }, // 2572622956
		{ &Z_Construct_UFunction_UInsimulCrowdIntegration_ConfigureInsimul, "ConfigureInsimul" }, // 264037034
		{ &Z_Construct_UFunction_UInsimulCrowdIntegration_EnableAutomaticMapping, "EnableAutomaticMapping" }, // 4200876402
		{ &Z_Construct_UFunction_UInsimulCrowdIntegration_IsAutomaticMappingEnabled, "IsAutomaticMappingEnabled" }, // 577554333
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulCrowdIntegration>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulCrowdIntegration_Statics

// ********** Begin Class UInsimulCrowdIntegration Property Definitions ****************************
void Z_Construct_UClass_UInsimulCrowdIntegration_Statics::NewProp_bAutomaticMappingEnabled_SetBit(void* Obj)
{
	((UInsimulCrowdIntegration*)Obj)->bAutomaticMappingEnabled = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_UInsimulCrowdIntegration_Statics::NewProp_bAutomaticMappingEnabled = { "bAutomaticMappingEnabled", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(UInsimulCrowdIntegration), &Z_Construct_UClass_UInsimulCrowdIntegration_Statics::NewProp_bAutomaticMappingEnabled_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bAutomaticMappingEnabled_MetaData), NewProp_bAutomaticMappingEnabled_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulCrowdIntegration_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCrowdIntegration_Statics::NewProp_bAutomaticMappingEnabled,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdIntegration_Statics::PropPointers) < 2048);
// ********** End Class UInsimulCrowdIntegration Property Definitions ******************************
UObject* (*const Z_Construct_UClass_UInsimulCrowdIntegration_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UGameInstanceSubsystem,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdIntegration_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulCrowdIntegration_Statics::ClassParams = {
	&UInsimulCrowdIntegration::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulCrowdIntegration_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdIntegration_Statics::PropPointers),
	0,
	0x001000A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdIntegration_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulCrowdIntegration_Statics::Class_MetaDataParams)
};
void UInsimulCrowdIntegration::StaticRegisterNativesUInsimulCrowdIntegration()
{
	UClass* Class = UInsimulCrowdIntegration::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulCrowdIntegration_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulCrowdIntegration()
{
	if (!Z_Registration_Info_UClass_UInsimulCrowdIntegration.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulCrowdIntegration.OuterSingleton, Z_Construct_UClass_UInsimulCrowdIntegration_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulCrowdIntegration.OuterSingleton;
}
UInsimulCrowdIntegration::UInsimulCrowdIntegration() {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulCrowdIntegration);
UInsimulCrowdIntegration::~UInsimulCrowdIntegration() {}
// ********** End Class UInsimulCrowdIntegration ***************************************************

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function EnableInsimulIntegration **********
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms
	{
		UObject* WorldContextObject;
		FString ServerURL;
		FString WorldId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Enable automatic Insimul mapping for all crowd characters\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Enable automatic Insimul mapping for all crowd characters" },
#endif
		{ "WorldContext", "WorldContextObject" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "NativeConst", "" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function EnableInsimulIntegration constinit property declarations **************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_WorldContextObject;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function EnableInsimulIntegration constinit property declarations ****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function EnableInsimulIntegration Property Definitions *************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_WorldContextObject = { "WorldContextObject", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms, WorldContextObject), Z_Construct_UClass_UObject_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_WorldContextObject,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_ServerURL,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::NewProp_WorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::PropPointers) < 2048);
// ********** End Function EnableInsimulIntegration Property Definitions ***************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "EnableInsimulIntegration", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::InsimulCrowdBlueprintLibrary_eventEnableInsimulIntegration_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execEnableInsimulIntegration)
{
	P_GET_OBJECT(UObject,Z_Param_WorldContextObject);
	P_GET_PROPERTY(FStrProperty,Z_Param_ServerURL);
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_FINISH;
	P_NATIVE_BEGIN;
	UInsimulCrowdBlueprintLibrary::EnableInsimulIntegration(Z_Param_WorldContextObject,Z_Param_ServerURL,Z_Param_WorldId);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function EnableInsimulIntegration ************

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function GetAvailableInsimulCharacterCount *
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventGetAvailableInsimulCharacterCount_Parms
	{
		UObject* WorldContextObject;
		int32 ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get count of available Insimul characters\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get count of available Insimul characters" },
#endif
		{ "WorldContext", "WorldContextObject" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetAvailableInsimulCharacterCount constinit property declarations *****
	static const UECodeGen_Private::FObjectPropertyParams NewProp_WorldContextObject;
	static const UECodeGen_Private::FIntPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetAvailableInsimulCharacterCount constinit property declarations *******
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetAvailableInsimulCharacterCount Property Definitions ****************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::NewProp_WorldContextObject = { "WorldContextObject", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventGetAvailableInsimulCharacterCount_Parms, WorldContextObject), Z_Construct_UClass_UObject_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FIntPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventGetAvailableInsimulCharacterCount_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::NewProp_WorldContextObject,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::PropPointers) < 2048);
// ********** End Function GetAvailableInsimulCharacterCount Property Definitions ******************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "GetAvailableInsimulCharacterCount", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::InsimulCrowdBlueprintLibrary_eventGetAvailableInsimulCharacterCount_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::InsimulCrowdBlueprintLibrary_eventGetAvailableInsimulCharacterCount_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execGetAvailableInsimulCharacterCount)
{
	P_GET_OBJECT(UObject,Z_Param_WorldContextObject);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(int32*)Z_Param__Result=UInsimulCrowdBlueprintLibrary::GetAvailableInsimulCharacterCount(Z_Param_WorldContextObject);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function GetAvailableInsimulCharacterCount ***

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function GetInsimulCharacterId *************
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms
	{
		UObject* WorldContextObject;
		AActor* CrowdCharacter;
		FString ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get the Insimul character ID for a crowd character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get the Insimul character ID for a crowd character" },
#endif
		{ "WorldContext", "WorldContextObject" },
	};
#endif // WITH_METADATA

// ********** Begin Function GetInsimulCharacterId constinit property declarations *****************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_WorldContextObject;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetInsimulCharacterId constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetInsimulCharacterId Property Definitions ****************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_WorldContextObject = { "WorldContextObject", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms, WorldContextObject), Z_Construct_UClass_UObject_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_WorldContextObject,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_CrowdCharacter,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::PropPointers) < 2048);
// ********** End Function GetInsimulCharacterId Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "GetInsimulCharacterId", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::InsimulCrowdBlueprintLibrary_eventGetInsimulCharacterId_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execGetInsimulCharacterId)
{
	P_GET_OBJECT(UObject,Z_Param_WorldContextObject);
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FString*)Z_Param__Result=UInsimulCrowdBlueprintLibrary::GetInsimulCharacterId(Z_Param_WorldContextObject,Z_Param_CrowdCharacter);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function GetInsimulCharacterId ***************

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function IsMappedToInsimul *****************
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms
	{
		AActor* CrowdCharacter;
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Check if a crowd character is mapped to Insimul\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Check if a crowd character is mapped to Insimul" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsMappedToInsimul constinit property declarations *********************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsMappedToInsimul constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsMappedToInsimul Property Definitions ********************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
void Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms), &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_CrowdCharacter,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::PropPointers) < 2048);
// ********** End Function IsMappedToInsimul Property Definitions **********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "IsMappedToInsimul", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x14022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::InsimulCrowdBlueprintLibrary_eventIsMappedToInsimul_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execIsMappedToInsimul)
{
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=UInsimulCrowdBlueprintLibrary::IsMappedToInsimul(Z_Param_CrowdCharacter);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function IsMappedToInsimul *******************

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function LoadInsimulCharactersForWorld *****
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms
	{
		UObject* WorldContextObject;
		FString WorldId;
		FString ServerURL;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Load Insimul characters for a world\n\x09 */" },
#endif
		{ "CPP_Default_ServerURL", "http://localhost:8080" },
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Load Insimul characters for a world" },
#endif
		{ "WorldContext", "WorldContextObject" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "NativeConst", "" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function LoadInsimulCharactersForWorld constinit property declarations *********
	static const UECodeGen_Private::FObjectPropertyParams NewProp_WorldContextObject;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function LoadInsimulCharactersForWorld constinit property declarations ***********
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function LoadInsimulCharactersForWorld Property Definitions ********************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_WorldContextObject = { "WorldContextObject", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms, WorldContextObject), Z_Construct_UClass_UObject_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_WorldContextObject,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_WorldId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::NewProp_ServerURL,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::PropPointers) < 2048);
// ********** End Function LoadInsimulCharactersForWorld Property Definitions **********************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "LoadInsimulCharactersForWorld", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::InsimulCrowdBlueprintLibrary_eventLoadInsimulCharactersForWorld_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execLoadInsimulCharactersForWorld)
{
	P_GET_OBJECT(UObject,Z_Param_WorldContextObject);
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_GET_PROPERTY(FStrProperty,Z_Param_ServerURL);
	P_FINISH;
	P_NATIVE_BEGIN;
	UInsimulCrowdBlueprintLibrary::LoadInsimulCharactersForWorld(Z_Param_WorldContextObject,Z_Param_WorldId,Z_Param_ServerURL);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function LoadInsimulCharactersForWorld *******

// ********** Begin Class UInsimulCrowdBlueprintLibrary Function SetInsimulCharacterId *************
struct Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics
{
	struct InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms
	{
		AActor* CrowdCharacter;
		FString CharacterId;
		FString WorldId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Manually set Insimul character ID for an actor\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Manually set Insimul character ID for an actor" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterId_MetaData[] = {
		{ "NativeConst", "" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function SetInsimulCharacterId constinit property declarations *****************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetInsimulCharacterId constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetInsimulCharacterId Property Definitions ****************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_CrowdCharacter,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_CharacterId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::NewProp_WorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::PropPointers) < 2048);
// ********** End Function SetInsimulCharacterId Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, nullptr, "SetInsimulCharacterId", 	Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04022401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::InsimulCrowdBlueprintLibrary_eventSetInsimulCharacterId_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCrowdBlueprintLibrary::execSetInsimulCharacterId)
{
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_GET_PROPERTY(FStrProperty,Z_Param_CharacterId);
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_FINISH;
	P_NATIVE_BEGIN;
	UInsimulCrowdBlueprintLibrary::SetInsimulCharacterId(Z_Param_CrowdCharacter,Z_Param_CharacterId,Z_Param_WorldId);
	P_NATIVE_END;
}
// ********** End Class UInsimulCrowdBlueprintLibrary Function SetInsimulCharacterId ***************

// ********** Begin Class UInsimulCrowdBlueprintLibrary ********************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary;
UClass* UInsimulCrowdBlueprintLibrary::GetPrivateStaticClass()
{
	using TClass = UInsimulCrowdBlueprintLibrary;
	if (!Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulCrowdBlueprintLibrary"),
			Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.InnerSingleton,
			StaticRegisterNativesUInsimulCrowdBlueprintLibrary,
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
	return Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_NoRegister()
{
	return UInsimulCrowdBlueprintLibrary::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Blueprint function library for Insimul integration\n */" },
#endif
		{ "IncludePath", "InsimulCrowdIntegration.h" },
		{ "ModuleRelativePath", "Public/InsimulCrowdIntegration.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Blueprint function library for Insimul integration" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulCrowdBlueprintLibrary constinit property declarations ************
// ********** End Class UInsimulCrowdBlueprintLibrary constinit property declarations **************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("EnableInsimulIntegration"), .Pointer = &UInsimulCrowdBlueprintLibrary::execEnableInsimulIntegration },
		{ .NameUTF8 = UTF8TEXT("GetAvailableInsimulCharacterCount"), .Pointer = &UInsimulCrowdBlueprintLibrary::execGetAvailableInsimulCharacterCount },
		{ .NameUTF8 = UTF8TEXT("GetInsimulCharacterId"), .Pointer = &UInsimulCrowdBlueprintLibrary::execGetInsimulCharacterId },
		{ .NameUTF8 = UTF8TEXT("IsMappedToInsimul"), .Pointer = &UInsimulCrowdBlueprintLibrary::execIsMappedToInsimul },
		{ .NameUTF8 = UTF8TEXT("LoadInsimulCharactersForWorld"), .Pointer = &UInsimulCrowdBlueprintLibrary::execLoadInsimulCharactersForWorld },
		{ .NameUTF8 = UTF8TEXT("SetInsimulCharacterId"), .Pointer = &UInsimulCrowdBlueprintLibrary::execSetInsimulCharacterId },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_EnableInsimulIntegration, "EnableInsimulIntegration" }, // 321579529
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetAvailableInsimulCharacterCount, "GetAvailableInsimulCharacterCount" }, // 4187069229
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_GetInsimulCharacterId, "GetInsimulCharacterId" }, // 4293150617
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_IsMappedToInsimul, "IsMappedToInsimul" }, // 448702804
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_LoadInsimulCharactersForWorld, "LoadInsimulCharactersForWorld" }, // 2224005977
		{ &Z_Construct_UFunction_UInsimulCrowdBlueprintLibrary_SetInsimulCharacterId, "SetInsimulCharacterId" }, // 2679150655
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulCrowdBlueprintLibrary>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics
UObject* (*const Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UBlueprintFunctionLibrary,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::ClassParams = {
	&UInsimulCrowdBlueprintLibrary::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	nullptr,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	0,
	0,
	0x001000A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::Class_MetaDataParams)
};
void UInsimulCrowdBlueprintLibrary::StaticRegisterNativesUInsimulCrowdBlueprintLibrary()
{
	UClass* Class = UInsimulCrowdBlueprintLibrary::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulCrowdBlueprintLibrary()
{
	if (!Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.OuterSingleton, Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary.OuterSingleton;
}
UInsimulCrowdBlueprintLibrary::UInsimulCrowdBlueprintLibrary(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulCrowdBlueprintLibrary);
UInsimulCrowdBlueprintLibrary::~UInsimulCrowdBlueprintLibrary() {}
// ********** End Class UInsimulCrowdBlueprintLibrary **********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulCrowdIntegration, UInsimulCrowdIntegration::StaticClass, TEXT("UInsimulCrowdIntegration"), &Z_Registration_Info_UClass_UInsimulCrowdIntegration, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulCrowdIntegration), 650824395U) },
		{ Z_Construct_UClass_UInsimulCrowdBlueprintLibrary, UInsimulCrowdBlueprintLibrary::StaticClass, TEXT("UInsimulCrowdBlueprintLibrary"), &Z_Registration_Info_UClass_UInsimulCrowdBlueprintLibrary, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulCrowdBlueprintLibrary), 3299726192U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h__Script_InsimulRuntime_4197491839{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
