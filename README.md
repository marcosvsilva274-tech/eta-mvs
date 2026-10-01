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

Os gráficos comparativos exigem que cada leitura seja associada ao tanque. Envie os sensores dentro do ID correspondente: `agua-bruta`, `tanque-ativos`, `agua-tratada` ou `efluentes`. As variáveis aceitas são `turbidez`, `ph`, `temperatura` e `nivel` (percentual):

```json
{
	"timestamp": "2026-10-01T12:00:00.000Z",
	"sensores": {
		"agua-bruta": { "turbidez": 1.2, "temperatura": 24.3, "nivel": 78 },
		"tanque-ativos": { "turbidez": 2.0, "ph": 7.1, "nivel": 64 },
		"agua-tratada": { "turbidez": 0.8, "ph": 7.2, "temperatura": 24.3, "nivel": 86 },
		"efluentes": { "nivel": 47 }
	}
}
```

Sem esse formato, os gráficos exibem dados demonstrativos. Leituras recebidas são mantidas no armazenamento local do navegador, com limite de 2.000 registros; o payload antigo com sensores globais continua atualizando o resumo, mas não permite compará-los por tanque.

O login atual usa credenciais demonstrativas locais e nao substitui autenticacao de producao.
