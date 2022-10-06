import * as AWS from "aws-sdk";
const AWSXRay = require("aws-xray-sdk");
import { DocumentClient } from "aws-sdk/clients/dynamodb";
import { createLogger } from "../utils/logger";
import { CertificationItem } from "../models/CertificationItem";
import { CertificationUpdate } from "../models/CertificationUpdate";

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger("CertificationsAccess");

// certification: Implement the helpers logic
export class CertificationsAccess {
  constructor(
    private readonly documentClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly CertificationsTable = process.env.CertificationS_TABLE,
    private readonly CertificationsTableIndexName = process.env
      .CertificationS_CREATED_AT_INDEX
  ) {}

  async getCertifications(userId: string): Promise<CertificationItem[]> {
    try {
      logger.info(`Get certifications request processing`);

      const result = await this.documentClient
        .query({
          TableName: this.CertificationsTable,
          IndexName: this.CertificationsTableIndexName,
          KeyConditionExpression: "#userId = :i",
          ExpressionAttributeNames: {
            "#userId": "userId",
          },
          ExpressionAttributeValues: {
            ":i": userId,
          },
        })
        .promise();

      return result.Items as CertificationItem[];
    } catch (e) {
      console.log(e);
    }
  }

  async getCertification(
    certificationId: string,
    userId: string
  ): Promise<CertificationItem> {
    try {
      logger.info(`Get certification request`);

      const result = await this.documentClient
        .get({
          TableName: this.CertificationsTable,
          Key: {
            certificationId: certificationId,
            userId: userId,
          },
        })
        .promise();

      return result.Item as CertificationItem;
    } catch (e) {
      console.log(e);
    }
  }

  async createCertification(
    CertificationItem: CertificationItem
  ): Promise<CertificationItem> {
    try {
      logger.info(
        `Create certification request processing for ${CertificationItem} in ${this.CertificationsTable}`
      );

      await this.documentClient
        .put({
          TableName: this.CertificationsTable,
          Item: CertificationItem,
        })
        .promise();
      return Promise.resolve(CertificationItem);
    } catch (e) {
      console.log(e);
    }
  }

  async updateCertification(
    certificationId: string,
    CertificationUpdate: CertificationUpdate,
    userId: string
  ) {
    try {
      logger.info(
        `Update certification request processing for ${certificationId} in ${this.CertificationsTable}`
      );

      await this.documentClient
        .update({
          TableName: this.CertificationsTable,
          Key: {
            certificationId,
            userId,
          },
          UpdateExpression:
            "set #name = :name, dueDate = :dueDate, done = :done",
          ExpressionAttributeNames: {
            "#name": "name",
          },
          ExpressionAttributeValues: {
            ":name": CertificationUpdate.name,
            ":dueDate": CertificationUpdate.dueDate,
            ":done": CertificationUpdate.done,
          },
        })
        .promise();
    } catch (e) {
      console.log(e);
    }
  }

  async deleteCertification(
    certificationId: string,
    userId: string
  ): Promise<void> {
    try {
      logger.info(`Delete certification request processing`);

      await this.documentClient
        .delete({
          TableName: this.CertificationsTable,
          Key: {
            certificationId: certificationId,
            userId: userId,
          },
        })
        .promise();

      return Promise.resolve();
    } catch (e) {
      console.log(e);
    }
  }

  async updateUrl(
    certificationId: string,
    attachmentUrl: string,
    userId: string
  ) {
    try {
      logger.info(`Updating the attachment URL`);

      await this.documentClient
        .update({
          TableName: this.CertificationsTable,
          Key: {
            certificationId: certificationId,
            userId: userId,
          },
          UpdateExpression: "set attachmentUrl = :attachmentUrl",
          ExpressionAttributeValues: {
            ":attachmentUrl": attachmentUrl,
          },
        })
        .promise();
    } catch (e) {
      console.log(e);
    }
  }
}
