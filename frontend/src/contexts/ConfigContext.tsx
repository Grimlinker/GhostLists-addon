import React from "react";
import { createContext, useContext, useState, useEffect } from "react";

export type Catalog = {
  id: string;
  name: string;
  type: "movie" | "series";
  enabled: boolean;
  showInHome: boolean;
  icon?: string;
  imdbId?: string;
};


export type Group = {
  id: string;
  name: string;
  type: "movie" | "series" | "unknown";     
  enabled: boolean;              
  showInHome: boolean;           
  listIds: string[];
};


export type ConfigContextType = {
  apiKey: string;
  rpdbKey: string;
  catalogs: Catalog[];
  groups: Group[];
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  setApiKey: (key: string) => void;
  setRpdbKey: (key: string) => void;
};

type ConfigState = {
  apiKey: string;
  rpdbKey: string;
  catalogs: Catalog[];
  groups: Group[]; 
  setCatalogs: React.Dispatch<React.SetStateAction<Catalog[]>>;
  setApiKey: (key: string) => void;
  setRpdbKey: (key: string) => void;
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider = ({ children }: { children: React.ReactNode }) => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem("mdblistApiKey") || "");
  const [rpdbKey, setRpdbKey] = useState<string>(() => localStorage.getItem("rpdbApiKey") || "");
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    localStorage.setItem("mdblistApiKey", apiKey);
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem("rpdbApiKey", rpdbKey);
  }, [rpdbKey]);

  return (
    <ConfigContext.Provider
      value={{
        apiKey,
        rpdbKey,
        catalogs,
        groups,
        setCatalogs,
        setGroups,
        setApiKey,
        setRpdbKey,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): ConfigContextType => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};
