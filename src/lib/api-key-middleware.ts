import { HttpRequest } from "@azure/functions";
import { logger } from "./logger";

export const validateApiKey = (req: HttpRequest): boolean => {
    const apiKey = req.headers["x-api-key"];
    const validApiKey = process.env.API_KEY;

    if (!validApiKey) {
	logger.error("API_KEY is not configured in environment");
	return false;
    };

    if (!apiKey) {
	logger.error("Request is missing x-api-key header");
	return false;
    };

    return apiKey === validApiKey;
};
