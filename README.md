# Gestión SST de Contratistas

Aplicación web de **La Movida de SST / Academia Movida SST** para gestionar el ciclo de Seguridad y Salud en el Trabajo de empresas contratistas en Venezuela.

## V1 funcional

La primera versión funciona directamente en el navegador y utiliza `localStorage` para persistencia local. No requiere compilación ni dependencias externas.

Incluye:

- Dashboard del ciclo contractual.
- Directorio e historial de contratistas.
- Gestión de contratos y estados.
- Clasificación de criticidad.
- Precalificación y decisión de habilitación.
- Requisitos bloqueantes.
- Puerta de preinicio.
- Mapa de interfaces / documento puente simplificado.
- Seguimiento de ejecución y acciones.
- Scorecard de desempeño y cierre.
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

## Persistencia

La V1 guarda automáticamente la información en el navegador para simplificar la experiencia del participante. El producto entregable es el **expediente Excel** y el **informe PDF**. La siguiente fase prevista es conectar **Supabase** para autenticación, almacenamiento multiusuario, roles, evidencias y reportes compartidos.

## Identidad

**La Movida de SST**  
De la Reacción a la Prevención  
https://www.movidasst.com

## Ampliación API RP 1646 (2025) — pendiente de revisión y fusión

- Catálogo contextual de controles para tareas críticas, con **estado, evidencia, fecha y responsable**.
- La nueva vista de controles complementa, pero **no sustituye**, precalificación ni puerta de preinicio.
- La exportación Excel incorpora la hoja **Controles API** y el informe PDF un anexo adicional.
- Nuevo respaldo JSON local y restauración con validación estructural, límite de tamaño y confirmación previa.
- Se evita eliminar registros antiguos con identificadores genéricos al cargar o borrar el ejemplo.
- No se permite pasar manualmente a «Habilitado» o «En ejecución» si precalificación o preinicio están pendientes o bloqueados.
- Se advierte sobre la privacidad: el almacenamiento sigue siendo `localStorage`, sin cifrado, autenticación ni sincronización multiusuario.

**Referencia:** American Petroleum Institute, API RP 1646:2025, tercera edición, *Safe Work Practices for Contractors Working at Petroleum Dispensing and Storage Facilities* (Prácticas de trabajo seguro para contratistas en instalaciones de suministro y almacenamiento de productos petrolíferos). Se usa como **referencia sectorial orientativa**, no como obligación legal general en Venezuela.

### Pruebas de aceptación antes de publicar

1. Crear un contratista y contrato con tareas críticas; registrar controles, responsables y evidencias.
2. Comprobar que «Conforme» sin evidencia no se acepta y que «No aplica» exige justificación.
3. Exportar Excel y comprobar la nueva hoja; generar el PDF y verificar el anexo de controles.
4. Descargar y restaurar un respaldo de prueba, verificando que no se pierden contratos.
5. Intentar marcar «Habilitado» sin precalificación/preinicio satisfactorios.
6. Cargar/eliminar el ejemplo y confirmar que los datos ajenos al ejemplo permanecen intactos.
7. Validar la navegación, lectura y edición en un dispositivo móvil.

No despliegue automático hasta completar pruebas manuales en navegador.
