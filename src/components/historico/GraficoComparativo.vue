<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  CategoryScale,
  Chart,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js'

Chart.register(CategoryScale, LineController, LineElement, LinearScale, PointElement, Tooltip)

const props = defineProps({
  titulo: { type: String, required: true },
  unidade: { type: String, required: true },
  labels: { type: Array, required: true },
  datasets: { type: Array, required: true },
  valoresAtuais: { type: Array, required: true },
  temaEscuro: { type: Boolean, default: true },
  marcadoresVisiveis: { type: Boolean, default: true },
  linhasSuaves: { type: Boolean, default: true },
})

const canvas = ref(null)
const ocultos = ref(new Set())
let chart

function formatarValor(valor) {
  if (valor === null || valor === undefined) return 'Sem leitura'
  if (props.unidade === 'Estado') {
    const estado = String(valor).toUpperCase()
    return Number(valor) === 1 || estado === 'CHEIO' ? 'Cheio' : Number(valor) === 0 || estado === 'VAZIO' ? 'Vazio' : 'Sem leitura'
  }
  return `${Number(valor).toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${props.unidade}`.trim()
}

function alternarSerie(indice) {
  const visivel = chart.isDatasetVisible(indice)
  chart.setDatasetVisibility(indice, !visivel)
  chart.update()
  const novosOcultos = new Set(ocultos.value)
  visivel ? novosOcultos.add(indice) : novosOcultos.delete(indice)
  ocultos.value = novosOcultos
}

function atualizarCoresDoTema() {
  if (!chart) return
  const muted = props.temaEscuro ? '#8ca8bb' : '#5e7483'
  const line = props.temaEscuro ? '#183b56' : '#cfdae2'
  chart.options.scales.x.ticks.color = muted
  chart.options.scales.y.ticks.color = muted
  chart.options.scales.y.grid.color = line
  chart.update('none')
}

function atualizarGrafico() {
  if (!chart) return

  // 1. Limita os rótulos do eixo X aos últimos 15 registros
  chart.data.labels = props.labels.slice(-30)

  // 2. Atualiza os datasets cortando os dados nos últimos 15 e mantendo a propriedade 'hidden'
  chart.data.datasets = props.datasets.map((dataset, index) => ({
    ...dataset,
    data: Array.isArray(dataset.data) ? dataset.data.slice(-30) : [],
    hidden: ocultos.value.has(index), // Mapeia o estado salvo no Set 'ocultos'
    fill: false,
    borderWidth: 2.5,
    pointRadius: props.marcadoresVisiveis ? 3 : 1.5,
    pointHoverRadius: 5,
    tension: props.linhasSuaves ? 0.35 : 0,
  }))

  // 3. Garante que os metadados internos de visibilidade do Chart.js fiquem sincronizados
  props.datasets.forEach((_, index) => {
    chart.setDatasetVisibility(index, !ocultos.value.has(index))
  })

  chart.options.scales.y.beginAtZero = props.unidade === 'Estado'
  chart.options.scales.y.min = props.unidade === 'Estado' ? 0 : undefined
  chart.options.scales.y.max = props.unidade === 'Estado' ? 1 : undefined
  chart.options.scales.y.ticks.stepSize = props.unidade === 'Estado' ? 1 : undefined

  chart.update('none')
}

onMounted(() => {
  const estilo = getComputedStyle(canvas.value)
  const muted = estilo.getPropertyValue('--muted').trim() || '#8ca8bb'
  const line = estilo.getPropertyValue('--line').trim() || '#183b56'
  chart = new Chart(canvas.value, {
    type: 'line',
    data: { labels: props.labels, datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { intersect: false, mode: 'index' },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ({ dataset, parsed }) => `${dataset.label}: ${formatarValor(parsed.y)}` } },
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: muted, maxTicksLimit: 8, maxRotation: 0 } },
        y: { grid: { color: line }, ticks: { color: muted, callback: (valor) => props.unidade === 'Estado' ? (Number(valor) === 1 ? 'Cheio' : 'Vazio') : `${valor} ${props.unidade}`.trim() } },
      },
    },
  })
  atualizarCoresDoTema()
  atualizarGrafico()
})

watch(() => [props.labels, props.datasets, props.marcadoresVisiveis, props.linhasSuaves], atualizarGrafico, { deep: true })
watch(() => props.temaEscuro, atualizarCoresDoTema)
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <article class="comparison-chart-card">
    <header class="comparison-chart-header">
      <div>
        <h3>{{ titulo }}</h3><span class="chart-unit">{{ unidade }}</span>
      </div>
      <div class="chart-actions">
        <slot name="actions" />
      </div>
    </header>
    <div class="chart-current-values">
      <button v-for="(item, indice) in valoresAtuais" :key="item.id" type="button" class="chart-legend-item"
        :class="{ hidden: ocultos.has(indice) }" :aria-pressed="!ocultos.has(indice)" @click="alternarSerie(indice)">
        <span class="chart-legend-swatch" :style="{ '--series-color': item.cor }" />
        <span class="chart-legend-name">{{ item.nome }}</span>
        <strong>{{ formatarValor(item.valor) }}</strong>
      </button>
    </div>
    <div class="comparison-chart-canvas">
      <canvas ref="canvas" :aria-label="titulo" role="img" />
    </div>
  </article>
</template>

<style scoped>
.comparison-chart-card {
  min-width: 0;
  padding: 15px;
  border: 1px solid var(--line);
  border-radius: 7px;
  background: var(--panel);
  height: 100%;
}

.comparison-chart-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.comparison-chart-header h3 {
  color: var(--text);
  font-size: 15px;
}

.chart-unit {
  display: inline-block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 10px;
}

.chart-current-values {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 12px 0 4px;
}

.chart-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border: 1px solid var(--line);
  border-radius: 5px;
  background: transparent;
  color: var(--text);
  cursor: pointer;
}

.chart-legend-item.hidden {
  opacity: .45;
}

.chart-legend-swatch {
  flex: 0 0 8px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--series-color);
}

.chart-legend-name {
  color: var(--muted);
  font-size: 9px;
}

.comparison-chart-canvas {
  position: relative;
  width: 100%;
  height: 220px;
}

/* ==========================================================================
   Tema claro
   ========================================================================== */


/* ==========================================================================
   Responsividade
   ========================================================================== */

@media (max-width: 760px) {}
</style>