import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ProductDraft } from "./product-form.types";

const initialDraft: ProductDraft = { title:"",category:"JEWELRY",gender:"WOMAN",metal:"GOLD",carat:18,description:"",sku:"",jewelry:{subTypeId:1,makingCost:0,wages:0,tax:0,isNew:true,attr:{}},coin:{coinType:"AZADI_FULL",mintRef:"BANK",coinPattern:"EMAMI"},variants:[{id:crypto.randomUUID(),weight:0,stock:0,sku:""}],images:[],existingPlanIds:[],labelIds:[],regularSale:true,status:"PUBLISHED" };
type Store={step:number;draft:ProductDraft;setStep:(step:number)=>void;patch:(value:Partial<ProductDraft>)=>void;reset:()=>void};
export const useProductFormStore=create<Store>()(persist(set=>({step:1,draft:initialDraft,setStep:step=>set({step}),patch:value=>set(state=>({draft:{...state.draft,...value}})),reset:()=>set({step:1,draft:{...initialDraft,variants:[{id:crypto.randomUUID(),weight:0,stock:0,sku:""}],images:[]}})}),{
  name:"goldino-product-draft",
  version:2,
  partialize:state=>({step:state.step,draft:{...state.draft,images:[]}}),
  merge:(persisted,current)=>{
    const saved=(persisted as Partial<Store> | undefined)?.draft;
    return {
      ...current,
      ...(persisted as Partial<Store> | undefined),
      draft:{
        ...initialDraft,
        ...saved,
        jewelry:{...initialDraft.jewelry,...saved?.jewelry},
        coin:{...initialDraft.coin,...saved?.coin},
        variants:Array.isArray(saved?.variants)&&saved.variants.length?saved.variants:initialDraft.variants,
        images:[],
        existingPlanIds:Array.isArray(saved?.existingPlanIds)?saved.existingPlanIds:[],
        labelIds:Array.isArray(saved?.labelIds)?saved.labelIds:[],
      },
    } as Store;
  },
}));
