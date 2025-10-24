import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

app.http("healthCheck", {
    route: "health-check",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async function (
    request: HttpRequest,
    context: InvocationContext
    ): Promise<HttpResponseInit> {
	const { handleHealthCheck } = await import("../../src/handlers/health-check");
	return handleHealthCheck(request, context);
    }
});
