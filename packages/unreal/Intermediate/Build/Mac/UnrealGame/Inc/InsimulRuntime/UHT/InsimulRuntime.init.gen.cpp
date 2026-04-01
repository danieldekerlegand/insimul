// Copyright Epic Games, Inc. All Rights Reserved.
/*===========================================================================
	Generated code exported from UnrealHeaderTool.
	DO NOT modify this manually! Edit the corresponding .h files instead!
===========================================================================*/

#include "UObject/GeneratedCppIncludes.h"
PRAGMA_DISABLE_DEPRECATION_WARNINGS
void EmptyLinkFunctionForGeneratedCodeInsimulRuntime_init() {}
static_assert(!UE_WITH_CONSTINIT_UOBJECT, "This generated code can only be compiled with !UE_WITH_CONSTINIT_OBJECT");	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature();
	INSIMULRUNTIME_API UFunction* Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature();
	static FPackageRegistrationInfo Z_Registration_Info_UPackage__Script_InsimulRuntime;
	FORCENOINLINE UPackage* Z_Construct_UPackage__Script_InsimulRuntime()
	{
		if (!Z_Registration_Info_UPackage__Script_InsimulRuntime.OuterSingleton)
		{
		static UObject* (*const SingletonFuncArray[])() = {
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulActionTrigger__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulAudioChunkReceived__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulCaptureEvent__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationEnded__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulConversationStarted__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulFacialData__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulNPCInteract__DelegateSignature,
			(UObject* (*)())Z_Construct_UDelegateFunction_InsimulRuntime_OnInsimulUtteranceReceived__DelegateSignature,
		};
		static const UECodeGen_Private::FPackageParams PackageParams = {
			"/Script/InsimulRuntime",
			SingletonFuncArray,
			UE_ARRAY_COUNT(SingletonFuncArray),
			PKG_CompiledIn | 0x00000000,
			0x58E54C0E,
			0xB72A1DC5,
			METADATA_PARAMS(0, nullptr)
		};
		UECodeGen_Private::ConstructUPackage(Z_Registration_Info_UPackage__Script_InsimulRuntime.OuterSingleton, PackageParams);
	}
	return Z_Registration_Info_UPackage__Script_InsimulRuntime.OuterSingleton;
}
static FRegisterCompiledInInfo Z_CompiledInDeferPackage_UPackage__Script_InsimulRuntime(Z_Construct_UPackage__Script_InsimulRuntime, TEXT("/Script/InsimulRuntime"), Z_Registration_Info_UPackage__Script_InsimulRuntime, CONSTRUCT_RELOAD_VERSION_INFO(FPackageReloadVersionInfo, 0x58E54C0E, 0xB72A1DC5));
PRAGMA_ENABLE_DEPRECATION_WARNINGS
