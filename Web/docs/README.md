# Arquitectura Frontend

Proyecto desarrollado con Angular, organizado por responsabilidades y funcionalidades.

## Estructura

```text
src/
└── app/
    ├── core/
    │   ├── auth/
    │   ├── guards/
    │   └── service/
    │
    ├── shared/
    │   └── components/
    │
    └── features/
        ├── auth/
        ├── dashboard/
        └── profile/
```

### `core/`

Contiene la infraestructura transversal de la aplicación.

- **`auth/`**: todo lo relacionado con autenticación y sesión: login, logout, tokens y usuario autenticado.
- **`guards/`**: control de acceso a rutas protegidas.
- **`service/`**: servicios generales utilizados por distintas partes de la aplicación.

### `shared/`

Contiene componentes reutilizables entre diferentes funcionalidades.

Ejemplos:

```text
shared/components/
├── alert/
├── message/
├── modal/
├── loading/
└── confirmation-dialog/
```

Un componente debe estar en `shared` cuando no pertenece a un dominio específico y puede ser utilizado por varias features.

### `features/`

Contiene las funcionalidades principales del sistema, organizadas por dominio.

Ejemplo:

```text
features/
├── auth/
├── dashboard/
├── profile/
├── containers/
└── alerts/
```

Cada feature puede organizarse internamente según sus necesidades:

```text
feature/
├── pages/
├── components/
├── services/
└── models/
```

- **`pages/`**: pantallas asociadas a rutas.
- **`components/`**: componentes propios de la funcionalidad.
- **`services/`**: lógica y comunicación con el backend de esa feature.
- **`models/`**: interfaces y tipos específicos.

## Regla general

```text
core     → infraestructura global
shared   → componentes reutilizables
features → funcionalidades del negocio
```

La organización debe priorizar **responsabilidad, reutilización y dominio**, evitando mezclar lógica de diferentes funcionalidades.
