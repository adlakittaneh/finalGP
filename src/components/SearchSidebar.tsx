import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch } from "@/api/apiFetch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import PropertyCard from "@/components/PropertyCard";

const API_BASE = "/api";
const SearchSidebar = () => {
  const { language } = useLanguage();
  const isRTL = language === "AR";
  const { t } = useTranslation();
  const [propertyType, setPropertyType] = useState("");
  const [open, setOpen] = useState(true);
  const [cities, setCities] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [selectedCity, setSelectedCity] = useState<string | number>("");
  const [selectedCountry, setSelectedCountry] = useState<string | number>("");
  const [results, setResults] = useState<any[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // فلاتر السعر (لأنك حاطة inputs)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const displayName = (item: any) => {
    if (String(language).toLowerCase().startsWith("ar"))
      return item.nameAr || item.name || "";
    return item.name || item.nameAr || "";
  };
  const leSearchSidebar = async (pageNumber = 0) => {
    try {
      const params = new URLSearchParams();

      if (selectedCity) params.append("cityId", String(selectedCity));
      if (propertyType) params.append("propertyType", propertyType);
      if (minPrice) params.append("minPrice", minPrice);
      if (maxPrice) params.append("maxPrice", maxPrice);
      // pagination (مطلوبة)
      params.append("page", String(pageNumber));
      params.append("size", "6");
      const data = await apiFetch(`${API_BASE}/listings?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      setResults(data.content || []);
      setTotalPages(data.totalPages || 0);
      setPage(data.number || 0);
      setOpenDialog(true);
    } catch (err) {
      console.error("SearchSidebar error:", err);
    }
  };

  const fetchCountries = async () => {
    try {
      const data = await apiFetch(
        `${API_BASE}/locations/countries?page=0&size=20`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );
      console.log("Fetch countries response status:", data.status);
      const list = data?.content
        ? data.content
        : Array.isArray(data)
          ? data
          : [];
      setCountries(list);
    } catch (err) {
      console.error("Failed to fetch countries:", err);
      setCountries([]);
    }
  };
  const fetchCities = async (countryId: string | number) => {
    try {
      const data = await apiFetch(
        `${API_BASE}/locations/cities/country/${countryId}?page=0&size=20`,
        {
          method: "GET",
        },
      );

      const list = data?.content ? data.content : [];
      setCities(list);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setCities([]);
    }
  };
  // عند تغيير الدولة المحددة نجيب مدنها
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
      // في حالة تغيير الدولة نعيد تعيين المدينة المحددة
      setSelectedCity("");
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry]);
  useEffect(() => {
    fetchCountries();
  }, []);
  return (
    <>
      {/* زر صغير للفتح عند الشاشات الصغيرة */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className={`
            fixed top-20 ${isRTL ? "right-0" : "left-0"}
            bg-primary text-white p-2 rounded-tr-lg rounded-br-lg
            z-50 lg:hidden
          `}
        >
          {isRTL ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      )}

      {/* السايد بار */}
      <aside
        className={`
          fixed top-16 ${isRTL ? "right-0" : "left-0"}
          h-screen
          w-72 sm:w-80 md:w-72
          bg-white/50 backdrop-blur-md
          z-50
          px-6 sm:px-8 py-8
          overflow-y-auto
          ${isRTL ? "text-right" : "text-left"}
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : isRTL ? "translate-x-full" : "-translate-x-full"}
        `}
      >
        {/* زر غلق على الشاشات الصغيرة */}
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden absolute top-4 right-4 bg-gray-200 p-1 rounded-full"
        >
          <X size={20} />
        </button>

        {/* العنوان */}
        <h3
          className="text-2xl font-extrabold mb-12 mt-24"
          style={{
            background: "linear-gradient(90deg, #f9c948, #144993)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {t("propertyCard.Search filtering")}
        </h3>
        {/* نوع العقار */}
        <div className="mb-8">
          <Label className="block text-sm font-semibold text-gray-600 mb-2">
            {t("propertyCard.propertyType")}
          </Label>

          <Select value={propertyType} onValueChange={setPropertyType}>
            <SelectTrigger className="w-full h-12 rounded-lg border border-gray-300 bg-gray-50 focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f] transition-all">
              <SelectValue placeholder={t("propertyCard.propertyType")} />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="APARTMENT">
                {t("categories.APARTMENT")}
              </SelectItem>
              <SelectItem value="HOUSE">{t("categories.HOUSE")}</SelectItem>
              <SelectItem value="LAND">{t("categories.LAND")}</SelectItem>
              <SelectItem value="OFFICE">{t("categories.OFFICE")}</SelectItem>
              <SelectItem value="STORE">{t("categories.STORE")}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Dropdown الدول */}
        <div className="space-y-2">
          <Label htmlFor="country">{t("propertyCard.Country")}</Label>
          <Select
            value={String(selectedCountry)}
            onValueChange={(value) => setSelectedCountry(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder={t("propertyCard.selectCountry")} />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {displayName(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* المدينة */}
        <div className="mb-8 mt-8">
          <Label className="block text-sm font-semibold text-gray-600 mb-2">
            {t("propertyCard.city")}
          </Label>

          <Select
            value={String(selectedCity)}
            onValueChange={(value) => setSelectedCity(value)}
          >
            <SelectTrigger className="w-full h-12 rounded-lg border border-gray-300 bg-gray-50 focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f] transition-all">
              <SelectValue placeholder={t("propertyCard.selectCity")} />
            </SelectTrigger>

            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={String(city.id)}>
                  {language === "AR"
                    ? city.nameAr || city.name
                    : city.name || city.nameAr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* السعر */}
        <div className="mb-10">
          <Label className="block text-sm font-semibold text-gray-600 mb-3">
            {t("propertyCard.price")}
          </Label>

          <div className="flex gap-4">
            <Input
              type="number"
              placeholder={t("propertyCard.from")}
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />

            <Input
              type="number"
              placeholder={t("propertyCard.to")}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* زر البحث */}
        <Button onClick={() => leSearchSidebar(0)}>
          {t("propertyCard.search")}
        </Button>

        {/* المساحة الفاضية */}
        <div className="h-32" />
      </aside>
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-6xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {t("propertyCard.searchResults")}
            </DialogTitle>
          </DialogHeader>

          {/* في حال ما في نتائج */}
          {results.length === 0 && (
            <div className="text-center text-gray-500 py-20">
              {t("propertyCard.noResults")}
            </div>
          )}

          {/* عرض العقارات باستخدام PropertyCard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {results.map((prop) => (
             <PropertyCard
                                 id={String(prop.id)}
                                 userId={1}
                                 type={prop.listingType || "SELL"}
                                 title={prop.title || ""}
                                 titleAr={prop.titleAr || ""}
                                 propertyType={prop.propertyType || ""}
                                 city={prop.cityName || ""}
                                 capital={prop.countryName || ""}
                                 price={prop.price || 0}
                                 area={prop.area || 0}
                                 bedrooms={prop.bedrooms || 0}
                                 bathrooms={prop.bathrooms || 0}
                                 parking={prop.parking || 0}
                                 yearBuilt={prop.yearBuilt || undefined}
                                 furnished={prop.furnished || false}
                                  images={[]}
                                mediaFromAPI={prop.media || []}
                                englishDescription={prop.description}
                                arabicDescription={prop.descriptionAr}                                 
                               />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-8">
              <Button
                disabled={page === 0}
                onClick={() => leSearchSidebar(page - 1)}
              >
                {t("common.prev")}
              </Button>

              <span className="text-sm text-gray-500">
                {page + 1} / {totalPages}
              </span>

              <Button
                disabled={page + 1 >= totalPages}
                onClick={() => leSearchSidebar(page + 1)}
              >
                {t("common.next")}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SearchSidebar;
