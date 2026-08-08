# Live Electricity Bill

Demo de Minarro Labs para estimar una factura eléctrica mensual con autoconsumo fotovoltaico.

La aplicación reúne en un único dashboard:

- consumo total de la vivienda;
- energía importada de la red;
- producción fotovoltaica;
- excedentes compensados;
- coste de energía, términos fijos e impuestos;
- ahorro estimado frente a una vivienda sin autoconsumo;
- autoconsumo y cobertura solar;
- comparación entre la lectura del contador y la del inversor.

## Datos de demostración

La versión pública utiliza un mes completo de datos simulados y deterministas. Los valores varían según el mes, los fines de semana, días nublados y episodios de mayor demanda, pero no pertenecen a una vivienda real.

Los datos mantienen relaciones coherentes:

```text
consumo del hogar = autoconsumo directo + compra de red
producción solar = autoconsumo directo + excedentes
```

El proveedor que representa Datadis incorpora un pequeño desfase respecto al inversor para mostrar cómo se comparan fuentes diferentes.

## Desarrollo

```bash
npm ci
npm run dev
```

Abre `http://localhost:3000`.

Comprobación de producción:

```bash
npm run build
npm run start
```

## Endpoints

- `/` — dashboard demostrativo;
- `/api/summary` — resumen mensual en JSON;
- `/api/summary?month=2026-07` — resumen para un mes concreto;
- `/api/health` — comprobación de salud para el despliegue.

## Despliegue en Render

El repositorio incluye `render.yaml` para crear un servicio web Node.js mediante un Blueprint.

1. En Render, crea un **Blueprint** desde este repositorio.
2. Despliega la rama `main` cuando la PR haya sido fusionada.
3. Añade el dominio personalizado `live-electricity-bill.minarrolabs.dev`.
4. En Namecheap, crea el CNAME que Render indique para el servicio.

La aplicación escucha en `0.0.0.0:$PORT` y expone `/api/health` para las comprobaciones de Render.

## Tecnología

- Next.js 14;
- React 18;
- TypeScript;
- renderizado en servidor;
- SVG y CSS sin librerías de gráficos;
- arquitectura por proveedores para sustituir los datos simulados por integraciones reales.
