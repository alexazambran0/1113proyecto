# Comedero Automatico para Gatos

Proyecto educativo de IoT para estudiantes de programacion. La meta es construir una aplicacion web que controle un motor TT amarillo desde un Arduino Uno para dispensar comida a un gato desde el navegador.

---

## Que se va a construir

El proyecto se construye por tareas. Cada tarea agrega una capa nueva sobre la anterior.

### Tarea 1 - Arduino enviando datos
Arduino Uno lee el estado del motor y lo envia al computador en formato JSON por el puerto serial.

### Tarea 2 - Backend leyendo Arduino
Servidor Node.js + Express que lee el puerto serial real, guarda el historial en memoria y expone una API REST.

### Tarea 3 - Dashboard + Control del motor
Dashboard web que muestra el estado del motor en tiempo real y permite encenderlo o apagarlo desde el navegador con botones. Usa un motor TT de una sola direccion controlado desde Arduino con una etapa de potencia simple.

### Tarea 4 - Horarios automaticos (pendiente)
Crear horarios de alimentacion desde la web para que el motor dispense automaticamente a horas definidas.

---

## Objetivo educativo

Los estudiantes aprenden a:

1. Conectar hardware real (motor TT + transistor/MOSFET + diodo) a un Arduino Uno
2. Enviar datos desde Arduino al computador por puerto serial
3. Crear un servidor con Node.js y Express
4. Consumir una API REST desde JavaScript en el navegador
5. Controlar hardware fisico desde una pagina web

---

## Hardware necesario

- Arduino Uno
- Motor TT amarillo (motor DC reductor)
- Transistor/MOSFET o modulo de rele para manejar el motor
- Diodo en paralelo con el motor
- Fuente externa 5V-9V o bateria 9V
- Cables jumper
- Cable USB para Arduino

### Conexion rapida

| Conexion | Destino |
|----------|---------|
| Pin 9 Arduino | Entrada de control del transistor/MOSFET/rele |
| GND Arduino | GND comun con la fuente del motor |
| Motor TT | Fuente externa mediante transistor/MOSFET/rele |
| Diodo | En paralelo con el motor |

Importante: el motor TT no debe conectarse directo a un pin del Arduino. El diodo ayuda contra el pico inductivo, pero no reemplaza la etapa de potencia.

---

## Estado actual del proyecto

Las tareas 1, 2 y 3 estan documentadas y listas para implementar.

Tarea 3: conexion fisica del motor TT de una direccion, codigo Arduino y dashboard web con control en tiempo real.

---

## Estructura del repositorio

```
comedero/
  backend/
    src/
      app.js
    package.json
  arduino/
    comedero/
      comedero.ino
  frontend/
    index.html
    app.js
  PRD.md
  README.md
  tarea-1.md
  tarea-2.md
  tarea-3.md
```

---

## Como ejecutar el proyecto

Requisitos: Node.js 18+ y npm instalados.

```bash
# Verificar instalacion
node -v
npm -v
```

```bash
# Instalar dependencias y correr el backend
cd backend
npm install
npm start
```

Abrir en el navegador:

- `http://localhost:3000` - Dashboard principal
- `http://localhost:3000/api/health` - Estado del servidor
- `http://localhost:3000/api/status` - Ultima lectura del motor
- `http://localhost:3000/api/history?limit=20` - Historial de eventos

---

## API

| Metodo | Endpoint           | Descripcion                        |
|--------|--------------------|------------------------------------|
| GET    | /api/health        | Estado del servidor y Arduino      |
| GET    | /api/status        | Ultima lectura del motor           |
| GET    | /api/history       | Historial de eventos               |
| GET    | /api/events        | Eventos en vivo para el dashboard  |
| POST   | /api/motor         | Encender o apagar el motor         |
| POST   | /api/feed/manual   | Dispensar durante 2 segundos       |

---

## Flujo del sistema

```
Navegador --> Backend Node.js --> Arduino Uno --> transistor/MOSFET/rele --> Motor TT
  (boton)       (API + eventos)   (serial USB)        (potencia)           (dispensador)
```

---

## Documentos de clase

- [tarea-1.md](./tarea-1.md) - Arduino enviando JSON por serial
- [tarea-2.md](./tarea-2.md) - Backend leyendo serial real
- [tarea-3.md](./tarea-3.md) - Conexion motor TT + dashboard en vivo
- [PRD.md](./PRD.md) - Documento de requerimientos del proyecto
