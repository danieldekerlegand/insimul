// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulQuestWidget.h"

#ifdef INSIMULRUNTIME_InsimulQuestWidget_generated_h
#error "InsimulQuestWidget.generated.h already included, missing '#pragma once' in InsimulQuestWidget.h"
#endif
#define INSIMULRUNTIME_InsimulQuestWidget_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
struct FInsimulQuest;
struct FLinearColor;

// ********** Begin ScriptStruct FInsimulQuest *****************************************************
struct Z_Construct_UScriptStruct_FInsimulQuest_Statics;
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_16_GENERATED_BODY \
	friend struct ::Z_Construct_UScriptStruct_FInsimulQuest_Statics; \
	INSIMULRUNTIME_API static class UScriptStruct* StaticStruct();


struct FInsimulQuest;
// ********** End ScriptStruct FInsimulQuest *******************************************************

// ********** Begin Class UInsimulQuestWidget ******************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execGetCompletedQuests); \
	DECLARE_FUNCTION(execGetActiveQuests); \
	DECLARE_FUNCTION(execGetQuests); \
	DECLARE_FUNCTION(execSetServerURL); \
	DECLARE_FUNCTION(execRefreshQuests); \
	DECLARE_FUNCTION(execLoadQuestsForPlayer); \
	DECLARE_FUNCTION(execLoadQuestsForCharacter);


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_CALLBACK_WRAPPERS
struct Z_Construct_UClass_UInsimulQuestWidget_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestWidget_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulQuestWidget(); \
	friend struct ::Z_Construct_UClass_UInsimulQuestWidget_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulQuestWidget_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulQuestWidget, UUserWidget, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulQuestWidget_NoRegister) \
	DECLARE_SERIALIZER(UInsimulQuestWidget)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulQuestWidget(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulQuestWidget(UInsimulQuestWidget&&) = delete; \
	UInsimulQuestWidget(const UInsimulQuestWidget&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulQuestWidget); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulQuestWidget); \
	DEFINE_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulQuestWidget) \
	NO_API virtual ~UInsimulQuestWidget();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_56_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_CALLBACK_WRAPPERS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_59_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulQuestWidget;

// ********** End Class UInsimulQuestWidget ********************************************************

// ********** Begin Class UInsimulQuestBlueprintLibrary ********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execFormatQuestDescription); \
	DECLARE_FUNCTION(execGetQuestTypeIcon); \
	DECLARE_FUNCTION(execGetQuestDifficultyColor); \
	DECLARE_FUNCTION(execGetQuestStatusColor);


struct Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestBlueprintLibrary_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulQuestBlueprintLibrary(); \
	friend struct ::Z_Construct_UClass_UInsimulQuestBlueprintLibrary_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulQuestBlueprintLibrary_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulQuestBlueprintLibrary, UBlueprintFunctionLibrary, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulQuestBlueprintLibrary_NoRegister) \
	DECLARE_SERIALIZER(UInsimulQuestBlueprintLibrary)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulQuestBlueprintLibrary(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulQuestBlueprintLibrary(UInsimulQuestBlueprintLibrary&&) = delete; \
	UInsimulQuestBlueprintLibrary(const UInsimulQuestBlueprintLibrary&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulQuestBlueprintLibrary); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulQuestBlueprintLibrary); \
	DEFINE_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulQuestBlueprintLibrary) \
	NO_API virtual ~UInsimulQuestBlueprintLibrary();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_155_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h_158_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulQuestBlueprintLibrary;

// ********** End Class UInsimulQuestBlueprintLibrary **********************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestWidget_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
