// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulAICharacter.h"

#ifdef INSIMULRUNTIME_InsimulAICharacter_generated_h
#error "InsimulAICharacter.generated.h already included, missing '#pragma once' in InsimulAICharacter.h"
#endif
#define INSIMULRUNTIME_InsimulAICharacter_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class AActor;
class AInsimulAICharacter;
class APawn;
class UPrimitiveComponent;
struct FHitResult;
struct FInsimulConversation;
struct FInsimulUtterance;

// ********** Begin Delegate FOnInsimulNPCInteract *************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_15_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulNPCInteract_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulNPCInteract, AInsimulAICharacter* NPC, APawn* InteractingPawn);


// ********** End Delegate FOnInsimulNPCInteract ***************************************************

// ********** Begin Class AInsimulAICharacter ******************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execOnInteractionSphereBeginOverlap); \
	DECLARE_FUNCTION(execOnAudioChunkReceived); \
	DECLARE_FUNCTION(execOnConversationEnded); \
	DECLARE_FUNCTION(execOnConversationStarted); \
	DECLARE_FUNCTION(execOnUtteranceReceived); \
	DECLARE_FUNCTION(execHandlePlayerInteract);


struct Z_Construct_UClass_AInsimulAICharacter_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_AInsimulAICharacter_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesAInsimulAICharacter(); \
	friend struct ::Z_Construct_UClass_AInsimulAICharacter_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_AInsimulAICharacter_NoRegister(); \
public: \
	DECLARE_CLASS2(AInsimulAICharacter, ACharacter, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_AInsimulAICharacter_NoRegister) \
	DECLARE_SERIALIZER(AInsimulAICharacter)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	AInsimulAICharacter(AInsimulAICharacter&&) = delete; \
	AInsimulAICharacter(const AInsimulAICharacter&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, AInsimulAICharacter); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(AInsimulAICharacter); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(AInsimulAICharacter) \
	NO_API virtual ~AInsimulAICharacter();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_17_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h_20_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class AInsimulAICharacter;

// ********** End Class AInsimulAICharacter ********************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAICharacter_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
