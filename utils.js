/**
 * 生成序列号
 * @param {Number} batchId 批次
 * @param {Number} index 序号
 */
function genSerial(batchId, index) {
  const today = new Date();

  // WN-yyyyMM
  const prefix = `WN-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, 0)}`
  const batch = batchId.toString().padStart(8, 0)
  const seq = index.toString().padStart(16, 0)

  return `${prefix}-${batch}-${seq}`
}

/**
 * 6位数字的随机字符串，例如：003027
 */
function genCode() {
  return Math.floor(Math.random() * 1000000).toString().padStart(6, 0);
}

const dosCharPool = '1234567890qazwsxedcrfvtgbyhnujmikolpQAZWSXEDCRFVTGBYHNUJMIKOLP'
/**
 * 6位随机字符串，例如：78tzY2
 */
function genDos() {
  const dos = []
  for (let index = 0; index < 6; index++) {
    const randChar = dosCharPool.charAt(Math.floor(Math.random() * 62))
    dos.push(randChar)
  }
  return dos.join('')
}

function genSerialCode(batchId, count) {
  return [...Array(count).keys()].map((_, index) => [batchId, genSerial(batchId, index + 1), genCode(), genDos()])
}

exports.genSerialCode = genSerialCode

const port = 8200
exports.ServerPort = port

const ServerDomain = 'http://localhost'
exports.genVerifyUrl = function (serial, dos) {
  return `${ServerDomain}:${port}/openapi/verify?serial=${serial}&dos=${dos}`
}