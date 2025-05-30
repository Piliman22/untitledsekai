import { LocalizationText } from "@sonolus/core";
import { mapValues } from "./index.js";

export const toMultiValues = <T extends Record<PropertyKey, { title: LocalizationText }>>(
    object: T,
) =>
    mapValues(object, (_, { title }) => ({
        title,
        def: true,
    }))