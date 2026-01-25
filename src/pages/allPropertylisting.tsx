import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/api/apiFetch";
import { useTranslation } from "react-i18next";
import PropertyCard from "@/components/PropertyCard";
import { PropertyCardProps } from "@/components/PropertyCard";
import { toast } from "react-toastify";
interface User {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  role: string;
}

interface PropertyItem extends PropertyCardProps {
  propertyType: string;
}

export default function AllPropertyListing() {
  const [totalUsers, setTotalUsers] = useState(0);
  const [usersMap, setUsersMap] = useState<Record<number, User>>({});
  const [listings, setListings] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const { t } = useTranslation();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);


  const API_BASE = "/api";

  // تصنيف العقارات حسب النوع - تأكد من تضمين جميع الأنواع
  const categorized: Record<string, PropertyItem[]> = {
    HOUSE: [],
    APARTMENT: [],
    LAND: [],
    OFFICE: [],
    STORE: [],
    // أضف أي أنواع أخرى إذا كانت موجودة في البيانات
  };

  // تصنيف العقارات
  listings.forEach((item) => {
    if (item.propertyType && categorized[item.propertyType]) {
      categorized[item.propertyType].push(item);
    }
  });

useEffect(() => {
  const fetchMe = async () => {
    try {
      const userData = await apiFetch(`${API_BASE}/auth/me`, {
        method: "GET",
      });

      setIsAdmin(userData.role === "ADMIN");
    } catch (err) {
      console.error("Failed to fetch auth user", err);
      setIsAdmin(false); // افتراضيًا مستخدم عادي
    }
  };

  fetchMe();
}, []);
useEffect(() => {
  if (isAdmin === true) {
    getAllUsers();
  }
}, [isAdmin]);
  useEffect(() => {
  if (isAdmin === null) return;

  const fetchAllListings = async () => {
    try {
      const data = await apiFetch(
        `${API_BASE}/listings?page=0&size=20`,
        { method: "GET" }
      );

      let adaptedProperties: PropertyItem[] = [];

      if (Array.isArray(data?.content)) {
        adaptedProperties = data.content.map((prop: any) => ({
          id: prop.id.toString(),
          type: prop.listingType === "RENT" ? "للإيجار" : "للبيع",
          city: prop.cityName || "",
          capital: prop.countryName || "",
          propertyType: prop.propertyType,
          title: prop.title || "",
          titleAr: prop.titleAr || "",
          price: prop.price || 0,
          area: prop.area,
          bedrooms: prop.bedrooms,
          bathrooms: prop.bathrooms,
          parking: prop.parking,
          yearBuilt: prop.yearBuilt,
          furnished: prop.furnished,
          userId: prop.userId,

          // ⭐ الفرق المهم
          owner: isAdmin ? usersMap[prop.userId] : undefined,

          isAdmin,
          showActions: false,
          englishDescription: prop.description,
          arabicDescription: prop.descriptionAr,
          mediaFromAPI: prop.media,
        }));
      }

      setListings(adaptedProperties);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setListings([]);
      setLoading(false);
    }
  };

  // للأدمن نستنى usersMap، لغير الأدمن لا
  if (!isAdmin || Object.keys(usersMap).length > 0) {
    fetchAllListings();
  }
}, [isAdmin, usersMap]);

  const getAllUsers = async () => {
    try {
      const data = await apiFetch(`${API_BASE}/admin/users?page=0&size=1000`, {
        method: "GET",
      });

      if (Array.isArray(data?.content)) {
        setTotalUsers(data.content.length);

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

  const toggleSection = (type: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Navbar />

      <h1
        className="text-3xl font-bold my-10 text-center mb-4 mt-8"
        style={{ color: "#144a95" }}
      >
        {t("categories.title") || "All Properties"}
      </h1>

      {Object.entries(categorized).map(([type, items]) => {
        const isExpanded = expandedSections[type];
        const visibleItems = isExpanded ? items : items.slice(0, 3);

        return (
          <div key={type} className="mb-14">
            <h2
              className="text-2xl font-bold mb-6"
              style={{ color: "#144a95" }}
            >
              {t(`propertyTypes.${type}`) || type}
            </h2>

            {items.length === 0 ? (
              <div className="text-muted-foreground mb-8">
                <p>{t("categories.Noproperties")}</p>
                <div className="border-b border-gray-300 pb-4"></div>
              </div>
            ) : (
              <>
                <div className="w-4/5 mx-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {visibleItems.map((property) => (
                      <PropertyCard
                        key={property.id}
                        {...property}
                      />
                    ))}
                  </div>
                </div>
                
                {items.length > 3 && (
                  <div className="flex justify-center mt-8">
                    <button
                      onClick={() => toggleSection(type)}
                      className="px-6 py-2 rounded-lg border font-medium hover:bg-muted transition"
                    >
                      {isExpanded
                        ? t("categories.ViewLess")
                        : t("categories.viewMore")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        );
      })}

      <Footer />
    </div>
  );
}