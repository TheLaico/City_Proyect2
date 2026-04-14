from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os
from urllib.request import urlopen
from urllib.parse import urlencode
import heapq

app = Flask(__name__)
CORS(app)

NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '4e8e0bbd1cef4addaa3cf65582dafd14')
NEWS_API_BASE = 'https://newsapi.org/v2/top-headlines'


def tiene_acceso_a_vias(grid, pos):
    """
    Verifica si un edificio (0) tiene al menos una celda
    transitable (1) adyacente para poder iniciar/terminar ruta.
    """
    r, c = pos
    rows, cols = len(grid), len(grid[0])
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    for dr, dc in directions:
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            if grid[nr][nc] == 1:
                return True
    return False


def dijkstra(grid, start, end):
    rows = len(grid)
    cols = len(grid[0])
    directions = [(0, 1), (0, -1), (1, 0), (-1, 0)]

    distances = {(r, c): float('inf') for r in range(rows) for c in range(cols)}
    distances[start] = 0
    predecessors = {}
    pq = [(0, start)]

    while pq:
        current_dist, (r, c) = heapq.heappop(pq)

        if (r, c) == end:
            break

        if current_dist > distances[(r, c)]:
            continue

        for dr, dc in directions:
            nr, nc = r + dr, c + dc

            if 0 <= nr < rows and 0 <= nc < cols:
                if grid[nr][nc] == 1 or (nr, nc) == end:
                    new_dist = current_dist + 1
                    if new_dist < distances[(nr, nc)]:
                        distances[(nr, nc)] = new_dist
                        predecessors[(nr, nc)] = (r, c)
                        heapq.heappush(pq, (new_dist, (nr, nc)))

    if end not in predecessors:
        return None

    path = []
    curr = end
    while curr in predecessors:
        path.append(list(curr))
        curr = predecessors[curr]
    path.append(list(start))

    return path[::-1]


@app.route('/api/calculate-route', methods=['POST'])
def calculate_route():
    data = request.json
    try:
        grid = data.get('map')
        start = tuple(data.get('start'))
        end = tuple(data.get('end'))

        if not tiene_acceso_a_vias(grid, start) or not tiene_acceso_a_vias(grid, end):
            return jsonify({
                "error": "Edificios no conectados por vías: imposible calcular"
            }), 400

        route = dijkstra(grid, start, end)

        if route is None:
            return jsonify({
                "error": "Sin ruta disponible: no existe conexión entre las vías"
            }), 404

        return jsonify({"route": route})

    except Exception as e:
        return jsonify({"error": f"Error en el servidor: {str(e)}"}), 500


@app.route('/api/news', methods=['GET'])
def get_news():
    country = request.args.get('country', 'co')
    params = urlencode({
        'country': country,
        'apiKey': NEWS_API_KEY,
    })
    url = f"{NEWS_API_BASE}?{params}"

    try:
        with urlopen(url) as response:
            data = json.load(response)
        return jsonify(data)
    except Exception as e:
        return jsonify({"error": f"Error NewsAPI: {str(e)}"}), 500


if __name__ == '__main__':
    app.run(debug=True, port=5000)