import { useMemo, useState, useRef } from "react";
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

/** Resolve file path to a URL usable in an <img> src */
function assetUrl(a: VisualAsset): string | undefined {
  if (!a.filePath) return undefined;
  return a.filePath.startsWith('/') ? a.filePath : `/${a.filePath}`;
}

/** Small inline texture thumbnail with hover preview */
function TextureThumbnail({ asset }: { asset: VisualAsset }) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPos, setPreviewPos] = useState({ x: 0, y: 0 });
  const thumbRef = useRef<HTMLSpanElement>(null);
  const url = assetUrl(asset);
  if (!url || !isTextureAsset(asset)) return null;

  return (
    <span
      ref={thumbRef}
      className="inline-block w-4 h-4 rounded border border-border overflow-hidden shrink-0 relative"
      onMouseEnter={(e) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        setPreviewPos({ x: rect.right + 8, y: rect.top });
        setShowPreview(true);
      }}
      onMouseLeave={() => setShowPreview(false)}
    >
      <img
        src={url}
        alt=""
        className="w-full h-full object-cover"
        loading="lazy"
      />
      {showPreview && (
        <div
          className="fixed z-[100] rounded-lg border bg-popover shadow-lg overflow-hidden pointer-events-none"
          style={{ left: previewPos.x, top: previewPos.y, width: 128, height: 128 }}
        >
          <img src={url} alt={asset.name} className="w-full h-full object-cover" />
        </div>
      )}
    </span>
  );
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
  const isTexture = filter === "texture";
  const selectedAsset = value ? filtered.find(a => a.id === value) : undefined;

  return (
    <Select
      value={value || "_none"}
      onValueChange={(v) => onChange(v === "_none" ? undefined : v)}
    >
      <SelectTrigger className={className ?? "h-7 text-xs"}>
        <span className="flex items-center gap-1.5 truncate">
          {isTexture && selectedAsset && <TextureThumbnail asset={selectedAsset} />}
          <SelectValue placeholder={placeholder} />
        </span>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="_none">None</SelectItem>
        {filtered.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            <span className="flex items-center gap-1.5">
              {isTexture && <TextureThumbnail asset={a} />}
              <span className="truncate">{a.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
