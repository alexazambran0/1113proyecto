# Tarea 1 Äî Sketch Arduino + Lectura Serial Real

**Proyecto:** Comedero Autom√tico  
**Clase:** IoT + JavaScript  
**Nivel:** Principiante - Intermedio

---

## üéØ Objetivo

Que el Arduino Uno lea el estado del motor (conectado a L298N) y env√≠e datos en **JSON por serial** al backend Node.js.

---

## ö†Ô∏è REQUISITOS DE HARDWARE

Antes de empezar, **ustedes deben tener:**

- úÖ **Arduino Uno**
- úÖ **M√≥dulo L298N** (driver de motor)
- úÖ **Motor DC** (cualquiera, 3-12V)
- úÖ **Fuente de poder** (5V o 12V seg√∫n el motor)
- úÖ **Cable USB** para Arduino

---

## üîå Conexiones (L298N + Arduino + Motor)

### Pines Arduino Üí L298N

```
Arduino Pin 9  Üí IN1 (control motor)
Arduino Pin 10 Üí IN2 (control motor)
Arduino GND    Üí GND (L298N)
Arduino 5V     Üí +5V (L298N, l√≥gica)

L298N OUT1 + OUT2 Üí Motor DC
L298N +12V / GND  Üí Fuente externa (si el motor necesita m√°s poder)
```

### Diagrama r√pido

```
[Arduino] ----PIN9---Üí [L298N IN1]
          ----PIN10--Üí [L298N IN2]
          ----GND----Üí [L298N GND]
                       [L298N OUT1] ---Üí [MOTOR+]
                       [L298N OUT2] ---Üí [MOTOR-]
          [Fuente 12V] Üí [L298N +12V]
```

---

## üìù C√≥digo Arduino (Sketch)

Copien este c√≥digo en el Arduino IDE y **c√rguenlo en el Arduino Uno:**

```cpp
// COMEDERO AUTOM√ÅTICO - LECTURA MOTOR
// Proyecto educativo IoT + JavaScript
// Env√≠a estado del motor por Serial en formato JSON

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
  // En una versi√≥n avanzada, pueden agregar RTC (DS3231)
  unsigned long ms = millis();
  return "2026-05-20T" + String(ms) + "Z";
}
```

---

## úÖ Verificar que funciona

1. **Carguen el sketch en Arduino**
   - Arduino IDE Üí Sketch ‚Üí Cargar
   - Seleccionen puerto (COM3, /dev/ttyUSB0, etc)
   - Seleccionen "Arduino Uno"

2. **Abran Monitor Serial**
   - Arduino IDE Üí Herramientas ‚Üí Monitor Serial
   - Velocidad: **9600 baud**
   - Deber√≠an ver JSON cada 2 segundos

3. **Prueben enviar comandos manualmente**
   - En el Monitor Serial escriban: `motor_on`
   - El motor deber√≠a encenderse
   - Deber√≠an ver respuesta JSON

---

## üéÆ Comandos disponibles

Desde el backend podr√n enviar:

| Comando | Efecto |
|---------|--------|
| `motor_on` | Enciende motor |
| `motor_off` | Apaga motor |

---

## üîß Notas t√©cnicas

- **Velocidad serial:** 9600 baud
- **Formato:** JSON por l√≠nea
- **Intervalo:** 2 segundos entre lecturas

---

## úèÔ∏è Entregable

Ustedes deben mostrar:

1. **Arduino conectado y cargado**
2. **Captura del Monitor Serial** mostrando JSON
3. **Prueba de comando:** env√≠en `motor_on` y muestren respuesta
4. **Breve explicaci√≥n** de qu√© hace cada l√≠nea del c√≥digo

