"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseListingsCsv } from "@/lib/csv";
import {
  createClient,
  createListing,
  deleteClient,
  deleteListing,
  deleteMatch,
  importListings,
  saveMatch,
  updateClient,
  updateListing,
  updateMatchNotes,
} from "@/lib/db";
import { parseBool, parseNumber, parseOptionalNumber, splitList } from "@/lib/format";

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "").trim();
}

function clientFromForm(formData: FormData) {
  const name = text(formData, "name");
  if (!name) throw new Error("Name is required.");
  return {
    name,
    phone: text(formData, "phone"),
    email: text(formData, "email"),
    budget_max: parseOptionalNumber(text(formData, "budget_max")),
    beds_min: parseNumber(text(formData, "beds_min"), 0),
    baths_min: parseNumber(text(formData, "baths_min"), 0),
    neighborhoods: splitList(formData.getAll("neighborhoods").map(String).join(",")),
    pets: parseBool(text(formData, "pets") || "false"),
    move_in_date: text(formData, "move_in_date"),
    must_haves: splitList(
      [...formData.getAll("must_haves").map(String), text(formData, "must_haves_extra")].join(",")
    ),
    notes: text(formData, "notes"),
  };
}

function listingFromForm(formData: FormData) {
  const address = text(formData, "address");
  if (!address) throw new Error("Address is required.");
  return {
    source: text(formData, "source") || "manual",
    external_id: text(formData, "external_id"),
    address,
    neighborhood: text(formData, "neighborhood"),
    beds: parseNumber(text(formData, "beds"), 0),
    baths: parseNumber(text(formData, "baths"), 0),
    price: parseOptionalNumber(text(formData, "price")),
    status: text(formData, "status") || "available",
    url: text(formData, "url"),
    pets_allowed: parseBool(text(formData, "pets_allowed") || "false"),
    amenities: splitList(
      [...formData.getAll("amenities").map(String), text(formData, "amenities_extra")].join(",")
    ),
    notes: text(formData, "notes"),
    pulled_at: text(formData, "pulled_at"),
  };
}

export async function createClientAction(formData: FormData) {
  const client = createClient(clientFromForm(formData));
  revalidatePath("/");
  revalidatePath("/clients");
  redirect(`/clients/${client.id}`);
}

export async function updateClientAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateClient(id, clientFromForm(formData));
  revalidatePath("/");
  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export async function deleteClientAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteClient(id);
  revalidatePath("/");
  revalidatePath("/clients");
  redirect("/clients");
}

export async function createListingAction(formData: FormData) {
  const listing = createListing(listingFromForm(formData));
  revalidatePath("/");
  revalidatePath("/listings");
  redirect(`/listings/${listing.id}`);
}

export async function updateListingAction(formData: FormData) {
  const id = Number(formData.get("id"));
  updateListing(id, listingFromForm(formData));
  revalidatePath("/");
  revalidatePath("/listings");
  revalidatePath(`/listings/${id}`);
  redirect(`/listings/${id}`);
}

export async function deleteListingAction(formData: FormData) {
  const id = Number(formData.get("id"));
  deleteListing(id);
  revalidatePath("/");
  revalidatePath("/listings");
  redirect("/listings");
}

export async function saveMatchAction(formData: FormData) {
  const clientId = Number(formData.get("clientId"));
  const listingId = Number(formData.get("listingId"));
  const notes = text(formData, "notes");
  saveMatch(clientId, listingId, notes);
  revalidatePath(`/clients/${clientId}`);
}

export async function updateMatchNotesAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const clientId = Number(formData.get("clientId"));
  updateMatchNotes(id, text(formData, "notes"));
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteMatchAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const clientId = Number(formData.get("clientId"));
  deleteMatch(id);
  revalidatePath(`/clients/${clientId}`);
}

export async function importListingsAction(formData: FormData): Promise<{ created: number; updated: number; errors: string[] }> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { created: 0, updated: 0, errors: ["Choose a CSV file to import."] };
  }
  const text = await file.text();
  const parsed = parseListingsCsv(text);
  if (!parsed.rows.length) {
    return { created: 0, updated: 0, errors: parsed.errors.length ? parsed.errors : ["No listing rows found."] };
  }
  const result = importListings(parsed.rows);
  revalidatePath("/");
  revalidatePath("/listings");
  return { ...result, errors: parsed.errors };
}
