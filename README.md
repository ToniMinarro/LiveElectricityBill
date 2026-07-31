# Live Electricity Bill

Demo pública de Minarrolabs para visualizar consumo eléctrico, producción fotovoltaica, importación de red, excedentes y una estimación detallada de la factura mensual.

La aplicación utiliza un mes completo de datos simulados y deterministas. Los valores presentan variaciones de consumo, fines de semana, producción solar y nubosidad para ofrecer una experiencia realista sin utilizar datos personales ni credenciales externas.

## Funcionalidades

- estimación del importe mensual;
- consumo total de la vivienda;
- producción y cobertura solar;
- importación de red y excedentes;
- compensación simplificada;
- desglose de energía, costes fijos e impuestos;
- gráfico diario de producción y consumo;
- comparación entre distribuidora e inversor;
- detalle de los últimos días registrados.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Validación

```bash
npm run build
npm run start
```

## Despliegue recomendado

El proyecto está preparado para desplegarse en Vercel como aplicación Next.js.

1. Importar el repositorio `ToniMinarro/LiveElectricityBill` en Vercel.
2. Usar la configuración automática de Next.js.
3. Desplegar la rama `main` después de fusionar la PR.
4. Añadir el dominio `live-electricity-bill.minarrolabs.dev` en Vercel.
5. Crear en Namecheap el registro DNS solicitado por Vercel.

Dominio previsto:

```text
https://live-electricity-bill.minarrolabs.dev
```

## Tecnología

- Next.js 14;
- React 18;
- TypeScript;
- API Route para preparar el resumen mensual;
- CSS responsive sin librerías de gráficos.

## Privacidad

Todos los datos de la demo son simulados. La aplicación no consulta Datadis, Huawei FusionSolar ni ninguna instalación real.
