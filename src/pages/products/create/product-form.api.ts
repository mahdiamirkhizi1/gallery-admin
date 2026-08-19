import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { ProductDraft, ProductLabel, ProductPlan } from "./product-form.types";

type Envelope<T>={result:T}; type Page<T>={items:T[];totalCount:number};
export async function getProductPlans(){const {data}=await api.get<Envelope<Page<ProductPlan>>>(endpoints.products.plans,{params:{recordFrom:0,recordTo:20}});return data.result.items}
export async function getProductLabels(){const {data}=await api.get<Envelope<Page<ProductLabel>>>(endpoints.products.labels,{params:{recordFrom:0,recordTo:200}});return data.result.items}
export async function createReservePlan(percent:number){const {data}=await api.post(endpoints.products.createPlan,{type:"RESERVE",reserve:{percent}});return data}
export async function createProduct(draft:ProductDraft,status:ProductDraft["status"]="PUBLISHED"){
  const payload={metal:draft.metal,title:draft.title,category:draft.category,gender:draft.gender,carat:draft.carat,description:draft.description||null,labels:{sku:draft.sku},labelIds:draft.labelIds,medias:{images:draft.images.map(image=>({name:image.name,preview:image.preview,isPrimary:image.isPrimary}))},status,variants:draft.variants.map(item=>({weight:item.weight,stock:item.stock,sku:item.sku||null})),plans:{existingIds:draft.existingPlanIds},...(draft.category==="JEWELRY"?{jewelry:draft.jewelry}:{}),...(draft.category==="COIN"?{coin:draft.coin}:{})};
  const {data}=await api.post(endpoints.products.create,payload);return data;
}
