import { charts } from "./chart.js";
import { getStorageData } from "./storage.js";
import { getUser } from "./users.js";
import { getMaintenanceState } from "../discord/maintenance.js";

export const api = () => {
    charts();
    getStorageData();
    getUser();
    getMaintenanceState();
    // ここに他のAPIエンドポイントを追加
}