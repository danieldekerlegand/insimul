using UnrealBuildTool;
using System.Collections.Generic;

public class InsimulExportTarget : TargetRules
{
    public InsimulExportTarget(TargetInfo Target) : base(Target)
    {
        Type = TargetType.Game;
        DefaultBuildSettings = BuildSettingsVersion.V5;
        IncludeOrderVersion = EngineIncludeOrderVersion.Unreal5_5;
        ExtraModuleNames.Add("InsimulExport");
    }
}
