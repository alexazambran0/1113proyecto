# Comedero Automatico para Gatos

Proyecto educativo de IoT para estudiantes de programacion. La meta es construir una aplicacion web que controle un motor TT amarillo desde un Arduino Uno para dispensar comida a un gato desde el navegador.

---

## Que se va a construir

El proyecto actual ya integra Arduino, backend y dashboard web. La tarea vigente es probar el sistema completo, entender el flujo de datos y continuar desde esta base.

### Tarea actual - Control del motor y horarios desde la aplicacion
Dashboard web que muestra el estado del motor en tiempo real, permite probar el motor durante 2 segundos, apagarlo manualmente y programar horarios de suministro. Usa un motor TT de una sola direccion controlado desde Arduino con una etapa de potencia simple. Los dispensados usan auto-apagado en Arduino para no depender solo del backend.

Primero se prueba el boton manual para confirmar que Arduino, backend y motor funcionan. Despues se agregan horarios automaticos desde la web.

---

## Objetivo educativo

Los estudiantes aprenden a:

1. Conectar hardware real (motor TT + transistor/MOSFET + diodo) a un Arduino Uno
2. Enviar datos desde Arduino al computador por puerto serial
3. Usar un servidor Node.js + Express como puente entre web y Arduino
4. Consumir una API REST y eventos en vivo desde JavaScript en el navegador
5. Controlar hardware fisico desde una pagina web
6. Programar acciones automaticas simples desde un backend Node.js

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

El proyecto esta listo para probar la integracion completa: Arduino, backend serial y dashboard web.

La guia vigente para estudiantes es `tarea-actual.md`.

---

## Estructura del repositorio

```
comedero/
  backend/
    src/
      app.js
    package.json
    package-lock.json
  arduino/
    comedero/
      comedero.ino
  frontend/
    index.html
    app.js
  PRD.md
  README.md
  tarea-actual.md
  guia-actualizar-repo.md
```

---

## Como ejecutar el proyecto

Requisitos: Node.js 18+ y npm instalados.

Importante: no hay `package.json` en la raiz del proyecto. Los comandos `npm install` y `npm start` se ejecutan dentro de `backend/`.

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

Usen este servidor en una red confiable de clase: cualquier persona que pueda abrir el dashboard podria enviar comandos al motor.

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
| GET    | /api/schedules     | Listar horarios programados        |
| POST   | /api/schedules     | Agregar horario `{ "hora": "HH:MM" }` |
| DELETE | /api/schedules/:id | Eliminar un horario                |

---

## Flujo del sistema

```
Navegador --> Backend Node.js --> Arduino Uno --> transistor/MOSFET/rele --> Motor TT
  (boton)       (API + eventos)   (serial USB)        (potencia)           (dispensador)
```

---

## Documentos de clase

- [tarea-actual.md](./tarea-actual.md) - Guia vigente para probar y continuar desde la implementacion actual
- [guia-actualizar-repo.md](./guia-actualizar-repo.md) - Guia corta para que los estudiantes actualicen su copia local
- [PRD.md](./PRD.md) - Documento de requerimientos del proyecto
