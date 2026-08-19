import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Eye,
  GripVertical,
  ImageUp,
  Save,
  Target,
} from "lucide-react";
import { toast } from "@/stores/toast.store";
import { getProductLabels } from "../products/create/product-form.api";
import {
  getGalleryCms,
  getHomeCms,
  saveGalleryCms,
  saveHomeCms,
} from "./cms.api";
import type {
  CmsCard,
  GalleryCms,
  HomeCms,
  HomeGalleryItem,
  ProductDestination,
} from "./cms.types";
import "./cms.css";

const sections = [
  "اسلایدر اصلی",
  "پروموشن‌ها",
  "ردیف‌های محصولات",
  "بنرهای جنسیتی",
  "کالکشن‌ها",
];
const genders: [
  [string, ProductDestination["gender"]],
  ...[string, ProductDestination["gender"]][],
] = [
  ["بدون جنسیت", undefined],
  ["زنانه", "WOMAN"],
  ["مردانه", "MAN"],
  ["مشترک", "UNISEX"],
  ["کودک", "KID"],
];
function parseDestination(href: string): ProductDestination {
  try {
    const url = new URL(href, "http://local");
    return {
      category: (url.searchParams.get("category") ||
        undefined) as ProductDestination["category"],
      gender: (url.searchParams.get("gender") ||
        undefined) as ProductDestination["gender"],
      metal: (url.searchParams.get("metal") ||
        undefined) as ProductDestination["metal"],
      label: url.searchParams.get("label") || undefined,
      subtype: url.searchParams.get("subtype") || undefined,
    };
  } catch {
    return {};
  }
}
function destinationHref(value: ProductDestination) {
  const p = new URLSearchParams();
  if (value.category) p.set("category", value.category);
  if (value.gender) p.set("gender", value.gender);
  if (value.metal) p.set("metal", value.metal);
  if (value.label) p.set("label", value.label);
  if (value.subtype) p.set("subtype", value.subtype);
  return `/products${p.size ? `?${p}` : ""}`;
}
function normalizedDestination(value: ProductDestination): ProductDestination {
  const next = { ...value };
  if (next.category !== "JEWELRY") {
    next.gender = undefined;
    next.subtype = undefined;
  }
  if (next.category === "COIN") next.metal = "GOLD";
  return next;
}
function homeFilterDestination(item: { destination: { value: string | null } }) {
  return parseDestination(`/products?${item.destination.value ?? ""}`);
}
function canonicalHref(href: string) {
  const url = new URL(href, "http://local");
  const category = url.searchParams.get("category")?.toLowerCase();
  const gender = url.searchParams.get("gender")?.toLowerCase();
  if (gender === "men") return "/products?category=JEWELRY&gender=MAN";
  if (gender === "child") return "/products?category=JEWELRY&gender=KID";
  if (category === "silver-bar")
    return "/products?category=BULLION&metal=SILVER";
  if (category === "gold-bar") return "/products?category=BULLION&metal=GOLD";
  if (category === "coin") return "/products?category=COIN&metal=GOLD";
  if (category === "set") return "/products?category=JEWELRY&subtype=set";
  if (category === "melted") return "/melted-gold";
  return href;
}
function normalizeGallery(value: GalleryCms): GalleryCms {
  const cards = (items: CmsCard[]) =>
    items.map((item) => ({ ...item, href: canonicalHref(item.href) }));
  return {
    ...value,
    hero: { slides: cards(value.hero.slides) },
    promos: cards(value.promos),
    genderBanners: cards(value.genderBanners),
    collections: cards(value.collections),
  };
}
function normalizeHome(value: HomeCms): HomeCms {
  return {
    ...value,
    gallery: {
      ...value.gallery,
      items: value.gallery.items.map((item) => {
        if (item.destination.type !== "PRODUCT_FILTER") return item;
        const destination = normalizedDestination(homeFilterDestination(item));
        const href = destinationHref(destination);
        return { ...item, destination: { ...item.destination, value: href.includes("?") ? href.split("?")[1] : "" } };
      }),
    },
  };
}
function imageSrc(value: string) {
  return value.startsWith("/") ? `http://localhost:3000${value}` : value;
}
function ImagePicker({value,onChange}:{value:string;onChange:(value:string)=>void}){const pick=(event:ChangeEvent<HTMLInputElement>)=>{const file=event.target.files?.[0];if(!file)return;if(file.size>100*1024){toast.error("حجم تصویر زیاد است","حجم تصویر باید حداکثر ۱۰۰ کیلوبایت باشد.");event.target.value="";return}if(!file.type.startsWith("image/")){toast.error("فرمت تصویر معتبر نیست","فقط فایل تصویری انتخاب کنید.");return}const reader=new FileReader();reader.onload=()=>onChange(String(reader.result));reader.readAsDataURL(file)};return <div className="cms-file-picker"><label><ImageUp/>انتخاب تصویر<input type="file"accept="image/png,image/jpeg,image/webp"onChange={pick}/></label>{value?<img src={imageSrc(value)}alt=""/>:null}<small>JPG، PNG یا WEBP — حداکثر ۱۰۰ کیلوبایت</small></div>}
export function CmsPage({ initialTab = "gallery" }: { initialTab?: "gallery" | "home" }) {
  const client = useQueryClient();
  const tab = initialTab;
  const [gallery, setGallery] = useState<GalleryCms | null>(null);
  const [home, setHome] = useState<HomeCms | null>(null);
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(0);
  const { data: remoteGallery } = useQuery({
    queryKey: ["cms-gallery"],
    queryFn: getGalleryCms,
  });
  const { data: remoteHome } = useQuery({
    queryKey: ["cms-home"],
    queryFn: getHomeCms,
  });
  const { data: labels = [] } = useQuery({
    queryKey: ["product-labels"],
    queryFn: getProductLabels,
  });
  useEffect(() => {
    if (remoteGallery) setGallery(normalizeGallery(remoteGallery));
  }, [remoteGallery]);
  useEffect(() => {
    if (remoteHome) setHome(normalizeHome(remoteHome));
  }, [remoteHome]);
  const saveGallery = useMutation({
    mutationFn: () => saveGalleryCms(gallery!),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["cms-gallery"] });
      toast.success("گالری ذخیره شد", "تغییرات در سایت قابل مشاهده است.");
    },
    onError: () =>
      toast.error("ذخیره ناموفق بود", "فیلدهای گالری را بررسی کنید."),
  });
  const saveHome = useMutation({
    mutationFn: () => saveHomeCms(home!),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: ["cms-home"] });
      toast.success("صفحه خانه ذخیره شد", "تغییرات با موفقیت ثبت شد.");
    },
    onError: () =>
      toast.error("ذخیره ناموفق بود", "اطلاعات صفحه خانه معتبر نیست."),
  });
  if (!gallery || !home)
    return <div className="list-state">در حال دریافت محتوای سایت...</div>;
  return (
    <div className="cms-page">
      <header className="cms-heading">
        <div>
          <h2>مدیریت محتوا</h2>
          <p>خانه ‹ مدیریت محتوا</p>
        </div>
        <a
          className="button button--secondary"
          href="http://localhost:3000"
          target="_blank"
        >
          <Eye />
          مشاهده سایت
        </a>
      </header>
      {tab === "gallery" ? (
        <GalleryEditor
          value={gallery}
          setValue={setGallery}
          selected={selected}
          setSelected={setSelected}
          open={open}
          setOpen={setOpen}
          labels={labels}
          saving={saveGallery.isPending}
          onSave={() => saveGallery.mutate()}
        />
      ) : (
        <HomeEditor
          value={home}
          setValue={setHome}
          saving={saveHome.isPending}
          onSave={() => saveHome.mutate()}
        />
      )}
    </div>
  );
}
function GalleryEditor({
  value,
  setValue,
  selected,
  setSelected,
  open,
  setOpen,
  labels,
  saving,
  onSave,
}: {
  value: GalleryCms;
  setValue: (v: GalleryCms) => void;
  selected: number;
  setSelected: (v: number) => void;
  open: number;
  setOpen: (v: number) => void;
  labels: Array<{ id: number; title: string; slug: string }>;
  saving: boolean;
  onSave: () => void;
}) {
  const [selectedBySection, setSelectedBySection] = useState<Record<number, number>>({});
  const slide = value.hero.slides[selected] ?? value.hero.slides[0];
  const sectionItems: Record<number, Array<{ id: string }>> = {
    0: value.hero.slides,
    1: value.promos,
    2: value.productShelves,
    3: value.genderBanners,
    4: value.collections,
  };
  const activeIndex = open === 0 ? selected : (selectedBySection[open] ?? 0);
  const cardKey = open === 1 ? "promos" : open === 3 ? "genderBanners" : open === 4 ? "collections" : null;
  const activeCard = open === 0 ? slide : cardKey ? value[cardKey][activeIndex] : null;
  const activeShelf = open === 2 ? value.productShelves[activeIndex] : null;
  const preview = activeCard ?? slide;
  const previewImage = activeShelf ? (activeShelf.productImage ?? "") : preview.image;
  const previewTitle = activeShelf?.title ?? preview.title;
  const previewDescription = activeShelf ? "پیش‌نمایش ردیف محصولات انتخاب‌شده" : preview.description;
  const destination = useMemo(() => parseDestination(activeCard?.href ?? activeShelf?.viewAllHref ?? slide.href), [activeCard?.href, activeShelf?.viewAllHref, slide.href]);
  const invalid = Boolean(
    destination.gender && destination.category !== "JEWELRY",
  );
  const patch = (change: Partial<CmsCard>) =>
    setValue({
      ...value,
      hero: {
        slides: value.hero.slides.map((item, index) =>
          index === selected ? { ...item, ...change } : item,
        ),
      },
    });
  const patchActive = (change: Partial<CmsCard>) => {
    if (open === 0) return patch(change);
    if (!cardKey) return;
    setValue({ ...value, [cardKey]: value[cardKey].map((item, index) => index === activeIndex ? { ...item, ...change } : item) });
  };
  const setDestination = (change: Partial<ProductDestination>) => {
    const candidate = { ...destination, ...change };
    if (change.metal === "SILVER" && candidate.category === "COIN") candidate.category = undefined;
    const next = normalizedDestination(candidate);
    if (activeShelf) {
      setValue({ ...value, productShelves: value.productShelves.map((item, index) => index === activeIndex ? { ...item, viewAllHref: destinationHref(next) } : item) });
      return;
    }
    patchActive({ href: destinationHref(next) });
  };
  return (
    <>
      <div className="cms-editor-grid">
        <aside className="cms-preview">
          <h3>
            <Eye />
            پیش‌نمایش بنر
          </h3>
          <div className="banner-preview">
            {previewImage ? <img src={imageSrc(previewImage)} alt="" /> : null}
            <div>
              <h4>{previewTitle}</h4>
              <p>{previewDescription}</p>
              <span>{activeShelf ? "مشاهده همه" : preview.buttonLabel || "مشاهده محصولات"}</span>
            </div>
          </div>
          <dl>
            <div>
              <dt>مکان نمایش</dt>
              <dd>{sections[open] ?? "بخش محتوا"}</dd>
            </div>
            <div>
              <dt>نوع مقصد</dt>
              <dd>صفحه محصولات</dd>
            </div>
            <div>
              <dt>آخرین ویرایش</dt>
              <dd>{new Date(value.updatedAt).toLocaleString("fa-IR")}</dd>
            </div>
          </dl>
        </aside>
        {open === 0 ? <main className="cms-card cms-slide-editor">
          <h3>ویرایش بنر اسلایدر اصلی</h3>
          <label>
            عنوان بنر
            <input
              value={slide.title}
              onChange={(e) => patch({ title: e.target.value })}
            />
          </label>
          <label>
            توضیحات
            <textarea
              value={slide.description}
              onChange={(e) => patch({ description: e.target.value })}
            />
          </label>
          <ImagePicker value={slide.image} onChange={(image) => patch({ image })} />
          <label>
            متن دکمه
            <input
              value={slide.buttonLabel ?? ""}
              onChange={(e) => patch({ buttonLabel: e.target.value })}
            />
          </label>
        </main> : <GalleryExtraEditor section={open} value={value} setValue={setValue} index={activeIndex} />}
        <aside className="cms-sections">
          {sections.map((title, index) => (
            <div key={title}>
              <button onClick={() => setOpen(index)}>
                <GripVertical />
                <span>{title}</span>
                {open === index ? <ChevronUp /> : <ChevronDown />}
              </button>
              {open === index ? (
                <div className="slide-list">
                  {sectionItems[index].map((item, itemIndex) => (
                    <button
                      className={activeIndex === itemIndex ? "active" : ""}
                      key={item.id}
                      onClick={() => index === 0 ? setSelected(itemIndex) : setSelectedBySection((current) => ({ ...current, [index]: itemIndex }))}
                    >
                      {index === 2 ? "ردیف" : "بنر"} {new Intl.NumberFormat("fa-IR").format(itemIndex + 1)}
                      <GripVertical />
                    </button>
                  ))}
                  {index === 3 ? (
                    <div className="cms-section-count-actions">
                      <button
                        type="button"
                        disabled={value.genderBanners.length >= 2}
                        onClick={() => setValue({
                          ...value,
                          genderBanners: [...value.genderBanners, {
                            id: `gender-${Date.now()}`,
                            title: "بنر جنسیتی جدید",
                            description: "",
                            image: "",
                            href: "/products?metal=GOLD&category=JEWELRY",
                            buttonLabel: "مشاهده محصولات",
                          }],
                        })}
                      >افزودن بنر</button>
                      <button
                        type="button"
                        disabled={!value.genderBanners.length}
                        onClick={() => setValue({ ...value, genderBanners: value.genderBanners.filter((_, itemIndex) => itemIndex !== activeIndex) })}
                      >حذف بنر انتخابی</button>
                      <button type="button" onClick={() => setValue({ ...value, genderBanners: [] })}>عدم نمایش</button>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ))}
        </aside>
      </div>
      <section className="destination-builder">
        <h3>
          <Target />
          مقصد بنر
        </h3>
        <div className="destination-types">
          <label>
            <input type="radio" checked readOnly />
            صفحه محصولات
          </label>
          <label>
            <input type="radio" disabled />
            صفحه داخلی
          </label>
          <label>
            <input type="radio" disabled />
            بدون اقدام
          </label>
        </div>
        <div className="destination-grid">
          <label>
            فلز
            <select
              value={destination.metal ?? ""}
              onChange={(e) =>
                setDestination({
                  metal: (e.target.value || undefined) as ProductDestination["metal"],
                })
              }
            >
              <option value="">همه فلزها</option>
              <option value="GOLD">طلا</option>
              <option value="SILVER">نقره</option>
            </select>
          </label>
          <label>
            نوع محصول
            <select
              value={destination.category ?? ""}
              onChange={(e) =>
                setDestination({
                  category: (e.target.value || undefined) as ProductDestination["category"],
                })
              }
            >
              <option value="">همه محصولات</option>
              <option value="JEWELRY">جواهرات</option>
              {destination.metal !== "SILVER" ? <option value="COIN">سکه</option> : null}
              <option value="BULLION">شمش</option>
            </select>
          </label>
          <label>
            جنسیت
            <select
              value={destination.gender ?? ""}
              disabled={destination.category !== "JEWELRY"}
              onChange={(e) =>
                setDestination({
                  gender: (e.target.value || undefined) as ProductDestination["gender"],
                })
              }
            >
              {genders.map(([title, key]) => <option key={key ?? "all"} value={key ?? ""}>{title}</option>)}
            </select>
          </label>
          <label>
            برچسب
            <select
              value={destination.label ?? ""}
              onChange={(e) =>
                setDestination({ label: e.target.value || undefined })
              }
            >
              <option value="">بدون برچسب</option>
              {labels.map((item) => (
                <option key={item.id} value={item.slug}>
                  {item.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="generated-url">
          <button onClick={() => navigator.clipboard.writeText(activeCard?.href ?? activeShelf?.viewAllHref ?? slide.href)}>
            <Copy />
          </button>
          <code>{activeCard?.href ?? activeShelf?.viewAllHref ?? slide.href}</code>
          <span>آدرس تولیدشده</span>
        </div>
        <p className={invalid ? "invalid" : "valid"}>
          {invalid
            ? "انتخاب جنسیت فقط برای نوع محصول جواهرات امکان‌پذیر است"
            : "مقصد معتبر است"}
        </p>
      </section>
      <footer className="cms-actions">
        <button
          className="button button--primary"
          disabled={saving || invalid}
          onClick={onSave}
        >
          <Save />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
        <a
          className="button button--secondary"
          href={`http://localhost:3000${activeCard?.href ?? activeShelf?.viewAllHref ?? slide.href}`}
          target="_blank"
        >
          <Eye />
          پیش‌نمایش
        </a>
      </footer>
    </>
  );
}
function GalleryExtraEditor({
  section,
  value,
  setValue,
  index,
}: {
  section: number;
  value: GalleryCms;
  setValue: (v: GalleryCms) => void;
  index: number;
}) {
  if (section === 2) return <ShelfEditor value={value} setValue={setValue} index={index} />;
  const key =
    section === 1 ? "promos" : section === 3 ? "genderBanners" : "collections";
  const title =
    section === 1
      ? "چهار کارت ویژه زیر دسته‌بندی‌ها"
      : section === 3
        ? "بنرهای جنسیتی"
        : "باکس‌های زیر بنرهای جنسیتی";
  return (
    <CardArrayEditor
      title={title}
      items={value[key]}
      index={index}
      min={key === "collections" ? 4 : undefined}
      max={key === "collections" ? 5 : undefined}
      onChange={(items) => setValue({ ...value, [key]: items })}
    />
  );
}
function CardArrayEditor({
  title,
  items,
  onChange,
  index,
  min,
  max,
}: {
  title: string;
  items: CmsCard[];
  onChange: (v: CmsCard[]) => void;
  index: number;
  min?: number;
  max?: number;
}) {
  const item = items[index] ?? items[0];
  if (!item) return null;
  const patch = (change: Partial<CmsCard>) =>
    onChange(
      items.map((row, i) => (i === index ? { ...row, ...change } : row)),
    );
  return (
    <section className="cms-card extra-editor">
      <header>
        <div>
          <h3>{title}</h3>
          {min && max ? (
            <p>
              حداقل {min} و حداکثر {max} باکس؛ رنگ پس‌زمینه توسط فرانت انتخاب
              می‌شود.
            </p>
          ) : null}
        </div>
      </header>
      <div className="extra-form-grid">
        <label>
          عنوان
          <input
            value={item.title}
            onChange={(e) => patch({ title: e.target.value })}
          />
        </label>
        <label>
          متن دکمه
          <input
            value={item.buttonLabel ?? ""}
            onChange={(e) => patch({ buttonLabel: e.target.value })}
          />
        </label>
        <label className="span-2">
          توضیحات
          <input
            value={item.description}
            onChange={(e) => patch({ description: e.target.value })}
          />
        </label>
        <div className="span-2"><ImagePicker value={item.image} onChange={(image) => patch({ image })} /></div>
      </div>
    </section>
  );
}
function ShelfEditor({
  value,
  setValue,
  index,
}: {
  value: GalleryCms;
  setValue: (v: GalleryCms) => void;
  index: number;
}) {
  const patch = (
    index: number,
    change: Partial<GalleryCms["productShelves"][number]>,
  ) =>
    setValue({
      ...value,
      productShelves: value.productShelves.map((row, i) =>
        i === index ? { ...row, ...change } : row,
      ),
    });
  return (
    <section className="cms-card extra-editor">
      <header>
        <div>
          <h3>دو ردیف پیش‌فرض محصولات</h3>
          <p>
            این دو ردیف زمانی نمایش داده می‌شوند که کاربر با query وارد گالری
            نشده باشد.
          </p>
        </div>
      </header>
      <div className="shelf-editor-grid">
        {value.productShelves.map((shelf, shelfIndex) => shelfIndex === index ? (
          <div key={shelf.id}>
            <h4>ردیف {new Intl.NumberFormat("fa-IR").format(shelfIndex + 1)}</h4>
            <label>
              عنوان
              <input
                value={shelf.title}
                onChange={(e) => patch(shelfIndex, { title: e.target.value })}
              />
            </label>
            <label>
              دسته پیش‌فرض
              <select
                value={shelf.category}
                onChange={(e) => {
                  const category = e.target.value;
                  patch(shelfIndex, {
                    category,
                    viewAllHref: `/products?category=JEWELRY&subtype=${category}`,
                  });
                }}
              >
                <option value="">انتخاب کنید</option>
                {value.categories.items.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </label>
            <ImagePicker value={shelf.productImage ?? ""} onChange={(image) => patch(shelfIndex, { productImage: image || null })} />
          </div>
        ) : null)}
      </div>
    </section>
  );
}
function HomeGalleryEditor({ value, setValue }: { value: HomeCms; setValue: (v: HomeCms) => void }) {
  const [index, setIndex] = useState(0);
  const item = value.gallery.items[index] ?? value.gallery.items[0];
  if (!item) return null;
  const patch = (change: Partial<HomeGalleryItem>) => setValue({
    ...value,
    gallery: { ...value.gallery, items: value.gallery.items.map((row, i) => i === index ? { ...row, ...change } : row) },
  });
  const destination = homeFilterDestination(item);
  const setDestination = (change: Partial<ProductDestination>) => {
    const candidate = { ...destination, ...change };
    if (change.metal === "SILVER" && candidate.category === "COIN") candidate.category = undefined;
    const next = normalizedDestination(candidate);
    const href = destinationHref(next);
    patch({ destination: { type: "PRODUCT_FILTER", value: href.includes("?") ? href.split("?")[1] : "" } });
  };
  return (
    <section className="cms-card extra-editor">
      <header>
        <div><h3>پنج دسته منتخب صفحه خانه</h3><p>عنوان، تصویر و مقصد هر کارت مستقل است؛ رنگ پس‌زمینه را فرانت تعیین می‌کند.</p></div>
        <div className="item-tabs">{value.gallery.items.map((row, i) => <button key={row.id} className={i === index ? "active" : ""} onClick={() => setIndex(i)}>کارت {new Intl.NumberFormat("fa-IR").format(i + 1)}</button>)}</div>
      </header>
      <div className="extra-form-grid">
        <label>عنوان<input value={item.title} onChange={(e) => patch({ title: e.target.value })} /></label>
        <label>توضیحات<input value={item.description} onChange={(e) => patch({ description: e.target.value })} /></label>
        <div className="span-2"><ImagePicker value={item.image} onChange={(image) => patch({ image })} /></div>
        <label>نوع محصول<select value={destination.category ?? ""} onChange={(e) => setDestination({ category: (e.target.value || undefined) as ProductDestination["category"] })}><option value="">همه محصولات</option><option value="JEWELRY">جواهرات</option><option value="COIN">سکه</option><option value="BULLION">شمش</option></select></label>
        <label>جنسیت<select disabled={destination.category !== "JEWELRY"} value={destination.gender ?? ""} onChange={(e) => setDestination({ gender: (e.target.value || undefined) as ProductDestination["gender"] })}>{genders.map(([title, key]) => <option key={key ?? "all"} value={key ?? ""}>{title}</option>)}</select></label>
        <label>فلز<select disabled={destination.category === "COIN"} value={destination.metal ?? ""} onChange={(e) => setDestination({ metal: (e.target.value || undefined) as ProductDestination["metal"] })}><option value="">همه</option><option value="GOLD">طلا</option><option value="SILVER">نقره</option></select></label>
        <label>مقصد تولیدشده<input dir="ltr" readOnly value={destinationHref(destination)} /></label>
      </div>
    </section>
  );
}
function HomeEditor({
  value,
  setValue,
  saving,
  onSave,
}: {
  value: HomeCms;
  setValue: (v: HomeCms) => void;
  saving: boolean;
  onSave: () => void;
}) {
  const [section, setSection] = useState<"hero" | "gallery" | "modules">("hero");
  const [selectedBySection, setSelectedBySection] = useState({ gallery: 0, modules: 0 });
  const galleryItem = value.gallery.items[selectedBySection.gallery] ?? value.gallery.items[0];
  const module = value.modules.items[selectedBySection.modules] ?? value.modules.items[0];
  const preview = section === "hero"
    ? { title: value.hero.title, description: value.hero.description, image: value.hero.image, buttonLabel: value.hero.buttonLabel }
    : section === "gallery"
      ? { title: galleryItem.title, description: galleryItem.description, image: galleryItem.image, buttonLabel: "مشاهده محصولات" }
      : { title: module.title, description: module.description, image: module.image, buttonLabel: module.buttonLabel };
  const patchHero = (change: Partial<HomeCms["hero"]>) => setValue({ ...value, hero: { ...value.hero, ...change } });
  const patchGallery = (change: Partial<HomeGalleryItem>) => setValue({ ...value, gallery: { ...value.gallery, items: value.gallery.items.map((item, index) => index === selectedBySection.gallery ? { ...item, ...change } : item) } });
  const patchModule = (change: Partial<HomeCms["modules"]["items"][number]>) => setValue({ ...value, modules: { ...value.modules, items: value.modules.items.map((item, index) => index === selectedBySection.modules ? { ...item, ...change } : item) } });
  const galleryDestinationValue = section === "gallery" ? homeFilterDestination(galleryItem) : {};
  const setGalleryDestination = (change: Partial<ProductDestination>) => {
    const candidate = { ...galleryDestinationValue, ...change };
    if (change.metal === "SILVER" && candidate.category === "COIN") candidate.category = undefined;
    const href = destinationHref(normalizedDestination(candidate));
    patchGallery({ destination: { type: "PRODUCT_FILTER", value: href.includes("?") ? href.split("?")[1] : "" } });
  };
  return (
    <>
      <div className="cms-editor-grid home-editor-grid">
        <aside className="cms-preview">
          <h3><Eye />پیش‌نمایش خانه</h3>
          <div className="banner-preview">
            {preview.image ? <img src={imageSrc(preview.image)} alt="" /> : null}
            <div>
              <h4>{preview.title}</h4><p>{preview.description}</p><span>{preview.buttonLabel}</span>
            </div>
          </div>
          <dl><div><dt>بخش</dt><dd>{section === "hero" ? "بنر اصلی" : section === "gallery" ? "دسته‌های منتخب" : "ماژول‌ها"}</dd></div><div><dt>آخرین ویرایش</dt><dd>{new Date(value.updatedAt).toLocaleString("fa-IR")}</dd></div></dl>
        </aside>
        <main className="cms-card cms-slide-editor">
          <h3>{section === "hero" ? "ویرایش بنر اصلی" : section === "gallery" ? "ویرایش دسته منتخب" : "ویرایش ماژول"}</h3>
          {section === "hero" ? <>
            <label>عنوان<input value={value.hero.title} onChange={(e) => patchHero({ title: e.target.value })}/></label>
            <label>عنوان برجسته<input value={value.hero.highlightedTitle} onChange={(e) => patchHero({ highlightedTitle: e.target.value })}/></label>
            <label>توضیحات<textarea value={value.hero.description} onChange={(e) => patchHero({ description: e.target.value })}/></label>
            <ImagePicker value={value.hero.image} onChange={(image) => patchHero({ image })}/>
            <label>متن دکمه<input value={value.hero.buttonLabel} onChange={(e) => patchHero({ buttonLabel: e.target.value })}/></label>
          </> : section === "gallery" ? <>
            <label>عنوان<input value={galleryItem.title} onChange={(e) => patchGallery({ title: e.target.value })}/></label>
            <label>توضیحات<textarea value={galleryItem.description} onChange={(e) => patchGallery({ description: e.target.value })}/></label>
            <ImagePicker value={galleryItem.image} onChange={(image) => patchGallery({ image })}/>
          </> : <>
            <label className="module-toggle"><input type="checkbox" checked={module.enabled} onChange={(e) => patchModule({ enabled: e.target.checked })}/>نمایش ماژول</label>
            <label>عنوان<input value={module.title} onChange={(e) => patchModule({ title: e.target.value })}/></label>
            <label>توضیحات<textarea value={module.description} onChange={(e) => patchModule({ description: e.target.value })}/></label>
            <ImagePicker value={module.image} onChange={(image) => patchModule({ image })}/>
            <label>متن دکمه<input value={module.buttonLabel} onChange={(e) => patchModule({ buttonLabel: e.target.value })}/></label>
          </>}
        </main>
        <aside className="cms-sections home-sections">
          {[{key:"hero",title:"بنر اصلی",items:["بنر ۱"]},{key:"gallery",title:"دسته‌های منتخب",items:value.gallery.items.map((_,i)=>`کارت ${new Intl.NumberFormat("fa-IR").format(i+1)}`)},{key:"modules",title:"ماژول‌ها",items:value.modules.items.map((_,i)=>`ماژول ${new Intl.NumberFormat("fa-IR").format(i+1)}`)}].map((group) => <div key={group.key}>
            <button onClick={() => setSection(group.key as typeof section)}><GripVertical/><span>{group.title}</span>{section === group.key ? <ChevronUp/> : <ChevronDown/>}</button>
            {section === group.key ? <div className="slide-list">{group.items.map((title,index)=><button key={title} className={(group.key === "hero" || selectedBySection[group.key as "gallery"|"modules"] === index) ? "active" : ""} onClick={() => group.key !== "hero" && setSelectedBySection((current)=>({...current,[group.key]:index}))}>{title}<GripVertical/></button>)}</div>:null}
          </div>)}
        </aside>
      </div>
      <section className="destination-builder home-destination-builder">
        <h3><Target/>مقصد</h3>
        {section === "hero" ? <div className="destination-grid"><label>نوع مقصد<select value={value.hero.destination.type} onChange={(e)=>patchHero({destination:{type:e.target.value,value:e.target.value==="PRODUCTS"?null:null}})}><option value="PRODUCTS">گالری محصولات</option><option value="HOME">صفحه خانه</option></select></label></div> : section === "gallery" ? <div className="destination-grid">
          <label>فلز<select value={galleryDestinationValue.metal ?? ""} onChange={(e)=>setGalleryDestination({metal:(e.target.value||undefined) as ProductDestination["metal"]})}><option value="">همه فلزها</option><option value="GOLD">طلا</option><option value="SILVER">نقره</option></select></label>
          <label>نوع محصول<select value={galleryDestinationValue.category ?? ""} onChange={(e)=>setGalleryDestination({category:(e.target.value||undefined) as ProductDestination["category"]})}><option value="">همه محصولات</option><option value="JEWELRY">جواهرات</option>{galleryDestinationValue.metal!=="SILVER"?<option value="COIN">سکه</option>:null}<option value="BULLION">شمش</option></select></label>
          <label>جنسیت<select disabled={galleryDestinationValue.category!=="JEWELRY"} value={galleryDestinationValue.gender??""} onChange={(e)=>setGalleryDestination({gender:(e.target.value||undefined) as ProductDestination["gender"]})}>{genders.map(([title,key])=><option key={key??"all"} value={key??""}>{title}</option>)}</select></label>
        </div> : <div className="destination-grid">
          <label>نوع مقصد<select value={module.destination.type} onChange={(e)=>patchModule({destination:{type:e.target.value,value:e.target.value==="EXTERNAL"?"https://":module.key}})}><option value="MODULE">صفحه داخلی سایت</option><option value="EXTERNAL">سایت دیگر</option></select></label>
          <label>{module.destination.type==="EXTERNAL"?"آدرس کامل سایت":"مسیر داخلی"}<input dir="ltr" value={module.destination.value??""} onChange={(e)=>patchModule({destination:{...module.destination,value:e.target.value}})}/></label>
        </div>}
      </section>
      <footer className="cms-actions">
        <button
          className="button button--primary"
          disabled={saving}
          onClick={onSave}
        >
          <Save />
          {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </button>
      </footer>
    </>
  );
}
