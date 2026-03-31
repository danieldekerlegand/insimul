// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulDebugComponent.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulDebugComponent() {}

// ********** Begin Cross Module References ********************************************************
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDebugComponent();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulDebugComponent_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulDebugComponent ***************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulDebugComponent;
UClass* UInsimulDebugComponent::GetPrivateStaticClass()
{
	using TClass = UInsimulDebugComponent;
	if (!Z_Registration_Info_UClass_UInsimulDebugComponent.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulDebugComponent"),
			Z_Registration_Info_UClass_UInsimulDebugComponent.InnerSingleton,
			StaticRegisterNativesUInsimulDebugComponent,
			sizeof(TClass),
			alignof(TClass),
			TClass::StaticClassFlags,
			TClass::StaticClassCastFlags(),
			TClass::StaticConfigName(),
			(UClass::ClassConstructorType)InternalConstructor<TClass>,
			(UClass::ClassVTableHelperCtorCallerType)InternalVTableHelperCtorCaller<TClass>,
			UOBJECT_CPPCLASS_STATICFUNCTIONS_FORCLASS(TClass),
			&TClass::Super::StaticClass,
			&TClass::WithinClass::StaticClass
		);
	}
	return Z_Registration_Info_UClass_UInsimulDebugComponent.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulDebugComponent_NoRegister()
{
	return UInsimulDebugComponent::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulDebugComponent_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "ClassGroupNames", "Custom" },
		{ "IncludePath", "InsimulDebugComponent.h" },
		{ "ModuleRelativePath", "Public/InsimulDebugComponent.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulDebugComponent constinit property declarations *******************
// ********** End Class UInsimulDebugComponent constinit property declarations *********************
	static UObject* (*const DependentSingletons[])();
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulDebugComponent>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulDebugComponent_Statics
UObject* (*const Z_Construct_UClass_UInsimulDebugComponent_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDebugComponent_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulDebugComponent_Statics::ClassParams = {
	&UInsimulDebugComponent::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	nullptr,
	nullptr,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	0,
	0,
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulDebugComponent_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulDebugComponent_Statics::Class_MetaDataParams)
};
void UInsimulDebugComponent::StaticRegisterNativesUInsimulDebugComponent()
{
}
UClass* Z_Construct_UClass_UInsimulDebugComponent()
{
	if (!Z_Registration_Info_UClass_UInsimulDebugComponent.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulDebugComponent.OuterSingleton, Z_Construct_UClass_UInsimulDebugComponent_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulDebugComponent.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulDebugComponent);
UInsimulDebugComponent::~UInsimulDebugComponent() {}
// ********** End Class UInsimulDebugComponent *****************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDebugComponent_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulDebugComponent, UInsimulDebugComponent::StaticClass, TEXT("UInsimulDebugComponent"), &Z_Registration_Info_UClass_UInsimulDebugComponent, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulDebugComponent), 1484845200U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDebugComponent_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDebugComponent_h__Script_InsimulRuntime_413172109{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDebugComponent_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulDebugComponent_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
