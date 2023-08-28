'use client'

import React, { Component } from 'react'
import axios from 'axios'
import { Grid, Container, } from 'semantic-ui-react'
import { formatTime, formatNumber } from './utils';
import ErrorMessage from './components/ErrorMessage';
import Footer from './components/Footer';
import VideoCard from './components/VideoCard';
import Form from './components/Form'
import NavBar from './components/NavBar';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();
const ytdl = require('ytdl-core');

export default class Download extends Component {
    constructor(props) {
        const error = console.error;
        console.error = (...args) => {
            if (/defaultProps/.test(args[0])) return;
            error(...args);
        };

        super(props)
        this.state={
            videoUrl: '',
            videoUrlError: false,
            isSearching: false,
            videoInfo: null,
            errorMessage: null,
            downloadingPercentage: null,
            isVisible: false,
            completedProgress: null
        }
        this.socket = new WebSocket("ws://ishidev-yt-downloader-jl8p-7anxe11t9-iamishtiaq98.vercel.app");
        this.socket.onopen = this.handleOpen;
        this.socket.onmessage = this.handleMessage;
        this.socket.onclose = this.handleClose;
        
    }

    handleDownloadId = () => {
        const timestamp = Date.now().toString();
        const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        const downloadId = timestamp + randomNumber;
        return downloadId
    }

    handleOpen = () => {
        console.log("WebSocket connection is open.");
        const message = JSON.stringify({
            type: 'startDownload',
            downloadId: this.handleDownloadId(),
        });
        this.socket.send(message);
    };

    handleMessage = (e) => {
        const Progres = parseFloat(e.data)
        if (Progres === 100) {
            console.log("Download finished");
        }
       this.setState({
        downloadingPercentage:Progres
       })
    };

    componentDidMount() {
        this.timeout = setTimeout(() => {
            this.setState({ isVisible: true });
        }, 500);
    }

    componentWillUnmount() {
        clearTimeout(this.timeout);
        this.handleClose
    }

    stripYoutubeId = url => {
        url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
        return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
    }

    validateYoutubeUrlId = () => {
        if (!this.state.videoUrl) {
            this.setState({ videoUrlError: true })
            return false;
        }
        let videoId = this.stripYoutubeId(this.state.videoUrl)

        if (!ytdl.validateID(videoId)) {
            this.setState({ videoUrlError: true })
            return false;
        }
        this.setState({ videoUrlError: false })
        return true;
    }

    onChangeInput = value => {
        this.setState({ videoUrl: value }, () => {
            if (this.state.videoUrlError)
                this.validateYoutubeUrlId()
        })
    }

    onSearch = async () => {
        let videoUrlIdValid = this.validateYoutubeUrlId();
        if (!videoUrlIdValid) {
            return
        }

        let videoId = this.stripYoutubeId(this.state.videoUrl)
        this.setState({ isSearching: true, errorMessage: null })
        await fetch('/api/getInfo', {
            method: 'POST',
            body: JSON.stringify({
                videoId
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res.success) {
                    this.setState({
                        videoInfo: {
                            ...res.details,
                            thumbnail: res.details.thumbnail.thumbnails.length ? res.details.thumbnail.thumbnails.slice(-1)[0].url : '/not_found.jpg',
                            length: res.details.lengthSeconds ? formatTime(res.details.lengthSeconds) : null,
                            viewCount: res.details.viewCount ? formatNumber(res.details.viewCount) : null,
                            formats: res.formats.map(item => ({ ...item, isDownloading: false }))
                        }
                    })
                } else {
                    this.setState({ errorMessage: res.error, videoInfo: null })
                }
            })
            .catch(err => {
                this.setState({ errorMessage: 'Internal server errror, please, try again later.', videoInfo: null })
                console.error(err)
            })
            .finally(() => this.setState({ isSearching: false, downloadingPercentage: null }))
    }

    onDownload = async (itag, mimeType, quality, contentLength, type, videoUrl, title) => {
        this.setState({
            videoInfo: {
                ...this.state.videoInfo,
                formats: this.state.videoInfo.formats.map(item => ({
                    ...item,
                    isDownloading: item.itag === itag ? true : false
                }))

            },
            errorMessage: null,
            
        })
        const uri = this.state.videoInfo.video_url;
        const fileName = `${quality}-${this.state.videoInfo.title}.${mimeType.includes('audio') ? 'm4a' : 'mp4'}`;

        try {
            const response = await axios.get('http://localhost:3001/api/youtube_download', {
                responseType: 'blob',
                params: {
                    title: title,
                    videoUri: videoUrl,
                    audioUri: uri,
                    type: 'video',
                    downloadId: this.handleDownloadId()
                },
                onDownloadProgress: (progressEvent) => {
                    console.log(progressEvent)
                    const Progress = Math.floor(progressEvent.progress * 100)
                    this.setState({
                        completedProgress: Progress
                    })
                    if (Progress === 100) {
                        this.setState({
                            downloadingPercentage: null,
                            completedProgress:null
                        })

                    }

                },
            });

            const link = document.createElement('a');
            link.setAttribute('target', '_blank')
            const url = window.URL.createObjectURL(new Blob([response.data]));

            link.href = url;
            link.setAttribute('download', `${fileName}`);
            document.body.appendChild(link);
            link.click();
            setTimeout(() => {
                link.parentNode.removeChild(link);
            }, 5000)

        } catch (error) {
            console.error('Error downloading file', error);
        }
    };

    render() {
         this.handleMessage.bind(this);
        return (
            <ThemeProvider theme={theme}>

                <NavBar />
                <Container style={{
                    paddingTop: '6rem',
                    marginBottom: '5rem',
                    opacity: this.state.isVisible ? 1 : 0,
                    transition: 'opacity 0.5s ease-in-out',
                }}>
                    <Grid verticalAlign='middle' textAlign='center' stackable>
                        <Form isSearching={this.state.isSearching} videoUrlError={this.state.videoUrlError}
                            onChangeInput={this.onChangeInput} onSearch={this.onSearch} />
                        <ErrorMessage errorMessage={this.state.errorMessage} active={Boolean(this.state.errorMessage)} />
                        <VideoCard videoInfo={this.state.videoInfo} active={Boolean(this.state.videoInfo)} downloadingPercentage={this.state.downloadingPercentage}
                            onDownload={this.onDownload} completedProgress={this.state.completedProgress} />
                    </Grid>
                </Container>
                <Footer />

            </ThemeProvider>
        )
    }
}
