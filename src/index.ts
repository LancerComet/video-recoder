import { Recorder } from './core/recorder'
import { Ticker } from './utils/ticker'

const appVideo = <HTMLVideoElement> document.getElementById('app-video')

const appCanvas = <HTMLCanvasElement> document.getElementById('app-canvas')
const context = <CanvasRenderingContext2D> appCanvas.getContext('2d')

const startRecordBtn = <HTMLButtonElement> document.getElementById('start-record-btn')
const stopRecordBtn = <HTMLButtonElement> document.getElementById('stop-record-btn')

const recordingHint = <HTMLElement> document.getElementById('recording-hint')
const encodingHint = <HTMLElement> document.getElementById('encoding-hint')

const RECORDING_FPS = 10

const recorder = new Recorder({
  canvasElement: appCanvas,
  delay: RECORDING_FPS
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

// Player video in canvas.
playVideoInCanvas()

// Play video in canvas.
function playVideoInCanvas () {
  const ticker = new Ticker(60, () => context.drawImage(appVideo, 0, 0, appCanvas.width, appCanvas.height))
  ticker.start()
}

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
