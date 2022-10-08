import * as AWS from "aws-sdk";
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { CertificationItem } from "../models/CertificationItem";
import { createLogger } from "../utils/logger";
import { CertificationUpdate } from "../models/CertificationUpdate";
const AWSXRay = require("aws-xray-sdk");

const logger = createLogger("CertificationAccess");
const XAWS = AWSXRay.captureAWS(AWS);

export class CertificationAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),
    private readonly s3 = new XAWS.S3({
      signatureVersion: "v4",
    }),
    private readonly certificationTable = process.env.CERTIFICATION_TABLE,
    private readonly dueDateIndex = process.env.CERTIFICATION_CREATED_AT_INDEX,
    private readonly bucketName = process.env.ATTACHMENT_S3_BUCKET,
    private readonly urlExpiration = process.env.SIGNED_URL_EXPIRATION
  ) {}

  async createCertification(
    certification: CertificationItem
  ): Promise<CertificationItem> {
    logger.info("Start create certification");
    await this.docClient
      .put({
        TableName: this.certificationTable,
        Item: certification,
      })
      .promise();

    return certification;
  }

  async getCertification(userId: string): Promise<CertificationItem[]> {
    logger.info("Start get all certification");
    // let result
    // if (searchContent == null) {
    //   result = await this.docClient.query({
    //     TableName: this.certificationTable,
    //     IndexName: this.dueDateIndex,
    //     KeyConditionExpression: 'userId = :userId',
    //     ExpressionAttributeValues: {
    //       ':userId': userId
    //     },
    //     ScanIndexForward: true
    //   }).promise()
    // } else {
    //   result = await this.docClient.query({
    //     TableName: this.certificationTable,
    //     IndexName: this.dueDateIndex,
    //     KeyConditionExpression: 'userId = :userId',
    //     FilterExpression: "contains(#name, :name)",
    //     ExpressionAttributeNames: {
    //       "#name": "name",
    //   },
    //     ExpressionAttributeValues: {
    //       ':userId': userId,
    //       ":name": searchContent,
    //     },
    //     ScanIndexForward: true
    //   }).promise()
    // }

    const result = await this.docClient
      .query({
        TableName: this.certificationTable,
        IndexName: this.dueDateIndex,
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: true,
      })
      .promise();

    const items = result.Items;
    return items as CertificationItem[];
  }

  async searchCertification(
    userId: string,
    contentSearch: string
  ): Promise<CertificationItem[]> {
    logger.info("Start search all certification");

    const result = await this.docClient
      .query({
        TableName: this.certificationTable,
        IndexName: this.dueDateIndex,
        FilterExpression: "contains(#name, :name)",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeNames: {
          "#name": "name",
        },
        ExpressionAttributeValues: {
          ":userId": userId,
          ":name": contentSearch,
        },
        ScanIndexForward: true,
      })
      .promise();

    const items = result.Items;
    return items as CertificationItem[];
  }

  async updateCertification(
    userId: string,
    certificationId: string,
    certificationUpdate: CertificationUpdate
  ): Promise<CertificationUpdate> {
    logger.info("Start update certification");
    const params = {
      TableName: this.certificationTable,
      Key: {
        certificationId: certificationId,
        userId: userId,
      },
      UpdateExpression:
        "set #certification_name = :name, dueDate = :dueDate, done = :done",
      ExpressionAttributeNames: {
        "#certification_name": "name",
      },
      ExpressionAttributeValues: {
        ":name": certificationUpdate.name,
        ":dueDate": certificationUpdate.dueDate,
        ":done": certificationUpdate.done,
      },
      ReturnValues: "UPDATED_NEW",
    };
    await this.docClient.update(params).promise();

    return certificationUpdate;
  }

  async certificationExists(
    userId: string,
    certificationId: string
  ): Promise<boolean> {
    logger.info("Start check certification exist");
    const params = {
      TableName: this.certificationTable,
      Key: {
        certificationId: certificationId,
        userId: userId,
      },
    };
    const result = await this.docClient.get(params).promise();

    return !!result.Item;
  }

  async deleteCertification(userId: string, certificationId: string) {
    logger.info("Start delete certification", userId, certificationId);
    const params = {
      TableName: this.certificationTable,
      Key: {
        certificationId: certificationId,
        userId: userId,
      },
    };
    await this.docClient.delete(params).promise();
  }

  getUploadUrl(certificationId: string) {
    logger.info("Start getUploadUrl");
    return this.s3.getSignedUrl("putObject", {
      Bucket: this.bucketName,
      Key: certificationId,
      Expires: parseInt(this.urlExpiration),
    });
  }

  async updateUrl(userId: string, certificationId: string) {
    logger.info("Start updateUrl");
    const url = `https://${this.bucketName}.s3.amazonaws.com/${certificationId}`;

    const params = {
      TableName: this.certificationTable,
      Key: {
        certificationId: certificationId,
        userId: userId,
      },
      UpdateExpression: "set attachmentUrl = :attachmentUrl",
      ExpressionAttributeValues: {
        ":attachmentUrl": url,
      },
      ReturnValues: "UPDATED_NEW",
    };
    await this.docClient.update(params).promise();
  }
}

function createDynamoDBClient() {
  logger.info("Start createDynamoDBClient");
  if (process.env.IS_OFFLINE) {
    logger.info("Creating a local DynamoDB instance");
    return new XAWS.DynamoDB.DocumentClient({
      region: "localhost",
      endpoint: "http://localhost:8000",
    });
  }

  return new XAWS.DynamoDB.DocumentClient();
}
