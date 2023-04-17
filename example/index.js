const LineNotifier = require("../index");
const sender = new LineNotifier(process.env.ACCESS_TOKEN);

sender.send({ message: "Only message" });
sender.send({ message: "sticker", stickerPackageId: 446, stickerId: 1992 });
sender.send({ imageFile: "./3135715.png", message: "imageFile" });
sender.send({
  message: "image URL",
  imageThumbnail: "https://i.ytimg.com/vi/fOd16PT1S7A/maxresdefault.jpg",
  imageFullsize: "https://i.ytimg.com/vi/fOd16PT1S7A/maxresdefault.jpg",
});
sender.send({ message: "Disabled Notification", notificationDisabled: true });
sender.status();
sender.revoke().then((res) => console.log(res));
