import dotenv from "dotenv";
dotenv.config();

interface Config {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string
    SPOTIFY_CLIENT_ID: string;
    SPOTIFY_CLIENT_SECRET: string;
    TARGET_ARTIST_COUNT: number;
}

const config: Config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000"),
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/Searchify",
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID || "",
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET || "",
    TARGET_ARTIST_COUNT: parseInt(process.env.TARGET_ARTIST_COUNT || "10000")
}

export default config