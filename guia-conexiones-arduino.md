# Guia simple de conexiones del Arduino

Esta guia es para conectar el Arduino del comedero cuando el programa ya esta cargado. No hace falta volver a programar el Arduino.

## Resultado esperado

Al terminar, el Arduino debe quedar conectado asi:

```text
Computadora --USB--> Arduino Uno --Pin 9--> etapa de potencia --> Motor TT
                                \--A0 opcional--> sensor de nivel
```

## Materiales

- Arduino Uno ya programado.
- Cable USB para conectar el Arduino a la computadora.
- Motor TT amarillo DC de dos cables.
- Transistor/MOSFET o modulo de rele para manejar el motor.
- Diodo de proteccion en paralelo con el motor.
- Fuente externa o bateria para el motor.
- Cables jumper.

Importante: esta guia NO es para un servomotor de 3 cables. Es para el motor TT amarillo DC que solo gira cuando recibe alimentacion.

## Conexiones principales

| Cable | Va conectado a |
|-------|----------------|
| Pin 9 del Arduino | Entrada de control del transistor, MOSFET o rele |
| GND del Arduino | GND de la etapa de potencia y de la fuente del motor |
| Motor TT | Salida de potencia del transistor, MOSFET o rele |
| Fuente externa del motor | Alimentacion del motor, no al pin 9 |
| Diodo | En paralelo con el motor |
| A0 del Arduino | Sensor de nivel, si el grupo lo esta usando |

## Conexion del motor

El motor NO se conecta directo al pin 9 del Arduino.

El pin 9 solo manda la senal de control. La energia real del motor debe salir de una fuente externa o bateria, pasando por una etapa de potencia.

```text
Pin 9 Arduino --> control transistor/MOSFET/rele
Fuente motor  --> etapa de potencia --> Motor TT
GND Arduino   --> GND comun
```

Si usan modulo de rele:

| Modulo rele | Arduino / motor |
|-------------|-----------------|
| IN | Pin 9 Arduino |
| GND | GND Arduino |
| VCC | 5V Arduino, si el modulo es de 5V |
| COM y NO | Cortan o habilitan la alimentacion del motor |

Si usan transistor o MOSFET:

| Componente | Conexion |
|------------|----------|
| Base/Gate | Pin 9 Arduino |
| Emisor/Source | GND comun |
| Colector/Drain | Un cable del motor |
| Otro cable del motor | Positivo de la fuente externa |

## Diodo de proteccion

El diodo va en paralelo con el motor. Sirve para proteger el circuito cuando el motor se apaga.

```text
Motor + ----|<|---- Motor -
```

La raya del diodo debe quedar del lado positivo del motor.

## Sensor de nivel

El programa lee el sensor de nivel desde el pin `A0`.

Si no tienen sensor conectado, la pagina puede mostrar valores raros de nivel. Eso no significa que el motor este mal conectado.

Conexion basica del sensor:

| Sensor | Arduino |
|--------|---------|
| Senal | A0 |
| VCC | 5V |
| GND | GND |

## Conexion a la computadora

1. Conecten el Arduino a la computadora con el cable USB.
2. No abran el Monitor Serial de Arduino IDE mientras usan la pagina web.
3. Levanten el backend desde `backend` con `npm start`.
4. Abran `http://localhost:3000`.

## Checklist antes de probar

- [ ] El motor no esta conectado directo al pin 9.
- [ ] El pin 9 va a la entrada de control del rele, transistor o MOSFET.
- [ ] El Arduino y la fuente del motor comparten GND.
- [ ] El diodo esta en paralelo con el motor.
- [ ] El Arduino esta conectado por USB a la computadora.
- [ ] El Monitor Serial esta cerrado.

## Prueba segura

Primero prueben desde la pagina el boton:

```text
Probar motor 2 segundos
```

Si el motor gira, la conexion principal esta bien.

Si el motor no gira, revisen primero GND comun, pin 9 y alimentacion externa del motor.
