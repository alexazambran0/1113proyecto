const express = require('express')
const path = require('path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const BAUD_RATE = Number(process.env.ARDUINO_BAUD_RATE) || 9600
const ARDUINO_PORT = process.env.ARDUINO_PORT

let lecturaActual = {
  nivel: null,
  estado_motor: 'OFF',
  conectado: false,
  mensaje: 'Esperando conexion con Arduino',
  timestamp: new Date().toISOString()
}

const historial = [lecturaActual]
const clientesEventos = new Set()
let puerto = null

app.use(express.json())
app.use(express.static(path.join(__dirname, '../../frontend')))

function guardarLectura(parcial) {
  lecturaActual = {
    ...lecturaActual,
    ...parcial,
    timestamp: new Date().toISOString()
  }

  historial.push(lecturaActual)
  if (historial.length > 500) historial.shift()
  publicarEvento('status', lecturaActual)
}

function publicarEvento(evento, data) {
  const payload = `event: ${evento}\ndata: ${JSON.stringify(data)}\n\n`
  clientesEventos.forEach((cliente) => cliente.write(payload))
}

async function detectarPuertoArduino() {
  if (ARDUINO_PORT) return ARDUINO_PORT

  const puertos = await SerialPort.list()
  const arduino = puertos.find((p) => {
    const texto = `${p.manufacturer || ''} ${p.friendlyName || ''} ${p.path || ''}`.toLowerCase()
    return texto.includes('arduino') || texto.includes('ch340') || texto.includes('usb serial')
  })

  return arduino ? arduino.path : null
}

async function conectarArduino() {
  try {
    const rutaPuerto = await detectarPuertoArduino()

    if (!rutaPuerto) {
      guardarLectura({ conectado: false, mensaje: 'No se encontro Arduino. Define ARDUINO_PORT si hace falta.' })
      setTimeout(conectarArduino, 3000)
      return
    }

    puerto = new SerialPort({ path: rutaPuerto, baudRate: BAUD_RATE, autoOpen: false })
    const parser = puerto.pipe(new ReadlineParser({ delimiter: '\n' }))

    puerto.open((error) => {
      if (error) {
        guardarLectura({ conectado: false, mensaje: `No se pudo abrir ${rutaPuerto}: ${error.message}` })
        setTimeout(conectarArduino, 3000)
        return
      }

      guardarLectura({ conectado: true, mensaje: `Arduino conectado en ${rutaPuerto}` })
    })

    parser.on('data', (linea) => {
      try {
        const dato = JSON.parse(linea.trim())
        guardarLectura({
          nivel: typeof dato.nivel === 'number' ? dato.nivel : lecturaActual.nivel,
          estado_motor: dato.estado_motor === 'ON' ? 'ON' : 'OFF',
          conectado: true,
          mensaje: dato.evento || 'Lectura recibida'
        })
      } catch (error) {
        guardarLectura({ conectado: true, mensaje: `Dato serial invalido: ${linea.trim()}` })
      }
    })

    puerto.on('error', (error) => {
      guardarLectura({ conectado: false, mensaje: `Error serial: ${error.message}` })
    })

    puerto.on('close', () => {
      puerto = null
      guardarLectura({ conectado: false, mensaje: 'Conexion serial cerrada' })
      setTimeout(conectarArduino, 3000)
    })
  } catch (error) {
    guardarLectura({ conectado: false, mensaje: `Error detectando Arduino: ${error.message}` })
    setTimeout(conectarArduino, 3000)
  }
}

function enviarComandoArduino(comando, res) {
  if (!puerto || !puerto.isOpen) {
    res.status(503).json({ ok: false, error: 'Arduino desconectado' })
    return
  }

  puerto.write(`${comando}\n`, (error) => {
    if (error) {
      res.status(500).json({ ok: false, error: error.message })
      return
    }

    res.json({ ok: true, comando })
  })
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    servicio: 'activo',
    conexion_arduino: lecturaActual.conectado ? 'conectado' : 'desconectado',
    mensaje: lecturaActual.mensaje
  })
})

app.get('/api/status', (req, res) => {
  res.json(lecturaActual)
})

app.get('/api/history', (req, res) => {
  const limit = Number(req.query.limit) || 50
  res.json(historial.slice(-Math.max(1, Math.min(limit, 200))))
})

app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  clientesEventos.add(res)
  res.write(`event: status\ndata: ${JSON.stringify(lecturaActual)}\n\n`)

  req.on('close', () => {
    clientesEventos.delete(res)
  })
})

app.post('/api/motor', (req, res) => {
  const accion = req.body && req.body.accion

  if (accion === 'encender') {
    enviarComandoArduino('motor_on', res)
    return
  }

  if (accion === 'apagar') {
    enviarComandoArduino('motor_off', res)
    return
  }

  res.status(400).json({ ok: false, error: 'Accion invalida. Usa encender o apagar.' })
})

app.post('/api/feed/manual', (req, res) => {
  enviarComandoArduino('motor_on', {
    status: (code) => ({ json: (body) => res.status(code).json(body) }),
    json: (body) => {
      setTimeout(() => {
        if (puerto && puerto.isOpen) puerto.write('motor_off\n')
      }, 2000)
      res.json({ ...body, duracion_ms: 2000 })
    }
  })
})

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`)
  conectarArduino()
})
