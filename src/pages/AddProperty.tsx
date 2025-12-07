import { useState, useRef, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import LocationPickerDialog from "@/components/LocationPickerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import 'react-toastify/dist/ReactToastify.css';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Upload, MapPin, X } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import nablusVideo from "@/assets/nablus.mp4";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";

import { storage } from "@/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { apiFetch } from "@/api/apiFetch";

const API_BASE = "http://easyaqar.org/api";

// Helper function to safely format coordinates
const formatCoordinate = (coord: number | string | undefined | null): string => {
  if (coord === null || coord === undefined || coord === '') {
    return '0.000000';
  }
  const num = typeof coord === 'number' ? coord : Number(coord);
  if (isNaN(num)) {
    return '0.000000';
  }
  return num.toFixed(6);
};

/*************  ✨ Windsurf Command ⭐  *************/
/**
 * AddProperty component is responsible for rendering the form to add a new property listing.
 * It includes fields for location, description, title, price, area, bedrooms, bathrooms, parking, year built, furnished, and media uploads.
 * After submitting the form, it sends a POST request to the API to create a new property listing.
 */
/*******  08f16347-5fa7-4050-a838-5513cceed4d2  *******/
const AddProperty = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const isRTL = language === "AR";

  // حالة ظهور فورم إضافة العقار
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // بيانات العقار الأساسية
  const [furnished, setFurnished] = useState(false);
  const [descriptionAr, setDescriptionAr] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [titleAR, setTitleAr] = useState("");
  const [titleEN, settitleEn] = useState("");
  const [bedrooms, setBedrooms] = useState<number>(0);
  const [bathrooms, setBathrooms] = useState<number>(0);
  const [parking, setParking] = useState<number>(0);
  const [listingType, setListingType] = useState(""); // sale / rent
  const [propertyType, setPropertyType] = useState("");
  const [price, setPrice] = useState<number | "">("");
  const [area, setArea] = useState<number>(0);
  const [yearBuilt, setYearBuilt] = useState<number | "">("");

  // حالة الموقع (من الـ LocationPicker)
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>({
    lat: 0,
    lng: 0,
    address: ""
  });

  // الدول و المدن (states الجديدة المطلوبة)
  const [countries, setCountries] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string | number>("");
  const [selectedCity, setSelectedCity] = useState<string | number>("");

  // الملفات المرفوعة
  const [uploadedFiles, setUploadedFiles] = useState<
    { type: "image" | "video"; file: File; preview: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // تحقق بسيط قبل السماح بالإرسال
  const canSubmit =
    location !== null && uploadedFiles.some((file) => file.type === "image");

  // تعطيل حقول بناءً على نوع العقار
  const isFieldDisabled = (field: string) => {
    if (propertyType === "land") {
      return [
        "bedrooms",
        "bathrooms",
        "parking",
        "yearBuilt",
        "furnished",
      ].includes(field);
    }
    if (propertyType === "office") {
      return ["bedrooms"].includes(field);
    }
    if (propertyType === "shop") {
      return ["parking"].includes(field);
    }
    return false;
  };

  const fetchCountries = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/locations/countries?page=0&size=100"`, {
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
    if (!countryId) {
      setCities([]);
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE}/locations/cities/country/${countryId}?page=0&size=100`,
        {
          method: "GET", 
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const json = await res.json();
      const list = Array.isArray(json.content) ? json.content : [];
      setCities(list);
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setCities([]);
    }
  };
  useEffect(() => {
    if (showAddForm) {
      fetchCountries();
    }
    // إذا أردت تحميل الدول عند بداية تحميل الصفحة بدل فتح الفورم ضع [] كـ dependency
  }, [showAddForm]);

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

  // رفع الملفات (Firebase) كما كان عندك
  // ***************************************************
  const uploadMediaToFirebase = async () => {
    const uploadPromises = uploadedFiles.map(async (item) => {
      const fileRef = ref(storage, `properties/${Date.now()}-${item.file.name}`);
      await uploadBytes(fileRef, item.file);
      return await getDownloadURL(fileRef);
    });

    return await Promise.all(uploadPromises);
  };

  // handlers للعديد من التفاعلات
  // ***************************************************
  const handleLocationSelected = (selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setLocation(selectedLocation);
    toast({
      title: t("propertyCard.locationRetrieved"),
      description: selectedLocation.address,
    });
    setShowLocationPicker(false);
    setShowAddForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles((prev) => [
          ...prev,
          {
            type: file.type.startsWith("video/") ? "video" : "image",
            file,
            preview: reader.result as string,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDialogClose = (open: boolean) => {
    setShowAddForm(open);
    if (!open) {
      // عند إغلاق نافذة التفاصيل، نمسح الملفات المحمّلة
      setUploadedFiles([]);
    }
  };

  const handleLocationPickerClose = (open: boolean) => {
    setShowLocationPicker(open);
  };

  // ***************************************************
  // ارسال الفورم الى الباكند مع cityId الواقعي
  // ***************************************************
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const mediaUrls = await uploadMediaToFirebase();

    try {
      const body = {
        // نرسل cityId كـ number لو متوفر
        cityId: selectedCity ? Number(selectedCity) : undefined,
        countryId: selectedCountry ? Number(selectedCountry) : undefined,
        propertyType: propertyType,
        listingType: listingType,
        title: titleEN,
        titleAr: titleAR,
        description: descriptionEn,
        descriptionAr: descriptionAr,
        price: Number(price) || 0,
        area: Number(area) || 0,
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        parking: parking,
        yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
        furnished: furnished,
        latitude: typeof location.lat === 'number' ? location.lat : Number(location.lat || 0),
        longitude: typeof location.lng === 'number' ? location.lng : Number(location.lng || 0),
        mediaUrls: mediaUrls,
      };

      const response = await fetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (!response.ok) {
        toast({
          title: "خطأ",
          description: "فشل إضافة العقار",
          variant: "destructive",
        });
        console.error("Error adding property:", data);
        return;
      }

      // نجاح الإضافة
      toast({ title: t("dashboard.approve"), description: "تم إضافة العقار بنجاح" });
      setUploadedFiles([]);
      setShowAddForm(false);

    } catch (error: any) {
      console.error(error);
      toast({ title: "خطأ", description: "حدث خطأ داخلي" , variant: "destructive" });
    }
  };

  // دالة مساعدة لاختيار الاسم المعروض حسب اللغة
  const displayName = (item: any) => {
    // إذا اللغة عربية نعرض nameAr، وإلا نعرض name
    if (String(language).toLowerCase().startsWith("ar")) return item.nameAr || item.name || "";
    return item.name || item.nameAr || "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">{t("addPropertyPage.headerTitle")}</h1>
            <p className="text-muted-foreground text-lg mb-6">{t("addPropertyPage.headerSubtitle")}</p>
            <Button size="lg" className="gradient-accent" onClick={() => setShowLocationPicker(true)}>
              <PlusCircle className={`w-5 h-5 ${isRTL ? "mr-2" : "ml-2"}`} />
              {t("addPropertyPage.addButton")}
            </Button>
          </div>
        </div>
      </main>

      <LocationPickerDialog
        open={showLocationPicker}
        onOpenChange={handleLocationPickerClose}
        onLocationSelected={handleLocationSelected}
        initialLocation={location}
      />

      <Dialog open={showAddForm && !!location} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{t("navbar.add_property")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>{t("propertyCard.location")}</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder={location?.address || t("propertyCard.location")}
                  value={location?.address || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowLocationPicker(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t("propertyCard.editLocation")}
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t("propertyCard.descriptionAr")}</Label>
                <Textarea id="descriptionAr" placeholder={t("...")} onChange={(e) => setDescriptionAr(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">{t("propertyCard.descriptionEn")}</Label>
                <Textarea id="descriptionEn" placeholder={t("...")} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleAr">{t("propertyCard.TitleAr")}</Label>
                <Textarea id="TitleAr" placeholder={t("propertyCard.TitleAr")} onChange={(e) => setTitleAr(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleEn">{t("propertyCard.TitleEn")}</Label>
                <Textarea id="TitleEn" placeholder={t("propertyCard.TitleEn")} onChange={(e) => settitleEn(e.target.value)} rows={3} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
             <Select value={listingType} onValueChange={(value) => setListingType(value)}>
  <SelectTrigger>
    <SelectValue placeholder={t("propertyCard.offerType")} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="sale">{t("propertyCard.forSale")}</SelectItem>
    <SelectItem value="rent">{t("propertyCard.forRent")}</SelectItem>
  </SelectContent>
</Select>

              <Select value={propertyType} onValueChange={(value) => setPropertyType(value)}>
  <SelectTrigger>
    <SelectValue placeholder={t("propertyCard.propertyType")} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="apartment">{t("categories.apartments")}</SelectItem>
    <SelectItem value="villa">{t("categories.villas")}</SelectItem>
    <SelectItem value="land">{t("categories.lands")}</SelectItem>
    <SelectItem value="office">{t("categories.offices")}</SelectItem>
    <SelectItem value="shop">{t("categories.shops")}</SelectItem>
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
                    <SelectItem key={c.id} value={c.id}>
                      {displayName(c)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Dropdown المدن */}
            <div className="space-y-2">
              <Label htmlFor="city">{t("propertyCard.city")}</Label>
              <Select
                value={String(selectedCity)}
                onValueChange={(value) => setSelectedCity(value)}
                disabled={!selectedCountry}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("propertyCard.selectCity")} />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {displayName(city)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("propertyCard.price")}</Label>
                <Input id="price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t("propertyCard.area")}</Label>
                <Input id="area" type="number" placeholder="0"   onChange={(e) => setArea(Number(e.target.value))} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">{t("propertyCard.bedrooms")}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="0"
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                  disabled={isFieldDisabled("bedrooms")}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bathrooms">{t("propertyCard.bathrooms")}</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  placeholder="0"
                    onChange={(e) => setBathrooms(Number(e.target.value))}
                  disabled={isFieldDisabled("bathrooms")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">{t("propertyCard.parking")}</Label>
                <Input
                  id="parking"
                  type="number"
                  placeholder="0"
                    onChange={(e) => setParking(Number(e.target.value))}
                  disabled={isFieldDisabled("parking")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">{t("propertyCard.yearBuilt")}</Label>
                <Input
                  id="yearBuilt"
                  type="number"
                  placeholder="2024"
                   onChange={(e) => setYearBuilt(Number(e.target.value))}
                  disabled={isFieldDisabled("yearBuilt")}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="furnished"
                checked={furnished}
                onCheckedChange={(checked) => setFurnished(checked as boolean)}
                disabled={isFieldDisabled("furnished")}
              />
              <Label htmlFor="furnished" className="cursor-pointer">{t("propertyCard.furnished")}</Label>
            </div>

            <div className="space-y-2">
              <Label>{t("propertyCard.upload")}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("propertyCard.selectFiles")}</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.type === "image" ? (
                        <img src={item.preview} alt={`Upload ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                      ) : (
                        <video src={item.preview} className="w-full h-24 object-cover rounded-lg" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className={`absolute top-1 ${isRTL ? "left-1" : "right-1"} bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground"><strong>{t("propertyCard.note")}</strong></p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 gradient-primary" disabled={!canSubmit}>{t("dashboard.approve")}</Button>

              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)}>{t("dashboard.reject")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AddProperty;
