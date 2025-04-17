import { useEffect, useState, useMemo } from "react";
import { useConfig } from "@/contexts/ConfigContext";
import { fetchUserLists } from "@/lib/fetchUserLists";
import { getDefaultLists } from "@/lib/getDefaultLists";
import CatalogCard from "@/components/CatalogCard";
import { InstallButtons } from "@/components/InstallButtons";
import ApiKeyInput from "@/components/ApiKeyInput";
import GroupsTab from "@/components/GroupsTab";
import SummaryTab from "@/components/SummaryTab";

import { PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { generateManifestUrl } from "@/lib/generateManifestUrl";
import type { Catalog, Group } from "@/contexts/ConfigContext";

export default function ConfigurePage() {
  const {
    apiKey,
    setApiKey,
    rpdbKey,
    setRpdbKey,
    catalogs,
    setCatalogs,
    groups,
    setGroups,
  } = useConfig();

  const [activeTab, setActiveTab] = useState("configure");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [tempApiKey, setTempApiKey] = useState(apiKey);
  const [tempRpdbKey, setTempRpdbKey] = useState(rpdbKey || "");
  const [showDefaultLists, setShowDefaultLists] = useState(false);
  const [defaultCatalogs, setDefaultCatalogs] = useState<Catalog[]>([]);

  const manifestUrl = useMemo(() => {
    return generateManifestUrl({ catalogs, groups, apiKey, rpdbKey });
  }, [catalogs, apiKey, rpdbKey]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleChange = (enabled: boolean, showInHome: boolean, catalog: Catalog) => {
    setCatalogs((prev) =>
      prev.map((cat) =>
        cat.id === catalog.id && cat.type === catalog.type
          ? { ...cat, enabled, showInHome }
          : cat
      )
    );
  };

  const handleRename = (newName: string, catalog: Catalog) => {
    setCatalogs((prev) =>
      prev.map((cat) =>
        cat.id === catalog.id && cat.type === catalog.type
          ? { ...cat, name: newName }
          : cat
      )
    );
  };

  const handleDragEnd = ({ active, over }: any) => {
    if (!over || active.id === over.id) {
      setActiveId(null);
      return;
    }

    const activeIdStr = String(active.id);
    const overIdStr = String(over.id);

    const activeCatalog = catalogs.find((c) => `${c.id}-${c.type}` === activeIdStr);
    if (!activeCatalog) {
      setActiveId(null);
      return;
    }

    const fromGroup = groups.find((g) => g.listIds.includes(activeIdStr));
    const toGroup = groups.find((g) => g.listIds.includes(overIdStr) || g.id === overIdStr);

    let updatedGroups = [...groups];
    if (fromGroup && (!toGroup || fromGroup.id !== toGroup.id)) {
      updatedGroups = updatedGroups.map((g) =>
        g.id === fromGroup.id
          ? { ...g, listIds: g.listIds.filter((id) => id !== activeIdStr) }
          : g
      );
    }

    if (toGroup) {
      const insertIndex = toGroup.listIds.indexOf(overIdStr);
      const newList = [...toGroup.listIds];
      newList.splice(insertIndex !== -1 ? insertIndex : newList.length, 0, activeIdStr);
      updatedGroups = updatedGroups.map((g) =>
        g.id === toGroup.id ? { ...g, listIds: newList } : g
      );
    }

    const overContainerId = over?.data?.current?.containerId ?? over?.id;
    const updatedCatalog = {
      ...activeCatalog,
      showInHome: overContainerId === "home",
    };

    const updatedCatalogs = catalogs.map((cat) =>
      `${cat.id}-${cat.type}` === activeIdStr ? updatedCatalog : cat
    );

    setGroups(updatedGroups);
    setCatalogs(updatedCatalogs);
    setActiveId(null);
  };

  const loadLists = async () => {
    if (!tempApiKey) return;
    try {
      const userLists = await fetchUserLists(tempApiKey);
      const listsWithIcons = userLists.map((list) => ({
        ...list,
        icon: "/default-icon.png",
      }));

      if (userLists.length) {
        setCatalogs(
          showDefaultLists ? [...listsWithIcons, ...defaultCatalogs] : listsWithIcons
        );
        setApiKey(tempApiKey);
        setRpdbKey(tempRpdbKey);
        localStorage.setItem("mdblistApiKey", tempApiKey);
        localStorage.setItem("rpdbApiKey", tempRpdbKey);
      } else {
        alert("No lists found for this API key.");
      }
    } catch (error) {
      alert("Failed to load lists. Please check your API key.");
      console.error(error);
    }
  };

  const toggleDefaultLists = () => {
    if (!showDefaultLists) {
      const defaults = getDefaultLists().map((d) => ({
        ...d,
        icon: "/default-icon.png",
      }));
      setDefaultCatalogs(defaults);
      setCatalogs([...catalogs, ...defaults]);
    } else {
      setCatalogs(
        catalogs.filter(
          (cat) => !defaultCatalogs.some((d) => d.id === cat.id && d.type === cat.type)
        )
      );
      setDefaultCatalogs([]);
    }
    setShowDefaultLists((prev) => !prev);
  };

  useEffect(() => {
    const storedApiKey = localStorage.getItem("mdblistApiKey");
    const storedRpdbKey = localStorage.getItem("rpdbApiKey");
    if (storedApiKey) {
      setTempApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
    if (storedRpdbKey) {
      setTempRpdbKey(storedRpdbKey);
      setRpdbKey(storedRpdbKey);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100 p-6">
      <div className="w-full max-w-[100rem] mx-auto px-4 sm:px-8 space-y-8">
        {/* Banner */}
        <div className="w-full h-[140px] sm:h-[180px] rounded-2xl bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200 flex items-center justify-center shadow-lg">
          <div className="flex items-center gap-8">
            <img
              src="/favicon.png"
              alt="Ghost Icon"
              className="w-24 h-24 sm:w-28 sm:h-28"
            />
            <h1 className="text-6xl sm:text-7xl font-bold text-white drop-shadow-2xl">
              Ghost Lists
            </h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-4">
          {["configure", "groups", "summary"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all ${activeTab === tab
                  ? "bg-purple-500 text-white"
                  : "bg-white text-purple-600 hover:bg-purple-200"
                }`}
            >
              {tab === "configure"
                ? "Configure"
                : tab === "groups"
                  ? "Groups"
                  : "Summary & Reorder"}
            </button>
          ))}
        </div>

        {/* Tabs */}
        {activeTab === "configure" && (
          <>
            <ApiKeyInput label="MDBList API Key" value={tempApiKey} onChange={setTempApiKey} />
            <ApiKeyInput label="RPDB API Key (optional)" value={tempRpdbKey} onChange={setTempRpdbKey} />
            <div className="flex flex-wrap gap-4">
              <button
                onClick={loadLists}
                disabled={!tempApiKey}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-all"
              >
                Load Lists
              </button>
              <button
                onClick={toggleDefaultLists}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition-all"
              >
                {showDefaultLists ? "Hide Default Lists" : "Show Default Lists"}
              </button>
            </div>
            <InstallButtons manifestUrl={manifestUrl} />
            {catalogs.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-8 mt-8">
                {/* Movies Column */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold text-purple-700">Movies</h3>
                  {catalogs
                    .filter((cat) => cat.type === "movie")
                    .map((cat, idx) => (
                      <CatalogCard
                        key={`${cat.id}-movie`}
                        catalog={cat}
                        index={idx}
                        onChange={(enabled, showInHome) => handleChange(enabled, showInHome, cat)}
                        onRename={(newName: string) => handleRename(newName, cat)}
                      />
                    ))}
                </div>

                {/* Series Column */}
                <div className="flex-1 space-y-4">
                  <h3 className="text-lg font-semibold text-purple-700">Series</h3>
                  {catalogs
                    .filter((cat) => cat.type === "series")
                    .map((cat, idx) => (
                      <CatalogCard
                        key={`${cat.id}-series`}
                        catalog={cat}
                        index={idx}
                        onChange={(enabled, showInHome) => handleChange(enabled, showInHome, cat)}
                        onRename={(newName: string) => handleRename(newName, cat)}
                      />
                    ))}
                </div>
              </div>
            )}

          </>
        )}

        {activeTab === "groups" && (
          <GroupsTab
            groups={groups}
            setGroups={setGroups}
            catalogs={catalogs}
            setCatalogs={setCatalogs}
          />
        )}

        {activeTab === "summary" && (
          <SummaryTab
            catalogs={catalogs}
            groups={groups}
            setGroups={setGroups}
            setCatalogs={setCatalogs}
            activeId={activeId}
            setActiveId={setActiveId}
            handleChange={handleChange}
            handleRename={handleRename}
          />
        )}
      </div>
    </div>
  );
}
