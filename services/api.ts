const BASE_URL = "https://api.tvmaze.com";

export async function fetchShows({ query }: { query?: string } = {}): Promise<
  Show[]
> {
  const endpoint = query
    ? `${BASE_URL}/search/shows?q=${query}`
    : `${BASE_URL}/shows?page=0`;

  const response = await fetch(endpoint);

  if (!response.ok) {
    throw new Error(`Failed to fetch shows: ${response.statusText}`);
  }

  const data = await response.json();
  if (query) {
    const results = data.map((item: any) => item.show);
    return results.slice(0, 20);
  }
  return data.slice(0, 20);
}

export async function fetchShowDetails(showId: string): Promise<ShowDetails> {
  try {
    const response = await fetch(`${BASE_URL}/shows/${showId}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch show details: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching show details: ", error);
    throw error;
  }
}
