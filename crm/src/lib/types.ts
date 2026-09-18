export type PersonType = "client" | "broker";

export type Client = {
  id: number;
  name: string;
  type: PersonType;
  status: string;
  company: string;
  phone: string;
  email: string;
  budget_max: number | null;
  beds_min: number;
  baths_min: number;
  neighborhoods: string[];
  pets: boolean;
  move_in_date: string;
  must_haves: string[];
  notes: string;
  created_at: string;
  updated_at: string;
};

export type Listing = {
  id: number;
  source: string;
  external_id: string;
  address: string;
  neighborhood: string;
  beds: number;
  baths: number;
  price: number | null;
  status: string;
  url: string;
  pets_allowed: boolean;
  amenities: string[];
  notes: string;
  pulled_at: string;
  created_at: string;
  updated_at: string;
};

export type Match = {
  id: number;
  client_id: number;
  listing_id: number;
  notes: string;
  created_at: string;
};

export type MatchResult = {
  listing: Listing;
  score: number;
  reasons: string[];
  gaps: string[];
  saved: boolean;
  matchId: number | null;
  matchNotes: string;
};

export type ClientInput = {
  name: string;
  type?: PersonType | string;
  status?: string;
  company?: string;
  phone?: string;
  email?: string;
  budget_max?: number | null;
  beds_min?: number;
  baths_min?: number;
  neighborhoods?: string[] | string;
  pets?: boolean | string | number;
  move_in_date?: string;
  must_haves?: string[] | string;
  notes?: string;
};

export type Source = {
  id: number;
  name: string;
  kind: string;
  status: string;
  notes: string;
};

export type SourceInput = {
  name: string;
  kind: string;
  status: string;
  notes: string;
};

export type ListingInput = {
  source?: string;
  external_id?: string;
  address: string;
  neighborhood?: string;
  beds?: number;
  baths?: number;
  price?: number | null;
  status?: string;
  url?: string;
  pets_allowed?: boolean | string | number;
  amenities?: string[] | string;
  notes?: string;
  pulled_at?: string;
};
