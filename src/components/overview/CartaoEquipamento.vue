<script setup>
defineProps({
  equipamento: { type: Object, required: true },
  manual: { type: Boolean, default: false }
})

defineEmits(['toggle'])
</script>

<template>
  <button type="button" class="action-card" :class="{ on: equipamento.ativo }" :disabled="!manual"
    :aria-pressed="equipamento.ativo" :aria-label="`${equipamento.nome}: ${equipamento.ativo ? 'ligado' : 'desligado'}`"
    :style="{ '--equipment-color': equipamento.cor }" @click="$emit('toggle', equipamento)">
    <div class="action-card-top">
      <h4>{{ equipamento.nome }}</h4>
    </div>

    <div class="equipment-art" :class="equipamento.tipo" aria-hidden="true">
      <!-- BOMBA -->
      <template v-if="equipamento.tipo === 'pump'">
        <span class="pump-inlet"></span><span class="pump-body"><i></i></span><span class="pump-nozzle"></span><span
          class="pump-coupling"></span><span class="pump-motor"></span><span class="pump-foot"></span>
      </template>

      <!-- DOSADOR (Com LED no doser-head) -->
      <template v-else-if="equipamento.tipo === 'doser'">
        <span class="doser-cap"></span>
        <span class="doser-head"><i class="doser-led"></i></span>
        <span class="doser-neck"></span>
        <span class="doser-container"><span></span></span>
        <span class="doser-tube"></span>
      </template>

      <!-- MEXEDOR (Com LED no mixer-head) -->
      <template v-else-if="equipamento.tipo === 'mixer'">
        <span class="mixer-cap"></span>
        <span class="mixer-head"><i class="mixer-led"></i></span>
        <span class="mixer-shaft"></span>
        <span class="mixer-blade"></span>
      </template>

      <!-- LAMPADA (Com LED indicativo) -->
      <template v-else-if="equipamento.tipo === 'lamp'">
        <span class="lamp-body"></span>
        <span class="lamp-head"></span>
        <span class="lamp-bottom"></span>
      </template>

      <!-- SOLENOIDE (Com LED no valve-coil) -->
      <template v-else>
        <span class="valve-coil"><i class="valve-led"></i></span>
        <span class="valve-stem"></span>
        <span class="valve-body"></span>
        <span class="valve-pipe left"></span>
        <span class="valve-pipe right"></span>
      </template>
    </div>


    <span class="equipment-state" :class="{ on: equipamento.ativo }">
      <span></span>{{ equipamento.ativo ? 'LIGADA' : 'DESLIGADA' }}
    </span>
  </button>
</template>

<style scoped>
.action-card {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
  min-width: 0;
  min-height: 190px;
  padding: 13px 14px 10px;
  border: 1px solid rgba(0, 139, 207, 0.46);
  border-radius: 8px;
  background: linear-gradient(145deg, rgba(4, 27, 43, 0.95), rgba(1, 14, 24, 0.97));
  color: var(--text);
  text-align: left;
  transition: border-color 0.18s ease, filter 0.18s ease;
}

.action-card.on {
  border-color: rgba(0, 150, 218, 0.5);
}

.action-card:not(:disabled) {
  cursor: pointer;
}

.action-card:not(:disabled):hover {
  filter: brightness(1.15);
  border-color: rgba(20, 191, 255, 0.78);
}

.action-card:focus-visible,
.mode-toggle:focus-visible {
  outline: 2px solid var(--cyan);
  outline-offset: 2px;
}

.action-card:disabled {
  cursor: not-allowed;
}

.action-card-top {
  display: flex;
  align-items: center;
  min-height: 26px;
}

.action-card h4 {
  overflow-wrap: anywhere;
  color: #d6e4f7;
  font-size: 16px;
  line-height: 1.3;
}

.action-card.on .equipment-art.doser .doser-tube {
  animation: pulsa-tube 0.5s ease-in-out infinite alternate;
}

@keyframes pulsa-tube {
  0% {
    border-left: 3px solid #7ba7c5;
    border-top: 3px solid #7ba7c5;
  }

  100% {
    border-top: 6px solid #7ba7c5;
    border-left: 6px solid #7ba7c5;
  }
}

.action-card.on .equipment-art.pump {
  animation: vibra-motor 0.1s infinite;
}

@keyframes vibra-motor {
  0% {
    left: 0;
    bottom: 0;
  }

  33% {
    left: 1px;
  }

  66% {
    bottom: 1px;
  }

  100% {
    left: 0;
  }
}

/* ANIMAÇÂO DA LAMPADA UV PULSANDO */
.action-card.on .equipment-art.lamp .lamp-body {
  animation: lamp-body-pulse 1s ease-in-out infinite alternate;
}

@keyframes lamp-body-pulse {
  0% {
    opacity: 0.5;
    box-shadow: 0 0 0 color-mix(in srgb, var(--equipment-color) 60%, transparent);
  }

  100% {
    opacity: 1;
    box-shadow: 0 0 30px color-mix(in srgb, var(--equipment-color) 60%, transparent);
  }
}

/* ANIMAÇÃO DE ROTAÇÃO DAS PÁS DO MEXEDOR */
.action-card.on .equipment-art.mixer .mixer-blade {
  animation: mixer-spin 1.8s linear infinite;
}

@keyframes mixer-spin {

  0%,
  100% {
    transform: scaleX(1);
  }

  50% {
    transform: scaleX(0.2);
  }
}

/* ANIMAÇÃO DE PULSAÇÃO DOS LEDS QUANDO LIGADOS */
.action-card.on .equipment-art.mixer .mixer-led,
.action-card.on .equipment-art.doser .doser-led,
.action-card.on .equipment-art.solenoid .valve-led {
  background: var(--equipment-color);
  box-shadow: 0 0 8px var(--equipment-color);
  animation: equipment-led-pulse 1.2s ease-in-out infinite alternate;
}

@keyframes equipment-led-pulse {
  0% {
    opacity: 0.5;
    box-shadow: 0 0 2px var(--equipment-color);
  }

  100% {
    opacity: 1;
    box-shadow: 0 0 10px var(--equipment-color);
  }
}

.equipment-art {
  position: relative;
  display: block;
  flex: 1;
  width: 100%;
  min-height: 96px;
  max-width: 150px;
  margin: 0 auto;
  color: var(--equipment-color);
}

.equipment-art.pump .pump-inlet {
  top: 48%;
  left: 2%;
  width: 25%;
  height: 23%;
  border: 3px solid #148fe1;
  border-right: 0;
  border-radius: 50% 0 0 50%;
  background: linear-gradient(90deg, #07528f, #159de9);
  box-shadow: inset 4px 0 5px #043b68;
}

.equipment-art.pump .pump-body {
  top: 20%;
  left: 13%;
  width: 38%;
  height: 62%;
  border: 4px solid #249fe9;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 32%, #29c3ff 0, #1188d7 32%, #07518c 75%);
  box-shadow: inset 4px 4px 7px #8ce5ff66, inset -5px -4px 8px #002f60aa, 0 4px 6px #00101b;
}

.equipment-art.pump .pump-body i {
  position: absolute;
  top: 32%;
  left: 31%;
  width: 38%;
  aspect-ratio: 1;
  border: 3px solid #53d0ff;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #168fd8, #064879 75%);
  box-shadow: inset 0 0 0 3px #0874ba;
}

.equipment-art.pump .pump-nozzle {
  top: 9%;
  left: 37%;
  width: 17%;
  height: 20%;
  border: 3px solid #208fd2;
  border-radius: 4px 4px 2px 2px;
  background: linear-gradient(90deg, #07568f, #24b9fb, #0872bd);
  box-shadow: inset 2px 0 3px #7addff88;
}

.equipment-art.pump .pump-coupling {
  top: 43%;
  left: 46%;
  width: 12%;
  height: 18%;
  border: 2px solid #2e9bdb;
  border-radius: 3px;
  background: repeating-linear-gradient(90deg, #07558d 0 4px, #159de3 5px 7px);
}

.equipment-art.pump .pump-motor {
  top: 33%;
  left: 54%;
  width: 42%;
  height: 47%;
  border: 3px solid #1686c9;
  border-radius: 8px 12px 12px 8px;
  background: repeating-linear-gradient(90deg, #075d9e 0 6px, #1597df 7px 10px, #0b6caf 11px 13px);
  box-shadow: inset 0 5px 8px #49c7ff99, inset -4px 0 6px #003c70, 0 5px 7px #00101b;
}

.equipment-art.pump .pump-motor::before {
  position: absolute;
  top: 14%;
  right: -6px;
  width: 7px;
  height: 72%;
  border-radius: 4px;
  background: linear-gradient(90deg, #0a5791, #22a6e9);
  box-shadow: 2px 0 3px #00101b;
  content: "";
}

.equipment-art.pump .pump-motor::after {
  position: absolute;
  top: 8px;
  right: 12px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #75ddff;
  box-shadow: 0 0 5px #52caff;
  content: "";
}

.equipment-art.pump .pump-foot {
  left: 51%;
  bottom: 9%;
  width: 44%;
  height: 7px;
  border-radius: 3px;
  background: linear-gradient(#23a9f0, #05629f);
  box-shadow: 0 4px 0 #064779;
}

/* --- B. DOSADOR (DOSER) --- */
.equipment-art.doser .doser-cap {
  top: 9%;
  left: 48%;
  width: 12%;
  height: 7px;
  border-radius: 2px;
  background: linear-gradient(#ffe47d, var(--equipment-color));
  box-shadow: 0 0 9px color-mix(in srgb, var(--equipment-color) 40%, transparent);
}

.equipment-art.doser .doser-head {
  top: 17%;
  left: 36%;
  width: 35%;
  height: 35%;
  border: 2px solid #486b86;
  border-radius: 5px;
  background: linear-gradient(135deg, #31536d, #112d45);
  box-shadow: inset 0 0 0 3px #183d59, 0 4px 5px #0008;
  position: absolute;
}

.equipment-art.doser .doser-neck {
  top: 49%;
  left: 48%;
  width: 12%;
  height: 13%;
  background: #294c67;
}

.equipment-art.doser .doser-container {
  bottom: 6%;
  left: 42%;
  width: 25%;
  height: 44%;
  overflow: hidden;
  border: 3px solid #76caff;
  border-radius: 4px 4px 12px 12px;
  background: linear-gradient(90deg, color-mix(in srgb, var(--equipment-color) 88%, black), var(--equipment-color) 48%, color-mix(in srgb, var(--equipment-color) 70%, white));
  box-shadow: inset 5px 0 8px #fff3, 0 5px 7px #0008;
}

.equipment-art.doser .doser-container span {
  position: absolute;
  inset: 20% 0 0;
  background: color-mix(in srgb, var(--equipment-color) 78%, white);
  opacity: 0.28;
}

.equipment-art.doser .doser-tube {
  top: 60%;
  left: 33%;
  width: 12%;
  height: 30%;
  border-left: 3px solid #7ba7c5;
  border-top: 3px solid #7ba7c5;
  border-radius: 7px 0 0 0;

}

.equipment-art.solenoid .valve-coil {
  top: 6%;
  left: 40%;
  width: 25%;
  height: 36%;
  border: 3px solid #66839b;
  border-radius: 5px;
  background: linear-gradient(135deg, #405c74, #172f46);
  box-shadow: inset 0 0 0 3px #203e59, 0 5px 6px #0008;
  position: absolute;
}

.equipment-art.solenoid .valve-stem {
  top: 40%;
  left: 49%;
  width: 8%;
  height: 15%;
  background: #627c91;
}

.equipment-art.solenoid .valve-body {
  top: 53%;
  left: 40%;
  width: 27%;
  height: 33%;
  border-radius: 42% 42% 48% 48%;
  background: radial-gradient(circle at 40% 25%, #ffd680, var(--equipment-color) 65%, #9c6321);
  box-shadow: inset 4px 2px 5px #fff5, 0 6px 7px #0008;
}

.equipment-art.solenoid .valve-pipe {
  top: 63%;
  width: 19%;
  height: 20%;
  border-radius: 4px;
  background: linear-gradient(#ffd275, var(--equipment-color));
  box-shadow: inset 0 3px 3px #fff5;
}

.equipment-art.solenoid .valve-pipe.left {
  left: 23%;
}

.equipment-art.solenoid .valve-pipe.right {
  right: 20%;
}

.equipment-art.mixer .mixer-cap,
.equipment-art.mixer .mixer-head,
.equipment-art.mixer .mixer-shaft,
.equipment-art.mixer .mixer-blade {
  position: absolute;
  display: block;
}

.equipment-art.mixer .mixer-cap {
  top: 4%;
  left: 42%;
  width: 16%;
  height: 7px;
  border-radius: 3px;
  background: linear-gradient(90deg, #a3e635, var(--equipment-color));
  box-shadow: 0 0 9px color-mix(in srgb, var(--equipment-color) 60%, transparent);
}

.equipment-art.mixer .mixer-head {
  top: 14%;
  left: 27%;
  width: 46%;
  height: 38%;
  border: 3px solid #3d5e78;
  border-radius: 8px;
  background: linear-gradient(135deg, #1d374e, #0c1d2a);
  box-shadow: inset 0 0 0 2px #102436, 0 4px 8px #0008;
}

.equipment-art.lamp .lamp-head {
  top: 0%;
  left: 40%;
  width: 25%;
  height: 15%;
  border: 3px solid #66839b;
  border-radius: 10px 10px 0 0;
  background: linear-gradient(135deg, #405c74, #172f46);
  box-shadow: inset 0 0 0 3px #203e59, 0 5px 6px #0008;
  position: absolute;
}

.equipment-art.lamp .lamp-body {
  top: 15px;
  left: 40%;
  width: 25%;
  height: 64%;
  background: radial-gradient(circle at 40% 25%, #baaddd, var(--equipment-color) 65%, #391650);
  box-shadow: 0 0 0 color-mix(in srgb, var(--equipment-color) 60%, transparent);
  position: absolute;
}

.equipment-art.lamp .lamp-bottom {
  top: 80%;
  left: 40%;
  width: 25%;
  height: 15%;
  border: 3px solid #66839b;
  border-radius: 0 0 10px 10px;
  background: linear-gradient(135deg, #405c74, #172f46);
  box-shadow: inset 0 0 0 3px #203e59, 0 5px 6px #0008;
  position: absolute;
}

.equipment-art.mixer .mixer-led,
.equipment-art.doser .doser-led,
.equipment-art.solenoid .valve-led {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #8eb0cb;
  transition: background-color 0.2s ease, box-shadow 0.2s ease;
}

.equipment-art.mixer .mixer-shaft {
  top: 52%;
  left: 47%;
  width: 6%;
  height: 45%;
  background: linear-gradient(90deg, #37536b, #5f809d, #2a4155);
}

.equipment-art.mixer .mixer-blade {
  bottom: 10%;
  left: 25%;
  width: 50%;
  height: 12px;
  border: 2px solid #3d607d;
  border-radius: 50%;
  background: linear-gradient(180deg, #3a5871, #1e3345);
  box-shadow: 0 3px 6px #0008;
}

.pump-inlet,
.pump-body,
.pump-nozzle,
.pump-coupling,
.pump-motor,
.pump-foot,
.doser-cap,
.doser-head,
.doser-neck,
.doser-container,
.doser-tube,
.valve-coil,
.valve-stem,
.valve-body,
.valve-pipe {
  position: absolute;
  display: block;
}

.equipment-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: fit-content;
  min-width: 150px;
  min-height: 38px;
  margin: 0 auto;
  padding: 5px 13px;
  border: 1px solid rgba(0, 123, 183, 0.45);
  border-radius: 22px;
  color: #a9d4f3;
  font-size: 12px;
  font-weight: 700;
}

.equipment-state>span {
  width: 17px;
  height: 17px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #5eea9c;
  box-shadow: 0 0 9px #27d78d66;
}

.equipment-state:not(.on)>span {
  background: #687e8d;
  box-shadow: none;
}

.equipment-state:not(.on) {
  color: #91a5b3;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */

.light-theme .action-card h4 {
  color: #1e425e;
}

.light-theme .action-card h4:hover {
  color: #5a7f9b;
}

.light-theme .action-card {
  border-color: #cbdbe4;
  background: linear-gradient(145deg, #fff, #f2f7fa);
  box-shadow: 0 2px 8px rgba(29, 69, 93, 0.045);
}

.light-theme .action-card.on {
  border-color: #9bcbb8;
}

.light-theme .action-card:not(:disabled):hover {
  background: #f2fbff;
  border-color: #1685ad;
}


/* ==========================================================================
   Responsividade
   ========================================================================== */

@media (max-width: 1000px) {
  .action-card:nth-child(n + 5) {
    grid-column: span 1;
  }
}
</style>