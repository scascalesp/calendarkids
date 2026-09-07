 **Para controlar los festivos de los crios**
 - Abres la plantilla que hay en raiz de este proj y le dices a la IA que te ponga los festivos nuevos: 'en calendarHolidays me pones el festivo quer toque de septiembre 2026 a septiembre 2027'
 - Ir a https://jsonbin.io/app/bins 
 - Crea sun nuevo bin 'calendar' (algunos no tienen nombre pq no recuerdo como poner) y pegas la nueva plantilla 
 - en bin users le pones el bind id del nuevo año en "binId": "6a9e6c39ac6210605aae97b0"
 - Entrra en https://scascalesp.github.io/calendarkids/
- las vacaciones de los crios se pone en  "calendarHolidays": [ como:
   ```json{
      "fecha": "2026-07-28",
      "vacaciones_ninos": 1
    },
   ```
le puedes pasar la imagen a la ia y decir:
'esto: ... es un nodo 
```json
{ "fecha": "2026-12-22", "vacaciones_ninos": 1 },
```
, siempre y cuando no sea un nodo "festivo_"... creame los nodos'
