// Copyright Insimul. All Rights Reserved.

#pragma once

#include "Modules/ModuleManager.h"

class FInsimulModule : public IModuleInterface
{
public:
    virtual void StartupModule() override;
    virtual void ShutdownModule() override;
};
