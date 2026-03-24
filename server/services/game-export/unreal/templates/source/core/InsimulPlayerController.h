#pragma once

#include "CoreMinimal.h"
#include "GameFramework/PlayerController.h"
#include "InsimulPlayerController.generated.h"

class UInsimulHUDWidget;

UCLASS()
class INSIMULEXPORT_API AInsimulPlayerController : public APlayerController
{
    GENERATED_BODY()

public:
    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;
    virtual void SetupInputComponent() override;

    UPROPERTY(BlueprintReadOnly, Category = "HUD")
    UInsimulHUDWidget* HUDWidget = nullptr;

private:
    void CreateHUD();
};
