# 3rd Party LineNotify SDK for Node.js

A light-weight line notify library without dependencies only buit-in library used

### This library not include Authentication flow yet

## Quick Start

```js
const LineNotifier = require("../index");
const linenotify = new LineNotifier("Access Token");
```

send notify function works by pass parameter name from [LINE Notify API Document](https://notify-bot.line.me/doc/en/) in **Notification** section as key of object

```js
linenotify.send({ message: "Hello World" });
linenotify.send({ message: "Hello World", imageFile: "./image.jpg" });
```
