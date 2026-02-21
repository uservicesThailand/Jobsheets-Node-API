const mapResponse = ({ mechanicalServiceImages }) => {
  const { AZURE_STORAGE_BASE_URL, AZURE_STORAGE_CONTAINER } = process.env;
  const baseUrl = AZURE_STORAGE_BASE_URL + AZURE_STORAGE_CONTAINER;
  return mechanicalServiceImages.map((item) => ({
    id: item.id,
    url: `${baseUrl}/${item.filePath}`,
  }));
};

module.exports = { mapResponse };
