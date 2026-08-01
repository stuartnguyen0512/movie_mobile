interface Show {
  id: number;
  url: string;
  name: string;
  type: string;
  language: string | null;
  genres: string[];
  status: string;
  runtime: number | null;
  averageRuntime: number | null;
  premiered: string | null;
  ended: string | null;
  officialSite: string | null;
  schedule: {
    time: string;
    days: string[];
  };
  rating: {
    average: number | null;
  };
  weight: number;
  network: {
    id: number;
    name: string;
    country: {
      name: string;
      code: string;
      timezone: string;
    } | null;
    officialSite: string | null;
  } | null;
  webChannel: {
    id: number;
    name: string;
  } | null;
  image: {
    medium: string;
  } | null;
  summary: string | null;
  updated: number;
}

interface TrendingShow {
  searchTerm: string;
  show_id: number;
  title: string;
  count: number;
  poster_url: string;
}

interface TrendingCardProps {
  show: TrendingShow;
  index: number;
}

// TVmaze's /shows/:id endpoint returns the same shape as the show index,
// so ShowDetails and Show are structurally identical for now.
type ShowDetails = Show;
