import { useEffect, useState } from "react";
import {
  DndContext,
  rectIntersection,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { Catalog, Group } from "@/contexts/ConfigContext";
import DroppableZone from "./DroppableZone";
import SortableCatalogCard from "./SortableCatalogCard";
import SortableGroupCard from "./SortableGroupCard";
import CatalogCard from "./CatalogCard";

interface Props {
  catalogs: Catalog[];
  groups: Group[];
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  handleChange: (enabled: boolean, showInHome: boolean, catalog: Catalog) => void;
  handleRename: (newName: string, catalog: Catalog) => void;
}

export default function SummaryTab({
  catalogs,
  groups,
  setCatalogs,
  setGroups,
  activeId,
  setActiveId,
  handleChange,
  handleRename,
}: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  const [displayOrder, setDisplayOrder] = useState<string[]>([]);

  const groupedIds = new Set(groups.flatMap((g) => g.listIds));

  const getCatalogKey = (cat: Catalog) => `${cat.id}-${cat.type}`;
  const getCatalogByKey = (key: string) => catalogs.find((cat) => getCatalogKey(cat) === key);

  useEffect(() => {
    if (displayOrder.length > 0) return;

    const allGroupedKeys = new Set(groups.flatMap((g) => g.listIds));
    const initialOrder = [
      ...groups.filter((g) => g.listIds.length > 0).map((g) => `group:${g.id}`),
      ...catalogs
        .filter((cat) => cat.enabled && !allGroupedKeys.has(getCatalogKey(cat)))
        .map((cat) => `catalog:${getCatalogKey(cat)}`),
    ];

    setDisplayOrder(initialOrder);
  }, []); 

  const handleDragEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }
  
    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);
  
    const sourceContainer = active?.data?.current?.sortable?.containerId;
    const targetContainer = over?.data?.current?.sortable?.containerId;
  
    if (sourceContainer !== targetContainer) {
      setActiveId(null);
      return;
    }
  
    const oldIndex = displayOrder.indexOf(activeIdStr);
    const newIndex = displayOrder.indexOf(overIdStr);
  
    if (oldIndex !== -1 && newIndex !== -1) {
      const newOrder = arrayMove(displayOrder, oldIndex, newIndex);
      setDisplayOrder(newOrder);
    }
  
    setActiveId(null);
  };
  

  const renderColumn = (showInHome: boolean, label: string, containerId: string) => {
    const items = displayOrder.filter((id) => {
      if (id.startsWith("group:")) {
        const group = groups.find((g) => `group:${g.id}` === id);
        if (!group) return false;
        const groupCatalogs = group.listIds.map(getCatalogByKey).filter(Boolean) as Catalog[];
        return groupCatalogs.every((c) => c.enabled && c.showInHome === showInHome);
      }

      if (id.startsWith("catalog:")) {
        const key = id.replace("catalog:", "");
        const cat = getCatalogByKey(key);
        const isGrouped = groups.some((g) => g.listIds.includes(key));
        return cat && !isGrouped && cat.enabled && cat.showInHome === showInHome;
      }

      return false;
    });

    return (
      <div className="w-full md:w-1/2">
        <h3 className="text-md font-medium text-purple-600 mb-2">{label}</h3>
        <DroppableZone id={containerId}>
          <SortableContext items={items} strategy={verticalListSortingStrategy}>
            {items.map((id, index) => {
              if (id.startsWith("catalog:")) {
                const key = id.replace("catalog:", "");
                const cat = getCatalogByKey(key);
                if (!cat) return null;

                return (
                  <SortableCatalogCard
                    key={id}
                    catalog={cat}
                    index={index}
                    activeId={activeId}
                    containerId={containerId}
                    hideToggles={groupedIds.has(getCatalogKey(cat))}
                    onChange={
                      groupedIds.has(getCatalogKey(cat))
                        ? () => {}
                        : (enabled: boolean, showInHome: boolean) => handleChange(enabled, showInHome, cat)
                    }
                    onRename={(newName) => handleRename(newName, cat)}
                    onRemove={() =>
                      setCatalogs((prev) =>
                        prev.map((c) =>
                          c.id === cat.id && c.type === cat.type
                            ? { ...c, enabled: false }
                            : c
                        )
                      )
                    }
                    groupId={groupedIds.has(getCatalogKey(cat)) ? "grouped" : "ungrouped"}
                  />
                );
              }

              if (id.startsWith("group:")) {
                const groupId = id.replace("group:", "");
                const group = groups.find((g) => g.id === groupId);
                if (!group) return null;
                const groupCatalogs = group.listIds.map(getCatalogByKey).filter(Boolean) as Catalog[];

                return (
                  <SortableGroupCard
                    key={id}
                    group={group}
                    catalogs={groupCatalogs}
                    activeId={activeId}
                    setGroups={setGroups}
                    setCatalogs={setCatalogs}
                    handleChange={handleChange}
                    handleRename={handleRename}
                    onRemove={() =>
                      setGroups((prev) => prev.filter((g) => g.id !== group.id))
                    }
                    onRename={(newName) =>
                      setGroups((prev) =>
                        prev.map((g) => (g.id === group.id ? { ...g, name: newName } : g))
                      )
                    }
                    onToggleEnable={(val: boolean) =>
                      setCatalogs((prev) =>
                        prev.map((cat) =>
                          group.listIds.includes(getCatalogKey(cat))
                            ? { ...cat, enabled: val }
                            : cat
                        )
                      )
                    }
                    onToggleHome={(val: boolean) =>
                      setCatalogs((prev) =>
                        prev.map((cat) =>
                          group.listIds.includes(getCatalogKey(cat))
                            ? { ...cat, showInHome: val }
                            : cat
                        )
                      )
                    }
                    containerId={containerId}
                  />
                );
              }

              return null;
            })}
          </SortableContext>
        </DroppableZone>
      </div>
    );
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={rectIntersection}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="bg-white/50 rounded-xl p-6 shadow space-y-6">
        <h2 className="text-xl font-semibold text-purple-700">Summary & Reorder</h2>
        <div className="flex flex-col md:flex-row gap-6">
          {renderColumn(false, "Enabled (Not on Home)", "enabled")}
          {renderColumn(true, "Shown on Home", "home")}
        </div>
      </div>
    </DndContext>
  );
}
