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
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/LanguageContext";
import { storage } from "@/firebase";
import { apiFetch } from "@/api/apiFetch";
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
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

const AddProperty = () => {
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
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
const [lat, setLat] = useState<number | null>(null);
const [lng, setLng] = useState<number | null>(null);
const [fullAddress, setFullAddress] = useState<string>("");
const [openMap, setOpenMap] = useState(false);

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
const canSubmit = fullAddress && uploadedFiles.some((file) => file.type === "image");


  // تعطيل حقول بناءً على نوع العقار
  const isFieldDisabled = (field: string) => {
    if (propertyType === "LAND") {
      return [
        "bedrooms",
        "bathrooms",
        "parking",
        "yearBuilt",
        "furnished",
      ].includes(field);
    }
    if (propertyType === "OFFICE") {
      return ["bedrooms"].includes(field);
    }
    if (propertyType === "STORE") {
      return ["parking"].includes(field);
    }
    return false;
  };

//لتحويل الإحداثيات إلى عنوان كامل باستخدام Google Geocoding API
const getAddressFromCoordinates = async (lat: number, lng: number): Promise<string> => {
  if (!GOOGLE_API_KEY) return "";

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ar&region=ps`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.results || data.results.length === 0) return "";

  // دور على Result فيه City أو Country
  const bestResult = data.results.find((r: any) =>
    r.address_components.some((c: any) =>
      c.types.includes("locality") ||
      c.types.includes("administrative_area_level_2")
    )
  ) || data.results[data.results.length - 1];

  let street = "";
  let city = "";
  let country = "";

  bestResult.address_components.forEach((c: any) => {
    if (c.types.includes("route")) street = c.long_name;
    if (c.types.includes("locality")) city = c.long_name;
    if (!city && c.types.includes("administrative_area_level_2")) city = c.long_name;
    if (c.types.includes("country")) country = c.long_name;
  });

  const parts = [];
  if (street) parts.push(street);
  if (city) parts.push(city);
  if (country) parts.push(country);

  // لو ما في شارع → مدينة + دولة (وهذا طبيعي)
  return parts.length ? parts.join("، ") : bestResult.formatted_address;
};

  const fetchCountries = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/locations/countries?page=0&size=100`, {
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
    const data = await apiFetch(
      `${API_BASE}/locations/cities/country/${countryId}?page=0&size=100`,
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

const [isAddressEditable, setIsAddressEditable] = useState(false);

const handleLocationSelected = async (selectedLocation: { lat: number; lng: number; address: string }) => {
  setLocation(selectedLocation);

  const address = selectedLocation.address?.trim() || '';
  const isCoordinates = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address);
  const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/.test(address.replace(/\s+/g, ''));

  if (isCoordinates || !address || isPlusCode) {
    try {
      const detailedAddress = await getAddressFromCoordinates(selectedLocation.lat, selectedLocation.lng);
      const stillCoordinatesOrPlus = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(detailedAddress) ||
                                     /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/.test(detailedAddress.replace(/\s+/g, ''));

      if (detailedAddress && !stillCoordinatesOrPlus) {
        setFullAddress(detailedAddress);
        setIsAddressEditable(false); // العنوان دقيق → لا يمكن تعديله
        toast({ title: "تم الحصول على الموقع", description: detailedAddress });
      } else {
        setFullAddress(address);
        setIsAddressEditable(true); // غير دقيق → اجعل الانبوت قابل للتعديل
        toast({
          title: "تحذير",
          description: "العنوان غير دقيق، يرجى إدخاله يدوياً",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error(err);
      setFullAddress(address);
      setIsAddressEditable(true); // فشل → اجعل الانبوت قابل للتعديل
      toast({
        title: "خطأ",
        description: "فشل الحصول على العنوان المفصل. يرجى إدخاله يدوياً",
        variant: "destructive",
      });
    }
  } else {
    setFullAddress(address);
    setIsAddressEditable(false); // العنوان دقيق → لا يمكن تعديله
    toast({ title: "تم الحصول على الموقع", description: address });
  }

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
// دالة رفع الملفات على Firebase
const uploadMediaToFirebase = async (
  uploadedFiles: { type: "image" | "video"; file: File; preview: string }[],
  onProgress?: (fileName: string, progress: number) => void
) => {
  const uploadPromises = uploadedFiles.map((item) =>
    new Promise<string | null>((resolve) => {
      if (!item.file) return resolve(null);

      const fileRef = ref(storage, `properties/${Date.now()}-${item.file.name}`);
      const uploadTask = uploadBytesResumable(fileRef, item.file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(item.file.name, progress);
        },
        (error) => {
          console.error(`فشل رفع الملف ${item.file.name}:`, error);
          resolve(null);
        },
        async () => {
          try {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          } catch (err) {
            console.error(`فشل الحصول على رابط الملف ${item.file.name}:`, err);
            resolve(null);
          }
        }
      );
    })
  );

  const results = await Promise.all(uploadPromises);
  return results.filter((url): url is string => url !== null); // type guard
};

// دالة إرسال الفورم للباكند بعد رفع الملفات
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!uploadedFiles.length) {
    toast({
      title: "خطأ",
      description: "يرجى رفع صورة واحدة على الأقل",
      variant: "destructive",
    });
    return;
  }

  try {
    // رفع الملفات على Firebase
    const mediaUrls = await uploadMediaToFirebase(uploadedFiles, (fileName, progress) => {
      console.log(`${fileName} رفع: ${Math.round(progress)}%`);
    });

    console.log("روابط الملفات المرفوعة:", mediaUrls);

    // بناء البيانات للإرسال للباكند
    const body = {
      cityId: selectedCity ? Number(selectedCity) : undefined,
      countryId: selectedCountry ? Number(selectedCountry) : undefined,
      propertyType,
      listingType,
      title: titleEN,
      titleAr: titleAR,
      description: descriptionEn,
      descriptionAr,
      price: Number(price) || 0,
      area: Number(area) || 0,
      bedrooms,
      bathrooms,
      parking,
      yearBuilt: yearBuilt ? Number(yearBuilt) : undefined,
      furnished,
      latitude: typeof location.lat === "number" ? location.lat : Number(location.lat || 0),
      longitude: typeof location.lng === "number" ? location.lng : Number(location.lng || 0),
      mediaUrls, // روابط الملفات بعد رفعها على Firebase
    };

    // إرسال البيانات للباكند
   const response = await apiFetch(`${API_BASE}/listings`, {
  method: "POST",
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
    toast({
      title: t("dashboard.approve"),
      description: "تم إضافة العقار بنجاح",
    });

    // إعادة تعيين الملفات والفورم
    setUploadedFiles([]);
    setShowAddForm(false);

  } catch (error: any) {
    console.error("حدث خطأ أثناء العملية:", error);
    toast({
      title: "خطأ",
      description: "حدث خطأ أثناء رفع الملفات أو إرسال البيانات",
      variant: "destructive",
    });
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

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">{t("addPropertyPage.headerTitle")}</h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">{t("addPropertyPage.headerSubtitle")}</p>
            <Button size="lg" className="gradient-accent w-full sm:w-auto" onClick={() => setShowLocationPicker(true)}>
              <PlusCircle className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "mr-2" : "ml-2"}`} />
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
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl">{t("navbar.add_property")}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <Label>{t("propertyCard.location")}</Label>
              <div className="flex flex-col sm:flex-row gap-2">
             <Input
               key={isAddressEditable ? "editable" : "readonly"} 
              id="location"
              placeholder={location?.address || t("propertyCard.location")}
              value={fullAddress}
              readOnly={!isAddressEditable}
              onChange={(e) => setFullAddress(e.target.value)}
              className="flex-1 text-sm sm:text-base"
             />


                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowLocationPicker(true);
                  }}
                  className="flex items-center gap-2 w-full sm:w-auto"
                >
                  <MapPin className="w-4 h-4" />
                  {t("propertyCard.editLocation")}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t("propertyCard.descriptionAr")}</Label>
                <Textarea id="descriptionAr" placeholder={t("...")} onChange={(e) => setDescriptionAr(e.target.value)} rows={3} className="text-sm sm:text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">{t("propertyCard.descriptionEn")}</Label>
                <Textarea id="descriptionEn" placeholder={t("...")} onChange={(e) => setDescriptionEn(e.target.value)} rows={3} className="text-sm sm:text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleAr">{t("propertyCard.TitleAr")}</Label>
                <Textarea id="TitleAr" placeholder={t("propertyCard.TitleAr")} onChange={(e) => setTitleAr(e.target.value)} rows={3} className="text-sm sm:text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleEn">{t("propertyCard.TitleEn")}</Label>
                <Textarea id="TitleEn" placeholder={t("propertyCard.TitleEn")} onChange={(e) => settitleEn(e.target.value)} rows={3} className="text-sm sm:text-base" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <Select value={listingType} onValueChange={(value) => setListingType(value)}>
  <SelectTrigger>
    <SelectValue placeholder={t("propertyCard.offerType")} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="SELL">{t("propertyCard.forSale")}</SelectItem>
    <SelectItem value="RENT">{t("propertyCard.forRent")}</SelectItem>
  </SelectContent>
</Select>

              <Select value={propertyType} onValueChange={(value) => setPropertyType(value)}>
  <SelectTrigger>
    <SelectValue placeholder={t("propertyCard.propertyType")} />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="APARTMENT">{t("categories.APARTMENT")}</SelectItem>
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
                    <SelectItem key={city.id} value={String(city.id)}>
                      {displayName(city)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("propertyCard.price")}</Label>
                <Input id="price" type="number" placeholder="0" value={price} onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : 0)} required className="text-sm sm:text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t("propertyCard.area")}</Label>
                <Input id="area" type="number" placeholder="0"   onChange={(e) => setArea(e.target.value ? Number(e.target.value) : 0)} className="text-sm sm:text-base" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">{t("propertyCard.bedrooms")}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="0"
                    onChange={(e) => setBedrooms(Number(e.target.value))}
                  disabled={isFieldDisabled("bedrooms")}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.type === "image" ? (
                        <img src={item.preview} alt={`Upload ${index + 1}`} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                      ) : (
                        <video src={item.preview} className="w-full h-20 sm:h-24 object-cover rounded-lg" />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className={`absolute top-1 ${isRTL ? "left-1" : "right-1"} bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity`}
                      >
                        <X className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground"><strong>{t("propertyCard.note")}</strong></p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1 gradient-primary" disabled={!canSubmit}>{t("dashboard.approve")}</Button>

              <Button type="button" variant="outline" onClick={() => handleDialogClose(false)} className="w-full sm:w-auto">{t("dashboard.reject")}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AddProperty;
