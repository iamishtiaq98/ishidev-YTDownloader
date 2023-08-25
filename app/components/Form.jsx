import React, { Component } from 'react'
import { Grid, Icon, Form as SemanticForm } from 'semantic-ui-react'
import Shape3 from '../assets/img/shape/3.png'
import Image from 'next/image';
export default class Form extends Component {
    render() {
        const { isSearching, videoUrlError, onChangeInput, onSearch } = this.props;
        return (
            <>
                <Grid.Row style={{ padding: '3rem' }}>
                    <Grid.Column width={12}>
                        <div className='section-title' style={{ position: 'relative' }}>
                            <h5 className="subtitle line-theme-color">ishi Dev YT-Downloader</h5>
                            <h4 className="title title-style">Download any YouTube video in all available qualities and formats!
                                <Image style={{
                                    position: 'absolute',
                                    margin: '0 auto',
                                    left: 0,
                                    right: 0,
                                    top: '-27px',
                                    bottom: 0,
                                    height: '130px',
                                    width: '150px',
                                    zIndex: '-1'
                                }}
                                    className="img-shape" src={Shape3} alt="Image-Givest" /></h4>
                        </div>

                    </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                    <Grid.Column width={12}>

                        <SemanticForm>
                            <SemanticForm.Input fluid placeholder='Video URL or ID'
                                autoFocus
                                disabled={isSearching}
                                action={{
                                    icon: 'search',
                                    color: 'red',
                                    content: 'Search',
                                    labelPosition: 'right',
                                    size: 'small',
                                    loading: isSearching,
                                    onClick: onSearch
                                }}
                                maxLength={255}
                                icon={<Icon name='youtube' />}
                                iconPosition='left'
                                onChange={(event, { value }) => onChangeInput(value)}
                                error={videoUrlError ? {
                                    content: 'Invalid URL/ID.',
                                    pointing: 'below'
                                } : null}
                            />
                        </SemanticForm>
                    </Grid.Column>
                </Grid.Row>
            </>
        )
    }
}