# 3rd Party LineNotify SDK for Node.js

A light-weight line notify library without dependencies only buit-in library used

## Quick Start

```js
const LineNotifier = require("../index");
const linenotify = new LineNotifier(
  "client_id",
  "client_secret",
  "redirect_uri"
);
```

Get Login url

```js
const url = linenotify.authorize("RandomState");
```

Get accessToken

```js
linenotify.getAccessToken("code").then((res) => console.log(res));
```

Send notify function works by pass parameter name from [LINE Notify API Document](https://notify-bot.line.me/doc/en/) in **Notification** section as key of object

```js
linenotify.send("AccessToken", { message: "Hello World" });
linenotify.send("AccessToken", {
  message: "Hello World",
  imageFile: "./image.jpg",
});
```
