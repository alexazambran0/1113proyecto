# Tarea 3 Äî Dashboard en Vivo + Control Motor desde Web

**Proyecto:** Comedero Autom√tico  
**Clase:** IoT + JavaScript  
**Nivel:** Intermedio - Avanzado

---

## üéØ Objetivo

Crear un dashboard que:
- úÖ Muestre **estado motor en tiempo real**
- úÖ Muestre **si Arduino est√° conectado**
- úÖ Tenga **bot√≥n para encender/apagar motor**
- úÖ Muestre **historial de eventos**
- úÖ Se actualice autom√°ticamente cada 2 segundos

---

## ö†Ô∏è PRE-REQUISITOS

- úÖ **Tarea 1:** Arduino enviando JSON
- úÖ **Tarea 2:** Backend leyendo serial real
- úÖ **Backend corriendo:** `npm start` funcionando

---

## üìù Actualizar frontend/index.html

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Comedero - Monitor en Vivo</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
      padding: 20px;
      min-height: 100vh;
    }
    
    main {
      max-width: 900px;
      margin: 0 auto;
    }
    
    h1 {
      color: white;
      margin-bottom: 20px;
      text-align: center;
      font-size: 32px;
    }
    
    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
    }
    
    .status-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .status-item {
      padding: 20px;
      border-radius: 8px;
      text-align: center;
    }
    
    .motor-status {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
    }
    
    .conexion-status {
      background: #f0fff4;
      border-left: 4px solid #48bb78;
    }
    
    .status-item h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }
    
    .estado-valor {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .motor-on {
      color: #48bb78;
    }
    
    .motor-off {
      color: #f56565;
    }
    
    .conectado {
      color: #48bb78;
    }
    
    .desconectado {
      color: #f56565;
    }
    
    .controles {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    button {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      transition: 0.3s;
    }
    
    .btn-encender {
      background: #48bb78;
      color: white;
    }
    
    .btn-encender:hover {
      background: #38a169;
    }
    
    .btn-apagar {
      background: #f56565;
      color: white;
    }
    
    .btn-apagar:hover {
      background: #e53e3e;
    }
    
    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .historial {
      margin-top: 20px;
    }
    
    .historial h2 {
      font-size: 18px;
      margin-bottom: 12px;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    thead {
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
    }
    
    th {
      padding: 12px;
      text-align: left;
      font-size: 14px;
      font-weight: 600;
      color: #666;
    }
    
    td {
      padding: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    
    tr:hover {
      background: #f7fafc;
    }
    
    .evento-label {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    
    .evento-lectura {
      background: #e6fffa;
      color: #234e52;
    }
    
    .evento-dispensado {
      background: #fff5e6;
      color: #7c2d12;
    }
    
    .evento-error {
      background: #ffe6e6;
      color: #742a2a;
    }
    
    .info-box {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      color: #555;
      margin-top: 12px;
    }
  </style>
</head>
<body>
  <main>
    <h1>üê± Comedero Autom√°tico</h1>
    
    <div class="card">
      <div class="status-container">
        <div class="status-item motor-status">
          <h3>Estado Motor</h3>
          <div class="estado-valor" id="motor-estado">
            <span class="motor-off">--</span>
          </div>
          <small id="motor-hora">√ltima actualizaci√≥n: --</small>
        </div>
        
        <div class="status-item conexion-status">
          <h3>Conexi√≥n Arduino</h3>
          <div class="estado-valor" id="conexion-estado">
            <span class="desconectado">--</span>
          </div>
          <small id="conexion-info">Verificando...</small>
        </div>
      </div>
      
      <div class="controles">
        <button class="btn-encender" id="btn-encender" onclick="encenderMotor()">
          Encender Motor
        </button>
        <button class="btn-apagar" id="btn-apagar" onclick="apagarMotor()">
          Apagar Motor
        </button>
      </div>
      
      <div class="info-box">
        üí° Use los botones para controlar el motor desde la web. El Arduino ejecutar√° el comando y reportar√° el cambio.
      </div>
    </div>
    
    <div class="card historial">
      <h2>üìä Historial de Eventos</h2>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Evento</th>
            <th>Estado Motor</th>
          </tr>
        </thead>
        <tbody id="tabla-historial">
          <tr><td colspan="3" style="text-align: center; color: #999;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  </main>
  
  <script src="app.js"></script>
</body>
</html>
```

---

## üìù Actualizar frontend/app.js

```js
// Estado global
let ultimaConexion = null;

// Funci√≥n para cargar y mostrar datos
async function cargarPanel() {
  try {
    // Obtener estado actual
    const statusRes = await fetch('/api/status');
    if (!statusRes.ok) throw new Error('No se pudo obtener status');
    const status = await statusRes.json();
    
    // Obtener historial
    const historyRes = await fetch('/api/history?limit=20');
    if (!historyRes.ok) throw new Error('No se pudo obtener historial');
    const history = await historyRes.json();
    
    // Obtener health (para saber conexi√≥n Arduino)
    const healthRes = await fetch('/api/health');
    if (!healthRes.ok) throw new Error('No se pudo obtener health');
    const health = await healthRes.json();
    
    // Actualizar UI
    renderizarEstado(status, health);
    renderizarHistorial(history);
    
    ultimaConexion = new Date();
    
  } catch (error) {
    console.error('Error cargando panel:', error);
    mostrarError('Error al conectar con el servidor');
  }
}

function renderizarEstado(status, health) {
  // Motor
  const motorEstado = document.getElementById('motor-estado');
  const motorHora = document.getElementById('motor-hora');
  
  const esMotorON = status.estado_motor === 'ON';
  motorEstado.innerHTML = `<span class="${esMotorON ? 'motor-on' : 'motor-off'}">
    ${esMotorON ? 'üü¢ ON' : 'üî¥ OFF'}
  </span>`;
  
  motorHora.textContent = `√ltima lectura: ${new Date(status.timestamp).toLocaleTimeString()}`;
  
  // Conexi√≥n Arduino
  const conexionEstado = document.getElementById('conexion-estado');
  const conexionInfo = document.getElementById('conexion-info');
  const esConectado = health.conexion_arduino === 'conectado';
  
  conexionEstado.innerHTML = `<span class="${esConectado ? 'conectado' : 'desconectado'}">
    ${esConectado ? 'úÖ Conectado' : '‚ùå Desconectado'}
  </span>`;
  
  conexionInfo.textContent = esConectado 
    ? `${health.lecturas_guardadas} lecturas registradas`
    : 'Verificar Arduino USB';
  
  // Deshabilitar botones si no hay conexi√≥n
  document.getElementById('btn-encender').disabled = !esConectado;
  document.getElementById('btn-apagar').disabled = !esConectado;
}

function renderizarHistorial(items) {
  const tbody = document.getElementById('tabla-historial');
  tbody.innerHTML = '';
  
  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #999;">Sin eventos a√∫n</td></tr>';
    return;
  }
  
  items.slice().reverse().forEach((item) => {
    const tr = document.createElement('tr');
    
    const hora = new Date(item.timestamp).toLocaleTimeString();
    const evento = item.evento || 'lectura';
    const estado = item.estado_motor || '--';
    
    let eventoLabel = 'evento-lectura';
    if (evento.includes('dispensado')) eventoLabel = 'evento-dispensado';
    else if (evento.includes('error')) eventoLabel = 'evento-error';
    
    tr.innerHTML = `
      <td>${hora}</td>
      <td><span class="evento-label ${eventoLabel}">${evento}</span></td>
      <td><strong>${estado}</strong></td>
    `;
    
    tbody.appendChild(tr);
  });
}

async function encenderMotor() {
  await enviarComando('motor_on', 'Encendiendo motor...');
}

async function apagarMotor() {
  await enviarComando('motor_off', 'Apagando motor...');
}

async function enviarComando(comando, mensaje) {
  try {
    console.log(mensaje);
    
    const res = await fetch('/api/feed/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando })
    });
    
    if (!res.ok) {
      throw new Error('No se pudo enviar comando');
    }
    
    const resultado = await res.json();
    console.log('úÖ Comando ejecutado:', resultado);
    
    // Recargar panel para ver cambios
    setTimeout(cargarPanel, 500);
    
  } catch (error) {
    console.error('ùå Error:', error);
    alert('Error al enviar comando. ¬øArduino conectado?');
  }
}

function mostrarError(mensaje) {
  const motorEstado = document.getElementById('motor-estado');
  motorEstado.innerHTML = `<span class="motor-off">ö†Ô∏è ${mensaje}</span>`;
}

// Cargar panel al inicio y cada 2 segundos
cargarPanel();
setInterval(cargarPanel, 2000);
```

---

## úÖ Verificaci√≥n

1. **Backend corriendo:** `npm start`
2. **Abran http://localhost:3000**
3. Deber√≠an ver:
   - úÖ Estado del motor (ON/OFF)
   - úÖ Estado de conexi√≥n Arduino
   - úÖ Botones funcionales
   - úÖ Historial actualiz√°ndose

4. **Hagan clic en "Encender Motor"**
   - Arduino deber√≠a girar el motor
   - Estado deber√≠a cambiar a "ON"
   - Se agregar√ evento al historial

---

## üéØ Mejorias opcionales

- Agregar indicador visual animado para motor encendido
- Mostrar duraci√≥n del motor encendido
- Agregar gr√fico de actividad
- Persistencia de historial en base de datos

---

## úèÔ∏è Entregable

1. **Dashboard funcionando** con Arduino real
2. **Captura del panel** mostrando estado motor y conexi√≥n
3. **Prueba de control:** hacer clic en botones y mostrar que motor se mueve
4. **Captura del historial** con eventos
5. **Breve explicaci√≥n:** c√≥mo fluyen comandos web Üí Arduino

