import { Artist, Objekt, Pack } from "./types";

export const ARTISTS: Artist[] = [
  { id: 'dohun', name: 'DoHun', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-도훈.jpg' },
  { id: 'heeju', name: 'HeeJu', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-희주.jpg' },
  { id: 'taein', name: 'TaeIn', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-태인.jpg' },
  { id: 'jaeyoung', name: 'JaeYoung', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-재영.jpg' },
  { id: 'juho', name: 'JuHo', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-주호.jpg' },
  { id: 'jiwoon', name: 'JiWoon', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-지운.jpg' },
  { id: 'hwanhee', name: 'HwanHee', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-환희.jpg' },
  { id: 'cheongmyeong', name: 'CheongMyeong', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id9_이청명_140.jpg' },
  { id: 'towa', name: 'Towa', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id10_토와_140.jpg' },
  { id: 'kyuhyuk', name: 'KyuHyuk', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id11_이규혁_140.jpg' },
  { id: 'nuri', name: 'NuRi', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id12_박누리_140.jpg' },
  { id: 'seongjun', name: 'SeongJun', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id13_김성준_140.jpg' },
  { id: 'yejoon', name: 'YeJoon', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id14_한예준_140.jpg' },
  { id: 'gyeongbeen', name: 'GyeongBeen', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id15_최경빈_140.jpg' },
  { id: 'eunsoo', name: 'EunSoo', group: 'tripleS', imageUrl: 'https://static.cosmo.fans/uploads/member-profile/idntt-id16_황은수_140.jpg' },
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
    id: 'obj-001', 
    name: 'Summer25 HeeJu 101Z', 
    artist: 'HeeJu', 
    Season: 'Summer25', 
    Type: '101Z', 
    Class: 'Basic', 
    imageUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/485f7de7-2ab9-4853-5873-78c0a1ed8200/original', 
    imageBackUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/ea2f86dc-493f-4062-35bc-199319d32c00/original',
    borderColor: '#619AFF',
    textColor: '#000000'
  },
  { 
    id: 'obj-002', 
    name: 'Summer25 HeeJu 102Z', 
    artist: 'HeeJu', 
    Season: 'Summer25', 
    Type: '102Z', 
    Class: 'Basic', 
    imageUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/7add6769-c7d0-47ee-c542-b02abd1a9a00/original', 
    imageBackUrl: 'https://imagedelivery.net/qQuMkbHJ-0s6rwu8vup_5w/ea2f86dc-493f-4062-35bc-199319d32c00/original',
    borderColor: '#619AFF',
    textColor: '#000000'
  }
];

// Helper to generate dynamic packs for Basic Objekts
const generateBasicPacks = (): Pack[] => {
  const basicObjekts = OBJEKT_POOL.filter(o => o.Class === 'Basic');
  const groups: { [key: string]: Objekt[] } = {};

  basicObjekts.forEach(obj => {
    const key = `${obj.Season}-${obj.artist}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(obj);
  });

  return Object.entries(groups).map(([key, objekts]) => {
    const [season, artist] = key.split('-');
    const types = objekts.map(o => o.Type).sort();
    const range = types.length > 1 ? `${types[0]}-${types[types.length - 1]}` : types[0];
    
    return {
      id: `basic-pack-${key.toLowerCase()}`,
      name: artist,
      description: `${season} Basic`,
      price: 2,
      imageUrl: '/images/PackImage.png',
      possibleClasses: ['Basic'],
      count: 1,
      season: season,
      class: 'Basic',
      range: range,
      typeCount: objekts.length,
      // We'll need to filter by artist in the generation logic too
      artist: artist 
    } as Pack & { artist?: string };
  });
};

export const PACKS: Pack[] = [
  {
    id: 'idntt-welcome-pack',
    name: 'idntt',
    description: 'Spring26 Welcome',
    price: 2,
    imageUrl: '/images/PackImage.png',
    possibleClasses: ['Welcome'],
    count: 1,
    season: 'Spring26',
    class: 'Welcome',
    range: '200Z',
    typeCount: 1
  },
  ...generateBasicPacks()
];
