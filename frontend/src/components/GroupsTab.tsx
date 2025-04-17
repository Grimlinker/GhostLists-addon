import {
  DndContext,
  useDroppable,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, useRef, useEffect, CSSProperties, MutableRefObject } from "react";
import { Trash2, Pencil, ChevronDown, ChevronRight, ChevronLeft, ChevronUp } from "lucide-react";
import type { Group, Catalog } from "@/contexts/ConfigContext";
import CatalogCard from "./CatalogCard";
import { Toggle } from "./Toggle";
import React from "react";


function SortableCatalogCard({
  id,
  catalog,
  index,
  onRename,
  onChange,
  onRemove,
  activeId,
  groupId,
}: {
  id: string;
  catalog: Catalog;
  index?: number;
  onRename: (name: string) => void;
  onChange: (enabled: boolean, showInHome: boolean) => void;
  onRemove?: () => void;
  activeId?: string | null;
  groupId: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: {
      containerId: groupId,
    },
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    visibility: isDragging ? "hidden" : "visible",
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div className="relative w-full">
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onRemove();
            }}
            className="absolute top-0.5 right-3 z-20 text-gray-400 hover:text-red-500 text-m font-bold"
            aria-label="Remove from group"
          >
            ×
          </button>
        )}
        <CatalogCard
          key={`${catalog.id}-${catalog.enabled}-${catalog.showInHome}`}
          catalog={catalog}
          onRename={onRename}
          onChange={onChange}
          index={index}
          hideToggles={groupId !== "ungrouped"}
        />
      </div>
    </div>
  );
}


function DroppableGroup({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      id={id}
      className="relative w-full p-4 rounded-2xl shadow-md space-y-4 border bg-white border-purple-200"
    >
      {children}
    </div>
  );
}

export default function GroupsTab({
  groups,
  setGroups,
  catalogs,
  setCatalogs,
}: {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  catalogs: Catalog[];
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;
}) {

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState<string[]>([]);
  const containerRefs = useRef<Record<string, HTMLDivElement | null>>({}); // ADDED
  const lockedHeights = useRef<Record<string, number | null>>({}); // ADDED

  const catalogKey = (c: Catalog) => `${c.id}-${c.type}`;
  const findCatalogByKey = (key: string) => catalogs.find((c) => catalogKey(c) === key);

  const groupedIds = new Set(groups.flatMap((g) => g.listIds));
  const ungroupedCatalogs = catalogs.filter((c) => c.enabled && !groupedIds.has(catalogKey(c)));

  const activeCatalog = findCatalogByKey(activeId ?? "");

  const handleChange = (enabled: boolean, showInHome: boolean, catalog: Catalog) => {
    const updated = catalogs.map((cat) =>
      cat.id === catalog.id && cat.type === catalog.type ? { ...cat, enabled, showInHome } : cat
    );
    setCatalogs(updated);
  };

  const handleRename = (newName: string, catalog: Catalog) => {
    const updated = catalogs.map((cat) =>
      cat.id === catalog.id && cat.type === catalog.type ? { ...cat, name: newName } : cat
    );
    setCatalogs(updated);
  };

  const handleToggleCollapse = (groupId: string) => {
    setCollapsedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((id) => id !== groupId) : [...prev, groupId]
    );
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const draggedCatalog = findCatalogByKey(active.id);
    if (!draggedCatalog) {
      setActiveId(null);
      return;
    }

    const activeGroup = groups.find((g) => g.listIds.includes(active.id));
    const overGroup = groups.find((g) => g.listIds.includes(over.id) || g.id === over.id);

    if (over.id === "ungrouped") {
      if (!activeGroup) {
        setActiveId(null);
        return;
      }

      setGroups((prev) =>
        prev.map((g) =>
          g.id === activeGroup.id ? { ...g, listIds: g.listIds.filter((id) => id !== active.id) } : g
        )
      );
      setActiveId(null);
      return;
    }

    if (!overGroup) {
      setActiveId(null);
      return;
    }

    if (activeGroup && overGroup.id === activeGroup.id) {
      const oldIndex = activeGroup.listIds.indexOf(active.id);
      const newIndex = overGroup.listIds.indexOf(over.id);
      const reordered = arrayMove(activeGroup.listIds, oldIndex, newIndex);

      setGroups((prev) =>
        prev.map((g) => (g.id === activeGroup.id ? { ...g, listIds: reordered } : g))
      );
    } else {
      const overCatalogIds = overGroup.listIds;
      const overCatalogs = overCatalogIds.map(findCatalogByKey).filter(Boolean) as Catalog[];
      const targetType = overCatalogs[0]?.type || draggedCatalog.type;

      if (overCatalogs.length > 0 && draggedCatalog.type !== targetType) {
        setActiveId(null);
        return;
      }

      const updated = groups.map((g) => {
        if (g.id === overGroup.id && !g.listIds.includes(active.id)) {
          const groupType = g.type === "unknown" ? draggedCatalog.type : g.type;
          return { ...g, listIds: [...g.listIds, active.id], type: groupType };
        } else if (g.listIds.includes(active.id)) {
          return { ...g, listIds: g.listIds.filter((id) => id !== active.id) };
        }
        return g;
      });


      setGroups(updated);
    }

    setActiveId(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(e) => setActiveId(e.active.id as string)}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-6 mt-6">
        <div className="w-1/2 space-y-6">
          <div className="flex items-center gap-2">

            <input
              type="text"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="New group name"
              className="px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-400 w-full"
            />
            <button
              onClick={() => {
                if (!newGroupName.trim()) return;
                const id = `group-${Date.now()}`;
                setGroups((prevGroups) => [
                  ...prevGroups,
                  {
                    id,
                    name: newGroupName.trim(),
                    listIds: [],
                    type: "unknown",
                    enabled: true,
                    showInHome: false,
                  }]);
                setNewGroupName("");
              }}
              className="bg-purple-500 text-white p-2 rounded-full hover:bg-purple-600"
            >
              +
            </button>
          </div>

          {groups.map((group) => {
            const groupCatalogs = group.listIds.map(findCatalogByKey).filter(Boolean) as Catalog[];
            const groupType = groupCatalogs[0]?.type;
            const isCollapsed = collapsedGroups.includes(group.id);
            const isDraggingFromThisGroup = group.listIds.includes(activeId ?? "");

            const ref = (el: HTMLDivElement | null) => {
              containerRefs.current[group.id] = el;
              if (isDraggingFromThisGroup && el) {
                lockedHeights.current[group.id] = el.getBoundingClientRect().height;
              } else {
                lockedHeights.current[group.id] = null;
              }
            };

            return (
              <DroppableGroup key={group.id} id={group.id}>
                <div className="relative w-full bg-white/90 p-0.5 rounded-2xl border-pink-100 transition-all">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleCollapse(group.id)}
                      className="absolute bottom-0 right-0 text-purple-400 hover:text-purple-600 z-10"
                      title={isCollapsed ? "Expand group" : "Collapse group"}

                    >

                      {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                    </button>
                    <img
                      src={groupCatalogs[0]?.icon || "/favicon.png"}
                      alt="icon"
                      onError={(e) => {
                        e.currentTarget.onerror = null; // 💥 prevent infinite loop
                        e.currentTarget.src = "/favicon.png";
                      }}
                      className="w-12 h-12 rounded-xl shadow-md border border-purple-200 object-cover bg-white"
                    />

                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-2 text-purple-600">
                        <input
                          value={group.name}
                          autoFocus
                          onChange={(e) =>
                            setGroups(groups.map((g) =>
                              g.id === group.id ? { ...g, name: e.target.value } : g
                            ))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingGroupId(null);
                            if (e.key === "Escape") setEditingGroupId(null);
                          }}
                          className="text-lg font-semibold border-b border-purple-300 focus:outline-none bg-transparent"
                        />
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="text-sm text-pink-500 hover:underline"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => setEditingGroupId(null)}
                          className="text-sm text-gray-400 hover:underline"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col text-pink-700">
                        <div className="flex items-center gap-1">
                          <h3 className="text-lg font-semibold truncate max-w-xs">
                            {groupType === "movie" ? "🎬" : groupType === "series" ? "📺" : ""} {group.name}
                          </h3>
                          <button
                            onClick={() => setEditingGroupId(group.id)}
                            className="hover:text-purple-500 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                        </div>
                        {groupType && (
                          <p className="text-xs text-gray-400 capitalize leading-tight -mt-0.5">
                            {groupType} list
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex justify-evenly gap-28 items-center mt-5">
                    <label className="flex items-center gap-2 text-sm">
                      <span>Enable</span>
                      <Toggle
                        checked={groupCatalogs.every((c) => c.enabled)}
                        onChange={(val) => {
                          setCatalogs((prev) =>
                            prev.map((cat) =>
                              group.listIds.includes(catalogKey(cat))
                                ? { ...cat, enabled: val, showInHome: val ? cat.showInHome : false }
                                : cat
                            )
                          );
                        }}
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <span>Home</span>
                      <Toggle
                        checked={groupCatalogs.every((c) => c.enabled && c.showInHome)}
                        onChange={(val) => {
                          setCatalogs((prev) =>
                            prev.map((cat) =>
                              group.listIds.includes(catalogKey(cat)) && cat.enabled
                                ? { ...cat, showInHome: val }
                                : cat
                            )
                          );
                        }}
                        disabled={!groupCatalogs.every((c) => c.enabled)}
                      />
                    </label>
                  </div>


                  <button
                    onClick={() => setGroups(groups.filter((g) => g.id !== group.id))}
                    className="absolute top-0.5 right-0.5 text-purple-400 hover:text-red-500 z-20"
                    aria-label="Remove group"
                  >
                    <Trash2 size={18} />
                  </button>

                </div>


                {!isCollapsed && (
                  <SortableContext items={group.listIds.length > 0 ? group.listIds : ["placeholder"]} strategy={verticalListSortingStrategy}>
                    <div
                      ref={ref}
                      className="space-y-2 transition-all"
                      style={{
                        height: lockedHeights.current[group.id] !== null ? `${lockedHeights.current[group.id]}px` : undefined,
                      }}
                    >
                      {group.listIds.map((id, index) => {
                        if (id === "placeholder") return null;
                        const cat = findCatalogByKey(id);
                        if (!cat) return null;
                        return (
                          <SortableCatalogCard
                            key={id}
                            id={id}
                            catalog={cat}
                            index={index}
                            activeId={activeId}
                            onRename={(newName) => handleRename(newName, cat)}
                            onChange={() => { }}
                            onRemove={() => {
                              setGroups((prev) =>
                                prev.map((g) =>
                                  g.id === group.id
                                    ? { ...g, listIds: g.listIds.filter((x) => x !== id) }
                                    : g
                                )
                              );
                            }}
                            groupId={group.id}
                          />

                        );
                      })}
                    </div>
                  </SortableContext>
                )}
              </DroppableGroup>
            );
          })}
        </div>

        <div className="w-1/2 space-y-4">
          <h2 className="text-lg font-semibold text-purple-700">Enabled Lists</h2>
          <DroppableGroup id="ungrouped">
            <SortableContext
              items={ungroupedCatalogs.length > 0 ? ungroupedCatalogs.map(catalogKey) : ["placeholder"]}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2 bg-white p-4 rounded-xl shadow min-h-[200px]">
                {ungroupedCatalogs.map((c, i) => {
                  const key = catalogKey(c);
                  return (
                    <SortableCatalogCard
                      key={key}
                      id={key}
                      catalog={c}
                      index={i}
                      activeId={activeId}
                      onRename={(newName) => handleRename(newName, c)}
                      onChange={(enabled, showInHome) => handleChange(enabled, showInHome, c)}
                      groupId="ungrouped"
                    />
                  );
                })}
              </div>
            </SortableContext>
          </DroppableGroup>
        </div>
      </div>

      <DragOverlay>
        {activeCatalog && (
          <div className="w-full" style={{ height: "96px" }}>
            <CatalogCard
              catalog={activeCatalog}
              index={0}
              onChange={() => { }}
              onRename={() => { }}
            />
          </div>
        )}
      </DragOverlay>


    </DndContext>
  );
}