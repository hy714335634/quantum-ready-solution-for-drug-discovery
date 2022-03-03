Deploying this solution with the default parameters builds the following environment in the AWS Cloud.


Figure 1 illustrates a solution built with AWS, this architecture helps users to get quantum ready for drug discovery.

<center>

![architecture](./images/architecture.png)

Figure 1: The quantum ready solution for drug discovery architecture

</center>

This solution deploys the Amazon CloudFormation template in your 
AWS Cloud account and provides three parts:

- Notebook Experiment
- Batch Evaluation
- Visualization

**Notebook Experiment**

1.  The solution deploys an instance for 
[AWS SageMaker Notebook](https://docs.aws.amazon.com/sagemaker/latest/dg/nbi.html). 
The user can do **Notebook Experiment** for drug discovery on classical computing and 
quantum computing(1).

2. The notebook comes with prepared sample code for different problems 
in drug discovery, like molecular unfolding, molecule simulation and so on. 
The user can learn how to study these problems based on classical 
or quantum computing resource through 
[Amazon Braket](https://aws.amazon.com/braket/). The step-by-step guide is 
provided in the [Workshop Page](workshop/background.md)(2).

3. User can access the internet through the notebook(3).

**Batch Evaluation**

1. The solution deploys [AWS Step Functions](https://aws.amazon.com/step-functions/) for users to do **Batch Evaluation**(4). 

2. The AWS Step Functions launches various computing tasks in parallel through 
    [AWS Batch](https://aws.amazon.com/batch/) jobs based on different model parameters, resources, classical computing or quantum computing(5).

3. Each AWS Batch job which uses the pre-built docker image in [Amazon ECR](https://aws.amazon.com/ecr/)(7) tries to evaluate a particular drug discovery problem based on a specific model parameter(6). 

4. For classical computing, AWS Batch jobs evaluate the problem locally, and save results in [Amazon S3](https://aws.amazon.com/s3/)(10).

5. For quantum computing, AWS Batch jobs asynchronously submit tasks to [Amazon Braket](https://aws.amazon.com/braket/) as Braket tasks/jobs(9).

6. AWS Step Functions waits for all jobs to complete.

7. When an Amazon Braket task/job completed, it saves output as a file in Amazon S3 bucket, and an event is triggered in [Amazon EventBridge](https://aws.amazon.com/eventbridge/)(11).

8. An [AWS Lambda](https://aws.amazon.com/lambda/) is listening events from Amazon EventBridge. When a Braket task/job completed, the lambda is triggered, it parses the output file of the Braket task/job in S3, saves its result to S3 as well and sends a callback to the AWS Step Functions.

9. When all jobs completed, AWS Step Functions gets all callbacks and continues to next(12).

10. An [Amazon SNS](https://aws.amazon.com/sns/) notification message is sent by AWS Step Functions when the whole batch evaluation completed(13).

**Visualization**

1. An [Amazon Athena](https://aws.amazon.com/athena/) table is created for visualization by a AWS Lambda step in the AWS Step Functions(14).

2. The user can view the **Batch Evaluation** results(e.g. performance) through [Amazon QuickSight](https://aws.amazon.com/quicksight/)(15).


Note: 

- All compute resources(AWS Batch Compute Environment and AWS Lambda) are put in private subnets in [Amazon VPC](https://aws.amazon.com/vpc/).

- [VPC Endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/vpc-endpoints.html) are enabled for Amazon ECR, Amazon S3, Amazon Athena and Amazon Braket(8).