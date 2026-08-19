export type ProductMetal="GOLD"|"SILVER"|"COPPER"|"PLATINUM"|"IMITATION";
export const purityOptions:Record<ProductMetal,readonly number[]>={GOLD:[18,22,24],SILVER:[800,925,999],COPPER:[900,950,990,999],PLATINUM:[850,900,950,999],IMITATION:[0]};
export const purityLabel=(metal:ProductMetal)=>metal==="GOLD"?"عیار طلا":"خلوص فلز (از ۱۰۰۰)";
export const defaultPurity=(metal:ProductMetal)=>metal==="GOLD"?18:metal==="SILVER"?925:metal==="COPPER"?999:metal==="PLATINUM"?950:0;
export const isValidPurity=(metal:ProductMetal,value:number)=>purityOptions[metal].includes(value);
