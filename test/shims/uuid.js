// uuid@13 為純 ESM 套件，Jest (CommonJS) 無法直接載入，e2e 測試以 crypto.randomUUID 替代
const { randomUUID } = require('crypto');
module.exports = { v4: () => randomUUID() };
