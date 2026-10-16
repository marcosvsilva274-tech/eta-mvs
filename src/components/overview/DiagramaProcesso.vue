<script setup>
import { computed } from 'vue'

const props = defineProps({
  equipamentos: { type: Array, required: true },
  tanquesPainel: { type: Array, required: true },
  manual: { type: Boolean, default: false },
  ehVisitante: { type: Boolean, default: false }
})

const emit = defineEmits(['equipamento-toggle'])

// Auxiliar para obter a leitura atual do sensor no tanque correspondente
function getValorSensor(tanqueId, sensorChave) {
  const tanque = props.tanquesPainel.find((t) => t.id === tanqueId)
  if (!tanque || !tanque.medicoes) return 'Sem leitura'
  const medicao = tanque.medicoes.find((m) => m.chave === sensorChave)
  return medicao ? medicao.valor : 'Sem leitura'
}

// Auxiliar para buscar equipamento por código de comando (PM1, RM1, SV1, etc)
function eq(comando) {
  return props.equipamentos.find((item) => item.comando === comando) || {
    nome: comando,
    comando,
    ativo: false,
    cor: '#08a9dc'
  }
}

// Auxiliar para obter percentual de nível dos tanques
function getNivel(id) {
  const t = props.tanquesPainel.find((tanque) => tanque.id === id)
  return t ? t.percentualNivel : 50
}

function alternar(comando) {
  const item = props.equipamentos.find((e) => e.comando === comando)
  if (item && props.manual) {
    emit('equipamento-toggle', item)
  }
}

// Estados dinâmicos do fluxo de cada tubulação
const fluxoTubulacao1 = computed(() => eq('PM1').ativo) // Armazenamento -> Ativos
const fluxoTubulacao2Filtro = computed(() => eq('PM2').ativo && eq('SV2').ativo && !eq('SV1').ativo) // Ativos -> Filtração
const fluxoTubulacao3Tratado = computed(() => eq('SV2').ativo && eq('PM2').ativo && !eq('SV1').ativo) // Filtração -> Armazenagem Tratado
const fluxoTubulacao2Efluente = computed(() => eq('PM2').ativo && eq('SV1').ativo && !eq('SV2').ativo) // Ativos -> Efluentes
const fluxoTubulacao4Retorno = computed(() => eq('PM3').ativo) // Efluentes -> Retorno Armazenamento
</script>

<template>
  <div class="process-diagram-card">
    <header class="diagram-header">
      <div>
        <span class="section-kicker">SINOPIA DA PLANTA</span>
        <h2>Diagrama de Processo com Tubulações de Mídia</h2>
      </div>
      <div class="diagram-legend">
        <span class="legend-item"><i class="dot active"></i> Fluxo Ativo</span>
        <small v-if="!manual && !ehVisitante" class="manual-lock-msg">🔒 Alterne para MANUAL para acionar</small>
      </div>
    </header>

    <div class="diagram-viewport">
      <!-- MÁSCARA SVG DE TUBULAÇÕES E CONEXÕES HIDRÁULICAS -->
      <svg class="pipes-svg-layer" viewBox="0 0 1100 460" preserveAspectRatio="none">
        <defs>
          <linearGradient id="pipeMetal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#3a566d" />
            <stop offset="50%" stop-color="#1e3242" />
            <stop offset="100%" stop-color="#0e1b26" />
          </linearGradient>
        </defs>

        <!-- TUBULAÇÃO 1: Armazenamento -> Ativos (Via PM1) -->
        <g id="pipe-armaz" class="pipe-group" :class="{ flowing: fluxoTubulacao1 }">
          <path d="M 207 250 H 280 V 90 H 297" class="pipe-bg" />
          <path d="M 207 250 H 280 V 90 H 297" class="pipe-flow water-cyan" />
        </g>

        <!-- TUBULAÇÃO 2A: Ativos -> Filtro (Via PM2 / SV2) -->
        <g id="pipe-ativ-filtro" class=" pipe-group" :class="{ flowing: fluxoTubulacao2Filtro }">
          <path d="M 530 250 V 250 H 590 V 200 H 627" class="pipe-bg" />
          <path d="M 530 250 V 250 H 590 V 200 H 627" class="pipe-flow water-cyan" />
        </g>

        <!-- TUBULAÇÃO 3: Filtro -> Armazenagem Tratado -->
        <g id="pipe-filtro-final" class="pipe-group" :class="{ flowing: fluxoTubulacao3Tratado }">
          <path d="M 730 200 H 770 V 155 H 790" class="pipe-bg" />
          <path d="M 730 200 H 770 V 155 H 790" class="pipe-flow water-cyan" />
        </g>
        
        <!-- TUBULAÇÃO 2B: Ativos -> Efluentes (Via SV1) -->
        <g id="pipe-ativ-eflu" class="pipe-group" :class="{ flowing: fluxoTubulacao2Efluente }">
          <path d="M 440 280 V 320 H 440" class="pipe-bg brown" />
          <path d="M 440 280 V 320 H 440" class="pipe-flow water-brown" />
        </g>

        <!-- TUBULAÇÃO 4: Efluentes -> Retorno Armazenamento (Via PM3) -->
        <g id="pipe-eflu-armaz" class="pipe-group" :class="{ flowing: fluxoTubulacao4Retorno }">
          <path d="M 485 440 H 30 V 100 H 55" class="pipe-bg" />
          <path d="M 485 440 H 30 V 100 H 55" class="pipe-flow water-cyan" />
        </g>


      </svg>

      <!-- CAMADA DE RESERVATÓRIOS E ATUADORES -->
      <div class="diagram-canvas">
        <!-- 1. ARMAZENAMENTO -->
        <div class="diagram-vessel-box tank-armaz">
          <span class="vessel-num-title">1. ARMAZENAMENTO</span>
          <div class="vessel-frame rect-vessel">
            <div class="vessel-probes top-probes">
              <span class="probe temp" :title="`Temperatura: ${getValorSensor('agua-bruta', 'temperatura')}`">
                T
                <div class="popup">{{getValorSensor('agua-bruta', 'temperatura')}}</div>
              </span>
              
            </div>
            <div class="vessel-water-fill" :style="{ height: `${getNivel('agua-bruta')}%` }"></div>
          </div>

          <button type="button" class="actuator-btn pump-btn pm1" :class="{ active: eq('PM1').ativo }"
            :disabled="!manual" :title="`${eq('PM1').nome}`" @click="alternar('PM1')">
            <span class="actuator-icon">⚙</span>
            <strong>PM1</strong>
            <small>{{ eq('PM1').ativo ? 'LIG' : 'DESL' }}</small>
          </button>
        </div>

        <!-- 2. ATIVOS -->
        <div class="diagram-vessel-box tank-ativos">
          <span class="vessel-num-title">2. ATIVOS</span>

          <div class="doser-group">
            <button type="button" class="actuator-btn doser-btn dm1" :class="{ active: eq('DM1').ativo }"
              :disabled="!manual" :title="`${eq('DM1').nome}`" @click="alternar('DM1')">
              <span class="doser-drop-icon">💧</span>
              <strong>DM1</strong>
              <small>Coagulante</small>
            </button>

            <button type="button" class="actuator-btn doser-btn dm2" :class="{ active: eq('DM2').ativo }"
              :disabled="!manual" :title="`${eq('DM2').nome}`" @click="alternar('DM2')">
              <span class="doser-drop-icon">🧪</span>
              <strong>DM2</strong>
              <small>Alcalin.</small>
            </button>

            <button type="button" class="actuator-btn doser-btn dm3" :class="{ active: eq('DM3').ativo }"
              :disabled="!manual" :title="`${eq('DM3').nome}`" @click="alternar('DM3')">
              <span class="doser-drop-icon">🛡</span>
              <strong>DM3</strong>
              <small>Sanitiz.</small>
            </button>
          </div>

          <div class="vessel-frame conical-vessel">
            <!-- SENSORES COM TITLE DINÂMICO PARA pH E TURBIDEZ -->
            <div class="vessel-probes">
              <span class="probe ph" :title="`pH: ${getValorSensor('tanque-ativos', 'ph')}`">
                pH
                <div class="popup">{{getValorSensor('tanque-ativos', 'ph')}}</div>
              </span>
              <span class="probe temp" :title="`Temperatura: ${getValorSensor('tanque-ativos', 'temperatura')}`">
                T
                <div class="popup">{{getValorSensor('tanque-ativos', 'temperatura')}}</div>
              </span>
              <span class="probe tb" :title="`Turbidez: ${getValorSensor('tanque-ativos', 'turbidez')}`">
                TB
                <div class="popup">{{getValorSensor('tanque-ativos', 'turbidez')}}</div>
              </span>
            </div>

            <button type="button" class="actuator-btn mixer-btn rm1" :class="{ active: eq('RM1').ativo }"
              :disabled="!manual" :title="`${eq('RM1').nome}`" @click="alternar('RM1')">
              <span class="mixer-blades" :class="{ spinning: eq('RM1').ativo }">❖</span>
              <strong>RM1</strong>
            </button>

            <div class="vessel-water-fill" :style="{ height: `${getNivel('tanque-ativos')}%` }"></div>
            <div class="sediment-layer" title="Decantação de Sedimentos"></div>
          </div>

          <div class="bottom-actuators-row">
            <button type="button" class="actuator-btn pump-btn pm2" :class="{ active: eq('PM2').ativo }"
              :disabled="!manual" :title="`${eq('PM2').nome}`" @click="alternar('PM2')">
              <span class="actuator-icon">⚙</span>
              <strong>PM2</strong>
            </button>

            <button type="button" class="actuator-btn valve-btn sv1" :class="{ active: eq('SV1').ativo }"
              :disabled="!manual" :title="`${eq('SV1').nome}`" @click="alternar('SV1')">
              <strong>SV1</strong>
              <small>Efluente</small>
            </button>

            <button type="button" class="actuator-btn valve-btn sv2" :class="{ active: eq('SV2').ativo }"
              :disabled="!manual" :title="`${eq('SV2').nome}`" @click="alternar('SV2')">
              <strong>SV2</strong>
              <small>Filtro</small>
            </button>
          </div>
        </div>

        <!-- 3. FILTRAÇÃO -->
        <div class="diagram-vessel-box tank-filtro">
          <span class="vessel-num-title">3. FILTRAÇÃO</span>
          <div class="vessel-frame column-filter-vessel">
            <div class="filter-media-layer"></div>
          </div>
        </div>

        <!-- 4. ARMAZENAGEM TRATADO -->
        <div class="diagram-vessel-box tank-tratado">
          <span class="vessel-num-title">4. ARMAZENAGEM TRATADO</span>

          <div class="vessel-frame rect-vessel">
            <!-- SENSORES COM TITLE DINÂMICO PARA pH, TEMPERATURA E TURBIDEZ -->
            <div class="vessel-probes top-probes">
              <span class="probe ph" :title="`pH: ${getValorSensor('agua-tratada', 'ph')}`">
                pH
                <div class="popup">{{getValorSensor('agua-tratada', 'ph')}}</div>
              </span>
              <span class="probe temp" :title="`Temperatura: ${getValorSensor('agua-tratada', 'temperatura')}`">
                T
                <div class="popup">{{getValorSensor('agua-tratada', 'temperatura')}}</div>
              </span>
              <span class="probe tb" :title="`Turbidez: ${getValorSensor('agua-tratada', 'turbidez')}`">
                TB
                <div class="popup">{{getValorSensor('agua-tratada', 'turbidez')}}</div>
              </span>
            </div>

            <button type="button" class="actuator-btn mixer-btn rm2" :class="{ active: eq('RM2').ativo }"
              :disabled="!manual" :title="`${eq('RM2').nome}`" @click="alternar('RM2')">
              <span class="mixer-blades" :class="{ spinning: eq('RM2').ativo }">❖</span>
              <strong>RM2</strong>
            </button>

            <button type="button" class="actuator-btn uv-btn h1" :class="{ active: eq('H1').ativo }" :disabled="!manual"
              :title="`${eq('H1').nome}`" @click="alternar('H1')">
              <span class="uv-glow-icon">⚡</span>
              <strong>H1 (UV)</strong>
            </button>

            <div class="vessel-water-fill treated-water" :style="{ height: `${getNivel('agua-tratada')}%` }"></div>
          </div>
        </div>

        <!-- 5. EFLUENTES -->
        <div class="diagram-vessel-box tank-efluentes">
          <span class="vessel-num-title">5. EFLUENTES</span>
          <div class="vessel-frame horizontal-vessel">
            <div class="vessel-water-fill efluente-water" :style="{ height: `${getNivel('efluentes')}%` }"></div>
          </div>

          <button type="button" class="actuator-btn pump-btn pm3" :class="{ active: eq('PM3').ativo }"
            :disabled="!manual" :title="`${eq('PM3').nome}`" @click="alternar('PM3')">
            <span class="actuator-icon">⚙</span>
            <strong>PM3</strong>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.popup{
  display: none;
  position: absolute;
  border-radius: 10px;
  padding: 3px;
  width: 34px;
  text-align: center;
}

.probe.temp .popup {
  background-color: #ff5361;
}

.probe.ph .popup {
  background-color: #00e59c;
}

.probe.tb .popup {
  background-color: #34b3ee;
}

.process-diagram-card {
  margin: 24px 0;
  padding: 20px;
  border: 1px solid rgba(0, 151, 218, 0.4);
  border-radius: 12px;
  background: rgba(3, 16, 27, 0.94);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.diagram-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(24, 59, 86, 0.8);
}

.diagram-header h2 {
  margin-top: 4px;
  color: var(--text);
  font-size: 20px;
}

.diagram-legend {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}

.legend-item .dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.legend-item .dot.active {
  background: var(--green);
  box-shadow: 0 0 8px var(--green);
}

.legend-item .dot.inactive {
  background: #526778;
}

.manual-lock-msg {
  color: var(--amber);
  font-weight: 600;
}

.diagram-viewport {
  position: relative;
  width: 100%;
  max-width: 1200px;
  min-height: 460px;
  max-height: 650px;
  margin: auto;
}

.pipes-svg-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.pipe-bg {
  fill: none;
  stroke: url(#pipeMetal);
  stroke-width: 12;
  stroke-linecap: round;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.pipe-bg.brown {
  stroke: #482a17;
}

.pipe-joint {
  fill: #4c6d87;
  stroke: #162a38;
  stroke-width: 2;
}

.pipe-flow {
  fill: none;
  stroke-width: 5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 8 12;
  opacity: 0;
  transition: opacity 0.3s ease;
  vector-effect: non-scaling-stroke;
}

.pipe-flow.water-cyan {
  stroke: #16b9f4;
}

.pipe-flow.water-brown {
  stroke: #d97736;
}

.pipe-group.flowing .pipe-flow {
  opacity: 1;
  animation: pipe-flow-animation 0.8s linear infinite;
}

@keyframes pipe-flow-animation {
  from {
    stroke-dashoffset: 40;
  }

  to {
    stroke-dashoffset: 0;
  }
}

.diagram-canvas {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: 1fr 1.3fr 0.8fr 1.2fr;
  grid-template-rows: auto auto;
  gap: 20px 24px;
  align-items: end;
  padding: 10px 0;
  width: 90%;
  margin: auto;
}

.diagram-vessel-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

.vessel-num-title {
  margin-bottom: 10px;
  color: var(--cyan);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-align: center;
}

.vessel-frame {
  position: relative;
  width: 85%;
  border: 4px solid #82a2bc;
  background: rgba(6, 26, 41, 0.88);
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.6);
  overflow: hidden;
}

.rect-vessel {
  height: 190px;
  border-radius: 8px 8px 14px 14px;
}

.conical-vessel {
  height: 200px;
  clip-path: polygon(0 0, 100% 0, 100% 75%, 55% 100%, 45% 100%, 0 75%);
  border-radius: 8px;
}

.column-filter-vessel {
  height: 210px;
  width: 75px;
  border-radius: 30px 30px 10px 10px;
  border-color: #617b91;
  background: repeating-linear-gradient(180deg, #182d3e 0 15px, #0b1824 16px 30px);
}

.filter-media-layer {
  position: absolute;
  inset: 25% 6px 10px;
  background: repeating-linear-gradient(45deg, #2b3945 0 8px, #16212a 9px 16px);
  border-radius: 4px;
}

.horizontal-vessel {
  height: 110px;
  width: 50%;
  border-radius: 12px;
  margin-top: 30px;
}

.vessel-water-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #18b5f4, #086eb0);
  opacity: 0.85;
  transition: height 0.4s ease;
}

.vessel-water-fill.treated-water {
  background: linear-gradient(180deg, #32d6ff, #0a88dc);
}

.vessel-water-fill.efluente-water {
  background: linear-gradient(180deg, #a86236, #5c2f14);
}

.sediment-layer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 35px;
  background: linear-gradient(180deg, rgba(160, 88, 41, 0.7), #542b12);
}

.vessel-probes {
  position: absolute;
  top: 8px;
  right: 10px;
  z-index: 3;
  display: flex;
  gap: 15px;
}

.probe {
  display: grid;
  place-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  cursor: pointer;
}

.probe.ph {
  background: #19e69a;
  color: #052618;
}

.probe.tb {
  background: #16b9f4;
  color: #03202c;
}

.probe.temp {
  background: #ff5361;
  color: #3b0307;
}

.doser-group {
  display: flex;
  gap: 6px;
  margin-bottom: 8px;
}

.actuator-btn {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border: 1px solid rgba(100, 160, 200, 0.35);
  border-radius: 6px;
  background: rgba(10, 32, 48, 0.95);
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 5;
  width: 60px;
  height: 60px;
}

.actuator-btn:not(:disabled):hover {
  border-color: var(--cyan);
  color: #fff;
}

.actuator-btn:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.actuator-btn.active {
  background: rgba(25, 230, 154, 0.22);
  border-color: var(--green);
  color: #ffffff;
  box-shadow: 0 0 10px rgba(25, 230, 154, 0.3);
}

.actuator-btn strong {
  font-size: 11px;
}

.actuator-btn small {
  font-size: 9px;
  opacity: 0.8;
}

.actuator-btn.valve-btn {
  width: 46px;
  height: 46px;
  margin-top: 22px;
}

.actuator-btn.pump-btn {
  margin-top: 15px;
}

.mixer-btn {
  position: absolute;
  top: 33%;
  left: 50%;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  width: 48px;
  height: 48px;
  padding: 0;
}

.mixer-blades.spinning {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% {
    transform: rotate(360deg);
  }
}

.uv-btn {
  position: absolute;
  right: 12px;
  top: 60%;
  height: 60px;
}

.uv-btn.active {
  background: rgba(168, 85, 247, 0.3);
  border-color: #c084fc;
  box-shadow: 0 0 14px rgba(192, 132, 252, 0.5);
}

.bottom-actuators-row {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.tank-efluentes {
  grid-column: 2 / span 2;
  grid-row: 2;
  margin-top: 10px;
}

/* ==========================================================================
   SUPORTE AO TEMA CLARO (LIGHT THEME)
   ========================================================================== */
.light-theme .process-diagram-card {
  border-color: var(--line);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 4px 18px rgba(29, 69, 93, 0.08);
}

.light-theme .diagram-header {
  border-bottom-color: var(--line);
}

.light-theme .pipe-bg {
  stroke: #a0b4c4;
}

.light-theme .pipe-bg.brown {
  stroke: #8a5737;
}

.light-theme .pipe-joint {
  fill: #b4c8d8;
  stroke: #7e9bb0;
}

.light-theme .vessel-frame {
  border-color: #a4bece;
  background: rgba(235, 243, 248, 0.9);
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.12);
}

.light-theme .column-filter-vessel {
  border-color: #a4bece;
  background: repeating-linear-gradient(180deg, #d8e5ed 0 15px, #c3d5e2 16px 30px);
}

.light-theme .filter-media-layer {
  background: repeating-linear-gradient(45deg, #718898 0 8px, #516776 9px 16px);
}

.light-theme .actuator-btn {
  border-color: #b9cedc;
  background: #f0f6fa;
  color: var(--muted);
}

.light-theme .actuator-btn:not(:disabled):hover {
  border-color: var(--cyan);
  color: var(--text);
  background: #e4f1f8;
}

.light-theme .actuator-btn.active {
  background: rgba(8, 122, 80, 0.15);
  border-color: var(--green);
  color: #054830;
  box-shadow: 0 0 8px rgba(8, 122, 80, 0.25);
}

.light-theme .uv-btn.active {
  background: rgba(168, 85, 247, 0.18);
  border-color: #a855f7;
  color: #581c87;
  box-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
}

/* RESPONSIVIDADE */
@media (max-width: 1024px) {
  /* .pipes-svg-layer {
    display: none;
  } */

  .popup{
    display: block;
  }

  #pipe-armaz>path {
    d: path("M 710 80 H 1080 V 140 H 1020");
  }

  #pipe-ativ-filtro>path {
    d: path("M 890 210 V 210 H 971 V 252 H 730");
  }

  #pipe-filtro-final>path {
    d: path("M 730 295 H 1070 V 335 H 1020");
  }

  #pipe-ativ-eflu>path {
    d: path("M 570 222 V 226 H 180 V 317 H 180");
  }

  #pipe-eflu-armaz>path {
    d: path("M 390 450 H 30 V 20 H 55");
  }



  .diagram-canvas {
    grid-template-columns: 1fr;
  }

  .tank-efluentes {
    grid-column: span 1;
    grid-row: 5;
  }

  .diagram-viewport {
    max-height: 100%;
    width: 500px;
  }

  .diagram-vessel-box:nth-child(n + 2) {
    margin-top: 20px;
  }

  .tank-efluentes[data-v-5564cfe0] {
    grid-column: 1 / span 1;
    grid-row: 5;
  }

  .horizontal-vessel {
    margin-top: 0;
  }
}

@media (max-width: 600px) {
  .diagram-canvas {
    grid-template-columns: 1fr;
  }

  .diagram-viewport {
    width: 100%;
  }
}
</style>