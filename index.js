const https = require("https");
const fs = require("fs");
const path = require("path");
const verifyImage = require("./utils/imagefileverify");

class LineNotifier {
  constructor(accessToken) {
    this._accessToken = accessToken;
  }
  get accessToken() {
    return this._accessToken;
  }

  async send(params) {
    const { message } = params;
    if (typeof message !== "string" || message.trim() === "") {
      throw new Error("message is required");
    }

    if (!this.accessToken) {
      throw new Error("Access token is required");
    }

    for (const [key, value] of Object.entries(params)) {
      if (
        typeof value === "string" &&
        !/^https?:\/\//.test(value) &&
        /(\.png|\.jpg|\.jpeg)$/.test(value)
      ) {
        const imageType = await verifyImage(value);
        if (imageType) {
          params[key] = {
            filename: path.basename(value),
            contentType: imageType,
            data: fs.createReadStream(value),
          };
        }
      }
    }

    const boundary = "----FormBoundary" + Date.now();
    const crlf = "\r\n";

    const body = [];
    for (const [key, value] of Object.entries(params)) {
      if (
        typeof value === "object" &&
        value.filename &&
        value.contentType &&
        value.data
      ) {
        body.push(`--${boundary}`);
        body.push(
          `Content-Disposition: form-data; name="${key}"; filename="${value.filename}"`
        );
        body.push(`Content-Type: ${value.contentType}`);
        body.push("");
        body.push(value.data);
      } else {
        body.push(`--${boundary}`);
        body.push(`Content-Disposition: form-data; name=${key}`);
        body.push("");
        body.push(value);
      }
    }
    body.push(`--${boundary}--`);

    const options = {
      hostname: "notify-api.line.me",
      path: "/api/notify",
      method: "POST",
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
        "Content-Type": `multipart/form-data; boundary=${boundary}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = "";
        res.setEncoding("utf-8");

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const response = {};
            response["body"] = JSON.parse(responseBody);
            response["headers"] = res.headers;
            resolve(response);
          } else {
            reject(new Error(`status code ${res.statusCode}: ${responseBody}`));
          }
        });

        req.on("error", (error) => {
          reject(error);
        });
      });

      let bodyIndex = 0; // Add a variable to keep track of the current index in the body array

      const writeNextChunk = () => {
        if (bodyIndex < body.length) {
          const chunk = body[bodyIndex];
          if (
            typeof chunk === "string" ||
            typeof chunk === "number" ||
            typeof chunk === "boolean"
          ) {
            req.write(chunk + crlf);
            bodyIndex++; // Move to the next chunk
            writeNextChunk(); // Call writeNextChunk recursively for the next chunk
          } else {
            chunk.pipe(req, { end: false });
            chunk.on("end", () => {
              req.write(crlf);
              bodyIndex++; // Move to the next chunk
              writeNextChunk(); // Call writeNextChunk recursively for the next chunk
            });
          }
        } else {
          req.end(); // Call req.end() only when all chunks are written
        }
      };

      writeNextChunk();
    });
  }

  async status() {
    if (!this.accessToken) {
      throw new Error("Access token is required");
    }
    const options = {
      hostname: "notify-api.line.me",
      path: "/api/status",
      method: "GET",
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = "";
        res.setEncoding("utf-8");

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const response = {};
            response["body"] = JSON.parse(responseBody);
            response["headers"] = res.headers;
            resolve(response);
          } else {
            reject(new Error(`status code ${res.statusCode}: ${responseBody}`));
          }
        });

        req.on("error", (error) => {
          reject(error);
        });
      });
      req.end();
    });
  }
  async revoke() {
    if (!this.accessToken) {
      throw new Error("Access token is required");
    }
    const options = {
      hostname: "notify-api.line.me",
      path: "/api/revoke",
      method: "POST",
      headers: {
        Authorization: `Bearer ${this._accessToken}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    };

    return new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        let responseBody = "";
        res.setEncoding("utf-8");

        res.on("data", (chunk) => {
          responseBody += chunk;
        });

        res.on("end", () => {
          if (res.statusCode === 200) {
            const response = {};
            response["body"] = JSON.parse(responseBody);
            response["headers"] = res.headers;
            resolve(response);
          } else {
            reject(new Error(`status code ${res.statusCode}: ${responseBody}`));
          }
        });

        req.on("error", (error) => {
          reject(error);
        });
      });
      req.end();
    });
  }
}

module.exports = LineNotifier;
