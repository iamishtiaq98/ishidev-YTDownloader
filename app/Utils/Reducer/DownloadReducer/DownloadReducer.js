const initialState = {
    downloads: [],
    downloadMessage: ""

}

const DownloadReduces = (state = initialState, action) => {
    switch (action.type) {
        case 'ADD_TO_DOWNLOAD':

            const items = {
                ...action.payload,
                Progress: 0,
                downloadSpeed: 0,
                recived: 0,
                total: 0
            }

            const isItemExist = state.downloads.find(i => i.videoUrl === items.videoUrl)

            if (isItemExist) {
                return {
                    ...state,
                    downloads: state.downloads.map(i => i.videoUrl === isItemExist.videoUrl ? items : i)
                }
            } else {
                return {
                    downloads: [...state.downloads, items]
                }
            }

        case 'START_DOWNLOAD':
            return {
                ...state,
                downloadMessage: "",
                downloads: state.downloads.map((item) => {
                    if (item.videoUrl === action.payload.url) {
                        const progress = action.payload.Progress

                        return {
                            ...item,
                            Progress: progress,
                            downloadSpeed: action.payload.DownloadSpeed,
                            recived: action.payload.recived,
                            total: action.payload.total
                        }
                    }
                    return item;
                })
            }
        case 'DOWNLOAD_MARGED':
            return {
                ...state,
                downloadMessage: action.payload,

            }
        case 'DOWNLOAD_FINISHED':

            return {
                ...state,
                downloadMessage: "",
                downloads: []
            }



        default:
            return state;
    }
}
export default DownloadReduces;