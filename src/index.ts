import { Sonolus, SonolusSpaShare } from "@sonolus/express";
import express from "express";
import dotenv from "dotenv";
import { packPath } from "@sonolus/free-pack"
import { install } from "./install.js";
import sonolusAuthRouter from "./sonolus/auth/auth.js";
import { maintenanceMiddleware } from "./api/middleware/maintenance.js";
import { likeRouter } from "./api/liked.js";

import cors from 'cors';
import morgan from "morgan";

dotenv.config();

export const sonolus = new Sonolus();
const share = new SonolusSpaShare('./public');
const port = process.env.PORT || 3000;
const app = express();
app.use(morgan("dev"));

app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? process.env.FRONTEND_URL || true // 本番環境では特定のオリジンを許可するか、環境変数で設定
        : true, // 開発環境ではすべてのオリジンを許可
    credentials: true // クッキーとかの認証情報も許可
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(maintenanceMiddleware);

app.use(sonolusAuthRouter);
app.use(likeRouter);
app.use(sonolus.router);
app.use(share.router);

sonolus.load('./pack')
sonolus.load(packPath);

install();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
})