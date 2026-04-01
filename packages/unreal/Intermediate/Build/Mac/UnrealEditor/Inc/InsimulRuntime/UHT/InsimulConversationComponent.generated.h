// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulConversationComponent.h"

#ifdef INSIMULRUNTIME_InsimulConversationComponent_generated_h
#error "InsimulConversationComponent.generated.h already included, missing '#pragma once' in InsimulConversationComponent.h"
#endif
#define INSIMULRUNTIME_InsimulConversationComponent_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
struct FInsimulConversation;
struct FInsimulUtterance;

// ********** Begin ScriptStruct FInsimulConversationConfig ****************************************
struct Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_16_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulConversationConfig_Statics; \
	INSIMULRUNTIME_API static class UScriptStruct* StaticStruct();


struct FInsimulConversationConfig;
// ********** End ScriptStruct FInsimulConversationConfig ******************************************

// ********** Begin ScriptStruct FInsimulUtterance *************************************************
struct Z_Construct_UScriptStruct_FInsimulUtterance_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_46_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulUtterance_Statics; \
	INSIMULRUNTIME_API static class UScriptStruct* StaticStruct();


struct FInsimulUtterance;
// ********** End ScriptStruct FInsimulUtterance ***************************************************

// ********** Begin ScriptStruct FInsimulConversation **********************************************
struct Z_Construct_UScriptStruct_FInsimulConversation_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_64_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulConversation_Statics; \
	INSIMULRUNTIME_API static class UScriptStruct* StaticStruct();


struct FInsimulConversation;
// ********** End ScriptStruct FInsimulConversation ************************************************

// ********** Begin Delegate FOnInsimulConversationStarted *****************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_79_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulConversationStarted_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulConversationStarted, FInsimulConversation const& Conversation);


// ********** End Delegate FOnInsimulConversationStarted *******************************************

// ********** Begin Delegate FOnInsimulUtteranceReceived *******************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_80_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulUtteranceReceived_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulUtteranceReceived, FInsimulUtterance const& Utterance);


// ********** End Delegate FOnInsimulUtteranceReceived *********************************************

// ********** Begin Delegate FOnInsimulConversationEnded *******************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_81_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulConversationEnded_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulConversationEnded, FInsimulConversation const& Conversation);


// ********** End Delegate FOnInsimulConversationEnded *********************************************

// ********** Begin Delegate FOnInsimulAudioChunkReceived ******************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_83_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulAudioChunkReceived_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulAudioChunkReceived, TArray<uint8> const& AudioData, int32 DurationMs);


// ********** End Delegate FOnInsimulAudioChunkReceived ********************************************

// ********** Begin Class UInsimulConversationComponent ********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execStartPlayerInitiatedConversation); \
	DECLARE_FUNCTION(execInitializeInsimul); \
	DECLARE_FUNCTION(execIsInConversation); \
	DECLARE_FUNCTION(execEndConversation); \
	DECLARE_FUNCTION(execSendMessage); \
	DECLARE_FUNCTION(execStartConversationWithCharacter);


struct Z_Construct_UClass_UInsimulConversationComponent_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulConversationComponent_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulConversationComponent(); \
	friend struct ::Z_Construct_UClass_UInsimulConversationComponent_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulConversationComponent_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulConversationComponent, UActorComponent, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulConversationComponent_NoRegister) \
	DECLARE_SERIALIZER(UInsimulConversationComponent)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulConversationComponent(UInsimulConversationComponent&&) = delete; \
	UInsimulConversationComponent(const UInsimulConversationComponent&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulConversationComponent); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulConversationComponent); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulConversationComponent) \
	NO_API virtual ~UInsimulConversationComponent();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_85_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h_88_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulConversationComponent;

// ********** End Class UInsimulConversationComponent **********************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulConversationComponent_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
