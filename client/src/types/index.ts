export interface Artist {
  _id: string;
  name: string;
  profilePicture: string;
  genres: string[];
  spotifyUrl: string;
}

export interface Suggestion {
  _id: string;
  name: string;
  profilePicture: string;
}
