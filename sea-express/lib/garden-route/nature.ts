export interface NatureArticle {
  slug: string;
  category: string;
  title: string;
  location: string;
  readTime: string;
  body: string[];
  link?: {
    url: string;
    label: string;
  };
  summary: string;
  content: string;
  image?: string;
  tab?: 'trails' | 'dyk';
  excerpt?: string;
}

// Recovered by scripts/restore-nature-articles.mjs from the rendered pages in
// public/nature/, which survived after this array was emptied. Re-run that
// script rather than editing by hand.
export const NATURE_ARTICLES: NatureArticle[] = [
  {
    slug: 'cape-st-blaize-trail',
    category: 'Reserves & Trails',
    title: 'Cape St Blaize: a lighthouse, a cave and a cliff-top trail',
    location: 'The Point, Mossel Bay',
    readTime: '3 min read',
    tab: 'trails',
    body: [
      'At the Point in Mossel Bay stands the Cape St Blaize lighthouse, commissioned in 1864 and still in operation. Just below it, the St Blaize Cave shelters evidence of some of the earliest known coastal foragers — people who lived off the sea here in the Middle Stone Age.',
      'From the cave, the St Blaize Trail runs roughly 13.5 km along the cliffs to Dana Bay, with constant ocean views, blowholes and good chances of spotting dolphins and, in season, southern right whales.',
      'You can walk as much or as little as you like and turn back at any point; the first kilometres from the lighthouse are the most dramatic. The path is exposed, so carry water and a hat.',
      'Mossel Bay also marks where the Portuguese navigator Bartolomeu Dias landed in 1488, commemorated at the Dias Museum complex a short distance away.',
    ],
    summary: 'At the Point in Mossel Bay stands the Cape St Blaize lighthouse, commissioned in 1864 and still in operation. Just below it, the St Blaize Cave shelters evidenc',
    excerpt: 'At the Point in Mossel Bay stands the Cape St Blaize lighthouse, commissioned in 1864 and still in operation. Just below it, the St Blaize Cave shelters evidenc',
    content: 'At the Point in Mossel Bay stands the Cape St Blaize lighthouse, commissioned in 1864 and still in operation. Just below it, the St Blaize Cave shelters evidence of some of the earliest known coastal foragers — people who lived off the sea here in the Middle Stone Age.\n\nFrom the cave, the St Blaize Trail runs roughly 13.5 km along the cliffs to Dana Bay, with constant ocean views, blowholes and good chances of spotting dolphins and, in season, southern right whales.\n\nYou can walk as much or as little as you like and turn back at any point; the first kilometres from the lighthouse are the most dramatic. The path is exposed, so carry water and a hat.\n\nMossel Bay also marks where the Portuguese navigator Bartolomeu Dias landed in 1488, commemorated at the Dias Museum complex a short distance away.',
  },
  {
    slug: 'dyk-big-tree',
    category: 'Did you know?',
    title: 'There\'s an 800-year-old tree near Storms River',
    location: 'Tsitsikamma',
    readTime: '2 min read',
    tab: 'dyk',
    body: [
      'A short boardwalk off the N2 near Storms River leads to the Big Tree, an Outeniqua yellowwood (Afrocarpus falcatus) estimated at more than 800 years old, around 36 metres tall.',
      'Yellowwoods are South Africa’s national tree. Many of the giants in the Garden Route forests were lost to logging in the 1800s, which makes survivors like this one — protected within the Garden Route National Park — especially rare.',
    ],
    summary: 'A short boardwalk off the N2 near Storms River leads to the Big Tree, an Outeniqua yellowwood (Afrocarpus falcatus) estimated at more than 800 years old, around',
    excerpt: 'A short boardwalk off the N2 near Storms River leads to the Big Tree, an Outeniqua yellowwood (Afrocarpus falcatus) estimated at more than 800 years old, around',
    content: 'A short boardwalk off the N2 near Storms River leads to the Big Tree, an Outeniqua yellowwood (Afrocarpus falcatus) estimated at more than 800 years old, around 36 metres tall.\n\nYellowwoods are South Africa’s national tree. Many of the giants in the Garden Route forests were lost to logging in the 1800s, which makes survivors like this one — protected within the Garden Route National Park — especially rare.',
  },
  {
    slug: 'dyk-choo-tjoe',
    category: 'Did you know?',
    title: 'A steam train once linked George and Knysna',
    location: 'Garden Route',
    readTime: '2 min read',
    tab: 'dyk',
    body: [
      'For decades the Outeniqua Choo-Tjoe steam train carried passengers between George and Knysna, hugging the coast and crossing the Kaaimans River bridge — often called one of the most scenic rail journeys anywhere.',
      'Storm damage to the line in 2006 ended the full service. Heritage steam trips still run on parts of the route from time to time, and the line remains a beloved piece of Garden Route history.',
    ],
    summary: 'For decades the Outeniqua Choo-Tjoe steam train carried passengers between George and Knysna, hugging the coast and crossing the Kaaimans River bridge — often c',
    excerpt: 'For decades the Outeniqua Choo-Tjoe steam train carried passengers between George and Knysna, hugging the coast and crossing the Kaaimans River bridge — often c',
    content: 'For decades the Outeniqua Choo-Tjoe steam train carried passengers between George and Knysna, hugging the coast and crossing the Kaaimans River bridge — often called one of the most scenic rail journeys anywhere.\n\nStorm damage to the line in 2006 ended the full service. Heritage steam trips still run on parts of the route from time to time, and the line remains a beloved piece of Garden Route history.',
  },
  {
    slug: 'dyk-knysna-seahorse',
    category: 'Did you know?',
    title: 'Knysna has its own seahorse',
    location: 'Knysna Estuary',
    readTime: '2 min read',
    tab: 'dyk',
    body: [
      'The Knysna seahorse (Hippocampus capensis) is the only seahorse in the world classified as Endangered, and it is found in just three South African estuaries: Knysna, Swartvlei and the Keurbooms.',
      'It survives in the brackish water of the Knysna estuary by clinging to eelgrass and seaweed with its tail. Because it lives nowhere else, protecting the estuary directly protects the species — one reason boating and bait-collecting are regulated here.',
    ],
    summary: 'The Knysna seahorse (Hippocampus capensis) is the only seahorse in the world classified as Endangered, and it is found in just three South African estuaries: Kn',
    excerpt: 'The Knysna seahorse (Hippocampus capensis) is the only seahorse in the world classified as Endangered, and it is found in just three South African estuaries: Kn',
    content: 'The Knysna seahorse (Hippocampus capensis) is the only seahorse in the world classified as Endangered, and it is found in just three South African estuaries: Knysna, Swartvlei and the Keurbooms.\n\nIt survives in the brackish water of the Knysna estuary by clinging to eelgrass and seaweed with its tail. Because it lives nowhere else, protecting the estuary directly protects the species — one reason boating and bait-collecting are regulated here.',
  },
  {
    slug: 'dyk-tsitsikamma-name',
    category: 'Did you know?',
    title: '"Tsitsikamma" means place of much water',
    location: 'Tsitsikamma',
    readTime: '1 min read',
    tab: 'dyk',
    body: [
      'Tsitsikamma is widely understood to come from a Khoekhoe phrase meaning "place of much water" or "clear water" — fitting for a coast of high rainfall, forested gorges and rivers tumbling to the sea.',
      'That water shaped everything here, from the indigenous forest to the Storms River mouth, where a suspension bridge crosses the river as it meets the Indian Ocean.',
    ],
    summary: 'Tsitsikamma is widely understood to come from a Khoekhoe phrase meaning "place of much water" or "clear water" — fitting for a coast of high rainfall, forested ',
    excerpt: 'Tsitsikamma is widely understood to come from a Khoekhoe phrase meaning "place of much water" or "clear water" — fitting for a coast of high rainfall, forested ',
    content: 'Tsitsikamma is widely understood to come from a Khoekhoe phrase meaning "place of much water" or "clear water" — fitting for a coast of high rainfall, forested gorges and rivers tumbling to the sea.\n\nThat water shaped everything here, from the indigenous forest to the Storms River mouth, where a suspension bridge crosses the river as it meets the Indian Ocean.',
  },
  {
    slug: 'garden-route-national-park',
    category: 'National Parks',
    title: 'Garden Route National Park: forest, fynbos and the Otter Trail',
    location: 'Tsitsikamma · Wilderness · Knysna',
    readTime: '4 min read',
    tab: 'trails',
    body: [
      'The Garden Route National Park, proclaimed in 2009, stitches together the former Tsitsikamma and Wilderness national parks with the Knysna forests and lakes. It is managed by SANParks and stretches along the coast and into the mountains.',
      'The Tsitsikamma section, at Storms River Mouth, is the best known. Here a suspension bridge crosses the river gorge, short boardwalk trails thread through forest, and the legendary five-day Otter Trail begins — booked many months in advance.',
      'Inland and to the west, the Wilderness section protects a chain of lakes and the Touw and Serpentine rivers, ideal for paddling and birdwatching, while the Knysna section conserves some of the last large tracts of indigenous Afrotemperate forest in the country.',
      'Day visitors can buy permits at each section’s gate. The park is open year-round, though winter and spring bring the clearest hiking weather and the fewest crowds.',
    ],
    summary: 'The Garden Route National Park, proclaimed in 2009, stitches together the former Tsitsikamma and Wilderness national parks with the Knysna forests and lakes. It',
    excerpt: 'The Garden Route National Park, proclaimed in 2009, stitches together the former Tsitsikamma and Wilderness national parks with the Knysna forests and lakes. It',
    content: 'The Garden Route National Park, proclaimed in 2009, stitches together the former Tsitsikamma and Wilderness national parks with the Knysna forests and lakes. It is managed by SANParks and stretches along the coast and into the mountains.\n\nThe Tsitsikamma section, at Storms River Mouth, is the best known. Here a suspension bridge crosses the river gorge, short boardwalk trails thread through forest, and the legendary five-day Otter Trail begins — booked many months in advance.\n\nInland and to the west, the Wilderness section protects a chain of lakes and the Touw and Serpentine rivers, ideal for paddling and birdwatching, while the Knysna section conserves some of the last large tracts of indigenous Afrotemperate forest in the country.\n\nDay visitors can buy permits at each section’s gate. The park is open year-round, though winter and spring bring the clearest hiking weather and the fewest crowds.',
    link: { url: 'https://www.sanparks.org/parks/garden-route', label: 'Official information & permits' },
  },
  {
    slug: 'knysna-heads-lagoon',
    category: 'Landmarks',
    title: 'The Knysna Heads and the lagoon they guard',
    location: 'Knysna Estuary',
    readTime: '3 min read',
    tab: 'trails',
    body: [
      'The Knysna Heads are the town’s defining landmark: two towering cliffs that flank the slim, turbulent channel linking the Knysna estuary to the open ocean. The Eastern Head is reachable by road and has viewpoints and restaurants; the Western Head, Featherbed, is a private reserve visited by ferry.',
      'The channel itself is notoriously treacherous, with shifting sandbanks and strong currents that have claimed many boats — it is rated one of the most dangerous harbour mouths in the world.',
      'Behind the Heads spreads the estuary, a richly biodiverse system and the only home of the Knysna seahorse (Hippocampus capensis), one of the most endangered seahorses in the world. The estuary forms part of the Garden Route National Park.',
      'For the classic view, drive up George Rex Drive to the Eastern Head lookout, or take a ferry across to Featherbed for a guided walk through coastal forest and fynbos.',
    ],
    summary: 'The Knysna Heads are the town’s defining landmark: two towering cliffs that flank the slim, turbulent channel linking the Knysna estuary to the open ocean. The ',
    excerpt: 'The Knysna Heads are the town’s defining landmark: two towering cliffs that flank the slim, turbulent channel linking the Knysna estuary to the open ocean. The ',
    content: 'The Knysna Heads are the town’s defining landmark: two towering cliffs that flank the slim, turbulent channel linking the Knysna estuary to the open ocean. The Eastern Head is reachable by road and has viewpoints and restaurants; the Western Head, Featherbed, is a private reserve visited by ferry.\n\nThe channel itself is notoriously treacherous, with shifting sandbanks and strong currents that have claimed many boats — it is rated one of the most dangerous harbour mouths in the world.\n\nBehind the Heads spreads the estuary, a richly biodiverse system and the only home of the Knysna seahorse (Hippocampus capensis), one of the most endangered seahorses in the world. The estuary forms part of the Garden Route National Park.\n\nFor the classic view, drive up George Rex Drive to the Eastern Head lookout, or take a ferry across to Featherbed for a guided walk through coastal forest and fynbos.',
    link: { url: 'https://www.sanparks.org/parks/garden-route', label: 'Official information & permits' },
  },
  {
    slug: 'outeniqua-passes',
    category: 'Scenic Drives',
    title: 'Over the Outeniquas: the historic Montagu Pass',
    location: 'Outeniqua Mountains',
    readTime: '3 min read',
    tab: 'trails',
    body: [
      'The Outeniqua Mountains form the green wall behind George, separating the coastal plain from the dry Klein Karoo beyond. Several passes cross them, but the most atmospheric is the Montagu Pass.',
      'Opened in 1847 and built largely by hand, the Montagu Pass is a national monument and one of the oldest unaltered mountain passes still in use in South Africa. The narrow gravel road winds past dry-stone retaining walls, an old toll house and forested kloofs.',
      'Alongside it runs the modern Outeniqua Pass (the tarred N9/N12), faster but far less evocative. For walkers, the multi-day Outeniqua Trail traverses the indigenous forest on the mountains’ seaward slopes.',
      'Drive the Montagu Pass slowly and in a sturdy vehicle; it is usually passable in a normal car in dry weather but can wash out after heavy rain. The views back over George and the sea are the reward.',
    ],
    summary: 'The Outeniqua Mountains form the green wall behind George, separating the coastal plain from the dry Klein Karoo beyond. Several passes cross them, but the most',
    excerpt: 'The Outeniqua Mountains form the green wall behind George, separating the coastal plain from the dry Klein Karoo beyond. Several passes cross them, but the most',
    content: 'The Outeniqua Mountains form the green wall behind George, separating the coastal plain from the dry Klein Karoo beyond. Several passes cross them, but the most atmospheric is the Montagu Pass.\n\nOpened in 1847 and built largely by hand, the Montagu Pass is a national monument and one of the oldest unaltered mountain passes still in use in South Africa. The narrow gravel road winds past dry-stone retaining walls, an old toll house and forested kloofs.\n\nAlongside it runs the modern Outeniqua Pass (the tarred N9/N12), faster but far less evocative. For walkers, the multi-day Outeniqua Trail traverses the indigenous forest on the mountains’ seaward slopes.\n\nDrive the Montagu Pass slowly and in a sturdy vehicle; it is usually passable in a normal car in dry weather but can wash out after heavy rain. The views back over George and the sea are the reward.',
  },
  {
    slug: 'robberg-nature-reserve',
    category: 'Reserves & Trails',
    title: 'Robberg Nature Reserve: a peninsula walk above the seals',
    location: 'Robberg Peninsula',
    readTime: '4 min read',
    tab: 'trails',
    body: [
      'Robberg Nature Reserve sits just south of Plettenberg Bay, a 4-kilometre peninsula of ancient sandstone that pushes out into the sea. It is both a provincial nature reserve and a National Monument, managed by CapeNature.',
      'Three looping routes share the same start. The full Point circuit is about 9.2 km and takes four to five hours over uneven rock; the shorter Witsand and Gap routes let you turn back sooner. Whichever you choose, the path hugs cliffs above a noisy Cape fur seal colony, and great white sharks are sometimes seen patrolling below.',
      'Near the tip, Nelson Bay Cave holds one of the most important archaeological records on the South African coast, with evidence of human occupation stretching back roughly 100,000 years. A boardwalk lets you look in without disturbing the site.',
      'Take water, sun protection and shoes with grip — there is no shade and the rocks can be slippery. The reserve charges a conservation fee at the gate and closes in the late afternoon.',
    ],
    summary: 'Robberg Nature Reserve sits just south of Plettenberg Bay, a 4-kilometre peninsula of ancient sandstone that pushes out into the sea. It is both a provincial na',
    excerpt: 'Robberg Nature Reserve sits just south of Plettenberg Bay, a 4-kilometre peninsula of ancient sandstone that pushes out into the sea. It is both a provincial na',
    content: 'Robberg Nature Reserve sits just south of Plettenberg Bay, a 4-kilometre peninsula of ancient sandstone that pushes out into the sea. It is both a provincial nature reserve and a National Monument, managed by CapeNature.\n\nThree looping routes share the same start. The full Point circuit is about 9.2 km and takes four to five hours over uneven rock; the shorter Witsand and Gap routes let you turn back sooner. Whichever you choose, the path hugs cliffs above a noisy Cape fur seal colony, and great white sharks are sometimes seen patrolling below.\n\nNear the tip, Nelson Bay Cave holds one of the most important archaeological records on the South African coast, with evidence of human occupation stretching back roughly 100,000 years. A boardwalk lets you look in without disturbing the site.\n\nTake water, sun protection and shoes with grip — there is no shade and the rocks can be slippery. The reserve charges a conservation fee at the gate and closes in the late afternoon.',
    link: { url: 'https://www.capenature.co.za/reserves/robberg-nature-reserve', label: 'Official information & permits' },
  },
  {
    slug: 'wilderness-lakes',
    category: 'Reserves & Trails',
    title: 'Wilderness: lakes, rivers and the Map of Africa',
    location: 'Touw River & Lakes',
    readTime: '3 min read',
    tab: 'trails',
    body: [
      'Wilderness lies in the Wilderness section of the Garden Route National Park, a watery landscape of five lakes linked by the Touw and Serpentine rivers and fringed with milkwood forest.',
      'The signature outing is the Giant Kingfisher Trail, a there-and-back walk up the Touw River that ends at a waterfall and pool — many visitors paddle the first stretch by canoe before continuing on foot.',
      'Above the village, the Map of Africa viewpoint looks down on a loop in the Kaaimans River that, seen from the ridge, traces the shape of the continent. The same hill is a well-known paragliding launch.',
      'Birdlife is exceptional: the lakes and reedbeds draw kingfishers, herons and the elusive African finfoot. Permits for the trails are available at the park office at Ebb and Flow.',
    ],
    summary: 'Wilderness lies in the Wilderness section of the Garden Route National Park, a watery landscape of five lakes linked by the Touw and Serpentine rivers and fring',
    excerpt: 'Wilderness lies in the Wilderness section of the Garden Route National Park, a watery landscape of five lakes linked by the Touw and Serpentine rivers and fring',
    content: 'Wilderness lies in the Wilderness section of the Garden Route National Park, a watery landscape of five lakes linked by the Touw and Serpentine rivers and fringed with milkwood forest.\n\nThe signature outing is the Giant Kingfisher Trail, a there-and-back walk up the Touw River that ends at a waterfall and pool — many visitors paddle the first stretch by canoe before continuing on foot.\n\nAbove the village, the Map of Africa viewpoint looks down on a loop in the Kaaimans River that, seen from the ridge, traces the shape of the continent. The same hill is a well-known paragliding launch.\n\nBirdlife is exceptional: the lakes and reedbeds draw kingfishers, herons and the elusive African finfoot. Permits for the trails are available at the park office at Ebb and Flow.',
    link: { url: 'https://www.sanparks.org/parks/garden-route', label: 'Official information & permits' },
  },
];

export function getNatureArticle(slug: string) {
  return NATURE_ARTICLES.find((a) => a.slug === slug);
}
