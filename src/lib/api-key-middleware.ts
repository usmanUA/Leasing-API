import { HttpRequest } from "@azure/functions";

export const validateApiKey = (req: HttpRequest): boolean => {
    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.API_KEY;
    return apiKey === validApiKey;
};
