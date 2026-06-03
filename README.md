# Comedero Automatico para Gatos

Proyecto educativo de IoT para estudiantes de programacion. La meta es construir una aplicacion web que controle un motor TT (a traves de un modulo L298N y un Arduino Uno) para dispensar comida a un gato desde el navegador.

---

## Que se va a construir

El proyecto se construye por tareas. Cada tarea agrega una capa nueva sobre la anterior.

### Tarea 1 - Arduino enviando datos
Arduino Uno lee el estado del motor y lo envia al computador en formato JSON por el puerto serial.

### Tarea 2 - Backend leyendo Arduino
Servidor Node.js + Express que lee el puerto serial real, guarda el historial en memoria y expone una API REST.

### Tarea 3 - Dashboard + Control del motor
Dashboard web que muestra el estado del motor en tiempo real y permite encenderlo o apagarlo desde el navegador con botones. Incluye la conexion fisica del motor TT con el modulo L298N.

### Tarea 4 - Horarios automaticos (pendiente)
Crear horarios de alimentacion desde la web para que el motor dispense automaticamente a horas definidas.

---

## Objetivo educativo

Los estudiantes aprenden a:

1. Conectar hardware real (motor TT + L298N) a un Arduino Uno
2. Enviar datos desde Arduino al computador por puerto serial
3. Crear un servidor con Node.js y Express
4. Consumir una API REST desde JavaScript en el navegador
5. Controlar hardware fisico desde una pagina web

---

## Hardware necesario

- Arduino Uno
- Modulo L298N (puente H)
- Motor TT amarillo (motor DC reductor)
- Fuente externa 5V-9V o bateria 9V
- Cables jumper
- Cable USB para Arduino

### Conexion rapida

| L298N | Arduino Uno |
|-------|-------------|
| IN1   | Pin 8       |
| IN2   | Pin 9       |
| ENA   | Pin 3 (PWM) |
| GND   | GND         |

| L298N | Motor TT |
|-------|----------|
| OUT1  | Cable A  |
| OUT2  | Cable B  |

Ver detalle completo en `tarea-3.md`.

---

## Estado actual del proyecto

Las tareas 1, 2 y 3 estan documentadas y listas para implementar.

Tarea 3 (en curso): conexion fisica del motor TT, codigo Arduino y dashboard web con control en tiempo real.

---

## Estructura del repositorio

```
comedero/
  backend/
    src/
      app.js
    package.json
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
| POST   | /api/feed/manual   | Enviar comando al motor (motor_on / motor_off) |

---

## Flujo del sistema

```
Navegador --> Backend Node.js --> Arduino Uno --> L298N --> Motor TT
  (boton)       (API REST)       (serial USB)   (puente H)  (dispensador)
```

---

## Documentos de clase

- [tarea-1.md](./tarea-1.md) - Arduino enviando JSON por serial
- [tarea-2.md](./tarea-2.md) - Backend leyendo serial real
- [tarea-3.md](./tarea-3.md) - Conexion motor TT + dashboard en vivo
- [PRD.md](./PRD.md) - Documento de requerimientos del proyecto
