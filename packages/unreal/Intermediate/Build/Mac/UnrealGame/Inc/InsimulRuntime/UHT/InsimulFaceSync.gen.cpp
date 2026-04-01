// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
#include "InsimulFaceSync.h"
#include "InsimulTypes.h"

PRAGMA_DISABLE_DEPRECATION_WARNINGS
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");
void EmptyLinkFunctionForGeneratedCodeInsimulFaceSync() {}

// ********** Begin Cross Module References ********************************************************
ENGINE_API UClass* Z_Construct_UClass_UActorComponent();
ENGINE_API UClass* Z_Construct_UClass_USkeletalMeshComponent_NoRegister();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulFaceSync();
INSIMULRUNTIME_API UClass* Z_Construct_UClass_UInsimulFaceSync_NoRegister();
INSIMULRUNTIME_API UScriptStruct* Z_Construct_UScriptStruct_FInsimulFacialData();
UPackage* Z_Construct_UPackage__Script_InsimulRuntime();
// ********** End Cross Module References **********************************************************

// ********** Begin Class UInsimulFaceSync Function ApplyVisemes ***********************************
struct Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics
{
	struct InsimulFaceSync_eventApplyVisemes_Parms
	{
		FInsimulFacialData FacialData;
	};
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|FaceSync" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Apply a set of visemes (called when facial data arrives from the conversation stream) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Apply a set of visemes (called when facial data arrives from the conversation stream)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_FacialData_MetaData[] = {
		{ "NativeConst", "" },
	};
#endif // WITH_METADATA

// ********** Begin Function ApplyVisemes constinit property declarations **************************
	static const UECodeGen_Private::FStructPropertyParams NewProp_FacialData;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Function ApplyVisemes constinit property declarations ****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};

// ********** Begin Function ApplyVisemes Property Definitions *************************************
const UECodeGen_Private::FStructPropertyParams Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::NewProp_FacialData = { "FacialData", nullptr, (EPropertyFlags)0x0010000008000182, UECodeGen_Private::EPropertyGenFlags::Struct, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(InsimulFaceSync_eventApplyVisemes_Parms, FacialData), Z_Construct_UScriptStruct_FInsimulFacialData, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_FacialData_MetaData), NewProp_FacialData_MetaData) }; // 939453812
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::NewProp_FacialData,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::PropPointers) < 2048);
// ********** End Function ApplyVisemes Property Definitions ***************************************
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulFaceSync, nullptr, "ApplyVisemes", 	Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::PropPointers, 
	UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::PropPointers), 
sizeof(Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::InsimulFaceSync_eventApplyVisemes_Parms),
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04420401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::Function_MetaDataParams)},  };
static_assert(sizeof(Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::InsimulFaceSync_eventApplyVisemes_Parms) < MAX_uint16);
UFunction* Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulFaceSync::execApplyVisemes)
{
	P_GET_STRUCT_REF(FInsimulFacialData,Z_Param_Out_FacialData);
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ApplyVisemes(Z_Param_Out_FacialData);
	P_NATIVE_END;
}
// ********** End Class UInsimulFaceSync Function ApplyVisemes *************************************

// ********** Begin Class UInsimulFaceSync Function ResetVisemes ***********************************
struct Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Function_MetaDataParams[] = {
		{ "Category", "Insimul|FaceSync" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Reset all viseme morph targets to zero */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Reset all viseme morph targets to zero" },
#endif
	};
#endif // WITH_METADATA

// ********** Begin Function ResetVisemes constinit property declarations **************************
// ********** End Function ResetVisemes constinit property declarations ****************************
	static const UECodeGen_Private::FFunctionParams FuncParams;
};
const UECodeGen_Private::FFunctionParams Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes_Statics::FuncParams = { { (UObject*(*)())Z_Construct_UClass_UInsimulFaceSync, nullptr, "ResetVisemes", 	nullptr, 
	0, 
0,
RF_Public|RF_Transient|RF_MarkAsNative, (EFunctionFlags)0x04020401, 0, 0, METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes_Statics::Function_MetaDataParams), Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes_Statics::Function_MetaDataParams)},  };
UFunction* Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes()
{
	static UFunction* ReturnFunction = nullptr;
	if (!ReturnFunction)
	{
		UECodeGen_Private::ConstructUFunction(&ReturnFunction, Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes_Statics::FuncParams);
	}
	return ReturnFunction;
}
DEFINE_FUNCTION(UInsimulFaceSync::execResetVisemes)
{
	P_FINISH;
	P_NATIVE_BEGIN;
	P_THIS->ResetVisemes();
	P_NATIVE_END;
}
// ********** End Class UInsimulFaceSync Function ResetVisemes *************************************

// ********** Begin Class UInsimulFaceSync *********************************************************
FClassRegistrationInfo Z_Registration_Info_UClass_UInsimulFaceSync;
UClass* UInsimulFaceSync::GetPrivateStaticClass()
{
	using TClass = UInsimulFaceSync;
	if (!Z_Registration_Info_UClass_UInsimulFaceSync.InnerSingleton)
	{
		GetPrivateStaticClassBody(
			TClass::StaticPackage(),
			TEXT("InsimulFaceSync"),
			Z_Registration_Info_UClass_UInsimulFaceSync.InnerSingleton,
			StaticRegisterNativesUInsimulFaceSync,
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
	return Z_Registration_Info_UClass_UInsimulFaceSync.InnerSingleton;
}
UClass* Z_Construct_UClass_UInsimulFaceSync_NoRegister()
{
	return UInsimulFaceSync::GetPrivateStaticClass();
}
struct Z_Construct_UClass_UInsimulFaceSync_Statics
{
#if WITH_METADATA
	static constexpr UECodeGen_Private::FMetaDataPairParam Class_MetaDataParams[] = {
		{ "BlueprintSpawnableComponent", "" },
		{ "ClassGroupNames", "Insimul" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n * UInsimulFaceSync \xe2\x80\x94 Applies viseme data from the Insimul conversation\n * service to morph targets on a SkeletalMeshComponent for lip sync.\n *\n * Supports Oculus OVR 15-viseme format and smooth interpolation.\n * Attach to any character with a SkeletalMeshComponent that has viseme morph targets.\n */" },
#endif
		{ "IncludePath", "InsimulFaceSync.h" },
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "UInsimulFaceSync \xe2\x80\x94 Applies viseme data from the Insimul conversation\nservice to morph targets on a SkeletalMeshComponent for lip sync.\n\nSupports Oculus OVR 15-viseme format and smooth interpolation.\nAttach to any character with a SkeletalMeshComponent that has viseme morph targets." },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_BlendSpeed_MetaData[] = {
		{ "Category", "Insimul|FaceSync" },
		{ "ClampMax", "30.0" },
		{ "ClampMin", "1.0" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Interpolation speed for viseme blending (higher = snappier) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Interpolation speed for viseme blending (higher = snappier)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TargetMeshComponentName_MetaData[] = {
		{ "Category", "Insimul|FaceSync" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/** Name of the skeletal mesh component to target (empty = auto-find first SkeletalMeshComponent) */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Name of the skeletal mesh component to target (empty = auto-find first SkeletalMeshComponent)" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_VisemeToMorphTarget_MetaData[] = {
		{ "Category", "Insimul|FaceSync" },
#if !UE_BUILD_SHIPPING
		{ "Comment", "/**\n\x09 * Maps Oculus OVR viseme names to morph target names on the skeletal mesh.\n\x09 * Default names follow common Mixamo/MetaHuman conventions.\n\x09 *\n\x09 * Standard 15 OVR visemes: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou\n\x09 */" },
#endif
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
#if !UE_BUILD_SHIPPING
		{ "ToolTip", "Maps Oculus OVR viseme names to morph target names on the skeletal mesh.\nDefault names follow common Mixamo/MetaHuman conventions.\n\nStandard 15 OVR visemes: sil, PP, FF, TH, DD, kk, CH, SS, nn, RR, aa, E, ih, oh, ou" },
#endif
	};
	static constexpr UECodeGen_Private::FMetaDataPairParam NewProp_TargetMesh_MetaData[] = {
		{ "EditInline", "true" },
		{ "ModuleRelativePath", "Public/InsimulFaceSync.h" },
	};
#endif // WITH_METADATA

// ********** Begin Class UInsimulFaceSync constinit property declarations *************************
	static const UECodeGen_Private::FFloatPropertyParams NewProp_BlendSpeed;
	static const UECodeGen_Private::FNamePropertyParams NewProp_TargetMeshComponentName;
	static const UECodeGen_Private::FNamePropertyParams NewProp_VisemeToMorphTarget_ValueProp;
	static const UECodeGen_Private::FStrPropertyParams NewProp_VisemeToMorphTarget_Key_KeyProp;
	static const UECodeGen_Private::FMapPropertyParams NewProp_VisemeToMorphTarget;
	static const UECodeGen_Private::FObjectPropertyParams NewProp_TargetMesh;
	static const UECodeGen_Private::FPropertyParamsBase* const PropPointers[];
// ********** End Class UInsimulFaceSync constinit property declarations ***************************
	static constexpr UE::CodeGen::FClassNativeFunction Funcs[] = {
		{ .NameUTF8 = UTF8TEXT("ApplyVisemes"), .Pointer = &UInsimulFaceSync::execApplyVisemes },
		{ .NameUTF8 = UTF8TEXT("ResetVisemes"), .Pointer = &UInsimulFaceSync::execResetVisemes },
	};
	static UObject* (*const DependentSingletons[])();
	static constexpr FClassFunctionLinkInfo FuncInfo[] = {
		{ &Z_Construct_UFunction_UInsimulFaceSync_ApplyVisemes, "ApplyVisemes" }, // 182074482
		{ &Z_Construct_UFunction_UInsimulFaceSync_ResetVisemes, "ResetVisemes" }, // 1503074434
	};
	static_assert(UE_ARRAY_COUNT(FuncInfo) < 2048);
	static constexpr FCppClassTypeInfoStatic StaticCppClassTypeInfo = {
		TCppClassTypeTraits<UInsimulFaceSync>::IsAbstract,
	};
	static const UECodeGen_Private::FClassParams ClassParams;
}; // struct Z_Construct_UClass_UInsimulFaceSync_Statics

// ********** Begin Class UInsimulFaceSync Property Definitions ************************************
const UECodeGen_Private::FFloatPropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_BlendSpeed = { "BlendSpeed", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Float, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulFaceSync, BlendSpeed), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_BlendSpeed_MetaData), NewProp_BlendSpeed_MetaData) };
const UECodeGen_Private::FNamePropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_TargetMeshComponentName = { "TargetMeshComponentName", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Name, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulFaceSync, TargetMeshComponentName), METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TargetMeshComponentName_MetaData), NewProp_TargetMeshComponentName_MetaData) };
const UECodeGen_Private::FNamePropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget_ValueProp = { "VisemeToMorphTarget", nullptr, (EPropertyFlags)0x0000000000000001, UECodeGen_Private::EPropertyGenFlags::Name, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 1, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FStrPropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget_Key_KeyProp = { "VisemeToMorphTarget_Key", nullptr, (EPropertyFlags)0x0000000000000001, UECodeGen_Private::EPropertyGenFlags::Str, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, 0, METADATA_PARAMS(0, nullptr) };
const UECodeGen_Private::FMapPropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget = { "VisemeToMorphTarget", nullptr, (EPropertyFlags)0x0010000000000005, UECodeGen_Private::EPropertyGenFlags::Map, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulFaceSync, VisemeToMorphTarget), EMapPropertyFlags::None, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_VisemeToMorphTarget_MetaData), NewProp_VisemeToMorphTarget_MetaData) };
const UECodeGen_Private::FObjectPropertyParams Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_TargetMesh = { "TargetMesh", nullptr, (EPropertyFlags)0x0144000000080008, UECodeGen_Private::EPropertyGenFlags::Object | UECodeGen_Private::EPropertyGenFlags::ObjectPtr, RF_Public|RF_Transient|RF_MarkAsNative, nullptr, nullptr, 1, STRUCT_OFFSET(UInsimulFaceSync, TargetMesh), Z_Construct_UClass_USkeletalMeshComponent_NoRegister, METADATA_PARAMS(UE_ARRAY_COUNT(NewProp_TargetMesh_MetaData), NewProp_TargetMesh_MetaData) };
const UECodeGen_Private::FPropertyParamsBase* const Z_Construct_UClass_UInsimulFaceSync_Statics::PropPointers[] = {
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_BlendSpeed,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_TargetMeshComponentName,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget_ValueProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget_Key_KeyProp,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_VisemeToMorphTarget,
	(const UECodeGen_Private::FPropertyParamsBase*)&Z_Construct_UClass_UInsimulFaceSync_Statics::NewProp_TargetMesh,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulFaceSync_Statics::PropPointers) < 2048);
// ********** End Class UInsimulFaceSync Property Definitions **************************************
UObject* (*const Z_Construct_UClass_UInsimulFaceSync_Statics::DependentSingletons[])() = {
	(UObject* (*)())Z_Construct_UClass_UActorComponent,
	(UObject* (*)())Z_Construct_UPackage__Script_InsimulRuntime,
};
static_assert(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulFaceSync_Statics::DependentSingletons) < 16);
const UECodeGen_Private::FClassParams Z_Construct_UClass_UInsimulFaceSync_Statics::ClassParams = {
	&UInsimulFaceSync::StaticClass,
	"Engine",
	&StaticCppClassTypeInfo,
	DependentSingletons,
	FuncInfo,
	Z_Construct_UClass_UInsimulFaceSync_Statics::PropPointers,
	nullptr,
	UE_ARRAY_COUNT(DependentSingletons),
	UE_ARRAY_COUNT(FuncInfo),
	UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulFaceSync_Statics::PropPointers),
	0,
	0x00B000A4u,
	METADATA_PARAMS(UE_ARRAY_COUNT(Z_Construct_UClass_UInsimulFaceSync_Statics::Class_MetaDataParams), Z_Construct_UClass_UInsimulFaceSync_Statics::Class_MetaDataParams)
};
void UInsimulFaceSync::StaticRegisterNativesUInsimulFaceSync()
{
	UClass* Class = UInsimulFaceSync::StaticClass();
	FNativeFunctionRegistrar::RegisterFunctions(Class, MakeConstArrayView(Z_Construct_UClass_UInsimulFaceSync_Statics::Funcs));
}
UClass* Z_Construct_UClass_UInsimulFaceSync()
{
	if (!Z_Registration_Info_UClass_UInsimulFaceSync.OuterSingleton)
	{
		UECodeGen_Private::ConstructUClass(Z_Registration_Info_UClass_UInsimulFaceSync.OuterSingleton, Z_Construct_UClass_UInsimulFaceSync_Statics::ClassParams);
	}
	return Z_Registration_Info_UClass_UInsimulFaceSync.OuterSingleton;
}
DEFINE_VTABLE_PTR_HELPER_CTOR_NS(, UInsimulFaceSync);
UInsimulFaceSync::~UInsimulFaceSync() {}
// ********** End Class UInsimulFaceSync ***********************************************************

// ********** Begin Registration *******************************************************************
struct Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulFaceSync_h__Script_InsimulRuntime_Statics
{
	static constexpr FClassRegisterCompiledInInfo ClassInfo[] = {
		{ Z_Construct_UClass_UInsimulFaceSync, UInsimulFaceSync::StaticClass, TEXT("UInsimulFaceSync"), &Z_Registration_Info_UClass_UInsimulFaceSync, CONSTRUCT_RELOAD_VERSION_INFO(FClassReloadVersionInfo, sizeof(UInsimulFaceSync), 3296717145U) },
	};
}; // Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulFaceSync_h__Script_InsimulRuntime_Statics 
static FRegisterCompiledInInfo Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulFaceSync_h__Script_InsimulRuntime_1800953543{
	TEXT("/Script/InsimulRuntime"),
	Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulFaceSync_h__Script_InsimulRuntime_Statics::ClassInfo, UE_ARRAY_COUNT(Z_CompiledInDeferFile_FID_danieldekerlegand_Development_school_CitySample_Plugins_Insimul_Source_InsimulRuntime_Public_InsimulFaceSync_h__Script_InsimulRuntime_Statics::ClassInfo),
	nullptr, 0,
	nullptr, 0,
};
// ********** End Registration *********************************************************************

PRAGMA_ENABLE_DEPRECATION_WARNINGS
