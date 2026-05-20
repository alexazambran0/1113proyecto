# Tarea 2 — Backend con Lectura Serial Real (serialport)

**Proyecto:** Comedero Automático  
**Clase:** IoT + JavaScript  
**Nivel:** Intermedio

---

## 🎯 Objetivo

Reemplazar el simulador de datos con **lectura real del puerto serial**, conectando el Arduino al backend Node.js.

---

## ⚠️ PRE-REQUISITOS

- ✅ **Tarea 1 completada:** Arduino enviando JSON por serial
- ✅ **Monitor Serial funcionando:** verificaron que Arduino envía datos
- ✅ **Arduino conectado al USB** durante el desarrollo
- ✅ **Node.js 18+** instalado
- ✅ **npm** funcionando

---

## 📦 Instalar serialport

En la carpeta `backend`, instalen la librería:

```bash
cd backend
npm install serialport
```

---

## 🔌 Detectar puerto Arduino

Antes de leer datos, necesitan saber **en qué puerto está el Arduino**.

**Windows:** COM3, COM4, COM5, etc  
**Linux/Mac:** /dev/ttyUSB0, /dev/ttyACM0, etc

Crear archivo `backend/src/detectarPuerto.js`:

```js
const { SerialPort } = require('serialport');

async function detectarArduino() {
  const puertos = await SerialPort.list();
  
  console.log('Puertos disponibles:');
  puertos.forEach(puerto => {
    console.log(`  - ${puerto.path} (${puerto.manufacturer || 'desconocido'})`);
  });
  
  // Buscar Arduino (generalmente dice "Arduino")
  const arduino = puertos.find(p => 
    p.manufacturer?.includes('Arduino') || 
    p.path.includes('COM') || 
    p.path.includes('ttyUSB') ||
    p.path.includes('ttyACM')
  );
  
  if (arduino) {
    console.log(`✅ Arduino encontrado: ${arduino.path}`);
    return arduino.path;
  } else {
    console.log('❌ No se encontró Arduino. Verifiquen:');
    console.log('   - Arduino conectado por USB');
    console.log('   - Drivers instalados');
    console.log('   - Tarea 1 completada');
    return null;
  }
}

module.exports = { detectarArduino };
```

---

## 📝 Modificar backend/src/app.js

Reemplazar el simulador con lectura real:

```js
const express = require('express');
const path = require('path');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { detectarArduino } = require('./detectarPuerto');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../frontend')));

let lecturaActual = {
  estado_motor: 'OFF',
  timestamp: new Date().toISOString(),
  conectado: false
};

const historial = [];

let puerto = null;
let parser = null;

// Inicializar conexión serial
async function inicializarSerial() {
  try {
    const puertoPersonal = process.env.PUERTO_ARDUINO || await detectarArduino();
    
    if (!puertoPersonal) {
      console.error('❌ No se pudo detectar Arduino');
      return;
    }
    
    puerto = new SerialPort({
      path: puertoPersonal,
      baudRate: 9600,
      autoOpen: true
    });
    
    parser = puerto.pipe(new ReadlineParser({ delimiter: '\n' }));
    
    puerto.on('open', () => {
      console.log(`✅ Conexión serial abierta en ${puertoPersonal}`);
      lecturaActual.conectado = true;
    });
    
    parser.on('data', (linea) => {
      try {
        const dato = JSON.parse(linea);
        
        // Validar que tenga los campos necesarios
        if (dato.estado_motor && (dato.estado_motor === 'ON' || dato.estado_motor === 'OFF')) {
          lecturaActual = {
            estado_motor: dato.estado_motor,
            timestamp: dato.timestamp || new Date().toISOString(),
            evento: dato.evento || 'lectura',
            conectado: true
          };
          
          historial.push(lecturaActual);
          if (historial.length > 500) historial.shift();
          
          console.log(`📊 Lectura: ${JSON.stringify(lecturaActual)}`);
        } else {
          console.warn(`⚠️ Dato incompleto: ${linea}`);
        }
      } catch (error) {
        console.warn(`⚠️ Error parsing JSON: ${linea} - ${error.message}`);
      }
    });
    
    puerto.on('error', (error) => {
      console.error(`❌ Error serial: ${error.message}`);
      lecturaActual.conectado = false;
    });
    
    puerto.on('close', () => {
      console.log('❌ Conexión serial cerrada');
      lecturaActual.conectado = false;
    });
    
  } catch (error) {
    console.error(`❌ No se pudo inicializar serial: ${error.message}`);
  }
}

// APIs

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    servicio: 'activo',
    conexion_arduino: lecturaActual.conectado ? 'conectado' : 'desconectado',
    lecturas_guardadas: historial.length,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json(lecturaActual);
});

app.get('/api/history', (req, res) => {
  const limit = Number(req.query.limit) || 50;
  res.json(historial.slice(-Math.max(1, Math.min(limit, 200))));
});

// Enviar comando al Arduino
app.post('/api/feed/manual', (req, res) => {
  if (!puerto || !puerto.isOpen) {
    return res.status(503).json({
      ok: false,
      error: 'Arduino desconectado'
    });
  }
  
  puerto.write('motor_on\n', (error) => {
    if (error) {
      return res.status(500).json({
        ok: false,
        error: 'Error al enviar comando'
      });
    }
    
    res.json({
      ok: true,
      mensaje: 'Dispensado solicitado',
      timestamp: new Date().toISOString()
    });
  });
});

app.listen(PORT, async () => {
  console.log(`\n🚀 Servidor en http://localhost:${PORT}`);
  console.log(`📡 Inicializando conexión serial...\n`);
  
  await inicializarSerial();
});
```

---

## 📦 Actualizar package.json

Verifica que `backend/package.json` tiene:

```json
{
  "name": "comedero-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node src/app.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "serialport": "^12.0.0"
  }
}
```

Si no está `serialport`, corran:

```bash
npm install serialport
```

---

## ✅ Verificación

1. **Conecten Arduino por USB**
2. **Ejecuten el backend:**
   ```bash
   npm start
   ```
3. **Deberían ver en consola:**
   ```
   ✅ Conexión serial abierta en COM3 (o /dev/ttyUSB0)
   📊 Lectura: {"estado_motor":"OFF",...}
   ```

4. **Verifiquen `/api/health`:**
   - Abran http://localhost:3000/api/health
   - `"conexion_arduino":"conectado"` ✅

---

## 🔧 Troubleshooting

| Problema | Solución |
|----------|----------|
| `Error: ENOENT puerto no existe` | Verifiquen puerto correcto o desconecten/conecten Arduino |
| `JSON parse error` | Verificar que Arduino envía JSON válido (Tarea 1) |
| `Conexión cerrada inesperadamente` | Revisar cables USB, drivers Arduino IDE |
| `Puerto en uso` | Cierren Monitor Serial del Arduino IDE |

---

## 🎯 Próximo paso

**Tarea 3:** Frontend que muestra datos en vivo y controla motor desde web

---

## ✏️ Entregable

1. **Backend funcionando** con Arduino real
2. **Captura de consola** mostrando lecturas del Arduino
3. **Captura de `/api/health`** con `"conexion_arduino":"conectado"`
4. **Explicación:** cómo fluyen los datos desde Arduino al backend

