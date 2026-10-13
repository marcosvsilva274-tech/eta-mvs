# Supervisório ETA — Estação de Tratamento de Água

Interface web supervisory/SCADA desenvolvida com **Vue 3** e **Vite** para monitoramento, controle e visualização em tempo real de uma Estação de Tratamento de Água (ETA), integrada a controladores ESP32 via protocolo MQTT / WebSocket.

---

## Recursos Principais

### Conectividade e Saúde do Sistema

- **Integração MQTT / ESP32**: Comunicação bidirecional para envio de comandos de acionamento e recebimento de telemetria dos sensores e estado dos atuadores.
- **Watchdog (5s)**: Monitoramento contínuo da conexão. Em caso de reconexão automática, dispara o comando `UPDATE_ALL` para sincronizar o estado da planta.

### Acompanhamento do Processo Automatizado (17 Etapas)

- Mapeamento dinâmico do campo `etapa_atual` recebido via JSON no MQTT para descrições amigáveis e acompanhamento numérico de progresso (**1 a 17 etapas**).
- **Barra de Progresso Visual**: Exibição da porcentagem de conclusão do ciclo automático e destaque da etapa em execução tanto no painel de equipamentos quanto na faixa de status.

### Modos de Operação Dinâmicos

- **AUTOMÁTICO**: Visualização do ciclo sequencial e progresso das etapas.
- **MANUAL**: Liberação dos cartões de acionamento para controle direto dos atuadores por reservatório (paleta amarelada no botão e faixa de status).
- **PARADA TOTAL**: Bloqueio visual e operacional de segurança (paleta avermelhada).

### Gestão de Acesso e Alarmes

- Modal de detalhes de medição por tanque.
- Controle de usuários (Admin/Operador) com persistência em `localStorage`.
- Central de alarmes com filtro por severidade e confirmação (*ack*).

---

## Executar o Projeto

### Requisitos

- **Node.js** (v18 ou superior)
- **npm** / **yarn** / **pnpm**

```sh
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev
```

---

## Protocolo de Comunicação MQTT / JSON

Defina a URL do servidor em um arquivo `.env.local`:

```env
VITE_WS_URL=ws://localhost:8080
```

### Estrutura do Payload JSON (Telemetria)

O ESP32 deve enviar as leituras e o estado do processo utilizando a estrutura JSON abaixo:

```json
{
  "timestamp": "2026-10-12T12:00:00.000Z",
  "etapa_atual": "DosandoCoagulante",
  "modo": "AUTOMÁTICO",
  "sensores": {
    "agua-bruta": { 
      "turbidez": 1.2, 
      "temperatura": 24.3, 
      "nivelPercentual": 85, 
      "nivelAlto": true, 
      "nivelBaixo": false 
    },
    "tanque-ativos": { 
      "turbidez": 2.0, 
      "ph": 7.1, 
      "nivelPercentual": 64, 
      "nivelAlto": false, 
      "nivelBaixo": false 
    },
    "agua-tratada": { 
      "turbidez": 0.8, 
      "ph": 7.2, 
      "temperatura": 24.3, 
      "nivelPercentual": 90, 
      "nivelAlto": true, 
      "nivelBaixo": false 
    },
    "efluentes": { 
      "nivelPercentual": 10, 
      "nivelAlto": false, 
      "nivelBaixo": true 
    }
  }
}
```

---

## Tabela de Etapas do Processo Automatizado

O sistema mapeia o valor da chave `etapa_atual` para a seguinte sequência contínua de 14 etapas, as etapas marcadas como #5 fazem parte do processo de tratamento quimico:

| # | Chave JSON (`etapa_atual`) | Descrição Exibida na Interface |
|---|----------------------------|--------------------------------|
| **1** | `Inicial` | Enchendo Tanque de Armazenamento |
| **2** | `VerificNivelAltoArmaz` | Verificando Nível Alto (Armazenamento) |
| **3** | `EsvaziandoTqArmaz` | Esvaziando Tanque de Armazenamento |
| **4** | `VerificTransferenciaAtivos` | Verificando Nível (Tanque de Ativos) |
| **5** | `DosandoCoagulante` | Dosando Coagulante |
| **5** | `VerificandoPh` | Verificando pH |
| **5** | `DosandoAlcalinizante` | Dosando Alcalinizante |
| **5** | `DosandoSanitizante` | Dosando Sanitizante |
| **6** | `PreparaCoagulacao` | Homogeneização / Preparo Coagulação |
| **7** | `Decantacao` | Aguardando Decantação |
| **8** | `PreparandoLibercaoSedimentos` | Preparando Liberação de Sedimentos |
| **9** | `RemovendoSedimentos` | Removendo Sedimentos |
| **10** | `PreparandoEsvaziamentoAtivos` | Preparando Esvaziamento de Ativos |
| **11** | `EsvaziandoTanqueAtivos` | Esvaziando Tanque de Ativos |
| **12** | `VerificTransferenciaFinal` | Verificando Nível (Tanque Final) |
| **13** | `TratamentoUv` | Tratamento com Luz UV |
| **14** | `Finalizado` | Processo Finalizado |

---

## 🔑 Acesso Demonstrativo

Caso o sistema esteja rodando sem broker MQTT ativo, ele carregará dados demonstrativos para simulação visual.

- **Administrador**: `admin` / `admin123`
- **Operador**: `operador` / `senha123`
