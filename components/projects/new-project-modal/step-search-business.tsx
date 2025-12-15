// components/projects/new-project-modal/step-search-business.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Phone, Star, Loader2 } from "lucide-react";

interface StepSearchBusinessProps {
  onSelect: (business: any) => void;
  onBack: () => void;
}

const dummyBusinesses = [
  {
    id: "1",
    name: "Eagle Restoration",
    phone: "+1 (773) 555-0142",
    rating: 4.9,
    reviewCount: 1000,
    address: "4521 Oakwood Avenue, Chicago, IL 60653",
    cid: "10891234567890123456",
  },
  {
    id: "2",
    name: "Pro Roofing Services",
    phone: "+1 (312) 555-0198",
    rating: 4.7,
    reviewCount: 687,
    address: "892 Michigan Avenue, Chicago, IL 60611",
    cid: "20891234567890123457",
  },
  {
    id: "3",
    name: "Quality Home Repair & Construction",
    phone: "+1 (312) 555-0223",
    rating: 4.8,
    reviewCount: 534,
    address: "1247 State Street, Chicago, IL 60605",
    cid: "30891234567890123458",
  },
  {
    id: "4",
    name: "Elite Construction Group",
    phone: "+1 (773) 555-0287",
    rating: 4.6,
    reviewCount: 489,
    address: "3456 Clark Street, Chicago, IL 60614",
    cid: "40891234567890123459",
  },
  {
    id: "5",
    name: "Premier Home Solutions",
    phone: "+1 (630) 555-0334",
    rating: 4.7,
    reviewCount: 412,
    address: "789 Washington Street, Naperville, IL 60540",
    cid: "50891234567890123460",
  },
  {
    id: "6",
    name: "Chicago Roofing Experts",
    phone: "+1 (312) 555-0445",
    rating: 4.5,
    reviewCount: 356,
    address: "2341 Halsted Street, Chicago, IL 60614",
    cid: "60891234567890123461",
  },
  {
    id: "7",
    name: "Eagle Eye Roofing",
    phone: "+1 (847) 555-0556",
    rating: 4.8,
    reviewCount: 298,
    address: "5678 Main Street, Evanston, IL 60201",
    cid: "70891234567890123462",
  },
];

export function StepSearchBusiness({
  onSelect,
  onBack,
}: StepSearchBusinessProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(false);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Filter results based on search query
    const query = searchQuery.toLowerCase();
    const filtered = dummyBusinesses.filter(
      (business) =>
        business.name.toLowerCase().includes(query) ||
        business.address.toLowerCase().includes(query) ||
        business.phone.includes(query)
    );

    setResults(filtered);
    setHasSearched(true);
    setIsSearching(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Input
          placeholder="Search for business name or address"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          autoFocus
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Search className="w-4 h-4 mr-2" />
          )}
          Search
        </Button>
      </div>

      {isSearching && (
        <div className="text-center py-8 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Searching businesses...</p>
        </div>
      )}

      {hasSearched && !isSearching && results.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No businesses found for "{searchQuery}"</p>
          <p className="text-sm mt-2">Try a different search term.</p>
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <p className="text-sm text-muted-foreground mb-2">
            Found {results.length} business{results.length !== 1 ? "es" : ""}
          </p>
          {results.map((business) => (
            <div
              key={business.id}
              className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
              onClick={() => onSelect(business)}
            >
              <h3 className="font-semibold text-lg mb-2">{business.name}</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span>{business.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span>{business.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                  <span>
                    {business.rating} stars (
                    {business.reviewCount.toLocaleString()} reviews)
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
      </div>
    </div>
  );
}
