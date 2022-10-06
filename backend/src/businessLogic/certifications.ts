import { CertificationsAccess } from "../dataAccessLayer/CertificationsAcess";
import { AttachmentUtils } from "../fileStorageLayer/attachmentUtils";
import { CertificationItem } from "../models/CertificationItem";
import { CreateCertificationRequest } from "../requests/CreateCertificationRequest";
import { UpdateCertificationRequest } from "../requests/UpdateCertificationRequest";
import { createLogger } from "../utils/logger";
import * as uuid from "uuid";
// certification: Implement certifications businesslogic

const certificationsAccess = new CertificationsAccess();
const attachmentUtils = new AttachmentUtils();
const logger = createLogger("certifications");

export const getCertifications = async (
  userId: string
): Promise<CertificationItem[]> => {
  return await certificationsAccess.getCertifications(userId);
};

export async function createCertification(
  createCertificationRequest: CreateCertificationRequest,
  userId: string
): Promise<CertificationItem> {
  try {
    logger.info(`Creating a To Do item `);
    const certificationId = uuid.v4();

    return await certificationsAccess.createCertification({
      certificationId: certificationId,
      userId: userId,
      done: false,
      attachmentUrl: "",
      createdAt: new Date().toISOString(),
      name: createCertificationRequest.name,
      dueDate: createCertificationRequest.dueDate,
    });
  } catch (e) {
    console.log(e);
  }
}

export const getCertification = async (
  certificationId: string,
  userId: string
): Promise<CertificationItem> => {
  try {
    logger.info(`Getting certification item`);

    return await certificationsAccess.getCertification(certificationId, userId);
  } catch (e) {
    console.log(e);
  }
};

export async function updateCertification(
  userId: string,
  certificationId: string,
  updateCertificationRequest: UpdateCertificationRequest
) {
  try {
    logger.info(`Update certification item`);
    const item = await certificationsAccess.getCertification(
      certificationId,
      userId
    );

    if (item.userId !== userId) {
      logger.error(`Can not update this item`);
      throw new Error("Can not update this item");
    }

    return await certificationsAccess.updateCertification(
      certificationId,
      updateCertificationRequest,
      userId
    );
  } catch (e) {
    console.log(e);
  }
}

export async function updateUrl(
  userId: string,
  certificationId: string,
  attachmentURL: string
) {
  try {
    logger.info(`Updating URL`);

    const item = await certificationsAccess.getCertification(
      certificationId,
      userId
    );

    if (item.userId !== userId) {
      logger.error(`Failed to update url`);
      throw new Error("Failed to update url");
    }

    return await certificationsAccess.updateUrl(
      certificationId,
      attachmentURL,
      userId
    );
  } catch (e) {
    console.log(e);
  }
}

export async function deleteCertification(
  userId: string,
  certificationId: string
) {
  try {
    const item = await certificationsAccess.getCertification(
      certificationId,
      userId
    );

    if (item.userId !== userId) {
      logger.error(`Failed to delete item`);
      throw new Error("Failed to delete item");
    }
    logger.info(`Deleting item`);

    return await certificationsAccess.deleteCertification(
      certificationId,
      userId
    );
  } catch (e) {
    console.log(e);
  }
}

export const getUploadUrl = (attachmentId: string) =>
  attachmentUtils.getUploadUrl(attachmentId);

export const getAttachmentUrl = (attachmentId: string) =>
  attachmentUtils.getAttachmentUrl(attachmentId);
