import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Chain, StateMachine, TaskInput} from "aws-cdk-lib/aws-stepfunctions";
import {EventBridgePutEvents, LambdaInvoke,} from "aws-cdk-lib/aws-stepfunctions-tasks";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";
import {EventBus} from "aws-cdk-lib/aws-events";

export class Reinvent2022StepFunctionsStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    eventBus: EventBus,
    props?: StackProps
  ) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const reteLimitFunction = new NodejsFunction(
      this,
      "random-rate-limit-api-call",
      {
        entry: "src/randomFailure.ts", // accepts .js, .jsx, .ts, .tsx and .mjs files
      }
    );

    const flights = new LambdaInvoke(this, "Order flights to vegas", {
      lambdaFunction: reteLimitFunction,
    });

    const hotel = new LambdaInvoke(this, "Order Hotel near the venue", {
      lambdaFunction: reteLimitFunction,
    });

    const tickets = new LambdaInvoke(this, "Order Tickets to Re:invent2022", {
      lambdaFunction: reteLimitFunction,
    });

    const car = new LambdaInvoke(this, "Order Car rental", {
      lambdaFunction: reteLimitFunction,
    });

    const eventBridgePutEvents = new EventBridgePutEvents(
        this,
        `Webhook via EventBridge API Destination`,
        {
          entries: [
            {
              detail: TaskInput.fromObject({
                message: "Hello from EventBridge API Destination!",
              }),
              eventBus,
              detailType: "MessageFromStepFunctions",
              source: "step.functions",
            },
          ],
        }
    )

    const chain = Chain.start(flights)
      .next(hotel)
      .next(tickets)
      .next(car)
      .next(eventBridgePutEvents);

    new StateMachine(this, "iterative-stateMachine", {
      stateMachineName: "iterative-stateMachine-being-a-good-neighbour",
      definition: chain,
      timeout: Duration.minutes(5),
    });
  }
}
