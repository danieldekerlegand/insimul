#include "PlayerCharacter.h"
#include "GameFramework/SpringArmComponent.h"
#include "Camera/CameraComponent.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "Components/CapsuleComponent.h"

APlayerCharacter::APlayerCharacter()
{
    PrimaryActorTick.bCanEverTick = true;

    // Capsule
    GetCapsuleComponent()->InitCapsuleSize(42.f, 96.f);

    // Spring Arm
    SpringArm = CreateDefaultSubobject<USpringArmComponent>(TEXT("SpringArm"));
    SpringArm->SetupAttachment(RootComponent);
    SpringArm->TargetArmLength = 300.f;
    SpringArm->bUsePawnControlRotation = true;

    // Camera
    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(SpringArm, USpringArmComponent::SocketName);
    Camera->bUsePawnControlRotation = false;

    // Movement
    GetCharacterMovement()->MaxWalkSpeed = MoveSpeed * 100.f;
    GetCharacterMovement()->JumpZVelocity = JumpStrength * 100.f;
    GetCharacterMovement()->GravityScale = {{PLAYER_GRAVITY}};

    bUseControllerRotationYaw = false;
    GetCharacterMovement()->bOrientRotationToMovement = true;
}

void APlayerCharacter::BeginPlay()
{
    Super::BeginPlay();
}

void APlayerCharacter::Tick(float DeltaTime)
{
    Super::Tick(DeltaTime);
}

void APlayerCharacter::SetupPlayerInputComponent(UInputComponent* PlayerInputComponent)
{
    Super::SetupPlayerInputComponent(PlayerInputComponent);

    PlayerInputComponent->BindAxis("MoveForward", this, &APlayerCharacter::MoveForward);
    PlayerInputComponent->BindAxis("MoveRight", this, &APlayerCharacter::MoveRight);
    PlayerInputComponent->BindAxis("LookUp", this, &APlayerCharacter::LookUp);
    PlayerInputComponent->BindAxis("Turn", this, &APlayerCharacter::Turn);
    PlayerInputComponent->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    PlayerInputComponent->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    PlayerInputComponent->BindAction("Attack", IE_Pressed, this, &APlayerCharacter::Attack);
    PlayerInputComponent->BindAction("Interact", IE_Pressed, this, &APlayerCharacter::Interact);
}

void APlayerCharacter::MoveForward(float Value)
{
    if (Value == 0.f) return;
    const FRotator Rot = Controller->GetControlRotation();
    const FRotator YawRot(0, Rot.Yaw, 0);
    const FVector Dir = FRotationMatrix(YawRot).GetUnitAxis(EAxis::X);
    AddMovementInput(Dir, Value);
}

void APlayerCharacter::MoveRight(float Value)
{
    if (Value == 0.f) return;
    const FRotator Rot = Controller->GetControlRotation();
    const FRotator YawRot(0, Rot.Yaw, 0);
    const FVector Dir = FRotationMatrix(YawRot).GetUnitAxis(EAxis::Y);
    AddMovementInput(Dir, Value);
}

void APlayerCharacter::LookUp(float Value)
{
    AddControllerPitchInput(Value);
}

void APlayerCharacter::Turn(float Value)
{
    AddControllerYawInput(Value);
}

void APlayerCharacter::Attack()
{
    // TODO: Trigger combat system attack
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Player Attack"));
}

void APlayerCharacter::Interact()
{
    // TODO: Line trace for interactable actors (NPCs, objects)
    UE_LOG(LogTemp, Log, TEXT("[Insimul] Player Interact"));
}
