import { handleRecordPayment } from "../src/handlers/payment/record-payment";
import { AzureFunction, Context, HttpRequest } from "@azure/functions";

export const httpTrigger: AzureFunction = async (context: Context, req: HttpRequest) => {
    if (req.method === "POST") {
	handleRecordPayment(context, req);
    }
}
