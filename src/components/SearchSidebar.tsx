import { useState,useEffect } from "react";
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
const API_BASE = "http://easyaqar.org/api";
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

 const displayName = (item: any) => {
    if (String(language).toLowerCase().startsWith("ar")) return item.nameAr || item.name || "";
    return item.name || item.nameAr || "";
  };
const fetchCountries = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/locations/countries?page=0&size=20`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",

      });
      console.log("Fetch countries response status:", data.status);
      const list = data?.content ? data.content : (Array.isArray(data) ? data : []);
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
        }
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
            z-50 sm:hidden
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
          className="sm:hidden absolute top-4 right-4 bg-gray-200 p-1 rounded-full"
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

  <Select
    value={propertyType}
    onValueChange={setPropertyType}
  >
    <SelectTrigger className="w-full h-12 rounded-lg border border-gray-300 bg-gray-50 focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f] transition-all">
      <SelectValue placeholder={t("propertyCard.propertyType")} />
    </SelectTrigger>

    <SelectContent>
      <SelectItem value="APARTMENT">
        {t("categories.APARTMENT")}
      </SelectItem>
      <SelectItem value="HOUSE">
        {t("categories.HOUSE")}
      </SelectItem>
      <SelectItem value="LAND">
        {t("categories.LAND")}
      </SelectItem>
      <SelectItem value="OFFICE">
        {t("categories.OFFICE")}
      </SelectItem>
      <SelectItem value="STORE">
        {t("categories.STORE")}
      </SelectItem>
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
          {language === "AR" ? city.nameAr : city.nameEn}
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
              className="bg-gray-50 border border-gray-300 rounded-lg focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f] transition-all"
            />
            <Input
              type="number"
              placeholder={t("propertyCard.to")}
              className="bg-gray-50 border border-gray-300 rounded-lg focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f] transition-all"
            />
          </div>
        </div>

        {/* زر البحث */}
        <Button className="w-full bg-gradient-to-r from-[#0d3d7f] to-[#1e69c8] hover:from-[#1e69c8] hover:to-[#0d3d7f] text-white font-bold py-3 rounded-xl shadow-md transition-all">
          {t("propertyCard.search")}
        </Button>

        {/* المساحة الفاضية */}
        <div className="h-32" />
      </aside>
    </>
  );
  
};

export default SearchSidebar;
