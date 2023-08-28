import React, { Component } from 'react'
import { Image, Icon, Dimmer, Card, Header, Button, Label, Progress, Modal } from 'semantic-ui-react'
import HDSvg from '../../public/hd.svg'
import { formatNumber, formatFileSize, formatMimeType } from '../utils'
import { Box, Grid } from '@mui/material';


export default class VideoCard extends Component {
    state = {
        dimmerActive: false,
        descriptionModal: false,
    }
    render() {
        const { videoInfo, active, downloadingPercentage, onDownload, completedProgress } = this.props

        return active ? (
            <Box paddingBottom={'5rem'}>
                <Grid container spacing={2}>
                    <Grid item xs={12} >
                        <Card fluid>
                            <Grid container textAlign='center'>
                                <Grid item lg={6} xs={12}
                                    style={{
                                        paddingRight: '0px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                        paddingBottom: '0',

                                    }}>

                                    <Grid container textAlign='center'>
                                        <Grid item xs={12}>

                                            <Dimmer.Dimmable blurring={this.state.dimmerActive}
                                                onMouseEnter={() => this.setState({ dimmerActive: true })}
                                                onMouseLeave={() => this.setState({ dimmerActive: false })}
                                            >
                                                <Image alt={'video-thumbnail'} src={videoInfo.thumbnail} size='huge' />
                                                <Dimmer.Inner active={this.state.dimmerActive ? true : undefined} as='a' href={'https://www.youtube.com/watch?v=' + videoInfo.videoId} target='_blank'>
                                                    <Icon name='youtube' color='red' size='huge' />
                                                </Dimmer.Inner>
                                            </Dimmer.Dimmable>

                                        </Grid>
                                        <Grid item xs={12}>

                                            <Card.Content style={{ padding: '1rem', textAlign: 'start' }}>

                                                <Card.Header>
                                                    {videoInfo.title}
                                                </Card.Header>
                                                <Card.Meta style={{ paddingTop: '0.5em' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: 'fit-content' }}>
                                                        <a target='_blank' href={videoInfo.author.user_url}>
                                                            <Image avatar size='large' src={videoInfo.author.thumbnails.length ? videoInfo.author.thumbnails.slice(-1)[0].url : '/not_found.jpg'} />
                                                        </a>
                                                        <div>
                                                            <Header size='tiny'>
                                                                <Header.Content as='a' target='_blank' href={videoInfo.author.user_url}>
                                                                    {videoInfo.author.name} {videoInfo.author.verified ? <Icon name='check circle' /> : null}
                                                                </Header.Content>
                                                                <Header.Subheader content={formatNumber(videoInfo.author.subscriber_count) + ' subscribers'} />
                                                            </Header>
                                                        </div>
                                                    </div>
                                                </Card.Meta>

                                            </Card.Content>
                                        </Grid>
                                    </Grid>

                                    <Grid container
                                        style={{
                                            borderBottom:'1px solid #fff',
                                            backgroundColor: '#713264',
                                            marginTop: '0px',
                                            marginLeft: '0px',
                                            color: '#fff',
                                            padding: '1rem',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>

                                        <Grid item sm={4}>
                                            <b><Icon name='clock' /> {videoInfo.length}</b>
                                        </Grid>
                                        <Grid item sm={4}>
                                            <Modal
                                                trigger={
                                                    <Label data-tooltip='Description' as='a' icon={<Icon name='file text' fitted />} basic />
                                                }
                                                open={this.state.descriptionModal}
                                                onClose={() => this.setState({ descriptionModal: false })}
                                                onOpen={() => this.setState({ descriptionModal: true })}
                                            >
                                                <Header>Description</Header>
                                                <Modal.Content style={{ whiteSpace: "pre-line" }}>
                                                    {videoInfo.shortDescription}<br /><br />
                                                    {videoInfo.keywords && videoInfo.keywords.length ? <Label.Group>
                                                        {videoInfo.keywords.map((keyword, index) => {
                                                            return <Label key={index}><Icon name='hashtag' /> {keyword}</Label>
                                                        })}
                                                    </Label.Group> : null}
                                                </Modal.Content>
                                                <Modal.Actions>
                                                    <Button onClick={() => this.setState({ descriptionModal: false })} icon labelPosition='right'>
                                                        <Icon name='remove' /> Close
                                                    </Button>
                                                </Modal.Actions>
                                            </Modal>
                                        </Grid>
                                        <Grid item sm={4}>
                                            <b><Icon name='eye' /> {videoInfo.viewCount}</b>
                                        </Grid>
                                    </Grid>

                                </Grid>
                                <Grid item lg={6} xs={12}>
                                    <Grid container style={{
                                        borderTop:'1px solid #fff',
                                        marginTop: '0px',
                                        backgroundColor: '#713264',
                                        color: '#fff',
                                        width: '100%',
                                        marginLeft: '0',
                                        padding: '1rem',
                                        display:'flex',
                                        justifyContent: 'space-between'
                                    }}>
                                        <Grid item xs={6} style={{  textAlign: 'start' }}>
                                            <h2>Videos</h2>
                                        </Grid>
                                        <Grid item xs={6} style={{  textAlign: 'end' }}>
                                            <h2>Audios</h2>
                                        </Grid>
                                    </Grid>
                                    {downloadingPercentage !== null ?
                                        <Progress percent={downloadingPercentage} progress color='green' style={{ margin: '1.5em' }} size='small' success={downloadingPercentage === 100}>
                                            {downloadingPercentage === 100 ? 'Completed' : 'Please Wait'}
                                        </Progress> : null}

                                    {completedProgress !== null ?
                                        <Progress percent={completedProgress} progress color='blue' style={{ margin: '1.5em' }} size='small' success={completedProgress === 100}>
                                            {completedProgress === 100 ? 'Completed' : 'Merging please wait...'}
                                        </Progress> : null}


                                    <Card.Description>
                                        <div style={{
                                            display: 'flex',
                                            flexWrap: 'Wrap',
                                            justifyContent: 'space-between',
                                            padding: '2rem'
                                        }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <div style={{ display: 'flex', flexWrap: 'Wrap' }}>
                                                    {videoInfo.formats.map((item, index) => (
                                                        (item.mimeType.includes('video/mp4') || item.mimeType.includes('video/webm')) && (
                                                            <div key={index} style={{ marginTop: '2rem' }}>
                                                                <Button
                                                                    as='div'
                                                                    labelPosition='left'
                                                                    data-tooltip={'Size: ' + formatFileSize(item.contentLength)}
                                                                    data-position='top right'
                                                                    data-inverted
                                                                >
                                                                    <Button
                                                                        style={{
                                                                            borderTopLeftRadius: '5px',
                                                                            borderBottomLeftRadius: '5px',
                                                                            borderTopRightRadius: '0px',
                                                                            borderBottomRightRadius: '0px'
                                                                        }}
                                                                        icon
                                                                        basic
                                                                        color='black'
                                                                        disabled={downloadingPercentage !== null}

                                                                        onClick={() =>
                                                                            onDownload(
                                                                                item.itag,
                                                                                formatMimeType(item.mimeType),
                                                                                item.qualityLabel,
                                                                                item.contentLength,
                                                                                "video",
                                                                                item.url,
                                                                                videoInfo.title

                                                                            )
                                                                        }
                                                                        loading={Boolean(item.isDownloading)}
                                                                    >
                                                                        <Icon name='download' />
                                                                    </Button>

                                                                    <Label
                                                                        color='black'
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            cursor: 'auto',
                                                                            width: '120px',
                                                                            borderTopLeftRadius: '0px',
                                                                            borderBottomLeftRadius: '0px',
                                                                            borderTopRightRadius: '5px',
                                                                            borderBottomRightRadius: '5px',
                                                                            backgroundColor: '#401e39 !important'
                                                                        }}>
                                                                        {item.qualityLabel + ' - ' + item.container}
                                                                        {item.qualityLabel === '720p' ? (
                                                                            <HDSvg
                                                                                alt={'hd-svg-icon'}
                                                                                style={{ width: '20px', height: '15px', alignSelf: 'start' }}
                                                                            />
                                                                        ) : null}
                                                                    </Label>
                                                                </Button>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                                <div style={{ flex: 1 }}>

                                                    {videoInfo.formats.map((item, index) => (
                                                        !item.mimeType.includes('video/mp4') && !item.mimeType.includes('video/webm') && (
                                                            <div key={index} style={{ marginTop: '2rem' }}>
                                                                <Button
                                                                    as='div'
                                                                    labelPosition='left'
                                                                    data-tooltip={'Size: ' + formatFileSize(item.contentLength)}
                                                                    data-position='top right'
                                                                    data-inverted
                                                                >


                                                                    <Button
                                                                        style={{
                                                                            borderTopLeftRadius: '5px',
                                                                            borderBottomLeftRadius: '5px',
                                                                            borderTopRightRadius: '0px',
                                                                            borderBottomRightRadius: '0px'
                                                                        }}
                                                                        icon
                                                                        basic
                                                                        color='black'
                                                                        disabled={downloadingPercentage !== null}
                                                                        onClick={() =>
                                                                            onDownload(
                                                                                item.itag,
                                                                                formatMimeType(item.mimeType),
                                                                                item.qualityLabel,
                                                                                item.contentLength
                                                                            )
                                                                        }
                                                                        loading={Boolean(item.isDownloading)}
                                                                    >
                                                                        <Icon name='download' />
                                                                    </Button>
                                                                    <Label
                                                                        color='black'
                                                                        style={{
                                                                            fontSize: '12px',
                                                                            cursor: 'auto',
                                                                            width: '120px',
                                                                            borderTopLeftRadius: '0px',
                                                                            borderBottomLeftRadius: '0px',
                                                                            borderTopRightRadius: '5px',
                                                                            borderBottomRightRadius: '5px'
                                                                        }}>
                                                                        {item.qualityLabel === null ? 'Audio' + ' - ' + item.container : item.qualityLabel + ' - ' + item.container}
                                                                    </Label>
                                                                </Button>
                                                            </div>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </Card.Description>
                                    <Card.Content extra>
                                    </Card.Content>
                                </Grid>
                            </Grid>
                        </Card>
                    </Grid >
                </Grid >
            </Box >

        ) : null
    }
}
