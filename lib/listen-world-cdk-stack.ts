import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// config integration api to lambda
const connectLambdaToApi = (
    api: RestApi,
    lambda: NodejsFunction,
    endpoint: string,
    method: string
) => {
    const apiResource = api.root.addResource(endpoint);
    const lambdaIntegration = new LambdaIntegration(lambda);
    const tronGetBalancMethod = apiResource.addMethod(
        method,
        lambdaIntegration
    );
};
export class ListenWorldCdkStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const api = new RestApi(this, "listenWorldApi");

        const listenWorldLambda = new NodejsFunction(
            this,
            "listenWorldLambda",
            {
                entry: join(
                    __dirname,
                    "..",
                    "services",
                    "listen-world",
                    `index.ts`
                ),
                handler: "main",
                timeout: Duration.seconds(3),
                memorySize: 256,
            }
        );
        connectLambdaToApi(api, listenWorldLambda, "listen", "POST");
    }
}
