#pragma once

#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "Components/StaticMeshComponent.h"
#include "NPCCharacter.generated.h"

UENUM(BlueprintType)
enum class ENPCState : uint8
{
    Idle        UMETA(DisplayName = "Idle"),
    Patrol      UMETA(DisplayName = "Patrol"),
    Talking     UMETA(DisplayName = "Talking"),
    Fleeing     UMETA(DisplayName = "Fleeing"),
    Pursuing    UMETA(DisplayName = "Pursuing"),
    Alert       UMETA(DisplayName = "Alert"),
};

UCLASS()
class INSIMULEXPORT_API ANPCCharacter : public ACharacter
{
    GENERATED_BODY()

public:
    ANPCCharacter();

    virtual void BeginPlay() override;
    virtual void Tick(float DeltaTime) override;

    /** Initialize from IR NPC data */
    UFUNCTION(BlueprintCallable, Category = "Insimul|NPC")
    void InitFromData(const FString& InCharacterId, const FString& InNPCRole,
                      FVector InHomePosition, float InPatrolRadius, float InDisposition);

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString CharacterId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString NPCRole;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FVector HomePosition = FVector::ZeroVector;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    float PatrolRadius = 20.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    float Disposition = 50.f;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    ENPCState CurrentState = ENPCState::Idle;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    FString SettlementId;

    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC")
    TArray<FString> QuestIds;

    UFUNCTION(BlueprintCallable, Category = "NPC")
    void StartDialogue(AActor* Initiator);

    /** Optional visual mesh — populated from imported GLB asset when CharacterMesh is set. */
    UPROPERTY(VisibleAnywhere, BlueprintReadOnly, Category = "NPC|Appearance")
    UStaticMeshComponent* VisualMesh;

    /** Assign an imported Static Mesh here (or via Blueprint) to override the capsule visual. */
    UPROPERTY(EditAnywhere, BlueprintReadWrite, Category = "NPC|Appearance")
    UStaticMesh* CharacterMesh;
};
