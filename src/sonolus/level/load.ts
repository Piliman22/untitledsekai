import { LevelModel } from "../../models/level.js";
import { LevelItemModel } from "@sonolus/express";

let cachedPublicLevels: LevelItemModel[] = [];
let cachedPrivateLevels: LevelItemModel[] = [];
let lastFetchTime = 0;

const CACHE_TTL = 300000;

export function resetLevelCache() {
  lastFetchTime = 0;
}

export async function fetchAndFormatLevels() {
  const now = Date.now();
  
  if (now - lastFetchTime > CACHE_TTL) {
    const publicLevels = await LevelModel.find({ "meta.isPublic": true }).sort({ createdAt: -1 }).lean();
    const privateLevels = await LevelModel.find({ "meta.isPublic": false }).sort({ createdAt: -1 }).lean();
    
    cachedPublicLevels = publicLevels.map(doc => {
      const { _id, __v, createdAt, ...levelData } = doc;
      return {
        ...levelData,
        meta: {
          ...levelData.meta,
          isPublic: levelData.meta?.isPublic ?? true,
        }
      } as unknown as LevelItemModel;
    });
    
    cachedPrivateLevels = privateLevels.map(doc => {
      const { _id, __v, createdAt, ...levelData } = doc;
      return {
        ...levelData,
        meta: {
          ...levelData.meta,
          isPublic: levelData.meta?.isPublic ?? false,
        }
      } as unknown as LevelItemModel;
    });
    
    lastFetchTime = now;
  }
  
  return {
    publicLevels: cachedPublicLevels,
    privateLevels: cachedPrivateLevels
  };
}

export async function getFormattedLevels() {
  const { publicLevels } = await fetchAndFormatLevels();
  return publicLevels;
}