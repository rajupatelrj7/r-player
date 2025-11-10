
export interface Subtitle {
  url: string;
  label: string;
}

export interface MediaFile {
  name: string;
  url:string;
  type: string;
  isStream?: boolean;
  subtitles?: Subtitle[];
}

export interface RadioStation {
  name: string;
  url: string;
  country: string;
}

export type AspectRatio = 'original' | '16:9' | '4:3' | 'fill';
