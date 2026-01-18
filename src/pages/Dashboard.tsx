import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import PropertyCard from "@/components/PropertyCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Home, Users, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";
import { API_BASE } from "./config/api";
import { apiFetch } from "../api/apiFetch";
import { adaptBackendResponseToPropertyCards, getPropertyTitle, BackendPageableResponse } from "@/lib/propertyAdapter";
import { PropertyCardProps } from "@/components/PropertyCard";
import { ToastContainer, toast } from "react-toastify";


interface City {
  id: number;
  name: string;
  nameAr: string;
}

interface Country {
  id: number;
  name: string;
  nameAr: string;
  cities: City[];
}
const confirmToast = (message: string, onConfirm: () => void) => {
  toast(
    ({ closeToast }) => (
      <div className="space-y-2">
        <p>{message}</p>
        <div className="flex gap-2 justify-end">
          <button
            className="px-3 py-1 bg-gray-200 rounded"
            onClick={closeToast}
          >
            إلغاء
          </button>
          <button
            className="px-3 py-1 bg-red-500 text-white rounded"
            onClick={() => {
              onConfirm();
              closeToast();
            }}
          >
            تأكيد
          </button>
        </div>
      </div>
    ),
    { autoClose: false }
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "AR";
const [totalUsers, setTotalUsers] = useState(0);
const [publishedProperties, setPublishedProperties] = useState(0);
const [pendingReviews, setPendingReviews] = useState(0);
const [pendingProperties, setPendingProperties] = useState<PropertyCardProps[]>([]);

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [newCountryAr, setNewCountryAr] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCityAr, setNewCityAr] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);
  // جلب الدول عند تحميل الصفحة
  useEffect(() => {
  const fetchCountries = async () => {
  try {
    const data = await apiFetch(`${API_BASE}/locations/countries?page=0&size=20`, {
      method: "GET",
    });
    const list = Array.isArray(data?.content)
      ? data.content.map((c: any) => ({
          id: c.id,
          name: c.name,
          nameAr: c.nameAr,
          cities: [],
        }))
      : [];

    setCountries(list);

  } catch (err) {
    console.error("Failed to fetch countries:", err);
    setCountries([]);
  }
};
  getAllUsers();
  fetchPublishedPropertiesCount();
    fetchCountries();
  }, []);
  useEffect(() => {
  const fetchPendingProperties = async () => {
    try {
      const data: BackendPageableResponse = await apiFetch(`${API_BASE}/admin/listings/pending?page=0&size=20`, {
        method: "GET",
      });

      if (data?.content && Array.isArray(data.content)) {
        // Use adapter to convert backend data to PropertyCard format
        const adaptedProperties = adaptBackendResponseToPropertyCards(data);
        setPendingProperties(adaptedProperties);
        setPendingReviews(adaptedProperties.length); // تحديث عدد المراجعات المعلقة
      } else {
        setPendingProperties([]);
        setPendingReviews(0);
      }

    } catch (err) {
      console.error("Failed to fetch pending properties:", err);
      setPendingProperties([]);
      setPendingReviews(0);
    }
  };

  fetchPendingProperties();
}, []);

  const handleApprove = async (propertyId: string) => {
    try {
      await apiFetch(`${API_BASE}/admin/listings/${propertyId}/approve`, {
        method: "PUT",
      });
            setPendingProperties(prev => prev.filter(prop => prop.id !== propertyId));
      setPendingReviews(prev => Math.max(0, prev - 1));
      
      toast.success(t("dashboard.approved_success"));
    } catch (err) {
      console.error("Failed to approve property:", err);
      alert(t("dashboard.approve_failed"));
    }
  };

  // دالة رفض العقار
  const handleReject = async (propertyId: string) => {
    if (!confirm(t("dashboard.confirm_reject"))) {
      return;
    }
    
    try {
      await apiFetch(`${API_BASE}/admin/listings/${propertyId}/reject`, {
        method: "PUT",
      });
      
      // إزالة العقار من القائمة بعد الرفض
      setPendingProperties(prev => prev.filter(prop => prop.id !== propertyId));
      setPendingReviews(prev => Math.max(0, prev - 1));
      
     toast.success(t("dashboard.rejected_success"));
    } catch (err) {
      console.error("Failed to reject property:", err);
      alert(t("dashboard.reject_failed"));
    }
  };


  // جلب المدن عند اختيار الدولة
 const fetchCities = async (countryId: number) => {
  try {
    const data = await apiFetch(
      `${API_BASE}/locations/cities/country/${countryId}?page=0&size=20`,
      {
        method: "GET",
      }
    );

    const list = Array.isArray(data?.content)
      ? data.content.map((c: any) => ({ id: c.id, name: c.name, nameAr: c.nameAr }))
      : [];

    setCities(list);

    // تحديث المدن في state countries
    setCountries(prev =>
      prev.map(c => (c.id === countryId ? { ...c, cities: list } : c))
    );

  } catch (err) {
    console.error("Failed to fetch cities:", err);
    setCities([]);
  }
};
const getAllUsers = async () => {
  try {
    const data = await apiFetch(`${API_BASE}/admin/users?page=0&size=1000`, {
      method: "GET",
    });

    if (Array.isArray(data?.content)) {
      setTotalUsers(data.content.length);
    }

  } catch (err) {
    console.error("Failed to fetch users:", err);
  }
};

  const stats = [
    { title: t("dashboard.pending_review"), value: pendingReviews, icon: Clock, color: "text-yellow-500" },
    { title: t("dashboard.published_properties"), value:publishedProperties, icon: Home, color: "text-green-500" },
    { title: t("dashboard.total_users"), value:totalUsers, icon: Users, color: "text-blue-500" },
  ];
  const fetchPublishedPropertiesCount = async () => {
  try {
    const data = await apiFetch(
      `${API_BASE}/listings?approved=true&page=0&size=1`,
      { method: "GET" }
    );

    if (typeof data?.totalElements === "number") {
      setPublishedProperties(data.totalElements);
    } else {
      setPublishedProperties(0);
    }
  } catch (err) {
    console.error("Failed to fetch published properties count:", err);
    setPublishedProperties(0);
  }
};


 const handleAddCountry = async () => {
  if (!newCountry || !newCountryAr) {
    toast.warning(t("dashboard.enter_name_both"));
    return;
  }

  if (
    countries.find(
      c => c.name.toLowerCase() === newCountry.toLowerCase() || c.nameAr === newCountryAr
    )
  ) {
    toast.info(t("dashboard.country_exists"));
    return;
  }

  try {
    const addedCountry = await apiFetch(`${API_BASE}/admin/countries`, {
      method: "POST",
      body: JSON.stringify({ name: newCountry, nameAr: newCountryAr }),
    });

    const newList = [...countries, { ...addedCountry, cities: [] }];
    setCountries(newList);
    setNewCountry("");
    setNewCountryAr("");

    if (addedCountry.id) {
      setSelectedCountryId(addedCountry.id);
      fetchCities(addedCountry.id);
    }

  } catch (err) {
    console.error("Failed to add country:", err);
   toast.error(t("dashboard.failed_add_country"));
  }
};


 const handleAddCity = async () => {
  if (!selectedCountryId || !newCity || !newCityAr) {
    alert(t("dashboard.enter_city_both"));
    return;
  }

  try {
    const addedCity = await apiFetch(`${API_BASE}/admin/cities`, {
      method: "POST",
      body: JSON.stringify({
        name: newCity,
        nameAr: newCityAr,
        countryId: selectedCountryId,
      }),
    });

    // تحديث state countries
    setCountries(prev =>
      prev.map(c =>
        c.id === selectedCountryId
          ? { ...c, cities: [...c.cities, { id: addedCity.id, name: addedCity.name, nameAr: addedCity.nameAr }] }
          : c
      )
    );

    setCities(prev => [...prev, { id: addedCity.id, name: addedCity.name, nameAr: addedCity.nameAr }]);
    setNewCity("");
    setNewCityAr("");

  } catch (err) {
    console.error("Failed to add city:", err);
    toast.error(t("dashboard.failed_add_city"));
  }
};

  // دالة حذف الدولة
  const handleDeleteCountry = async (countryId: number) => {
  const country = countries.find(c => c.id === countryId);
  const countryName =
    language === "AR" ? (country?.nameAr || country?.name) : country?.name;

  confirmToast(
    t("dashboard.confirm_delete_country", { name: countryName }),
    async () => {
      try {
        // التحقق من وجود مدن قبل محاولة الحذف
        let countryCities: City[] = [];

        try {
          const citiesData = await apiFetch(
            `${API_BASE}/locations/cities/country/${countryId}?page=0&size=20`,
            { method: "GET" }
          );

          countryCities = Array.isArray(citiesData?.content)
            ? citiesData.content.map((c: any) => ({
                id: c.id,
                name: c.name,
                nameAr: c.nameAr,
              }))
            : [];

          // تحديث الـ state بالمدن
          setCountries(prev =>
            prev.map(c =>
              c.id === countryId ? { ...c, cities: countryCities } : c
            )
          );
        } catch (err) {
          console.error("Failed to fetch cities:", err);
        }

        // التحقق من وجود مدن
        if (countryCities.length > 0) {
          toast.error(
            `${t("dashboard.country_has_cities", { name: countryName })}\n${t(
              "dashboard.country_has_cities_details"
            )}`,
            { autoClose: 6000 }
          );
          return;
        }

        // إذا لم تكن هناك مدن، متابعة الحذف
        await apiFetch(`${API_BASE}/admin/countries/${countryId}`, {
          method: "DELETE",
        });

        // إزالة الدولة من القائمة
        setCountries(prev => prev.filter(c => c.id !== countryId));

        // إذا كانت الدولة المحددة هي المحذوفة، إعادة تعيين
        if (selectedCountryId === countryId) {
          setSelectedCountryId(null);
          setCities([]);
        }

        toast.success(t("dashboard.country_deleted_success"));
      } catch (err: any) {
        console.error("Failed to delete country:", err);

        if (err?.status === 409 || err?.response?.status === 409) {
          toast.error(
            `${t("dashboard.country_has_cities", { name: countryName })}\n${t(
              "dashboard.country_has_cities_details"
            )}`,
            { autoClose: 6000 }
          );
        } else {
          toast.error(t("dashboard.failed_delete_country"));
        }
      }
    }
  );
};

const handleDeleteCity = async (cityId: number) => {
  const city = cities.find(c => c.id === cityId);
  const cityName =
    language === "AR" ? (city?.nameAr || city?.name) : city?.name;

  confirmToast(
    t("dashboard.confirm_delete_city", { name: cityName }),
    async () => {
      try {
        // فحص إذا في عقارات مرتبطة بالمدينة
        let hasListings = false;

        try {
          const listingsData = await apiFetch(
            `${API_BASE}/listings?cityId=${cityId}&page=0&size=1`,
            { method: "GET" }
          );

          hasListings = listingsData?.totalElements > 0;
        } catch (err) {
          console.error("Failed to check listings:", err);
        }

        if (hasListings) {
          toast.error(
            `${t("dashboard.city_has_properties_title", { name: cityName })}\n\n` +
              `${t("dashboard.city_has_properties_reason")}\n` +
              t("dashboard.city_has_properties_action"),
            { autoClose: 6000 }
          );
          return;
        }

        // تنفيذ الحذف
        await apiFetch(`${API_BASE}/admin/cities/${cityId}`, {
          method: "DELETE",
        });

        // تحديث state المدن
        setCities(prev => prev.filter(c => c.id !== cityId));

        // تحديث المدن داخل الدولة المختارة
        if (selectedCountryId) {
          setCountries(prev =>
            prev.map(c =>
              c.id === selectedCountryId
                ? { ...c, cities: c.cities.filter(ct => ct.id !== cityId) }
                : c
            )
          );
        }

        toast.success(t("dashboard.city_deleted_success"));
      } catch (err: any) {
        console.error("Failed to delete city:", err);
        if (err?.status === 409 || err?.response?.status === 409) {
          toast.error(
            `${t("dashboard.city_has_properties_title", { name: cityName })}\n\n` +
              `${t("dashboard.city_has_properties_reason")}\n` +
              t("dashboard.city_has_properties_action"),
            { autoClose: 6000 }
          );
        } else {
          toast.error(t("dashboard.failed_delete_city"));
        }
      }
    }
  );
};




  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-8 sm:py-10 md:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8">{t("navbar.dashboard")}</h1>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10 md:mb-12">
            {stats.map((stat) => (
              <Card key={stat.title} className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* إدارة الدول والمدن */}
          <div className="mb-8 sm:mb-10 md:mb-12 border-t pt-4 sm:pt-6">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("dashboard.manage_locations")}</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
              {/* إضافة دولة */}
              <Card className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4">{t("dashboard.add_country")}</CardTitle>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <input
                    type="text"
                    placeholder={t("dashboard.country_name_en")}
                    value={newCountry}
                    onChange={(e) => setNewCountry(e.target.value)}
                    className="border rounded-md px-3 py-2 sm:py-2.5 text-sm sm:text-base w-full"
                  />
                  <input
                    type="text"
                    placeholder={t("dashboard.country_name_ar")}
                    value={newCountryAr}
                    onChange={(e) => setNewCountryAr(e.target.value)}
                    className="border rounded-md px-3 py-2 sm:py-2.5 text-sm sm:text-base w-full"
                  />
                  <Button 
                    onClick={handleAddCountry} 
                    className="w-full sm:w-auto sm:self-start mt-1 sm:mt-0"
                  >
                    {t("dashboard.add")}
                  </Button>
                </div>

                {/* قائمة الدول */}
                {countries.length > 0 && (
                  <div className="mt-4 sm:mt-5 pt-4 border-t">
                    <p className="text-sm font-medium mb-2 sm:mb-3">{t("dashboard.countries_list")}</p>
                    <div className="space-y-2 max-h-40 sm:max-h-48 overflow-y-auto">
                      {countries.map((country) => (
                        <div 
                          key={country.id} 
                          className="flex items-center justify-between border rounded-md p-2 sm:p-2.5 text-sm bg-muted/50 gap-2"
                        >
                          <span className="flex-1 truncate">
                            {language === "AR" ? country.nameAr : country.name}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCountry(country.id)}
                            className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* إضافة مدينة */}
              <Card className="p-4 sm:p-5 md:p-6">
                <CardTitle className="text-base sm:text-lg md:text-xl mb-3 sm:mb-4">{t("dashboard.add_city")}</CardTitle>
                <div className="flex flex-col gap-2 sm:gap-3">
                  <select
                    value={selectedCountryId || ""}
                    onChange={(e) => {
                      const id = Number(e.target.value);
                      setSelectedCountryId(id);
                      fetchCities(id);
                    }}
                    className="border rounded-md px-3 py-2 sm:py-2.5 text-sm sm:text-base w-full"
                  >
                    <option value="">{t("dashboard.select_country")}</option>
                    {countries.map(c => (
                      <option key={c.id} value={c.id}>
                        {language === "AR" ? (c.nameAr || c.name) : c.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder={t("dashboard.city_name_en")}
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="border rounded-md px-3 py-2 sm:py-2.5 text-sm sm:text-base w-full"
                  />
                  <input
                    type="text"
                    placeholder={t("dashboard.city_name_ar")}
                    value={newCityAr}
                    onChange={(e) => setNewCityAr(e.target.value)}
                    className="border rounded-md px-3 py-2 sm:py-2.5 text-sm sm:text-base w-full"
                  />
                  <Button 
                    onClick={handleAddCity} 
                    className="w-full sm:w-auto sm:self-start mt-1 sm:mt-0"
                  >
                    {t("dashboard.add")}
                  </Button>
                </div>

                {/* عرض المدن */}
                {selectedCountryId && (
                  <div className="mt-4 sm:mt-5 pt-4 border-t">
                    <p className="text-sm font-medium mb-2 sm:mb-3">{t("dashboard.cities_list")}</p>
                    <div className="space-y-2 max-h-32 sm:max-h-40 overflow-y-auto">
                      {cities.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{t("dashboard.no_cities")}</p>
                      ) : (
                        cities.map((city) => (
                          <div 
                            key={city.id} 
                            className="flex items-center justify-between border rounded-md p-2 sm:p-2.5 text-sm bg-muted/50 gap-2"
                          >
                            <span className="flex-1 truncate">
                              {language === "AR" ? city.nameAr : city.name}
                            </span>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCity(city.id)}
                              className="flex-shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </div>

          {/* Pending Properties */}
          <div className="mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">{t("dashboard.pending_properties")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {pendingProperties.length === 0 ? (
                <p className="text-muted-foreground col-span-full text-center py-8">{t("dashboard.no_pending_properties")}</p>
              ) : (
                pendingProperties.map((prop) => (
                  <div key={prop.id} className="flex flex-col gap-3">
                    <PropertyCard
                      {...prop}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(prop.id)}
                        className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t("dashboard.approve")}
                      </Button>
                      <Button
                        onClick={() => handleReject(prop.id)}
                        variant="destructive"
                        className="flex-1"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        {t("dashboard.reject")}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

        </div>
        
      </main>

      <Footer />
      <ToastContainer
  position="top-right"
  autoClose={4000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  rtl={isRTL}
/>

    </div>
  );
};

export default Dashboard;
