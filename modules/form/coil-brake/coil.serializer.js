const mapPayload = (body) => {
  return {
    frame: body.frame ?? null,
    type: body.type ?? null,
    manufacture: body.manufacture ?? null,
    model: body.model ?? null,

    powerValue: body.power?.value ?? null,
    powerUnit: body.power?.unit ?? null,

    speedValue: body.speed?.value ?? null,
    speedUnit: body.speed?.unit ?? null,

    serialNo: body.serialNo ?? null,
    insulationClass: body.insulationClass ?? null,

    design: body.design ?? null,
    frequency: body.frequency ?? null,
    current: body.current ?? null,
    volt: body.volt ?? null,

    year: body.year ?? null,
    pe: body.pe ?? null,
    eff: body.eff ?? null,
    ip: body.ip ?? null,

    weight: body.weight ?? null,
    cos: body.cos ?? null,
  };
};
