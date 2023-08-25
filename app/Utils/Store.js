import {  applyMiddleware,combineReducers } from 'redux';
import {  configureStore } from '@reduxjs/toolkit'
import thunk from 'redux-thunk';
import DownloadReduces from './Reducer/DownloadReducer/DownloadReducer';

let reducers = combineReducers({
    download:DownloadReduces
})
const store = configureStore({reducer:reducers}, applyMiddleware(thunk));


export default store