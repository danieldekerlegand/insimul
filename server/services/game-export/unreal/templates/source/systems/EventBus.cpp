#include "EventBus.h"

void UEventBus::Initialize(FSubsystemCollectionBase& Collection)
{
    Super::Initialize(Collection);
    NextHandle = 1;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EventBus initialized"));
}

void UEventBus::Deinitialize()
{
    Dispose();
    Super::Deinitialize();
}

void UEventBus::Emit(const FInsimulGameEvent& Event)
{
    // Fire type-specific handlers
    for (const FTypedHandler& Handler : TypedHandlers)
    {
        if (Handler.EventType == Event.EventType)
        {
            // Wrap in try-equivalent: Unreal delegates don't throw, but
            // we guard against removed/invalid delegates gracefully.
            if (Handler.Delegate.IsBound())
            {
                Handler.Delegate.Broadcast(Event);
            }
        }
    }

    // Fire global handlers
    if (OnAnyEvent.IsBound())
    {
        OnAnyEvent.Broadcast(Event);
    }

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Emit type=%d"), (int32)Event.EventType);
}

int32 UEventBus::Subscribe(EInsimulEventType EventType, const FOnGameEvent& Handler)
{
    FTypedHandler Entry;
    Entry.Handle = NextHandle++;
    Entry.EventType = EventType;
    Entry.Delegate = Handler;
    TypedHandlers.Add(Entry);

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Subscribe type=%d handle=%d"), (int32)EventType, Entry.Handle);
    return Entry.Handle;
}

void UEventBus::Unsubscribe(int32 Handle)
{
    TypedHandlers.RemoveAll([Handle](const FTypedHandler& H) {
        return H.Handle == Handle;
    });

    UE_LOG(LogTemp, Verbose, TEXT("[Insimul] EventBus::Unsubscribe handle=%d"), Handle);
}

void UEventBus::Dispose()
{
    TypedHandlers.Empty();
    OnAnyEvent.Clear();
    NextHandle = 1;
    UE_LOG(LogTemp, Log, TEXT("[Insimul] EventBus disposed"));
}
