const { app, BrowserWindow } = require("electron");

const path = require("path");
const dir = require("node-dir");
const os = require("os");
const fs = require("fs");

const express = require("express");
const mongoose = require("mongoose");

let LocalStorage = require("node-localstorage").LocalStorage;
localStorage = new LocalStorage("./storage");

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

const { ipcMain } = require("electron");

ipcMain.on("directoryInit", (event) => {
  if (
    !fs.existsSync(path.join(os.homedir(), "audios")) &&
    !localStorage.getItem("directory")
  ) {
    fs.mkdir(path.join(os.homedir(), "audios"), (err) => {
      err && console.log(err);
      event.reply("directory", path.join(os.homedir(), "audios"));
    });
  } else {
    event.reply(
      "directory",
      localStorage.getItem("directory")
        ? localStorage.getItem("directory")
        : path.join(os.homedir(), "audios")
    );
  }
  localStorage.setItem("directory", path.join(os.homedir(), "audios"));
  if (!fs.existsSync(path.join(path.dirname(), "tmp"))) {
    fs.mkdir(path.join(path.dirname(), "tmp"), (err) => {
      err && console.log(err);
    });
  }
});

ipcMain.on("directoryChange", (event, dir) => {
  localStorage.setItem("directory", path.normalize(dir));
  event.reply("directoryChanged", "Directory changed");
});

//scanning folder

ipcMain.on("scanFolder", (event) => {
  const audios = [];
  const folder = localStorage.getItem("directory");
  fs.readdir(folder, (err, files) => {
    err && console.log(err);
    files.forEach((e) =>
      audios.push({
        name: path.basename(e),
        path: path.join(folder, e),
      })
    );
    event.reply("scanedFolder", audios);
    console.log(audios, folder);
  });
});

const filters = {
  peaking: "equalizer",
  notch: "bandreject",
  allpass: "allpass",
  bandpass: "bandpass",
  highpass: "highpass",
  lowpass: "lowpass",
  heighshelf: "heighshelf",
  lowshelf: "lowshelf",
};

const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

//cutting file
const MP3Cutter = require("mp3-cutter");

const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
let ffmpeg = require("fluent-ffmpeg");

ffmpeg.setFfmpegPath(ffmpegPath);

ipcMain.on("saveFile", (event, file) => {
  console.log("heyyyy", file);

  const process = ffmpeg({ source: path.normalize(file.path) });
  const formatWas = file.name.split(".").reverse()[0];

  if (!file.filterType) {
    process
      .setStartTime(file.start || 0)
      .setDuration(file.end - file.start)
      .toFormat(file.format)
      .saveToFile(
        path.join(
          folder,
          "[modified]" +
            new Date().toLocaleDateString() +
            file.name.slice(0, file.name.length - formatWas.length) +
            file.format
        )
      )
      .on("progress", () => {})
      .on("error", (err) => {
        err && event.reply("error", err);
      })
      .on("end", () => {
        const audios = [];
        const folder = localStorage.getItem("directory");
        fs.readdir(folder, (err, files) => {
          err && console.log(err);
          files.forEach((e) =>
            audios.push({
              name: path.basename(e),
              path: path.join(folder, e),
            })
          );
          event.reply("fileSaved", audios);
          console.log(audios, folder);
        });
      });
  } else {
    const freqs = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];

    const filters = {
      peaking: "equalizer",
      notch: "bandreject",
      allpass: "allpass",
      bandpass: "bandpass",
      highpass: "highpass",
      lowpass: "lowpass",
      heighshelf: "heighshelf",
      lowshelf: "lowshelf",
    };

    const format = file.format ? file.format : formatWas;
    const folder = localStorage.getItem("directory");

    const process = ffmpeg({
      source: path.normalize(file.path),
    })
      .setStartTime(file.start || 0)
      .setDuration(file.end - file.start)
      .audioFilters(
        freqs.map((e, i) => {
          const options = {
            frequency: e,
          };

          if (!file.filterType.includes("pass")) {
            options.gain = file.filterVals[i];
          }

          return {
            filter: filters[file.filterType],
            options,
          };
        })
      )
      .toFormat(format)
      .save(
        path.join(
          folder,
          "[modified]" +
            new Date().toLocaleDateString() +
            file.name.slice(0, file.name.length - formatWas.length) +
            format
        )
      )
      .on("error", (err) => {
        err && event.reply("error", err);
      })
      .on("end", () => {
        const audios = [];
        const folder = localStorage.getItem("directory");
        fs.readdir(folder, (err, files) => {
          err && console.log(err);
          files.forEach((e) =>
            audios.push({
              name: path.basename(e),
              path: path.join(folder, e),
            })
          );
          event.reply("fileSaved", audios);
          console.log(audios, folder);
        });
      });
  }
});

//Saving all tracks

ipcMain.on("saveAllTracks", (event, data) => {
  const { tracklist, globalName } = data;

  console.log(tracklist);

  tracklist.forEach((e, i) => {
    const process = ffmpeg({ source: path.normalize(e.path) });

    process.setStartTime(e.start || 0).setDuration(e.end - e.start);

    e.filterType &&
      process.audioFilters(
        freqs.map((el, i) => {
          const options = {
            frequency: el,
          };

          if (!e.filterType.includes("pass")) {
            options.gain = e.filterVals[i];
          }

          return {
            filter: filters[e.filterType],
            options,
          };
        })
      );

    process.toFormat("mp3").save(path.join(path.dirname(), "tmp", i, "mp3"));
  });

  const process = ffmpeg();

  fs.readdir(path.join(path.dirname(), "tmp"), (err, files) => {
    console.log("!!!", files);
  });
  // tracklist.forEach((e) => process.addInput(e.path));

  const folder = localStorage.getItem("directory");

  process
    .toFormat("mp3")
    .audioFilters(
      freqs.map((el, i) => {
        const options = {
          frequency: el,
        };

        if (tracklist[0].filterType.includes("pass")) {
          options.gain = tracklist[0].filterVals[i];
        }

        return {
          filter: filters[tracklist[0].filterType],
          options,
        };
      })
    )
    .complexFilter({ filter: "amix", duration: "" })
    .save(path.join(folder, globalName + ".mp3"))
    .on("end", () => {
      const audios = [];
      const folder = localStorage.getItem("directory");
      fs.readdir(folder, (err, files) => {
        err && console.log(err);
        files.forEach((e) =>
          audios.push({
            name: path.basename(e),
            path: path.join(folder, e),
          })
        );
        event.reply("allTracksSaved", audios);
        console.log(audios, folder);
      });
    });
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
