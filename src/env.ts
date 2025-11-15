import dotenv from "dotenv";
dotenv.config();


export const DB_URI = process.env.DB_URI as string;
export const PORT = Number(process.env.PORT as string)
export const JWT_SECRET = process.env.JWT_SECRET as string;