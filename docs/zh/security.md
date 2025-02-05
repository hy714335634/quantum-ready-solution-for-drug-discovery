当您在亚马逊云科技基础设施上构建解决方案时，安全责任由您和亚马逊云科技共同承担。此[共享模型](https://aws.amazon.com/compliance/shared-responsibility-model/)减少了您的操作负担，这是由于亚马逊云科技操作、管理和控制组件，包括主机操作系统、虚拟化层以及服务运行所在设施的物理安全性。有关亚马逊云科技安全的更多信息，请访问亚马逊云科技[云安全](http://aws.amazon.com/security/)。

## 安全最佳实践

亚马逊云科技药物研发量子计算解决方案在设计时考虑了安全最佳实践。
但是，解决方案的安全性会根据您的具体用例而有所不同，
有时添加额外的安全措施会增加解决方案的成本。
以下是增强该解决方案在生产环境中的安全性的建议。

### IAM角色

亚马逊云科技身份和访问管理（IAM）角色允许客户为亚马逊云科技上的服务和用户分配细粒度访问策略和权限。此解决方案创建IAM角色，这些角色授予解决方案各组件间的访问权限。

### 安全组

此解决方案中创建的安全组旨在控制和隔离各组件间的网络流量。我们建议您检查安全组，并在部署启动并运行后根据需要进一步限制访问。

### 数据保护

出于数据保护目的，我们建议您保护 AWS 账户凭证并使用 AWS Identity and Access Management (IAM) 设置单独的用户账户。这仅向每个用户授予履行其工作职责所需的权限。我们还建议您通过以下方式保护您的数据：

* 对每个账户使用 Multi-Factor Authentication (MFA)

* 使用 SSL/TLS 与 AWS 资源进行通信。建议使用 TLS 1.2 或更高版本

* 使用 AWS CloudTrail 设置 API 和用户活动日志记录

* 使用 AWS 加密解决方案以及 AWS 服务中的所有默认安全控制。

* 使用高级托管安全服务（例如 Amazon Macie），它有助于发现和保护存储在 Amazon S3 中的个人数据。

如果在通过命令行界面或 API 访问 AWS 时需要经过 FIPS 140-2 验证的加密模块，请使用 FIPS 终端节点。有关可用的 FIPS 端点的更多信息，请参阅美国联邦信息处理标准 (FIPS) 第 140-2 版。

### [数据保留](https://docs.aws.amazon.com/braket/latest/developerguide/security.html)

90 天后，Amazon Braket 会自动删除与您的任务关联的所有任务 ID 和其他元数据。由于此数据保留策略，这些任务和结果不能再通过从 Amazon Braket 控制台进行搜索来检索，尽管它们仍存储在 S3 存储桶中。

如果您需要访问存储在 S3 存储桶中超过 90 天的历史任务和结果，则必须单独记录任务 ID 和与该数据关联的其他元数据。请务必在 90 天之前保存信息。您可以使用保存的信息来检索历史数据。