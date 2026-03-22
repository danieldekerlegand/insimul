import { useMemo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { VisualAsset } from "@shared/schema";

type AssetFilter = "model" | "texture" | "all";

interface AssetDropdownProps {
  assets: VisualAsset[];
  value: string | undefined;
  onChange: (assetId: string | undefined) => void;
  filter?: AssetFilter;
  placeholder?: string;
  className?: string;
}

function isModelAsset(a: VisualAsset): boolean {
  const type = a.assetType || "";
  const path = (a.filePath || "").toLowerCase();
  return (
    type.startsWith("model_") ||
    a.mimeType === "model/gltf-binary" ||
    path.endsWith(".glb") ||
    path.endsWith(".gltf")
  );
}

function isTextureAsset(a: VisualAsset): boolean {
  const type = a.assetType || "";
  const path = (a.filePath || "").toLowerCase();
  return (
    type.startsWith("texture_") ||
    path.endsWith(".png") ||
    path.endsWith(".jpg") ||
    path.endsWith(".jpeg") ||
    path.endsWith(".webp")
  );
}

function filterAssets(assets: VisualAsset[], filter: AssetFilter): VisualAsset[] {
  if (filter === "model") return assets.filter(isModelAsset);
  if (filter === "texture") return assets.filter(isTextureAsset);
  return assets;
}

export function AssetDropdown({
  assets,
  value,
  onChange,
  filter = "all",
  placeholder = "Select asset...",
  className,
}: AssetDropdownProps) {
  const filtered = useMemo(() => filterAssets(assets, filter), [assets, filter]);

  return (
    <Select
      value={value || "_none"}
      onValueChange={(v) => onChange(v === "_none" ? undefined : v)}
    >
      <SelectTrigger className={className ?? "h-7 text-xs"}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">None</SelectItem>
        {filtered.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            {a.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
