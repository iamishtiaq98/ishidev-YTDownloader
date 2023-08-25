import { NextResponse } from "next/server";

const ytdl = require('ytdl-core');
const fs = require("fs");
const axios = require("axios");
const path = require("path");
import ffmpeg from 'fluent-ffmpeg';

export const POST = async (req, res) => {
    const jsonBody = await req.json();
    const { videoId, itag, type, title, videoUrl } = jsonBody;

    if (!videoId || !itag) {
        return NextResponse.json({
            success: false,
            error: 'Provide videoId and itag parameters.'
        }, {
            status: 400
        });
    }

    if (!ytdl.validateID(videoId)) {
        return NextResponse.json({
            success: false,
            error: 'Invalid videoId parameter.'
        }, {
            status: 400
        });
    }

    const { videoName, itagExists, desiredFormat } = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${videoId}`)
        .then(info => ({
            videoName: info.player_response.videoDetails.title,
            itagExists: info.formats.some(item => item.itag == itag),
        }));

    const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;

    if (!itagExists) {
        return NextResponse.json({
            success: false,
            error: 'Invalid quality/format selected.'
        }, {
            status: 400
        });
    }

    if (type === "video") {
        const audioFileName = `Audio_${Date.now()}.mp3`;
        const videoFileName = `${Date.now()}.mp4`;
        const outputFileName = `${Date.now()}_merged.mp4`;
        const folderName = `Video_${Date.now()}`;
        const outputFolder = `output_${Date.now()}`;
        let downloadedSize = 0;

        try {
            const response = await axios.get(videoUrl, { responseType: 'stream' });
            const audio = ytdl(audioUrl, { quality: 'highestaudio' });

            fs.mkdirSync(`./public/adownloads/${folderName}`, { recursive: true });
            fs.mkdirSync(`./public/adownload/${outputFolder}`, { recursive: true });

            const videoFilePath = path.join(`./public/adownloads/${folderName}/${videoFileName}`);
            const audioPath = path.join(`./public/adownloads/${folderName}/${audioFileName}`);
            const outputFilePath = path.join(`./public/adownload/${outputFolder}/${outputFileName}`);

            const totalSize = parseInt(response.headers['content-length'], 10);

            response.data.on('data', (chunk) => {
                downloadedSize += chunk.length;
                const progress = (downloadedSize / totalSize) * 100;
                console.log(progress);
            });

            audio.pipe(fs.createWriteStream(audioPath));

            const videoStream = response.data.pipe(fs.createWriteStream(videoFilePath));

            videoStream.on('finish', async () => {
                console.log("finished");

                try {

                    ffmpeg()
                        .addInput(videoFilePath)
                        .addInput(audioPath)
                        .addOptions(['-map 0:v', '-map 1:a', '-c:v copy'])
                        .format('mp4')
                        .save(outputFilePath)
                        .on('end', () => {

                            const fileStream = fs.createReadStream(outputFilePath); // Use createReadStream instead of readFileSync
                            if (fileStream) {
                                const response = NextResponse.success(fileStream, {
                                    headers: {
                                        'Content-Type': 'video/mp4',
                                        'Content-Disposition': `attachment; filename="${title}.mp4"`
                                    },
                                });
                    
                                res.status(200).send(response); // Send the response
                            }

                        })
                        .on('error', (err) => {

                            console.error('Error merging audio and video:', err);
                            res.status(500).send('Error merging audio and video'); // Handle the error and send an HTTP 500 response

                        })
                        .on('close', (code) => {

                        });



                } catch (err) {
                    console.error('Error processing video:', err);
                    res.status(500).send('Error processing the video'); // Handle the error and send an HTTP 500 response
                }
            });

            videoStream.on('error', (err) => {
                console.error('Error downloading video:', err);
                res.status(500).send('Error downloading the video'); // Handle the error and send an HTTP 500 response
            });
        } catch (err) {
            console.error('Error downloading video:', err);
            res.status(500).send('Error downloading the video'); // Handle the error and send an HTTP 500 response
        }
    }
};
