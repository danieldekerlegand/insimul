// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulLevelScriptActor.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulLevelScriptActor() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UScriptStruct* Z_Construct_UScriptStruct_FVector();
ENGINE_API UClass* Z_Construct_UClass_AActor();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulLevelScriptActor();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulLevelScriptActor_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class AInsimulLevelScriptActor *************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_AInsimulLevelScriptActor;
UClass* AInsimulLevelScriptActor::GetPrivateStaticClass()
{
	using TClass = AInsimulLevelScriptActor;
	if (!Z_Registration_Info_UClass_AInsimulLevelScriptActor.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulLevelScriptActor"),
			Z_Registration_Info_UClass_AInsimulLevelScriptActor.InnerSingleton,
			StaticRegisterNativesAInsimulLevelScriptActor,
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
	return Z_Registration_Info_UClass_AInsimulLevelScriptActor.InnerSingleton;
}
UClass* Z_Construct_UClass_AInsimulLevelScriptActor_NoRegister()
{
	return AInsimulLevelScriptActor::GetPrivateStaticClass();
}
struct Z_Construct_UClass_AInsimulLevelScriptActor_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "IncludePath", "InsimulLevelScriptActor.h" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_bSpawnInsimulNPCs_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_SpawnLocations_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterIDs_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_CharacterNames_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_WorldID_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_APIBaseUrl_MetaData[] = {
		{ "Category", "Insimul" },
		{ "ModuleRelativePath", "Public/InsimulLevelScriptActor.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class AInsimulLevelScriptActor constinit property declarations *****************
	static void NewProp_bSpawnInsimulNPCs_SetBit(void* Obj);
	static const UECodeGen_Private::FBoolPropertyParams NewProp_bSpawnInsimulNPCs;
	static const UECodeGen_Private::FStructPropertyParams NewProp_SpawnLocations_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_SpawnLocations;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterIDs_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_CharacterIDs;
	static const UECodeGen_Private::FStrPropertyParams NewProp_CharacterNames_Inner;
	static const UECodeGen_Private::FArrayPropertyParams NewProp_CharacterNames;
	static const UECodeGen_Private::FStrPropertyParams NewProp_WorldID;
	static const UECodeGen_Private::FStrPropertyParams NewProp_APIBaseUrl;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class AInsimulLevelScriptActor constinit property declarations *******************
	static UObject* (*const DependentSingletons[])();
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<AInsimulLevelScriptActor>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_AInsimulLevelScriptActor_Statics

// ********** Begin Class AInsimulLevelScriptActor Property Definitions ****************************
void Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_bSpawnInsimulNPCs_SetBit(void* Obj)
{
	((AInsimulLevelScriptActor*)Obj)->bSpawnInsimulNPCs = 1;
}
const UECodeGen_Private::FBoolPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_bSpawnInsimulNPCs = { "bSpawnInsimulNPCs", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Bool | UECodeGen_Private::EPropertyGenFlags::NativeBool, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, sizeof(bool), sizeof(AInsimulLevelScriptActor), &Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_bSpawnInsimulNPCs_SetBit, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_bSpawnInsimulNPCs_MetaData), NewProp_bSpawnInsimulNPCs_MetaData) };
const UECodeGen_Private::FStructPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_SpawnLocations_Inner = { "SpawnLocations", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, Z_Construct_UScriptStruct_FVector, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_SpawnLocations = { "SpawnLocations", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulLevelScriptActor, SpawnLocations), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_SpawnLocations_MetaData), NewProp_SpawnLocations_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterIDs_Inner = { "CharacterIDs", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterIDs = { "CharacterIDs", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulLevelScriptActor, CharacterIDs), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterIDs_MetaData), NewProp_CharacterIDs_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterNames_Inner = { "CharacterNames", nullptr, (EPropertyFlags)0x0000000000000000, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FArrayPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterNames = { "CharacterNames", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Array, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulLevelScriptActor, CharacterNames), EArrayPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_CharacterNames_MetaData), NewProp_CharacterNames_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_WorldID = { "WorldID", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulLevelScriptActor, WorldID), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_WorldID_MetaData), NewProp_WorldID_MetaData) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_APIBaseUrl = { "APIBaseUrl", nullptr, (EPropertyFlags)0x0020080000000005, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(AInsimulLevelScriptActor, APIBaseUrl), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_APIBaseUrl_MetaData), NewProp_APIBaseUrl_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_AInsimulLevelScriptActor_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_bSpawnInsimulNPCs,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_SpawnLocations_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_SpawnLocations,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterIDs_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterIDs,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterNames_Inner,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_CharacterNames,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_WorldID,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_AInsimulLevelScriptActor_Statics::NewProp_APIBaseUrl,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulLevelScriptActor_Statics::PropPointers) < 2048);
// ********** End Class AInsimulLevelScriptActor Property Definitions ******************************
UObject* (*const Z_Construct_UClass_AInsimulLevelScriptActor_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_AActor,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulLevelScriptActor_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_AInsimulLevelScriptActor_Statics::ClassParams = {
	&AInsimulLevelScriptActor::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	nullptr,
	Z_Construct_UClass_AInsimulLevelScriptActor_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	0,
	UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulLevelScriptActor_Statics::PropPointers),
	0,
	0x009000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_AInsimulLevelScriptActor_Statics::Class_MetaDataParams), Z_Construct_UClass_AInsimulLevelScriptActor_Statics::Class_MetaDataParams)
};
void AInsimulLevelScriptActor::StaticRegisterNativesAInsimulLevelScriptActor()
{
}
UClass* Z_Construct_UClass_AInsimulLevelScriptActor()
{
	if (!Z_Registration_Info_UClass_AInsimulLevelScriptActor.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_AInsimulLevelScriptActor.OuterSingleton, Z_Construct_UClass_AInsimulLevelScriptActor_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_AInsimulLevelScriptActor.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, AInsimulLevelScriptActor);
AInsimulLevelScriptActor::~AInsimulLevelScriptActor() {}
// ********** End Class AInsimulLevelScriptActor ***************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulLevelScriptActor_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_AInsimulLevelScriptActor, AInsimulLevelScriptActor::StaticClass, TEXT("AInsimulLevelScriptActor"), &Z_Registration_Info_UClass_AInsimulLevelScriptActor, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(AInsimulLevelScriptActor), 877257833U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulLevelScriptActor_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulLevelScriptActor_h__Script_InsimulRuntime_911457235{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulLevelScriptActor_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulLevelScriptActor_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
