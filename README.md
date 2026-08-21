# Proyecto PortIA Web
# Integrantes
  - Ignacio Andrade
  - Airon Saez
  - Nicolas Soto

Este repositorio contiene el cliente web de PortIA, la interfaz principal con la que interactuaran los usuarios. Es el punto de control centralizado donde la IA, los datos portuarios en tiempo real y la automatización convergen en esta experiencia visual.

# Descripción
## ¿Que hace?
PortIA_Web es un dashboard de control en tiempo real, es el asistente que unifica el seguimiento de contenedores marítimos.A través de un sistema de semáforos y alertas push, este web consolida las cuatro verdades distintas (Maritima, Documental, Portuaria y Administrativa) en una sola pantalla. Permite visualizar estados críticos y disparar flujos de trabajo (como la redacción de correos automáticos al agente de aduana) con un solo clic. 

## ¿A quien va dirigido?
A encargados de Comercio Exterior en empresas importadoras grandes que manejan aproximadamente entre 30 y 100 contenedores simultáneamente y que actualmente sufren una alta carga cognitiva coordinando la logística mediante Excel, correos y WhatsApp.

## ¿Que problema resuelve?
El ecosistema Chileno opera con infraestructura de datos fragmentada. La información vital esta atrapada en PDFs mutantes que se llaman Bill of Lading o en silos de transitarios que son los Forwarders. Esta dependencia humana para actualizar los Excel que son cientos de acciones manuales al mes provoca errores de desfase que se traducen en multas de Demurrage y Detention.
Resolvemos esto al:
  - Eliminar el ojo humano del rastreo y consolidar la información extraída por la IA.
  - Notificar proactivamente con latencia menor a 60 segundos cuando un contenedor entra a estado critico.
  - Actuar como un puente de acción para autorizar comunicaciones oficiales.

## Tecnologías usadas
Frontend:
  - Framework: Angular.
  - Real-time: SignalR (WebSockets) para recibir alertas del semáforo sin recargar la pagina.
  - UI/UX: Diseño orientado a sistema de semaforos.

Core:

  - Framework: ASP NET CORE 10
  - Lenguaje: C#
  - Arquitectura: N-Capas
  - Base de datos: PostgreSQL

Agentes:

  - Lenguaje: Python
  - API: Deepsek
  - Base de datos: Redis (Cache)

Mensajeria:

  - RabbitMQ
