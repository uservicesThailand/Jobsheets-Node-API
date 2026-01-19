const mapResponse = ({ formElectricalService, createdBy, updatedBy }) => {
  return {
    data: formElectricalService.data,
    updatedBy: `${updatedBy.name} ${updatedBy.lastname}`,
    createdBy: `${createdBy.name} ${createdBy.lastname}`,
    updatedAt: formElectricalService.updatedAt,
    createdAt: formElectricalService.createdAt,
  };
};

module.exports = { mapResponse };
