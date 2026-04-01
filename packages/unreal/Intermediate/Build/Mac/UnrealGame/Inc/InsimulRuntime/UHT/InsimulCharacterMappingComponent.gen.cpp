// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulCharacterMappingComponent.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulCharacterMappingComponent() {}

// ********** Begin Cross Module References ********************************************************
ENGINE_API UClass* Z_Construct_UClass_AActor_NoRegister();
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
ENGINE_API UClass* Z_Construct_UClass_UWorldSubsystem();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingSubsystem();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingSubsystem_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulCharacterMappingComponent Function ClearInsimulMapping ***********
struct Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Clear the Insimul character mapping\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Clear the Insimul character mapping" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function ClearInsimulMapping constinit property declarations *******************
// ********** End Function ClearInsimulMapping constinit property declarations *********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingComponent, nullptr, "ClearInsimulMapping", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingComponent::execClearInsimulMapping)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ClearInsimulMapping();
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingComponent Function ClearInsimulMapping *************

// ********** Begin Class UInsimulCharacterMappingComponent Function GetInsimulCharacterName *******
struct Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics
{
	struct InsimulCharacterMappingComponent_eventGetInsimulCharacterName_Parms
	{
		FString OutFirstName;
		FString OutLastName;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get character's first and last name (if available from Insimul)\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get character's first and last name (if available from Insimul)" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetInsimulCharacterName constinit property declarations ***************
	static const UECodeGen_Private::FStrPropertyParams NewProp_OutFirstName;
	static const UECodeGen_Private::FStrPropertyParams NewProp_OutLastName;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetInsimulCharacterName constinit property declarations *****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetInsimulCharacterName Property Definitions **************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::NewProp_OutFirstName = { "OutFirstName", nullptr, (EPropertyFlags)0x0010000000000180, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingComponent_eventGetInsimulCharacterName_Parms, OutFirstName), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::NewProp_OutLastName = { "OutLastName", nullptr, (EPropertyFlags)0x0010000000000180, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingComponent_eventGetInsimulCharacterName_Parms, OutLastName), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::NewProp_OutFirstName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::NewProp_OutLastName,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::PropPointers) < 2048);
// ********** End Function GetInsimulCharacterName Property Definitions ****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingComponent, nullptr, "GetInsimulCharacterName", 	Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::InsimulCharacterMappingComponent_eventGetInsimulCharacterName_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::InsimulCharacterMappingComponent_eventGetInsimulCharacterName_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingComponent::execGetInsimulCharacterName)
{
	P_GET_PROPERTY_REF(FStrProperty,Z_Param_Out_OutFirstName);
	P_GET_PROPERTY_REF(FStrProperty,Z_Param_Out_OutLastName);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->GetInsimulCharacterName(Z_Param_Out_OutFirstName,Z_Param_Out_OutLastName);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingComponent Function GetInsimulCharacterName *********

// ********** Begin Class UInsimulCharacterMappingComponent Function IsMappedToInsimul *************
struct Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics
{
	struct InsimulCharacterMappingComponent_eventIsMappedToInsimul_Parms
	{
		bool ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Whether this character is currently mapped to an Insimul character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Whether this character is currently mapped to an Insimul character" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function IsMappedToInsimul constinit property declarations *********************
	static void NewProp_ReturnValue_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function IsMappedToInsimul constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function IsMappedToInsimul Property Definitions ********************************
void Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::NewProp_ReturnValue_SetBit(void* Obj)
{
	((InsimulCharacterMappingComponent_eventIsMappedToInsimul_Parms*)Obj)->ReturnValue = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(InsimulCharacterMappingComponent_eventIsMappedToInsimul_Parms), &Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::NewProp_ReturnValue_SetBit, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::PropPointers) < 2048);
// ********** End Function IsMappedToInsimul Property Definitions **********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingComponent, nullptr, "IsMappedToInsimul", 	Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::InsimulCharacterMappingComponent_eventIsMappedToInsimul_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::InsimulCharacterMappingComponent_eventIsMappedToInsimul_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingComponent::execIsMappedToInsimul)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(bool*)Z_Param__Result=P_THIS->IsMappedToInsimul();
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingComponent Function IsMappedToInsimul ***************

// ********** Begin Class UInsimulCharacterMappingComponent Function SetInsimulCharacterId *********
struct Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics
{
	struct InsimulCharacterMappingComponent_eventSetInsimulCharacterId_Parms
	{
		FString CharacterId;
		FString WorldId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Set the Insimul character ID for this character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Set the Insimul character ID for this character" },
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
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetInsimulCharacterId constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetInsimulCharacterId Property Definitions ****************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::NewProp_CharacterId = { "CharacterId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingComponent_eventSetInsimulCharacterId_Parms, CharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterId_MetaData), NewProp_CharacterId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingComponent_eventSetInsimulCharacterId_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::NewProp_CharacterId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::NewProp_WorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::PropPointers) < 2048);
// ********** End Function SetInsimulCharacterId Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingComponent, nullptr, "SetInsimulCharacterId", 	Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::InsimulCharacterMappingComponent_eventSetInsimulCharacterId_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::InsimulCharacterMappingComponent_eventSetInsimulCharacterId_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingComponent::execSetInsimulCharacterId)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_CharacterId);
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetInsimulCharacterId(Z_Param_CharacterId,Z_Param_WorldId);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingComponent Function SetInsimulCharacterId ***********

// ********** Begin Class UInsimulCharacterMappingComponent ****************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulCharacterMappingComponent;
UClass* UInsimulCharacterMappingComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulCharacterMappingComponent;
	if (!Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulCharacterMappingComponent"),
			Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.InnerSingleton,
			StaticRegisterNativesUInsimulCharacterMappingComponent,
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
	return Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulCharacterMappingComponent_NoRegister()
{
	return UInsimulCharacterMappingComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "BlueprintType", "true" },
		{ "ClassGroupNames", "Custom" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Component that maps Unreal crowd characters to Insimul character IDs\n * Automatically assigns available Insimul characters to spawned crowd characters\n */" },
#endif
		{ "IncludePath", "InsimulCharacterMappingComponent.h" },
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Component that maps Unreal crowd characters to Insimul character IDs\nAutomatically assigns available Insimul characters to spawned crowd characters" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_InsimulCharacterId_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Insimul character ID associated with this Unreal character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Insimul character ID associated with this Unreal character" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_InsimulWorldId_MetaData[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Insimul world ID this character belongs to\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Insimul world ID this character belongs to" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulCharacterMappingComponent constinit property declarations ********
	static const UECodeGen_Private::FStrPropertyParams NewProp_InsimulCharacterId;
	static const UECodeGen_Private::FStrPropertyParams NewProp_InsimulWorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulCharacterMappingComponent constinit property declarations **********
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("ClearInsimulMapping"), .Pointer = &UInsimulCharacterMappingComponent::execClearInsimulMapping },
		{ .NameUTF8 = UTF8TEXT("GetInsimulCharacterName"), .Pointer = &UInsimulCharacterMappingComponent::execGetInsimulCharacterName },
		{ .NameUTF8 = UTF8TEXT("IsMappedToInsimul"), .Pointer = &UInsimulCharacterMappingComponent::execIsMappedToInsimul },
		{ .NameUTF8 = UTF8TEXT("SetInsimulCharacterId"), .Pointer = &UInsimulCharacterMappingComponent::execSetInsimulCharacterId },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulCharacterMappingComponent_ClearInsimulMapping, "ClearInsimulMapping" }, // 1334933800
		{ &Z_Construct_UFunction_UInsimulCharacterMappingComponent_GetInsimulCharacterName, "GetInsimulCharacterName" }, // 211825592
		{ &Z_Construct_UFunction_UInsimulCharacterMappingComponent_IsMappedToInsimul, "IsMappedToInsimul" }, // 74285748
		{ &Z_Construct_UFunction_UInsimulCharacterMappingComponent_SetInsimulCharacterId, "SetInsimulCharacterId" }, // 1899621991
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulCharacterMappingComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics

// ********** Begin Class UInsimulCharacterMappingComponent Property Definitions *******************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::NewProp_InsimulCharacterId = { "InsimulCharacterId", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulCharacterMappingComponent, InsimulCharacterId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_InsimulCharacterId_MetaData), NewProp_InsimulCharacterId_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::NewProp_InsimulWorldId = { "InsimulWorldId", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulCharacterMappingComponent, InsimulWorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_InsimulWorldId_MetaData), NewProp_InsimulWorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::NewProp_InsimulCharacterId,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::NewProp_InsimulWorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::PropPointers) < 2048);
// ********** End Class UInsimulCharacterMappingComponent Property Definitions *********************
UObject* (*const Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::ClassParams = {
	&UInsimulCharacterMappingComponent::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::PropPointers),
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::Class_MetaDataParams)
};
void UInsimulCharacterMappingComponent::StaticRegisterNativesUInsimulCharacterMappingComponent()
{
	UClass* Class = UInsimulCharacterMappingComponent::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulCharacterMappingComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.OuterSingleton, Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulCharacterMappingComponent.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulCharacterMappingComponent);
UInsimulCharacterMappingComponent::~UInsimulCharacterMappingComponent() {}
// ********** End Class UInsimulCharacterMappingComponent ******************************************

// ********** Begin Class UInsimulCharacterMappingSubsystem Function GetAvailableInsimulCharacterCount 
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics
{
	struct InsimulCharacterMappingSubsystem_eventGetAvailableInsimulCharacterCount_Parms
	{
		int32 ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get count of available unmapped Insimul characters\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get count of available unmapped Insimul characters" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetAvailableInsimulCharacterCount constinit property declarations *****
	static const UECodeGen_Private::FIntPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetAvailableInsimulCharacterCount constinit property declarations *******
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetAvailableInsimulCharacterCount Property Definitions ****************
const UECodeGen_Private::FIntPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Int, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventGetAvailableInsimulCharacterCount_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::PropPointers) < 2048);
// ********** End Function GetAvailableInsimulCharacterCount Property Definitions ******************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "GetAvailableInsimulCharacterCount", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::InsimulCharacterMappingSubsystem_eventGetAvailableInsimulCharacterCount_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::InsimulCharacterMappingSubsystem_eventGetAvailableInsimulCharacterCount_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execGetAvailableInsimulCharacterCount)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(int32*)Z_Param__Result=P_THIS->GetAvailableInsimulCharacterCount();
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function GetAvailableInsimulCharacterCount 

// ********** Begin Class UInsimulCharacterMappingSubsystem Function GetInsimulCharacterId *********
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics
{
	struct InsimulCharacterMappingSubsystem_eventGetInsimulCharacterId_Parms
	{
		AActor* CrowdCharacter;
		FString ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Get the Insimul character ID for a given Unreal actor\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get the Insimul character ID for a given Unreal actor" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetInsimulCharacterId constinit property declarations *****************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static const UECodeGen_Private::FStrPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetInsimulCharacterId constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetInsimulCharacterId Property Definitions ****************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventGetInsimulCharacterId_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventGetInsimulCharacterId_Parms, ReturnValue), METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::NewProp_CrowdCharacter,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::PropPointers) < 2048);
// ********** End Function GetInsimulCharacterId Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "GetInsimulCharacterId", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::InsimulCharacterMappingSubsystem_eventGetInsimulCharacterId_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::InsimulCharacterMappingSubsystem_eventGetInsimulCharacterId_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execGetInsimulCharacterId)
{
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_FINISH;
	P_NATIVE_BEGIN;
	*(FString*)Z_Param__Result=P_THIS->GetInsimulCharacterId(Z_Param_CrowdCharacter);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function GetInsimulCharacterId ***********

// ********** Begin Class UInsimulCharacterMappingSubsystem Function LoadInsimulCharacters *********
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics
{
	struct InsimulCharacterMappingSubsystem_eventLoadInsimulCharacters_Parms
	{
		FString ServerURL;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Load available Insimul characters from the server (online mode)\n\x09 */" },
#endif
		{ "CPP_Default_ServerURL", "http://localhost:8080" },
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Load available Insimul characters from the server (online mode)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_ServerURL_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function LoadInsimulCharacters constinit property declarations *****************
	static const UECodeGen_Private::FStrPropertyParams NewProp_ServerURL;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function LoadInsimulCharacters constinit property declarations *******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function LoadInsimulCharacters Property Definitions ****************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::NewProp_ServerURL = { "ServerURL", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventLoadInsimulCharacters_Parms, ServerURL), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_ServerURL_MetaData), NewProp_ServerURL_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::NewProp_ServerURL,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::PropPointers) < 2048);
// ********** End Function LoadInsimulCharacters Property Definitions ******************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "LoadInsimulCharacters", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::InsimulCharacterMappingSubsystem_eventLoadInsimulCharacters_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::InsimulCharacterMappingSubsystem_eventLoadInsimulCharacters_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execLoadInsimulCharacters)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_ServerURL);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->LoadInsimulCharacters(Z_Param_ServerURL);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function LoadInsimulCharacters ***********

// ********** Begin Class UInsimulCharacterMappingSubsystem Function LoadInsimulCharactersFromFile *
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics
{
	struct InsimulCharacterMappingSubsystem_eventLoadInsimulCharactersFromFile_Parms
	{
		FString FilePath;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Load available Insimul characters from a local JSON file (offline mode).\n\x09 * Supports the world export format (with \"characters\" array containing \"id\" or \"characterId\" fields)\n\x09 * and the split-file format (plain array of character objects).\n\x09 * Path can be absolute or relative to the project's Content directory.\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Load available Insimul characters from a local JSON file (offline mode).\nSupports the world export format (with \"characters\" array containing \"id\" or \"characterId\" fields)\nand the split-file format (plain array of character objects).\nPath can be absolute or relative to the project's Content directory." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_FilePath_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function LoadInsimulCharactersFromFile constinit property declarations *********
	static const UECodeGen_Private::FStrPropertyParams NewProp_FilePath;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function LoadInsimulCharactersFromFile constinit property declarations ***********
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function LoadInsimulCharactersFromFile Property Definitions ********************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::NewProp_FilePath = { "FilePath", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventLoadInsimulCharactersFromFile_Parms, FilePath), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_FilePath_MetaData), NewProp_FilePath_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::NewProp_FilePath,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::PropPointers) < 2048);
// ********** End Function LoadInsimulCharactersFromFile Property Definitions **********************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "LoadInsimulCharactersFromFile", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::InsimulCharacterMappingSubsystem_eventLoadInsimulCharactersFromFile_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::InsimulCharacterMappingSubsystem_eventLoadInsimulCharactersFromFile_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execLoadInsimulCharactersFromFile)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_FilePath);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->LoadInsimulCharactersFromFile(Z_Param_FilePath);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function LoadInsimulCharactersFromFile ***

// ********** Begin Class UInsimulCharacterMappingSubsystem Function RefreshMappings ***************
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Force refresh of character mappings\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Force refresh of character mappings" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function RefreshMappings constinit property declarations ***********************
// ********** End Function RefreshMappings constinit property declarations *************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "RefreshMappings", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execRefreshMappings)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->RefreshMappings();
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function RefreshMappings *****************

// ********** Begin Class UInsimulCharacterMappingSubsystem Function RegisterCrowdCharacter ********
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics
{
	struct InsimulCharacterMappingSubsystem_eventRegisterCrowdCharacter_Parms
	{
		AActor* CrowdCharacter;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Register a crowd character with the subsystem\n\x09 * Automatically assigns an available Insimul character if one exists\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Register a crowd character with the subsystem\nAutomatically assigns an available Insimul character if one exists" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function RegisterCrowdCharacter constinit property declarations ****************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function RegisterCrowdCharacter constinit property declarations ******************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function RegisterCrowdCharacter Property Definitions ***************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventRegisterCrowdCharacter_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::NewProp_CrowdCharacter,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::PropPointers) < 2048);
// ********** End Function RegisterCrowdCharacter Property Definitions *****************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "RegisterCrowdCharacter", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::InsimulCharacterMappingSubsystem_eventRegisterCrowdCharacter_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::InsimulCharacterMappingSubsystem_eventRegisterCrowdCharacter_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execRegisterCrowdCharacter)
{
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->RegisterCrowdCharacter(Z_Param_CrowdCharacter);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function RegisterCrowdCharacter **********

// ********** Begin Class UInsimulCharacterMappingSubsystem Function SetInsimulWorldId *************
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics
{
	struct InsimulCharacterMappingSubsystem_eventSetInsimulWorldId_Parms
	{
		FString WorldId;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Set the Insimul world ID for character assignment\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Set the Insimul world ID for character assignment" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldId_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function SetInsimulWorldId constinit property declarations *********************
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function SetInsimulWorldId constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function SetInsimulWorldId Property Definitions ********************************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::NewProp_WorldId = { "WorldId", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventSetInsimulWorldId_Parms, WorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldId_MetaData), NewProp_WorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::NewProp_WorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::PropPointers) < 2048);
// ********** End Function SetInsimulWorldId Property Definitions **********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "SetInsimulWorldId", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::InsimulCharacterMappingSubsystem_eventSetInsimulWorldId_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::InsimulCharacterMappingSubsystem_eventSetInsimulWorldId_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execSetInsimulWorldId)
{
	P_GET_PROPERTY(FStrProperty,Z_Param_WorldId);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SetInsimulWorldId(Z_Param_WorldId);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function SetInsimulWorldId ***************

// ********** Begin Class UInsimulCharacterMappingSubsystem Function UnregisterCrowdCharacter ******
struct Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics
{
	struct InsimulCharacterMappingSubsystem_eventUnregisterCrowdCharacter_Parms
	{
		AActor* CrowdCharacter;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Unregister a crowd character\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Unregister a crowd character" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function UnregisterCrowdCharacter constinit property declarations **************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CrowdCharacter;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function UnregisterCrowdCharacter constinit property declarations ****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function UnregisterCrowdCharacter Property Definitions *************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::NewProp_CrowdCharacter = { "CrowdCharacter", nullptr, (EPropertyFlags)0x0010000000000080, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulCharacterMappingSubsystem_eventUnregisterCrowdCharacter_Parms, CrowdCharacter), Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::NewProp_CrowdCharacter,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::PropPointers) < 2048);
// ********** End Function UnregisterCrowdCharacter Property Definitions ***************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulCharacterMappingSubsystem, nullptr, "UnregisterCrowdCharacter", 	Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::InsimulCharacterMappingSubsystem_eventUnregisterCrowdCharacter_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::InsimulCharacterMappingSubsystem_eventUnregisterCrowdCharacter_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulCharacterMappingSubsystem::execUnregisterCrowdCharacter)
{
	P_GET_OBJECT(AActor,Z_Param_CrowdCharacter);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->UnregisterCrowdCharacter(Z_Param_CrowdCharacter);
	P_NATIVE_END;
}
// ********** End Class UInsimulCharacterMappingSubsystem Function UnregisterCrowdCharacter ********

// ********** Begin Class UInsimulCharacterMappingSubsystem ****************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem;
UClass* UInsimulCharacterMappingSubsystem::GetPrivateStaticClass()
{
	using TClass = UInsimulCharacterMappingSubsystem;
	if (!Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulCharacterMappingSubsystem"),
			Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.InnerSingleton,
			StaticRegisterNativesUInsimulCharacterMappingSubsystem,
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
	return Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulCharacterMappingSubsystem_NoRegister()
{
	return UInsimulCharacterMappingSubsystem::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * Subsystem that manages the mapping between Unreal crowd characters and Insimul characters\n * Handles automatic assignment of Insimul characters to newly spawned crowd characters\n */" },
#endif
		{ "IncludePath", "InsimulCharacterMappingComponent.h" },
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Subsystem that manages the mapping between Unreal crowd characters and Insimul characters\nHandles automatic assignment of Insimul characters to newly spawned crowd characters" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterMappings_MetaData[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "// Map from Unreal Actor to Insimul Character ID\n" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Map from Unreal Actor to Insimul Character ID" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AvailableInsimulCharacters_MetaData[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "// Pool of available Insimul character IDs that haven't been assigned yet\n" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Pool of available Insimul character IDs that haven't been assigned yet" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CurrentInsimulWorldId_MetaData[] = {
#if !UE_BUILD_SHIPPING
		{ "Comment", "// Current Insimul world ID\n" },
#endif
		{ "ModuleRelativePath", "Public/InsimulCharacterMappingComponent.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Current Insimul world ID" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulCharacterMappingSubsystem constinit property declarations ********
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterMappings_ValueProp;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_CharacterMappings_Key_KeyProp;
	static const UECodeGen_Private::FMapPropertyParams NewProp_CharacterMappings;
	static const UECodeGen_Private::FStrPropertyParams NewProp_AvailableInsimulCharacters_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_AvailableInsimulCharacters;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CurrentInsimulWorldId;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulCharacterMappingSubsystem constinit property declarations **********
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("GetAvailableInsimulCharacterCount"), .Pointer = &UInsimulCharacterMappingSubsystem::execGetAvailableInsimulCharacterCount },
		{ .NameUTF8 = UTF8TEXT("GetInsimulCharacterId"), .Pointer = &UInsimulCharacterMappingSubsystem::execGetInsimulCharacterId },
		{ .NameUTF8 = UTF8TEXT("LoadInsimulCharacters"), .Pointer = &UInsimulCharacterMappingSubsystem::execLoadInsimulCharacters },
		{ .NameUTF8 = UTF8TEXT("LoadInsimulCharactersFromFile"), .Pointer = &UInsimulCharacterMappingSubsystem::execLoadInsimulCharactersFromFile },
		{ .NameUTF8 = UTF8TEXT("RefreshMappings"), .Pointer = &UInsimulCharacterMappingSubsystem::execRefreshMappings },
		{ .NameUTF8 = UTF8TEXT("RegisterCrowdCharacter"), .Pointer = &UInsimulCharacterMappingSubsystem::execRegisterCrowdCharacter },
		{ .NameUTF8 = UTF8TEXT("SetInsimulWorldId"), .Pointer = &UInsimulCharacterMappingSubsystem::execSetInsimulWorldId },
		{ .NameUTF8 = UTF8TEXT("UnregisterCrowdCharacter"), .Pointer = &UInsimulCharacterMappingSubsystem::execUnregisterCrowdCharacter },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetAvailableInsimulCharacterCount, "GetAvailableInsimulCharacterCount" }, // 198640156
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_GetInsimulCharacterId, "GetInsimulCharacterId" }, // 1471726757
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharacters, "LoadInsimulCharacters" }, // 141430606
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_LoadInsimulCharactersFromFile, "LoadInsimulCharactersFromFile" }, // 2943208538
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RefreshMappings, "RefreshMappings" }, // 838029272
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_RegisterCrowdCharacter, "RegisterCrowdCharacter" }, // 1708830850
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_SetInsimulWorldId, "SetInsimulWorldId" }, // 3357595389
		{ &Z_Construct_UFunction_UInsimulCharacterMappingSubsystem_UnregisterCrowdCharacter, "UnregisterCrowdCharacter" }, // 2013528737
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulCharacterMappingSubsystem>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics

// ********** Begin Class UInsimulCharacterMappingSubsystem Property Definitions *******************
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings_ValueProp = { "CharacterMappings", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 1, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings_Key_KeyProp = { "CharacterMappings_Key", nullptr, (EPropertyFlags)0x0004000000000000, UECodeGen_Private::EPropertyGenFlags::Object | UECodeGen_Private::EPropertyGenFlags::ObjectPtr, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UClass_AActor_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FMapPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings = { "CharacterMappings", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Map, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulCharacterMappingSubsystem, CharacterMappings), EMapPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterMappings_MetaData), NewProp_CharacterMappings_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_AvailableInsimulCharacters_Inner = { "AvailableInsimulCharacters", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_AvailableInsimulCharacters = { "AvailableInsimulCharacters", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulCharacterMappingSubsystem, AvailableInsimulCharacters), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AvailableInsimulCharacters_MetaData), NewProp_AvailableInsimulCharacters_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CurrentInsimulWorldId = { "CurrentInsimulWorldId", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulCharacterMappingSubsystem, CurrentInsimulWorldId), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CurrentInsimulWorldId_MetaData), NewProp_CurrentInsimulWorldId_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings_ValueProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings_Key_KeyProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CharacterMappings,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_AvailableInsimulCharacters_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_AvailableInsimulCharacters,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::NewProp_CurrentInsimulWorldId,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::PropPointers) < 2048);
// ********** End Class UInsimulCharacterMappingSubsystem Property Definitions *********************
UObject* (*const Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UWorldSubsystem,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::ClassParams = {
	&UInsimulCharacterMappingSubsystem::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::PropPointers),
	0,
	0x001000A0u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::Class_MetaDataParams)
};
void UInsimulCharacterMappingSubsystem::StaticRegisterNativesUInsimulCharacterMappingSubsystem()
{
	UClass* Class = UInsimulCharacterMappingSubsystem::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulCharacterMappingSubsystem()
{
	if (!Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.OuterSingleton, Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem.OuterSingleton;
}
UInsimulCharacterMappingSubsystem::UInsimulCharacterMappingSubsystem() {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulCharacterMappingSubsystem);
UInsimulCharacterMappingSubsystem::~UInsimulCharacterMappingSubsystem() {}
// ********** End Class UInsimulCharacterMappingSubsystem ******************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulCharacterMappingComponent, UInsimulCharacterMappingComponent::StaticClass, TEXT("UInsimulCharacterMappingComponent"), &Z_Registration_Info_UClass_UInsimulCharacterMappingComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulCharacterMappingComponent), 1007383611U) },
		{ Z_Construct_UClass_UInsimulCharacterMappingSubsystem, UInsimulCharacterMappingSubsystem::StaticClass, TEXT("UInsimulCharacterMappingSubsystem"), &Z_Registration_Info_UClass_UInsimulCharacterMappingSubsystem, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulCharacterMappingSubsystem), 1529872910U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h__Script_InsimulRuntime_1056515116{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
