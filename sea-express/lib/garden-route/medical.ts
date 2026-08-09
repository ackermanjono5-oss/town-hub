export interface MedicalFacility {
  id: string;
  name: string;
  category: string;
  town: string;
  phone?: string;
  website?: string;
  lat: number;
  lng: number;
}
export type MedicalCategory = string;
export const MEDICAL_FACILITIES: MedicalFacility[] = [];
export function getGoogleMapsUrl(facility: MedicalFacility) {
  return `https://www.google.com/maps/search/?api=1&query=${facility.lat},${facility.lng}`;
}
export function getMedicalByTown(town: string) {
  return MEDICAL_FACILITIES.filter(m => m.town === town);
}