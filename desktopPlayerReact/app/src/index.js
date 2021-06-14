const { app, BrowserWindow } = require("electron");

const path = require("path");
const dir = require("node-dir");
const os = require("os");

const express = require("express");
const mongoose = require("mongoose");

const expressApp = express();

expressApp.use(express.json({ extended: true }));

expressApp.use("/api/", require("../routes/auth.routes"));

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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
