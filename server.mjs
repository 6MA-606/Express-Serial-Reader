import express from 'express'
import { SerialPort } from 'serialport'
import { Server } from 'socket.io'
import http from 'http'
import path from 'path'

const app = express()
const server = http.createServer(app)
const io = new Server(server)

const __dirname = path.resolve();

// Replace with your actual serial port name
const portName = 'COM3'; // This might differ on your system

const serialPort = new SerialPort({
  path: portName,
  baudRate: 9600
})

serialPort.on('open', () => {
  console.log('Serial port opened');
});

let lastData = 0
serialPort.on('data', (data) => {
  // You can optionally process the data here before sending it to the client
  const rawData = data.toString().split('\n')
  const newData = parseInt(rawData[Math.floor(rawData.length / 2)])

  if (isNaN(newData)) {
    return
  }

  if (Math.abs(newData - lastData) <= 5) {
    return
  }

  lastData = newData
  const message = lastData

  io.emit('serialData', message)
});

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Serve static files from the public directory
app.use(express.static('public'));   


server.listen(3000, () => {
  console.log('Server listening on port 3000');
});