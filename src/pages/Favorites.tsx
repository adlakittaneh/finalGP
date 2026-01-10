import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import PropertyCard from "@/components/PropertyCard";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import nablusVideo from "@/assets/nablus.mp4";
import { PropertyCardProps } from "@/components/PropertyCard";

const Favorites = () => {
  const { t } = useTranslation();
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyCardProps[]>([]);

  // All available properties (this would come from your database in real app)
  const allProperties: PropertyCardProps[] = [
    {
      id: "1",
      type: "للإيجار",
      propertyType: "شقة",
      city: "نابلس",
      capital: "فلسطين",
      price: 800,
      images: [property1, property2],
      video: nablusVideo,
      arabicDescription: "شقة مفروشة بالكامل مع إطلالة رائعة",
      englishDescription: "Fully furnished apartment with a great view",
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      yearBuilt: 2020,
      furnished: true,
    },
    {
      id: "2",
      type: "للبيع",
      propertyType: "فيلا",
      city: "رام الله",
      capital: "فلسطين",
      price: 450000,
      images: [property2],
      arabicDescription: "فيلا فاخرة بمساحات واسعة وتصميم عصري",
      englishDescription: "Luxury villa with spacious areas and modern design",
      area: 350,
      bedrooms: 5,
      bathrooms: 4,
      parking: 3,
      yearBuilt: 2021,
      furnished: false,
    },
    {
      id: "3",
      type: "للإيجار",
      propertyType: "مكتب",
      city: "غزة",
      capital: "فلسطين",
      price: 1500,
      images: [property3],
      arabicDescription: "مكتب مجهز بالكامل في موقع استراتيجي",
      englishDescription: "Fully equipped office in a strategic location",
      area: 200,
      bathrooms: 2,
      parking: 5,
      yearBuilt: 2022,
      furnished: true,
    },
  ];

  useEffect(() => {
    // Get favorite IDs from localStorage
    const favoriteIds = localStorage.getItem('favoriteProperties');
    
    if (favoriteIds) {
      const ids = JSON.parse(favoriteIds);
      // Filter properties that are in favorites
      const favorites = allProperties.filter(property => ids.includes(property.id));
      setFavoriteProperties(favorites);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">{t("navbar.favorites")}</h1>
          </div>

          {favoriteProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {favoriteProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 md:py-20">
              <Heart className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 sm:mb-4 text-muted-foreground" />
              <h2 className="text-xl sm:text-2xl font-semibold mb-2">
                {t("favorites.no_properties")}
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground px-4">
                {t("favorites.start_adding")}
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
