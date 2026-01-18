 import i18next from "i18next";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Volume2, ChevronLeft, ChevronRight, Pencil, Trash2, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiFetch } from "../api/apiFetch";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
export interface PropertyCardProps {
  id: string;
  type: string;
  title: string;
  titleAr?: string;
  propertyType: string;
  city: string;
  capital: string;
  price: number;
  images: string[];
  video?: string;
  arabicDescription?: string;
  englishDescription?: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parking?: number;
  yearBuilt?: number;
  furnished?: boolean;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;

   mediaFromAPI?: { id: number; mediaUrl: string }[]; 
}

const PropertyCard = (
  {
  id,
  type,
  propertyType,
  title,
  titleAr,
  city,
  capital,
  price,
  images,
  video,
  arabicDescription,
  englishDescription,
  area,
  bedrooms,
  bathrooms,
  parking,
  yearBuilt,
  furnished,
  showActions = false,
  onEdit,
  onDelete,
   mediaFromAPI,
}: PropertyCardProps) => {
  const API_BASE = "http://easyaqar.org/api";
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();
  const isRTL = language === "AR";
  const navigate = useNavigate();


  // Combine video and images for display
const media: { src: string; type: "image" | "video" }[] = [
  ...(mediaFromAPI?.filter(item => item.mediaUrl).map(item => ({
    src: item.mediaUrl,
    type: item.mediaUrl.endsWith(".mp4") ? "video" : "image" as "video" | "image",
  })) || []),
  ...(video ? [{ type: "video" as "video" | "image", src: video }] : []),
  ...((images || []).filter(Boolean).map(img => ({ type: "image" as "video" | "image", src: img })))
];

  const currentMedia =
  media.length > 0
    ? media[Math.min(currentImageIndex, media.length - 1)]
    : null;

  // Initialize favorite state based on whether this property is in favorites
  const [isFavorite, setIsFavorite] = useState(false);

 useEffect(() => {
  const checkIfFavorite = async () => {
    try {
      const res = await apiFetch(`${API_BASE}/favorites?pageable.page=0&pageable.size=50`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = res.content ? res : await res.json();

      const isFav = data.content?.some(
        (item: any) => item.id === Number(id)
      );

      setIsFavorite(isFav);
    } catch (error) {
      console.error("Failed to load favorites", error);
    }
  };

  checkIfFavorite();
}, [id]);

const toggleFavorite = async (e: React.MouseEvent) => {
  try {
    const method = isFavorite ? "DELETE" : "POST";
    console.log(method, id);

    const res = await apiFetch(`${API_BASE}/favorites/${id}`, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok && res.json) {
      const errorData = await res.json();
      console.error("Failed to toggle favorite", errorData);
      toast.error(t("Favorites.err")); 
      return;
    }

  
    if (method === "POST") {
      toast.success(t("Favorites.successMsg"));

    } else {
      toast.success(t("Favorites.removeMsg"));
    }
      setIsFavorite(!isFavorite);
  } catch (error) {
    console.error("Error toggling favorite", error);
    toast.error(t("Favorites.err")); 
  }
};


const nextImage = (e: React.MouseEvent) => {
  e.stopPropagation();
  setCurrentImageIndex((prev) => (prev + 1) % media.length);
};

const prevImage = (e: React.MouseEvent) => {
  e.stopPropagation();
  setCurrentImageIndex((prev) => (prev - 1 + media.length) % media.length);
};



  const [isSpeaking, setIsSpeaking] = useState(false);

const handleSpeak = (e: React.MouseEvent) => {
  e.stopPropagation();

  // إذا في صوت حالياً شغال → نوقفه
  if (isSpeaking || speechSynthesis.speaking) {
    speechSynthesis.cancel();
    setIsSpeaking(false);
    return;
  }

  let text = "";
  let langCode = "ar-SA";

  if (language === "AR") {
    //  أسماء مرتبة حتى ما ترجع "غير محدد"
    const propertyTypeName = propertyType || "غير محدد";
    const offerType = type || "غير محدد";
    const cityName = city || "غير محددة";
    const countryName = capital || "غير محدد";

    text = `
      نوع العقار: ${propertyTypeName}.
      نوع العرض: ${offerType}.
      الموقع: ${countryName}، ${cityName}.
      ${area ? `المساحة: ${area} متر مربع. ` : ""}
      ${bedrooms ? `عدد غرف النوم: ${bedrooms}. ` : ""}
      ${bathrooms ? `عدد الحمامات: ${bathrooms}. ` : ""}
      ${parking ? `عدد مواقف السيارات: ${parking}. ` : ""}
      ${yearBuilt ? `سنة البناء: ${yearBuilt}. ` : ""}
      ${furnished !== undefined ? (furnished ? "العقار مفروش. " : "العقار غير مفروش. ") : ""}
      ${arabicDescription ? `الوصف: ${arabicDescription}. ` : ""}
      السعر: ${price.toLocaleString()} دينار أردني.
    `;
    langCode = "ar-SA";
  } else {
    // ⚡ ترجمات نظيفة للإنجليزي
    const propertyTypeTrans = t(`propertyTypes.${propertyType}`) || propertyType || "Not specified";
    const cityTrans = city || "Unknown city";
    const capitalTrans = capital || "Unknown country";

    text = `
      Property Type: ${propertyTypeTrans}.
      Offer Type: ${type === "للبيع" ? "For Sale" : "For Rent"}.
      Location: ${capitalTrans}, ${cityTrans}.
      ${area ? `Area: ${area} square meters. ` : ""}
      ${bedrooms ? `Bedrooms: ${bedrooms}. ` : ""}
      ${bathrooms ? `Bathrooms: ${bathrooms}. ` : ""}
      ${parking ? `Parking spaces: ${parking}. ` : ""}
      ${yearBuilt ? `Year built: ${yearBuilt}. ` : ""}
      ${furnished !== undefined ? (furnished ? "The property is furnished. " : "The property is not furnished. ") : ""}
      ${englishDescription ? `Description: ${englishDescription}. ` : ""}
      Price: ${price.toLocaleString()} Jordanian Dinars.
    `;
    langCode = "en-US";
  }

  //  إعداد النطق
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  //  اختيار الصوت المناسب
  const voices = speechSynthesis.getVoices();
  let selectedVoice;
  if (langCode.startsWith("ar")) {
    selectedVoice =
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("ar")) ||
      voices.find(v => v.name.includes("Microsoft") && v.lang.startsWith("ar")) ||
      voices.find(v => v.lang.startsWith("ar")) ||
      voices.find(v => v.lang.startsWith("en")); // fallback
  } else {
    selectedVoice =
      voices.find(v => v.name.includes("Google") && v.lang.startsWith("en")) ||
      voices.find(v => v.name.includes("Microsoft") && v.lang.startsWith("en")) ||
      voices.find(v => v.lang.startsWith("en")) ||
      voices[0];
  }

  if (selectedVoice) utterance.voice = selectedVoice;

  //  تتبع حالة النطق (للتوقف الفوري)
  utterance.onstart = () => setIsSpeaking(true);
  utterance.onend = () => setIsSpeaking(false);
  utterance.onerror = () => setIsSpeaking(false);

  speechSynthesis.speak(utterance);
};


const visibleFieldsByType: Record<string, string[]> = {
  LAND: ["area"],
  HOUSE: ["area", "bedrooms", "bathrooms", "parking", "yearBuilt", "furnished"],
  APARTMENT: ["area", "bedrooms", "bathrooms", "parking", "yearBuilt", "furnished"],
  OFFICE: ["area", "bathrooms", "parking", "yearBuilt", "furnished"],
  STORE: ["area", "parking", "yearBuilt"],
};

const isVisible = (field: string) =>
  visibleFieldsByType[propertyType]?.includes(field);



  return (
    <>
      <Card className="overflow-hidden hover:shadow-elegant transition-smooth group">
        <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden">
    {currentMedia ? (
  currentMedia.type === "video" ? (
    <video
      src={currentMedia.src}
      muted
      playsInline
      preload="metadata"
      className="w-full h-full object-cover"
    />
  ) : (
    <img
      src={currentMedia.src}
      alt="property"
      className="w-full h-full object-cover"
    />
  )
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-200">
    <span>No media available</span>
  </div>
)}




         

        
          {media.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className={`absolute ${isRTL ? "right-2" : "left-2"} top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-smooth`}
              >
                {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
              <button
                onClick={nextImage}
                className={`absolute ${isRTL ? "left-2" : "right-2"} top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-smooth`}
              >
                {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </>
          )}
          <div className={`absolute top-3 ${isRTL ? "right-3" : "left-3"}`}>
            <Badge className={type === "للبيع" ? "gradient-primary" : "bg-green-500"}>
              {language === "AR" ? type : (type === "للبيع" ? t("propertyCard.forSale") : t("propertyCard.forRent"))}
            </Badge>
          </div>

          {/* Favorite Button */}
          
         <button
      onClick={toggleFavorite}
      className={`
        absolute top-3
        ${isRTL ? "left-3" : "right-3"}
        bg-background/90 backdrop-blur-sm
        p-2 rounded-full
        hover:bg-background
        transition-all hover:scale-110
      `}
    >
      <Heart
        className={`w-5 h-5 transition-colors ${
          isFavorite
            ? "fill-red-500 text-red-500"
            : "text-gray-600"
        }`}
      />
    </button>
       
        </div>

        <CardContent className="p-4 sm:p-5">
          <h3 className="text-lg sm:text-xl font-bold mb-2 text-foreground line-clamp-2">
            {language === "AR" 
              ? (titleAr || title || `${t(`propertyTypes.${propertyType}`) || propertyType} في ${city || ""}`)
              : (title || titleAr || `${t(`propertyTypes.${propertyType}`)} in ${city || ""}`)
            }
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
            <span className="text-xs sm:text-sm truncate">
              {language === "AR" 
                ? `${city || ""}${city && capital ? "، " : ""}${capital || ""}`
                : `${city || ""}${city && capital ? ", " : ""}${capital || ""}`
              }
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
              {price.toLocaleString()} {t("propertyCard.priceUnit")}
            </span>
            <button
              onClick={handleSpeak}
              className="p-1.5 sm:p-2 hover:bg-muted rounded-full transition-smooth flex-shrink-0"
            >
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="default"
              className="flex-1 gradient-primary text-sm sm:text-base"
              onClick={() => setShowDetails(true)}
            >
              {t("propertyCard.details")}
            </Button>

            {showActions && (
              <>
                <Button variant="outline" size="icon" onClick={onEdit}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={onDelete}
                  className="hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto mx-2 sm:mx-4">
          <DialogHeader>
            <DialogTitle className="text-xl sm:text-2xl mb-2">
              {language === "AR" 
                ? (titleAr || title || t("propertyCard.propertyDetails"))
                : (title || titleAr || t("propertyCard.propertyDetails"))
              }
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {t("propertyCard.propertyDetails")}
            </p>
          </DialogHeader>

          <div className="space-y-4 sm:space-y-6">
            {/* Main media display - video or image */}
            <div className="relative h-48 sm:h-64 md:h-96 rounded-lg overflow-hidden bg-gray-900">
      {media[selectedMediaIndex] ? (
  media[selectedMediaIndex].type === "video" ? (
    <video
      src={media[selectedMediaIndex].src}
      controls
      className="w-full h-full object-contain"
    />
  ) : (
    <img
      src={media[selectedMediaIndex].src}
      alt="property"
      className="w-full h-full object-cover"
    />
  )
) : (
  <div className="w-full h-full flex items-center justify-center bg-gray-200">
    <span>No media available</span>
  </div>
)}




              {/* Media indicator dots */}
              {media.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-full">
                  {media.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedMediaIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === selectedMediaIndex ? "bg-primary w-8" : "bg-white/50 hover:bg-white/70"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail gallery */}
     {media.length > 1 && (
  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
    {media.filter(Boolean).map((item, index) => (
      <button
        key={index}
        onClick={() => setSelectedMediaIndex(index)}
        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
          index === selectedMediaIndex
            ? "border-primary"
            : "border-transparent hover:border-primary/50"
        }`}
      >
        {item?.type === "video" ? (
          <>
            <video src={item.src} className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <svg
                className="w-8 h-8 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </>
        ) : (
          <img
            src={item?.src}
            alt={`thumbnail ${index}`}
            className="w-full h-full object-cover"
          />
        )}
      </button>
    ))}
  </div>
)}




            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
  {/* نوع العقار */}
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
      {t("propertyCard.propertyType")}
    </p>
    <p className="font-semibold text-sm sm:text-base">
      {language === "AR"
        ? propertyType
        : t(`propertyTypes.${propertyType}`)}
    </p>
  </div>

  {/* نوع العرض */}
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground mb-1">
      {t("propertyCard.offerType")}
    </p>
    <Badge
      className={`text-xs sm:text-sm ${
        type === "للبيع" ? "gradient-primary" : "bg-green-500"
      }`}
    >
      {language === "AR"
        ? type
        : type === "للبيع"
        ? t("propertyCard.forSale")
        : t("propertyCard.forRent")}
    </Badge>
  </div>

  {/* الموقع */}
  {city && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.location")}
      </p>
      <p className="font-semibold text-sm sm:text-base">
        {language === "AR"
          ? `${city}${capital ? "، " + capital : ""}`
          : `${city}${capital ? ", " + capital : ""}`}
      </p>
    </div>
  )}

  {/* المساحة */}
  {area !== undefined && isVisible("area") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.area")}
      </p>
      <p className="font-semibold text-sm sm:text-base">
        {area} {isRTL ? "م²" : "m²"}
      </p>
    </div>
  )}

  {/* غرف النوم */}
  {bedrooms !== undefined && isVisible("bedrooms") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.bedrooms")}
      </p>
      <p className="font-semibold text-sm sm:text-base">{bedrooms}</p>
    </div>
  )}

  {/* الحمامات */}
  {bathrooms !== undefined && isVisible("bathrooms") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.bathrooms")}
      </p>
      <p className="font-semibold text-sm sm:text-base">{bathrooms}</p>
    </div>
  )}

  {/* المواقف */}
  {parking !== undefined && isVisible("parking") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.parking")}
      </p>
      <p className="font-semibold text-sm sm:text-base">{parking}</p>
    </div>
  )}

  {/* سنة البناء */}
  {yearBuilt !== undefined && isVisible("yearBuilt") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.yearBuilt")}
      </p>
      <p className="font-semibold text-sm sm:text-base">{yearBuilt}</p>
    </div>
  )}

  {/* مفروش */}
  {furnished !== undefined && isVisible("furnished") && (
    <div>
      <p className="text-xs sm:text-sm text-muted-foreground mb-1">
        {t("propertyCard.furnished")}
      </p>
      <p className="font-semibold text-sm sm:text-base">
        {furnished ? t("propertyCard.yes") : t("propertyCard.no")}
      </p>
    </div>
  )}
</div>


        

{language === "AR" && arabicDescription && (
  <p className="text-sm sm:text-base text-foreground leading-relaxed">{arabicDescription}</p>
)}

{language === "US" && englishDescription && (
  <p className="text-sm sm:text-base text-foreground leading-relaxed">{englishDescription}</p>
)}


            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t">
              <span className="text-2xl sm:text-3xl font-bold text-primary text-center sm:text-left">
                {price.toLocaleString()} {t("propertyCard.priceUnit")}
              </span>
              <Button onClick={() => setShowDetails(false)} className="w-full sm:w-auto">
                {t("propertyCard.close")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PropertyCard;  