# Guia clara para levantar el proyecto Comedero en el colegio

Esta guia es para estudiantes que ya tienen el proyecto descargado o necesitan volver a descargarlo. El objetivo es abrir la aplicacion web del comedero en el navegador y conectarla con el Arduino.

Importante: si el profesor ya programo el Arduino, NO tienen que volver a subir el programa al Arduino. Solo tienen que conectar el Arduino por USB y levantar el backend.

Si necesitan revisar el cableado del Arduino, usen primero `guia-conexiones-arduino.md`.

---

## Resultado esperado

Al final deben poder abrir esta pagina:

```text
http://localhost:3000
```

Y ver el panel del comedero con el estado del Arduino y los botones del motor.

---

## Antes de empezar

Revisen que la computadora tenga:

- Node.js instalado.
- Git instalado.
- Cable USB conectado al Arduino.
- El Arduino conectado a la computadora.
- El Arduino IDE cerrado o, al menos, el Monitor Serial cerrado.

Para verificar Node.js, abran una terminal y escriban:

```bash
node -v
npm -v
```

Si esos comandos no funcionan, falta instalar Node.js.

---

## Caso A - Ya tengo la carpeta `comedero`

1. Abran Git Bash, PowerShell o la terminal.
2. Entren a la carpeta del proyecto:

```bash
cd comedero
```

Si la carpeta esta en Documentos, prueben:

```bash
cd ~/Documents/comedero
```

3. Actualicen el proyecto:

```bash
git pull origin main
```

4. Entren al backend:

```bash
cd backend
```

5. Instalen dependencias:

```bash
npm install
```

6. Levanten el servidor:

```bash
npm start
```

7. Abran el navegador en:

```text
http://localhost:3000
```

---

## Caso B - No tengo la carpeta `comedero`

1. Abran Git Bash o PowerShell.
2. Vayan a la carpeta donde quieren guardar el proyecto, por ejemplo Documentos:

```bash
cd ~/Documents
```

3. Descarguen el proyecto:

```bash
git clone https://github.com/alexazambran0/comedero.git
```

4. Entren al proyecto:

```bash
cd comedero
```

5. Entren al backend:

```bash
cd backend
```

6. Instalen dependencias:

```bash
npm install
```

7. Levanten el servidor:

```bash
npm start
```

8. Abran el navegador en:

```text
http://localhost:3000
```

---

## Muy importante: `npm start` va dentro de `backend`

Este proyecto NO se levanta desde la carpeta principal.

Correcto:

```bash
cd comedero
cd backend
npm start
```

Incorrecto:

```bash
cd comedero
npm start
```

Si ejecutan `npm start` en la carpeta equivocada, puede aparecer un error porque no hay `package.json` en la raiz del proyecto.

---

## Si la pagina no abre

Revisen esto en orden:

1. La terminal donde ejecutaron `npm start` debe seguir abierta.
2. Debe aparecer algo parecido a:

```text
Servidor listo en http://localhost:3000
```

3. En el navegador escriban exactamente:

```text
http://localhost:3000
```

4. Si dice que el puerto 3000 esta ocupado, cierren otras terminales donde hayan ejecutado `npm start` y vuelvan a intentarlo.
5. Si Arduino aparece como desconectado, cierren el Monitor Serial de Arduino IDE y reinicien el backend con `npm start`.

---

## Si el backend no detecta el Arduino

Primero prueben lo simple:

1. Desconecten y conecten el cable USB.
2. Cierren Arduino IDE o el Monitor Serial.
3. Cierren la terminal del backend con `Ctrl + C`.
4. Vuelvan a ejecutar:

```bash
npm start
```

Si sigue sin detectarlo, indiquen el puerto manualmente.

En Windows PowerShell:

```powershell
$env:ARDUINO_PORT="COM3"; npm start
```

Cambien `COM3` por el puerto real del Arduino.

Para ver el puerto real, abran Arduino IDE y miren:

```text
Herramientas > Puerto
```

---

## Sobre el error al subir el programa al Arduino

Si el profesor ya dejo el Arduino programado, no hace falta subir el programa otra vez.

En ese caso, si Arduino IDE muestra un error al intentar subir el programa, hagan esto:

1. No se traben en ese paso.
2. Cierren Arduino IDE o cierren el Monitor Serial.
3. Dejen el Arduino conectado por USB.
4. Vayan a la terminal.
5. Entren a `comedero/backend`.
6. Ejecuten:

```bash
npm start
```

7. Abran:

```text
http://localhost:3000
```

La aplicacion puede funcionar aunque ustedes no suban el programa, siempre que el Arduino ya tenga cargado el programa correcto.

---

## Si SI necesitan volver a subir el programa al Arduino

Solo hagan esto si el profesor se los pide o si el Arduino fue borrado/reprogramado.

1. Abran este archivo en Arduino IDE:

```text
arduino/comedero/comedero.ino
```

2. Seleccionen la placa:

```text
Herramientas > Placa > Arduino Uno
```

3. Seleccionen el puerto:

```text
Herramientas > Puerto > COM...
```

4. Cierren el Monitor Serial si esta abierto.
5. Presionen Subir.

---

## Errores comunes al subir al Arduino

| Error o situacion | Que significa | Que hacer |
|-------------------|---------------|-----------|
| `avrdude: stk500_recv(): programmer is not responding` | La computadora no puede comunicarse con el Arduino | Revisen cable USB, puerto correcto y placa `Arduino Uno` |
| `avrdude: ser_open(): can't open device` | El puerto esta ocupado o no existe | Cierren Monitor Serial, cierren otras apps que usen el Arduino y reconecten el USB |
| `Access is denied` | Otro programa esta usando el puerto COM | Cierren Arduino IDE, Monitor Serial, backend Node.js y vuelvan a intentar |
| No aparece ningun puerto COM | Windows no detecto el Arduino | Cambien el cable USB, prueben otro puerto USB o instalen el driver CH340 si el Arduino es clon |
| El codigo no compila | Hay un error en el archivo abierto | Verifiquen que abrieron `arduino/comedero/comedero.ino` y no otro archivo |

Regla importante: si el Arduino ya estaba programado, estos errores de subida no impiden levantar la pagina web. Para usar la app, el backend solo necesita que el Arduino este conectado y enviando datos por USB.

---

## Como probar que todo funciona

1. Abran:

```text
http://localhost:3000/api/health
```

2. Si todo esta bien, deben ver algo parecido a:

```json
{
  "ok": true,
  "servicio": "activo",
  "conexion_arduino": "conectado",
  "mensaje": "lectura"
}
```

3. Luego abran:

```text
http://localhost:3000
```

4. Prueben primero el boton:

```text
Probar motor 2 segundos
```

5. Si el motor gira, recien despues prueben agregar horarios.

---

## Resumen rapido para el alumno

Si ya tengo el proyecto:

```bash
cd comedero
git pull origin main
cd backend
npm install
npm start
```

Luego abro:

```text
http://localhost:3000
```

Si el Arduino ya esta programado, no necesito subir el codigo otra vez.
