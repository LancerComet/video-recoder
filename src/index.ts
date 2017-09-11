import { Ticker } from './libs/ticker'
import { Recorder } from './libs/recorder'

const appVideo = <HTMLVideoElement> document.getElementById('app-video')

const appCanvas = <HTMLCanvasElement> document.getElementById('app-canvas')
const context = <CanvasRenderingContext2D> appCanvas.getContext('2d')

const startRecordBtn = <HTMLButtonElement> document.getElementById('start-record-btn')
const stopRecordBtn = <HTMLButtonElement> document.getElementById('stop-record-btn')

const RECORDING_FPS = 10

const recorder = new Recorder(appCanvas)

// Attach events.
startRecordBtn.addEventListener('click', () => recorder.startRecord())
stopRecordBtn.addEventListener('click', () => recorder.stopRecord())

// Player video in canvas.
playVideoInCanvas()

// Play video in canvas.
function playVideoInCanvas () {
  const ticker = new Ticker(24, () => context.drawImage(appVideo, 0, 0))
  ticker.start()
}
