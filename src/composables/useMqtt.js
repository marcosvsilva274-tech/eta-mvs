// src/composables/useMqtt.js
import { ref, onMounted, onBeforeUnmount } from 'vue'
import mqtt from 'mqtt'

export function useMqtt(onTelemetria, onAlerta) {
  const mqttStatus = ref('offline')
  const etapaAtual = ref('Inicial')

  let client = null
  let watchdogTimer = null

  const host = import.meta.env.VITE_MQTT_HOST || '90d42cec75d14181b23673d72f964713.s1.eu.hivemq.cloud'
  const port = import.meta.env.VITE_MQTT_PORT || '8884'
  const path = import.meta.env.VITE_MQTT_PATH || '/mqtt'
  const username = import.meta.env.VITE_MQTT_USER || 'operador'
  const password = import.meta.env.VITE_MQTT_PASS || 'senha123'

  const topicoTelemetria = import.meta.env.VITE_MQTT_TOPIC_TELEMETRIA || 'eta/telemetria'
  const topicoAlertas = import.meta.env.VITE_MQTT_TOPIC_ALERTAS || 'eta/alertas'
  const topicoComandos = import.meta.env.VITE_MQTT_TOPIC_COMANDOS || 'eta/comandos'

  function reiniciarWatchdog() {
    window.clearTimeout(watchdogTimer)
    mqttStatus.value = 'online'

    watchdogTimer = window.setTimeout(() => {
      mqttStatus.value = 'offline'
      console.warn('⚠️ Telemetria não recebida há mais de 5 segundos. ESP32 offline.')
    }, 5000)
  }

  function publicarComando(comandoTexto) {
    if (client && client.connected) {
      client.publish(topicoComandos, String(comandoTexto), { qos: 1 })
      console.log(`📤 Comando publicado [${topicoComandos}]: ${comandoTexto}`)
    } else {
      console.warn('Não foi possível publicar comando: Cliente MQTT desconectado.')
    }
  }

  function conectar() {
    if (client) {
      client.removeAllListeners()
      client.end(true)
      client = null
    }

    const url = `wss://${host}:${port}${path}`

    client = mqtt.connect(url, {
      username,
      password,
      clientId: 'supervisorio_vue_' + Math.random().toString(16).substring(2, 8),
      clean: true,
      keepalive: 30,
      reconnectPeriod: 3000,
      connectTimeout: 5000,
    })

    client.on('connect', () => {
      console.log('✅ Conectado ao HiveMQ Cloud via WebSockets!')

      client.subscribe([topicoTelemetria, topicoAlertas], (err) => {
        if (!err) {
          publicarComando('UPDATE_ALL')
        }
      })

      reiniciarWatchdog()
    })

    client.on('message', (topic, payload) => {
      const payloadTexto = payload.toString().trim()

      if (topic === topicoTelemetria) {
        reiniciarWatchdog()
        try {
          const pacote = JSON.parse(payloadTexto)
          if (onTelemetria) onTelemetria(pacote)
          if (pacote.etapa_processo !== undefined) {
            etapaAtual.value = pacote.etapa_processo
          }
        } catch (erro) {
          console.error('Erro ao processar JSON de telemetria:', erro)
        }
      } else if (topic === topicoAlertas) {
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

    client.on('error', () => {
      mqttStatus.value = 'offline'
      window.clearTimeout(watchdogTimer)
    })

    client.on('close', () => {
      mqttStatus.value = 'offline'
      window.clearTimeout(watchdogTimer)
    })
  }

  onMounted(() => {
    conectar()
  })

  onBeforeUnmount(() => {
    window.clearTimeout(watchdogTimer)
    if (client) {
      client.removeAllListeners()
      client.end(true)
      client = null
    }
  })

  return {
    etapaAtual,
    mqttStatus,
    publicarComando
  }
}