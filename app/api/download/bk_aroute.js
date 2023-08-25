import { NextResponse } from "next/server";
const ytdl = require('ytdl-core');
const fs = require('fs');
const ffmpegPath = require('fluent-ffmpeg');

export const POST = async (req) => {
    try {
        const jsonBody = await req.json();
        const { videoId, itag, type, title, videoUrl} = jsonBody;

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

        const { videoName, itagExists } = await ytdl.getBasicInfo(`https://www.youtube.com/watch?v=${videoId}`)
            .then((info) => ({
                videoName: info.player_response.videoDetails.title,
                itagExists: info.formats.find((item) => item.itag == itag)
            }));

        if (!itagExists) {
            return NextResponse.json({
                success: false,
                error: 'Invalid quality/format selected.'
            }, {
                status: 400
            });
        }

        const audioUrl = `https://www.youtube.com/watch?v=${videoId}`;

     
        const outputFileName = `${videoName}.mp4`;

        const ffmpeg = require('child_process').spawn(ffmpegPath, [
            '-i', videoUrl,
            '-i', audioUrl,
            '-c:v', 'copy',
            '-c:a', 'aac',
            '-strict', 'experimental',
            '-shortest',
            outputFileName
        ]);

        const outputPath = `./public/downloads/${outputFileName}`;

        ffmpeg.on('close', (code) => {
            if (code === 0) {
                const responseHeaders = new Headers();
                responseHeaders.set(
                    "Content-Disposition",
                    `attachment; filename="${outputFileName}"`
                );

                responseHeaders.set(
                    "User-Agent",
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36",
                );

                const fileStream = fs.createReadStream(outputFileName);

                if (fileStream) {
                    return new Response(fileStream, {
                        headers: responseHeaders,
                    });
                } else {
                    return NextResponse.json({
                        success: false,
                        error: 'Error generating the response.'
                    }, {
                        status: 500
                    });
                }
            } else {
                return NextResponse.json({
                    success: false,
                    error: 'Error merging audio and video.'
                }, {
                    status: 500
                });
            }
        });

        videoStream.on('error', (err) => {
            console.error('Error downloading video:', err);
        });

        return NextResponse.json({
            success: true,
            message: 'Processing request...'
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({
            success: false,
            error: 'Internal server error.'
        }, {
            status: 500
        });
    }
};
