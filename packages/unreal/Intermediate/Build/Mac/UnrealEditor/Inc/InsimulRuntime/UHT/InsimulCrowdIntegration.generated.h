// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulCrowdIntegration.h"

#ifdef INSIMULRUNTIME_InsimulCrowdIntegration_generated_h
#error "InsimulCrowdIntegration.generated.h already included, missing '#pragma once' in InsimulCrowdIntegration.h"
#endif
#define INSIMULRUNTIME_InsimulCrowdIntegration_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class AActor;
class UObject;

// ********** Begin Class UInsimulCrowdIntegration *************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execIsAutomaticMappingEnabled); \
	DECLARE_FUNCTION(execAddInsimulMappingToActor); \
	DECLARE_FUNCTION(execConfigureInsimul); \
	DECLARE_FUNCTION(execEnableAutomaticMapping);


struct Z_Construct_UClass_UInsimulCrowdIntegration_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdIntegration_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulCrowdIntegration(); \
	friend struct ::Z_Construct_UClass_UInsimulCrowdIntegration_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulCrowdIntegration_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulCrowdIntegration, UGameInstanceSubsystem, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulCrowdIntegration_NoRegister) \
	DECLARE_SERIALIZER(UInsimulCrowdIntegration)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulCrowdIntegration(); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulCrowdIntegration(UInsimulCrowdIntegration&&) = delete; \
	UInsimulCrowdIntegration(const UInsimulCrowdIntegration&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulCrowdIntegration); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulCrowdIntegration); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulCrowdIntegration) \
	NO_API virtual ~UInsimulCrowdIntegration();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_13_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_16_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulCrowdIntegration;

// ********** End Class UInsimulCrowdIntegration ***************************************************

// ********** Begin Class UInsimulCrowdBlueprintLibrary ********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execEnableInsimulIntegration); \
	DECLARE_FUNCTION(execGetAvailableInsimulCharacterCount); \
	DECLARE_FUNCTION(execLoadInsimulCharactersForWorld); \
	DECLARE_FUNCTION(execSetInsimulCharacterId); \
	DECLARE_FUNCTION(execIsMappedToInsimul); \
	DECLARE_FUNCTION(execGetInsimulCharacterId);


struct Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulCrowdBlueprintLibrary(); \
	friend struct ::Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulCrowdBlueprintLibrary, UBlueprintFunctionLibrary, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulCrowdBlueprintLibrary_NoRegister) \
	DECLARE_SERIALIZER(UInsimulCrowdBlueprintLibrary)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulCrowdBlueprintLibrary(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulCrowdBlueprintLibrary(UInsimulCrowdBlueprintLibrary&&) = delete; \
	UInsimulCrowdBlueprintLibrary(const UInsimulCrowdBlueprintLibrary&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulCrowdBlueprintLibrary); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulCrowdBlueprintLibrary); \
	DEFINE_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulCrowdBlueprintLibrary) \
	NO_API virtual ~UInsimulCrowdBlueprintLibrary();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_59_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h_62_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulCrowdBlueprintLibrary;

// ********** End Class UInsimulCrowdBlueprintLibrary **********************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCrowdIntegration_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
