#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "InsimulPlayerController.generated.h"

UCLASS()
class INSIMULEXPORT_API AInsimulPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;
    virtual void SetupInputComponent() override;
};
