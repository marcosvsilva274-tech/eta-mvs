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
  marcadoresVisiveis: { type: Boolean, default: false },
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

function atualizarGrafico() {
  if (!chart) return
  chart.data.labels = props.labels
  chart.data.datasets = props.datasets.map((dataset) => ({
    ...dataset,
    fill: false,
    borderWidth: 2.5,
    pointRadius: props.marcadoresVisiveis ? 3 : 1.5,
    pointHoverRadius: 5,
    tension: props.linhasSuaves ? 0.35 : 0,
  }))
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
  atualizarGrafico()
})

watch(() => [props.labels, props.datasets, props.marcadoresVisiveis, props.linhasSuaves], atualizarGrafico, { deep: true })
onBeforeUnmount(() => chart?.destroy())
</script>

<template>
  <article class="comparison-chart-card">
    <header class="comparison-chart-header">
      <div><h3>{{ titulo }}</h3><span class="chart-unit">{{ unidade }}</span></div>
      <div class="chart-actions"><slot name="actions" /></div>
    </header>
    <div class="chart-current-values">
      <button
        v-for="(item, indice) in valoresAtuais"
        :key="item.id"
        type="button"
        class="chart-legend-item"
        :class="{ hidden: ocultos.has(indice) }"
        :aria-pressed="!ocultos.has(indice)"
        @click="alternarSerie(indice)"
      >
        <span class="chart-legend-swatch" :style="{ '--series-color': item.cor }" />
        <span class="chart-legend-name">{{ item.nome }}</span>
        <strong>{{ formatarValor(item.valor) }}</strong>
      </button>
    </div>
    <div class="comparison-chart-canvas">
      <canvas ref="canvas" :aria-label="titulo" role="img" />
      <p v-if="!labels.length" class="chart-empty-state">Sem leituras neste período.</p>
    </div>
    <slot name="options" />
  </article>
</template>