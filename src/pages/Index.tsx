import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import PropertyCard, { PropertyCardProps } from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import background from "@/assets/back.jpeg";
import { useLanguage } from "@/context/LanguageContext";
import SearchSidebar from "@/components/SearchSidebar";
import { useEffect } from "react";
import { apiFetch } from "@/api/apiFetch";
import { useToast } from "@/hooks/use-toast";
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
}


const Index = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProperties, setFeaturedProperties] = useState<
    PropertyCardProps[]
  >([]);
    const [usersMap, setUsersMap] = useState<Record<number, User>>({});
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const API_BASE = "/api";

  const isRTL = language === "AR";
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const getAllUsers = async () => {
      try {
        const data = await apiFetch(`${API_BASE}/admin/users?page=0&size=1000`, {
          method: "GET",
        });
  
        if (Array.isArray(data?.content)) {  
          const map: Record<number, User> = {};
  
          data.content.forEach((user: User) => {
            map[user.id] = user;
          });
  
          console.log("USERS MAP 👉", map);
          setUsersMap(map);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
      }
    };

  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        console.error("Location error:", error);
      },
    );
  }, []);
 useEffect(() => {
  // ما ننفذ إذا ما عندنا موقع المستخدم
  if (!userLocation) return;

  // إذا isAdmin === null → لسه ما عرفنا نوع المستخدم
  if (isAdmin === null) return;

  // إذا admin وusersMap فاضي → لسه ما جلبنا المستخدمين
  if (isAdmin && Object.keys(usersMap).length === 0) return;

  toast({
    title:
      "Location detected at latitude: " +
      userLocation.latitude.toFixed(4) +
      ", longitude: " +
      userLocation.longitude.toFixed(4),
    description: "Fetching nearby properties based on your location.",
  });

  const fetchNearbyProperties = async () => {
    try {
      setLoading(true);
      const response = await apiFetch(
        `${API_BASE}/listings/nearby?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&radiusKm=5&page=0&size=20`,
      );

      const adapted: PropertyCardProps[] = response.content.map((item: any) => ({
        id: item.id,
        type: item.listingType === "RENT" ? "للإيجار" : "للبيع",
        city: item.cityName || "",
        capital: item.countryName || "",
        propertyType: item.propertyType,
        title: item.title || "",
        titleAr: item.titleAr || "",
        price: item.price,
        area: item.area,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        parking: item.parking,
        yearBuilt: item.yearBuilt,
        furnished: item.furnished,
        mediaFromAPI: item.media,
        englishDescription: item.description,
        arabicDescription: item.descriptionAr,
        owner: isAdmin ? usersMap[item.userId] : undefined,
        isAdmin,
        showActions: false,
      }));

      setFeaturedProperties(adapted);
    } catch (error) {
      console.error("Failed to fetch nearby listings", error);
    } finally {
      setLoading(false);
    }
  };

  fetchNearbyProperties();
}, [userLocation, language, isAdmin, usersMap]);

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const userData = await apiFetch(`${API_BASE}/auth/me`, {
          method: "GET",
        });
  
        setIsAdmin(userData.role === "ADMIN");
      } catch (err) {
        console.error("Failed to fetch auth user", err);
        setIsAdmin(false);
      }
    };
  
    fetchMe();
  }, []);
  useEffect(() => {
  if (isAdmin === true) {
    getAllUsers();
  }
}, [isAdmin]);
  

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />
      <SearchSidebar />
      <div className={`flex-1 ${isRTL ? "lg:mr-72" : "lg:ml-72"}`}>
        {/* Hero Section */}
        <section className="relative h-[400px] sm:h-[500px] md:h-[600px] flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${background})` }}
          >
            <div className="absolute inset-0 bg-black/70" />
          </div>

          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 px-2">
              {t("hero.title")}
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-white/90 mb-6 sm:mb-8 px-2">
              {t("hero.subtitle")}
            </p>

            {/* Search Box */}
            <div className="bg-card/95 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-elegant max-w-2xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <div className="relative flex-1 w-full">
                  <Input
                    type="text"
                    placeholder={t("hero.placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="
    w-full h-10 sm:h-12 text-base sm:text-lg pr-10 sm:pr-12
    bg-gray-50 border border-gray-300 rounded-lg
    focus:border-[#0d3d7f] focus:ring-1 focus:ring-[#0d3d7f]
    transition-all
  "
                  />

                  {/* أيقونة الميكروفون */}

                  <button
                    type="button"
                    title="التحدث بدلاً من الكتابة"
                    className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full transition ${
                      isRTL ? "left-3" : "right-3"
                    }`}
                    style={{
                      backgroundColor: "rgba(13, 61, 127, 0.08)",
                      color: "#0d3d7f",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.6}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 18.75a4.5 4.5 0 0 0 4.5-4.5V6.75a4.5 4.5 0 1 0-9 0v7.5a4.5 4.5 0 0 0 4.5 4.5zM19.5 10.5v3a7.5 7.5 0 0 1-15 0v-3m7.5 7.5V21m-3 0h6"
                      />
                    </svg>
                  </button>
                </div>
                {/* search button */}
                <Button
                  size="lg"
                  className={`
    flex items-center justify-center
    bg-gradient-to-r from-[#0d3d7f] to-[#1e69c8] 
    hover:from-[#1e69c8] hover:to-[#0d3d7f] 
    text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all
  `}
                >
                  <Search
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "mr-2" : "ml-2"}`}
                  />
                  {t("hero.search")}
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-8 sm:py-12 md:py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-center text-[#0d3d7f] mb-6 sm:mb-8 md:mb-10">
              {t("categories.title", "Browse by Property Type")}
            </h2>

            <div className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16">
              {[
                {
                  name: t("categories.APARTMENT"),
                  path: "/",
                  img: "/icons/apartment.jpg",
                },
                {
                  name: t("categories.HOUSE"),
                  path: "/",
                  img: "/icons/villa.jpg",
                },
                {
                  name: t("categories.STORE"),
                  path: "/",
                  img: "/icons/shop.jpg",
                },
                {
                  name: t("categories.OFFICE"),
                  path: "/",
                  img: "/icons/office.jpg",
                },
                {
                  name: t("categories.LAND"),
                  path: "/",
                  img: "/icons/land.jpg",
                },
              ].map((category) => (
                <Link
                  key={category.name}
                  to={category.path}
                  className="flex flex-col items-center group"
                >
                  <div
                    className="w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 flex items-center justify-center rounded-full bg-[#13478f] shadow-md 
        transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl overflow-hidden"
                  >
                    <img
                      src={category.img}
                      alt={category.name}
                      className="w-full h-full object-cover rounded-full transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>

                  <span className="mt-3 sm:mt-4 text-base sm:text-lg md:text-xl font-semibold text-gray-700 group-hover:text-[#13478f] transition-colors duration-300 text-center">
                    {category.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
        {/* Properties Section */}
        <section className="py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-10 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
                {t("propertiesSection.title")}
              </h2>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Sidebar */}

              {/* Properties Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading && (
                  <p className="text-center col-span-full">Loading...</p>
                )}

                {!loading && featuredProperties.length === 0 && (
                  <p className="text-center col-span-full text-gray-500">
                    {t(
                      "propertiesSection.noResults",
                      "No nearby properties found",
                    )}
                  </p>
                )}

                {featuredProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
