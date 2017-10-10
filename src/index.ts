import { Recorder } from './core/recorder'
import { Ticker } from './utils/ticker'

const startRecordBtn = <HTMLButtonElement> document.getElementById('start-record-btn')
const stopRecordBtn = <HTMLButtonElement> document.getElementById('stop-record-btn')

const recordingHint = <HTMLElement> document.getElementById('recording-hint')
const encodingHint = <HTMLElement> document.getElementById('encoding-hint')

const recorder = new Recorder({
  width: 853,
  height: 480,
  fps: 10,
  videoElement: <HTMLVideoElement> document.getElementById('app-video')
})

recorder.on('encordingFinished', () => {
  hideAllHint()
  recorder.downloadGif()
})

// Attach events.
startRecordBtn.addEventListener('click', () => {
  recorder.startRecord()
  showRecordingHint()
})

stopRecordBtn.addEventListener('click', () => {
  recorder.stopRecord()
  hideAllHint()
  showEncodingHint()
})

function showRecordingHint () {
  recordingHint.style.display = 'block'
}

function showEncodingHint () {
  encodingHint.style.display = 'block'
}

function hideAllHint () {
  recordingHint.style.display = 'none'
  encodingHint.style.display = 'none'
}
