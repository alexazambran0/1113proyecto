function clasificarNivel(nivel) {
  if (typeof nivel !== 'number') return 'critico'
  if (nivel >= 40) return 'normal'
  if (nivel >= 20) return 'bajo'
  return 'critico'
}

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

  document.getElementById('btn-encender').disabled = !conectado
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

async function cargarPanel() {
  try {
    const [statusRes, historyRes] = await Promise.all([
      fetch('/api/status'),
      fetch('/api/history?limit=20')
    ])

    if (!statusRes.ok || !historyRes.ok) throw new Error('Error de API')

    const status = await statusRes.json()
    const history = await historyRes.json()

    renderEstado(status)
    renderHistorial(history)
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

function conectarEventos() {
  const eventos = new EventSource('/api/events')

  eventos.addEventListener('status', (event) => {
    renderEstado(JSON.parse(event.data))
  })

  eventos.onerror = () => {
    document.getElementById('resultado-comando').textContent = 'Reconectando eventos en vivo...'
  }
}

document.getElementById('btn-encender').addEventListener('click', () => enviarAccionMotor('encender'))
document.getElementById('btn-apagar').addEventListener('click', () => enviarAccionMotor('apagar'))
document.getElementById('btn-dispensar').addEventListener('click', dispensarManual)

cargarPanel()
conectarEventos()
