function parseIndexedFormData(req) {
  const resultMap = {};

  for (const key in req.body) {
    const match = key.match(/^index\[(\d+)\]:(\w+)$/);
    if (match) {
      const index = match[1];
      const field = match[2];
      resultMap[index] = resultMap[index] || {};
      resultMap[index][field] = req.body[key];
    }
  }

  for (const file of req.files || []) {
    const match = file.fieldname.match(/^index\[(\d+)\]:(\w+)$/);
    if (match) {
      const index = match[1];
      const field = match[2];
      resultMap[index] = resultMap[index] || {};
      resultMap[index][field] = file;
    }
  }

  return Object.keys(resultMap)
    .sort((a, b) => Number(a) - Number(b))
    .map((index) => resultMap[index]);
}

module.exports = parseIndexedFormData;
