/**
 * Radio stations, hand-maintained: local Garden Route stations first, then
 * Western Cape, national SABC and other popular South African ones. Stream
 * URLs were checked to answer with audio over HTTPS (from the Radio Browser
 * directory and the stations' own players) in November 2026.
 *
 * Only HTTPS streams play in the app: the Android build blocks plain-http
 * traffic, so a station without one gets `stream: null` and a link to its
 * own website instead.
 */
export type RadioGroup = 'local' | 'western-cape' | 'national' | 'around-sa';

export const RADIO_GROUPS: { id: RadioGroup; label: string }[] = [
  { id: 'local', label: 'Garden Route & Southern Cape' },
  { id: 'western-cape', label: 'Cape Town & Western Cape' },
  { id: 'national', label: 'National (SABC)' },
  { id: 'around-sa', label: 'Around South Africa' },
];

export interface RadioStation {
  id: string;
  name: string;
  group: RadioGroup;
  area: string;
  description: string;
  stream: string | null;
  website: string;
}

/** SABC and Primedia stations stream through Triton's redirector, which picks a server. */
const triton = (mount: string) => `https://playerservices.streamtheworld.com/api/livestream-redirect/${mount}`;

export const RADIO_STATIONS: RadioStation[] = [
  {
    id: 'eden-fm',
    name: 'Eden FM 93.8',
    group: 'local',
    area: 'George · Southern Cape',
    description:
      'The Southern Cape community radio station, broadcasting to George, Oudtshoorn and Mossel Bay since 2003.',
    stream: 'https://iceant.antfarm.co.za/EdenFM',
    website: 'https://www.edenfm.co.za/',
  },
  {
    id: 'knysna-fm',
    name: 'Knysna FM 97.0',
    group: 'local',
    area: 'Knysna · Plettenberg Bay',
    description: 'Wave Broadcasting’s local station for Knysna, Plettenberg Bay and the surrounding towns.',
    stream: 'https://zas4.ndx.co.za:9066/stream',
    website: 'https://www.knysnafm.co.za/',
  },
  {
    id: 'algoa-fm',
    name: 'Algoa FM',
    group: 'local',
    area: 'Garden Route · Eastern Cape',
    description: 'Regional music and talk station heard along the Garden Route and into the Eastern Cape.',
    stream: 'https://edge.iono.fm/xice/54_high.mp3',
    website: 'https://www.algoafm.co.za/',
  },
  {
    id: 'sfm-streek',
    name: 'SFM Streek Radio',
    group: 'local',
    area: 'Mossel Bay · George',
    description: 'Afrikaans community radio for the Southern Cape, with studios in Mossel Bay and George.',
    stream: null,
    website: 'https://www.sfmstreek.com/',
  },
  {
    id: 'kfm',
    name: 'KFM 94.5',
    group: 'western-cape',
    area: 'Cape Town · Western Cape',
    description: 'The Western Cape’s hit-music station, with news, traffic and the biggest songs of the day.',
    stream: triton('KFM.mp3'),
    website: 'https://www.kfm.co.za/',
  },
  {
    id: 'good-hope-fm',
    name: 'Good Hope FM',
    group: 'western-cape',
    area: 'Cape Town',
    description: 'The SABC’s Cape Town station, playing R&B, hip-hop and dance music.',
    stream: triton('GOODHOPEFMAAC.aac'),
    website: 'https://www.goodhopefm.co.za/',
  },
  {
    id: 'capetalk',
    name: 'CapeTalk 567',
    group: 'western-cape',
    area: 'Cape Town',
    description: 'Talk radio for Cape Town: news, current affairs and listener call-ins.',
    stream: triton('CAPE_TALKAAC.aac'),
    website: 'https://www.capetalk.co.za/',
  },
  {
    id: 'smile-904',
    name: 'Smile 90.4FM',
    group: 'western-cape',
    area: 'Cape Town',
    description: 'Cape Town music station playing feel-good hits from the 80s to today.',
    stream: 'https://edge.iono.fm/xice/212_medium.aac',
    website: 'https://smile904.fm/',
  },
  {
    id: 'ccfm',
    name: 'CCFM 107.5',
    group: 'western-cape',
    area: 'Cape Town',
    description: 'Christian community radio for Cape Town, with music, talk and teaching.',
    stream: 'https://edge.iono.fm/xice/69_medium.aac',
    website: 'https://ccfm.org.za/',
  },
  {
    id: 'bokradio',
    name: 'Bokradio',
    group: 'western-cape',
    area: 'Worcester · Boland',
    description: 'Afrikaans community radio from Worcester, with music, news and local programmes.',
    stream: 'https://bokradio.highquality.radiostream.co.za/',
    website: 'https://www.bokradio.co.za/',
  },
  {
    id: 'rsg',
    name: 'RSG (Radio Sonder Grense)',
    group: 'national',
    area: 'Afrikaans · national',
    description: 'The SABC’s national Afrikaans station: news, talk, drama and music.',
    stream: triton('RSGAAC.aac'),
    website: 'https://www.rsg.co.za/',
  },
  {
    id: 'umhlobo-wenene',
    name: 'Umhlobo Wenene FM',
    group: 'national',
    area: 'isiXhosa · national',
    description: 'The SABC’s isiXhosa station and one of the biggest in the country, broadcasting from Gqeberha.',
    stream: triton('UMHLOBOWENENEAAC.aac'),
    website: 'https://www.umhlobowenenefm.co.za/',
  },
  {
    id: '5fm',
    name: '5FM',
    group: 'national',
    area: 'English · national',
    description: 'The SABC’s national youth station, playing pop, dance and the latest hits.',
    stream: triton('5FMAAC.aac'),
    website: 'https://www.5fm.co.za/',
  },
  {
    id: 'metro-fm',
    name: 'Metro FM',
    group: 'national',
    area: 'English · national',
    description: 'The SABC’s national urban music station: hip-hop, R&B, house and amapiano.',
    stream: triton('METROFMAAC.aac'),
    website: 'https://www.metrofm.co.za/',
  },
  {
    id: 'safm',
    name: 'SAfm',
    group: 'national',
    area: 'English · national',
    description: 'The SABC’s English news and current-affairs station.',
    stream: triton('SAFMAAC.aac'),
    website: 'https://www.safm.co.za/',
  },
  {
    id: 'radio-2000',
    name: 'Radio 2000',
    group: 'national',
    area: 'English · national',
    description: 'The SABC’s national station for sport and entertainment, with live match commentary.',
    stream: triton('RADIO2000AAC.aac'),
    website: 'https://www.radio2000.co.za/',
  },
  {
    id: 'jacaranda-fm',
    name: 'Jacaranda FM',
    group: 'around-sa',
    area: 'Gauteng · Pretoria',
    description: 'Popular music station from Pretoria, playing the biggest hits in English and Afrikaans.',
    stream: 'https://edge.iono.fm/xice/jacarandafm_live_medium.aac',
    website: 'https://www.jacarandafm.com/',
  },
  {
    id: 'east-coast-radio',
    name: 'East Coast Radio',
    group: 'around-sa',
    area: 'Durban · KwaZulu-Natal',
    description: 'KwaZulu-Natal’s biggest commercial station, with music, news and sport.',
    stream: 'https://live.ecr.co.za/ecrhigh.mp3',
    website: 'https://www.ecr.co.za/',
  },
  {
    id: 'kaya-959',
    name: 'Kaya 959',
    group: 'around-sa',
    area: 'Johannesburg',
    description: 'Afropolitan music and talk from Johannesburg: jazz, soul, house and world music.',
    stream: 'https://edge.iono.fm/xice/82_medium.aac',
    website: 'https://www.kaya959.co.za/',
  },
  {
    id: 'classic-1027',
    name: 'Classic 1027',
    group: 'around-sa',
    area: 'Johannesburg',
    description: 'Classical music and easy listening, broadcasting from Johannesburg.',
    stream: 'https://edge.iono.fm/xice/49_medium.aac',
    website: 'https://www.classic1027.co.za/',
  },
  {
    id: 'lekker-fm',
    name: 'Lekker FM',
    group: 'around-sa',
    area: 'Online · Afrikaans',
    description: 'Afrikaans music station streaming online around the clock.',
    stream: 'https://zas3.ndx.co.za:8002/stream',
    website: 'https://www.lekkerfm.com/',
  },
  {
    id: 'radio-pulpit',
    name: 'Radio Pulpit',
    group: 'around-sa',
    area: 'National · Christian',
    description: 'Christian radio with worship music, teaching and family programmes.',
    stream: 'https://edge.iono.fm/xice/189_medium.aac',
    website: 'https://www.radiopulpit.co.za/',
  },
];
