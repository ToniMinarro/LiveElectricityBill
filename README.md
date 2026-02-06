# LiveElectricityBill

Página simple para estimar el importe de la factura eléctrica del mes en curso usando datos de Datadis y Huawei FusionSolar.

<img width="1026" height="923" alt="image" src="https://github.com/user-attachments/assets/caa7079b-4a3e-4f29-95c5-3b4f324faf27" />

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Configuración

Los conectores están simulados en `lib/providers`. Sustituye esos módulos por llamadas reales a:

- Datadis para consumo horario/diario.
- Huawei FusionSolar Northbound API para importación/exportación, producción y consumo.

### Variables de entorno para Datadis

Configura estas variables y deja las credenciales reales en tu entorno (por ejemplo, `.env.local`):

```bash
DATADIS_AUTH_URL="https://.../auth"
DATADIS_CONSUMPTION_URL="https://.../consumption"
DATADIS_USERNAME="tu-usuario"
DATADIS_PASSWORD="tu-password"
DATADIS_CUPS="ESXXXXXXXXXXXXXXXX"
```

Si ya tienes un token, puedes usar `DATADIS_TOKEN` en lugar de usuario/contraseña.

La tarifa por defecto está en `lib/config.ts`.
