import { handleCalculateQuote } from "../src/handlers/quote/calculate-quote";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
	if (req.method === "GET") {
	    handleCalculateQuote(context, req);
	}
}
