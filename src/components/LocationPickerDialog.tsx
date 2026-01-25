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

// Helper function to safely format coordinates
const formatCoordinate = (coord: number | string | undefined | null): string => {
  if (coord === null || coord === undefined || coord === '') {
    return '0.000000';
  }
  const num = typeof coord === 'number' ? coord : Number(coord);
  if (isNaN(num)) {
    return '0.000000';
  }
  return num.toFixed(6);
};

// Helper function to check if location is valid (not 0,0 or near it)
const isValidLocation = (location: { lat: number; lng: number } | null | undefined): boolean => {
  if (!location) return false;
  // Check if coordinates are not near 0,0 (which is in the ocean)
  if (Math.abs(location.lat) < 0.1 && Math.abs(location.lng) < 0.1) {
    return false;
  }
  // Check if coordinates are within valid ranges
  if (Math.abs(location.lat) > 90 || Math.abs(location.lng) > 180) {
    return false;
  }
  return true;
};

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
  const [isGettingCurrentLocation, setIsGettingCurrentLocation] = useState(false);
  const [currentLocationFetched, setCurrentLocationFetched] = useState(false);

  // Update state when initialLocation changes (only if valid)
  useEffect(() => {
    if (initialLocation && isValidLocation(initialLocation)) {
      setSelectedLocation({ lat: initialLocation.lat, lng: initialLocation.lng });
      // Use the provided address if available, otherwise will be updated when map loads
      if (initialLocation.address && initialLocation.address.trim() !== '') {
        setSelectedAddress(initialLocation.address);
        setSearchQuery(initialLocation.address);
      } else {
        // If no address provided, use coordinates temporarily (will be updated when map loads)
        const formattedLat = formatCoordinate(initialLocation.lat);
        const formattedLng = formatCoordinate(initialLocation.lng);
        const coordString = `${formattedLat}, ${formattedLng}`;
        setSelectedAddress(coordString);
        setSearchQuery(coordString);
      }
      setCurrentLocationFetched(true); // Mark as fetched if initial location exists
    } else {
      // If initialLocation is invalid (0,0), treat it as no location
      setSelectedLocation(null);
      setSelectedAddress("");
      setSearchQuery("");
      setCurrentLocationFetched(false); // Allow fetching current location
    }
  }, [initialLocation]);

  // Get current location when dialog opens and map is loaded (only if no initial location)
  useEffect(() => {
    if (!open) {
      // Reset when dialog closes
      setCurrentLocationFetched(false);
      setIsGettingCurrentLocation(false);
      return;
    }

    // Only get current location if:
    // 1. Dialog is open
    // 2. Map is loaded
    // 3. No valid initial location provided (or invalid 0,0)
    // 4. Haven't fetched current location yet
    // 5. No selected location yet (to avoid overriding user selection)
    const hasValidInitialLocation = initialLocation && isValidLocation(initialLocation);
    
    // Debug logging
    console.log("Location picker state:", {
      open,
      mapLoaded,
      hasValidInitialLocation,
      initialLocation,
      currentLocationFetched,
      selectedLocation,
      hasGeolocation: !!navigator.geolocation
    });
    
    if (
      open && 
      mapLoaded && 
      !hasValidInitialLocation && 
      !currentLocationFetched && 
      !selectedLocation &&
      navigator.geolocation
    ) {
      console.log("Attempting to get current location...");
      setIsGettingCurrentLocation(true);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          
          console.log("Current location obtained:", currentLoc);
          
          // Validate coordinates (should be reasonable values, not near 0,0)
          if (Math.abs(currentLoc.lat) < 0.1 && Math.abs(currentLoc.lng) < 0.1) {
            console.error("Invalid coordinates detected (near 0,0):", currentLoc);
            setIsGettingCurrentLocation(false);
            setCurrentLocationFetched(true);
            toast({
              title: "خطأ في الموقع",
              description: "الإحداثيات المستلمة غير صحيحة. يرجى تحديد الموقع يدوياً.",
              variant: "destructive",
            });
            return;
          }
          
          // Set the location state first
          setSelectedLocation(currentLoc);
          
          setIsGettingCurrentLocation(false);
          setCurrentLocationFetched(true);
          
          // Update map center and add marker if map is loaded
          if (mapInstanceRef.current && mapLoaded) {
            // Use panTo for smoother transition
            mapInstanceRef.current.panTo(currentLoc);
            mapInstanceRef.current.setZoom(16); // Higher zoom for street-level detail
            mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP); // Ensure roadmap type
            
            // Force map to refresh and show details
            window.google.maps.event.trigger(mapInstanceRef.current, 'resize');
            
            // Get address using Google Geocoding API
            if (geocoderRef.current) {
              geocoderRef.current.geocode(
                { location: new window.google.maps.LatLng(currentLoc.lat, currentLoc.lng) },
                (results: any[], status: string) => {
                  if (status === "OK" && results && results.length > 0) {
                    const result = results[0];
                    const formattedAddress = result.formatted_address || '';
                    
                    // Extract address components for detailed display
                    const addressComponents = result.address_components || [];
                    let street = '';
                    let city = '';
                    let country = '';
                    
                    addressComponents.forEach((component: any) => {
                      const types = component.types || [];
                      
                      // Street address
                      if (types.includes('street_number') || types.includes('route')) {
                        const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                        const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                        street = [streetNumber, route].filter(Boolean).join(' ').trim();
                      }
                      
                      // City
                      if (types.includes('locality')) {
                        city = component.long_name;
                      } else if (types.includes('administrative_area_level_2') && !city) {
                        city = component.long_name;
                      } else if (types.includes('administrative_area_level_1') && !city) {
                        city = component.long_name;
                      }
                      
                      // Country
                      if (types.includes('country')) {
                        country = component.long_name;
                      }
                    });
                    
                    // Build full address: Street, City, Country
                    const addressParts: string[] = [];
                    if (street) addressParts.push(street);
                    if (city) addressParts.push(city);
                    if (country) addressParts.push(country);
                    
                    const fullAddress = addressParts.length > 0 
                      ? addressParts.join('، ') 
                      : formattedAddress;
                    
                    setSelectedAddress(fullAddress || formattedAddress);
                    setSearchQuery(fullAddress || formattedAddress);
                    
                    toast({
                      title: t("locationPicker.currentLocationRetrieved") || "تم الحصول على الموقع الحالي",
                      description: fullAddress || formattedAddress,
                    });
                  } else {
                    // Fallback to coordinates
                    const formattedLat = formatCoordinate(currentLoc.lat);
                    const formattedLng = formatCoordinate(currentLoc.lng);
                    const coordString = `${formattedLat}, ${formattedLng}`;
                    setSelectedAddress(coordString);
                    setSearchQuery(coordString);
                    toast({
                      title: t("locationPicker.currentLocationRetrieved") || "تم الحصول على الموقع الحالي",
                      description: coordString,
                    });
                  }
                }
              );
            }
            
            // Add marker directly
            if (markerRef.current) {
              markerRef.current.setMap(null);
            }
            
            markerRef.current = new window.google.maps.Marker({
              position: currentLoc,
              map: mapInstanceRef.current,
              draggable: true,
              animation: window.google.maps.Animation.DROP,
            });
            
            // Add drag listener - will call updateLocation which uses geocoding
            markerRef.current.addListener("dragend", (e: any) => {
              const draggedLocation = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng(),
              };
              // Use updateLocation function which handles geocoding
              if (mapInstanceRef.current && geocoderRef.current) {
                updateLocation(draggedLocation);
              } else {
                setSelectedLocation(draggedLocation);
                const updatedLat = formatCoordinate(draggedLocation.lat);
                const updatedLng = formatCoordinate(draggedLocation.lng);
                const updatedCoordString = `${updatedLat}, ${updatedLng}`;
                setSelectedAddress(updatedCoordString);
                setSearchQuery(updatedCoordString);
              }
            });
          }
        },
        (error) => {
          console.error("Error getting current location:", error);
          setIsGettingCurrentLocation(false);
          setCurrentLocationFetched(true); // Mark as fetched even if failed to avoid retrying
          
          // Show error toast only if user denied permission
          if (error.code === error.PERMISSION_DENIED) {
            toast({
              title: t("locationPicker.locationPermissionDenied") || "تم رفض طلب الموقع",
              description: t("locationPicker.locationPermissionDeniedDesc") || "يرجى السماح بالوصول إلى الموقع أو تحديد موقع يدوياً",
              variant: "destructive",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    }
  }, [open, mapLoaded, initialLocation, currentLocationFetched, selectedLocation, toast, t]);
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
  }, [open, toast]);

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

      // Determine center location - prioritize selectedLocation, then valid initialLocation, then default (Palestine)
      const validInitialLocation = initialLocation && isValidLocation(initialLocation) ? { lat: initialLocation.lat, lng: initialLocation.lng } : null;
      const defaultCenter = selectedLocation || validInitialLocation || { lat: 32.2211, lng: 35.2544 }; // Default to Nablus, Palestine
      // Use higher zoom level for better detail (15-18 for street level, 10-12 for city level)
      const defaultZoom = (selectedLocation || validInitialLocation) ? 16 : 12;

      // Initialize new map with better settings for detail
      try {
        map = new window.google.maps.Map(mapDiv, {
          center: defaultCenter,
          zoom: defaultZoom,
          mapTypeId: window.google.maps.MapTypeId.ROADMAP, // Use roadmap for street details
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          scaleControl: true,
          rotateControl: false,
          gestureHandling: 'greedy', // Allow zoom with mouse wheel
          disableDefaultUI: false, // Show all controls
          styles: [], // Use default styles for maximum detail
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

      // Function to update marker and get address using Google Geocoding API
      const updateLocation = async (location: { lat: number; lng: number }) => {
        console.log("updateLocation called with:", location);
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

        // Use Google Geocoding API to get detailed address
        if (geocoderRef.current) {
          console.log("Geocoding location:", location);
          setIsLoading(true);
          geocoderRef.current.geocode(
            { location: new window.google.maps.LatLng(location.lat, location.lng) },
            (results: any[], status: string) => {
              setIsLoading(false);
              console.log("Geocoding result status:", status);
              if (status === "OK" && results && results.length > 0) {
                const result = results[0];
                const formattedAddress = result.formatted_address || '';
                console.log("Formatted address from Google:", formattedAddress);
                
                // Extract address components for detailed display
                const addressComponents = result.address_components || [];
                let street = '';
                let city = '';
                let country = '';
                
                addressComponents.forEach((component: any) => {
                  const types = component.types || [];
                  
                  // Street address
                  if (types.includes('street_number') || types.includes('route')) {
                    const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                    const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                    street = [streetNumber, route].filter(Boolean).join(' ').trim();
                  }
                  
                  // City
                  if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_2') && !city) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_1') && !city) {
                    city = component.long_name;
                  }
                  
                  // Country
                  if (types.includes('country')) {
                    country = component.long_name;
                  }
                });
                
                console.log("Extracted components - Street:", street, "City:", city, "Country:", country);
                
                // Build full address: Street, City, Country
                const addressParts: string[] = [];
                if (street) addressParts.push(street);
                if (city) addressParts.push(city);
                if (country) addressParts.push(country);
                
                const fullAddress = addressParts.length > 0 
                  ? addressParts.join('، ') 
                  : formattedAddress;
                
                console.log("Setting address to:", fullAddress);
                setSelectedAddress(fullAddress || formattedAddress);
                setSearchQuery(fullAddress || formattedAddress);
              } else {
                console.warn("Geocoding failed or returned no results. Status:", status);
                // Fallback to coordinates if geocoding fails
                const formattedLat = formatCoordinate(location.lat);
                const formattedLng = formatCoordinate(location.lng);
                const coordString = `${formattedLat}, ${formattedLng}`;
                setSelectedAddress(coordString);
                setSearchQuery(coordString);
              }
            }
          );
        } else {
          console.warn("Geocoder not available, using coordinates");
          // Fallback to coordinates if geocoder is not available
          const formattedLat = formatCoordinate(location.lat);
          const formattedLng = formatCoordinate(location.lng);
          const coordString = `${formattedLat}, ${formattedLng}`;
          setSelectedAddress(coordString);
          setSearchQuery(coordString);
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

      // Add marker if location is selected (from valid initialLocation or selectedLocation)
      // validInitialLocation already defined above at line 371
      const locationToUse = selectedLocation || validInitialLocation;
      if (locationToUse && isValidLocation(locationToUse)) {
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
          map.setZoom(16); // Higher zoom for street-level detail
          map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP); // Ensure roadmap type
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
            map.setZoom(16); // Higher zoom for street-level detail
            map.setMapTypeId(window.google.maps.MapTypeId.ROADMAP); // Ensure roadmap type
            
            // Update location (this will get detailed address using geocoding)
            updateLocation(location);
            
            // Also set the formatted address from the place if available
            if (place.formatted_address) {
              setSelectedAddress(place.formatted_address);
              setSearchQuery(place.formatted_address);
            }
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
  }, [mapLoaded, open, selectedLocation, initialLocation]); // Dependencies

  // Update map center and marker when selectedLocation or initialLocation changes (if map exists)
  useEffect(() => {
    if (mapLoaded && mapInstanceRef.current && open && window.google && window.google.maps) {
      const validInitialLocation = initialLocation && isValidLocation(initialLocation) ? { lat: initialLocation.lat, lng: initialLocation.lng } : null;
      const locationToUse = selectedLocation || validInitialLocation;
      if (locationToUse && isValidLocation(locationToUse)) {
        
        // Update map center with higher zoom for detail
        mapInstanceRef.current.setCenter(locationToUse);
        mapInstanceRef.current.setZoom(16); // Higher zoom for street-level detail
        mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP); // Ensure roadmap type
        
        // Update marker if it doesn't exist or position changed
        if (!markerRef.current) {
          markerRef.current = new window.google.maps.Marker({
            position: locationToUse,
            map: mapInstanceRef.current,
            draggable: true,
            animation: window.google.maps.Animation.DROP,
          });
          
          // Add drag listener - use geocoding to get detailed address
          markerRef.current.addListener("dragend", (e: any) => {
            const draggedLocation = {
              lat: e.latLng.lat(),
              lng: e.latLng.lng(),
            };
            // Use updateLocation if available, otherwise fallback to coordinates
            if (geocoderRef.current) {
              geocoderRef.current.geocode(
                { location: new window.google.maps.LatLng(draggedLocation.lat, draggedLocation.lng) },
                (results: any[], status: string) => {
                  if (status === "OK" && results && results.length > 0) {
                    const result = results[0];
                    const formattedAddress = result.formatted_address || '';
                    
                    // Extract address components
                    const addressComponents = result.address_components || [];
                    let street = '';
                    let city = '';
                    let country = '';
                    
                    addressComponents.forEach((component: any) => {
                      const types = component.types || [];
                      if (types.includes('street_number') || types.includes('route')) {
                        const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                        const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                        street = [streetNumber, route].filter(Boolean).join(' ').trim();
                      }
                      if (types.includes('locality')) {
                        city = component.long_name;
                      } else if (types.includes('administrative_area_level_2') && !city) {
                        city = component.long_name;
                      }
                      if (types.includes('country')) {
                        country = component.long_name;
                      }
                    });
                    
                    const addressParts: string[] = [];
                    if (street) addressParts.push(street);
                    if (city) addressParts.push(city);
                    if (country) addressParts.push(country);
                    
                    const fullAddress = addressParts.length > 0 
                      ? addressParts.join('، ') 
                      : formattedAddress;
                    
                    setSelectedLocation(draggedLocation);
                    setSelectedAddress(fullAddress || formattedAddress);
                    setSearchQuery(fullAddress || formattedAddress);
                  } else {
                    // Fallback to coordinates
                    setSelectedLocation(draggedLocation);
                    const updatedLat = formatCoordinate(draggedLocation.lat);
                    const updatedLng = formatCoordinate(draggedLocation.lng);
                    const updatedCoordString = `${updatedLat}, ${updatedLng}`;
                    setSelectedAddress(updatedCoordString);
                    setSearchQuery(updatedCoordString);
                  }
                }
              );
            } else {
              // Fallback to coordinates
              setSelectedLocation(draggedLocation);
              const updatedLat = formatCoordinate(draggedLocation.lat);
              const updatedLng = formatCoordinate(draggedLocation.lng);
              const updatedCoordString = `${updatedLat}, ${updatedLng}`;
              setSelectedAddress(updatedCoordString);
              setSearchQuery(updatedCoordString);
            }
          });
        } else {
          // Update existing marker position
          markerRef.current.setPosition(locationToUse);
        }
      }
    }
  }, [selectedLocation, initialLocation, mapLoaded, open]);

  // Handle manual address input
  const handleManualSearch = async () => {
    if (!searchQuery.trim()) return;

    // If Google Maps is loaded, use geocoder
    if (window.google && window.google.maps && geocoderRef.current && mapInstanceRef.current) {
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
            
            // Use updateLocation function which handles geocoding to get detailed address
            // We need to call it manually here since updateLocation is defined inside useEffect
            setSelectedLocation(location);
            
            // Get detailed address using reverse geocoding
            geocoderRef.current.geocode(
              { location: new window.google.maps.LatLng(location.lat, location.lng) },
              (reverseResults: any[], reverseStatus: string) => {
                if (reverseStatus === "OK" && reverseResults && reverseResults.length > 0) {
                  const result = reverseResults[0];
                  const formattedAddress = result.formatted_address || '';
                  
                  // Extract address components for detailed display
                  const addressComponents = result.address_components || [];
                  let street = '';
                  let city = '';
                  let country = '';
                  
                  addressComponents.forEach((component: any) => {
                    const types = component.types || [];
                    
                    // Street address
                    if (types.includes('street_number') || types.includes('route')) {
                      const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                      const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                      street = [streetNumber, route].filter(Boolean).join(' ').trim();
                    }
                    
                    // City
                    if (types.includes('locality')) {
                      city = component.long_name;
                    } else if (types.includes('administrative_area_level_2') && !city) {
                      city = component.long_name;
                    } else if (types.includes('administrative_area_level_1') && !city) {
                      city = component.long_name;
                    }
                    
                    // Country
                    if (types.includes('country')) {
                      country = component.long_name;
                    }
                  });
                  
                  // Build full address: Street, City, Country
                  const addressParts: string[] = [];
                  if (street) addressParts.push(street);
                  if (city) addressParts.push(city);
                  if (country) addressParts.push(country);
                  
                  const fullAddress = addressParts.length > 0 
                    ? addressParts.join('، ') 
                    : formattedAddress;
                  
                  setSelectedAddress(fullAddress || formattedAddress);
                  setSearchQuery(fullAddress || formattedAddress);
                } else {
                  // Use the formatted address from the original geocode result
                  const formattedAddress = results[0].formatted_address || '';
                  setSelectedAddress(formattedAddress);
                  setSearchQuery(formattedAddress);
                }
              }
            );

            if (mapInstanceRef.current) {
              mapInstanceRef.current.setCenter(location);
              mapInstanceRef.current.setZoom(16); // Higher zoom for street-level detail
              mapInstanceRef.current.setMapTypeId(window.google.maps.MapTypeId.ROADMAP); // Ensure roadmap type
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

              // Update marker position on drag - use updateLocation if available
              markerRef.current.addListener("dragend", (e: any) => {
                const updatedLocation = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng(),
                };
                // Try to use updateLocation if available, otherwise fallback
                if (mapInstanceRef.current && geocoderRef.current) {
                  // Call geocoding for dragged location
                  geocoderRef.current.geocode(
                    { location: new window.google.maps.LatLng(updatedLocation.lat, updatedLocation.lng) },
                    (dragResults: any[], dragStatus: string) => {
                      if (dragStatus === "OK" && dragResults && dragResults.length > 0) {
                        const result = dragResults[0];
                        const formattedAddress = result.formatted_address || '';
                        
                        // Extract address components
                        const addressComponents = result.address_components || [];
                        let street = '';
                        let city = '';
                        let country = '';
                        
                        addressComponents.forEach((component: any) => {
                          const types = component.types || [];
                          if (types.includes('street_number') || types.includes('route')) {
                            const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                            const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                            street = [streetNumber, route].filter(Boolean).join(' ').trim();
                          }
                          if (types.includes('locality')) {
                            city = component.long_name;
                          } else if (types.includes('administrative_area_level_2') && !city) {
                            city = component.long_name;
                          }
                          if (types.includes('country')) {
                            country = component.long_name;
                          }
                        });
                        
                        const addressParts: string[] = [];
                        if (street) addressParts.push(street);
                        if (city) addressParts.push(city);
                        if (country) addressParts.push(country);
                        
                        const fullAddress = addressParts.length > 0 
                          ? addressParts.join('، ') 
                          : formattedAddress;
                        
                        setSelectedLocation(updatedLocation);
                        setSelectedAddress(fullAddress || formattedAddress);
                        setSearchQuery(fullAddress || formattedAddress);
                      } else {
                        // Fallback to coordinates
                        setSelectedLocation(updatedLocation);
                        const updatedLat = formatCoordinate(updatedLocation.lat);
                        const updatedLng = formatCoordinate(updatedLocation.lng);
                        const updatedCoordString = `${updatedLat}, ${updatedLng}`;
                        setSelectedAddress(updatedCoordString);
                        setSearchQuery(updatedCoordString);
                      }
                    }
                  );
                } else {
                  // Fallback to coordinates
                  setSelectedLocation(updatedLocation);
                  const updatedLat = formatCoordinate(updatedLocation.lat);
                  const updatedLng = formatCoordinate(updatedLocation.lng);
                  const updatedCoordString = `${updatedLat}, ${updatedLng}`;
                  setSelectedAddress(updatedCoordString);
                  setSearchQuery(updatedCoordString);
                }
              });
            }
          } else {
            console.error("Geocode was not successful for the following reason: " + status);
            toast({
              title: "خطأ في البحث",
              description: "لم يتم العثور على العنوان. يرجى المحاولة مرة أخرى.",
              variant: "destructive",
            });
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

  const handleConfirm = async () => {
    console.log("handleConfirm called");
    // Use current state values
    const location = selectedLocation;
    console.log("Current location:", location);
    console.log("Current selectedAddress:", selectedAddress);
    console.log("Current searchQuery:", searchQuery);
    
    if (!location) {
      toast({
        title: "خطأ",
        description: "يرجى تحديد موقع على الخريطة",
        variant: "destructive",
      });
      return;
    }
    
    // Ensure coordinates are numbers
    const lat = typeof location.lat === 'number' ? location.lat : Number(location.lat || 0);
    const lng = typeof location.lng === 'number' ? location.lng : Number(location.lng || 0);
    
    // Validate coordinates
    if (isNaN(lat) || isNaN(lng)) {
      toast({
        title: "خطأ في الإحداثيات",
        description: "الإحداثيات غير صالحة. يرجى تحديد موقع صحيح.",
        variant: "destructive",
      });
      return;
    }
    
    // Get detailed address using Google Geocoding API if available
    let address = selectedAddress || searchQuery;
    console.log("Initial address:", address);
    
    // If address is still coordinates, try to get detailed address
    const isCoordinates = address && (address.match(/^-?\d+\.?\d*,\s*-?\d+\.?\d*$/) || address === `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    console.log("Is address coordinates?", isCoordinates);
    
    if (isCoordinates) {
      if (geocoderRef.current && window.google && window.google.maps) {
        console.log("Getting detailed address from Google Geocoding API...");
        setIsLoading(true);
        try {
          await new Promise<void>((resolve) => {
            geocoderRef.current.geocode(
              { location: new window.google.maps.LatLng(lat, lng) },
              (results: any[], status: string) => {
                setIsLoading(false);
                console.log("Geocoding result in handleConfirm - Status:", status);
                if (status === "OK" && results && results.length > 0) {
                  const result = results[0];
                  const formattedAddress = result.formatted_address || '';
                  console.log("Formatted address from Google:", formattedAddress);
                  
                  // Extract address components for detailed display
                  const addressComponents = result.address_components || [];
                  let street = '';
                  let city = '';
                  let country = '';
                  
                  addressComponents.forEach((component: any) => {
                    const types = component.types || [];
                    
                    // Street address
                    if (types.includes('street_number') || types.includes('route')) {
                      const streetNumber = addressComponents.find((c: any) => c.types.includes('street_number'))?.long_name || '';
                      const route = addressComponents.find((c: any) => c.types.includes('route'))?.long_name || '';
                      street = [streetNumber, route].filter(Boolean).join(' ').trim();
                    }
                    
                    // City
                    if (types.includes('locality')) {
                      city = component.long_name;
                    } else if (types.includes('administrative_area_level_2') && !city) {
                      city = component.long_name;
                    } else if (types.includes('administrative_area_level_1') && !city) {
                      city = component.long_name;
                    }
                    
                    // Country
                    if (types.includes('country')) {
                      country = component.long_name;
                    }
                  });
                  
                  console.log("Extracted components - Street:", street, "City:", city, "Country:", country);
                  
                  // Build full address: Street, City, Country
                  const addressParts: string[] = [];
                  if (street) addressParts.push(street);
                  if (city) addressParts.push(city);
                  if (country) addressParts.push(country);
                  
                  address = addressParts.length > 0 
                    ? addressParts.join('، ') 
                    : formattedAddress;
                  
                  console.log("Final address from geocoding:", address);
                } else {
                  console.warn("Geocoding failed in handleConfirm. Status:", status);
                }
                resolve();
              }
            );
          });
        } catch (error) {
          console.error("Error getting address:", error);
          setIsLoading(false);
        }
      } else {
        console.warn("Geocoder not available in handleConfirm");
      }
    }
    
    // Use the address (either from state or from geocoding)
    const finalAddress = address || `${formatCoordinate(lat)}, ${formatCoordinate(lng)}`;
    console.log("Final address to send:", finalAddress);
    
    onLocationSelected({
      lat: lat,
      lng: lng,
      address: finalAddress,
    });
    // النافذة ستُغلق تلقائياً وستفتح نافذة التفاصيل في AddProperty.tsx
    onOpenChange(false);
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
            {isGettingCurrentLocation && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm font-medium">
                  {t("locationPicker.gettingCurrentLocation") || "جاري الحصول على موقعك الحالي..."}
                </span>
              </div>
            )}
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
                            <li><code className="bg-background px-1 rounded">http://localhost:8081/*</code></li>
                            <li><code className="bg-background px-1 rounded">http://localhost:8081</code></li>
                            <li><code className="bg-background px-1 rounded">http://127.0.0.1:8081/*</code></li>
                            <li><code className="bg-background px-1 rounded">http://127.0.0.1:8081</code></li>
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

          {/* Selected Address Display (Coordinates) */}
          {selectedAddress && selectedLocation && (
            <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-start gap-2">
              <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-primary">{t("locationPicker.selectedAddress")}</p>
                <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedAddress}</p>
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
              disabled={!selectedAddress || !selectedLocation || isLoading}
              className="flex-1 text-lg py-6"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("locationPicker.gettingAddress") || "جاري الحصول على العنوان..."}
                </>
              ) : (
                <>
                  {t("locationPicker.confirm")} ✓
                </>
              )}
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
   