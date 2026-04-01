// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulAudioCaptureComponent.h"

#ifdef INSIMULRUNTIME_InsimulAudioCaptureComponent_generated_h
#error "InsimulAudioCaptureComponent.generated.h already included, missing '#pragma once' in InsimulAudioCaptureComponent.h"
#endif
#define INSIMULRUNTIME_InsimulAudioCaptureComponent_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS

// ********** Begin Delegate FOnInsimulCaptureEvent ************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_9_DELEGATE \
INSIMULRUNTIME_API void FOnInsimulCaptureEvent_DelegateWrapper(const FMulticastScriptDelegate& OnInsimulCaptureEvent, const FString& Message);


// ********** End Delegate FOnInsimulCaptureEvent **************************************************

// ********** Begin Class UInsimulAudioCaptureComponent ********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execClearBuffer); \
	DECLARE_FUNCTION(execGetCapturedAudio); \
	DECLARE_FUNCTION(execIsCapturing); \
	DECLARE_FUNCTION(execStopCapture); \
	DECLARE_FUNCTION(execStartCapture);


struct Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulAudioCaptureComponent_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulAudioCaptureComponent(); \
	friend struct ::Z_Construct_UClass_UInsimulAudioCaptureComponent_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulAudioCaptureComponent_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulAudioCaptureComponent, UActorComponent, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulAudioCaptureComponent_NoRegister) \
	DECLARE_SERIALIZER(UInsimulAudioCaptureComponent)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulAudioCaptureComponent(UInsimulAudioCaptureComponent&&) = delete; \
	UInsimulAudioCaptureComponent(const UInsimulAudioCaptureComponent&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulAudioCaptureComponent); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulAudioCaptureComponent); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulAudioCaptureComponent) \
	NO_API virtual ~UInsimulAudioCaptureComponent();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_17_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h_20_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulAudioCaptureComponent;

// ********** End Class UInsimulAudioCaptureComponent **********************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulAudioCaptureComponent_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
