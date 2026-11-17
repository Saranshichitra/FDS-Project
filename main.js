(function startKnnSite() {
  // A preview tool may execute this file more than once in the same page.
  if (window.knnSiteStarted) return
  window.knnSiteStarted = true

  const { decisionGrid, kNearest, vote } = window.KNN

const CLASS_INFO = {
  A: { name: 'Group A', color: '#4F9DFF', shape: 'circle' },
  B: { name: 'Group B', color: '#FF9F4A', shape: 'triangle' },
  C: { name: 'Group C', color: '#5FD38D', shape: 'square' },
}

const DATASETS = {
  'Two groups': { centers: [[.32, .38], [.68, .64]], labels: ['A', 'B'], amount: 32, spread: .17 },
  'Overlapping groups': { centers: [[.38, .44], [.62, .57]], labels: ['A', 'B'], amount: 35, spread: .24 },
  'Three groups': { centers: [[.28, .32], [.72, .35], [.51, .72]], labels: ['A', 'B', 'C'], amount: 27, spread: .16 },
}

const INITIAL_QUERY = { x: .4, y: .4 }
const SVG_WIDTH = 720
const SVG_HEIGHT = 440
const INSET = 38
const INNER_WIDTH = SVG_WIDTH - INSET * 2
const INNER_HEIGHT = SVG_HEIGHT - INSET * 2
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

const elements = {
  svg: document.getElementById('scatter'),
  badge: document.getElementById('plot-badge'),
  explanation: document.getElementById('explanation'),
  play: document.getElementById('play-button'),
  dataset: document.getElementById('dataset-select'),
  reset: document.getElementById('reset-button'),
  kRange: document.getElementById('k-range'),
  kValue: document.getElementById('k-value'),
  ticks: document.getElementById('slider-ticks'),
  slowMotion: document.getElementById('slow-motion-toggle'),
  speedDescription: document.getElementById('speed-description'),
  regions: document.getElementById('regions-toggle'),
  legend: document.getElementById('legend'),
  neighbours: document.getElementById('neighbour-list'),
  vote: document.getElementById('vote-wrap'),
  live: document.getElementById('result-live'),
}

const state = {
  dataset: 'Two groups',
  points: makeData('Two groups'),
  query: { ...INITIAL_QUERY },
  k: 5,
  metric: 'euclidean',
  regions: false,
  slowMotion: true,
  step: 0,
  playing: false,
  dragging: false,
  playbackTimer: null,
}

function seededRandom(seed) {
  let value = seed >>> 0
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

function makeData(name) {
  const { centers, labels, amount, spread } = DATASETS[name]
  const random = seededRandom(name.length * 9157 + 11)
  return centers.flatMap(([cx, cy], group) => Array.from({ length: amount }, (_, index) => {
    const angle = random() * Math.PI * 2
    const radius = (random() + random() + random()) / 3 * spread
    return {
      id: `${name}-${labels[group]}-${index}`,
      x: Math.max(.035, Math.min(.965, cx + Math.cos(angle) * radius)),
      y: Math.max(.035, Math.min(.965, cy + Math.sin(angle) * radius)),
      label: labels[group],
    }
  }))
}

function px(x) { return INSET + x * INNER_WIDTH }
function py(y) { return SVG_HEIGHT - INSET - y * INNER_HEIGHT }

function svgMarker(point, size, opacity) {
  const color = CLASS_INFO[point.label].color
  const x = px(point.x)
  const y = py(point.y)
  if (CLASS_INFO[point.label].shape === 'triangle') {
    return `<path d="M ${x} ${y - size} L ${x + size} ${y + size} L ${x - size} ${y + size} Z" fill="${color}" opacity="${opacity}" />`
  }
  if (CLASS_INFO[point.label].shape === 'square') {
    return `<rect x="${x - size}" y="${y - size}" width="${size * 2}" height="${size * 2}" rx="2" fill="${color}" opacity="${opacity}" />`
  }
  return `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}" />`
}

function drawPlot(neighbours, prediction) {
  const query = state.query
  const neighbourIds = new Set(neighbours.map((point) => point.id))
  const radius = neighbours.at(-1)?.distance ?? 0
  const gridLines = Array.from({ length: 5 }, (_, index) => {
    const position = index / 4
    return `<g>
      <line x1="${px(position)}" x2="${px(position)}" y1="${INSET}" y2="${SVG_HEIGHT - INSET}" class="grid-line" />
      <line x1="${INSET}" x2="${SVG_WIDTH - INSET}" y1="${py(position)}" y2="${py(position)}" class="grid-line" />
    </g>`
  }).join('')

  const regions = state.regions
    ? decisionGrid(state.points, state.k, state.metric, 22).map((cell) => {
      const cellWidth = INNER_WIDTH / 22
      const cellHeight = INNER_HEIGHT / 22
      return `<rect x="${INSET + cell.col * cellWidth}" y="${INSET + cell.row * cellHeight}" width="${cellWidth + 1}" height="${cellHeight + 1}" fill="${CLASS_INFO[cell.label].color}" opacity=".14" />`
    }).join('')
    : ''

  // In the resting view, keep the lines to the nearest examples visible.
  // During step 1, show every distance; later steps narrow to the nearest k.
  const linePoints = state.step === 1 ? state.points : neighbours
  const lines = query ? linePoints.map((point, index) => {
    const animated = state.playing && state.step > 0
    const opacity = state.step === 1 ? .17 : .62
    const delay = state.step === 1 ? Math.min(index * .012, .55) : index * .055
    const duration = prefersReducedMotion.matches ? .01 : state.slowMotion ? .9 : .38
    return `<line
      x1="${px(query.x)}" y1="${py(query.y)}" x2="${px(point.x)}" y2="${py(point.y)}"
      class="distance-line${animated ? ' is-animated' : ''}"
      style="--line-opacity:${opacity};--line-delay:${delay}s;--line-duration:${duration}s"
      pathLength="1" />`
  }).join('') : ''

  const markers = state.points.map((point) => {
    const selected = neighbourIds.has(point.id)
    const opacity = query && state.step !== 1 && !selected ? .35 : .94
    return svgMarker(point, selected ? 6 : 4.5, opacity)
  }).join('')

  const ring = query && radius && (state.step === 0 || state.step >= 2)
    ? `<circle cx="${px(query.x)}" cy="${py(query.y)}" r="${radius * INNER_WIDTH}" class="neighbor-radius" />`
    : ''

  const diamond = query
    ? `<g class="query-marker${state.playing && state.step === 3 ? ' is-popping' : ''}">
        <path d="M ${px(query.x)} ${py(query.y) - 11} L ${px(query.x) + 11} ${py(query.y)} L ${px(query.x)} ${py(query.y) + 11} L ${px(query.x) - 11} ${py(query.y)} Z" fill="#FFFFFF" stroke="#000000" stroke-width="2" />
        <circle cx="${px(query.x)}" cy="${py(query.y)}" r="13" fill="none" stroke="#FFFFFF" stroke-width="2" />
      </g>`
    : ''

  elements.svg.innerHTML = `
    <defs><clipPath id="graph-clip"><rect x="${INSET}" y="${INSET}" width="${INNER_WIDTH}" height="${INNER_HEIGHT}" rx="12" /></clipPath></defs>
    ${gridLines}
    <g clip-path="url(#graph-clip)">
      ${regions}${ring}${lines}${markers}${diamond}
    </g>
    <g class="axis-labels">
      <text x="${SVG_WIDTH / 2}" y="${SVG_HEIGHT - 5}" text-anchor="middle">Feature 1</text>
      <text x="13" y="${SVG_HEIGHT / 2}" text-anchor="middle" transform="rotate(-90 13 ${SVG_HEIGHT / 2})">Feature 2</text>
    </g>`

  const winner = CLASS_INFO[prediction.label]
  elements.badge.innerHTML = `<i style="background:${winner.color}"></i>${winner.name} wins ${prediction.counts[prediction.label]} of ${prediction.total}`
}

function renderLegend() {
  const labels = [...new Set(state.points.map((point) => point.label))]
  elements.legend.innerHTML = labels.map((label) => {
    const info = CLASS_INFO[label]
    return `<span><b class="legend-${label.toLowerCase()}"></b>${info.name}</span>`
  }).join('') + '<span><b class="legend-query"></b>New point</span>'
}

function renderResults(neighbours, prediction) {
  elements.neighbours.innerHTML = neighbours.map((point, index) => {
    const info = CLASS_INFO[point.label]
    return `<div class="neighbour-row${state.playing && state.step === 2 ? ' is-entering' : ''}" style="--row-delay:${index * .07}s">
      <span class="rank-number">${index + 1}</span>
      <span class="shape-dot shape-${info.shape}" style="--marker:${info.color}"></span>
      <span class="neighbour-name">${info.name}</span>
      <span class="distance-number">${point.distance.toFixed(2)}</span>
    </div>`
  }).join('')

  const voteSegments = Object.entries(prediction.counts).map(([label, count]) => {
    const info = CLASS_INFO[label]
    const width = count / prediction.total * 100
    return `<span class="vote-piece${state.playing && state.step === 3 ? ' is-voting' : ''}" style="--piece-width:${width}%;--piece-color:${info.color}"></span>`
  }).join('')
  const voteLegend = Object.entries(prediction.counts).map(([label, count]) => {
    const info = CLASS_INFO[label]
    return `<span><i style="background:${info.color}"></i>${info.name}<strong>${count}</strong></span>`
  }).join('')
  elements.vote.innerHTML = `
    <div class="vote-heading"><span>Vote</span><span>${prediction.total} examples</span></div>
    <div class="vote-bar" role="img" aria-label="${Object.entries(prediction.counts).map(([label, count]) => `${CLASS_INFO[label].name}: ${count}`).join(', ')}">${voteSegments}</div>
    <div class="vote-legend">${voteLegend}</div>`
}

function explanationFor(prediction) {
  if (state.step === 1) return 'Measure: compare the new point with every example.'
  if (state.step === 2) return `Choose: keep the ${state.k} closest examples. These are its neighbours.`
  if (state.step === 3) return `Vote: ${CLASS_INFO[prediction.label].name} has ${prediction.counts[prediction.label]} of ${prediction.total} votes.`
  return `${CLASS_INFO[prediction.label].name} is the answer for this new point. Press Play the steps to see why.`
}

function render() {
  const neighbours = kNearest(state.points, state.query, state.k, state.metric)
  const prediction = vote(neighbours)
  const winner = CLASS_INFO[prediction.label]

  elements.kRange.value = String(state.k)
  elements.kValue.value = String(state.k)
  elements.kValue.textContent = String(state.k)
  elements.ticks.querySelectorAll('[data-k]').forEach((button) => {
    button.classList.toggle('tick-active', Number(button.dataset.k) === state.k)
  })
  document.querySelectorAll('[data-metric]').forEach((button) => {
    const selected = button.dataset.metric === state.metric
    button.classList.toggle('selected', selected)
    button.setAttribute('aria-pressed', String(selected))
  })

  elements.slowMotion.classList.toggle('toggle-on', state.slowMotion)
  elements.slowMotion.setAttribute('aria-checked', String(state.slowMotion))
  elements.speedDescription.textContent = state.slowMotion ? 'Steps play slowly' : 'Steps play at normal speed'
  elements.regions.classList.toggle('toggle-on', state.regions)
  elements.regions.setAttribute('aria-checked', String(state.regions))

  elements.explanation.textContent = explanationFor(prediction)
  elements.play.disabled = state.playing
  elements.play.innerHTML = state.playing
    ? `Step ${state.step} of 3${state.slowMotion ? ' · Slow motion' : ''}`
    : `${state.step === 3 ? 'Play again' : 'Play the steps'} <span aria-hidden="true">▶</span>`
  elements.live.textContent = `${winner.name} has ${prediction.counts[prediction.label]} of ${prediction.total} votes.`

  drawPlot(neighbours, prediction)
  renderLegend()
  renderResults(neighbours, prediction)
}

function stopPlayback() {
  window.clearTimeout(state.playbackTimer)
  state.playbackTimer = null
  state.playing = false
  state.step = 0
}

function scheduleNextStep() {
  window.clearTimeout(state.playbackTimer)
  const delay = prefersReducedMotion.matches ? 250 : state.slowMotion ? 2000 : 1050
  state.playbackTimer = window.setTimeout(() => {
    if (state.step >= 3) {
      state.playing = false
      state.playbackTimer = null
      render()
      return
    }
    state.step += 1
    render()
    scheduleNextStep()
  }, delay)
}

function startPlayback() {
  if (state.playing) return
  state.step = 1
  state.playing = true
  render()
  scheduleNextStep()
}

function moveQuery(event) {
  const bounds = elements.svg.getBoundingClientRect()
  const viewX = (event.clientX - bounds.left) / bounds.width * SVG_WIDTH
  const viewY = (event.clientY - bounds.top) / bounds.height * SVG_HEIGHT
  state.query = {
    x: Math.max(0, Math.min(1, (viewX - INSET) / INNER_WIDTH)),
    y: Math.max(0, Math.min(1, 1 - (viewY - INSET) / INNER_HEIGHT)),
  }
  stopPlayback()
  render()
}

elements.svg.addEventListener('pointerdown', (event) => {
  event.preventDefault()
  elements.svg.setPointerCapture(event.pointerId)
  state.dragging = true
  moveQuery(event)
})
elements.svg.addEventListener('pointermove', (event) => {
  if (state.dragging) moveQuery(event)
})
elements.svg.addEventListener('pointerup', () => { state.dragging = false })
elements.svg.addEventListener('pointercancel', () => { state.dragging = false })
elements.svg.addEventListener('keydown', (event) => {
  const delta = event.shiftKey ? .05 : .015
  const movement = { ArrowLeft: [-delta, 0], ArrowRight: [delta, 0], ArrowDown: [0, -delta], ArrowUp: [0, delta] }
  if (movement[event.key]) {
    event.preventDefault()
    state.query = {
      x: Math.max(0, Math.min(1, state.query.x + movement[event.key][0])),
      y: Math.max(0, Math.min(1, state.query.y + movement[event.key][1])),
    }
    stopPlayback()
    render()
  } else if (event.key === '+' || event.key === '=') {
    event.preventDefault()
    state.k = Math.min(15, state.k + 1)
    stopPlayback()
    render()
  } else if (event.key === '-') {
    event.preventDefault()
    state.k = Math.max(1, state.k - 1)
    stopPlayback()
    render()
  }
})

elements.dataset.addEventListener('change', () => {
  state.dataset = elements.dataset.value
  state.points = makeData(state.dataset)
  state.query = { ...INITIAL_QUERY }
  stopPlayback()
  render()
})
elements.reset.addEventListener('click', () => {
  state.query = { ...INITIAL_QUERY }
  state.k = 5
  state.metric = 'euclidean'
  state.regions = false
  stopPlayback()
  render()
})
elements.play.addEventListener('click', startPlayback)
elements.kRange.addEventListener('input', () => {
  state.k = Number(elements.kRange.value)
  stopPlayback()
  render()
})
elements.ticks.addEventListener('click', (event) => {
  const button = event.target.closest('[data-k]')
  if (!button) return
  state.k = Number(button.dataset.k)
  stopPlayback()
  render()
})
document.querySelectorAll('[data-metric]').forEach((button) => {
  button.addEventListener('click', () => {
    state.metric = button.dataset.metric
    stopPlayback()
    render()
  })
})
elements.slowMotion.addEventListener('click', () => {
  state.slowMotion = !state.slowMotion
  render()
  if (state.playing) scheduleNextStep()
})
elements.regions.addEventListener('click', () => {
  state.regions = !state.regions
  render()
})

  render()
})()
