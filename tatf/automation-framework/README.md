# Estructura del proyecto

## Interfaces

| Entidad  | Descripción                                                                                                       |
|----------|-------------------------------------------------------------------------------------------------------------------|
| IBrowser | Interfaz que define operaciones comunes para la gestión del navegador y la espera de elementos en una página web. |
| IVerify  | Interfaz que define métodos para verificar resultados esperados con obtenidos y agregar mensajes asociados.       |

## Patrones aplicados

| Patrón     | Entidad                 | Descripción                                                               |
|------------|-------------------------|---------------------------------------------------------------------------|
| Factory    | DriverManagerFactory    | Clase encargada de indicar que driver se debe retornar.                   |
| Singlenton | DriverManagerSinglenton | Clase encargada de mantener una sola instancia configurada con un driver. |
