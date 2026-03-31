// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulDialogueWidget.h"

#ifdef INSIMULRUNTIME_InsimulDialogueWidget_generated_h
#error "InsimulDialogueWidget.generated.h already included, missing '#pragma once' in InsimulDialogueWidget.h"
#endif
#define INSIMULRUNTIME_InsimulDialogueWidget_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class UInsimulConversationComponent;

// ********** Begin Class UInsimulDialogueWidget ***************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execCloseDialogue); \
	DECLARE_FUNCTION(execSubmitPlayerMessage); \
	DECLARE_FUNCTION(execSetConversationComponent);


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_CALLBACK_WRAPPERS
struct Z_Construct_UClass_UInsimulDialogueWidget_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDialogueWidget_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulDialogueWidget(); \
	friend struct ::Z_Construct_UClass_UInsimulDialogueWidget_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulDialogueWidget_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulDialogueWidget, UUserWidget, COMPILED_IN_FLAGS(CLASS_Abstract), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulDialogueWidget_NoRegister) \
	DECLARE_SERIALIZER(UInsimulDialogueWidget)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulDialogueWidget(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulDialogueWidget(UInsimulDialogueWidget&&) = delete; \
	UInsimulDialogueWidget(const UInsimulDialogueWidget&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulDialogueWidget); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulDialogueWidget); \
	DEFINE_ABSTRACT_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulDialogueWidget) \
	NO_API virtual ~UInsimulDialogueWidget();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_19_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_CALLBACK_WRAPPERS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h_22_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulDialogueWidget;

// ********** End Class UInsimulDialogueWidget *****************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDialogueWidget_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
