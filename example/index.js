const LineNotifier = require("../index");
const sender = new LineNotifier("client_id", "client_secret", "redirect_uri");

const url = sender.authorize("test-state");

sender.send("AccessToken", { message: "Only message" });
sender.send("AccessToken", {
  message: "sticker",
  stickerPackageId: 446,
  stickerId: 1992,
});
sender.send("AccessToken", {
  imageFile: "./3135715.png",
  message: "imageFile",
});
sender.send("AccessToken", {
  message: "image URL",
  imageThumbnail: "https://i.ytimg.com/vi/fOd16PT1S7A/maxresdefault.jpg",
  imageFullsize: "https://i.ytimg.com/vi/fOd16PT1S7A/maxresdefault.jpg",
});
sender.send("AccessToken", {
  message: "Disabled Notification",
  notificationDisabled: true,
});
sender.status("AccessToken");
sender.revoke("AccessToken").then((res) => console.log(res));
