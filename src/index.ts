import express from "express";
import dotenv from "dotenv";
import "reflect-metadata";
import morgan from "morgan";
import cors from "cors";
import globalRouter from "./routes";

dotenv.config();
const PORT = 6001;

declare global {
  namespace Express {
    export interface Request {
      currentUser?: {
        id: string;
        email: string;
        name: string;
        age: number;
        gender: string;
        phone: string;
        url: string | null;
        imageName:string | null;
      };
    }
  }
}

// init app
const app = express();

//init middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(
  cors({
    origin: "*",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use("/api", globalRouter);

app.listen(PORT, () => {
  console.log(`app running on ${PORT}`);
});
