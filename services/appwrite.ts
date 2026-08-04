import { Client, Databases, ID, Query } from "react-native-appwrite";

const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT;
const PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID;
const DATABASE_ID = process.env.EXPO_PUBLIC_APPWRITE_DATABASE_ID;
const COLLECTION_ID = process.env.EXPO_PUBLIC_APPWRITE_COLLECTION_ID;
const COLLECTION_ID_SAVED_SHOW =
  process.env.EXPO_PUBLIC_APPWRITE_SAVED_COLLECTION_ID;

if (!PROJECT_ID || !APPWRITE_ENDPOINT || !DATABASE_ID || !COLLECTION_ID) {
  throw new Error("Missing Appwrite env vars — check your .env file");
}

export const client = new Client()
  .setProject(PROJECT_ID)
  .setEndpoint(APPWRITE_ENDPOINT);

const database = new Databases(client);

export const updateSearchCount = async (query: string, show: Show) => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.equal("searchTerm", query),
    ]);
    if (result.documents.length > 0) {
      const existingDoc = result.documents[0];
      database.updateDocument(DATABASE_ID, COLLECTION_ID, existingDoc.$id, {
        count: existingDoc.count + 1,
      });
    } else {
      database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
        searchTerm: query,
        show_id: show.id,
        title: show.name,
        count: 1,
        poster_url: show.image?.medium ?? "",
      });
    }
  } catch (err) {
    console.log({ err });
  }
};

export const getTrendingShows = async (): Promise<
  TrendingShow[] | undefined
> => {
  try {
    const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
      Query.limit(5),
      Query.orderDesc("count"),
    ]);
    return result.documents as unknown as TrendingShow[];
  } catch (err) {
    console.log({ err });
    return undefined;
  }
};

export const isShowSaved = async (showId: number) => {
  try {
    const existingShow = await database.listDocuments(
      DATABASE_ID,
      COLLECTION_ID_SAVED_SHOW,
      [Query.equal("id", showId)],
    );
    if (existingShow.documents.length > 0) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    console.log({ err });
  }
};

export const toggleSavedShow = async (show: Show) => {
  try {
    database.createDocument(DATABASE_ID, COLLECTION_ID_SAVED_SHOW, ID.unique(), {
      title: show.name,
      poster_url: show.image?.medium ?? "",
      show_id: show.id,
      rating: show.rating.average,
      premiered: show.premiered,
    });
  } catch (err) {
    console.log({ err });
  }
};
