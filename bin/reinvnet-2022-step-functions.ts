#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { Reinvent2022StepFunctionsStack } from "../lib/reinvent-2022-step-functions-stack";
import { Reinvent2022StepFunctionsResilienceStack } from "../lib/reinvent-2022-step-functions-resilience-stack";
import { Reinvent2022StepFunctionsRetryAfterStack } from "../lib/reinvent-2022-step-functions-retry-after-stack";
import { ApiDestinationStack } from "../lib/webhook";

const app = new cdk.App();


const apiDestinationStack = new ApiDestinationStack(
  app,
  "ApiDestinationStack",
  "https://webhook.site/671409a0-4531-4186-bd19-56e2a3b8c013"
);

new Reinvent2022StepFunctionsStack(
  app,
  "Reinvent2022StepFunctionsStack",
    apiDestinationStack.eventBus,
  {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
  }
);

new Reinvent2022StepFunctionsResilienceStack(
  app,
  "Reinvent2022StepFunctionsResilienceStack",
    apiDestinationStack.eventBus,
  {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
  }
);

new Reinvent2022StepFunctionsRetryAfterStack(
  app,
  "Reinvent2022StepFunctionsRetryAfterStack",
  apiDestinationStack.eventBus,
  {
    env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
  }
);