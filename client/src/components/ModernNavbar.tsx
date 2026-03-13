import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/AuthContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Globe,
  ChevronDown,
  ChevronRight,
  Menu,
  Scroll,
  Users,
  Zap,
  Target,
  Sparkles,
  BookOpen,
  Brain,
  Play,
  X,
  Home,
  FileText,
  Gamepad2,
  History,
  LogOut,
  LogIn,
  UserPlus,
  BarChart3,
  Database,
  ArrowLeft,
  Package,
  Download,
  Edit3,
  Settings,
  Trash2,
  FlaskConical,
} from "lucide-react";

interface ModernNavbarProps {
  currentWorld?: any;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onChangeWorld: () => void;
  onOpenAuth?: () => void;
  onOpenAdminPanel?: () => void;
  onExportGame?: (engine: ExportEngineType) => void;
  onEditWorld?: () => void;
  onOpenSettings?: () => void;
  onDeleteWorld?: () => void;
}

// Map tab IDs to labels and icons for breadcrumb display
const tabMeta: Record<string, { label: string; icon: any }> = {
  society: { label: "Society", icon: Users },
  rules: { label: "Rules", icon: Scroll },
  actions: { label: "Actions", icon: Zap },
  quests: { label: "Quests", icon: Target },
  items: { label: "Items", icon: Package },
  grammars: { label: "Grammars", icon: FileText },
  languages: { label: "Languages", icon: Sparkles },
  "world-intelligence": { label: "World Intelligence", icon: Brain },
  "3d-game": { label: "Explore World", icon: Gamepad2 },
  analytics: { label: "Analytics", icon: BarChart3 },
  research: { label: "Research", icon: FlaskConical },
  assessments: { label: "Assessments", icon: BarChart3 },
  "my-playthroughs": { label: "My Playthroughs", icon: History },
};

export type ExportEngineType = 'babylon' | 'unreal' | 'unity' | 'godot';

function ExportGameDropdown({ onExportGame }: { onExportGame?: (engine: ExportEngineType) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const engines: { key: ExportEngineType; label: string; color: string }[] = [
    { key: "babylon", label: "Babylon.js (Web)", color: "text-blue-500" },
    { key: "unreal", label: "Unreal Engine", color: "text-purple-500" },
    { key: "unity", label: "Unity", color: "text-green-500" },
    { key: "godot", label: "Godot", color: "text-sky-500" },
  ];

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-500/10 rounded-xl"
      >
        <Package className="w-3.5 h-3.5" />
        Export Game
        <ChevronDown className={`w-3 h-3 opacity-60 transition-transform ${open ? "rotate-180" : ""}`} />
      </Button>
      {open && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg z-50 py-1 animate-in fade-in-0 zoom-in-95">
          <div className="px-3 py-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground border-b mb-1">
            <Download className="w-4 h-4" />
            Export Game Project
          </div>
          {engines.map((engine) => (
            <button
              key={engine.key}
              onClick={() => {
                setOpen(false);
                onExportGame?.(engine.key);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
            >
              <Package className={`w-4 h-4 ${engine.color}`} />
              {engine.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ModernNavbar({
  currentWorld,
  activeTab,
  onTabChange,
  onChangeWorld,
  onOpenAuth,
  onOpenAdminPanel,
  onExportGame,
  onEditWorld,
  onOpenSettings,
  onDeleteWorld,
}: ModernNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const isOnSubPage = activeTab !== "home" && !!tabMeta[activeTab];
  const currentMeta = tabMeta[activeTab];

  return (
    <div className="border-b border-white/20 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur-xl sticky top-0 z-50 shadow-sm shadow-black/5">
      <div className="flex h-14 items-center px-6">
        {/* Left: Logo + Breadcrumb */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Back button when on sub-page */}
          {currentWorld && isOnSubPage ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onTabChange("home")}
              className="rounded-xl hover:bg-white/50 dark:hover:bg-white/10 shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : (
            <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-lg shrink-0">
              <Globe className="w-5 h-5 text-white" />
            </div>
          )}

          {/* Breadcrumb-style text */}
          <div className="flex items-center gap-1.5 min-w-0">
            {currentWorld ? (
              <>
                <button
                  onClick={() => onTabChange("home")}
                  className={`text-sm font-semibold transition-colors truncate ${
                    isOnSubPage
                      ? "text-muted-foreground hover:text-foreground"
                      : "text-foreground"
                  }`}
                >
                  {currentWorld.name}
                </button>
                {isOnSubPage && currentMeta && (
                  <>
                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                    <div className="flex items-center gap-1.5 shrink-0">
                      <currentMeta.icon className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">{currentMeta.label}</span>
                    </div>
                  </>
                )}

                {/* World actions */}
                <TooltipProvider delayDuration={300}>
                  <div className="hidden md:flex items-center gap-0.5 ml-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-white/50 dark:hover:bg-white/10"
                          onClick={onEditWorld}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit world</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-white/50 dark:hover:bg-white/10"
                          onClick={onOpenSettings}
                        >
                          <Settings className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>World settings</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 rounded-lg hover:bg-white/50 dark:hover:bg-white/10 text-destructive hover:text-destructive"
                          onClick={onDeleteWorld}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete world</TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </>
            ) : (
              <span className="text-sm font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Insimul
              </span>
            )}
          </div>
        </div>

        {/* Center: Play + Switch World */}
        {currentWorld && (
          <div className="hidden md:flex items-center gap-1.5">
            {activeTab !== "3d-game" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onTabChange("3d-game")}
                className="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-500/10 rounded-xl"
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                Play
              </Button>
            )}
            <ExportGameDropdown onExportGame={onExportGame} />
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeWorld}
              className="gap-1.5 text-xs text-muted-foreground hover:text-foreground rounded-xl"
            >
              <Globe className="w-3.5 h-3.5" />
              Switch World
            </Button>
          </div>
        )}

        {/* Right: Auth Section - Desktop */}
        <div className="hidden md:flex items-center gap-2 ml-3">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 rounded-xl">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {user?.username?.substring(0, 2).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden lg:inline text-sm">{user?.username}</span>
                  <ChevronDown className="w-3 h-3 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-white/20 dark:border-white/10">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-semibold">
                      {user?.displayName || user?.username}
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onTabChange("my-playthroughs")}
                  className="cursor-pointer"
                >
                  <History className="w-4 h-4 mr-2" />
                  My Playthroughs
                </DropdownMenuItem>
                {onOpenAdminPanel && (
                  <DropdownMenuItem
                    onClick={onOpenAdminPanel}
                    className="cursor-pointer"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Admin Panel
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={onOpenAuth} className="gap-1.5 rounded-xl">
                <LogIn className="w-4 h-4" />
                Log In
              </Button>
              <Button size="sm" onClick={onOpenAuth} className="gap-1.5 rounded-xl">
                <UserPlus className="w-4 h-4" />
                Sign Up
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-xl">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col gap-6 py-6">
                {/* Header */}
                <div className="flex items-center justify-between pb-4 border-b">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-br from-primary to-primary/60 rounded-lg">
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold">Insimul</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Current World */}
                {currentWorld && (
                  <div className="pb-4 border-b space-y-2">
                    <button
                      onClick={() => {
                        onTabChange("home");
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-all
                        ${
                          activeTab === "home"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-primary/10 hover:text-primary"
                        }
                      `}
                    >
                      <Home className="w-5 h-5" />
                      <div className="text-left">
                        <span className="font-medium block">{currentWorld.name}</span>
                        <span className="text-xs opacity-70">World Home</span>
                      </div>
                    </button>
                    {activeTab !== "3d-game" && (
                      <button
                        onClick={() => {
                          onTabChange("3d-game");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      >
                        <Gamepad2 className="w-5 h-5" />
                        <div className="text-left">
                          <span className="font-medium block">Play Game</span>
                          <span className="text-xs opacity-70">Enter the 3D world</span>
                        </div>
                      </button>
                    )}
                    {onExportGame && (
                      <>
                        <div className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground flex items-center gap-2">
                          <Package className="w-3.5 h-3.5" />
                          Export Game
                        </div>
                        {([
                          { key: 'babylon' as ExportEngineType, label: 'Babylon.js (Web)', color: 'text-blue-500' },
                          { key: 'unreal' as ExportEngineType, label: 'Unreal Engine', color: 'text-purple-500' },
                          { key: 'unity' as ExportEngineType, label: 'Unity', color: 'text-green-500' },
                          { key: 'godot' as ExportEngineType, label: 'Godot', color: 'text-sky-500' },
                        ]).map((engine) => (
                          <button
                            key={engine.key}
                            onClick={() => {
                              onExportGame(engine.key);
                              setMobileMenuOpen(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all hover:bg-accent hover:text-accent-foreground"
                          >
                            <Package className={`w-4 h-4 ${engine.color}`} />
                            <span className="text-sm">{engine.label}</span>
                          </button>
                        ))}
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onChangeWorld();
                        setMobileMenuOpen(false);
                      }}
                      className="w-full justify-start gap-2 text-xs"
                    >
                      <Globe className="w-3 h-3" />
                      Switch World
                    </Button>
                  </div>
                )}

                {/* Auth Section - Mobile */}
                <div className="pt-2">
                  {isAuthenticated ? (
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 px-3 py-2">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {user?.username?.substring(0, 2).toUpperCase() ||
                              "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col flex-1">
                          <span className="font-semibold text-sm">
                            {user?.displayName || user?.username}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {user?.email}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onTabChange("my-playthroughs");
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start gap-3 px-3"
                      >
                        <History className="w-5 h-5" />
                        <span className="font-medium">My Playthroughs</span>
                      </Button>
                      {onOpenAdminPanel && (
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onOpenAdminPanel();
                            setMobileMenuOpen(false);
                          }}
                          className="w-full justify-start gap-3 px-3"
                        >
                          <Database className="w-5 h-5" />
                          <span className="font-medium">Admin Panel</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        onClick={() => {
                          logout();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start gap-3 px-3 text-destructive hover:text-destructive"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Log Out</span>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 px-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          onOpenAuth?.();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start gap-3"
                      >
                        <LogIn className="w-5 h-5" />
                        <span className="font-medium">Log In</span>
                      </Button>
                      <Button
                        onClick={() => {
                          onOpenAuth?.();
                          setMobileMenuOpen(false);
                        }}
                        className="w-full justify-start gap-3"
                      >
                        <UserPlus className="w-5 h-5" />
                        <span className="font-medium">Sign Up</span>
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
