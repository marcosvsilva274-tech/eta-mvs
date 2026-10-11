import { ref, onMounted, onBeforeUnmount } from 'vue'
import mqtt from 'mqtt'

/**
 * Composable responsável por gerenciar a conexão WebSocket Segura (WSS) com o HiveMQ,
 * escutar mensagens de telemetria/alertas e publicar comandos para a automação.
 * 
 * @param {Function} onTelemetria - Callback executado ao receber pacote válido de telemetria (JSON)
 * @param {Function} onAlerta - Callback executado ao receber mensagem de alerta (CSV)
 */
export function useMqtt(onTelemetria, onAlerta) {
  // Estado reativo para indicar a conexão com o broker/ESP32 ('online' | 'offline')
  const mqttStatus = ref('offline')
  
  let client = null
  let watchdogTimer = null

  // Credenciais e configurações do HiveMQ extraídas das variáveis de ambiente (.env.local)
  const host = import.meta.env.VITE_MQTT_HOST || '90d42cec75d14181b23673d72f964713.s1.eu.hivemq.cloud'
  const port = import.meta.env.VITE_MQTT_PORT || '8884'
  const path = import.meta.env.VITE_MQTT_PATH || '/mqtt'
  const username = import.meta.env.VITE_MQTT_USER || 'operador'
  const password = import.meta.env.VITE_MQTT_PASS || 'senha123'

  // Tópicos padrão do sistema
  const topicoTelemetria = import.meta.env.VITE_MQTT_TOPIC_TELEMETRIA || 'eta/telemetria'
  const topicoAlertas = import.meta.env.VITE_MQTT_TOPIC_ALERTAS || 'eta/alertas'
  const topicoComandos = import.meta.env.VITE_MQTT_TOPIC_COMANDOS || 'eta/comandos'

  /**
   * Monitora a frequência da telemetria (Watchdog Timer).
   * Se não recebermos telemetria por mais de 5 segundos, definimos o status para 'offline'.
   */
  function reiniciarWatchdog() {
    window.clearTimeout(watchdogTimer)
    mqttStatus.value = 'online'

    watchdogTimer = window.setTimeout(() => {
      mqttStatus.value = 'offline'
      console.warn('⚠️ Telemetria não recebida há mais de 5 segundos. ESP32 offline.')
    }, 5000)
  }

  /**
   * Envia uma mensagem/comando em texto puro para o tópico de comandos (eta/comandos).
   * @param {string} comandoTexto - Exemplo: 'MANUAL', 'PM1', 'alerta/9', 'UPDATE_ALL'
   */
  function publicarComando(comandoTexto) {
    if (client && client.connected) {
      client.publish(topicoComandos, String(comandoTexto), { qos: 1 })
      console.log(`📤 Comando publicado [${topicoComandos}]: ${comandoTexto}`)
    } else {
      console.warn('Não foi possível publicar comando: Cliente MQTT desconectado.')
    }
  }

  /**
   * Inicializa a conexão com o broker MQTT via WebSockets
   */
  function conectar() {
    const url = `wss://${host}:${port}${path}`

    client = mqtt.connect(url, {
      username,
      password,
      clientId: 'supervisorio_vue_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      reconnectPeriod: 3000, // Tenta reconectar a cada 3 segundos se a conexão cair
      connectTimeout: 5000,
    })

    // Evento chamado ao conectar com sucesso no HiveMQ
    client.on('connect', () => {
      console.log('✅ Conectado ao HiveMQ Cloud via WebSockets!')

      // Inscreve o supervisório nos tópicos de dados de telemetria e alertas simultaneamente
      client.subscribe([topicoTelemetria, topicoAlertas], (err) => {
        if (err) {
          console.error('Erro ao se inscrever nos tópicos MQTT:', err)
        } else {
          console.log(`📡 Inscrito em: ${topicoTelemetria} e ${topicoAlertas}`)
          // Solicita sincronização completa dos estados assim que estabelece conexão
          publicarComando('UPDATE_ALL')
        }
      })

      // Inicia a verificação de atividade do controlador
      reiniciarWatchdog()
    })

    // Evento chamado sempre que uma mensagem chega de qualquer tópico inscrito
    client.on('message', (topic, payload) => {
      const payloadTexto = payload.toString().trim()

      // Tratamento para pacote de telemetria
      if (topic === topicoTelemetria) {
        reiniciarWatchdog() // Renova a contagem de 5 segundos
        try {
          const pacote = JSON.parse(payloadTexto)
          if (onTelemetria) onTelemetria(pacote)
        } catch (erro) {
          console.error('Erro ao processar JSON de telemetria:', erro)
        }
      } 
      // Tratamento para mensagens de alertas (Formato: "Código;Severidade;Descritivo")
      else if (topic === topicoAlertas) {
        const partes = payloadTexto.split(';')
        if (partes.length >= 3) {
          const codigo = partes[0].trim()
          const severidade = Number(partes[1].trim())
          const descricao = partes.slice(2).join(';').trim()

          if (onAlerta) {
            onAlerta({ codigo, severidade, descricao })
          }
        }
      }
    })

    // Tratamento de falhas de rede
    client.on('error', (err) => {
      console.error('⚠️ Erro no cliente MQTT:', err)
      mqttStatus.value = 'offline'
      window.clearTimeout(watchdogTimer)
    })

    client.on('close', () => {
      mqttStatus.value = 'offline'
      window.clearTimeout(watchdogTimer)
    })
  }

  // Registra a conexão na montagem do componente
  onMounted(() => {
    conectar()
  })

  // Limpa o timer e fecha o cliente MQTT no encerramento do ciclo de vida
  onBeforeUnmount(() => {
    window.clearTimeout(watchdogTimer)
    if (client) client.end()
  })

  return {
    mqttStatus,
    publicarComando
  }
}