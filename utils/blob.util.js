const { BlobServiceClient } = require("@azure/storage-blob");
const path = require("path");
const crypto = require("crypto");

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const getContainerClient = async () => {
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  if (!containerName) {
    throw new Error("AZURE_STORAGE_CONTAINER is not defined");
  }
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
};

const generateBlobFileName = (originalName) => {
  const ext = path.extname(originalName);
  const unique = crypto.randomUUID();
  return `${unique}${ext}`;
};

const uploadFile = async ({ buffer, originalName, mimeType, folder = "" }) => {
  const fileName = generateBlobFileName(originalName);
  const blobPath = folder ? `${folder}/${fileName}` : fileName;

  const containerClient = await getContainerClient();
  const blockBlobClient = containerClient.getBlockBlobClient(blobPath);

  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
  });

  return {
    fileName,
    blobPath,
    url: blockBlobClient.url,
  };
};

module.exports = {
  getContainerClient,
  uploadFile,
};
