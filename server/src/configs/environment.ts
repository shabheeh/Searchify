import dotenv from "dotenv";
dotenv.config();

interface Config {
    NODE_ENV: string;
    PORT: number;
    MONGODB_URI: string
}

const config: Config = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "5000"),
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/Searchify"
}

export default config