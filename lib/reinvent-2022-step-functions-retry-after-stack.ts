import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import {StateMachine, TaskInput, Wait, WaitTime} from "aws-cdk-lib/aws-stepfunctions";
import {
  EventBridgePutEvents,
  LambdaInvoke,
} from "aws-cdk-lib/aws-stepfunctions-tasks";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { RetryProps } from "aws-cdk-lib/aws-stepfunctions/lib/types";
import {EventBus} from "aws-cdk-lib/aws-events";

export class Reinvent2022StepFunctionsRetryAfterStack extends Stack {
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

    // The code that defines your stack goes here
    const calculateRetryAfter = new NodejsFunction(
      this,
      "calculate-retry-after",
      {
        entry: "src/calculateRetryAfter.ts", // accepts .js, .jsx, .ts, .tsx and .mjs files
      }
    );

    const flights = new LambdaInvoke(this, "Order flights to Vegas", {
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

    const errorHandling: RetryProps = {
      maxAttempts: 6,
      backoffRate: 2,
      errors: ["GeneralAPIError"],
    };

    const definition = flights
      .addCatch(this.getRateLimit(calculateRetryAfter, flights), {
        errors: ["TooManyRequests429"],
      })
      .addRetry(errorHandling)
      .next(
        hotel
          .addCatch(this.getRateLimit(calculateRetryAfter, hotel), {
            errors: ["TooManyRequests429"],
          })
          .addRetry(errorHandling)
      )
      .next(
        tickets
          .addCatch(this.getRateLimit(calculateRetryAfter, tickets), {
            errors: ["TooManyRequests429"],
          })
          .addRetry(errorHandling)
      )
      .next(
        car
          .addCatch(this.getRateLimit(calculateRetryAfter, car), {
            errors: ["TooManyRequests429"],
          })
          .addRetry(errorHandling)
      )
      .next(eventBridgePutEvents);

    new StateMachine(this, "retry-after-stateMachine", {
      stateMachineName: "retry-after-stateMachine-being-a-good-neighbour",
      definition,
      timeout: Duration.minutes(5),
    });
  }

  private getRateLimit(
    calculateRetryAfter: NodejsFunction,
    otherwise: LambdaInvoke
  ) {
    const calculateRetryAfterInvoke = new LambdaInvoke(
      this,
      `Calculate retry-after  ${otherwise.id}`,
      {
        lambdaFunction: calculateRetryAfter,
      }
    );

    const wait = new Wait(this, `Wait For Retry-After Time - ${otherwise.id}`, {
      time: WaitTime.timestampPath("$.Payload.retryAfterDate"),
    });

    return calculateRetryAfterInvoke.next(wait).next(otherwise);
  }
}
