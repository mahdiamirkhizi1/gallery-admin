import { api } from "@/services/api";
import { endpoints } from "@/config/endpoints";
import type { Product, ProductFilters, ProductPage } from "./products.types";
type Envelope<T>={result:T};
export async function getProducts(filters:ProductFilters){const from=(filters.page-1)*10;const {data}=await api.get<Envelope<ProductPage>>(endpoints.products.list,{params:{recordFrom:from,recordTo:from+10,search:filters.search||undefined,category:filters.category||undefined,metal:filters.metal||undefined,status:filters.status||undefined}});return data.result}
const localizeProductSubType=(product:Product):Product=>{const jewelry=product.jewelry;const subType=jewelry?.jewelrySubType;if(!jewelry||!subType)return product;const name=subType.name.trim().toLocaleLowerCase("en-US");const labels:Record<string,string>={ring:"انگشتر","حلقه":"انگشتر","انگشتر":"انگشتر",necklace:"گردنبند",bracelet:"دستبند",bangle:"النگو",pendant:"آویز",earrings:"گوشواره",chain:"زنجیر",set:"سرویس","half set":"نیم‌ست","half-set":"نیم‌ست"};return labels[name]?{...product,jewelry:{...jewelry,jewelrySubType:{...subType,name:labels[name]}}}:product};
export async function getProduct(id:number){const {data}=await api.get<Envelope<Product>|Product>(endpoints.products.detail(id));return localizeProductSubType("result" in data?data.result:data)}
export type UpdateProductPayload=Partial<Product>&{plans?:{existingIds:number[]};removePlanIds?:number[];labelIds?:number[]};
export async function updateProduct(id:number,payload:UpdateProductPayload){const {data}=await api.patch(endpoints.products.update(id),payload);return data}
export const productImage=(product:Product)=>{const images=product.medias?.images??[];const image=images.find(item=>item.isPrimary)??images[0];return image?.url??image?.preview??""};
