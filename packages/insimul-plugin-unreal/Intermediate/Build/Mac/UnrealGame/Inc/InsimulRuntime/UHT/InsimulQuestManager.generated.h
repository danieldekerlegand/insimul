// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulQuestManager.h"

#ifdef INSIMULRUNTIME_InsimulQuestManager_generated_h
#error "InsimulQuestManager.generated.h already included, missing '#pragma once' in InsimulQuestManager.h"
#endif
#define INSIMULRUNTIME_InsimulQuestManager_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class UInsimulQuestWidget;

// ********** Begin Class UInsimulQuestManager *****************************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execConfigureQuestSystem); \
	DECLARE_FUNCTION(execGetQuestWidget); \
	DECLARE_FUNCTION(execIsQuestPanelVisible); \
	DECLARE_FUNCTION(execToggleQuestPanel); \
	DECLARE_FUNCTION(execHideQuestPanel); \
	DECLARE_FUNCTION(execShowQuestPanel);


struct Z_Construct_UClass_UInsimulQuestManager_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestManager_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulQuestManager(); \
	friend struct ::Z_Construct_UClass_UInsimulQuestManager_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulQuestManager_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulQuestManager, UGameInstanceSubsystem, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulQuestManager_NoRegister) \
	DECLARE_SERIALIZER(UInsimulQuestManager) \
	static constexpr const TCHAR* StaticConfigName() {return TEXT("Game");} \



#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulQuestManager(); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulQuestManager(UInsimulQuestManager&&) = delete; \
	UInsimulQuestManager(const UInsimulQuestManager&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulQuestManager); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulQuestManager); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulQuestManager) \
	NO_API virtual ~UInsimulQuestManager();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_14_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_17_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulQuestManager;

// ********** End Class UInsimulQuestManager *******************************************************

// ********** Begin Class UInsimulQuestDisplayComponent ********************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_RPC_WRAPPERS_NO_PURE_DECLS \
	DECLARE_FUNCTION(execRefreshQuests); \
	DECLARE_FUNCTION(execSetQuestPanelVisible);


struct Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestDisplayComponent_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulQuestDisplayComponent(); \
	friend struct ::Z_Construct_UClass_UInsimulQuestDisplayComponent_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulQuestDisplayComponent_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulQuestDisplayComponent, UActorComponent, COMPILED_IN_FLAGS(0 | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulQuestDisplayComponent_NoRegister) \
	DECLARE_SERIALIZER(UInsimulQuestDisplayComponent)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_ENHANCED_CONSTRUCTORS \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulQuestDisplayComponent(UInsimulQuestDisplayComponent&&) = delete; \
	UInsimulQuestDisplayComponent(const UInsimulQuestDisplayComponent&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulQuestDisplayComponent); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulQuestDisplayComponent); \
	DEFINE_DEFAULT_CONSTRUCTOR_CALL(UInsimulQuestDisplayComponent) \
	NO_API virtual ~UInsimulQuestDisplayComponent();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_80_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_83_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulQuestDisplayComponent;

// ********** End Class UInsimulQuestDisplayComponent **********************************************

// ********** Begin Class UInsimulQuestHUDComponent ************************************************
struct Z_Construct_UClass_UInsimulQuestHUDComponent_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulQuestHUDComponent_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_143_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulQuestHUDComponent(); \
	friend struct ::Z_Construct_UClass_UInsimulQuestHUDComponent_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulQuestHUDComponent_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulQuestHUDComponent, UObject, COMPILED_IN_FLAGS(0), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulQuestHUDComponent_NoRegister) \
	DECLARE_SERIALIZER(UInsimulQuestHUDComponent)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_143_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulQuestHUDComponent(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulQuestHUDComponent(UInsimulQuestHUDComponent&&) = delete; \
	UInsimulQuestHUDComponent(const UInsimulQuestHUDComponent&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulQuestHUDComponent); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulQuestHUDComponent); \
	DEFINE_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulQuestHUDComponent) \
	NO_API virtual ~UInsimulQuestHUDComponent();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_140_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_143_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_143_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h_143_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulQuestHUDComponent;

// ********** End Class UInsimulQuestHUDComponent **************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulQuestManager_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
