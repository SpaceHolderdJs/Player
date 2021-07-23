const { app, BrowserWindow } = require("electron");

const path = require("path");
const dir = require("node-dir");
const os = require("os");
const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");

const expressApp = express();

expressApp.use(express.json({ extended: true }));

expressApp.use("/api/", require("./routes/auth.routes"));

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      webSecurity: false,
      nodeIntegration: true, // is default value after Electron v5
      contextIsolation: false, // protect against prototype pollution
      enableRemoteModule: true,
    },
  });

  mainWindow.loadURL("http://localhost:3000/");

  mainWindow.webContents.openDevTools();
};

app.on("ready", createWindow);

mongoose
  .connect(
    `mongodb+srv://Igor:somepassword1999@main.2p6yd.mongodb.net/Chat?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    }
  )
  .then(() => {
    console.log("mongo connected");
  })
  .catch((err) => console.log(err));

expressApp.listen(5000, () => console.log("app started"));

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

//file operations

//initing folder for files

if (!fs.existsSync(path.join(os.homedir(), "audios"))) {
  fs.mkdir(path.join(os.homedir(), "audios"), (err) => {
    err && console.log(err);
  });
}

const { ipcMain } = require("electron");

//cutting file
const MP3Cutter = require("mp3-cutter");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);

ipcMain.on("saveFile", (event, file) => {
  console.log("heyyyy", file);
  const folder = path.join(os.homedir(), "audios");

  const process = ffmpeg({ source: path.normalize(file.path) });

  if (file.format) {
    process
      .setStartTime(file.start || 0)
      .setDuration(file.end - file.start)
      .outputFormat(file.format)
      .save(
        path.join(
          folder,
          "[modified]" + new Date().toLocaleDateString() + file.name
        )
      )
      .on("error", (err) => {
        err && event.reply("error", err);
      })
      .on("end", () => {
        const audios = [];
        fs.readdir(folder, (err, files) => {
          err && event.reply("error", err.message);

          files.forEach((e) =>
            audios.push({
              name: path.basename(e),
              path: path.join(folder, e),
            })
          );

          console.log(audios, folder);

          event.reply("fileSaved", audios);
        });
      });
  } else {
    process
      .setStartTime(file.start || 0)
      .setDuration(file.end - file.start)
      .save(
        path.join(
          folder,
          "[modified]" + new Date().toLocaleDateString() + file.name
        )
      )
      .on("end", () => {
        const audios = [];
        fs.readdir(folder, (err, files) => {
          err && event.reply("error", err.message);

          files.forEach((e) =>
            audios.push({
              name: path.basename(e),
              path: path.join(folder, e),
            })
          );

          console.log(audios, folder);

          event.reply("fileSaved", audios);
        });
      });
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
