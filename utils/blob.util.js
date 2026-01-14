const { BlobServiceClient } = require("@azure/storage-blob");

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);

const getContainerClient = () => {
  const containerName = process.env.AZURE_STORAGE_CONTAINER;
  return blobServiceClient.getContainerClient(containerName);
};

module.exports = {
  getContainerClient,
};
