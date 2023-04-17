const fs = require("fs");

function verifyImage(filepath) {
  const readableStream = fs.createReadStream(filepath);
  return new Promise((resolve, reject) => {
    const buffer = Buffer.alloc(8);

    readableStream.on("data", (chunk) => {
      chunk.copy(buffer, 0);
    });

    readableStream.on("end", () => {
      let imageType = null;
      if (buffer[0] === 0xff && buffer[1] === 0xd8) {
        imageType = "image/jpeg";
      } else if (
        buffer[0] === 0x89 &&
        buffer[1] === 0x50 &&
        buffer[2] === 0x4e &&
        buffer[3] === 0x47
      ) {
        imageType = "image/png";
      }

      if (imageType) {
        resolve(imageType);
      } else {
        reject(new Error("File type not support"));
      }
    });
  });
}

module.exports = verifyImage