# Phase 4 - Enhancements & Polish Guide

## Overview

This guide covers the final polish layer for the modern UI: animations, loading states, skeleton loaders, and micro-interactions.

## 🎬 Animation Patterns

### CSS Transitions (Already Applied)
```css
/* All interactive elements should have */
transition-all duration-200  // General transitions
transition-colors duration-300 // Color changes only
transition-transform duration-200 // Transforms only
```

### Scale Animations (Applied to Cards)
```typescript
// Hover scale effect
className="hover:scale-[1.02] transition-transform"

// Press effect (optional)
className="active:scale-[0.98] transition-transform"
```

### Fade In Animations
```typescript
// For new content appearing
className="animate-in fade-in duration-300"

// With slide
className="animate-in fade-in slide-in-from-bottom-4 duration-500"
```

## 💀 Skeleton Loaders

### Card Skeleton Pattern
```typescript
import { Skeleton } from "@/components/ui/skeleton";

function CardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/2 mt-2" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6 mt-2" />
      </CardContent>
    </Card>
  );
}
```

### List Skeleton Pattern
```typescript
function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Where to Add Skeletons
- [ ] WorldSelectionScreen - While fetching worlds
- [ ] HierarchicalRulesTab - While loading rules list
- [ ] HierarchicalLocationsTab - While loading countries/states
- [ ] Character list - While loading characters
- [ ] Truth timeline - While loading truths

## 🎯 Loading States

### Button Loading States (Already Available)
```typescript
import { Loader2 } from "lucide-react";

<Button disabled={isLoading}>
  {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
  {isLoading ? 'Loading...' : 'Submit'}
</Button>
```

### Page Loading States
```typescript
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
```

### Inline Loading States
```typescript
function InlineLoader({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}
```

## 🎨 Toast Notification Enhancements

### Success Toast with Custom Styling
```typescript
toast({
  title: "Success!",
  description: "Your changes have been saved.",
  className: "bg-green-500/10 border-green-500/20",
});
```

### Error Toast
```typescript
toast({
  title: "Error",
  description: error.message,
  variant: "destructive",
});
```

### Info Toast with Action
```typescript
toast({
  title: "New Update Available",
  description: "Click to refresh and see the latest changes.",
  action: (
    <Button size="sm" variant="outline" onClick={() => window.location.reload()}>
      Refresh
    </Button>
  ),
});
```

## 🌊 Smooth Page Transitions

### Implementation Pattern
```typescript
import { useEffect, useState } from 'react';

function useFadeIn() {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  return isVisible;
}

// In component
function MyComponent() {
  const isVisible = useFadeIn();
  
  return (
    <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
      {/* Content */}
    </div>
  );
}
```

## ✨ Micro-interactions

### Icon Spin on Hover
```typescript
<div className="group">
  <Settings className="w-5 h-5 transition-transform group-hover:rotate-90 duration-300" />
</div>
```

### Pulse Effect (for new/unread items)
```typescript
<div className="relative">
  <Badge>New</Badge>
  <span className="absolute top-0 right-0 flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
  </span>
</div>
```

### Shake Animation (for errors)
```css
/* Add to global CSS */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.animate-shake {
  animation: shake 0.5s ease-in-out;
}
```

## 📊 Progress Indicators

### Linear Progress
```typescript
import { Progress } from "@/components/ui/progress";

function GenerationProgress({ progress }: { progress: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Generating world...</span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}
```

### Circular Progress (for long operations)
```typescript
function CircularProgress({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 40; // radius = 40
  const offset = circumference - (value / 100) * circumference;
  
  return (
    <svg className="w-24 h-24" viewBox="0 0 100 100">
      <circle
        className="text-muted stroke-current"
        strokeWidth="8"
        fill="none"
        cx="50"
        cy="50"
        r="40"
      />
      <circle
        className="text-primary stroke-current transition-all duration-300"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        cx="50"
        cy="50"
        r="40"
        style={{
          strokeDasharray: circumference,
          strokeDashoffset: offset,
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      />
      <text
        x="50"
        y="50"
        className="text-lg font-bold fill-current"
        dominantBaseline="middle"
        textAnchor="middle"
      >
        {value}%
      </text>
    </svg>
  );
}
```

## 🎭 State Management for Animations

### Optimistic Updates Pattern
```typescript
const mutation = useMutation({
  mutationFn: createItem,
  onMutate: async (newItem) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['items'] });
    
    // Snapshot previous value
    const previousItems = queryClient.getQueryData(['items']);
    
    // Optimistically update
    queryClient.setQueryData(['items'], (old: Item[]) => [
      ...old,
      { ...newItem, id: 'temp-id', isOptimistic: true }
    ]);
    
    return { previousItems };
  },
  onError: (err, newItem, context) => {
    // Rollback on error
    queryClient.setQueryData(['items'], context.previousItems);
    toast({ title: "Error", description: err.message, variant: "destructive" });
  },
  onSuccess: () => {
    // Show success animation
    toast({ title: "Success!", description: "Item created" });
  },
  onSettled: () => {
    // Refetch to get server state
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

## 🎨 Theme Transitions

### Smooth Dark Mode Toggle
```typescript
// Add to root layout or theme provider
function enableViewTransition() {
  if (!document.startViewTransition) return;
  
  document.startViewTransition(() => {
    document.documentElement.classList.toggle('dark');
  });
}
```

## 📝 Implementation Checklist

### High Priority ⚡
- [ ] Add skeleton loaders to all async data fetches
- [ ] Implement loading states for all buttons with async actions
- [ ] Add fade-in animations to route changes
- [ ] Enhance toast notifications with custom styling

### Medium Priority 🎯
- [ ] Add micro-interactions to icons
- [ ] Implement progress indicators for long operations
- [ ] Add optimistic updates for mutations
- [ ] Create reusable loading components

### Low Priority (Nice to Have) ✨
- [ ] Page transition animations
- [ ] Parallax effects on scroll
- [ ] Confetti on success actions
- [ ] Sound effects for notifications
- [ ] Haptic feedback on mobile

## 🚀 Quick Wins

### 1. Add Skeleton to WorldSelectionScreen
```typescript
// In fetchWorlds useEffect
if (loading) {
  return (
    <div className="grid grid-cols-3 gap-6">
      {[1,2,3].map(i => <CardSkeleton key={i} />)}
    </div>
  );
}
```

### 2. Add Loading to HierarchicalRulesTab
```typescript
// Add state
const [loading, setLoading] = useState(true);

// In fetchRules
const fetchRules = async () => {
  setLoading(true);
  try {
    // ... fetch logic
  } finally {
    setLoading(false);
  }
};

// In render
{loading ? <ListSkeleton /> : rules.map(...)}
```

### 3. Enhanced Button States
```typescript
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  className="relative"
>
  {isLoading && (
    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  )}
  {isLoading ? 'Saving...' : 'Save Changes'}
</Button>
```

## 🎓 Best Practices

1. **Always provide loading feedback** - Users should never wonder if something is happening
2. **Keep animations subtle** - Don't distract from content
3. **Use consistent timing** - 200-300ms for most transitions
4. **Provide error states** - Show what went wrong and how to fix it
5. **Test on slow connections** - Ensure loading states are actually visible
6. **Respect prefers-reduced-motion** - Disable animations for accessibility

## 📊 Performance Tips

- Use `transform` and `opacity` for animations (GPU accelerated)
- Avoid animating `width`, `height`, or `margin` (triggers layout)
- Use `will-change` sparingly and only when needed
- Debounce expensive operations
- Use `React.memo` for components that don't need to re-render

---

**Status: 📘 Reference Guide Complete**  
Use this guide to add polish and enhance user experience across the app.
