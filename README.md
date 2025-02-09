# Enaid IA Financial Bot

This WhatsApp bot combines the power of [Baileys](https://github.com/adiwajshing/Baileys) and [Coinbase AgentKit](https://portal.cdp.coinbase.com/access/api) to carry out financial transactions, manage wallets, and execute purchases directly through WhatsApp.

## Key Features

- **Financial Transactions:** Integrates Coinbase AgentKit to enable transfers and purchases of digital assets.
- **Powered by Baileys:** Stable connection with WhatsApp to send and receive messages.
- **Data Management:** Can be configured with [Supabase](https://supabase.com/) to store user and transaction data.
- **TypeScript Architecture:** Strong typing for greater reliability and scalability.
- **Docker Support:** Includes a `docker-compose.yml` file for simplified deployment.

## Requirements

- **Node.js 14+**
- [Coinbase AgentKit](https://portal.cdp.coinbase.com/access/api) with API keys
- [Supabase CLI](https://supabase.com/docs/guides/cli) (optional, for database management)
- [Docker](https://www.docker.com/) (optional, for container deployment)

### Verify Node.js Version

Run the following commands to verify your Node.js and pnpm versions:

```bash
node --version
pnpm --version
```

## Installation

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/Odig0/Enaid.git
   cd Enaid
   ```
2. **Install Dependencies:**
   ```bash
   pnpm install
   ```

## Environment Variables

Create or edit a `.env` file at the root of the project with the following variables:

```env
GOOGLE_CLIENT_EMAIL=NO
GOOGLE_PRIVATE_KEY=NO
DATABASE_HOST=localhost
DATABASE_NAME=WhatsappBot
DATABASE_PASSWORD=postgres
DATABASE_USERNAME=postgres
DATABASE_URL=postgres://postgres:postgres@localhost/WhatsappBot
CDP_API_KEY_NAME=""
CDP_API_KEY_PRIVATE_KEY=""
OPENAI_API_KEY=""
```

> Adjust these values according to your credentials and configuration.

## Running the Bot

### Development Mode

```bash
pnpm run dev
```

When the bot starts, it will display a **QR code** in the terminal. Open WhatsApp, go to **WhatsApp Web**, and scan the displayed QR code to link your account.

### QR Code Scanning

Once linked, the bot can send and receive messages. For instance, you can check your balance or initiate a transaction:

```bash
!balance
!transfer 0.01ETH to 0x12345...
```

The bot will use Coinbase AgentKit to perform the operation.

### Docker Usage

If you prefer to use Docker, run:

```bash
docker-compose up
```

This will start the service inside a container with all dependencies configured.

## Funding a Wallet (Faucet)

If you are on Base Sepolia or a compatible testnet, you can add funds to your wallet using a faucet. For example, run:

```bash
/coinbase faucet
```

The bot will wait for the on-chain transaction confirmation and notify you once it is completed:

```bash
Faucet transaction completed successfully.
```

To check your balance:

```bash
/coinbase balance
```

## Transferring Funds

Once your wallet has funds, you can transfer them to another account. If you want to send funds to your MetaMask wallet (e.g. `0x77370fd...`), use:

```bash
/coinbase transfer 0.00001 ETH to 0x77370fd...
```

The bot will confirm once the transaction is successfully finalized.

## Example Commands

- **Check Balance:**

  ```bash
  /coinbase balance
  ```
  Shows the configured wallet balance.

- **Transfer Assets:**

  ```bash
  /coinbase transfer 0.05ETH to 0xABCDEF...
  ```
  Transfers the specified amount of ETH to the chosen address.

- **Buy Tokens:**

  ```bash
  /coinbase buy TOKEN_SYMBOL amount
  ```
  Executes a token purchase using AgentKit.

- **Check Address:**

  ```bash
  /coinbase cual es mi address
  ```
  The bot responds with your account and configured address:

  ```
  Bot: Wallet: 38693f84-b674-457d-a773-83c2d1ed77bd on base-sepolia network
  Default address: 0x644dC3a1C26e7747c47b7dF216646Df7a765CA35
  Your address is: 0x644dC3a1C26e7747c47b7dF216646Df7a765CA35
  ```

## Contributions

Contributions are welcome. To propose improvements:

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature/new-functionality
   ```
3. Make your changes and commit.
4. Open a Pull Request with a detailed description of your updates.

## License

This project is licensed under the **MIT** License.


------------------------------------------------------------------------------------------------------------------------------------------------------
------------------------------------------------------------------------------------------------------------------------------------------------------

# Enaid WhatsAppBot Financiero

Este bot de WhatsApp combina la potencia de [Baileys](https://github.com/adiwajshing/Baileys) con [AgentKit de Coinbase](https://portal.cdp.coinbase.com/access/api) para realizar transacciones financieras, gestionar billeteras y ejecutar compras directamente a través de WhatsApp.

## Características Principales

- **Operaciones Financieras:** Integra AgentKit de Coinbase para permitir transferencias y compras de activos digitales.
- **Basado en Baileys:** Conexión estable con WhatsApp para enviar y recibir mensajes.
- **Gestión de Datos:** Se puede configurar con [Supabase](https://supabase.com/) para almacenar información de usuarios y transacciones.
- **Arquitectura en TypeScript:** Código tipado para mayor confiabilidad y escalabilidad.
- **Soporte para Docker:** Incluye `docker-compose.yml` para simplificar la implementación.

## Requisitos

- **Node.js 14+**
- [AgentKit de Coinbase](https://portal.cdp.coinbase.com/access/api) con sus claves de API
- [Supabase CLI](https://supabase.com/docs/guides/cli) (opcional, para gestionar la base de datos)
- [Docker](https://www.docker.com/) (opcional, para desplegar en contenedores)

### Verificar Versión de Node.js

Ejecute los siguientes comandos para comprobar su versión de Node.js y pnpm:

```bash
node --version
pnpm --version
```

## Instalación

1. **Clonar el repositorio:**
```bash
git clone https://github.com/Odig0/Enaid.git
cd Enaid
```
2. **Instalar dependencias:**
```bash
pnpm install
```

## Configuración de Variables de Entorno

Cree o edite un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
GOOGLE_CLIENT_EMAIL=NO
GOOGLE_PRIVATE_KEY=NO
DATABASE_HOST=localhost
DATABASE_NAME=WhatsappBot
DATABASE_PASSWORD=postgres
DATABASE_USERNAME=postgres
DATABASE_URL=postgres://postgres:postgres@localhost/WhatsappBot
CDP_API_KEY_NAME=""
CDP_API_KEY_PRIVATE_KEY=""
OPENAI_API_KEY=""
```

> Ajuste estos valores según sus credenciales y configuración.

## Ejecución del Bot

### Modo Desarrollo

```bash
pnpm run dev
```

Al iniciar, se generará un **código QR** en la terminal. Escanéelo con WhatsApp en la sección **WhatsApp Web** para vincular su cuenta.

### Escaneo de Código QR

Una vez vinculado, el bot podrá enviar y recibir mensajes. Por ejemplo, puede consultar su saldo o iniciar una transacción:

```bash
!balance
!transfer 0.01ETH to 0x12345...
```

El bot utilizará AgentKit de Coinbase para realizar la operación.

### Uso con Docker

Si desea usar Docker, ejecute:

```bash
docker-compose up
```

Esto iniciará el servicio dentro de un contenedor con todas las dependencias configuradas.

## Funding de Billetera (Faucet)

Si estás en Base Sepolia o una testnet compatible, puedes añadir fondos a tu billetera mediante una faucet. Por ejemplo, ejecuta:

```bash
/coinbase faucet
```

El bot esperará a que la transacción se confirme on-chain y te notificará cuando esté completada:

```bash
Faucet transaction completed successfully.
```

Para verificar tu saldo:

```bash
/coinbase balance
```

## Transferencia de Fondos

Una vez que tu billetera tiene fondos, puedes transferirlos a otra cuenta. Si deseas transferir a tu billetera de MetaMask, por ejemplo `0x77370fd2f08c9ea9E439460C8Ced941627957065`, utiliza:

```bash
/coinbase transfer 0.00001 ETH to 0x77370fd2f08c9ea9E439460C8Ced941627957065
```

El bot confirmará cuando la transacción se haya completado con éxito.

## Ejemplos de Comandos

- **Consultar Saldo:**

```bash
/coinbase balance
```

Muestra el saldo de la billetera configurada.

- **Transferir Activos:**

```bash
/coinbase transfer 0.05ETH to 0xABCDEF...
```

Realiza una transferencia de la cantidad especificada de ETH a la dirección elegida.

- **Comprar Tokens:**

```bash
/coinbase buy TOKEN_SYMBOL cantidad
```

Ejecuta una compra de activos utilizando AgentKit.

- **Consultar Dirección:**

```bash
/coinbase cual es mi address
```

El bot responderá con la información de tu cuenta y la dirección configurada:

```
Bot: Wallet: 38693f84-b674-457d-a773-83c2d1ed77bd en la red base-sepolia
Dirección predeterminada: 0x644dC3a1C26e7747c47b7dF216646Df7a765CA35
Tu dirección es: 0x644dC3a1C26e7747c47b7dF216646Df7a765CA35
```

## Contribuciones

Contribuciones son bienvenidas. Para proponer mejoras:

1. Haga un *fork* del repositorio.
2. Cree una nueva rama:
```bash
git checkout -b feature/nueva-funcionalidad
```
3. Realice sus cambios y *commits*.
4. Abra un *Pull Request* describiendo en detalle sus aportes.

## Licencia

Este proyecto se distribuye bajo la Licencia **MIT**.
