// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulCharacterMappingComponent.h"

#ifdef INSIMULRUNTIME_InsimulCharacterMappingComponent_generated_h
#error "InsimulCharacterMappingComponent.generated.h already included, missing '#pragma once' in InsimulCharacterMappingComponent.h"
#endif
#define INSIMULRUNTIME_InsimulCharacterMappingComponent_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class AActor;

// ********** Begin Class UInsimulCharacterMappingComponent ****************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execGetInsimulCharacterName); \
	DECLARE_FUNCTION(execClearInsimulMapping); \
	DECLARE_FUNCTION(execSetInsimulCharacterId); \
	DECLARE_FUNCTION(execIsMappedToInsimul);


struct Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingComponent_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulCharacterMappingComponent(); \
	friend struct ::Z_Construct_UClass_UInsimulCharacterMappingComponent_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulCharacterMappingComponent_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulCharacterMappingComponent, UActorComponent, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulCharacterMappingComponent_NoRegister) \
	DECLARE_SERIALIZER(UInsimulCharacterMappingComponent)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulCharacterMappingComponent(UInsimulCharacterMappingComponent&&) = delete; \
	UInsimulCharacterMappingComponent(const UInsimulCharacterMappingComponent&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulCharacterMappingComponent); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulCharacterMappingComponent); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulCharacterMappingComponent) \
	NO_API virtual ~UInsimulCharacterMappingComponent();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_15_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_18_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulCharacterMappingComponent;

// ********** End Class UInsimulCharacterMappingComponent ******************************************

// ********** Begin Class UInsimulCharacterMappingSubsystem ****************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execRefreshMappings); \
	DECLARE_FUNCTION(execGetAvailableInsimulCharacterCount); \
	DECLARE_FUNCTION(execLoadInsimulCharactersFromFile); \
	DECLARE_FUNCTION(execLoadInsimulCharacters); \
	DECLARE_FUNCTION(execSetInsimulWorldId); \
	DECLARE_FUNCTION(execGetInsimulCharacterId); \
	DECLARE_FUNCTION(execUnregisterCrowdCharacter); \
	DECLARE_FUNCTION(execRegisterCrowdCharacter);


struct Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulCharacterMappingSubsystem_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulCharacterMappingSubsystem(); \
	friend struct ::Z_Construct_UClass_UInsimulCharacterMappingSubsystem_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulCharacterMappingSubsystem_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulCharacterMappingSubsystem, UWorldSubsystem, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulCharacterMappingSubsystem_NoRegister) \
	DECLARE_SERIALIZER(UInsimulCharacterMappingSubsystem)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulCharacterMappingSubsystem(); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulCharacterMappingSubsystem(UInsimulCharacterMappingSubsystem&&) = delete; \
	UInsimulCharacterMappingSubsystem(const UInsimulCharacterMappingSubsystem&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulCharacterMappingSubsystem); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulCharacterMappingSubsystem); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulCharacterMappingSubsystem) \
	NO_API virtual ~UInsimulCharacterMappingSubsystem();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_68_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h_71_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulCharacterMappingSubsystem;

// ********** End Class UInsimulCharacterMappingSubsystem ******************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulCharacterMappingComponent_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
