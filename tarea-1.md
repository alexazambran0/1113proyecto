# Tarea 1 — Sketch Arduino + Lectura Serial Real

**Proyecto:** Comedero Automático  
**Clase:** IoT + JavaScript  
**Nivel:** Principiante - Intermedio

---

## 🎯 Objetivo

Que el Arduino Uno lea el estado del motor (conectado a L298N) y envíe datos en **JSON por serial** al backend Node.js.

---

## ⚠️ REQUISITOS DE HARDWARE

Antes de empezar, **ustedes deben tener:**

- ✅ **Arduino Uno**
- ✅ **Módulo L298N** (driver de motor)
- ✅ **Motor DC** (cualquiera, 3-12V)
- ✅ **Fuente de poder** (5V o 12V según el motor)
- ✅ **Cable USB** para Arduino

---

## 🔌 Conexiones (L298N + Arduino + Motor)

### Pines Arduino → L298N

```
Arduino Pin 9  → IN1 (control motor)
Arduino Pin 10 → IN2 (control motor)
Arduino GND    → GND (L298N)
Arduino 5V     → +5V (L298N, lógica)

L298N OUT1 + OUT2 → Motor DC
L298N +12V / GND  → Fuente externa (si el motor necesita más poder)
```

### Diagrama rápido

```
[Arduino] ----PIN9---→ [L298N IN1]
          ----PIN10--→ [L298N IN2]
          ----GND----→ [L298N GND]
                       [L298N OUT1] ---→ [MOTOR+]
                       [L298N OUT2] ---→ [MOTOR-]
          [Fuente 12V] → [L298N +12V]
```

---

## 📝 Código Arduino (Sketch)

Copien este código en el Arduino IDE y **cárguenlo en el Arduino Uno:**

```cpp
// COMEDERO AUTOMÁTICO - LECTURA MOTOR
// Proyecto educativo IoT + JavaScript
// Envía estado del motor por Serial en formato JSON

// Pines del L298N
const int PIN_IN1 = 9;   // Control motor (HIGH/LOW)
const int PIN_IN2 = 10;  // Control motor (HIGH/LOW)

// Variables de control
unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_LECTURA = 2000; // Leer cada 2 segundos

void setup() {
  // Inicializar Serial a 9600 baud
  Serial.begin(9600);
  
  // Configurar pines como salida
  pinMode(PIN_IN1, OUTPUT);
  pinMode(PIN_IN2, OUTPUT);
  
  // Motor apagado al inicio
  digitalWrite(PIN_IN1, LOW);
  digitalWrite(PIN_IN2, LOW);
  
  // Mensaje de bienvenida
  delay(1000);
  Serial.println("{\"evento\":\"inicio\",\"mensaje\":\"Sistema listo\"}");
}

void loop() {
  // Leer estado actual del motor (por los pines)
  bool motorON = (digitalRead(PIN_IN1) == HIGH) || (digitalRead(PIN_IN2) == HIGH);
  
  // Enviar lectura cada 2 segundos
  unsigned long ahora = millis();
  if (ahora - ultimaLectura >= INTERVALO_LECTURA) {
    ultimaLectura = ahora;
    enviarDatos(motorON);
  }
  
  // Verificar si el backend solicita comando
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();
    
    if (comando == "motor_on") {
      digitalWrite(PIN_IN1, HIGH);
      digitalWrite(PIN_IN2, LOW);
      Serial.println("{\"evento\":\"motor_encendido\",\"estado_motor\":\"ON\"}");
    } 
    else if (comando == "motor_off") {
      digitalWrite(PIN_IN1, LOW);
      digitalWrite(PIN_IN2, LOW);
      Serial.println("{\"evento\":\"motor_apagado\",\"estado_motor\":\"OFF\"}");
    }
    else {
      Serial.println("{\"evento\":\"error\",\"mensaje\":\"Comando no reconocido\"}");
    }
  }
}

void enviarDatos(bool motorActivo) {
  // Crear JSON con estado actual
  String json = "{";
  json += "\"timestamp\":\"";
  json += obtenerTimestamp();
  json += "\",\"estado_motor\":\"";
  json += motorActivo ? "ON" : "OFF";
  json += "\",\"evento\":\"lectura\"";
  json += "}";
  
  Serial.println(json);
}

String obtenerTimestamp() {
  // Nota: Arduino Uno no tiene RTC integrado
  // Por ahora devolvemos un timestamp simulado
  // En una versión avanzada, pueden agregar RTC (DS3231)
  unsigned long ms = millis();
  return "2026-05-20T" + String(ms) + "Z";
}
```

---

## ✅ Verificar que funciona

1. **Carguen el sketch en Arduino**
   - Arduino IDE → Sketch → Cargar
   - Seleccionen puerto (COM3, /dev/ttyUSB0, etc)
   - Seleccionen "Arduino Uno"

2. **Abran Monitor Serial**
   - Arduino IDE → Herramientas → Monitor Serial
   - Velocidad: **9600 baud**
   - Deberían ver JSON cada 2 segundos

3. **Prueben enviar comandos manualmente**
   - En el Monitor Serial escriban: `motor_on`
   - El motor debería encenderse
   - Deberían ver respuesta JSON

---

## 🎮 Comandos disponibles

Desde el backend podrán enviar:

| Comando | Efecto |
|---------|--------|
| `motor_on` | Enciende motor |
| `motor_off` | Apaga motor |

---

## 🔧 Notas técnicas

- **Velocidad serial:** 9600 baud
- **Formato:** JSON por línea
- **Intervalo:** 2 segundos entre lecturas

---

## ✏️ Entregable

Ustedes deben mostrar:

1. **Arduino conectado y cargado**
2. **Captura del Monitor Serial** mostrando JSON
3. **Prueba de comando:** envíen `motor_on` y muestren respuesta
4. **Breve explicación** de qué hace cada línea del código

