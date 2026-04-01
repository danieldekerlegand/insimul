// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulSpawner.h"

#ifdef INSIMULRUNTIME_InsimulSpawner_generated_h
#error "InsimulSpawner.generated.h already included, missing '#pragma once' in InsimulSpawner.h"
#endif
#define INSIMULRUNTIME_InsimulSpawner_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class AInsimulAICharacter;

// ********** Begin ScriptStruct FInsimulCharacterSpawnData ****************************************
struct Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_14_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulCharacterSpawnData_Statics; \
	INSIMULRUNTIME_API static class UScriptStruct* StaticStruct();


struct FInsimulCharacterSpawnData;
// ********** End ScriptStruct FInsimulCharacterSpawnData ******************************************

// ********** Begin Class AInsimulSpawner **********************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execGetSpawnedAI); \
	DECLARE_FUNCTION(execClearSpawnedAI); \
	DECLARE_FUNCTION(execFetchAndSpawnCharacters); \
	DECLARE_FUNCTION(execSpawnAICharacters);


struct Z_Construct_UClass_AInsimulSpawner_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulSpawner_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesAInsimulSpawner(); \
	friend struct ::Z_Construct_UClass_AInsimulSpawner_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_AInsimulSpawner_NoRegister(); \
public: \
	DECLARE_CLASS2(AInsimulSpawner, AActor, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_AInsimulSpawner_NoRegister) \
	DECLARE_SERIALIZER(AInsimulSpawner)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	AInsimulSpawner(AInsimulSpawner&&) = delete; \
	AInsimulSpawner(const AInsimulSpawner&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, AInsimulSpawner); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(AInsimulSpawner); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(AInsimulSpawner) \
	NO_API virtual ~AInsimulSpawner();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_29_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h_32_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class AInsimulSpawner;

// ********** End Class AInsimulSpawner ************************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSpawner_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
