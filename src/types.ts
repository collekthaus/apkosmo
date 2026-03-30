export type ObjektClass = 'Basic' | 'Special' | 'Event' | 'Unit' | 'Double';

export interface Artist {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

export interface Objekt {
  id: string;
  artistId: string;
  artistName: string;
  class: ObjektClass;
  season: string;
  typeId: string; // e.g., 101A, 202Z
  imageUrl: string;
  serialNumber?: number;
  obtainedAt?: string;
}

export interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  possibleClasses: ObjektClass[];
  count: number;
}

export interface UserStats {
  como: number; // Currency
  totalObjekts: number;
  uniqueObjekts: number;
}
