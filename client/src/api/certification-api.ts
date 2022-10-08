import { apiEndpoint } from "../config";
import { Certifications } from "../types/Certification";
import { CreateCertificationRequest } from "../types/CreateCertificationRequest";
import Axios from "axios";
import { UpdateCertificationRequest } from "../types/UpdateCertificationRequest";

export async function getCertification(
  idToken: string
): Promise<Certifications[]> {
  console.log("Fetching Certification");

  const response = await Axios.get(`${apiEndpoint}/certification`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
  console.log("Certification:", response.data);
  return response.data.items;
}

export async function searchCertification(
  idToken: string,
  searchContent: string
): Promise<Certifications[]> {
  console.log("Fetching Certification");

  const response = await Axios.get(
    `${apiEndpoint}/certification?search=${searchContent}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  console.log("Certification:", response.data);
  return response.data.items;
}

export async function createCertification(
  idToken: string,
  newCertification: CreateCertificationRequest
): Promise<Certifications> {
  const response = await Axios.post(
    `${apiEndpoint}/certification`,
    JSON.stringify(newCertification),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.item;
}

export async function patchCertification(
  idToken: string,
  certificationId: string,
  updatedCertification: UpdateCertificationRequest
): Promise<void> {
  await Axios.patch(
    `${apiEndpoint}/certification/${certificationId}`,
    JSON.stringify(updatedCertification),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
}

export async function deleteCertification(
  idToken: string,
  certificationId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/certification/${certificationId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${idToken}`,
    },
  });
}

export async function getUploadUrl(
  idToken: string,
  certificationId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/certification/${certificationId}/attachment`,
    "",
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.uploadUrl;
}

export async function uploadFile(
  uploadUrl: string,
  file: Buffer
): Promise<void> {
  await Axios.put(uploadUrl, file);
}
