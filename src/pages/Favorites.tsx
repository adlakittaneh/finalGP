import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";
import { PropertyCardProps } from "@/components/PropertyCard";
import { API_BASE } from "./config/api";
import { apiFetch } from "../api/apiFetch";
import PropertyCard from "@/components/PropertyCard";
import { useNavigate } from "react-router-dom";

const Favorites = () => {
  const { t } = useTranslation();
  const [favoriteProperties, setFavoriteProperties] = useState<PropertyCardProps[]>([]);
  const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();


  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const res = await apiFetch(
          `${API_BASE}/favorites?pageable.page=0&pageable.size=50`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        const data = res.content ? res : await res.json();
        const favoritesWithMedia = (data.content || []).map((item: any) => ({
          ...item,
          mediaFromAPI: item.media?.map((m: any) => ({
            id: m.id,
            mediaUrl: m.mediaUrl,
          })) || [],
        }));

        setFavoriteProperties(favoritesWithMedia);
      } catch (error) {
        console.error("Failed to load favorites", error);
      }
    };

    loadFavorites();
  
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
            <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {t("navbar.favorites")}
            </h1>
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