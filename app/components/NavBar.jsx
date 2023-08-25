import React, { Component } from 'react';
import Logo from '../assets/images/ishi-yt.png';
import Image from 'next/image';

export default class NavBar extends Component {
    render() {
        return (
            <>
                <div className="ui fixed borderless huge menu">

                    <div className="ui container grid">
                        <div className="row">
                            <a className="header item">
                                <Image style={{width: '225px', height: '50px' }} src={Logo} alt="Ishi-dev YT-Downloader"/>
                            </a>
                            <a href="" className="active item">Home</a>
                            
                            <div className="right menu">
                                <div className="item">
                                    <div className="ui icon input">
                                       
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        )
    }
}