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

const Index = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const isRTL = language === "AR";

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />
       <SearchSidebar />
<div
  className={`flex-1 ${
    isRTL ? "lg:mr-72" : "lg:ml-72"
  }`}
>

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
  <Search className={`w-4 h-4 sm:w-5 sm:h-5 ${isRTL ? "mr-2" : "ml-2"}`} />
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
    { name: t("categories.APARTMENT"), path: "/properties/apartments", img: "/icons/apartment.jpg" },
    { name: t("categories.HOUSE"), path: "/properties/villas", img: "/icons/villa.jpg" },
    { name: t("categories.STORE"), path: "/properties/shops", img: "/icons/shop.jpg" },
    { name: t("categories.OFFICE"), path: "/properties/offices", img: "/icons/office.jpg" },
    { name: t("categories.LAND"), path: "/properties/lands", img: "/icons/land.jpg" },
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
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">{t("propertiesSection.title")}</h2>
          </div>

       <div className="flex flex-col lg:flex-row gap-6">

  {/* Sidebar */}

  {/* Properties Grid */}


</div>

        </div>
      </section>
</div>
      <Footer />
    </div>
  );
};

export default Index;
