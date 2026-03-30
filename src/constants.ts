import { Artist, Objekt, Pack } from "./types";

export const ARTISTS: Artist[] = [
  { id: '1', name: 'SeoYeon', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/seoyeon/400/600' },
  { id: '2', name: 'HyeRin', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/hyerin/400/600' },
  { id: '3', name: 'JiWoo', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/jiwoo/400/600' },
  { id: '4', name: 'ChaeYeon', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/chaeyeon/400/600' },
  { id: '5', name: 'Yooyeon', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/yooyeon/400/600' },
  { id: '6', name: 'SooMin', group: 'tripleS', imageUrl: 'https://picsum.photos/seed/soomin/400/600' },
];

export const SEASONS = ['Atom01', 'Binary01', 'Cream01', 'Divine01'];

export const OBJEKT_POOL: Objekt[] = [
  // SeoYeon
  { id: 's1-101a', artistId: '1', artistName: 'SeoYeon', class: 'Basic', season: 'Atom01', typeId: '101A', imageUrl: 'https://picsum.photos/seed/obj1/400/600' },
  { id: 's1-102a', artistId: '1', artistName: 'SeoYeon', class: 'Basic', season: 'Atom01', typeId: '102A', imageUrl: 'https://picsum.photos/seed/obj2/400/600' },
  { id: 's1-201z', artistId: '1', artistName: 'SeoYeon', class: 'Special', season: 'Atom01', typeId: '201Z', imageUrl: 'https://picsum.photos/seed/obj3/400/600' },
  
  // HyeRin
  { id: 's2-101a', artistId: '2', artistName: 'HyeRin', class: 'Basic', season: 'Atom01', typeId: '101A', imageUrl: 'https://picsum.photos/seed/obj4/400/600' },
  { id: 's2-102a', artistId: '2', artistName: 'HyeRin', class: 'Basic', season: 'Atom01', typeId: '102A', imageUrl: 'https://picsum.photos/seed/obj5/400/600' },
  { id: 's2-301v', artistId: '2', artistName: 'HyeRin', class: 'Event', season: 'Binary01', typeId: '301V', imageUrl: 'https://picsum.photos/seed/obj6/400/600' },

  // JiWoo
  { id: 's3-101a', artistId: '3', artistName: 'JiWoo', class: 'Basic', season: 'Atom01', typeId: '101A', imageUrl: 'https://picsum.photos/seed/obj7/400/600' },
  { id: 's3-201z', artistId: '3', artistName: 'JiWoo', class: 'Special', season: 'Atom01', typeId: '201Z', imageUrl: 'https://picsum.photos/seed/obj8/400/600' },
];

export const PACKS: Pack[] = [
  {
    id: 'eunsoo-pack',
    name: 'EunSoo',
    description: 'First-Time Buyer',
    price: 100,
    imageUrl: 'https://picsum.photos/seed/eunsoo/400/600',
    possibleClasses: ['Basic'],
    count: 4
  },
  {
    id: 'gyeongbeen-pack',
    name: 'GyeongBeen',
    description: 'First-Time Buyer',
    price: 100,
    imageUrl: 'https://picsum.photos/seed/gyeongbeen/400/600',
    possibleClasses: ['Basic'],
    count: 4
  },
  {
    id: 'yejoon-pack',
    name: 'YeJoon',
    description: 'First-Time Buyer',
    price: 100,
    imageUrl: 'https://picsum.photos/seed/yejoon/400/600',
    possibleClasses: ['Basic'],
    count: 4
  },
  {
    id: 'seongjun-pack',
    name: 'SeongJun',
    description: 'First-Time Buyer',
    price: 100,
    imageUrl: 'https://picsum.photos/seed/seongjun/400/600',
    possibleClasses: ['Basic'],
    count: 4
  },
  {
    id: 'basic-pack',
    name: 'Atom01 Basic Pack',
    description: 'Contains 1 Basic class Objekt from Atom01 season.',
    price: 100,
    imageUrl: 'https://picsum.photos/seed/pack1/400/600',
    possibleClasses: ['Basic'],
    count: 1
  },
  {
    id: 'special-pack',
    name: 'Special Edition Pack',
    description: 'Chance to get Special or Event class Objekts.',
    price: 500,
    imageUrl: 'https://picsum.photos/seed/pack2/400/600',
    possibleClasses: ['Basic', 'Special', 'Event'],
    count: 3
  }
];
