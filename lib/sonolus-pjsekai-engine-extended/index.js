import { Resource } from "./Resource.js";
export * from "usctool";
export { migrateVUSC as migrateUSC } from "usctool";
export { uscToLevelData } from "./convert.js";
export const version = "1.3.1";
export const engineInfo = {
    name: "pjsekai",
    version: 13,
    title: {
        en: "Project Sekai",
        ja: "プロセカ",
        ko: "프로젝트 세카이",
        zhs: "世界计划",
        zht: "世界計劃",
    },
    subtitle: {
        en: "Project Sekai: Colorful Stage!",
        ja: "プロジェクトセカイ カラフルステージ!",
        ko: "프로젝트 세카이: 컬러풀 스테이지!",
        zhs: "世界计划 彩色舞台",
        zht: "世界計畫 繽紛舞台！",
    },
    author: {
        en: "Burrito",
    },
    description: {
        en: [
            "A recreation of Project Sekai: Colorful Stage! engine in Sonolus.",
            `Version: ${version}`,
            "",
            "GitHub Repository",
            "https://github.com/NonSpicyBurrito/sonolus-pjsekai-engine",
        ].join("\n"),
    },
};
export const engineConfiguration = new Resource("EngineConfiguration");
export const enginePlayData = new Resource("EnginePlayData");
export const enginePreviewData = new Resource("EnginePreviewData");
export const engineTutorialData = new Resource("EngineTutorialData");
export const engineThumbnail = new Resource("thumbnail.png");
