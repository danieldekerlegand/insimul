// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

// IWYU pragma: private, include "InsimulSettings.h"

#ifdef INSIMULRUNTIME_InsimulSettings_generated_h
#error "InsimulSettings.generated.h already included, missing '#pragma once' in InsimulSettings.h"
#endif
#define INSIMULRUNTIME_InsimulSettings_generated_h

#include "UObject/ObjectMacros.h"
#include "UObject/ScriptMacros.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS

// ********** Begin Class UInsimulSettings *********************************************************
struct Z_Construct_UClass_UInsimulSettings_Statics;
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulSettings_NoRegister();

#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_53_INCLASS_NO_PURE_DECLS \
private: \
	static void StaticRegisterNativesUInsimulSettings(); \
	friend struct ::Z_Construct_UClass_UInsimulSettings_Statics; \
	static UClass* GetPrivateStaticClass(); \
	friend INSIMULRUNTIME_API UClass* ::Z_Construct_UClass_UInsimulSettings_NoRegister(); \
public: \
	DECLARE_CLASS2(UInsimulSettings, UObject, COMPILED_IN_FLAGS(0 | CLASS_DefaultConfig | CLASS_Config), CASTCLASS_None, TEXT("/Script/InsimulRuntime"), Z_Construct_UClass_UInsimulSettings_NoRegister) \
	DECLARE_SERIALIZER(UInsimulSettings) \
	static constexpr const TCHAR* StaticConfigName() {return TEXT("Game");} \



#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_53_ENHANCED_CONSTRUCTORS \
	/** Standard constructor, called after all reflected properties have been initialized */ \
	NO_API UInsimulSettings(const FObjectInitializer& ObjectInitializer = FObjectInitializer::Get()); \
	/** Deleted move- and copy-constructors, should never be used */ \
	UInsimulSettings(UInsimulSettings&&) = delete; \
	UInsimulSettings(const UInsimulSettings&) = delete; \
	DECLARE_VTABLE_PTR_HELPER_CTOR(NO_API, UInsimulSettings); \
	DEFINE_VTABLE_PTR_HELPER_CTOR_CALLER(UInsimulSettings); \
	DEFINE_DEFAULT_OBJECT_INITIALIZER_CONSTRUCTOR_CALL(UInsimulSettings) \
	NO_API virtual ~UInsimulSettings();


#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_50_PROLOG
#define FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_53_GENERATED_BODY \
PRAGMA_DISABLE_DEPRECATION_WARNINGS \
public: \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_53_INCLASS_NO_PURE_DECLS \
	FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h_53_ENHANCED_CONSTRUCTORS \
private: \
PRAGMA_ENABLE_DEPRECATION_WARNINGS


class UInsimulSettings;

// ********** End Class UInsimulSettings ***********************************************************

#undef CURRENT_FILE_ID
#define CURRENT_FILE_ID FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulSettings_h

// ********** Begin Enum EInsimulChatProvider ******************************************************
#define FOREACH_ENUM_EINSIMULCHATPROVIDER(op) \
	op(EInsimulChatProvider::Server) \
	op(EInsimulChatProvider::Local) 

enum class EInsimulChatProvider : uint8;
template<> struct TIsUEnumClass<EInsimulChatProvider> { enum { Value = true }; };
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulChatProvider>();
// ********** End Enum EInsimulChatProvider ********************************************************

// ********** Begin Enum EInsimulTTSProvider *******************************************************
#define FOREACH_ENUM_EINSIMULTTSPROVIDER(op) \
	op(EInsimulTTSProvider::Server) \
	op(EInsimulTTSProvider::Local) \
	op(EInsimulTTSProvider::None) 

enum class EInsimulTTSProvider : uint8;
template<> struct TIsUEnumClass<EInsimulTTSProvider> { enum { Value = true }; };
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulTTSProvider>();
// ********** End Enum EInsimulTTSProvider *********************************************************

// ********** Begin Enum EInsimulSTTProvider *******************************************************
#define FOREACH_ENUM_EINSIMULSTTPROVIDER(op) \
	op(EInsimulSTTProvider::Server) \
	op(EInsimulSTTProvider::Local) \
	op(EInsimulSTTProvider::None) 

enum class EInsimulSTTProvider : uint8;
template<> struct TIsUEnumClass<EInsimulSTTProvider> { enum { Value = true }; };
template<> INSIMULRUNTIME_NON_ATTRIBUTED_API UEnum* StaticEnum<EInsimulSTTProvider>();
// ********** End Enum EInsimulSTTProvider *********************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
