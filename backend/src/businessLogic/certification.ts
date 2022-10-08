import * as uuid from "uuid";

import { CreateCertificationRequest } from "../requests/CreateCertificationRequest";
import { UpdateCertificationRequest } from "../requests/UpdateCertificationRequest";
import { CertificationItem } from "../models/CertificationItem";
import { CertificationUpdate } from "../models/CertificationUpdate";
import { CertificationAccess } from "../dataLayer/certificationAccess";
import { parseUserId } from "../auth/utils";
import { createLogger } from "../utils/logger";

const certificationAccess = new CertificationAccess();
const logger = createLogger("certificationAccess");

export async function createCertification(
  createCertificationRequest: CreateCertificationRequest,
  jwtToken: string
): Promise<CertificationItem> {
  logger.info("Start Create Certification");
  const certificationId = uuid.v4();
  const userId = parseUserId(jwtToken);

  return await certificationAccess.createCertification({
    userId: userId,
    certificationId: certificationId,
    createdAt: new Date().toISOString(),
    name: createCertificationRequest.name,
    dueDate: createCertificationRequest.dueDate,
    done: false,
  });
}

export async function getCertification(
  jwtToken: string
): Promise<CertificationItem[]> {
  logger.info("Start Get all certification");
  const userId = parseUserId(jwtToken);

  return certificationAccess.getCertification(userId);
}

export async function searchCertification(
  jwtToken: string,
  contentSearch: string
): Promise<CertificationItem[]> {
  logger.info("Start Get all certification");
  const userId = parseUserId(jwtToken);
  return certificationAccess.searchCertification(userId, contentSearch);
}

export async function updateCertification(
  certificationId: string,
  updateCertificationRequest: UpdateCertificationRequest,
  jwtToken: string
): Promise<CertificationUpdate> {
  logger.info("Start Update Certification");
  const userId = parseUserId(jwtToken);
  return await certificationAccess.updateCertification(
    userId,
    certificationId,
    {
      name: updateCertificationRequest.name,
      dueDate: updateCertificationRequest.dueDate,
      done: updateCertificationRequest.done,
    }
  );
}

export async function certificationExists(
  certificationId: string,
  jwtToken: string
): Promise<boolean> {
  logger.info("Start check Certification exist");
  const userId = parseUserId(jwtToken);
  return await certificationAccess.certificationExists(userId, certificationId);
}

export async function deleteCertification(
  certificationId: string,
  jwtToken: string
) {
  logger.info("Start delete certification");
  const userId = parseUserId(jwtToken);
  await certificationAccess.deleteCertification(userId, certificationId);
}

export async function generateAndAddUploadUrl(
  certificationId: string,
  jwtToken: string
): Promise<string> {
  logger.info("Start generateAndAddUploadUrl certification");
  const uploadUrl = certificationAccess.getUploadUrl(certificationId);
  const userId = parseUserId(jwtToken);
  await certificationAccess.updateUrl(userId, certificationId);

  return uploadUrl;
}
