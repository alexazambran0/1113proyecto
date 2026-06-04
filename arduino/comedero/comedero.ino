const int PIN_MOTOR = 9;
const int PIN_SENSOR_NIVEL = A0;

// El motor TT amarillo no debe conectarse directo al pin del Arduino.
// PIN_MOTOR debe controlar la base/gate de un transistor o MOSFET.
// El diodo va en paralelo con el motor para absorber el pico inductivo.

bool motorEncendido = false;

void setup() {
  pinMode(PIN_MOTOR, OUTPUT);
  digitalWrite(PIN_MOTOR, LOW);

  Serial.begin(9600);
  enviarEstado("inicio");
}

void loop() {
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "motor_on") {
      encenderMotor();
    } else if (comando == "motor_off") {
      apagarMotor();
    }
  }

  static unsigned long ultimaLectura = 0;
  if (millis() - ultimaLectura >= 1000) {
    ultimaLectura = millis();
    enviarEstado("lectura");
  }
}

void encenderMotor() {
  motorEncendido = true;
  digitalWrite(PIN_MOTOR, HIGH);
  enviarEstado("motor_encendido");
}

void apagarMotor() {
  motorEncendido = false;
  digitalWrite(PIN_MOTOR, LOW);
  enviarEstado("motor_apagado");
}

int leerNivel() {
  int lectura = analogRead(PIN_SENSOR_NIVEL);
  return map(lectura, 0, 1023, 0, 100);
}

void enviarEstado(String evento) {
  Serial.print("{\"evento\":\"");
  Serial.print(evento);
  Serial.print("\",\"estado_motor\":\"");
  Serial.print(motorEncendido ? "ON" : "OFF");
  Serial.print("\",\"nivel\":");
  Serial.print(leerNivel());
  Serial.println("}");
}
