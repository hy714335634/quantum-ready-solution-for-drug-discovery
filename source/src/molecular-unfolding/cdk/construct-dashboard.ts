
import {
  aws_s3 as s3,
  aws_quicksight as quicksight,
  CfnOutput,
} from 'aws-cdk-lib';

import {
  Construct,
} from 'constructs';


interface DashBoardProps {
  region: string;
  account: string;
  bucket: s3.Bucket;
  prefix: string;
  stackName: string;
  quicksightUser: string;
}

export class Dashboard extends Construct {
  private props: DashBoardProps
  outputDashboardUrl: CfnOutput

  constructor(scope: Construct, id: string, props: DashBoardProps) {
    super(scope, id);
    this.props = props;

    const quicksightUser = `arn:aws:quicksight:us-east-1:${this.props.account}:user/default/${this.props.quicksightUser}`;

    const templateArn = 'arn:aws:quicksight:us-east-1:366590864501:template/qc-batch-evaluation-analysis-template/version/1';

    const qcDataSource = new quicksight.CfnDataSource(this, 'qcBatchEvaluation-DataSource', {
      awsAccountId: this.props.account,
      dataSourceId: `${this.props.stackName}-qcBatchEvaluation-Datasource`,
      name: `${this.props.stackName}-qcBatchEvaluation-Datasource`,
      type: 'ATHENA',
      dataSourceParameters: {
        athenaParameters: {
          workGroup: 'primary',
        },
      },
      permissions: [{
        principal: quicksightUser,
        actions: [
          'quicksight:UpdateDataSourcePermissions',
          'quicksight:DescribeDataSource',
          'quicksight:DescribeDataSourcePermissions',
          'quicksight:PassDataSource',
          'quicksight:UpdateDataSource',
          'quicksight:DeleteDataSource',
        ],
      }],
    });

    const columns = [{
      name: 'execution_id',
      type: 'STRING',
    },
    {
      name: 'compute_type',
      type: 'STRING',
    },
    {
      name: 'resource',
      type: 'STRING',
    },
    {
      name: 'params',
      type: 'STRING',
    },
    {
      name: 'opt_params',
      type: 'STRING',
    },
    {
      name: 'task_duration',
      type: 'DECIMAL',
    },
    {
      name: 'time_info',
      type: 'STRING',
    },
    {
      name: 'start_time',
      type: 'STRING',
    },
    {
      name: 'experiment_name',
      type: 'STRING',
    },
    {
      name: 'task_id',
      type: 'STRING',
    },
    {
      name: 'model_name',
      type: 'STRING',
    },
    {
      name: 'model_filename',
      type: 'STRING',
    },
    {
      name: 'scenario',
      type: 'STRING',
    },
    {
      name: 'create_time',
      type: 'STRING',
    },
    {
      name: 'result_detail',
      type: 'STRING',
    },
    {
      name: 'result_location',
      type: 'STRING',
    }];

    const qcDataset = new quicksight.CfnDataSet(this, 'qcBatchEvaluation-DataSet', {
      permissions: [{
        principal: quicksightUser,
        actions: [
          'quicksight:UpdateDataSetPermissions',
          'quicksight:DescribeDataSet',
          'quicksight:DescribeDataSetPermissions',
          'quicksight:PassDataSet',
          'quicksight:DescribeIngestion',
          'quicksight:ListIngestions',
          'quicksight:UpdateDataSet',
          'quicksight:DeleteDataSet',
          'quicksight:CreateIngestion',
          'quicksight:CancelIngestion',
        ],
      }],
      awsAccountId: this.props.account,
      dataSetId: `${this.props.stackName}-qcBatchEvaluation-DataSet`,
      name: `${this.props.stackName}-qcBatchEvaluation-DataSet`,
      importMode: 'DIRECT_QUERY',
      physicalTableMap: {
        ATHENATable: {
          customSql: {
            dataSourceArn: qcDataSource.attrArn,
            name: 'all',
            sqlQuery: `SELECT * FROM "AwsDataCatalog"."qc_db"."${this.props.stackName}_qc_batch_evaluation_metrics"`,
            columns,
          },
        },
      },
    });


    const qcAnaTemplate = new quicksight.CfnTemplate(this, 'qcBatchEvaluation-QSTemplate', {
      awsAccountId: this.props.account,
      templateId: `${this.props.stackName}-qcBatchEvaluation-QSTemplate`,
      name: `${this.props.stackName}-qcBatchEvaluation-QSTemplate`,
      permissions: [{
        principal: quicksightUser,
        actions: ['quicksight:DescribeTemplate'],
      }],
      sourceEntity: {
        sourceTemplate: {
          arn: templateArn,
        },
      },
    });

    const qcBatchEvaluationDashboard = new quicksight.CfnDashboard(this, 'qcBatchEvaluation-Dashboard', {
      dashboardId: `${this.props.stackName}-qcBatchEvaluation-Dashboard`,
      name: `${this.props.stackName}-qcBatchEvaluation-Dashboard`,
      awsAccountId: this.props.account,
      permissions: [{
        principal: quicksightUser,
        actions: [
          'quicksight:DescribeDashboard',
          'quicksight:ListDashboardVersions',
          'quicksight:UpdateDashboardPermissions',
          'quicksight:QueryDashboard',
          'quicksight:UpdateDashboard',
          'quicksight:DeleteDashboard',
          'quicksight:DescribeDashboardPermissions',
          'quicksight:UpdateDashboardPublishedVersion',
        ],
      }],

      sourceEntity: {
        sourceTemplate: {
          arn: qcAnaTemplate.attrArn,
          dataSetReferences: [{
            dataSetPlaceholder: 'qcds',
            dataSetArn: qcDataset.attrArn,
          }],
        },
      },
      dashboardPublishOptions: {
        adHocFilteringOption: {
          availabilityStatus: 'DISABLED',
        },
      },

    });

    const qcBatchEvaluationAnalysis = new quicksight.CfnAnalysis(this, 'qcBatchEvaluation-Analysis', {
      analysisId: `${this.props.stackName}-qcBatchEvaluation-Analysis`,
      name: `${this.props.stackName}-qcBatchEvaluation-Analysis`,
      awsAccountId: this.props.account,
      permissions: [{
        principal: quicksightUser,
        actions: [
          'quicksight:DescribeAnalysis',
          'quicksight:UpdateAnalysisPermissions',
          'quicksight:QueryAnalysis',
          'quicksight:UpdateAnalysis',
          'quicksight:RestoreAnalysis',
          'quicksight:DeleteAnalysis',
          'quicksight:DescribeAnalysisPermissions',
        ],
      }],

      sourceEntity: {
        sourceTemplate: {
          arn: qcAnaTemplate.attrArn,
          dataSetReferences: [{
            dataSetPlaceholder: 'qcds',
            dataSetArn: qcDataset.attrArn,
          }],
        },
      },

    });

    // Output //////////////////////////
    this.outputDashboardUrl = new CfnOutput(this, 'qcBatchEvaluationDashboardUrl', {
      value: `https://${this.props.region}.quicksight.aws.amazon.com/sn/dashboards/${qcBatchEvaluationDashboard.dashboardId}`,
      description: 'Quicksight Dashboard Url',
    });

    new CfnOutput(this, 'qcBatchEvaluationAnalysis', {
      value: qcBatchEvaluationAnalysis.analysisId,
      description: 'Quicksight Analysis Id',
    });
  }
}