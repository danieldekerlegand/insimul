// Copyright Insimul. All Rights Reserved.

using UnrealBuildTool;

public class Insimul : ModuleRules
{
    public Insimul(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = ModuleRules.PCHUsageMode.UseExplicitOrSharedPCHs;

        PublicDependencyModuleNames.AddRange(new string[]
        {
            "Core",
            "CoreUObject",
            "Engine",
            "AudioMixer",
            "AudioCapture"
        });

        PrivateDependencyModuleNames.AddRange(new string[]
        {
            "HTTP",
            "Json",
            "JsonUtilities",
            "RenderCore"
        });
    }
}
