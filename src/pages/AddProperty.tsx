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
import { CheckCircle, XCircle, Clock, Home, Users, Trash2 } from "lucide-react";
import "react-toastify/dist/ReactToastify.css";
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
import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import PropertyCard from "@/components/PropertyCard";
const API_BASE = "/api";

// Helper function to safely format coordinates
const formatCoordinate = (
  coord: number | string | undefined | null,
): string => {
  if (coord === null || coord === undefined || coord === "") {
    return "0.000000";
  }
  const num = typeof coord === "number" ? coord : Number(coord);
  if (isNaN(num)) {
    return "0.000000";
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
  // بعد كل الـ useState
  const [submittedProperty, setSubmittedProperty] = useState<any | null>(null);
  const [myProperties, setMyProperties] = useState<any[]>([]);
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [oldMedia, setOldMedia] = useState<
  { url: string; type: "image" | "video" }[]
>([]);


  // حالة الموقع (من الـ LocationPicker)
  const [location, setLocation] = useState<{
    lat: number;
    lng: number;
    address: string;
  }>({
    lat: 0,
    lng: 0,
    address: "",
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
  const hasOldImages = oldMedia.some((m) => m.type === "image");
const hasNewImages = uploadedFiles.some((m) => m.type === "image");

const canSubmit = Boolean(fullAddress && (hasOldImages || hasNewImages));


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
  const getAddressFromCoordinates = async (
    lat: number,
    lng: number,
  ): Promise<string> => {
    if (!GOOGLE_API_KEY) return "";

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_API_KEY}&language=ar&region=ps`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return "";

    // دور على Result فيه City أو Country
    const bestResult =
      data.results.find((r: any) =>
        r.address_components.some(
          (c: any) =>
            c.types.includes("locality") ||
            c.types.includes("administrative_area_level_2"),
        ),
      ) || data.results[data.results.length - 1];

    let street = "";
    let city = "";
    let country = "";

    bestResult.address_components.forEach((c: any) => {
      if (c.types.includes("route")) street = c.long_name;
      if (c.types.includes("locality")) city = c.long_name;
      if (!city && c.types.includes("administrative_area_level_2"))
        city = c.long_name;
      if (c.types.includes("country")) country = c.long_name;
    });

    const parts = [];
    if (street) parts.push(street);
    if (city) parts.push(city);
    if (country) parts.push(country);

    // لو ما في شارع → مدينة + دولة (وهذا طبيعي)
    return parts.length ? parts.join("، ") : bestResult.formatted_address;
  };
  const fetchMyProperties = async () => {
    try {
      const data = await apiFetch(
        `${API_BASE}/listings/my-listings?page=0&size=20`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        },
      );

      if (data?.content && Array.isArray(data.content)) {
        const formattedProperties = data.content.map((prop: any) => {
          const images = Array.isArray(prop.media)
            ? prop.media
                .filter((m) => m.mediaUrl && !m.mediaUrl.endsWith(".mp4"))
                .map((m) => m.mediaUrl)
            : [];
          const video = Array.isArray(prop.media)
            ? prop.media.find((m) => m.mediaUrl && m.mediaUrl.endsWith(".mp4"))
                ?.mediaUrl
            : undefined;

          return {
            ...prop,
            images,
            video,
          };
        });

        setMyProperties(formattedProperties);
      } else {
        setMyProperties([]);
      }
    } catch (err) {
      console.error("Failed to fetch my listings:", err);
      setMyProperties([]);
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
    if (!countryId) {
      setCities([]);
      return;
    }

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

  const handleDeleteProperty = async (propertyId: string) => {
    try {
      await apiFetch(`${API_BASE}/listings/${propertyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      toast({
        title: "تم الحذف",
        description: "تم حذف العقار بنجاح",
      });
      setMyProperties((prev) =>
        prev.filter((p) => String(p.id) !== String(propertyId)),
      );
    } catch (err) {
      console.error(err);
      toast({
        title: "خطأ",
        description: "فشل حذف العقار",
        variant: "destructive",
      });
    }
  };
  useEffect(() => {
    fetchCountries();
    fetchMyProperties();
  }, []);

  // عند تغيير الدولة المحددة نجيب مدنها
  useEffect(() => {
    if (selectedCountry) {
      fetchCities(selectedCountry);
      setSelectedCity("");
    } else {
      setCities([]);
      setSelectedCity("");
    }
  }, [selectedCountry]);

  const [isAddressEditable, setIsAddressEditable] = useState(false);

  const handleLocationSelected = async (selectedLocation: {
    lat: number;
    lng: number;
    address: string;
  }) => {
    setLocation(selectedLocation);

    const address = selectedLocation.address?.trim() || "";
    const isCoordinates = /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(address);
    const isPlusCode = /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/.test(
      address.replace(/\s+/g, ""),
    );

    if (isCoordinates || !address || isPlusCode) {
      try {
        const detailedAddress = await getAddressFromCoordinates(
          selectedLocation.lat,
          selectedLocation.lng,
        );
        const stillCoordinatesOrPlus =
          /^-?\d+\.?\d*,\s*-?\d+\.?\d*$/.test(detailedAddress) ||
          /^[0-9A-Z]{4,}\+[0-9A-Z]{2,}$/.test(
            detailedAddress.replace(/\s+/g, ""),
          );

        if (detailedAddress && !stillCoordinatesOrPlus) {
          setFullAddress(detailedAddress);
          setIsAddressEditable(false); // العنوان دقيق → لا يمكن تعديله
          toast({
            title: "تم الحصول على الموقع",
            description: detailedAddress,
          });
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
      setEditingProperty(null);
      setUploadedFiles([]);
    }
  };
 const handleEditClick = (prop: any) => {
  setEditingProperty(prop);

  // احتفظ فقط بالصور القديمة بدون تكرار
  const media = prop.media?.map((m: any) => ({
    url: m.mediaUrl,
    type: m.mediaUrl.endsWith(".mp4") ? "video" : "image",
  })) ?? [];

  setOldMedia(media); // الصور القديمة فقط
  setUploadedFiles([]); // امسح أي ملفات جديدة سابقاً

  // تعبئة الفورم بباقي البيانات
  setListingType(prop.listingType);
  setPropertyType(prop.propertyType);
  setTitleAr(prop.titleAr);
  settitleEn(prop.title);
  setDescriptionAr(prop.descriptionAr);
  setDescriptionEn(prop.description);
  setPrice(prop.price);
  setArea(prop.area);
  setBedrooms(prop.bedrooms);
  setBathrooms(prop.bathrooms);
  setParking(prop.parking);
  setYearBuilt(prop.yearBuilt ?? "");
  setFurnished(prop.furnished);
  setSelectedCity(prop.cityId);
  setSelectedCountry(prop.countryId);

  setLocation({
    lat: prop.latitude,
    lng: prop.longitude,
    address: prop.fullAddress ?? "",
  });
  setFullAddress(prop.fullAddress ?? "");
  setIsAddressEditable(!prop.fullAddress);

  // إعادة فتح الفورم
  setShowAddForm(false);
  setTimeout(() => {
    setShowAddForm(true);
  }, 0);
};


  const handleLocationPickerClose = (open: boolean) => {
    setShowLocationPicker(open);
  };
  // دالة رفع الملفات على Firebase
  const uploadMediaToFirebase = async (
    uploadedFiles: { type: "image" | "video"; file: File; preview: string }[],
    onProgress?: (fileName: string, progress: number) => void,
  ) => {
    const uploadPromises = uploadedFiles.map(
      (item) =>
        new Promise<string>((resolve, reject) => {
          if (!item.file) return resolve(null);

          const fileRef = ref(
            storage,
            `properties/${Date.now()}-${item.file.name}`,
          );
          const uploadTask = uploadBytesResumable(fileRef, item.file);

          uploadTask.on(
            "state_changed",
            (snapshot) => {
              const progress =
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress?.(item.file.name, progress);
            },
            (error) => {
              console.error(`فشل رفع الملف ${item.file.name}:`, error);
              reject(error);
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve(url);
              } catch (err) {
                console.error(
                  `فشل الحصول على رابط الملف ${item.file.name}:`,
                  err,
                );
                reject(err);
              }
            },
          );
        }),
    );

    const results = await Promise.all(uploadPromises);
    console.log(results);
    return results.filter((url): url is string => url !== null); // type guard
  };

  // دالة إرسال الفورم للباكند بعد رفع الملفات
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // رفع الصور الجديدة أولاً
    const newMediaUrls =
      uploadedFiles.length > 0
        ? await uploadMediaToFirebase(uploadedFiles)
        : [];

    // دمج الصور القديمة مع الجديدة
   const mediaUrls = [
  ...oldMedia.map((m) => m.url),
  ...newMediaUrls.filter(url => !oldMedia.some(m => m.url === url))
];
    const body = {
      cityId: Number(selectedCity),
      propertyType,
      listingType,
      title: titleEN,
      titleAr: titleAR,
      description: descriptionEn,
      descriptionAr,
      price,
      area,
      bedrooms,
      bathrooms,
      parking,
      yearBuilt,
      furnished,
      latitude: location.lat,
      longitude: location.lng,
      mediaUrls,
    };

    if (editingProperty) {
      // ✏️ تعديل
      await apiFetch(`${API_BASE}/listings/${editingProperty.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      });

      toast({ title: "تم التعديل بنجاح" });
    } else {
      // ➕ إضافة
      await apiFetch(`${API_BASE}/listings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      toast({ title: "تمت الإضافة بنجاح" });
    }

    setEditingProperty(null);
    setShowAddForm(false);
    fetchMyProperties();
  };

  // دالة مساعدة لاختيار الاسم المعروض حسب اللغة
  const displayName = (item: any) => {
    // إذا اللغة عربية نعرض nameAr، وإلا نعرض name
    if (String(language).toLowerCase().startsWith("ar"))
      return item.nameAr || item.name || "";
    return item.name || item.nameAr || "";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8 sm:mb-10 md:mb-12">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3">
              {t("addPropertyPage.headerTitle")}
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6">
              {t("addPropertyPage.headerSubtitle")}
            </p>
            <Button
              size="lg"
              className="gradient-accent w-full sm:w-auto"
              onClick={() => setShowLocationPicker(true)}
            >
              <PlusCircle
                className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "mr-2" : "ml-2"}`}
              />
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
            <DialogTitle className="text-xl sm:text-2xl">
              {t("navbar.add_property")}
            </DialogTitle>
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
                <Label htmlFor="descriptionAr">
                  {t("propertyCard.descriptionAr")}
                </Label>
                <Textarea
                  id="descriptionAr"
                  value={descriptionAr}
                  placeholder={t("...")}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">
                  {t("propertyCard.descriptionEn")}
                </Label>
                <Textarea
                  id="descriptionEn"
                  value={descriptionEn}
                  placeholder={t("...")}
                  onChange={(e) => setDescriptionEn(e.target.value)}
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleAr">{t("propertyCard.TitleAr")}</Label>
                <Textarea
                  id="TitleAr"
                  value={titleAR}
                  placeholder={t("propertyCard.TitleAr")}
                  onChange={(e) => setTitleAr(e.target.value)}
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="TitleEn">{t("propertyCard.TitleEn")}</Label>
                <Textarea
                  id="TitleEn"
                  value={titleEN}
                  placeholder={t("propertyCard.TitleEn")}
                  onChange={(e) => settitleEn(e.target.value)}
                  rows={3}
                  className="text-sm sm:text-base"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                value={listingType}
                onValueChange={(value) => setListingType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("propertyCard.offerType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SELL">
                    {t("propertyCard.forSale")}
                  </SelectItem>
                  <SelectItem value="RENT">
                    {t("propertyCard.forRent")}
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={propertyType}
                onValueChange={(value) => setPropertyType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("propertyCard.propertyType")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="APARTMENT">
                    {t("categories.APARTMENT")}
                  </SelectItem>
                  <SelectItem value="HOUSE">{t("categories.HOUSE")}</SelectItem>
                  <SelectItem value="LAND">{t("categories.LAND")}</SelectItem>
                  <SelectItem value="OFFICE">
                    {t("categories.OFFICE")}
                  </SelectItem>
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
                <Input
                  id="price"
                  type="number"
                  placeholder="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value ? Number(e.target.value) : 0)
                  }
                  required
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t("propertyCard.area")}</Label>
                <Input
                  id="area"
                  type="number"
                  placeholder="0"
                  onChange={(e) =>
                    setArea(e.target.value ? Number(e.target.value) : 0)
                  }
                  className="text-sm sm:text-base"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">{t("propertyCard.bedrooms")}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  placeholder="0"
                  value={bedrooms}
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
                  value={bathrooms}
                  placeholder="0"
                  onChange={(e) => setBathrooms(Number(e.target.value))}
                  disabled={isFieldDisabled("bathrooms")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">{t("propertyCard.parking")}</Label>
                <Input
                  id="parking"
                  value={parking}
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
                  value={yearBuilt}
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
                onCheckedChange={(checked) => setFurnished(checked === true)}
                disabled={isFieldDisabled("furnished")}
              />
              <Label htmlFor="furnished" className="cursor-pointer">
                {t("propertyCard.furnished")}
              </Label>
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
                <p className="text-sm text-muted-foreground">
                  {t("propertyCard.selectFiles")}
                </p>
              </div>

             {(oldMedia.length > 0 || uploadedFiles.length > 0) && (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-4">

    {/* 🟦 الصور القديمة */}
    {oldMedia.map((item, index) => (
      <div key={item.url} className="relative group">
        {item.type === "image" ? (
          <img
            src={item.url}
            className="w-full h-20 sm:h-24 object-cover rounded-lg"
          />
        ) : (
          <video
            src={item.url}
            className="w-full h-20 sm:h-24 object-cover rounded-lg"
          />
        )}

        <button
          type="button"
          onClick={() =>
            setOldMedia((prev) => prev.filter((_, i) => i !== index))
          }
          className={`absolute top-1 ${
            isRTL ? "left-1" : "right-1"
          } bg-destructive text-destructive-foreground rounded-full p-1`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    ))}

    {/* 🟩 الصور الجديدة */}
    {uploadedFiles.map((item, index) => (
      <div key={`new-${index}`} className="relative group">
        {item.type === "image" ? (
          <img
            src={item.preview}
            className="w-full h-20 sm:h-24 object-cover rounded-lg"
          />
        ) : (
          <video
            src={item.preview}
            className="w-full h-20 sm:h-24 object-cover rounded-lg"
          />
        )}

        <button
          type="button"
          onClick={() => handleRemoveFile(index)}
          className={`absolute top-1 ${
            isRTL ? "left-1" : "right-1"
          } bg-destructive text-destructive-foreground rounded-full p-1`}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    ))}

  </div>
)}

            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t("propertyCard.note")}</strong>
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                className="flex-1 gradient-primary"
                disabled={!canSubmit}
              >
                {t("dashboard.approve")}
              </Button>
              {/* عرض العقار المضاف فور الإرسال */}
              {submittedProperty && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-2">عقارك المضاف:</h2>
                  <PropertyCard
                    {...submittedProperty}
                    images={submittedProperty.images || []} // تأكد من وجود الصور
                    video={submittedProperty.video || undefined} // تأكد من وجود الفيديو
                  />
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
                className="w-full sm:w-auto"
              >
                {t("dashboard.reject")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* عرض كل عقارات المستخدم المعتمدة */}
      <div className="w-4/5 mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {myProperties && myProperties.length > 0 ? (
            myProperties.map((prop) => {
              const images = Array.isArray(prop.media)
                ? prop.media
                    .filter((m) => m.mediaUrl && !m.mediaUrl.endsWith(".mp4"))
                    .map((m) => m.mediaUrl)
                : [];

              const video = Array.isArray(prop.media)
                ? prop.media.find(
                    (m) => m.mediaUrl && m.mediaUrl.endsWith(".mp4"),
                  )?.mediaUrl
                : undefined;
              return (
                <div key={prop.id} className="flex flex-col">
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
                    images={images}
                    video={video}
                    arabicDescription={prop.descriptionAr || ""}
                    englishDescription={prop.description || ""}
                    area={prop.area || 0}
                    bedrooms={prop.bedrooms || 0}
                    bathrooms={prop.bathrooms || 0}
                    parking={prop.parking || 0}
                    yearBuilt={prop.yearBuilt || undefined}
                    furnished={prop.furnished || false}
                  />

                  {/* أزرار التعديل والحذف أسفل البطاقة */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEditClick(prop)}
                      className="flex-1  hover:bg-green-600 text-white"
                      style={{
                        backgroundColor: "#144a95",
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {t("dashboard.update")}
                    </Button>
                    <Button
                      onClick={() => handleDeleteProperty(prop.id)}
                      variant="destructive"
                      className="flex-1"
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      {t("dashboard.delete")}
                    </Button>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-muted-foreground col-span-full text-center py-8">
              {t("dashboard.no_pending_properties")}
            </p>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AddProperty;
