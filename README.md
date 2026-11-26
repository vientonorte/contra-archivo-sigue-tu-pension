# Sigue tu pensión

Prototipo v1 del Contra-Archivo: una lectura pública de las carteras de las AFP, a partir de datos de la Superintendencia de Pensiones, con fuente, fecha y grado a la vista.

**Esta versión no incluye nombres de personas.**

Cada cifra lleva una nota con su fuente, su fecha y su grado:

- **[D]** documento público (borde sólido)
- **[D-sec.]** dato vía prensa o agregador que cita la fuente (borde fino)
- **[I]** inferencia o cálculo (borde punteado)
- **NO DATO** cuando el dato no es público o no está verificado (gris; nunca se muestra como cero)

**Esto no es asesoría financiera, previsional ni legal.** No recomendamos AFP ni fondo. Las cifras son del fondo de tu AFP, no de tu cuenta.

**No ha sido revisado aún por un abogado.**

## Datos y licencia

Las cifras de carteras provienen de la Superintendencia de Pensiones (Cartera de Inversión Desagregada, XML) y, en algunos casos, de estados financieros y de prensa que cita esos datos. La licencia de reutilización de los datos de la SP está **[por documentar]**. Este repositorio **no pone una licencia sobre los datos**.

El HTML, el CSS y el JS se publican aquí para que se pueda inspeccionar el prototipo. Eso no autoriza a reutilizar los datos subyacentes hasta que su licencia esté clara.

## Cómo verlo

Sitio: <https://vientonorte.github.io/contra-archivo-sigue-tu-pension/>

Para servirlo en tu máquina, desde la carpeta del repositorio:

```
python3 -m http.server 8765
```

Abre la dirección que imprima el servidor (no abras `index.html` como archivo).

Parámetros opcionales: `?afp=capital&fondo=c&nivel=historia#p1` (`afp`, `fondo` a–e, `nivel` = historia, datos o fuentes, `#p0` a `#p9`).
