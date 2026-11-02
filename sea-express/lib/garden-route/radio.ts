/**
 * Garden Route radio stations, hand-maintained. Stream URLs were checked to
 * answer with audio (from the Radio Browser directory and the stations'
 * own players) in November 2026.
 *
 * Only HTTPS streams play in the app: the Android build blocks plain-http
 * traffic, so a station without one gets `stream: null` and a link to its
 * own website instead.
 */
export interface RadioStation {
  id: string;
  name: string;
  area: string;
  description: string;
  stream: string | null;
  website: string;
}

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'eden-fm',
    name: 'Eden FM 93.8',
    area: 'George · Southern Cape',
    description:
      'The Southern Cape community radio station, broadcasting to George, Oudtshoorn and Mossel Bay since 2003.',
    stream: 'https://iceant.antfarm.co.za/EdenFM',
    website: 'https://www.edenfm.co.za/',
  },
  {
    id: 'knysna-fm',
    name: 'Knysna FM 97.0',
    area: 'Knysna · Plettenberg Bay',
    description: 'Wave Broadcasting’s local station for Knysna, Plettenberg Bay and the surrounding towns.',
    stream: 'https://zas4.ndx.co.za:9066/stream',
    website: 'https://www.knysnafm.co.za/',
  },
  {
    id: 'algoa-fm',
    name: 'Algoa FM',
    area: 'Garden Route · Eastern Cape',
    description: 'Regional music and talk station heard along the Garden Route and into the Eastern Cape.',
    stream: 'https://edge.iono.fm/xice/54_high.mp3',
    website: 'https://www.algoafm.co.za/',
  },
  {
    id: 'sfm-streek',
    name: 'SFM Streek Radio',
    area: 'Mossel Bay · George',
    description: 'Afrikaans community radio for the Southern Cape, with studios in Mossel Bay and George.',
    stream: null,
    website: 'https://www.sfmstreek.com/',
  },
];
