import React, { useState } from "react";
import { GroupCard } from "@/components/GroupCard";
import DroppableZone from "@/components/DroppableZone";
import SortableCatalogCard from "@/components/SortableCatalogCard";
import RenameModal from "@/components/RenameModal";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Catalog, Group } from "@/contexts/ConfigContext";

interface GroupSummaryCardProps {
  group: Group;
  catalogs: Catalog[];
  activeId: string | null;
  onRename: (newName: string) => void;
  onToggleEnable: (val: boolean) => void;
  onToggleHome: (val: boolean) => void;
  onRemove: () => void;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;

  handleChange: (enabled: boolean, showInHome: boolean, catalog: Catalog) => void;
  handleRename: (newName: string, catalog: Catalog) => void;

  isDragging?: boolean;
  hideToggles?: boolean;

}

export default function GroupSummaryCard({
  group,
  catalogs,
  activeId,
  onRename,
  onToggleEnable,
  onToggleHome,
  onRemove,
  setGroups,
  setCatalogs,
  handleChange,
  handleRename,
  hideToggles = false,
}: GroupSummaryCardProps) {
  const [isRenaming, setIsRenaming] = useState(false);

  const groupCatalogs = group.listIds
    .map((id) => catalogs.find((c) => `${c.id}-${c.type}` === id))
    .filter(Boolean) as Catalog[];

  return (
    <>
      <GroupCard
        group={{
          name: group.name,
          subtitle: groupCatalogs[0]?.type ? `${groupCatalogs[0]?.type} List` : undefined,
          type: groupCatalogs[0]?.type ?? "movie",
          enabled: groupCatalogs.every((c) => c.enabled),
          showInHome: groupCatalogs.every((c) => c.enabled && c.showInHome),
        }}
        onRename={() => setIsRenaming(true)}
        onToggleEnable={onToggleEnable}
        onToggleHome={onToggleHome}
        onRemove={onRemove}
      >
        <DroppableZone id={group.id}>
          <SortableContext
            items={groupCatalogs.map((c) => `${c.id}-${c.type}`)}
            strategy={verticalListSortingStrategy}
          >
            {groupCatalogs.map((cat, idx) => {
              const catalogKey = `${cat.id}-${cat.type}`;
              return (
                <SortableCatalogCard
                  key={catalogKey}
                  catalog={cat}
                  index={idx}
                  activeId={activeId}
                  onChange={(enabled, showInHome) => handleChange(enabled, showInHome, cat)}
                  onRename={(newName) => handleRename(newName, cat)}
                  onRemove={() => {
                    setGroups((prev) =>
                      prev.map((g) =>
                        g.id === group.id
                          ? { ...g, listIds: g.listIds.filter((id) => id !== catalogKey) }
                          : g
                      )
                    );
                  }}
                  groupId={group.id}
                  hideToggles
                  containerId={groupCatalogs.every((c) => c.showInHome) ? "home" : "enabled"}
                />
              );
            })}

          </SortableContext>
        </DroppableZone>
      </GroupCard>

      {/* Rename Modal */}
      {isRenaming && (
        <RenameModal
          initialName={group.name}
          onRename={(newName) => {
            onRename(newName);
            setIsRenaming(false);
          }}
          onClose={() => setIsRenaming(false)}
        />
      )}
    </>
  );
}
