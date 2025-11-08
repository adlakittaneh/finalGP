import i18next from "i18next";
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/context/LanguageContext";
import { MapPin, Volume2, ChevronLeft, ChevronRight, Pencil, Trash2, Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import nablusVideo from "@/assets/nablus.mp4";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface PropertyCardProps {
  id: string;
  type: string;
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
}

const PropertyCard = ({
  id,
  type,
  propertyType,
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
}: PropertyCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [showDetails, setShowDetails] = useState(false);
  const { language } = useLanguage();
  const { t } = useTranslation();

  // Combine video and images for display
  const media = video ? [video, ...images] : images;

  // Get favorites from localStorage
  const getFavoritesFromStorage = (): string[] => {
    const favorites = localStorage.getItem('favoriteProperties');
    return favorites ? JSON.parse(favorites) : [];
  };

  // Initialize favorite state based on whether this property is in favorites
  const [isFavorite, setIsFavorite] = useState(false);

  // Check if property is favorite on mount
  useEffect(() => {
    const favorites = getFavoritesFromStorage();
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const favorites = getFavoritesFromStorage();
    let updatedFavorites: string[];
    
    if (isFavorite) {
      // Remove from favorites
      updatedFavorites = favorites.filter(favId => favId !== id);
    } else {
      // Add to favorites
      updatedFavorites = [...favorites, id];
    }
    
    localStorage.setItem('favoriteProperties', JSON.stringify(updatedFavorites));
    setIsFavorite(!isFavorite);
    
    console.log("Updated favorites:", updatedFavorites);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
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
    // ⚡ أسماء مرتبة حتى ما ترجع "غير محدد"
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
    const cityTrans = t(`cities.${city}`) || city || "Unknown city";
    const capitalTrans = t(`cities.${capital}`) || capital || "Unknown country";

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

  // 🎙️ إعداد النطق
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;

  // 🔊 اختيار الصوت المناسب
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



  return (
    <>
      <Card className="overflow-hidden hover:shadow-elegant transition-smooth group">
        <div className="relative h-64 overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt={"error"}
            className="w-full h-full object-cover group-hover:scale-110 transition-smooth"
          />

          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-smooth"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-smooth"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}

          <div className="absolute top-3 right-3">
            <Badge className={type === "للبيع" ? "gradient-primary" : "bg-green-500"}>
              {language === "AR" ? type : (type === "للبيع" ? t("propertyCard.forSale") : t("propertyCard.forRent"))}
            </Badge>
          </div>

          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 left-3 bg-background/90 backdrop-blur-sm p-2 rounded-full hover:bg-background transition-all hover:scale-110"
          >
            <Heart 
              className={`w-5 h-5 transition-colors ${
                isFavorite ? "fill-red-500 text-red-500" : "text-gray-600"
              }`} 
            />
          </button>
        </div>

        <CardContent className="p-5">
          <h3 className="text-xl font-bold mb-2 text-foreground">
            {language === "AR" 
              ? `${propertyType} في ${city}`
              : `${t(`propertyTypes.${propertyType}`)} in ${t(`cities.${city}`)}`
            }
          </h3>

          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">
              {language === "AR" 
                ? `${city}، ${capital}`
                : `${t(`cities.${city}`)}, ${t(`countries.${capital}`)}`
              }
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <span className="text-2xl font-bold text-primary">
              {price.toLocaleString()} {t("propertyCard.priceUnit")}
            </span>
            <button
              onClick={handleSpeak}
              className="p-2 hover:bg-muted rounded-full transition-smooth"
            >
              <Volume2 className="w-5 h-5 text-primary" />
            </button>
          </div>

          <div className="flex gap-2">
            <Button
              variant="default"
              className="flex-1 gradient-primary"
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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {t("propertyCard.propertyDetails")}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Main media display - video or image */}
            <div className="relative h-96 rounded-lg overflow-hidden bg-gray-900">
              {selectedMediaIndex === 0 && video ? (
                <video
                  src={video}
                  controls
                  className="w-full h-full object-contain"
                />
              ) : (
                <img
                  src={media[selectedMediaIndex]}
                  alt="property"
                  className="w-full h-full object-cover"
                />
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
              <div className="grid grid-cols-4 gap-2">
                {media.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedMediaIndex(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedMediaIndex ? "border-primary" : "border-transparent hover:border-primary/50"
                    }`}
                  >
                    {index === 0 && video ? (
                      <>
                        <video
                          src={item}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item}
                        alt={`thumbnail ${index}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.propertyType")}</p>
                <p className="font-semibold">
                  {language === "AR" ? propertyType : t(`propertyTypes.${propertyType}`)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.offerType")}</p>
                <Badge className={type === "للبيع" ? "gradient-primary" : "bg-green-500"}>
                  {language === "AR" ? type : (type === "للبيع" ? t("propertyCard.forSale") : t("propertyCard.forRent"))}
                </Badge>
              </div>

              {city && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.location")}</p>
                  <p className="font-semibold">
                    {language === "AR" 
                      ? `${city}, ${capital}`
                      : `${t(`cities.${city}`)}, ${t(`countries.${capital}`)}`
                    }
                  </p>
                </div>
              )}
              {area && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.area")}</p>
                  <p className="font-semibold">{area} م²</p>
                </div>
              )}
              {bedrooms && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.bedrooms")}</p>
                  <p className="font-semibold">{bedrooms}</p>
                </div>
              )}
              {bathrooms && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.bathrooms")}</p>
                  <p className="font-semibold">{bathrooms}</p>
                </div>
              )}
              {parking && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.parking")}</p>
                  <p className="font-semibold">{parking}</p>
                </div>
              )}
              {yearBuilt && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.yearBuilt")}</p>
                  <p className="font-semibold">{yearBuilt}</p>
                </div>
              )}
              {furnished !== undefined && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{t("propertyCard.furnished")}</p>
                  <p className="font-semibold">{furnished ? t("propertyCard.yes") : t("propertyCard.no")}</p>
                </div>
              )}
            </div>
{language === "AR" && arabicDescription && (
  <p className="text-foreground leading-relaxed">{arabicDescription}</p>
)}

{language === "US" && englishDescription && (
  <p className="text-foreground leading-relaxed">{englishDescription}</p>
)}


            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-3xl font-bold text-primary">
                {price.toLocaleString()} {t("propertyCard.priceUnit")}
              </span>
              <Button onClick={() => setShowDetails(false)}>
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
