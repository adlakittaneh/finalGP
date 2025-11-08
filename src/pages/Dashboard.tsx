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

const Dashboard = () => {
  const { t } = useTranslation();

  const stats = [
    {
      title: t("dashboard.pending_review"),
      value: "3",
      icon: Clock,
      color: "text-yellow-500",
    },
    {
      title: t("dashboard.published_properties"),
      value: "12",
      icon: Home,
      color: "text-green-500",
    },
    {
      title: t("dashboard.total_users"),
      value: "248",
      icon: Users,
      color: "text-blue-500",
    },
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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-8">{t("navbar.dashboard")}</h1>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => (
              <Card key={index} className="shadow-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pending Properties */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6">
              {t("dashboard.pending_properties")}
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingProperties.map((property) => (
                <div key={property.id} className="space-y-3">
                  <PropertyCard {...property} showActions={false} />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1 bg-green-500 hover:bg-green-600"
                    >
                      <CheckCircle className="w-4 h-4 ml-1" />
                      {t("dashboard.approve")}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 hover:bg-destructive hover:text-destructive-foreground"
                    >
                      <XCircle className="w-4 h-4 ml-1" />
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
