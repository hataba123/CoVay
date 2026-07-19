import { spawn } from 'node:child_process'
import { createServer } from 'node:http'
import { createInterface } from 'node:readline'

const port = Number(process.env.KATAGO_PROXY_PORT ?? 3001)
const executable = process.env.KATAGO_EXECUTABLE ?? 'katago'
const modelPath = process.env.KATAGO_MODEL_PATH
const configPath = process.env.KATAGO_CONFIG_PATH
const pendingQueries = new Map()
let engine = null
let engineError = null

function rejectPendingQueries(message) {
  for (const { reject, timeout } of pendingQueries.values()) {
    clearTimeout(timeout)
    reject(new Error(message))
  }
  pendingQueries.clear()
}

function startEngine() {
  if (engine?.exitCode === null) return engine

  const args = ['analysis']
  if (modelPath) args.push('-model', modelPath)
  if (configPath) args.push('-config', configPath)

  engineError = null
  engine = spawn(executable, args, { stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true })

  createInterface({ input: engine.stdout }).on('line', (line) => {
    try {
      const response = JSON.parse(line)
      const pending = pendingQueries.get(response.id)
      if (!pending) return
      clearTimeout(pending.timeout)
      pendingQueries.delete(response.id)
      pending.resolve(response)
    } catch {
      // KataGo may write informational output to stdout; only JSON responses are forwarded.
    }
  })

  engine.stderr.on('data', (chunk) => process.stderr.write(`[katago] ${chunk}`))
  engine.on('error', (error) => {
    engine = null
    engineError = `Không thể khởi động KataGo: ${error.message}`
    rejectPendingQueries(engineError)
  })
  engine.on('exit', (code, signal) => {
    engine = null
    engineError = `KataGo đã dừng (code ${code ?? 'null'}, signal ${signal ?? 'none'}).`
    rejectPendingQueries(engineError)
  })

  return engine
}

function analyze(query) {
  if (!query || typeof query.id !== 'string' || !Array.isArray(query.moves)) {
    return Promise.reject(new Error('Yêu cầu phân tích KataGo không hợp lệ.'))
  }

  const process = startEngine()
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      pendingQueries.delete(query.id)
      reject(new Error('KataGo không phản hồi đúng hạn.'))
    }, 60_000)

    pendingQueries.set(query.id, { resolve, reject, timeout })
    process.stdin.write(`${JSON.stringify(query)}\n`, (error) => {
      if (!error) return
      clearTimeout(timeout)
      pendingQueries.delete(query.id)
      reject(new Error(`Không thể gửi yêu cầu đến KataGo: ${error.message}`))
    })
  })
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json; charset=utf-8',
  })
  response.end(JSON.stringify(payload))
}

const server = createServer((request, response) => {
  if (request.method === 'OPTIONS') return sendJson(response, 204, {})
  if (request.method === 'GET' && request.url === '/api/katago/health') {
    return sendJson(response, engineError ? 503 : 200, {
      status: engineError ? 'unavailable' : 'ready',
      error: engineError,
    })
  }
  if (request.method !== 'POST' || request.url !== '/api/katago/analyze') {
    return sendJson(response, 404, { error: 'Không tìm thấy endpoint.' })
  }

  let body = ''
  request.setEncoding('utf8')
  request.on('data', (chunk) => {
    body += chunk
    if (body.length > 1_000_000) request.destroy()
  })
  request.on('end', async () => {
    try {
      const result = await analyze(JSON.parse(body))
      sendJson(response, 200, result)
    } catch (error) {
      sendJson(response, 503, { error: error instanceof Error ? error.message : 'Lỗi KataGo.' })
    }
  })
})

server.listen(port, () => {
  console.log(`KataGo proxy đang lắng nghe tại http://localhost:${port}`)
  console.log(
    `Lệnh engine: ${executable} analysis${modelPath ? ' -model <KATAGO_MODEL_PATH>' : ''}${configPath ? ' -config <KATAGO_CONFIG_PATH>' : ''}`,
  )
  startEngine()
})

function stop() {
  engine?.kill()
  server.close()
}

process.on('SIGINT', stop)
process.on('SIGTERM', stop)
