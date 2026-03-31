// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulTypes.h"

#ifdef INSIMULRUNTIME_InsimulTypes_generated_h
#error "InsimulTypes.generated.h already included, missing '#pragma once' in InsimulTypes.h"
#endif
#define INSIMULRUNTIME_InsimulTypes_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
struct FInsimulActionTrigger;
struct FInsimulFacialData;

// ********** Begin ScriptStruct FInsimulViseme ****************************************************
struct Z_Construct_UScriptStruct_FInsimulViseme_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_33_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulViseme_Statics; \
	static class UScriptStruct* StaticStruct();


struct FInsimulViseme;
// ********** End ScriptStruct FInsimulViseme ******************************************************

// ********** Begin ScriptStruct FInsimulFacialData ************************************************
struct Z_Construct_UScriptStruct_FInsimulFacialData_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_52_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulFacialData_Statics; \
	static class UScriptStruct* StaticStruct();


struct FInsimulFacialData;
// ********** End ScriptStruct FInsimulFacialData **************************************************

// ********** Begin ScriptStruct FInsimulActionTrigger *********************************************
struct Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_62_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulActionTrigger_Statics; \
	static class UScriptStruct* StaticStruct();


struct FInsimulActionTrigger;
// ********** End ScriptStruct FInsimulActionTrigger ***********************************************

// ********** Begin ScriptStruct FInsimulAudioChunk ************************************************
struct Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_78_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulAudioChunk_Statics; \
	static class UScriptStruct* StaticStruct();


struct FInsimulAudioChunk;
// ********** End ScriptStruct FInsimulAudioChunk **************************************************

// ********** Begin Delegate FOnInsimulFacialData **************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_95_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulFacialData_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulFacialData, FInsimulFacialData const& Data);


// ********** End Delegate FOnInsimulFacialData ****************************************************

// ********** Begin Delegate FOnInsimulActionTrigger ***********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h_96_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulActionTrigger_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulActionTrigger, FInsimulActionTrigger const& Action);


// ********** End Delegate FOnInsimulActionTrigger *************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulTypes_h

// ********** Begin Enum EInsimulAudioEncoding *****************************************************
#define FOREACH_ENUM_EINSIMULAUDIOENCODING(op) \
	op(EInsimulAudioEncoding::Unspecified) \
	op(EInsimulAudioEncoding::PCM) \
	op(EInsimulAudioEncoding::OPUS) \
	op(EInsimulAudioEncoding::MP3) 

enum class EInsimulAudioEncoding : uint8;
template<> struct TIsUEnumClass<EInsimulAudioEncoding> { enum { Value = true }; };
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulAudioEncoding>();
// ********** End Enum EInsimulAudioEncoding *******************************************************

// ********** Begin Enum EInsimulConversationState *************************************************
#define FOREACH_ENUM_EINSIMULCONVERSATIONSTATE(op) \
	op(EInsimulConversationState::Unspecified) \
	op(EInsimulConversationState::Started) \
	op(EInsimulConversationState::Active) \
	op(EInsimulConversationState::Paused) \
	op(EInsimulConversationState::Ended) 

enum class EInsimulConversationState : uint8;
template<> struct TIsUEnumClass<EInsimulConversationState> { enum { Value = true }; };
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulConversationState>();
// ********** End Enum EInsimulConversationState ***************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
