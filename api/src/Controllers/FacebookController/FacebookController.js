

const Facebook = require('facebook-node-sdk');
const axios = require("axios")
const fs = require("fs")
const path = require("path");
const puppeteer = require("puppeteer")
const ffmpeg = require("fluent-ffmpeg")
const WebSocket = require("ws");

const wss = require("../../Utils/WsSocket")

const downloadConnections = new Map();
const sendProgressToAllClients = (downloadedSize, totalSize,downloadId) => {
  if(totalSize==="audio"){
    const connections = downloadConnections.get(downloadId);
    wss.clients.forEach((client) => {
      
      if (connections) {
        connections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(Math.round(downloadedSize).toString());
          }
        });
      }
    });
  }else{
    const progress = ((downloadedSize / totalSize) * 100)
    const connections = downloadConnections.get(downloadId);
    wss.clients.forEach((client) => {
      
      if (connections) {
        connections.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send( Math.round(progress).toString());
          }
        });
      }
    });
  }
  
};
wss.on('connection', (ws) => {
  console.log("WebSocket connected...");
  ws.on('message', (message) => {
    try {
     
      const { type, downloadId } = JSON.parse(message);
      console.log("message....",type)
      if (type === 'startDownload') {
        // Store the WebSocket connection for this download ID
        if (!downloadConnections.has(downloadId)) {
          downloadConnections.set(downloadId, new Set());
        }
        downloadConnections.get(downloadId).add(ws);
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  })
  // Handle WebSocket closure
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



const FetchFacebookDetail = async (req,res,next)=>{
try{
   
   const {url} = req.body
   let videoSize = 0
  let audioSize = 0
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
 
  await page.goto(url);
  await page.waitForSelector('video')
const script = `
let data = {
  url:'',
  title:''
};
const video = document.querySelectorAll('video');
const title = document.querySelectorAll('title');

const url=  video[0].currentSrc;
data.url=url;
data.title = title[0].innerText
data;

`
  const videoElement = await page.evaluate(script) // Get the DOM element of the <video> tag
  const response = await axios.head(videoElement.url);
  const contentLength = response.headers['content-length'];
  
  
  if (contentLength) {
    const sizeInBytes = parseInt(contentLength, 10);
    const sizeInKB = sizeInBytes / 1024;
    const sizeInMB = sizeInKB / 1024;
    videoSize = sizeInMB
  
  } else {
    return null;
  }
  ffmpeg.ffprobe(videoElement.url, (err, metadata) => {
    if (err) {
      console.error('Error analyzing video:', err);
      return;
    }
  console.log(metadata)
    // Extract audio stream information
    const audioStream = metadata.streams.find(stream => stream.codec_type === 'audio');
    console.log(audioStream)
   
    if (audioStream) {
      const audioSizeInBytes = audioStream.bit_rate * audioStream.duration;
      console.log(audioSizeInBytes)
      const audioSizeInKB = audioSizeInBytes / 1024;
      const audioSizeInMB = audioSizeInKB / 1024;
     
      res.json({data:videoElement,videoSize:videoSize,audioSize:audioSizeInMB})
    }else{
      res.json({data:videoElement,videoSize:videoSize,audioSize:audioSize})
    }
    
    
  });



}catch(error){
    console.log(error)
}
   
}

const facebookDownload = async (req,res,next)=>{
  try{
    const {url} = req.query
    console.log(url)

    url.map( async (item)=>{
      if(item.type==="video"){
        const videoUrl = item.videoUrl;
      
        const videoFileName = `${Date.now()}.mp4`;
        const folderName = `Video_${Date.now()}`
         let downloadedSize = 0;
        let Progress = false
        const response = await axios.get(videoUrl, { responseType: 'stream' });
      // const folderPath= fs.mkdirSync(`./src/${folderName}`, { recursive: true })
     
        // const videoFilePath = path.join(__dirname, `../../${folderName}/${videoFileName}`);
       
    
       
        // res.setHeader('Content-Disposition', `attachment; filename=${videoFileName}`);
        // res.setHeader('Content-Type', 'video/mp4');
        // res.setHeader('Content-Length', response.headers['content-length']);  
        const totalSize = parseInt(response.headers['content-length'], 10);
        
       
        
         
       
        response.data.on('data', (chunk) => {
         
          downloadedSize += chunk.length;
          const progress = (downloadedSize / totalSize) * 100;
         
         
        
          sendProgressToAllClients(downloadedSize, totalSize,item.downloadId);
        });
      
        res.setHeader('Content-Length', response.headers['content-length']);
        res.setHeader('Content-Disposition', `attachment; filename=${videoFileName}`);
        res.setHeader('Content-Type', 'video/mp4');
        response.data.pipe(res);

        response.data.on('end', () => {
          console.log('Download finished');
         
        
          // Here, you can consider file cleanup (deleting)
          // fs.unlinkSync(videoFilePath);
          // fs.rmdir(folderPath, { recursive: true }, (err) => {});
    
          // Note: Don't delete the file immediately, consider user actions or scheduled tasks
        });
      
        
         
       
        // const videoStream = response.data.pipe(fs.createWriteStream(videoFilePath));
    
        // videoStream.on('end', () => {
        //   console.log("finishedddd")
        //   res.setHeader('Content-Disposition', `attachment; filename=${videoFileName}`);
        //   res.setHeader('Content-Type', 'video/mp4');
        //   res.setHeader('Content-Length', response.headers['content-length']);
        //   // res.download(videoFilePath, videoFileName, (err) => {
        //   //   if(err){
        //   //     console.log(err)
        //   //   }
        //   //   console.log("download success")
        //   //     fs.unlinkSync(videoFilePath);
        //   //     fs.rmdir(folderPath,{ recursive: true },(err)=>{
               
        //   //     })
             
             
        //   //   });
        //   const fileStream = fs.createReadStream(videoFilePath);
        // fileStream.pipe(res);
        // fileStream.on('end',()=>{
        //   console.log("download success")
        //    fs.unlinkSync(videoFilePath);
        //        fs.rmdir(folderPath,{ recursive: true },(err)=>{
               
        //        })
        // })
  
        
        // });
    
        // videoStream.on('error', (err) => {
        //   console.error('Error downloading video:', err);
        //   res.status(500).send('Error downloading video');
        // });
      }else{
        const outputAudioFile = 'output_audio.mp3';
       
        const output = `${Date.now()}.mp4`
      const outputFolder = `output_${Date.now()}`
      const outputPath= fs.mkdirSync(`./src/${outputFolder}`, { recursive: true })
      const outputFilePath = path.join(__dirname, `../../${outputFolder}/${output}`);
        
    const command = ffmpeg( item.audioUrl)
 
 
  
 
  
  command.ffprobe(item.audioUrl, (err, metadata) => {
    if (!err) {
     
            let downloadedSize = 0;
      const totalDuration = metadata.format.duration;
      const contentLength = metadata.format.size;
      res.setHeader('Content-Length', contentLength);
      
    
      res.setHeader('Content-Disposition', `attachment; filename=${outputAudioFile}`);
      res.setHeader('Content-Type', 'audio/mp3');
      command.outputOptions('-f', 'mp3')
      command.on('progress', (progress) => {
        console.log(progress)
          if(progress.percent>=0){
            sendProgressToAllClients(progress?.percent?.toFixed(2), 'audio', item.downloadId);
          } 
        
          // console.log(`Processing: ${progressPercent}% done`);
      })
      command.pipe(fs.createWriteStream(outputFilePath));
      command.on('end', async () => {
        console.log('Audio downloaded successfully!');
        console.log("merge success")

       await res.download(outputFilePath, output, (err) => {
        if(err){
          console.log(err)
        }
        console.log("download success")
       
          fs.rmdir(outputPath,{ recursive: true },(err)=>{
           
          })
         
        });
       
      })
      command.on('data',(resu)=>{
        console.log(resu)
      })
      command .on('error', (err) => {
        console.error('Error downloading audio:', err);
      })
    } else {
      console.error('Error getting audio metadata:', err);
      res.status(500).send('Error getting audio metadata');
    }
  })
      }
    })
    

  }catch(error){
    console.log(error)
  }

}


module.exports={FetchFacebookDetail,facebookDownload}