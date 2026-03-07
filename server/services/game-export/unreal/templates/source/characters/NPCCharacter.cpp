#include "NPCCharacter.h"
#include "GameFramework/CharacterMovementComponent.h"

ANPCCharacter::ANPCCharacter()
{
    PrimaryActorTick.bCanEverTick = true;
    GetCharacterMovement()->MaxWalkSpeed = 200.f;
    AutoPossessAI = EAutoPossessAI::PlacedInWorldOrSpawned;

    VisualMesh = CreateDefaultSubobject<UStaticMeshComponent>(TEXT("VisualMesh"));
    VisualMesh->SetupAttachment(GetMesh()); // attach to character's skeletal mesh socket
    VisualMesh->SetRelativeLocation(FVector(0.f, 0.f, -90.f));
    VisualMesh->SetVisibility(false); // hidden until CharacterMesh is assigned
}

void ANPCCharacter::BeginPlay()
{
    Super::BeginPlay();

    // Apply imported mesh if CharacterMesh was set (e.g. via Blueprint or GameMode)
    if (CharacterMesh && VisualMesh)
    {
        VisualMesh->SetStaticMesh(CharacterMesh);
        VisualMesh->SetVisibility(true);
        GetMesh()->SetVisibility(false); // hide default skeletal capsule mesh
    }
}

void ANPCCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);

    // Simple state machine
    switch (CurrentState)
    {
    case ENPCState::Idle:
        // Stand at home position
        break;
    case ENPCState::Patrol:
        // Move within PatrolRadius of HomePosition
        break;
    case ENPCState::Talking:
        // Face dialogue partner
        break;
    case ENPCState::Fleeing:
        // Move away from threat
        break;
    case ENPCState::Pursuing:
        // Move toward target
        break;
    case ENPCState::Alert:
        // Look around
        break;
    }
}

void ANPCCharacter::InitFromData(const FString& InCharacterId, const FString& InNPCRole,
                                  FVector InHomePosition, float InPatrolRadius, float InDisposition)
{
    CharacterId = InCharacterId;
    NPCRole = InNPCRole;
    HomePosition = InHomePosition;
    PatrolRadius = InPatrolRadius;
    Disposition = InDisposition;

    SetActorLocation(HomePosition);
    UE_LOG(LogTemp, Log, TEXT("[Insimul] NPC %s initialized at %s (role: %s)"),
        *CharacterId, *HomePosition.ToString(), *NPCRole);
}

void ANPCCharacter::StartDialogue(AActor* Initiator)
{
    CurrentState = ENPCState::Talking;
    // TODO: Trigger dialogue subsystem with this NPC's data
    UE_LOG(LogTemp, Log, TEXT("[Insimul] NPC %s starting dialogue"), *CharacterId);
}
