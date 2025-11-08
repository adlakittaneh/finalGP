import { useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/ChatButton";
import PropertyCard from "@/components/PropertyCard";
import LocationPickerDialog from "@/components/LocationPickerDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PlusCircle, Upload, MapPin, X } from "lucide-react";
import property1 from "@/assets/property-1.jpg";
import property2 from "@/assets/property-2.jpg";
import nablusVideo from "@/assets/nablus.mp4";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

const AddProperty = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<{ type: 'image' | 'video'; file: File; preview: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [propertyType, setPropertyType] = useState<string>(""); // نوع العقار المختار

  //  منطق تعطيل الحقول حسب نوع العقار
 const isFieldDisabled = (field: string) => {
  if (propertyType === "land") {
    return ["bedrooms", "bathrooms", "parking", "yearBuilt", "furnished"].includes(field);
  }
  if (propertyType === "office") {
    return ["bedrooms"].includes(field);
  }
  if (propertyType === "shop") {
    return ["parking"].includes(field);
  }
  return false; // باقي الأنواع ما فيها تعطيل
};


  const myProperties = [
    {
      id: "1",
 type: "للبيع",   
    propertyType: "شقة",
        city: "رام الله",
      capital: "فلسطين",
      price: 800,
      images: [property1, property2],
      video: nablusVideo,
      arabicDescription: "فيلا فاخرة بمساحات واسعة وتصميم عصري",
      englishDescription: "Luxury villa with spacious areas and modern design",
      area: 120,
      bedrooms: 3,
      bathrooms: 2,
       parking: 3,
      yearBuilt: 2021,
      furnished: false,
      showActions: true,
    },
  ];

  const handleLocationSelected = (selectedLocation: { lat: number; lng: number; address: string }) => {
    setLocation(selectedLocation);
    toast({
      title: t("propertyCard.locationRetrieved"),
      description: selectedLocation.address,
    });
    // إغلاق نافذة اختيار الموقع وفتح نافذة إدخال التفاصيل تلقائياً
    setShowLocationPicker(false);
    setShowAddForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFiles((prev) => [...prev, {
          type: file.type.startsWith('video/') ? 'video' : 'image',
          file,
          preview: reader.result as string,
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location) console.log("Location:", location);
    console.log("Uploaded files:", uploadedFiles);
    setLocation(null);
    setUploadedFiles([]);
    setShowAddForm(false);
  };

  const handleDialogClose = (open: boolean) => {
    setShowAddForm(open);
    if (!open) {
      // عند إغلاق نافذة التفاصيل، نعيد تعيين الموقع إذا أراد المستخدم البدء من جديد
      // يمكنك إزالة هذا السطر إذا أردت الاحتفاظ بالموقع
      // setLocation(null);
      setUploadedFiles([]);
    }
  };

  // عند إغلاق نافذة اختيار الموقع بدون اختيار موقع
  const handleLocationPickerClose = (open: boolean) => {
    setShowLocationPicker(open);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <ChatButton />

      <main className="flex-1 py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-3">
              {t("addPropertyPage.headerTitle")}
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              {t("addPropertyPage.headerSubtitle")}
            </p>
            <Button
              size="lg"
              className="gradient-accent"
              onClick={() => setShowLocationPicker(true)}
            >
              <PlusCircle className="w-5 h-5 ml-2" />
              {t("addPropertyPage.addButton")}
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myProperties.map((property) => (
              <PropertyCard
                key={property.id}
                {...property}
                onEdit={() => console.log("Edit", property.id)}
                onDelete={() => console.log("Delete", property.id)}
              />
            ))}
          </div>
        </div>
      </main>

      <LocationPickerDialog
        open={showLocationPicker}
        onOpenChange={handleLocationPickerClose}
        onLocationSelected={handleLocationSelected}
        initialLocation={location}
      />

      <Dialog open={showAddForm && !!location} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {t("navbar.add_property")}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label>{t("propertyCard.location")}</Label>
              <div className="flex gap-2">
                <Input
                  id="location"
                  placeholder={location?.address || t("propertyCard.location")}
                  value={location?.address || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setShowLocationPicker(true);
                  }}
                  className="flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  {t("propertyCard.editLocation")}
                </Button>
              </div>
              {location && (
                <p className="text-xs text-muted-foreground">
                  الإحداثيات: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="descriptionAr">{t("propertyCard.description")} (AR)</Label>
                <Textarea id="descriptionAr" placeholder={t("propertyCard.description")} rows={3} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="descriptionEn">{t("propertyCard.description")} (EN)</Label>
                <Textarea id="descriptionEn" placeholder={t("propertyCard.description")} rows={3} />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="offerType">{t("propertyCard.offerType")}</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyCard.offerType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sale">{t("propertyCard.forSale")}</SelectItem>
                    <SelectItem value="rent">{t("propertyCard.forRent")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="propertyType">{t("propertyCard.propertyType")}</Label>
                <Select onValueChange={(value) => setPropertyType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("propertyCard.propertyType")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="apartment">{t("categories.apartments")}</SelectItem>
                    <SelectItem value="villa">{t("categories.villas")}</SelectItem>
                    <SelectItem value="land">{t("categories.lands")}</SelectItem>
                    <SelectItem value="office">{t("categories.offices")}</SelectItem>
                    <SelectItem value="shop">{t("categories.shops")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">{t("propertyCard.price")}</Label>
                <Input id="price" type="number" placeholder="0" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">{t("propertyCard.area")}</Label>
                <Input id="area" type="number" placeholder="0" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bedrooms">{t("propertyCard.bedrooms")}</Label>
                <Input id="bedrooms" type="number" placeholder="0" disabled={isFieldDisabled("bedrooms")} />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bathrooms">{t("propertyCard.bathrooms")}</Label>
                <Input id="bathrooms" type="number" placeholder="0" disabled={isFieldDisabled("bathrooms")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parking">{t("propertyCard.parking")}</Label>
                <Input id="parking" type="number" placeholder="0" disabled={isFieldDisabled("parking")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearBuilt">{t("propertyCard.yearBuilt")}</Label>
                <Input id="yearBuilt" type="number" placeholder="2024" disabled={isFieldDisabled("yearBuilt")} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="furnished"
                checked={furnished}
                onCheckedChange={(checked) => setFurnished(checked as boolean)}
                disabled={isFieldDisabled("furnished")}
              />
              <Label htmlFor="furnished" className="cursor-pointer">
                {t("propertyCard.furnished")}
              </Label>
            </div>

            <div className="space-y-2">
              <Label>{t("propertyCard.upload")}</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-smooth cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{t("propertyCard.selectFiles")}</p>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {uploadedFiles.map((item, index) => (
                    <div key={index} className="relative group">
                      {item.type === 'image' ? (
                        <img
                          src={item.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ) : (
                        <video
                          src={item.preview}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>{t("propertyCard.note")}</strong>
              </p>
            </div>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1 gradient-primary">
                {t("dashboard.approve")}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleDialogClose(false)}
              >
                {t("dashboard.reject")}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default AddProperty;
