import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    google: any;
    initMap: () => void;
    initGoogleMap: () => void;
  }
}

interface LocationPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLocationSelected: (location: { lat: number; lng: number; address: string }) => void;
  initialLocation?: { lat: number; lng: number; address: string } | null;
}

const LocationPickerDialog = ({
  open,
  onOpenChange,
  onLocationSelected,
  initialLocation,
}: LocationPickerDialogProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialLocation?.address || "");
  const [selectedAddress, setSelectedAddress] = useState(initialLocation?.address || "");
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number } | null>(
    initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null
  );

  // Update state when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setSelectedLocation({ lat: initialLocation.lat, lng: initialLocation.lng });
      setSelectedAddress(initialLocation.address);
      setSearchQuery(initialLocation.address);
    } else {
      setSelectedLocation(null);
      setSelectedAddress("");
      setSearchQuery("");
    }
  }, [initialLocation]);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const autocompleteRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);

  // Load Google Maps API
  useEffect(() => {
    if (!open) {
      // Reset mapLoaded when dialog closes
      setMapLoaded(false);
      return;
    }

    // Check if already loaded - always set to true if Google Maps is available
    if (window.google && window.google.maps && window.google.maps.Map) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setMapLoaded(true);
      }, 100);
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector('script#google-maps-script');
    if (existingScript) {
      // Wait for it to load
      const checkLoaded = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.Map) {
          setMapLoaded(true);
          clearInterval(checkLoaded);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkLoaded);
        if (!window.google || !window.google.maps) {
          console.error("Google Maps failed to load after timeout");
          setMapLoaded(false);
        }
      }, 10000);

      return () => clearInterval(checkLoaded);
    }

    // Get API key from environment variable
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    
    if (!apiKey || apiKey === "your_api_key_here") {
      console.warn("Google Maps API key not found or not set. Please set VITE_GOOGLE_MAPS_API_KEY in your .env file");
      setMapLoaded(false);
      return;
    }

    // Create and load script
    const script = document.createElement("script");
    script.id = "google-maps-script";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=ar&region=PS&callback=initGoogleMap`;
    script.async = true;
    script.defer = true;
    
    // Set up callback
    window.initGoogleMap = () => {
      if (window.google && window.google.maps && window.google.maps.Map) {
        setMapLoaded(true);
        setMapError(null);
      } else {
        setMapError("فشل تحميل خرائط Google. يرجى التحقق من API key.");
        setMapLoaded(false);
      }
      delete window.initGoogleMap;
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps API. Please check your API key.");
      setMapLoaded(false);
      setMapError("فشل تحميل خرائط Google. يرجى التحقق من API key.");
      if (window.initGoogleMap) {
        delete window.initGoogleMap;
      }
      toast({
        title: "خطأ في تحميل خرائط Google",
        description: "يرجى التحقق من API key في ملف .env والتأكد من تفعيله في Google Cloud Console",
        variant: "destructive",
      });
    };

    document.head.appendChild(script);

    // Cleanup function
    return () => {
      // Don't remove script to avoid reloading
      if (window.initGoogleMap) {
        delete window.initGoogleMap;
      }
    };
  }, [open]);

  // Initialize map and components
  useEffect(() => {
    if (!mapLoaded || !open || !window.google || !window.google.maps) {
      return;
    }

    // Wait for DOM to be ready
    let clickListener: any = null;
    const timeoutId = setTimeout(() => {
      const mapDiv = mapRef.current;
      if (!mapDiv) {
        console.warn("Map div not found");
        return;
      }

      let map = mapInstanceRef.current;

      // Always destroy and recreate map when dialog opens to ensure it displays correctly
      if (map) {
        try {
          // Clear all listeners
          if (window.google && window.google.maps && window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(map);
          }
          // Remove markers
          if (markerRef.current) {
            markerRef.current.setMap(null);
            markerRef.current = null;
          }
          // Clear map reference
          map = null;
          mapInstanceRef.current = null;
        } catch (e) {
          console.error("Error cleaning up old map:", e);
        }
      }

      // Determine center location
      const defaultCenter = selectedLocation || (initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null) || { lat: 32.2211, lng: 35.2544 };
      const defaultZoom = (selectedLocation || initialLocation) ? 15 : 10;

      // Initialize new map
      try {
        map = new window.google.maps.Map(mapDiv, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;
        setMapError(null);

        // Add error listener to detect API key errors
        map.addListener('error', (error: any) => {
          console.error("Google Maps error:", error);
          if (error && error.message) {
            setMapError("خطأ في خرائط Google: " + error.message);
            toast({
              title: "خطأ في خرائط Google",
              description: "يرجى التحقق من API key وتأكد من إضافة النطاق في Google Cloud Console",
              variant: "destructive",
            });
          }
        });

        // Trigger resize multiple times to ensure map renders correctly
        const triggerResize = () => {
          if (window.google && window.google.maps && map && mapDiv) {
            try {
              window.google.maps.event.trigger(map, 'resize');
              map.setCenter(defaultCenter);
            } catch (e) {
              console.error("Error triggering resize:", e);
            }
          }
        };

        // Trigger resize immediately and after delays
        triggerResize();
        setTimeout(triggerResize, 100);
        setTimeout(triggerResize, 300);
        setTimeout(triggerResize, 500);
      } catch (error: any) {
        console.error("Error initializing map:", error);
        const errorMsg = error?.message || "فشل تهيئة الخريطة. يرجى التحقق من API key.";
        setMapError(errorMsg);
        toast({
          title: "خطأ في تهيئة الخريطة",
          description: errorMsg,
          variant: "destructive",
        });
        return;
      }

      if (!map) return;

      // Initialize geocoder if not exists
      if (!geocoderRef.current) {
        geocoderRef.current = new window.google.maps.Geocoder();
      }

      // Initialize places service if not exists
      if (!placesServiceRef.current) {
        placesServiceRef.current = new window.google.maps.places.PlacesService(map);
      }

      // Function to update marker and get address
      const updateLocation = (location: { lat: number; lng: number }) => {
        setSelectedLocation(location);

        // Remove old marker
        if (markerRef.current) {
          markerRef.current.setMap(null);
        }

        // Add new marker
        markerRef.current = new window.google.maps.Marker({
          position: location,
          map: map,
          draggable: true,
          animation: window.google.maps.Animation.DROP,
        });

        // Get address for location
        if (geocoderRef.current) {
          geocoderRef.current.geocode(
            { location: location },
            (results: any[], status: string) => {
              if (status === "OK" && results[0]) {
                setSelectedAddress(results[0].formatted_address);
                setSearchQuery(results[0].formatted_address);
              } else {
                // Fallback if geocoding fails
                setSelectedAddress(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
                setSearchQuery(`${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`);
              }
            }
          );
        }

        // Update marker position on drag
        markerRef.current.addListener("dragend", (e: any) => {
          const draggedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          updateLocation(draggedLocation);
        });
      };

      // Add marker if location is selected (from initialLocation or selectedLocation)
      const locationToUse = selectedLocation || (initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null);
      if (locationToUse) {
        updateLocation(locationToUse);
      }

      // Add click listener to map
      clickListener = map.addListener("click", (e: any) => {
        if (e.latLng) {
          const clickedLocation = {
            lat: e.latLng.lat(),
            lng: e.latLng.lng(),
          };
          updateLocation(clickedLocation);
          
          // Center map on clicked location
          map.setCenter(clickedLocation);
          map.setZoom(15);
        }
      });

      // Initialize Autocomplete - reinitialize when dialog opens
      if (autocompleteRef.current) {
        // Clear old autocomplete
        try {
          window.google.maps.event.clearInstanceListeners(autocompleteRef.current);
        } catch (e) {
          // Ignore
        }
        autocompleteRef.current = null;
      }

      const autocompleteInput = document.getElementById("places-autocomplete") as HTMLInputElement;
      if (autocompleteInput) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          autocompleteInput,
          {
            componentRestrictions: { country: "ps" },
            fields: ["geometry", "formatted_address", "name"],
          }
        );

        autocompleteRef.current.addListener("place_changed", () => {
          const place = autocompleteRef.current.getPlace();
          if (place.geometry && map) {
            const location = {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
            };
            
            // Center map on selected place
            map.setCenter(location);
            map.setZoom(15);
            
            // Update location
            updateLocation(location);
            setSelectedAddress(place.formatted_address || place.name || "");
            setSearchQuery(place.formatted_address || place.name || "");
          }
        });
      }
    }, 300); // Delay to ensure DOM is ready

    return () => {
      clearTimeout(timeoutId);
      // Cleanup markers when effect runs again
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      // Cleanup click listener
      if (clickListener && window.google && window.google.maps) {
        try {
          window.google.maps.event.removeListener(clickListener);
        } catch (e) {
          // Ignore
        }
      }
    };
  }, [mapLoaded, open, initialLocation?.lat, initialLocation?.lng]); // Dependencies

  // Update map center when selectedLocation or initialLocation changes (if map exists)
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && open) {
      const locationToUse = selectedLocation || (initialLocation ? { lat: initialLocation.lat, lng: initialLocation.lng } : null);
      if (locationToUse) {
        mapInstanceRef.current.setCenter(locationToUse);
        mapInstanceRef.current.setZoom(15);
      }
    }
  }, [selectedLocation, initialLocation, mapLoaded, open]);

  // Handle manual address input
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;

    // If Google Maps is loaded, use geocoder
    if (window.google && window.google.maps && geocoderRef.current) {
      setIsLoading(true);
      geocoderRef.current.geocode(
        { address: searchQuery },
        (results: any[], status: string) => {
          setIsLoading(false);
          if (status === "OK" && results[0]) {
            const location = {
              lat: results[0].geometry.location.lat(),
              lng: results[0].geometry.location.lng(),
            };
            setSelectedLocation(location);
            setSelectedAddress(results[0].formatted_address);

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(location);
              mapInstanceRef.current.setZoom(15);
            }

            // Remove old marker
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }

            // Add new marker
            if (mapInstanceRef.current) {
              markerRef.current = new window.google.maps.Marker({
                position: location,
                map: mapInstanceRef.current,
                draggable: true,
              });

              // Update marker position on drag
              markerRef.current.addListener("dragend", (e: any) => {
                const updatedLocation = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                setSelectedLocation(updatedLocation);

                if (geocoderRef.current) {
                  geocoderRef.current.geocode(
                    { location: updatedLocation },
                    (results: any[], status: string) => {
                      if (status === "OK" && results[0]) {
                        setSelectedAddress(results[0].formatted_address);
                        setSearchQuery(results[0].formatted_address);
                      }
                    }
                  );
                }
              });
            }
          } else {
            console.error("Geocode was not successful for the following reason: " + status);
          }
        }
      );
    } else {
      // Fallback: Just use the search query as address (user can still confirm manually)
      setSelectedAddress(searchQuery);
      // Note: Without Google Maps, we can't get coordinates, so location will be null
      // User will need to provide coordinates manually or wait for map to load
    }
  };

  const handleConfirm = () => {
    // Use current state values
    const location = selectedLocation;
    const address = selectedAddress || searchQuery;
    
    if (location && address) {
      onLocationSelected({
        lat: location.lat,
        lng: location.lng,
        address: address,
      });
      // النافذة ستُغلق تلقائياً وستفتح نافذة التفاصيل في AddProperty.tsx
      onOpenChange(false);
    }
  };
  
  // Auto-confirm when location and address are both available (after a short delay)
  useEffect(() => {
    if (selectedLocation && selectedAddress && selectedAddress !== `${selectedLocation.lat.toFixed(6)}, ${selectedLocation.lng.toFixed(6)}`) {
      // Don't auto-confirm, let user click confirm button
      // This is better UX to give user control
    }
  }, [selectedLocation, selectedAddress]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">
            {t("locationPicker.selectLocation")}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden px-6 pb-6">
          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="places-autocomplete">
              {t("locationPicker.enterAddress")}
            </Label>
            <div className="flex gap-2">
              <Input
                id="places-autocomplete"
                type="text"
                placeholder={t("locationPicker.searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleManualSearch();
                  }
                }}
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleManualSearch}
                disabled={isLoading || !searchQuery.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {t("locationPicker.searchHint")}
            </p>
          </div>

          {/* Map Container */}
          <div className="flex-1 relative border rounded-lg overflow-hidden min-h-[400px]">
            {!mapLoaded || mapError ? (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center p-4 max-w-md">
                  {mapError ? (
                    <>
                      <p className="text-lg font-semibold text-destructive mb-2">❌</p>
                      <p className="text-sm text-destructive mb-2 font-medium">
                        {mapError}
                      </p>
                      <div className="text-xs text-muted-foreground mt-4 bg-destructive/10 p-3 rounded text-right">
                        <p className="font-medium mb-2">الحل - اتبع الخطوات:</p>
                        <ol className="list-decimal list-inside space-y-1 text-right rtl:mr-4">
                          <li className="mb-1">تأكد من وجود API key في ملف <code className="bg-background px-1 rounded">.env</code></li>
                          <li className="mb-1">افتح <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google Cloud Console - Credentials</a></li>
                          <li className="mb-1">اضغط على API key الخاص بك</li>
                          <li className="mb-1">في <strong>"Application restrictions"</strong> اختر <strong>"HTTP referrers (web sites)"</strong></li>
                          <li className="mb-1">أضف هذه النطاقات:</li>
                          <ul className="list-disc list-inside mr-4 mt-1 space-y-0.5">
                            <li><code className="bg-background px-1 rounded">http://localhost:8080/*</code></li>
                            <li><code className="bg-background px-1 rounded">http://localhost:8080</code></li>
                            <li><code className="bg-background px-1 rounded">http://127.0.0.1:8080/*</code></li>
                          </ul>
                          <li className="mb-1">في <strong>"API restrictions"</strong> تأكد من تفعيل: Maps JavaScript API, Geocoding API, Places API</li>
                          <li className="mb-1">احفظ التغييرات</li>
                          <li className="mb-1"><strong>أعد تشغيل السيرفر</strong> بعد التعديلات</li>
                        </ol>
                        <p className="mt-3 text-xs text-muted-foreground">
                          📖 راجع ملف <code className="bg-background px-1 rounded">GOOGLE_MAPS_FIX.md</code> للمزيد من التفاصيل
                        </p>
                      </div>
                    </>
                  ) : window.google && window.google.maps ? (
                    <>
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-primary" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {t("locationPicker.loadingMap")}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-destructive mb-2">⚠️</p>
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        لم يتم تحميل خرائط Google
                      </p>
                      <p className="text-xs text-muted-foreground mb-2">
                        {t("locationPicker.apiKeyNote")}
                      </p>
                      {(!import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_API_KEY === "your_api_key_here") && (
                        <div className="text-xs text-destructive mt-2 bg-destructive/10 p-2 rounded">
                          <p className="font-medium">يرجى إضافة API Key:</p>
                          <p className="mt-1">1. افتح ملف .env في المجلد الرئيسي</p>
                          <p className="mt-1">2. أضف: VITE_GOOGLE_MAPS_API_KEY=your_key_here</p>
                          <p className="mt-1">3. أعد تشغيل السيرفر (npm run dev)</p>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground mt-4">
                        يمكنك إدخال العنوان يدوياً في الحقل أعلاه
                      </p>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div ref={mapRef} className="w-full h-full min-h-[400px]" style={{ minHeight: '400px' }} />
            )}
          </div>

          {/* Selected Address Display */}
          {selectedAddress && selectedLocation && (
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{t("locationPicker.selectedAddress")}</p>
                <p className="text-sm text-muted-foreground mt-1">{selectedAddress}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  الإحداثيات: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions - Sticky at bottom */}
        <div className="border-t bg-background px-6 py-4 mt-auto sticky bottom-0 z-10">
          <div className="flex gap-3">
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={!selectedAddress || !selectedLocation}
              className="flex-1 text-lg py-6"
              size="lg"
            >
              {t("locationPicker.confirm")} ✓
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="px-6 py-6"
              size="lg"
            >
              {t("locationPicker.cancel")}
            </Button>
          </div>
          {selectedAddress && selectedLocation && (
            <p className="text-xs text-muted-foreground text-center mt-2">
              اضغط على "تأكيد" للمتابعة إلى نافذة إدخال باقي التفاصيل
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LocationPickerDialog;

