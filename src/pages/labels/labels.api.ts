import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { ProductLabel } from "../products/create/product-form.types";

type Envelope<T>={result:T}; type Page<T>={items:T[];totalCount:number};
export type LabelPayload={title:string;slug:string;description?:string|null;isActive?:boolean;showOnProductCard?:boolean;showInFilters?:boolean;showAsProductRow?:boolean;scopeMetals?:ProductLabel["scopeMetals"];scopeCategories?:ProductLabel["scopeCategories"];sortOrder?:number;startAt?:string|null;endAt?:string|null};
export async function getLabels(){const {data}=await api.get<Envelope<Page<ProductLabel>>>(endpoints.products.labels,{params:{recordFrom:0,recordTo:200}});return data.result.items}
export async function createLabel(payload:LabelPayload){const {data}=await api.post(endpoints.products.publicLabels,payload);return data}
export async function updateLabel(id:number,payload:Partial<LabelPayload>){const {data}=await api.patch(endpoints.products.label(id),payload);return data}
export async function deleteLabel(id:number){const {data}=await api.delete(endpoints.products.label(id));return data}
