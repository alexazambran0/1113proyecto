const express = require('express')
const path = require('path')
const { SerialPort } = require('serialport')
const { ReadlineParser } = require('@serialport/parser-readline')

const app = express()
const PORT = Number(process.env.PORT) || 3000
const BAUD_RATE = Number(process.env.ARDUINO_BAUD_RATE) || 9600
const ARDUINO_PORT = process.env.ARDUINO_PORT
const DURACION_DISPENSADO_MS = 2000

let lecturaActual = {
  nivel: null,
  estado_motor: 'OFF',
  conectado: false,
  mensaje: 'Esperando conexion con Arduino',
  timestamp: new Date().toISOString()
}

const historial = [lecturaActual]
const clientesEventos = new Set()
const horarios = []
let puerto = null
let temporizadorDispensado = null
let dispensadoEnCurso = false
let proximoHorarioId = 1

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

function normalizarEstadoMotor(estado) {
  return estado === 'ON' || estado === 'OFF' ? estado : lecturaActual.estado_motor
}

function limpiarDispensadoManual() {
  if (temporizadorDispensado) clearTimeout(temporizadorDispensado)
  temporizadorDispensado = null
  dispensadoEnCurso = false
}

function publicarHorarios() {
  publicarEvento('schedules', horarios)
}

function horaValida(hora) {
  return typeof hora === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(hora)
}

function fechaLocal(fecha) {
  return fecha.toLocaleDateString('en-CA')
}

function iniciarDispensado(origen, onResult) {
  if (dispensadoEnCurso) {
    onResult({ status: 409, error: 'Ya hay un dispensado en curso' })
    return
  }

  if (!puerto || !puerto.isOpen) {
    onResult({ status: 503, error: 'Arduino desconectado' })
    return
  }

  dispensadoEnCurso = true

  puerto.write('feed_2000\n', (error) => {
    if (error) {
      dispensadoEnCurso = false
      onResult({ status: 500, error: error.message })
      return
    }

    publicarEvento('feed', { origen, estado: 'iniciado', duracion_ms: DURACION_DISPENSADO_MS, timestamp: new Date().toISOString() })

    temporizadorDispensado = setTimeout(() => {
      temporizadorDispensado = null
      dispensadoEnCurso = false
      if (puerto && puerto.isOpen) puerto.write('motor_off\n')
      publicarEvento('feed', { origen, estado: 'finalizado', duracion_ms: DURACION_DISPENSADO_MS, timestamp: new Date().toISOString() })
    }, DURACION_DISPENSADO_MS)

    onResult(null, { ok: true, comando: 'feed_2000', duracion_ms: DURACION_DISPENSADO_MS })
  })
}

function revisarHorarios() {
  const ahora = new Date()
  const horaActual = ahora.toTimeString().slice(0, 5)
  const marcaMinuto = `${fechaLocal(ahora)} ${horaActual}`

  horarios.forEach((horario) => {
    if (horario.hora !== horaActual || horario.ultimo_disparo === marcaMinuto) return

    if (dispensadoEnCurso) {
      horario.ultimo_disparo = marcaMinuto
      publicarEvento('feed', { origen: 'programado', estado: 'omitido', hora: horario.hora, motivo: 'dispensado en curso', timestamp: ahora.toISOString() })
      return
    }

    iniciarDispensado('programado', (error) => {
      if (error) {
        horario.ultimo_disparo = marcaMinuto
        publicarEvento('feed', { origen: 'programado', estado: 'error', hora: horario.hora, error: error.error, timestamp: new Date().toISOString() })
        return
      }

      horario.ultimo_disparo = marcaMinuto
      publicarEvento('feed', { origen: 'programado', estado: 'ejecutado', hora: horario.hora, duracion_ms: DURACION_DISPENSADO_MS, timestamp: new Date().toISOString() })
    })
  })
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
          estado_motor: normalizarEstadoMotor(dato.estado_motor),
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
      limpiarDispensadoManual()
      guardarLectura({ conectado: false, mensaje: 'Conexion serial cerrada' })
      setTimeout(conectarArduino, 3000)
    })
  } catch (error) {
    guardarLectura({ conectado: false, mensaje: `Error detectando Arduino: ${error.message}` })
    setTimeout(conectarArduino, 3000)
  }
}

function enviarComandoArduino(comando, res, onSuccess) {
  if (!puerto || !puerto.isOpen) {
    res.status(503).json({ ok: false, error: 'Arduino desconectado' })
    return
  }

  puerto.write(`${comando}\n`, (error) => {
    if (error) {
      res.status(500).json({ ok: false, error: error.message })
      return
    }

    if (onSuccess) onSuccess()
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
  res.write(`event: schedules\ndata: ${JSON.stringify(horarios)}\n\n`)

  req.on('close', () => {
    clientesEventos.delete(res)
  })
})

app.get('/api/schedules', (req, res) => {
  res.json(horarios)
})

app.post('/api/schedules', (req, res) => {
  const hora = req.body && req.body.hora

  if (!horaValida(hora)) {
    res.status(400).json({ ok: false, error: 'Hora invalida. Usa HH:MM.' })
    return
  }

  if (horarios.some((horario) => horario.hora === hora)) {
    res.status(409).json({ ok: false, error: 'Ese horario ya existe.' })
    return
  }

  const horario = { id: proximoHorarioId++, hora, ultimo_disparo: null }
  horarios.push(horario)
  horarios.sort((a, b) => a.hora.localeCompare(b.hora))
  publicarHorarios()
  res.status(201).json(horario)
})

app.delete('/api/schedules/:id', (req, res) => {
  const id = Number(req.params.id)
  const indice = horarios.findIndex((horario) => horario.id === id)

  if (indice === -1) {
    res.status(404).json({ ok: false, error: 'Horario no encontrado.' })
    return
  }

  horarios.splice(indice, 1)
  publicarHorarios()
  res.json({ ok: true })
})

app.post('/api/motor', (req, res) => {
  const accion = req.body && req.body.accion

  if (accion === 'encender') {
    if (dispensadoEnCurso) {
      res.status(409).json({ ok: false, error: 'Hay un dispensado en curso. Espera que termine o usa Apagar motor.' })
      return
    }

    enviarComandoArduino('motor_on', res)
    return
  }

  if (accion === 'apagar') {
    enviarComandoArduino('motor_off', res, limpiarDispensadoManual)
    return
  }

  res.status(400).json({ ok: false, error: 'Accion invalida. Usa encender o apagar.' })
})

app.post('/api/feed/manual', (req, res) => {
  iniciarDispensado('manual', (error, data) => {
    if (error) {
      res.status(error.status).json({ ok: false, error: error.error })
      return
    }

    res.json(data)
  })
})

setInterval(revisarHorarios, 1000)

app.listen(PORT, () => {
  console.log(`Servidor listo en http://localhost:${PORT}`)
  conectarArduino()
})
