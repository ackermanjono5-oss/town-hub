export interface NewsOutlet {
  id: string;
  name: string;
  coverage: string;
  description: string;
  url: string;
}

export const NEWS_OUTLETS: NewsOutlet[] = [
  {
    id: 'george-herald',
    name: 'George Herald',
    coverage: 'George · Wilderness · Uniondale',
    description:
      'Weekly newspaper and daily online news for George and the surrounding Outeniqua region.',
    url: 'https://www.georgeherald.com',
  },
  {
    id: 'knysna-plett-herald',
    name: 'Knysna-Plett Herald',
    coverage: 'Knysna · Plettenberg Bay · Sedgefield',
    description: 'Community news, sport and events for the Knysna and Plettenberg Bay area.',
    url: 'https://www.knysnaplettherald.com',
  },
  {
    id: 'mossel-bay-advertiser',
    name: 'Mossel Bay Advertiser',
    coverage: 'Mossel Bay · Hartenbos · Great Brak River',
    description: 'Local news, classifieds and community stories for greater Mossel Bay.',
    url: 'https://www.mosselbayadvertiser.com',
  },
  {
    id: 'sea-express',
    name: 'Sea Express',
    coverage: 'Mossel Bay · Garden Route',
    description: 'Local community newspaper keeping residents informed about news, sport and events along the Garden Route.',
    url: 'https://www.facebook.com/SeaExpressNewspaper',
  },
  {
    id: 'garden-route-district-municipality',
    name: 'Garden Route District Municipality',
    coverage: 'Garden Route region',
    description:
      'Official notices, road and fire updates, and public announcements from the district municipality.',
    url: 'https://www.gardenroute.gov.za',
  },
];
