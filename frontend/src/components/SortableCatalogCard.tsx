import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CatalogCard from "./CatalogCard";
import type { Catalog } from "@/contexts/ConfigContext";
import { Tooltip } from "./Tooltip";

interface Props {
  catalog: Catalog;
  index: number;
  activeId: string | null;
  containerId: string;
  onChange: (enabled: boolean, showInHome: boolean) => void;
  onRename: (newName: string) => void;
  onRemove?: () => void;
  groupId?: string;
  hideToggles?: boolean;
}

export default function SortableCatalogCard({
  catalog,
  index,
  activeId,
  containerId,
  onChange,
  onRename,
  onRemove,
  groupId = "ungrouped",
  hideToggles,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `catalog:${catalog.id}-${catalog.type}`,
    data: {
      containerId,
    },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative w-full">
        <CatalogCard
          catalog={catalog}
          index={index}
          isDragging={isDragging}
          onChange={onChange}
          onRename={onRename}
          hideToggles={hideToggles}
        />
        {onRemove && (
          <Tooltip content="Remove from group">
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRemove();
              }}
              className="absolute top-2 right-3 z-20 text-gray-400 hover:text-red-500 text-lg font-bold"
              aria-label="Remove from group"
            >
              ×
            </button>
          </Tooltip>
        )}
      </div>
    </div>
  );
}