# Proyecto Ingenieria Sofware Pequeñas Faenas Mineras
## Descripcion
La problemática comienza por que las faenas no cuentan con un sistema accesible que permita un control confiable y auditable del trabajo de los mineros al entrar o salir de las faenas, además de su ubicación precisa lo que compromete la capacidad de respuesta ante emergencias o el cumplimiento de las normas de seguridad minera.
## Integrantes del Proyecto
- BENJAMIN CONCHA NAVARRO
## Arquitectura
Para este sistema se seleccionó una arquitectura cliente-servidor con una estructura en capas, incorporando el almacenamiento local y una sincronización con un servidor central.

Esta arquitectura permitirá que el sistema continúe funcionando durante periodos sin conectividad, almacenando temporalmente los registros de forma local y cuando se restablezca la comunicación, estos registros podrán sincronizarse con el servidor central. 

Arquitectura:
- Cliente: interfaz utilizada por los trabajadores autorizados
- Lógica de negocio: gestión de trabajadores, movimientos, incidentes, auditoría y sincronización
- Almacenamiento local: conserva los registros durante la desconectividad
- Servidor central: recibe y centraliza los registros sincronizados
- Base de datos central: almacena la información consolidada
## Tecnologias Utilizadas
- HTML y CSS: Construcción de la interfaz del sistema
- JavaScript: Validaciones, interacción y lógica básica de la interfaz
- Node.js: Implementación del servidor y lógica del sistema
- Express.js: Creación de las rutas y servicios del sistema
- SQLite: Almacenamiento local de los registros cuando no exista conectividad
- Github: Control de versiones y respaldo del proyecto
## Organizacion del repositorio
Las carpetas princiaples dentro de Git son el CSS, JS, NODE para algunas de las funcionales o diseño del trabajo