# Guia para actualizar el proyecto en tu computador

---

## Paso 1 - Abre Git Bash

Busca en el menu inicio: **Git Bash** y abrelo.

---

## Paso 2 - Entra a la carpeta del proyecto

Escribe esto y presiona Enter:

```bash
cd comedero
```

Si no sabes donde esta la carpeta, escribe:

```bash
cd ~/Documents/comedero
```

o busca la carpeta manualmente y dentro de ella haz clic derecho > "Git Bash Here".

---

## Paso 3 - Descarga los cambios nuevos

```bash
git pull origin main
```

Debes ver algo como esto:

```
Updating b1b4cbb..c89bd47
Fast-forward
 README.md       |  30 +-
 tarea-actual.md | 150 +++
```

Eso significa que se descargaron los archivos actualizados.

---

## Paso 4 - Verifica que llegaron los archivos

```bash
ls
```

Debes ver:

```
README.md   PRD.md   tarea-actual.md   arduino/   backend/   frontend/
```

---

## Paso 5 - Instala las dependencias del backend

Solo hazlo una vez o cuando el profe diga que hay cambios en el backend:

```bash
cd backend
npm install
```

Importante: `npm install` se ejecuta dentro de `backend/`, no en la raiz del proyecto.

---

## Paso 6 - Corre el proyecto

```bash
npm start
```

Abre el navegador y entra a:

```
http://localhost:3000
```

---

## Si algo sale mal

| Problema | Solucion |
|----------|----------|
| "not a git repository" | No estas en la carpeta correcta. Usa cd para entrar a comedero/ |
| "npm not found" | Node.js no esta instalado. Descargalo en nodejs.org |
| Puerto 3000 ocupado | Cierra otras ventanas de terminal que tengan npm start corriendo |

