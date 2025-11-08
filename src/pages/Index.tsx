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
import heroVideo from "@/assets/aqar.mp4"; 
import property2 from "@/assets/property-2.jpg";
import nablusVideo from "@/assets/nablus.mp4";
const Index = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const isArabic = i18n.language === "ar" || i18n.language === "AR" ;


  const sampleProperties: PropertyCardProps[] = [
    {
      id: "1",
      type: "للبيع",
      propertyType: "شقه",
      city: "نابلس",
      capital: "فلسطين",
      price: 800,
      images: [
        "https://assets.architecturaldesigns.com/cdn-cgi/image/width=3840,quality=85,format=auto/plan_assets/325003993/original/23849JD_09_1580830449.jpg",
        property2,
      
      ],
      arabicDescription:"شقه حديثه في وسط المدينه",
      englishDescription: "Modern apartment in the city center",
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
      parking: 1,
      yearBuilt: 2020,
      furnished: false,
    },
    {
      id: "2",
      type: "للبيع",
      propertyType: "فيلا",
      city: "رام الله",
      capital: "فلسطين",
      price: 450000,
      images: [
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvxW-Yn_MqqrawaT2DCFQM1mbQtMo-Dp_xHw&s",
      ],
      video: nablusVideo,
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
      images: [
        "https://cdn.salla.sa/BrBRDA/d7c29daa-ad9a-4837-a47e-e302cd4e6c6a-1000x1000-KSlaRoOR9Kna2nFlgRVsDmzHMfUZ346QUbXkLfYr.jpg",
      ],
      arabicDescription: "مكتب مجهز بالكامل في موقع استراتيجي",
      englishDescription: "Fully equipped office in a strategic location",
      area: 200,
      bathrooms: 2,
      parking: 5,
      yearBuilt: 2022,
      furnished: true,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${background})` }}
        >
          <div className="absolute inset-0 bg-black/70" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            {t("hero.title")}
          </h1>
          <p className="text-xl text-white/90 mb-8">
            {t("hero.subtitle")}
          </p>

          {/* Search Box */}
         <div className="bg-card/95 backdrop-blur-md rounded-2xl p-4 shadow-elegant max-w-2xl mx-auto">
  <div className="flex gap-3 items-center">
    <div className="relative flex-1">
      <Input
        type="text"
        placeholder={t("hero.placeholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full h-12 text-lg pr-12"
      />
      {/* أيقونة الميكروفون */}

    <button
  type="button"
  title="التحدث بدلاً من الكتابة"
  className={`absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-8 h-8 rounded-full transition ${
    isArabic ? "left-3" : "right-3"
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

    <Button size="lg" className="gradient-primary px-8">
      <Search className="w-5 h-5 ml-2" />
      {t("hero.search")}
    </Button>
  </div>
</div>
        </div>
      </section>

      {/* Categories Section */}
     <section className="py-16 bg-gray-50">
  <h2 className="text-3xl font-bold text-center text-[#0d3d7f] mb-10">
    {t("categories.title", "Browse by Property Type")}
  </h2>

  <div className="flex flex-wrap justify-center gap-14">
    {[
      { name: t("categories.apartments"), path: "/properties/apartments", icon: "🏠" },
      { name: t("categories.villas"), path: "/properties/villas", icon: "🏘️" },
      { name: t("categories.shops"), path: "/properties/shops", icon: "🏬" },
      { name: t("categories.offices"), path: "/properties/offices", icon: "🏢" },
      { name: t("categories.lands"), path: "/properties/lands", icon: "🌍" },
    ].map((category) => (
      <Link
        key={category.name}
        to={category.path}
        className="flex flex-col items-center group"
      >
        {/* الدائرة التي تحتوي على الأيقونة */}
        <div
          className="w-28 h-28 flex items-center justify-center rounded-full bg-[#13478f] text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-2xl"
        >
          <span className="text-5xl">{category.icon}</span>
        </div>

        {/* اسم نوع العقار تحت الدائرة */}
        <span className="mt-4 text-lg font-semibold text-gray-700 group-hover:text-[#13478f] transition-colors duration-300">
          {category.name}
        </span>
      </Link>
    ))}
  </div>
</section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12"></div>

          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto mt-16">
            <div>
              <h3 className="text-3xl font-bold mb-6">{t("features.title")}</h3>
              <div className="space-y-4">
                {[
                  { title: t("features.easy.title"), text: t("features.easy.text") },
                  { title: t("features.safe.title"), text: t("features.safe.text") },
                  { title: t("features.support.title"), text: t("features.support.text") },
                ].map((item) => (
                  <div className="flex gap-4" key={item.title}>
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: "transparent",
                        border: "2px solid #13478f",
                      }}
                    >
                      <span className="text-2xl" style={{ color: "#13478f" }}>
                        ✓
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{item.title}</h4>
                      <p className="text-muted-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Video Section */}
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-elegant">
              <video
                className="w-full h-full object-cover"
                src={heroVideo}
                autoPlay
                loop
                muted
                playsInline
              />
            </div>
          </div>
        </div>
      </section>

      {/* Properties Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t("propertiesSection.title")}</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sampleProperties.map((property) => (
              <PropertyCard key={property.id} {...property} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
