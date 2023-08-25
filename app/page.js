'use client'

import React, { Component } from 'react'
import { Provider } from 'react-redux';
import Download from './Download';
import store from './Utils/Store';

export default class Page extends Component {

    render() {

        return (
            <Provider store={store}>
                <Download />
            </Provider>
        )
    }
}