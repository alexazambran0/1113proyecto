# Tarea Actual - Control del Motor desde la Aplicacion

Esta es la tarea vigente del proyecto. Continuen desde la implementacion actual del repositorio: backend Node.js, frontend web y sketch Arduino ya estan preparados para controlar un motor TT amarillo de una sola direccion.

No usen las instrucciones antiguas con puente H/L298N. Este proyecto esta pensado para un motor que solo necesita encenderse y apagarse en una direccion.

---

## Objetivo

Al terminar, cada equipo debe poder controlar el motor desde la aplicacion web y explicar como viaja el comando desde el navegador hasta el Arduino.

El flujo completo es:

```text
Navegador --> Backend Node.js --> Arduino Uno --> transistor/MOSFET/rele --> Motor TT
  boton       API + eventos      serial USB          potencia              giro
```

---

## Hardware necesario

- Arduino Uno
- Motor TT amarillo
- Transistor/MOSFET o modulo de rele para manejar el motor
- Diodo en paralelo con el motor
- Fuente externa para el motor
- Cables jumper
- Cable USB para Arduino

Importante: el motor NO debe conectarse directo a un pin del Arduino. El diodo protege contra el pico electrico del motor, pero no reemplaza la etapa de potencia.

---

## Archivos que ya existen

| Archivo | Para que sirve |
|---------|----------------|
| `arduino/comedero/comedero.ino` | Codigo que se carga en el Arduino |
| `backend/src/app.js` | Servidor Node.js que habla con Arduino por serial |
| `frontend/index.html` | Pantalla web del comedero |
| `frontend/app.js` | Logica del navegador para ver estado y enviar comandos |

---

## Paso 1 - Cargar el Arduino

1. Abran `arduino/comedero/comedero.ino` en Arduino IDE.
2. Seleccionen la placa `Arduino Uno`.
3. Seleccionen el puerto del Arduino.
4. Carguen el sketch.
5. Abran el Monitor Serial a `9600` baudios.

Deberian ver mensajes JSON similares a:

```json
{"evento":"lectura","estado_motor":"OFF","nivel":50}
```

Prueben escribir estos comandos en el Monitor Serial:

```text
motor_on
motor_off
```

El motor deberia encenderse y apagarse.

---

## Paso 2 - Conectar el backend

Entren a la carpeta del backend:

```bash
cd backend
npm install
npm start
```

El servidor queda en:

```text
http://localhost:3000
```

Si el backend no detecta el Arduino automaticamente, indiquen el puerto manualmente.

En Windows PowerShell:

```powershell
$env:ARDUINO_PORT="COM3"; npm start
```

Cambien `COM3` por el puerto real de su Arduino.

---

## Paso 3 - Usar la aplicacion

Abran en el navegador:

```text
http://localhost:3000
```

La pantalla debe mostrar:

- Estado de conexion del Arduino
- Estado del motor: `ON` u `OFF`
- Boton `Encender motor`
- Boton `Apagar motor`
- Boton `Dispensar 2 segundos`
- Historial de lecturas

Si el Arduino aparece como desconectado, revisen primero el cable USB, el puerto seleccionado y que el Monitor Serial de Arduino IDE este cerrado.

---

## API disponible

| Metodo | Endpoint | Uso |
|--------|----------|-----|
| `GET` | `/api/health` | Ver si el servidor y Arduino estan activos |
| `GET` | `/api/status` | Leer el ultimo estado recibido |
| `GET` | `/api/history` | Ver historial de lecturas |
| `GET` | `/api/events` | Recibir cambios en vivo en el navegador |
| `POST` | `/api/motor` | Encender o apagar el motor |
| `POST` | `/api/feed/manual` | Encender el motor durante 2 segundos |

Ejemplo para encender desde una herramienta HTTP:

```json
{
  "accion": "encender"
}
```

Ejemplo para apagar:

```json
{
  "accion": "apagar"
}
```

---

## Que deben explicar

Cada equipo debe poder responder:

1. Que hace el boton del navegador.
2. Que endpoint recibe el comando en el backend.
3. Que texto viaja por USB hacia el Arduino.
4. Que pin del Arduino cambia de estado.
5. Por que el motor necesita transistor/MOSFET o rele.
6. Para que sirve el diodo en paralelo con el motor.

---

## Entregable

Suban o muestren:

- Captura de la aplicacion con Arduino conectado.
- Video corto encendiendo y apagando el motor desde la web.
- Captura de `/api/health` mostrando Arduino conectado.
- Explicacion breve del flujo navegador -> backend -> Arduino -> motor.

---

## Desafio para continuar

Agreguen horarios automaticos de alimentacion.

La idea es que el usuario pueda elegir una hora y que el backend encienda el motor automaticamente durante 2 segundos cuando llegue ese momento.

Antes de programarlo, piensen:

- Donde se guardan los horarios.
- Como se evita dispensar dos veces en el mismo minuto.
- Que pasa si Arduino esta desconectado.
- Como se muestra el proximo horario en la pantalla.
