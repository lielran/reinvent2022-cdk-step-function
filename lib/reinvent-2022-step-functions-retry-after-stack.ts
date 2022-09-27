import {Duration, Stack, StackProps} from "aws-cdk-lib";
import {Construct} from "constructs";
import {Choice, Condition, Pass, StateMachine, Wait, WaitTime} from "aws-cdk-lib/aws-stepfunctions";
import {LambdaInvoke} from "aws-cdk-lib/aws-stepfunctions-tasks";
import {NodejsFunction} from "aws-cdk-lib/aws-lambda-nodejs";


export class Reinvent2022StepFunctionsRetryAfterStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
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


        const definition = flights
            .addRetry({
                maxAttempts: 1,
                backoffRate: 2,
                //}).addCatch(this.getRateLimit(flights))
            }).addCatch(this.getRateLimit(calculateRetryAfter, flights), {errors: ['TooManyRequests429']})
            .next(
                hotel.addRetry({
                    maxAttempts: 1,
                    backoffRate: 2,

                })
                    .addCatch(this.getRateLimit(calculateRetryAfter, hotel), {errors: ['TooManyRequests429']})
            )
            .next(
                tickets.addRetry({
                    maxAttempts: 1,
                    backoffRate: 2,

                }).addCatch(this.getRateLimit(calculateRetryAfter, tickets), {errors: ['TooManyRequests429']})
            )
            .next(
                car.addRetry({
                    maxAttempts: 1,
                    backoffRate: 2,
                }).addCatch(this.getRateLimit(calculateRetryAfter, car), {errors: ['TooManyRequests429']})
            );
        new StateMachine(this, "retry-after-stateMachine", {
            stateMachineName: "retry-after-stateMachine-being-a-good-neighbour",
            definition,
            timeout: Duration.minutes(5),
        });
    }

    private getRateLimit(calculateRetryAfter: NodejsFunction, otherwise: LambdaInvoke) {


        const calculateRetryAfterInvoke = new LambdaInvoke(this, `Calculate retry-after  ${otherwise.id}`, {
            lambdaFunction: calculateRetryAfter,
        });


        const wait = new Wait(this, `Wait For Trigger Time - ${otherwise.id}`, {
            time: WaitTime.timestampPath('$.Payload.retryAfterDate'),
        });

        return calculateRetryAfterInvoke.next(wait).next(otherwise)

    }
}
