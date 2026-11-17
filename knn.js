// KNN math used by main.js.
// Every point has an x and y position from 0 to 1, plus a group label.

// Measure the distance between two points.
function distance(pointA, pointB, method = 'euclidean') {
  const dx = Math.abs(pointA.x - pointB.x)
  const dy = Math.abs(pointA.y - pointB.y)

  // Straight line: sqrt(dx² + dy²)
  if (method === 'euclidean') {
    return Math.sqrt(dx * dx + dy * dy)
  }

  // Grid steps: dx + dy
  return dx + dy
}

// Find the k closest examples to the new point.
function kNearest(points, newPoint, k, method = 'euclidean') {
  const measuredPoints = []

  // Calculate each example's distance from the new point.
  for (let i = 0; i < points.length; i += 1) {
    const point = points[i]
    measuredPoints.push({
      ...point,
      distance: distance(point, newPoint, method),
    })
  }

  // Put the closest examples first. Use the id to make equal distances stable.
  measuredPoints.sort((pointA, pointB) => {
    if (pointA.distance < pointB.distance) return -1
    if (pointA.distance > pointB.distance) return 1
    return String(pointA.id).localeCompare(String(pointB.id))
  })

  // Keep only the first k examples.
  return measuredPoints.slice(0, Math.min(k, measuredPoints.length))
}

// Count the groups among the closest examples and choose the winner.
function vote(neighbours) {
  const counts = {}

  for (let i = 0; i < neighbours.length; i += 1) {
    const group = neighbours[i].label
    counts[group] = (counts[group] || 0) + 1
  }

  let mostVotes = 0
  const tiedGroups = []

  for (const group in counts) {
    if (counts[group] > mostVotes) {
      mostVotes = counts[group]
      tiedGroups.length = 0
      tiedGroups.push(group)
    } else if (counts[group] === mostVotes) {
      tiedGroups.push(group)
    }
  }

  // If groups tie, the closest example in a tied group wins.
  let winner
  for (let i = 0; i < neighbours.length; i += 1) {
    if (tiedGroups.includes(neighbours[i].label)) {
      winner = neighbours[i].label
      break
    }
  }

  return {
    label: winner,
    counts: counts,
    total: neighbours.length,
    tied: tiedGroups.length > 1,
  }
}

// Find the winning group at each small square across the graph.
// main.js uses these squares to color the decision regions.
function decisionGrid(points, k, method = 'euclidean', resolution = 16) {
  const cells = []

  for (let row = 0; row < resolution; row += 1) {
    for (let column = 0; column < resolution; column += 1) {
      const testPoint = {
        x: (column + 0.5) / resolution,
        y: 1 - (row + 0.5) / resolution,
      }
      const nearest = kNearest(points, testPoint, k, method)
      const result = vote(nearest)

      cells.push({ col: column, row: row, label: result.label })
    }
  }

  return cells
}

// Expose the functions so main.js can use them.
window.KNN = {
  distance: distance,
  kNearest: kNearest,
  vote: vote,
  decisionGrid: decisionGrid,
}
