# Supervisório ETA

Interface web de supervisão para uma estação de tratamento de água, feita com Vue 3 e Vite. O painel apresenta sensores, etapas do processo, equipamentos e alarmes. Sem conexão configurada, os dados exibidos são demonstrativos.

## Executar

Requer Node.js e npm.

```sh
npm install
npm run dev
```

Para gerar a versão de produção:

```sh
npm run build
```

## WebSocket

Defina `VITE_WS_URL` em um arquivo `.env.local` para conectar o painel ao backend:

```env
VITE_WS_URL=ws://localhost:8080
```

O painel espera mensagens JSON com leituras em `sensores`, identificadas por `ph`, `temperatura`, `turbidez` e `nivel`:

```json
{"sensores":{"ph":7.12,"temperatura":24.3,"turbidez":0.82,"nivel":86}}
```

O login atual usa credenciais demonstrativas locais e nao substitui autenticacao de producao.
