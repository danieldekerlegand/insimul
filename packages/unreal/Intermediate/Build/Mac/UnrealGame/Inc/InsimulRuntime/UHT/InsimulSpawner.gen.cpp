// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulSpawner.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulSpawner() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UClass_NoRegister();
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FColor();
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FRotator();
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FVector();
ENGINE_API UClass* Z_Construct_UClass_AActor();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulAICharacter_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulSpawner();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulSpawner_NoRegister();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulCharacterSpawnData();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin ScriptStruct FInsimulCharacterSpawnData ****************************************
struct Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics
{
	static inline consteval int32 GetStructSize() { return sizeof(FInsimulCharacterSpawnData); }
	static inline consteval int16 GetStructAlignment() { return alignof(FInsimulCharacterSpawnData); }
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Struct_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Location_MetaData[] = {
		{ "Category", "Spawn" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_Rotation_MetaData[] = {
		{ "Category", "Spawn" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterID_MetaData[] = {
		{ "Category", "Spawn" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterName_MetaData[] = {
		{ "Category", "Spawn" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
#endif // WITH_METADATA

// ********** Begin ScriptStruct FInsimulCharacterSpawnData constinit property declarations ********
	static const UECodeGen_Private::FStructPropertyParams NewProp_Location;
	static const UECodeGen_Private::FStructPropertyParams NewProp_Rotation;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterName;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End ScriptStruct FInsimulCharacterSpawnData constinit property declarations **********
	static void* NewStructOps()
	{
		return (UScriptStruct::ICppStructOps*)new UScriptStruct::TCppStructOps<FInsimulCharacterSpawnData>();
	}
	static const UECodeGen_Private::FStructParams StructParams;
}; // struct Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics
static FStructRegistrationInfo Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData;
class UScriptStruct* FInsimulCharacterSpawnData::StaticStruct()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.OuterSingleton)
	{
		Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.OuterSingleton = GetStaticStruct(Z_Construct_UScriptStruct_FInsimulCharacterSpawnData, (UObject*)Z_Construct_UPackage__Script_InsimulRuntime(), TEXT("InsimulCharacterSpawnData"));
	}
	return Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.OuterSingleton;
	}

// ********** Begin ScriptStruct FInsimulCharacterSpawnData Property Definitions *******************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_Location = { "Location", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulCharacterSpawnData, Location), Z_Construct_UScriptStruct_FVector, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Location_MetaData), NewProp_Location_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_Rotation = { "Rotation", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulCharacterSpawnData, Rotation), Z_Construct_UScriptStruct_FRotator, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_Rotation_MetaData), NewProp_Rotation_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_CharacterID = { "CharacterID", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulCharacterSpawnData, CharacterID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterID_MetaData), NewProp_CharacterID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_CharacterName = { "CharacterName", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(FInsimulCharacterSpawnData, CharacterName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterName_MetaData), NewProp_CharacterName_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_Location,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_Rotation,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_CharacterID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewProp_CharacterName,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::PropPointers) < 2048);
// ********** End ScriptStruct FInsimulCharacterSpawnData Property Definitions *********************
const UECodeGen_Private::FStructParams Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::StructParams = {
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
	nullptr,
	&NewStructOps,
	"InsimulCharacterSpawnData",
	Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::PropPointers,
	UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::PropPointers),
	sizeof(FInsimulCharacterSpawnData),
	alignof(FInsimulCharacterSpawnData),
	RF_Public|RF_Transient|RF_MarkAsNative,
	EStructFlags(0x00000001),
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::Struct_MetaDataParams), Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::Struct_MetaDataParams)
};
UScriptStruct* Z_Construct_UScriptStruct_FInsimulCharacterSpawnData()
{
	if (!Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.InnerSingleton)
	{
		UECodeGen_Private::ConstructUScriptStruct(Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.InnerSingleton, Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::StructParams);
	}
	return CastChecked<UScriptStruct>(Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData.InnerSingleton);
}
// ********** End ScriptStruct FInsimulCharacterSpawnData ******************************************

// ********** Begin Class AInsimulSpawner Function ClearSpawnedAI **********************************
struct Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Clear all spawned AI characters */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Clear all spawned AI characters" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function ClearSpawnedAI constinit property declarations ************************
// ********** End Function ClearSpawnedAI constinit property declarations **************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulSpawner, nullptr, "ClearSpawnedAI", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulSpawner::execClearSpawnedAI)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ClearSpawnedAI();
	P_NATIVE_END;
}
// ********** End Class AInsimulSpawner Function ClearSpawnedAI ************************************

// ********** Begin Class AInsimulSpawner Function FetchAndSpawnCharacters *************************
struct Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fetch characters from the Insimul server for the configured WorldID, then spawn them */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fetch characters from the Insimul server for the configured WorldID, then spawn them" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function FetchAndSpawnCharacters constinit property declarations ***************
// ********** End Function FetchAndSpawnCharacters constinit property declarations *****************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulSpawner, nullptr, "FetchAndSpawnCharacters", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulSpawner::execFetchAndSpawnCharacters)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->FetchAndSpawnCharacters();
	P_NATIVE_END;
}
// ********** End Class AInsimulSpawner Function FetchAndSpawnCharacters ***************************

// ********** Begin Class AInsimulSpawner Function GetSpawnedAI ************************************
struct Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics
{
	struct InsimulSpawner_eventGetSpawnedAI_Parms
	{
		TArray<AInsimulAICharacter*> ReturnValue;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Get spawned AI characters */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get spawned AI characters" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetSpawnedAI constinit property declarations **************************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_ReturnValue_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetSpawnedAI constinit property declarations ****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetSpawnedAI Property Definitions *************************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::NewProp_ReturnValue_Inner = { "ReturnValue", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UClass_AInsimulAICharacter_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulSpawner_eventGetSpawnedAI_Parms, ReturnValue), EArrayPropertyFlags::None, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::NewProp_ReturnValue_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::PropPointers) < 2048);
// ********** End Function GetSpawnedAI Property Definitions ***************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulSpawner, nullptr, "GetSpawnedAI", 	Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::InsimulSpawner_eventGetSpawnedAI_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x54020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::InsimulSpawner_eventGetSpawnedAI_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulSpawner::execGetSpawnedAI)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(TArray<AInsimulAICharacter*>*)Z_Param__Result=P_THIS->GetSpawnedAI();
	P_NATIVE_END;
}
// ********** End Class AInsimulSpawner Function GetSpawnedAI **************************************

// ********** Begin Class AInsimulSpawner Function SpawnAICharacters *******************************
struct Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Spawn all AI characters at configured locations */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Spawn all AI characters at configured locations" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function SpawnAICharacters constinit property declarations *********************
// ********** End Function SpawnAICharacters constinit property declarations ***********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_AInsimulSpawner, nullptr, "SpawnAICharacters", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters_Statics::Function_MetaDataParams), Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(AInsimulSpawner::execSpawnAICharacters)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->SpawnAICharacters();
	P_NATIVE_END;
}
// ********** End Class AInsimulSpawner Function SpawnAICharacters *********************************

// ********** Begin Class AInsimulSpawner **********************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_AInsimulSpawner;
UClass* AInsimulSpawner::GetPrivateStaticClass()
{
	using TClass = AInsimulSpawner;
	if (!Z_Registration_Info_UClass_AInsimulSpawner.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulSpawner"),
			Z_Registration_Info_UClass_AInsimulSpawner.InnerSingleton,
			StaticRegisterNativesAInsimulSpawner,
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
	return Z_Registration_Info_UClass_AInsimulSpawner.InnerSingleton;
}
UClass* Z_Construct_UClass_AInsimulSpawner_NoRegister()
{
	return AInsimulSpawner::GetPrivateStaticClass();
}
struct Z_Construct_UClass_AInsimulSpawner_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "IncludePath", "InsimulSpawner.h" },
		{ "IsBlueprintBase", "true" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterSpawnData_MetaData[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Spawn locations and data for AI characters */" },
#endif
		{ "MakeEditWidget", "TRUE" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Spawn locations and data for AI characters" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldID_MetaData[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Insimul World ID to load characters from. Leave empty to use default from plugin settings. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Insimul World ID to load characters from. Leave empty to use default from plugin settings." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bAutoSpawnAI_MetaData[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Whether to automatically spawn AI characters on level start */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Whether to automatically spawn AI characters on level start" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bFetchCharactersFromServer_MetaData[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Fetch characters from the Insimul server and auto-fill CharacterSpawnData.\n\x09 *  Uses WorldID (or the default from plugin settings).\n\x09 *  Spawn locations are distributed around the spawner's position. */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Fetch characters from the Insimul server and auto-fill CharacterSpawnData.\nUses WorldID (or the default from plugin settings).\nSpawn locations are distributed around the spawner's position." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_AICharacterClass_MetaData[] = {
		{ "Category", "AI Setup" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Class to use for spawned AI characters */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Class to use for spawned AI characters" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bShowDebugSpheres_MetaData[] = {
		{ "Category", "Debug" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Show debug spheres at spawn locations */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Show debug spheres at spawn locations" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DebugSphereRadius_MetaData[] = {
		{ "Category", "Debug" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Debug sphere radius */" },
#endif
		{ "EditCondition", "bShowDebugSpheres" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Debug sphere radius" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_DebugSphereColor_MetaData[] = {
		{ "Category", "Debug" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Debug sphere color */" },
#endif
		{ "EditCondition", "bShowDebugSpheres" },
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Debug sphere color" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SpawnedAICharacters_MetaData[] = {
		{ "ModuleRelativePath", "Public/InsimulSpawner.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class AInsimulSpawner constinit property declarations **************************
	static const UECodeGen_Private::FStructPropertyParams NewProp_CharacterSpawnData_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_CharacterSpawnData;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldID;
	static void NewProp_bAutoSpawnAI_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bAutoSpawnAI;
	static void NewProp_bFetchCharactersFromServer_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bFetchCharactersFromServer;
	static const UECodeGen_Private::FClassPropertyParams NewProp_AICharacterClass;
	static void NewProp_bShowDebugSpheres_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bShowDebugSpheres;
	static const UECodeGen_Private::FFloatPropertyParams NewProp_DebugSphereRadius;
	static const UECodeGen_Private::FStructPropertyParams NewProp_DebugSphereColor;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_SpawnedAICharacters_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_SpawnedAICharacters;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class AInsimulSpawner constinit property declarations ****************************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("ClearSpawnedAI"), .Pointer = &AInsimulSpawner::execClearSpawnedAI },
		{ .NameUTF8 = UTF8TEXT("FetchAndSpawnCharacters"), .Pointer = &AInsimulSpawner::execFetchAndSpawnCharacters },
		{ .NameUTF8 = UTF8TEXT("GetSpawnedAI"), .Pointer = &AInsimulSpawner::execGetSpawnedAI },
		{ .NameUTF8 = UTF8TEXT("SpawnAICharacters"), .Pointer = &AInsimulSpawner::execSpawnAICharacters },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_AInsimulSpawner_ClearSpawnedAI, "ClearSpawnedAI" }, // 856265122
		{ &Z_Construct_UFunction_AInsimulSpawner_FetchAndSpawnCharacters, "FetchAndSpawnCharacters" }, // 3941616442
		{ &Z_Construct_UFunction_AInsimulSpawner_GetSpawnedAI, "GetSpawnedAI" }, // 2852190076
		{ &Z_Construct_UFunction_AInsimulSpawner_SpawnAICharacters, "SpawnAICharacters" }, // 2190629032
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<AInsimulSpawner>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_AInsimulSpawner_Statics

// ********** Begin Class AInsimulSpawner Property Definitions *************************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_CharacterSpawnData_Inner = { "CharacterSpawnData", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FInsimulCharacterSpawnData, METADATA_PARAMS(0, nullptr) }; // 1478816777
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_CharacterSpawnData = { "CharacterSpawnData", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, CharacterSpawnData), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterSpawnData_MetaData), NewProp_CharacterSpawnData_MetaData) }; // 1478816777
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_WorldID = { "WorldID", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, WorldID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldID_MetaData), NewProp_WorldID_MetaData) };
void Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bAutoSpawnAI_SetBit(void* Obj)
{
	((AInsimulSpawner*)Obj)->bAutoSpawnAI = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bAutoSpawnAI = { "bAutoSpawnAI", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(AInsimulSpawner), &Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bAutoSpawnAI_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bAutoSpawnAI_MetaData), NewProp_bAutoSpawnAI_MetaData) };
void Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bFetchCharactersFromServer_SetBit(void* Obj)
{
	((AInsimulSpawner*)Obj)->bFetchCharactersFromServer = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bFetchCharactersFromServer = { "bFetchCharactersFromServer", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(AInsimulSpawner), &Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bFetchCharactersFromServer_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bFetchCharactersFromServer_MetaData), NewProp_bFetchCharactersFromServer_MetaData) };
const UECodeGen_Private::FClassPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_AICharacterClass = { "AICharacterClass", nullptr, (EPropertyFlags)0x0024080000000005, UECodeGen_Private::EPropertyGenFlags::Class, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, AICharacterClass), Z_Construct_UClass_UClass_NoRegister, Z_Construct_UClass_AInsimulAICharacter_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_AICharacterClass_MetaData), NewProp_AICharacterClass_MetaData) };
void Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bShowDebugSpheres_SetBit(void* Obj)
{
	((AInsimulSpawner*)Obj)->bShowDebugSpheres = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bShowDebugSpheres = { "bShowDebugSpheres", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(AInsimulSpawner), &Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bShowDebugSpheres_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bShowDebugSpheres_MetaData), NewProp_bShowDebugSpheres_MetaData) };
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_DebugSphereRadius = { "DebugSphereRadius", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, DebugSphereRadius), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DebugSphereRadius_MetaData), NewProp_DebugSphereRadius_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_DebugSphereColor = { "DebugSphereColor", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, DebugSphereColor), Z_Construct_UScriptStruct_FColor, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_DebugSphereColor_MetaData), NewProp_DebugSphereColor_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_SpawnedAICharacters_Inner = { "SpawnedAICharacters", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UClass_AInsimulAICharacter_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_SpawnedAICharacters = { "SpawnedAICharacters", nullptr, (EPropertyFlags)0x0040000000000000, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulSpawner, SpawnedAICharacters), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SpawnedAICharacters_MetaData), NewProp_SpawnedAICharacters_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_AInsimulSpawner_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_CharacterSpawnData_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_CharacterSpawnData,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_WorldID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bAutoSpawnAI,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bFetchCharactersFromServer,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_AICharacterClass,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_bShowDebugSpheres,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_DebugSphereRadius,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_DebugSphereColor,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_SpawnedAICharacters_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulSpawner_Statics::NewProp_SpawnedAICharacters,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulSpawner_Statics::PropPointers) < 2048);
// ********** End Class AInsimulSpawner Property Definitions ***************************************
UObject* (*const Z_Construct_UClass_AInsimulSpawner_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_AActor,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulSpawner_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_AInsimulSpawner_Statics::ClassParams = {
	&AInsimulSpawner::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_AInsimulSpawner_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulSpawner_Statics::PropPointers),
	0,
	0x009000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulSpawner_Statics::Class_MetaDataParams), Z_Construct_UClass_AInsimulSpawner_Statics::Class_MetaDataParams)
};
void AInsimulSpawner::StaticRegisterNativesAInsimulSpawner()
{
	UClass* Class = AInsimulSpawner::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_AInsimulSpawner_Statics::Funcs));
}
UClass* Z_Construct_UClass_AInsimulSpawner()
{
	if (!Z_Registration_Info_UClass_AInsimulSpawner.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_AInsimulSpawner.OuterSingleton, Z_Construct_UClass_AInsimulSpawner_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_AInsimulSpawner.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, AInsimulSpawner);
AInsimulSpawner::~AInsimulSpawner() {}
// ********** End Class AInsimulSpawner ************************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics
{
	static constexpr FStructRegisterCompiledInInfo ScriptStructInfo[] = {
		{ FInsimulCharacterSpawnData::StaticStruct, Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics::NewStructOps, TEXT("InsimulCharacterSpawnData"),&Z_Registration_Info_UScriptStruct_FInsimulCharacterSpawnData, CONSTRUCT_RELOAD_VERSION_INFO(FStructReloadVersionInfo, sizeof(FInsimulCharacterSpawnData), 1478816777U) },
	};
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_AInsimulSpawner, AInsimulSpawner::StaticClass, TEXT("AInsimulSpawner"), &Z_Registration_Info_UClass_AInsimulSpawner, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(AInsimulSpawner), 1286350137U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_1940213970{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics::ClassInfo),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics::ScriptStructInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h__Script_InsimulRuntime_Statics::ScriptStructInfo),
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
