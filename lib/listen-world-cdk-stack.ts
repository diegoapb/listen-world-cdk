import { CfnOutput, Duration, Stack, StackProps } from "aws-cdk-lib";
import {
    LambdaIntegration,
    RestApi,
    Resource,
} from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
// import * as sqs from 'aws-cdk-lib/aws-sqs';

// config integration api to lambda
const connectLambdaToApi = (
    api: RestApi,
    lambda: NodejsFunction,
    endpoint: string,
    method: string,
    apiResources?: Array<Resource>
) => {
    apiResources = apiResources || [];
    let endpoints = endpoint.split("/");

    for (let i = 0; i < endpoints.length; i++) {
        let resource: any = apiResources.find((r) => r.path === endpoints[i]);
        if (!resource) {
            if (i === 0) {
                resource = api.root;
            } else {
                resource = apiResources[i - 1];
            }
            const newResource = resource.addResource(endpoints[i]);
            apiResources.push(newResource);
        }
    }
    const lambdaIntegration = new LambdaIntegration(lambda);
    const apiMethod = apiResources[apiResources.length - 1].addMethod(
        method,
        lambdaIntegration
    );
    return {
        apiResources,
        lambdaIntegration,
        apiMethod,
    };
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
        const listenPath = connectLambdaToApi(
            api,
            listenWorldLambda,
            "listen",
            "POST"
        );
        const notificationListenerPath = connectLambdaToApi(
            api,
            listenWorldLambda,
            "notification/listener",
            "POST"
        );

        // output the api endpoint url
        new CfnOutput(this, "listenWorldApiUrl", {
            value: listenPath.apiResources[listenPath.apiResources.length - 1]
                .path,
        });
    }
}
