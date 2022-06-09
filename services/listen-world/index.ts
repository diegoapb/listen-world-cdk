/* eslint-disable @typescript-eslint/require-await */
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

export async function main(
    event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {
    console.log("event 👉", event);
    console.log("Hello CDK")

    return {
        body: JSON.stringify({
            message: "Successful lambda invocation",
            event: event,
        }),
        statusCode: 200,
    };
}
