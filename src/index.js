/**
 * @class Recorder
 */

import React, {Component} from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import vmsg from './vmsg'

import micIcon from './mic-icon-white.svg'
import stopIcon from './stop-icon-white.svg'
import wasmURL from './vmsg.wasm'

import styles from './styles.css'

const shimURL = 'https://unpkg.com/wasm-polyfill.js@0.2.0/wasm-polyfill.js'

export default class Recorder extends Component {
    static propTypes = {
        recorderParams: PropTypes.object,
        onRecordingStart: PropTypes.func,
        onRecordingComplete: PropTypes.func,
        onRecordingError: PropTypes.func,
        className: PropTypes.string
    }

    static defaultProps = {
        recorderParams: {},
        onRecordingStart:() => {
        },
        onRecordingComplete: () => {
        },
        onRecordingError: () => {
        }
    }

    state = {
        isRecording: false
    }

    _recorder = null

    componentWillUnmount() {
        this._cleanup()
    }

    render() {
        const {
            recorderParams,
            onRecordingStart,
            onRecordingComplete,
            onRecordingError,
            className,
            ...rest
        } = this.props

        let icon = this.state.isRecording ? stopIcon : micIcon;
        let btnClass = this.state.isRecording ? styles.activeButton : styles.button;

        return (
            <div
                className={classNames(styles.container, className)}
                {...rest}
            >
                <div
                    className={btnClass}
                    onMouseDown={this._onMouseDown}
                >
                    <img src={icon} width={24} height={24}/>
                </div>
            </div>
        )
    }

    _cleanup() {
        if (this._recorder) {
            this._recorder.stopRecording()
            this._recorder.close()
            delete this._recorder
        }
    }

    _onMouseDown = () => {
        if (this.state.isRecording) {
            // stop recording
            if (this._recorder) {
                this.setState({isRecording: false});

                this._recorder.stopRecording()
                    .then((blob) => this.props.onRecordingComplete(blob))
                    .catch((err) => this.props.onRecordingError(err))
            }
        } else {
            // start recording
            const {
                recorderParams
            } = this.props;

            this._cleanup();

            this._recorder = new vmsg.Recorder({
                wasmURL,
                shimURL,
                ...recorderParams
            });

            this._recorder.init()
                .then(() => {
                    this._recorder.startRecording();
                    this.props.onRecordingStart();

                    this.setState({isRecording: true})
                })
                .catch((err) => this.props.onRecordingError(err))
        }
    };
}
