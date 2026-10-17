# Gestión SST de Contratistas

Aplicación web de **La Movida de SST / Academia Movida SST** para gestionar el ciclo de Seguridad y Salud en el Trabajo de empresas contratistas en Venezuela.

## V1 funcional

La aplicación funciona como sitio estático en el navegador, sin compilación. **Antes de mostrar el expediente**, solicita cédula y clave de integrante y las valida con la misma función `acceso_integrante` utilizada por los simuladores de La Movida de SST. Requiere conexión para iniciar sesión; la generación de Excel depende de la biblioteca XLSX externa.

Incluye:

- Ingreso exclusivo para integrantes mediante el registro de La Movida, con sesión de 20 minutos y cierre manual.
- Dashboard del ciclo contractual y mapa de los **cuatro módulos del curso**.
- Instrumento 1: lista de verificación legal y corporativa con evidencia y responsable.
- Directorio e historial de contratistas.
- Gestión de contratos y estados.
- Clasificación de criticidad.
- Precalificación y decisión de habilitación.
- Requisitos bloqueantes.
- Puerta de preinicio.
- Mapa de interfaces / documento puente simplificado.
- Instrumento 3: IPERC por tarea crítica, ATS/permiso aplicable y estado documental (no emite autorizaciones reales).
- Seguimiento de ejecución y acciones.
- Instrumento 4: scorecard de desempeño y cierre.
- Instrumento 2: precalificación/selección ponderada SST, técnica y financiera (criterios docentes personalizables).
- Referencias diferenciadas: legislación venezolana, PDVSA e internacionales.
- Ruta guiada paso a paso con orientación didáctica en cada etapa.
- Exportación del expediente completo a Excel (.xlsx).
- Generación de informe final preparado para guardar como PDF desde el navegador.
- Caso de práctica opcional: se carga y elimina con botones independientes, sin mezclarse con los datos reales.

## Dominio

`contratista.movidasst.com`

## Referencias metodológicas principales

- LOPCYMAT y su Reglamento Parcial.
- LOTTT.
- NT-04-2023.
- PDVSA SI-S-04 Rev. 6 (2015), usada como referencia sectorial venezolana, no como obligación general.
- IOGP 423, 423-01 y 423-02.
- ISO 31000 / IEC 31010.
- ISO 45004.

## Acceso, persistencia y privacidad

1. El usuario ingresa su cédula y clave de integrante. La app invoca `POST /rest/v1/rpc/acceso_integrante` del mismo proyecto Supabase de los simuladores.
2. La sesión del navegador dura **20 minutos**; después se vuelve a solicitar autenticación. Hay hasta 5 intentos antes de un bloqueo local temporal de 15 minutos (la limitación local **no** reemplaza una protección contra fuerza bruta en servidor).
3. Cada integrante dispone de un espacio de `localStorage` con clave distinta derivada por SHA-256 de su cédula, lo que evita que la interfaz muestre automáticamente los expedientes de otro integrante desde el mismo navegador.
4. Los datos **no se sincronizan entre dispositivos**, **no están cifrados** y pueden ser leídos por quien tenga acceso técnico al almacenamiento local del navegador. Esto es una **puerta de acceso de interfaz**, no un sistema de autorización robusta sobre los expedientes. No guardar datos médicos ni información sensible. El uso productivo multiusuario requiere backend autenticado, políticas RLS, almacenamiento cifrado y controles de autorización en servidor.
5. Los expedientes anónimos de la versión anterior permanecen en la clave `movidasst_contratistas_v1` hasta que el integrante autorice su migración desde **Respaldo local**. Nunca se transfieren silenciosamente al primer usuario que inicie sesión.

## Alineación con el curso

| Módulo | Contenido aplicado | Instrumento |
|---|---|---|
| **1. Marco normativo y responsabilidades** | LOPCYMAT, Reglamento, NT-04, requisitos corporativos y distinción de fuentes | Lista legal/corporativa con evidencias |
| **2. Proceso de gestión** | Definición de alcance, criticidad, precalificación, selección, interfaz y preinicio | Evaluación de capacidad y decisión |
| **3. Ejecución y control** | IPERC, ATS, registro documental de permisos, controles de tareas críticas, seguimiento de hallazgos | IPERC y permiso por tarea |
| **4. Evaluación y mejora** | Indicadores, desempeño, brechas, cierre y recomendaciones | Scorecard e informe PDF |

**Alcances:** las escalas de puntuación son metodología de enseñanza y requieren aprobación interna antes de utilizarse en decisiones contractuales. Una casilla marcada o un «permiso emitido» registrado en la app no autoriza trabajos. API RP 1646 solo es aplicable como referencia contextual a su sector.

## Identidad

**La Movida de SST**  
De la Reacción a la Prevención  
https://www.movidasst.com

## Ampliación API RP 1646 (2025) — integrada como referencia sectorial

- Catálogo contextual de controles para tareas críticas, con **estado, evidencia, fecha y responsable**.
- La nueva vista de controles complementa, pero **no sustituye**, precalificación ni puerta de preinicio.
- La exportación Excel incorpora las hojas **Controles API**, **Lista legal y corporativa** e **IPERC y permisos**; el informe PDF incluye anexos para los instrumentos 1 y 3.
- Nuevo respaldo JSON local y restauración con validación estructural, límite de tamaño y confirmación previa.
- Se evita eliminar registros antiguos con identificadores genéricos al cargar o borrar el ejemplo.
- No se permite pasar manualmente a «Habilitado» o «En ejecución» si precalificación o preinicio están pendientes o bloqueados.
- Se advierte sobre la privacidad: hay validación de integrante para abrir la interfaz, pero el almacenamiento sigue siendo `localStorage`, sin cifrado ni sincronización multiusuario; no existe autorización de datos del lado del servidor.

**Referencia:** American Petroleum Institute, API RP 1646:2025, tercera edición, *Safe Work Practices for Contractors Working at Petroleum Dispensing and Storage Facilities* (Prácticas de trabajo seguro para contratistas en instalaciones de suministro y almacenamiento de productos petrolíferos). Se usa como **referencia sectorial orientativa**, no como obligación legal general en Venezuela.

### Pruebas de aceptación antes de publicar

1. Crear un contratista y contrato con tareas críticas; registrar controles, responsables y evidencias.
2. Comprobar que «Conforme» sin evidencia no se acepta y que «No aplica» exige justificación.
3. Exportar Excel y comprobar la nueva hoja; generar el PDF y verificar el anexo de controles.
4. Descargar y restaurar un respaldo de prueba, verificando que no se pierden contratos.
5. Intentar marcar «Habilitado» sin precalificación/preinicio satisfactorios.
6. Cargar/eliminar el ejemplo y confirmar que los datos ajenos al ejemplo permanecen intactos.
7. Validar la navegación, lectura y edición en un dispositivo móvil.

Validar las pruebas automatizadas de GitHub Actions y repetir en navegador real antes de usar información empresarial.
