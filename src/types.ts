export type ObjektClass = 'Basic' | 'Special' | 'Event' | 'Unit' | 'Double' | 'Welcome';

export interface Artist {
  id: string;
  name: string;
  group: string;
  imageUrl: string;
}

export interface Objekt {
  id: string;
  name: string;
  artist: string;
  Season: string;
  Type: string;
  Class: string;
  imageUrl: string;
  imageBackUrl: string;
  borderColor: string;
  textColor: string;
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
  season?: string;
  class?: string;
  range?: string;
  typeCount?: number;
}

export interface UserStats {
  como: number; // Currency
  totalObjekts: number;
  uniqueObjekts: number;
}
