const https = require("https");
const fs = require("fs");
const path = require("path");
const verifyImage = require("./utils/imagefileverify");
const querystring = require("querystring");

class LineNotifier {
  constructor(client_id, client_secret, redirect_uri) {
    this._client_id = client_id;
    this._client_secret = client_secret;
    this._redierct_uri = redirect_uri;
  }

  checkAuthParameters() {
    if (this._client_id !== "string" || this._client_id.trim() === "") {
      throw new Error("client_id is required");
    }
    if (this._client_secret !== "string" || this._client_secret.trim() === "") {
      throw new Error("client_secret is required");
    }
    if (this._redierct_uri !== "string" || this._redierct_uri.trim() === "") {
      throw new Error("redirect_uri is required");
    }
  }

  checkAccessToken(accessToken) {
    if (typeof accessToken !== "string" || accessToken.trim() === "") {
      throw new Error("Access token is required");
    }
  }

  async send(accessToken, params) {
    this.checkAccessToken(accessToken);

    const { message } = params;
    if (typeof message !== "string" || message.trim() === "") {
      throw new Error("message is required");
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

  async status(accessToken) {
    this.checkAccessToken(accessToken);
    const options = {
      hostname: "notify-api.line.me",
      path: "/api/status",
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
  async revoke(accessToken) {
    this.checkAccessToken(accessToken);
    const options = {
      hostname: "notify-api.line.me",
      path: "/api/revoke",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
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

  authorize(state, form_post = false) {
    this.checkAuthParameters();

    const url = `https://notify-bot.line.me/oauth/authorize?response_type=code&scope=notify&client_id=${
      this._client_id
    }&redirect_uri=${this._redierct_uri}&state=${state}${
      form_post ? `&response_mode=form_post` : ``
    }`;
    return url;
  }

  getAccessToken(code) {
    this.checkAuthParameters();
    const payload = querystring.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: this._redierct_uri,
      client_id: this._client_id,
      client_secret: this._client_secret,
    });

    const options = {
      hostname: "notify-bot.line.me",
      path: "/oauth/token",
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Content-Length": payload.length,
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
      req.write(payload);
      req.end();
    });
  }
}

module.exports = LineNotifier;
