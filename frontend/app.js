function clasificarNivel(nivel) {
  if (typeof nivel !== 'number') return 'critico'
  if (nivel >= 40) return 'normal'
  if (nivel >= 20) return 'bajo'
  return 'critico'
}

let historial = []
let horarios = []

function renderEstado(data) {
  const estado = clasificarNivel(data.nivel)
  const badge = document.getElementById('estado-badge')
  const conectado = Boolean(data.conectado)

  document.getElementById('conexion').innerHTML = `Arduino: <span class="badge ${conectado ? 'conectado' : 'desconectado'}">${conectado ? 'conectado' : 'desconectado'}</span>`
  document.getElementById('nivel').textContent = `Nivel: ${typeof data.nivel === 'number' ? `${data.nivel}%` : 'sin sensor'}`
  document.getElementById('motor').textContent = `Motor: ${data.estado_motor}`
  document.getElementById('hora').textContent = `Ultima lectura: ${new Date(data.timestamp).toLocaleString()}`
  document.getElementById('mensaje').textContent = `Mensaje: ${data.mensaje || '--'}`

  badge.textContent = estado
  badge.className = `badge ${estado}`

  document.getElementById('btn-apagar').disabled = !conectado
  document.getElementById('btn-dispensar').disabled = !conectado
}

function renderHistorial(items) {
  const tbody = document.getElementById('tabla-historial')
  tbody.innerHTML = ''

  items.slice().reverse().forEach((item) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${new Date(item.timestamp).toLocaleTimeString()}</td>
      <td>${typeof item.nivel === 'number' ? `${item.nivel}%` : '--'}</td>
      <td>${item.estado_motor}</td>
    `
    tbody.appendChild(tr)
  })
}

function agregarLecturaHistorial(item) {
  const ultima = historial[historial.length - 1]
  if (ultima && ultima.timestamp === item.timestamp) return

  historial.push(item)
  if (historial.length > 20) historial.shift()
  renderHistorial(historial)
}

function renderHorarios(items) {
  const tbody = document.getElementById('tabla-horarios')
  const estado = document.getElementById('estado-horarios')
  tbody.innerHTML = ''

  if (!items.length) {
    estado.textContent = 'Sin horarios cargados.'
    return
  }

  estado.textContent = `${items.length} horario(s) programado(s).`

  items.forEach((horario) => {
    const tr = document.createElement('tr')
    tr.innerHTML = `
      <td>${horario.hora}</td>
      <td><button class="danger" type="button" data-id="${horario.id}">Eliminar</button></td>
    `
    tbody.appendChild(tr)
  })
}

async function cargarHorarios() {
  try {
    const res = await fetch('/api/schedules')
    if (!res.ok) throw new Error('Error de API')

    horarios = await res.json()
    renderHorarios(horarios)
  } catch (error) {
    document.getElementById('estado-horarios').textContent = `Error: ${error.message}`
  }
}

async function cargarPanel() {
  try {
    const [statusRes, historyRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/history?limit=20')
    ])

    if (!statusRes.ok || !historyRes.ok) throw new Error('Error de API')

    const status = await statusRes.json()
    historial = await historyRes.json()

    renderEstado(status)
    renderHistorial(historial)
  } catch (error) {
    console.error('No se pudo actualizar el panel:', error)
  }
}

async function enviarAccionMotor(accion) {
  const resultado = document.getElementById('resultado-comando')
  resultado.textContent = 'Enviando comando...'

  try {
    const res = await fetch('/api/motor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accion })
    })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'No se pudo enviar el comando')
    resultado.textContent = `Comando enviado: ${data.comando}`
  } catch (error) {
    resultado.textContent = `Error: ${error.message}`
  }
}

async function dispensarManual() {
  const resultado = document.getElementById('resultado-comando')
  resultado.textContent = 'Dispensando durante 2 segundos...'

  try {
    const res = await fetch('/api/feed/manual', { method: 'POST' })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'No se pudo dispensar')
    resultado.textContent = `Dispensado iniciado: ${data.duracion_ms} ms`
  } catch (error) {
    resultado.textContent = `Error: ${error.message}`
  }
}

async function agregarHorario(event) {
  event.preventDefault()

  const input = document.getElementById('hora-horario')
  const estado = document.getElementById('estado-horarios')
  estado.textContent = 'Agregando horario...'

  try {
    const res = await fetch('/api/schedules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hora: input.value })
    })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'No se pudo agregar')
    input.value = ''
    await cargarHorarios()
    estado.textContent = `Horario agregado: ${data.hora}`
  } catch (error) {
    estado.textContent = `Error: ${error.message}`
  }
}

async function eliminarHorario(id) {
  const estado = document.getElementById('estado-horarios')
  estado.textContent = 'Eliminando horario...'

  try {
    const res = await fetch(`/api/schedules/${id}`, { method: 'DELETE' })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'No se pudo eliminar')
    await cargarHorarios()
    estado.textContent = 'Horario eliminado.'
  } catch (error) {
    estado.textContent = `Error: ${error.message}`
  }
}

function conectarEventos() {
  const eventos = new EventSource('/api/events')

  eventos.addEventListener('status', (event) => {
    const data = JSON.parse(event.data)
    renderEstado(data)
    agregarLecturaHistorial(data)
  })

  eventos.addEventListener('schedules', (event) => {
    horarios = JSON.parse(event.data)
    renderHorarios(horarios)
  })

  eventos.addEventListener('feed', (event) => {
    const data = JSON.parse(event.data)
    if (data.origen === 'programado') {
      const detalle = data.error || data.motivo || `${data.duracion_ms || ''} ms`.trim()
      document.getElementById('estado-horarios').textContent = `Dispensado programado: ${data.estado}${detalle ? ` (${detalle})` : ''}`
    }
  })

  eventos.onerror = () => {
    document.getElementById('resultado-comando').textContent = 'Reconectando eventos en vivo...'
  }
}

document.getElementById('btn-apagar').addEventListener('click', () => enviarAccionMotor('apagar'))
document.getElementById('btn-dispensar').addEventListener('click', dispensarManual)
document.getElementById('form-horario').addEventListener('submit', agregarHorario)
document.getElementById('tabla-horarios').addEventListener('click', (event) => {
  if (event.target.tagName === 'BUTTON') eliminarHorario(event.target.dataset.id)
})

cargarPanel()
cargarHorarios()
conectarEventos()
