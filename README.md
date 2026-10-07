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
- Exportación e importación de respaldo JSON.
- Impresión / guardado a PDF desde el navegador.

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

La V1 guarda la información en el navegador. La siguiente fase prevista es conectar **Supabase** para autenticación, almacenamiento multiusuario, roles, evidencias y reportes compartidos.

## Identidad

**La Movida de SST**  
De la Reacción a la Prevención  
https://www.movidasst.com
