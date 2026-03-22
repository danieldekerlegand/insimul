import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronRight, Plus, Trash2 } from "lucide-react";
import { ConfigPreviewScene } from "./ConfigPreviewScene";
import type { ItemConfig, ItemTypeConfig } from "@shared/game-engine/types";
import type { ConfigSelection } from "./config-selection";

interface ItemConfigPanelProps {
  config: ItemConfig | undefined;
  onUpdate: (config: ItemConfig) => void;
  selection?: ConfigSelection;
  onSelect?: (selection: ConfigSelection) => void;
}

type ItemGroup = "objects" | "questObjects";

const ITEM_GROUPS: { key: ItemGroup; label: string; defaultItems: string[] }[] = [
  {
    key: "objects",
    label: "Objects & Props",
    defaultItems: ["chair", "table", "barrel", "crate", "lantern", "sign", "cart", "fence", "bench"],
  },
  {
    key: "questObjects",
    label: "Quest Objects",
    defaultItems: ["collectible", "marker", "container", "key", "scroll", "chest", "artifact"],
  },
];

function defaultItemTypeConfig(): ItemTypeConfig {
  return { mode: "asset" };
}

export function ItemConfigPanel({ config, onUpdate, selection, onSelect }: ItemConfigPanelProps) {
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");

  const cfg = config || {};

  const getGroupItems = useCallback((group: ItemGroup): Record<string, ItemTypeConfig> => {
    return cfg[group] || {};
  }, [cfg]);

  const updateItem = useCallback((group: ItemGroup, item: string, update: Partial<ItemTypeConfig>) => {
    const groupItems = getGroupItems(group);
    const existing = groupItems[item] || defaultItemTypeConfig();
    const updated = { ...existing, ...update };
    onUpdate({ ...cfg, [group]: { ...groupItems, [item]: updated } });
  }, [cfg, getGroupItems, onUpdate]);

  const removeItem = useCallback((group: ItemGroup, item: string) => {
    const groupItems = { ...getGroupItems(group) };
    delete groupItems[item];
    onUpdate({ ...cfg, [group]: groupItems });
  }, [cfg, getGroupItems, onUpdate]);

  const addItem = useCallback((group: ItemGroup) => {
    if (!newItemName.trim()) return;
    const key = newItemName.trim().toLowerCase().replace(/\s+/g, "_");
    updateItem(group, key, defaultItemTypeConfig());
    setNewItemName("");
  }, [newItemName, updateItem]);

  return (
    <div className="space-y-2">
      <p className="text-[10px] text-muted-foreground">
        Configure models for in-world objects, props, and quest items.
      </p>

      {ITEM_GROUPS.map(({ key: group, label, defaultItems }) => {
        const groupItems = getGroupItems(group);
        const itemCount = Object.keys(groupItems).length;
        const isGroupExpanded = expandedGroup === group;

        return (
          <div key={group} className="border rounded">
            <button
              className="flex items-center justify-between w-full text-xs px-2 py-1.5 hover:bg-muted/50 rounded cursor-pointer transition-colors"
              onClick={() => setExpandedGroup(isGroupExpanded ? null : group)}
            >
              <div className="flex items-center gap-1.5">
                <ChevronRight className={`w-3 h-3 text-muted-foreground transition-transform ${isGroupExpanded ? "rotate-90" : ""}`} />
                <span className="font-medium">{label}</span>
              </div>
              <Badge variant={itemCount > 0 ? "secondary" : "outline"} className="text-[9px] h-4">
                {itemCount}
              </Badge>
            </button>

            {isGroupExpanded && (
              <div className="space-y-1 px-2 pb-2 border-t pt-2">
                {itemCount === 0 && (
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground italic">No items configured.</p>
                    <Button
                      variant="outline" size="sm" className="h-6 text-[10px] w-full"
                      onClick={() => {
                        const items: Record<string, ItemTypeConfig> = {};
                        defaultItems.forEach(name => { items[name] = defaultItemTypeConfig(); });
                        onUpdate({ ...cfg, [group]: items });
                      }}
                    >
                      <Plus className="w-3 h-3 mr-0.5" /> Add Default {label}
                    </Button>
                  </div>
                )}

                {Object.entries(groupItems).map(([itemName, itemCfg]) => {
                  const isSelected = selection?.module === 'item' && selection.group === group && selection.item === itemName;
                  return (
                    <button
                      key={itemName}
                      className={`flex items-center justify-between w-full text-[10px] px-2 py-1 rounded transition-colors ${
                        isSelected ? 'bg-primary/15 text-primary font-medium' : 'hover:bg-muted/40'
                      }`}
                      onClick={() => onSelect?.({ module: 'item', group, item: itemName, config: itemCfg })}
                    >
                      <span>{itemName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase())}</span>
                      <div className="flex items-center gap-1">
                        <Badge variant="outline" className="text-[8px] h-3.5">{itemCfg.mode}</Badge>
                        <button onClick={(e) => { e.stopPropagation(); removeItem(group, itemName); }}>
                          <Trash2 className="w-2.5 h-2.5 text-destructive" />
                        </button>
                        <ChevronRight className="w-2.5 h-2.5 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  );
                })}

                {/* Add custom item */}
                <div className="flex gap-1 pt-1">
                  <Input
                    className="h-5 text-[10px] flex-1"
                    placeholder={`Add ${label.toLowerCase()}...`}
                    value={expandedGroup === group ? newItemName : ""}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addItem(group)}
                  />
                  <Button variant="outline" size="sm" className="h-5 text-[10px] px-1.5" onClick={() => addItem(group)}>
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
