const ytdl = require("ytdl-core");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ffmpeg = require('fluent-ffmpeg');
const { google } = require('googleapis');

const WebSocket = require("ws");
const wss = require("../../Utils/WsSocket");
const downloadConnections = new Map();
let downloadid = 0

const sendProgressToAllClients = (downloadedSize, totalSize, downloadId) => {
  const progress = ((downloadedSize / totalSize) * 100)
  const connections = downloadConnections.get(downloadId);
  wss.clients.forEach((client) => {

    if (connections) {
      connections.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(Math.round(progress).toString());
        }
      });
    }
  });
};

wss.on('connection', (ws) => {
  console.log("WebSocket connected...");
  ws.on('message', (message) => {
    try {
      const { type, downloadId } = JSON.parse(message);
      downloadid = downloadId
      console.log("download id from message",downloadId)
      console.log("message....", type)
      if (type === 'startDownload') {
        if (!downloadConnections.has(downloadId)) {
          downloadConnections.set(downloadId, new Set());
        }
        downloadConnections.get(downloadId).add(ws);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  })

  ws.on('close', () => {
    console.log("WebSocket disconnected...");
    downloadConnections.forEach((connections, downloadId) => {
      if (connections.has(ws)) {
        connections.delete(ws);
        if (connections.size === 0) {
          downloadConnections.delete(downloadId);
        }
      }
    });
  });

});


const GetInfo = async (req, res, next) => {
  try {
    const { url } = req.body
    console.log(url)
    const info = await ytdl.getInfo(url)


    const videoUrl = await info.formats.find((format) => format.hasVideo === true && format.hasAudio === true);

    res.status(200).json({ data: info, playVideo: videoUrl })

  } catch (error) {
    console.log(error)
    res.json({ message: "error", error })
  }
}

const fetchVideoInfo = async (req, res, next) => {
  const youtube = google.youtube({
    version: 'v3',
    auth: 'AIzaSyBSSb23RomF1h5xcnFSl9d_nVKg5ut3-18', // Replace with your YouTube API key
  });

  try {

    await youtube.videos.list({
      part: "liveStreamingDetails",
      id: "O-nfDLLlMYg",
    }).then((result) => {
      res.json({ response: result.data })
    })


  } catch (error) {
    console.error('Error fetching video information:', error);

  }
};


const DownloadFile = async (req, res, next) => {

  try {
    const { title, videoUri, audioUri, type,downloadId } = req.query
    console.log( "download id from params", downloadid)
    if (type === "video") {
      const videoUrl = videoUri;
      const audioUrl = audioUri;
      const audioFileName = `Audio_${Date.now()}.mp3`
      const videoFileName = `${Date.now()}.mp4`;
      const output = `${Date.now()}.mp4`
      const folderName = `Video_${Date.now()}`
      const outputFolder = `output`
      let downloadedSize = 0;
      let progress = false

      const response = await axios.get(videoUrl, { responseType: 'stream' });

      const audio = ytdl(audioUrl, { quality: 'highestaudio' });
      const folderPath = fs.mkdirSync(`./src/${folderName}`, { recursive: true })
      const outputPath = fs.mkdirSync(`./src/${outputFolder}`, { recursive: true })
      const videoFilePath = path.join(__dirname, `../../${folderName}/${videoFileName}`);
      const outputFilePath = path.join(__dirname, `../../${outputFolder}/${output}`);
      const audioPath = path.join(__dirname, `../../${folderName}/${audioFileName}`);
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Length', response.headers['content-length']);
      const totalSize = parseInt(response.headers['content-length'], 10);

      response.data.on('data', (chunk) => {
        downloadedSize += chunk.length;
        const progress = (downloadedSize / totalSize) * 100;
        
      
      
        sendProgressToAllClients(downloadedSize, totalSize, downloadid);
      });

      audio.pipe(fs.createWriteStream(audioPath));
      const videoStream = response.data.pipe(fs.createWriteStream(videoFilePath));

      videoStream.on('finish', () => {
        console.log("finishedddd")
        ffmpeg()
          .addInput(videoFilePath)
          .addInput(audioPath)
          .addOptions([
            '-map 0:v', '-map 1:a', '-c:v copy'
          ])
          .format('mp4')
          .saveToFile(outputFilePath)
          .on('error', (err) => {
            console.error('Error merging audio and video:', err);
          })
          .on('end', () => {
            console.log("merge success")

            res.download(outputFilePath, output, (err) => {
              if (err) {
                console.log(err)
              }
              console.log("download success")
              fs.unlinkSync(videoFilePath);
              fs.rmdir(folderPath, { recursive: true }, (err) => {
              })
              fs.rmdir(outputPath, { recursive: true }, (err) => {
              })
            });
          })
      });

      videoStream.on('error', (err) => {
        console.error('Error downloading video:', err);
        res.status(500).send('Error downloading video');
      });
    } else {
      const audioFileName = `${title}.mp3`
      const folderName = `audio_${Date.now()}`
      let downloadedSize = 0;

      const videoInfo = await ytdl.getInfo(item.audioUrl);

      const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

      const folderPath = fs.mkdirSync(`./src/${folderName}`, { recursive: true })
      const audioPath = path.join(__dirname, `../../${folderName}/${audioFileName}`);

      const audio = ytdl(item.audioUrl, { quality: 'highestaudio' });
      const totalSize = audioFormat.contentLength;

      audio.on('progress', (chunkLength, downloaded, total) => {
        downloadedSize += chunkLength;
        const progress = (downloadedSize / totalSize) * 100;
        console.log(progress.toFixed(2))
        sendProgressToAllClients(downloadedSize, totalSize, item.downloadId);
      });

      audio.pipe(fs.createWriteStream(audioPath));
      audio.on('end', () => {
        console.log("finisehdddddd")
        res.download(audioPath, audioFileName, (err) => {
          if (err) {
            console.error('Error sending the audio file:', err);
          }
          fs.unlinkSync(audioPath);
          fs.rmdir(folderPath, { recursive: true }, (err) => {
            if (err) {
              console.error('Error removing folder:', err);
            }
          })
        });
      });
    }
  } catch (err) {
    console.error('Error downloading video:', err);
    res.status(500).send('Error downloading video');
  }
}
module.exports = { GetInfo, fetchVideoInfo, DownloadFile }
