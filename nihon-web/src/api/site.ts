import api from "./axios";

export type SiteInfo = {
  registration_enabled?: boolean;
  announcement?: string;
  disabled?: { key: string; title: string; paths: string[] }[];
};

export async function fetchSite(signal?: AbortSignal) {
  return (await api.get<SiteInfo>("/site", { signal })).data;
}
