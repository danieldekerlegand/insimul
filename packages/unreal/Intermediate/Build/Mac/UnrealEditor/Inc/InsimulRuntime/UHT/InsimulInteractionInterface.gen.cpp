// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulInteractionInterface.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulInteractionInterface() {}

// ********** Begin Cross Module References ********************************************************
COREUOBJECT_API UClass* Z_Construct_UClass_UInterface();
ENGINE_API UClass* Z_Construct_UClass_APawn_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulInteractorInterface();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulInteractorInterface_NoRegister();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Interface UInsimulInteractorInterface Function GetInteractingPawn **************
struct InsimulInteractorInterface_eventGetInteractingPawn_Parms
{
	APawn* ReturnValue;

	/** Constructor, initializes return property only **/
	InsimulInteractorInterface_eventGetInteractingPawn_Parms()
		: ReturnValue(NULL)
	{
	}
};
APawn* IInsimulInteractorInterface::GetInteractingPawn()
{
	check(0 && "Do not directly call Event functions in Interfaces. Call Execute_GetInteractingPawn instead.");
	InsimulInteractorInterface_eventGetInteractingPawn_Parms Parms;
	return Parms.ReturnValue;
}
static FName NAME_UInsimulInteractorInterface_GetInteractingPawn = FName(TEXT("GetInteractingPawn"));
APawn* IInsimulInteractorInterface::Execute_GetInteractingPawn(UObject* O)
{
	check(O != NULL);
	check(O->GetClass()->ImplementsInterface(UInsimulInteractorInterface::StaticClass()));
	InsimulInteractorInterface_eventGetInteractingPawn_Parms Parms;
	UFunction* const Func = O->FindFunction(NAME_UInsimulInteractorInterface_GetInteractingPawn);
	if (Func)
	{
		O->ProcessEvent(Func, &Parms);
	}
	else if (auto I = (IInsimulInteractorInterface*)(O->GetNativeInterfaceAddress(UInsimulInteractorInterface::StaticClass())))
	{
		Parms.ReturnValue = I->GetInteractingPawn_Implementation();
	}
	return Parms.ReturnValue;
}
struct Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Get the pawn that is interacting */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulInteractionInterface.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Get the pawn that is interacting" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function GetInteractingPawn constinit property declarations ********************
	static const UECodeGen_Private::FObjectPropertyParams NewProp_ReturnValue;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function GetInteractingPawn constinit property declarations **********************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function GetInteractingPawn Property Definitions *******************************
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::NewProp_ReturnValue = { "ReturnValue", nullptr, (EPropertyFlags)0x0010000000000580, UECodeGen_Private::EPropertyGenFlags::Object, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulInteractorInterface_eventGetInteractingPawn_Parms, ReturnValue), Z_Construct_UClass_APawn_NoRegister, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::NewProp_ReturnValue,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::PropPointers) < 2048);
// ********** End Function GetInteractingPawn Property Definitions *********************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulInteractorInterface, nullptr, "GetInteractingPawn", 	Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::PropPointers), 
sizeof(InsimulInteractorInterface_eventGetInteractingPawn_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x0C020C00, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(InsimulInteractorInterface_eventGetInteractingPawn_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(IInsimulInteractorInterface::execGetInteractingPawn)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	*(APawn**)Z_Param__Result=P_THIS->GetInteractingPawn_Implementation();
	P_NATIVE_END;
}
// ********** End Interface UInsimulInteractorInterface Function GetInteractingPawn ****************

// ********** Begin Interface UInsimulInteractorInterface ******************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulInteractorInterface;
UClass* UInsimulInteractorInterface::GetPrivateStaticClass()
{
	using TClass = UInsimulInteractorInterface;
	if (!Z_Registration_Info_UClass_UInsimulInteractorInterface.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulInteractorInterface"),
			Z_Registration_Info_UClass_UInsimulInteractorInterface.InnerSingleton,
			StaticRegisterNativesUInsimulInteractorInterface,
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
	return Z_Registration_Info_UClass_UInsimulInteractorInterface.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulInteractorInterface_NoRegister()
{
	return UInsimulInteractorInterface::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulInteractorInterface_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintType", "true" },
		{ "IsBlueprintBase", "true" },
		{ "ModuleRelativePath", "Public/InsimulInteractionInterface.h" },
	};
#endif // WITH_METADATA

// ********** Begin Interface UInsimulInteractorInterface constinit property declarations **********
// ********** End Interface UInsimulInteractorInterface constinit property declarations ************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("GetInteractingPawn"), .Pointer = &IInsimulInteractorInterface::execGetInteractingPawn },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulInteractorInterface_GetInteractingPawn, "GetInteractingPawn" }, // 307800992
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<IInsimulInteractorInterface>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulInteractorInterface_Statics
UObject* (*const Z_Construct_UClass_UInsimulInteractorInterface_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UInterface,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulInteractorInterface_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulInteractorInterface_Statics::ClassParams = {
	&UInsimulInteractorInterface::StaticClass,
	nullptr,
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	nullptr,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	0,
	0,
	0x000840A1u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulInteractorInterface_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulInteractorInterface_Statics::Class_MetaDataParams)
};
void UInsimulInteractorInterface::StaticRegisterNativesUInsimulInteractorInterface()
{
	UClass* Class = UInsimulInteractorInterface::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulInteractorInterface_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulInteractorInterface()
{
	if (!Z_Registration_Info_UClass_UInsimulInteractorInterface.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulInteractorInterface.OuterSingleton, Z_Construct_UClass_UInsimulInteractorInterface_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulInteractorInterface.OuterSingleton;
}
UInsimulInteractorInterface::UInsimulInteractorInterface(const FObjectInitializer& ObjectInitializer) : Super(ObjectInitializer) {}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulInteractorInterface);
// ********** End Interface UInsimulInteractorInterface ********************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulInteractorInterface, UInsimulInteractorInterface::StaticClass, TEXT("UInsimulInteractorInterface"), &Z_Registration_Info_UClass_UInsimulInteractorInterface, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulInteractorInterface), 3158212143U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h__Script_InsimulRuntime_2267155503{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulInteractionInterface_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
