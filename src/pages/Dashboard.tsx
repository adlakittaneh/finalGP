import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import PropertyCard from "@/components/PropertyCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Clock, Home, Users } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import property3 from "@/assets/property-3.jpg";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/LanguageContext";

interface Country {
  id: number;
  name: string;
  nameAr: string;
  cities: { name: string; nameAr: string }[];
}

const Dashboard = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === "AR";

  const [countries, setCountries] = useState<Country[]>([]);
  const [cities, setCities] = useState<{ name: string; nameAr: string }[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [newCountryAr, setNewCountryAr] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newCityAr, setNewCityAr] = useState("");
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(null);

  // جلب الدول عند تحميل الصفحة
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res = await fetch("http://easyaqar.org/api/locations/countries?page=0&size=100", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        });
        const json = await res.json();
        const list = Array.isArray(json.content)
          ? json.content.map((c: any) => ({ id: c.id, name: c.name, nameAr: c.nameAr, cities: [] }))
          : [];
        setCountries(list);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
        setCountries([]);
      }
    };
    fetchCountries();
  }, []);

  // جلب المدن عند اختيار الدولة
  const fetchCities = async (countryId: number) => {
    try {
      const res = await fetch(`http://easyaqar.org/api/locations/cities/country/${countryId}?page=0&size=100`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const json = await res.json();
      const list = Array.isArray(json.content) ? json.content.map((c: any) => ({ name: c.name, nameAr: c.nameAr })) : [];
      setCities(list);

      // تحديث المدن في state countries
      setCountries(prev => prev.map(c => c.id === countryId ? { ...c, cities: list } : c));
    } catch (err) {
      console.error("Failed to fetch cities:", err);
      setCities([]);
    }
  };

  const stats = [
    { title: t("dashboard.pending_review"), value: "3", icon: Clock, color: "text-yellow-500" },
    { title: t("dashboard.published_properties"), value: "12", icon: Home, color: "text-green-500" },
    { title: t("dashboard.total_users"), value: "248", icon: Users, color: "text-blue-500" },
  ];

  const pendingProperties = [
    {
      id: "1",
      title: "شقة مفروشة",
      type: "للإيجار" as const,
      propertyType: "شقة",
      city: "رام الله",
      capital: "فلسطين",
      price: 1200,
      images: [property1, property2],
      description: "شقة حديثة مفروشة بالكامل في موقع مميز",
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      yearBuilt: 2020,
      furnished: true,
    },
    {
      id: "2",
      title: "فيلا للبيع",
      type: "للبيع" as const,
      propertyType: "فيلا",
      city: "نابلس",
      capital: "فلسطين",
      price: 350000,
      images: [property2, property3],
      description: "فيلا فاخرة مع حديقة واسعة",
      area: 300,
      bedrooms: 5,
      bathrooms: 4,
      parking: 2,
      yearBuilt: 2019,
      furnished: false,
    },
    {
      id: "3",
      title: "مكتب تجاري",
      type: "للإيجار" as const,
      propertyType: "مكتب",
      city: "القدس",
      capital: "فلسطين",
      price: 2500,
      images: [property3, property1],
      description: "مكتب تجاري في موقع استراتيجي",
      area: 150,
      bedrooms: 0,
      bathrooms: 2,
      parking: 3,
      yearBuilt: 2021,
      furnished: true,
    },
  ];

  const handleAddCountry = async () => {
    if (!newCountry || !newCountryAr) {
      alert("يرجى إدخال الاسم بالإنجليزي والعربي");
      return;
    }
    if (countries.find(c => c.name.toLowerCase() === newCountry.toLowerCase() || c.nameAr === newCountryAr)) {
      alert("الدولة موجودة بالفعل!");
      return;
    }
    try {
      const res = await fetch("http://easyaqar.org/api/admin/countries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: newCountry, nameAr: newCountryAr }),
      });
      const addedCountry = await res.json();
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
    }
  };

 const handleAddCity = async () => {
  if (!selectedCountryId || !newCity || !newCityAr) {
    alert("يرجى إدخال اسم المدينة بالإنجليزي والعربي");
    return;
  }
  try {
    const res = await fetch("http://easyaqar.org/api/admin/cities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: newCity,
        nameAr: newCityAr,
        countryId: selectedCountryId,
      }),
    });

    const addedCity = await res.json();

    // تحديث state countries:ة
    setCountries(prev =>
      prev.map(c =>
        c.id === selectedCountryId
          ? { ...c, cities: [...c.cities, { name: addedCity.name, nameAr: addedCity.nameAr }] }
          : c
      )
    );
    setCities(prev => [...prev, { name: addedCity.name, nameAr: addedCity.nameAr }]);
    setNewCity("");
    setNewCityAr("");
  } catch (err) {
    console.error("Failed to add city:", err);
    alert("فشل إضافة المدينة، حاول مرة أخرى.");
  }
};


  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">{t("navbar.dashboard")}</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
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
          <div className="mb-12 border-t pt-6">
            <h2 className="text-2xl font-bold mb-6">إدارة الدول والمدن</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* إضافة دولة */}
<Card className="p-4">
  <CardTitle>إضافة دولة جديدة</CardTitle>
  <div className="flex gap-2 mt-2">
    <input
      type="text"
      placeholder="اسم الدولة بالإنجليزي"
      value={newCountry}
      onChange={(e) => setNewCountry(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
    <input
      type="text"
      placeholder="اسم الدولة بالعربي"
      value={newCountryAr}
      onChange={(e) => setNewCountryAr(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
    <Button onClick={handleAddCountry}>أضف</Button>
  </div>
</Card>

{/* إضافة مدينة */}
<Card className="p-4">
  <CardTitle>إضافة مدينة جديدة</CardTitle>
  <div className="flex gap-2 mt-2">
    <select
      value={selectedCountryId || ""}
      onChange={(e) => {
        const id = Number(e.target.value);
        setSelectedCountryId(id);
        fetchCities(id);
      }}
      className="border rounded px-2 py-1 flex-1"
    >
      <option value="">اختر دولة</option>
      {countries.map(c => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
    <input
      type="text"
      placeholder="اسم المدينة بالإنجليزي"
      value={newCity}
      onChange={(e) => setNewCity(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
    <input
      type="text"
      placeholder="اسم المدينة بالعربي"
      value={newCityAr}
      onChange={(e) => setNewCityAr(e.target.value)}
      className="border rounded px-2 py-1 flex-1"
    />
    <Button onClick={handleAddCity}>أضف</Button>
  </div>

  {/* عرض المدن */}
  <div className="mt-4 space-y-1">
    {cities.length === 0 ? (
      <p>لا توجد مدن حالياً</p>
    ) : (
      cities.map((city, index) => (
        <div key={`${city.name}-${index}`} className="border p-1 rounded">{city.nameAr}</div>
      ))
    )}
  </div>
</Card>

            </div>
          </div>

          {/* Pending Properties */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">{t("dashboard.pending_properties")}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProperties.map((property) => (
                <div key={property.id} className="space-y-3">
                  <PropertyCard {...property} showActions={false} />
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1 bg-green-500 hover:bg-green-600">
                      <CheckCircle className={`w-4 h-4 ${isRTL ? "mr-1" : "ml-1"}`} />
                      {t("dashboard.approve")}
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 hover:bg-destructive hover:text-destructive-foreground">
                      <XCircle className={`w-4 h-4 ${isRTL ? "mr-1" : "ml-1"}`} />
                      {t("dashboard.reject")}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
