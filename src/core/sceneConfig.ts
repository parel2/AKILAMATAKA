export type SceneId =
  | 'loading'
  | 'gift'
  | 'captcha'
  | 'chat'
  | 'cake'
  | 'receipt'
  | 'scratch'
  | 'gallery'
  | 'fillheart'
  | 'letter'
  | 'photo'
  | 'terms'
  | 'slide'
  | 'question'
  | 'celebration';

export interface SceneMeta {
  id: SceneId;
  title: string;
  canBack: boolean;
  particles: 'off' | 'low' | 'burst';
  touchTrail: boolean;
}

export const SCENES: SceneMeta[] = [
  { id: 'loading',     title: 'Loading',     canBack: false, particles: 'off',  touchTrail: false },
  { id: 'gift',        title: 'Kado',        canBack: false, particles: 'low',  touchTrail: true  },
  { id: 'captcha',     title: 'Verifikasi',  canBack: false, particles: 'low',  touchTrail: true  },
  { id: 'chat',        title: 'Chat',        canBack: false, particles: 'off',  touchTrail: false },
  { id: 'cake',        title: 'Ulang Tahun', canBack: false, particles: 'low',  touchTrail: false },
  { id: 'receipt',     title: 'Struk',       canBack: false, particles: 'off',  touchTrail: false },
  { id: 'scratch',     title: 'Kartu Gores', canBack: false, particles: 'low',  touchTrail: false },
  { id: 'gallery',     title: 'Galeri',      canBack: false, particles: 'low',  touchTrail: true  },
  { id: 'fillheart',   title: 'Isi Hati',    canBack: false, particles: 'off',  touchTrail: true  },
  { id: 'letter',      title: 'Surat',       canBack: false, particles: 'low',  touchTrail: false },
  { id: 'photo',       title: 'Foto',        canBack: false, particles: 'low',  touchTrail: true  },
  { id: 'terms',       title: 'S&K',         canBack: false, particles: 'off',  touchTrail: false },
  { id: 'slide',       title: 'Geser Hati',  canBack: false, particles: 'low',  touchTrail: false },
  { id: 'question',    title: 'Nembak',      canBack: false, particles: 'low',  touchTrail: true  },
  { id: 'celebration', title: 'Perayaan',    canBack: false, particles: 'burst', touchTrail: true  },
];
