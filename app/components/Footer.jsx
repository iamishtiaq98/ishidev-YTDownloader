import React, { Component } from 'react'
import { Grid, Message, Icon } from 'semantic-ui-react'

export default class Footer extends Component {
    render() {
        return (
            <Grid.Row style={{
                position: 'fixed',
                bottom: '0px',
                width: '100%'
            }}>
                <Grid.Column>
                    <Message color={'grey'} style={{backgroundColor: '#a6a6a6a1', textAlign: 'center'}}>
                        <b>&copy; {(new Date().getFullYear())} - <a href="" style={{ textDecoration: 'none', color: '#e63b4b' }}>Ishi-dev YT-Downloader</a> Made with <Icon name='heart' color='red' fitted />
                        &nbsp; by <a href="https://github.com/iamishtiaq98" style={{ textDecoration: 'none', color: '#e63b4b' }}>Ishtiaq Amjad</a></b>
                    </Message>
                </Grid.Column>
            </Grid.Row>
        )
    }
}