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
  { 
    id: 'obj-000', 
    name: 'Spring26 idntt 200Z', 
    artist: 'idntt', 
    Season: 'Spring26', 
    Type: '200Z', 
    Class: 'Welcome', 
    imageUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/9b3c8d76-f3fb-4d01-e5eb-d6a17f534e00/original', 
    imageBackUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/caf13491-28bf-4c3a-30d9-0b2bdce87c00/original',
    borderColor: '#950000',
    textColor: '#FFFFFF'
  },
  { 
    id: 'obj-002', 
    name: 'Summer25 SeoYeon 101A', 
    artist: 'SeoYeon', 
    Season: 'Summer25', 
    Type: '101A', 
    Class: 'Basic', 
    imageUrl: 'https://picsum.photos/seed/obj2/1083/1673', 
    imageBackUrl: 'https://picsum.photos/seed/back2/1083/1673',
    borderColor: '#FF00FF',
    textColor: '#FFFFFF'
  },
  { 
    id: 'obj-test', 
    name: 'Binary02 ShiOn 338Z', 
    artist: 'ShiOn', 
    Season: 'Spring26', 
    Type: '338Z', 
    Class: 'Event', 
    imageUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/53940716-9fc7-42ae-165a-1423055f6800/original', 
    imageBackUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/d77567ae-01db-4769-51c5-a9c48e14f100/original',
    borderColor: '#FFFFFF',
    textColor: '#000000'
  }
];

export const PACKS: Pack[] = [
  {
    id: 'idntt-welcome-pack',
    name: 'idntt',
    description: 'Spring26 Welcome',
    price: 17.99,
    imageUrl: 'https://cdn.discordapp.com/attachments/481245079311482894/1489467610142998538/IMG_20260403_003212.png?ex=69d0864f&is=69cf34cf&hm=c1e19488a07f082e68f309068067464098906969696969696969696969696969&',
    possibleClasses: ['Welcome'],
    count: 1,
    season: 'Spring26',
    class: 'Welcome',
    range: '200Z',
    typeCount: 1
  }
];
