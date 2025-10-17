import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { handleCreateLease } from "../src/handlers/lease/create-lease";
import { handleGetLease } from "../src/handlers/lease/get-lease";


export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
    if (req.method === "POST") {
	await handleCreateLease(context, req);
    } else if (req.method === "GET") {
	await handleGetLease(context, req);
    }
};
