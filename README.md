# LiveElectricityBill

Página simple para estimar el importe de la factura eléctrica del mes en curso usando datos de i-DE/Datadis y Huawei FusionSolar.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Configuración

Los conectores están simulados en `lib/providers`. Sustituye esos módulos por llamadas reales a:

- i-DE/Datadis para consumo horario/diario.
- Huawei FusionSolar Northbound API para importación/exportación, producción y consumo.

La tarifa por defecto está en `lib/config.ts`.
