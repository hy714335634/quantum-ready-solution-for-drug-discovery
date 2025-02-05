import {
  aws_iam as iam,
  aws_ec2 as ec2,
  Stack,
  Arn,
  ArnFormat,
  CfnCondition,
  CustomResource,
  CfnCustomResource,
  Duration,
} from 'aws-cdk-lib';

import {
  Runtime,
} from 'aws-cdk-lib/aws-lambda';
import {
  NodejsFunction,
} from 'aws-cdk-lib/aws-lambda-nodejs';


import {
  Provider,
} from 'aws-cdk-lib/custom-resources';
import {
  Construct,
} from 'constructs';


function addPolicyToCustomResourceLambdaRole(scope: Construct, role: iam.Role): iam.Role {
  const account_id = Stack.of(scope).account;
  const region = Stack.of(scope).region;

  role.addToPolicy(new iam.PolicyStatement({
    resources: [
      Arn.format({
        service: 'events',
        region: 'us-west-2',
        resource: `rule/QRSFDD-BraketEventTo${region}*`,
        account: account_id,
        arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      }, Stack.of(scope)),

    ],
    actions: [
      'events:DescribeRule',
      'events:DeleteRule',
      'events:PutTargets',
      'events:EnableRule',
      'events:PutRule',
      'events:RemoveTargets',
      'events:DisableRule',
    ],
  }));

  role.addToPolicy(new iam.PolicyStatement({
    resources: [
      Arn.format({
        service: 'cloudformation',
        region: 'us-west-2',
        resource: `stack/QRSFDD-BraketEventTo${region}/*`,
        account: account_id,
        arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      }, Stack.of(scope)),
    ],
    actions: [
      'cloudformation:CreateChangeSet',
      'cloudformation:DeleteChangeSet',
      'cloudformation:DescribeChangeSet',
      'cloudformation:ExecuteChangeSet',
      'cloudformation:UpdateStack',
      'cloudformation:DeleteStack',
      'cloudformation:CreateStack',
      'cloudformation:DescribeStacks',
    ],
  }));
  return role;
}

function createEventBridgeRole(scope: Construct): iam.Role {
  const account_id = Stack.of(scope).account;
  const region = Stack.of(scope).region;

  const role = new iam.Role(scope, 'EventBridgeRole', {
    assumedBy: new iam.ServicePrincipal('events.amazonaws.com'),
  });

  role.addToPolicy(new iam.PolicyStatement({
    resources: [
      Arn.format({
        service: 'events',
        resource: 'event-bus/default',
        region: region,
        account: account_id,
        arnFormat: ArnFormat.COLON_RESOURCE_NAME,
      }, Stack.of(scope)),
    ],
    actions: [
      'events:PutEvents',
    ],
  }));

  return role;
}

interface Props {
  crossEventRegionCondition: CfnCondition;
  vpc: ec2.Vpc;
  sg: ec2.SecurityGroup;
}

export default (scope: Construct, props: Props) => {

  const template_file = 'src/molecular-unfolding/cdk/utils/custom-resource-lambda/create-event-rule/template.json';

  const eventBridgeRole = createEventBridgeRole(scope);

  const createEventRuleFunc = new NodejsFunction(scope, 'CreateEventRuleFunc', {
    entry: `${__dirname}/custom-resource-lambda/create-event-rule/index.ts`,
    handler: 'handler',
    timeout: Duration.minutes(5),
    memorySize: 256,
    runtime: Runtime.NODEJS_14_X,
    reservedConcurrentExecutions: 5,
    vpc: props.vpc,
    securityGroups: [props.sg],
    vpcSubnets: props.vpc.selectSubnets({
      subnetType: ec2.SubnetType.PRIVATE_WITH_NAT,
    }),
    environment: {
      EVENT_BRIDGE_ROLE_ARN: eventBridgeRole.roleArn,
    },

    bundling: {
      commandHooks: {
        beforeBundling(inputDir: string, outputDir: string): string[] {
          return [
            `cp ${inputDir}/${template_file} ${outputDir}`,
          ];
        },
        afterBundling(_inputDir: string, _outputDir: string): string[] {
          return [];
        },
        beforeInstall() {
          return [];
        },
      },
    },
  });

  const lambdaRole = createEventRuleFunc.role as iam.Role;
  addPolicyToCustomResourceLambdaRole(scope, lambdaRole);
  eventBridgeRole.grantPassRole(lambdaRole);

  createEventRuleFunc.node.addDependency(props.vpc);

  const provider = new Provider(
    scope,
    'EventRuleCustomResourceProvider', {
      onEventHandler: createEventRuleFunc,
    },
  );

  const createEventRuleCustomResource = new CustomResource(scope, 'CreateEventRuleCustomResource', {
    serviceToken: provider.serviceToken,
  });

  (createEventRuleCustomResource.node.defaultChild as CfnCustomResource).cfnOptions.condition = props.crossEventRegionCondition;
  (createEventRuleFunc.node.defaultChild as CfnCustomResource).cfnOptions.condition = props.crossEventRegionCondition;
  (lambdaRole.node.defaultChild as CfnCustomResource).cfnOptions.condition = props.crossEventRegionCondition;
  (eventBridgeRole.node.defaultChild as CfnCustomResource).cfnOptions.condition = props.crossEventRegionCondition;
};