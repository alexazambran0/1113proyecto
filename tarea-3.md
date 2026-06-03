# Tarea 3 - Conexion del Motor TT y Dashboard en Vivo

**Proyecto:** Comedero Automatico
**Clase:** IoT + JavaScript
**Nivel:** Intermedio - Avanzado

---

## Objetivo

En esta tarea vas a:

1. Conectar fisicamente el motor TT amarillo al Arduino usando el modulo L298N
2. Programar el Arduino para recibir comandos desde el computador
3. Crear un dashboard web que controle el motor en tiempo real

---

## PARTE 1 - Conexion fisica del hardware

### Materiales necesarios

- Arduino Uno
- Modulo L298N (el rojo con disipador de calor)
- Motor TT amarillo (motor DC con caja reductora)
- Fuente externa de 5V o bateria de 9V
- Cables jumper
- Protoboard

---

### Como funciona el L298N

El L298N es un puente H. Esto significa que puede controlar la direccion y velocidad de un motor DC. El Arduino no puede alimentar el motor directamente porque no tiene suficiente corriente. El L298N hace de intermediario: el Arduino le dice que hacer y el L298N le entrega la corriente al motor.

```
Arduino --> L298N --> Motor TT
(senales)   (potencia)  (gira)
```

---

### Diagrama de conexion

```
MOTOR TT          L298N            ARDUINO UNO
---------         -----            -----------
Cable A  ------>  OUT1
Cable B  ------>  OUT2

                  IN1  <---------  Pin 8
                  IN2  <---------  Pin 9
                  ENA  <---------  Pin 3 (PWM)

                  VCC  <---------  Fuente externa 5V-9V
                  GND  <---------  GND Arduino
                  GND  <---------  GND fuente externa
                  5V   ---------> 5V Arduino (solo si el L298N tiene jumper de 5V)
```

---

### Paso a paso de la conexion

**Paso 1 - Conectar el motor al L298N:**
- El motor TT tiene dos cables (no importa el color)
- Un cable va a OUT1 del L298N
- El otro cable va a OUT2 del L298N

**Paso 2 - Conectar L298N al Arduino:**
- IN1 del L298N --> Pin 8 del Arduino
- IN2 del L298N --> Pin 9 del Arduino
- ENA del L298N --> Pin 3 del Arduino (este pin es PWM, controla velocidad)

**Paso 3 - Alimentacion:**
- La fuente externa (o bateria 9V) --> VCC del L298N
- GND de la fuente --> GND del L298N
- GND del Arduino --> GND del L298N (tierra comun, muy importante)
- Si el L298N tiene el jumper del regulador puesto, el pin 5V del L298N --> 5V Arduino

**Advertencia:** El GND del Arduino y el GND de la fuente externa SIEMPRE deben estar conectados entre si. Si no, el motor no funciona.

---

### Como controlar el motor con IN1 e IN2

| IN1 | IN2 | Resultado       |
|-----|-----|-----------------|
| HIGH| LOW | Motor gira      |
| LOW | HIGH| Motor gira al reves |
| LOW | LOW | Motor frenado   |
| HIGH| HIGH| Motor frenado   |

Para el comedero solo necesitamos girar en una direccion (dispensar comida).

---

## PARTE 2 - Codigo del Arduino

Crea un archivo llamado `comedero.ino` y copia este codigo:

```cpp
// Pines del L298N
const int IN1 = 8;
const int IN2 = 9;
const int ENA = 3;  // Pin PWM para velocidad

// Estado del motor
bool motorEncendido = false;

void setup() {
  Serial.begin(9600);

  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENA, OUTPUT);

  // Motor apagado al inicio
  apagarMotor();

  Serial.println("Arduino listo. Esperando comandos...");
}

void loop() {
  // Leer comando desde el computador (Node.js)
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "motor_on") {
      encenderMotor();
    } else if (comando == "motor_off") {
      apagarMotor();
    }
  }

  // Enviar estado actual cada 500ms
  enviarEstado();
  delay(500);
}

void encenderMotor() {
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 200);  // Velocidad: 0-255
  motorEncendido = true;
  Serial.println("{\"estado_motor\":\"ON\",\"evento\":\"motor_encendido\"}");
}

void apagarMotor() {
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  analogWrite(ENA, 0);
  motorEncendido = false;
  Serial.println("{\"estado_motor\":\"OFF\",\"evento\":\"motor_apagado\"}");
}

void enviarEstado() {
  String estado = motorEncendido ? "ON" : "OFF";
  Serial.println("{\"estado_motor\":\"" + estado + "\",\"evento\":\"lectura\"}");
}
```

**Como subir el codigo al Arduino:**
1. Abre el Arduino IDE
2. Pega el codigo
3. Selecciona la placa: Tools > Board > Arduino Uno
4. Selecciona el puerto: Tools > Port > (el que aparezca, normalmente COM3 o COM4)
5. Haz clic en la flecha de subir (Upload)
6. Abre el Monitor Serial (9600 baudios) y verifica que lleguen mensajes JSON

---

## PARTE 3 - Backend Node.js

El backend ya viene de la Tarea 2. Solo verifica que en `backend/src/app.js` el puerto serial sea el correcto.

Busca esta linea:

```js
const port = new SerialPort({ path: 'COM3', baudRate: 9600 });
```

Cambia `COM3` por el puerto donde tienes el Arduino conectado. Para saber cual es:
- En Windows: abre el Administrador de dispositivos > Puertos COM
- En Linux/Mac: escribe en terminal `ls /dev/tty*`

---

## PARTE 4 - Frontend (Dashboard)

Reemplaza el contenido de `frontend/index.html` con esto:

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

    main { max-width: 900px; margin: 0 auto; }

    h1 { color: white; margin-bottom: 20px; text-align: center; font-size: 32px; }

    .card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 8px 16px rgba(0,0,0,0.1);
    }

    .status-container {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }

    .status-item { padding: 20px; border-radius: 8px; text-align: center; }
    .motor-status { background: #f0f4ff; border-left: 4px solid #667eea; }
    .conexion-status { background: #f0fff4; border-left: 4px solid #48bb78; }

    .status-item h3 {
      font-size: 14px;
      text-transform: uppercase;
      color: #666;
      margin-bottom: 10px;
    }

    .estado-valor { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
    .motor-on { color: #48bb78; }
    .motor-off { color: #f56565; }
    .conectado { color: #48bb78; }
    .desconectado { color: #f56565; }

    .controles { display: flex; gap: 10px; margin-top: 20px; }

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

    .btn-encender { background: #48bb78; color: white; }
    .btn-encender:hover { background: #38a169; }
    .btn-apagar { background: #f56565; color: white; }
    .btn-apagar:hover { background: #e53e3e; }
    button:disabled { opacity: 0.5; cursor: not-allowed; }

    .info-box {
      background: #f0f4ff;
      border-left: 4px solid #667eea;
      padding: 12px;
      border-radius: 4px;
      font-size: 13px;
      color: #555;
      margin-top: 12px;
    }

    table { width: 100%; border-collapse: collapse; }
    thead { background: #f7fafc; border-bottom: 2px solid #e2e8f0; }
    th { padding: 12px; text-align: left; font-size: 14px; font-weight: 600; color: #666; }
    td { padding: 12px; border-bottom: 1px solid #e2e8f0; }
    tr:hover { background: #f7fafc; }

    .evento-label {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }
    .evento-lectura { background: #e6fffa; color: #234e52; }
    .evento-dispensado { background: #fff5e6; color: #7c2d12; }
    .evento-error { background: #ffe6e6; color: #742a2a; }
  </style>
</head>
<body>
  <main>
    <h1>Comedero Automatico</h1>

    <div class="card">
      <div class="status-container">
        <div class="status-item motor-status">
          <h3>Estado Motor</h3>
          <div class="estado-valor" id="motor-estado">
            <span class="motor-off">--</span>
          </div>
          <small id="motor-hora">Ultima actualizacion: --</small>
        </div>

        <div class="status-item conexion-status">
          <h3>Conexion Arduino</h3>
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
        Use los botones para controlar el motor desde la web. El Arduino ejecutara el comando y reportara el cambio.
      </div>
    </div>

    <div class="card">
      <h2 style="margin-bottom:12px;">Historial de Eventos</h2>
      <table>
        <thead>
          <tr>
            <th>Hora</th>
            <th>Evento</th>
            <th>Estado Motor</th>
          </tr>
        </thead>
        <tbody id="tabla-historial">
          <tr><td colspan="3" style="text-align:center;color:#999;">Cargando...</td></tr>
        </tbody>
      </table>
    </div>
  </main>

  <script src="app.js"></script>
</body>
</html>
```

Reemplaza el contenido de `frontend/app.js` con esto:

```js
let ultimaConexion = null;

async function cargarPanel() {
  try {
    const statusRes = await fetch('/api/status');
    if (!statusRes.ok) throw new Error('Sin status');
    const status = await statusRes.json();

    const historyRes = await fetch('/api/history?limit=20');
    if (!historyRes.ok) throw new Error('Sin historial');
    const history = await historyRes.json();

    const healthRes = await fetch('/api/health');
    if (!healthRes.ok) throw new Error('Sin health');
    const health = await healthRes.json();

    renderizarEstado(status, health);
    renderizarHistorial(history);
    ultimaConexion = new Date();

  } catch (error) {
    console.error('Error cargando panel:', error);
    mostrarError('Error al conectar con el servidor');
  }
}

function renderizarEstado(status, health) {
  const motorEstado = document.getElementById('motor-estado');
  const motorHora = document.getElementById('motor-hora');
  const esMotorON = status.estado_motor === 'ON';

  motorEstado.innerHTML = `<span class="${esMotorON ? 'motor-on' : 'motor-off'}">${esMotorON ? 'ON' : 'OFF'}</span>`;
  motorHora.textContent = `Ultima lectura: ${new Date(status.timestamp).toLocaleTimeString()}`;

  const conexionEstado = document.getElementById('conexion-estado');
  const conexionInfo = document.getElementById('conexion-info');
  const esConectado = health.conexion_arduino === 'conectado';

  conexionEstado.innerHTML = `<span class="${esConectado ? 'conectado' : 'desconectado'}">${esConectado ? 'Conectado' : 'Desconectado'}</span>`;
  conexionInfo.textContent = esConectado
    ? `${health.lecturas_guardadas} lecturas registradas`
    : 'Verificar cable USB del Arduino';

  document.getElementById('btn-encender').disabled = !esConectado;
  document.getElementById('btn-apagar').disabled = !esConectado;
}

function renderizarHistorial(items) {
  const tbody = document.getElementById('tabla-historial');
  tbody.innerHTML = '';

  if (items.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;color:#999;">Sin eventos aun</td></tr>';
    return;
  }

  items.slice().reverse().forEach((item) => {
    const tr = document.createElement('tr');
    const hora = new Date(item.timestamp).toLocaleTimeString();
    const evento = item.evento || 'lectura';
    const estado = item.estado_motor || '--';

    let clase = 'evento-lectura';
    if (evento.includes('dispensado') || evento.includes('encendido')) clase = 'evento-dispensado';
    else if (evento.includes('error')) clase = 'evento-error';

    tr.innerHTML = `
      <td>${hora}</td>
      <td><span class="evento-label ${clase}">${evento}</span></td>
      <td><strong>${estado}</strong></td>
    `;
    tbody.appendChild(tr);
  });
}

async function encenderMotor() {
  await enviarComando('motor_on');
}

async function apagarMotor() {
  await enviarComando('motor_off');
}

async function enviarComando(comando) {
  try {
    const res = await fetch('/api/feed/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comando })
    });

    if (!res.ok) throw new Error('Fallo al enviar comando');

    setTimeout(cargarPanel, 500);

  } catch (error) {
    console.error('Error:', error);
    alert('No se pudo enviar el comando. Verifica que el Arduino este conectado.');
  }
}

function mostrarError(mensaje) {
  document.getElementById('motor-estado').innerHTML = `<span class="motor-off">${mensaje}</span>`;
}

cargarPanel();
setInterval(cargarPanel, 2000);
```

---

## PARTE 5 - Verificacion paso a paso

Sigue este orden exacto:

**1. Verificar hardware:**
- El motor TT esta conectado a OUT1 y OUT2 del L298N
- IN1, IN2, ENA conectados a pines 8, 9 y 3 del Arduino
- GND del Arduino y GND de la fuente estan unidos
- Arduino conectado al computador por USB

**2. Subir el codigo al Arduino:**
- Abrir Arduino IDE
- Seleccionar placa y puerto
- Subir el sketch comedero.ino
- Abrir Monitor Serial y confirmar que llegan mensajes JSON

**3. Iniciar el backend:**
```bash
cd backend
npm start
```

Debe aparecer: "Servidor corriendo en puerto 3000" y "Arduino conectado"

**4. Abrir el dashboard:**
- Ir a http://localhost:3000
- Debe mostrar "Conectado" en verde
- Hacer clic en "Encender Motor" y verificar que el motor TT gira
- Hacer clic en "Apagar Motor" y verificar que se detiene

---

## Errores comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| Motor no gira | GND no conectado entre Arduino y L298N | Unir los GND |
| Motor gira muy debil | Poca alimentacion | Usar bateria 9V o fuente 5V |
| "Desconectado" en el panel | Puerto COM equivocado | Verificar en Administrador de dispositivos |
| No llegan datos JSON | Baud rate incorrecto | Verificar 9600 en Monitor Serial y en app.js |

---

## Entregable

1. Foto o video del motor TT girando al hacer clic en "Encender Motor"
2. Captura del dashboard mostrando estado "ON" y "Conectado"
3. Captura del historial con al menos 3 eventos registrados
4. Explicacion breve (5 lineas): como viaja el comando desde el boton web hasta el motor fisico
