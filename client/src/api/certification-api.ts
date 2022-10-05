import { apiEndpoint } from "../config";
import { Certifications } from "../types/Certifications";
import { createCertificationRequest } from "../types/CreateCertificationRequest";
import Axios from "axios";
import { UpdateCertificationRequest } from "../types/UpdateCertificationRequest";

export async function getCertification(
  idToken: string
): Promise<Certifications[]> {
  console.log("Fetching Certification");

  const response = await Axios.get(`${apiEndpoint}/todos`, {
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
    `${apiEndpoint}/todos?search=${searchContent}`,
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

export const createCertification = async (
  idToken: string,
  newCertification: createCertificationRequest
): Promise<Certifications> => {
  const response = await Axios.post(
    `${apiEndpoint}/todos`,
    JSON.stringify(newCertification),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
  return response.data.item;
};

export const patchCertification = async (
  idToken: string,
  certificationId: string,
  updatedCertification: UpdateCertificationRequest
): Promise<void> => {
  await Axios.patch(
    `${apiEndpoint}/todos/${certificationId}`,
    JSON.stringify(updatedCertification),
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    }
  );
};

export const deleteCertification = async (
  idToken: string,
  certificationId: string
): Promise<void> => {
  try {
    await Axios.delete(`${apiEndpoint}/todos/${certificationId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
    });
  } catch (e) {
    throw Error("Delete Certification failed");
  }
};

export const getUploadUrl = async (
  idToken: string,
  certificationId: string
): Promise<string> => {
  try {
    const response = await Axios.post(
      `${apiEndpoint}/todos/${certificationId}/attachment`,
      "",
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );
    return response.data.uploadUrl;
  } catch (e) {
    throw Error("Error getting upload url");
  }
};

export const uploadFile = async (
  uploadUrl: string,
  file: Buffer
): Promise<void> => {
  try {
    await Axios.put(uploadUrl, file);
  } catch (e) {
    throw Error("Error uploading files");
  }
};
