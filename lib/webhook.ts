import {SecretValue, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {EventBridgePutEvents} from "aws-cdk-lib/aws-stepfunctions-tasks";
import {ApiDestination, Authorization, Connection, EventBus, HttpMethod, Rule,} from "aws-cdk-lib/aws-events";
import {ApiDestination as ApiDestinationTarget} from "aws-cdk-lib/aws-events-targets";

export class ApiDestinationStack extends Stack {
  readonly sendEventBridge: EventBridgePutEvents;
  readonly eventBus: EventBus;

  constructor(
    scope: Construct,
    id: string,
    webhookUrl: string,
    props?: StackProps
  ) {
    super(scope, id, props);

    const secret: SecretValue = new SecretValue("api-key"); //SecretValue.secretsManager('ApiSecretName')),

    const connection = new Connection(this, "Connection", {
      authorization: Authorization.apiKey("x-api-key", secret),
      description: "Connection with API Key x-api-key",
      connectionName: "webhook",
    });
    const destination: ApiDestination = new ApiDestination(
      this,
      "Destination",
      {
        connection,
        endpoint: webhookUrl,
        description: "Calling example.com with API key x-api-key",
        httpMethod: HttpMethod.POST,
        apiDestinationName: "reinvent-2022-demo-api-destination",
        rateLimitPerSecond: 1,
      }
    );
    const target = new ApiDestinationTarget(destination);

    this.eventBus = new EventBus(this, "EventBus", {
      eventBusName: "reinvent-2022-sfn-demo",
    });

    const rule = new Rule(this, `rule`, {
      eventBus: this.eventBus,
      ruleName: "send-to-webhook",
      description: "Send to webhook",
      eventPattern: {
        detail: {
          message: [{ exists: true }],
        },
      },
    });
    rule.addTarget(target);

  }
}
