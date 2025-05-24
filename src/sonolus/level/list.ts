import { sonolus } from "../../index.js";
import { getFormattedLevels } from "./load.js";

export const list_level = () => {
    sonolus.level.listHandler = async () => {
        const formattedLevels = await getFormattedLevels();
        
        return {
            items: formattedLevels,
            pageCount: 1,
        };
    };
}