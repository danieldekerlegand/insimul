// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulInteractionInterface.h"

#ifdef INSIMULRUNTIME_InsimulInteractionInterface_generated_h
#error "InsimulInteractionInterface.generated.h already included, missing '#pragma once' in InsimulInteractionInterface.h"
#endif
#define INSIMULRUNTIME_InsimulInteractionInterface_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
class APawn;

// ********** Begin Interface UInsimulInteractorInterface ******************************************
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_RPC_WRAPPERS_NO_PURE_DECLS \
	virtual APawn* GetInteractingPawn_Implementation() { return NULL; }; \
	DECLARE_FUNCTION(execGetInteractingPawn);


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_CALLBACK_WRAPPERS
struct Z_Construct_UClass_UInsimulInteractorInterface_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulInteractorInterface_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	INSIMULRUNTIME_API UInsimulInteractorInterface(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulInteractorInterface(UInsimulInteractorInterface&&) = delete; \
	UInsimulInteractorInterface(const UInsimulInteractorInterface&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(INSIMULRUNTIME_API, UInsimulInteractorInterface); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulInteractorInterface); \
	DEFINE_ABSTRACT_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulInteractorInterface) \
	virtual ~UInsimulInteractorInterface() = default;


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_GENERATED_UINTERFACE_BODY() \
private: \
	static void StaticRegisterNativesUInsimulInteractorInterface(); \
	friend struct ::Z_Construct_UClass_UInsimulInteractorInterface_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulInteractorInterface_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulInteractorInterface, UInterface, COMPILED_IN_FLAGS(CLASS_Abstract | CLASS_Interface), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulInteractorInterface_NoRegister) \
	DECLARE_SERIALIZER(UInsimulInteractorInterface)


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_GENERATED_BODY \
	PRAGMA_DISABLE_DEPRECATION_WARNINGS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_GENERATED_UINTERFACE_BODY() \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_ENHANCED_CONSTRUCTORS \
private: \
	PRAGMA_ENABLE_DEPRECATION_WARNINGS


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_INCLASS_IINTERFACE_NO_PURE_DECLS \
protected: \
	virtual ~IInsimulInteractorInterface() {} \
public: \
	typedef UInsimulInteractorInterface UClassType; \
	typedef IInsimulInteractorInterface ThisClass; \
	static APawn* Execute_GetInteractingPawn(UObject* O); \
	virtual UObject* _getUObject() const { return nullptr; }


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_9_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_21_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_RPC_WRAPPERS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_CALLBACK_WRAPPERS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h_12_INCLASS_IINTERFACE_NO_PURE_DECLS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulInteractorInterface;

// ********** End Interface UInsimulInteractorInterface ********************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h

PRAGMA_ENABLE_DEPRECATION_WARNINGS
