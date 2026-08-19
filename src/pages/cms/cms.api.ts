import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { GalleryCms, HomeCms } from "./cms.types";
type Envelope<T> = { result: T };
export async function getGalleryCms() {
  const { data } = await api.get<Envelope<GalleryCms>>(endpoints.cms.gallery);
  return data.result;
}
export async function saveGalleryCms(payload: GalleryCms) {
  const { key, updatedAt, ...sections } = payload;
  const { data } = await api.patch<Envelope<GalleryCms>>(
    endpoints.cms.gallery,
    sections,
  );
  return data.result;
}
export async function getHomeCms() {
  const { data } = await api.get<Envelope<HomeCms>>(endpoints.cms.home);
  return data.result;
}
export async function saveHomeCms(payload: HomeCms) {
  const { key, updatedAt, ...sections } = payload;
  const { data } = await api.patch<Envelope<HomeCms>>(
    endpoints.cms.home,
    sections,
  );
  return data.result;
}
