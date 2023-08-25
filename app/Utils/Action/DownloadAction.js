
import axios from "axios"
export const addToDownload = (item) => async (dispatch, getState) => {
  dispatch({ type: 'ADD_TO_DOWNLOAD', payload: item })

  const { download } = getState()
  console.log("download from action", download)
  const urls = download.downloads.filter((item) => item.Progress === 0)
  console.log(urls)
  let SOCKETURL = ""
  const wss = new WebSocket("ws://localhost:8080")
  urls?.map(async (item) => {



    const timestamp = Date.now().toString();
    const randomNumber = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    const downloadId = timestamp + randomNumber;
    const message = JSON.stringify({
      type: 'startDownload',
      downloadId: downloadId,
    });

    wss.onopen = () => {
      console.log("WebSocket connection is open.");
      wss.send(message); // Send the message with type and downloadId
    };

    wss.addEventListener('message', (e) => {
      console.log(e)

      console.log("download type......", item.type)



      dispatch({ type: "START_DOWNLOAD", payload: { url: item.videoUrl, Progress: e.data } })

      if (e.data === "100.00") {
        console.log("finishedddddddddd")
        dispatch({ type: "DOWNLOAD_MARGED", payload: "MARGED" })
      }

    })

    let URL = ""
    if (item.from === "social") {
      URL = "http://localhost:3001/api/facebook/facebook_download"
    } else {
      URL = "http://localhost:3001/api/youtube_download"
    }

    const response = await axios.get(URL, {
      responseType: 'blob',
      params: {
        url: [{ ...item, downloadId: downloadId }]
      },
      onDownloadProgress: (progressEvent) => {
        console.log(progressEvent)
        const Progress = Math.floor(progressEvent.progress * 100)

        if (Progress === 100) {
          dispatch({ type: "DOWNLOAD_FINISHED", payload: { url: item.type === "video" ? item.videoUrl : item.audioUrl } })
        }


      },
    });

    const extenstion = () => {
      if (item.type === "video") {
        console.log("mytype.......", item.type)
        return `${item.title}.mp4`
      } else {
        return `${item.title}.mp3`
      }
    }


    const link = document.createElement('a');
    link.setAttribute('target', '_blank')
    const url = window.URL.createObjectURL(new Blob([response.data]));

    link.href = url;
    link.setAttribute('download', `${extenstion()}`);
    document.body.appendChild(link);
    link.click();
    setTimeout(() => {
      link.parentNode.removeChild(link);
    }, 5000)
  })
};