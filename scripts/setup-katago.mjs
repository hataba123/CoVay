import { execFile } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { access, mkdir, readdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { Readable } from 'node:stream'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)))
const installDirectory = join(projectRoot, 'tools', 'katago')
const downloadsDirectory = join(installDirectory, 'downloads')
const engineDirectory = join(installDirectory, 'engine')
const modelDirectory = join(installDirectory, 'models')
const pathsFile = join(installDirectory, 'katago-paths.cmd')

async function exists(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: { 'User-Agent': 'CoVay-KataGo-Setup' } })
  if (!response.ok) throw new Error(`Không thể tải dữ liệu từ ${url}.`)
  return response.json()
}

async function download(url, destination) {
  if (await exists(destination)) return

  const response = await fetch(url, { headers: { 'User-Agent': 'CoVay-KataGo-Setup' } })
  if (!response.ok || !response.body) throw new Error(`Không thể tải ${url}.`)

  await pipeline(Readable.fromWeb(response.body), createWriteStream(destination))
}

async function findFile(directory, name) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isFile() && entry.name.toLowerCase() === name.toLowerCase()) return path
    if (entry.isDirectory()) {
      const match = await findFile(path, name)
      if (match) return match
    }
  }
  return null
}

async function getLatestModelUrl() {
  const response = await fetch('https://katagotraining.org/networks/', {
    headers: { 'User-Agent': 'CoVay-KataGo-Setup' },
  })
  if (!response.ok) throw new Error('Không thể lấy danh sách model KataGo.')

  const page = await response.text()
  const match = page.match(
    /https:\/\/media\.katagotraining\.org\/uploaded\/networks\/models\/kata1\/kata1-b28c512nbt-[^"'<>\s]+\.bin\.gz/,
  )
  if (!match) throw new Error('Không tìm thấy network KataGo phù hợp.')
  return match[0]
}

async function main() {
  if (process.platform !== 'win32') {
    throw new Error('Tự động cài đặt KataGo hiện chỉ hỗ trợ Windows.')
  }

  if (await exists(pathsFile)) {
    console.log('KataGo đã được cài đặt.')
    return
  }

  await Promise.all([
    mkdir(downloadsDirectory, { recursive: true }),
    mkdir(modelDirectory, { recursive: true }),
  ])

  console.log('Đang lấy bản KataGo mới nhất...')
  const release = await fetchJson('https://api.github.com/repos/lightvector/KataGo/releases/latest')
  const engineAsset = release.assets?.find((asset) =>
    /^katago-.*-eigen-windows-x64\.zip$/i.test(asset.name),
  )
  if (!engineAsset?.browser_download_url) {
    throw new Error('Không tìm thấy bản KataGo Eigen cho Windows x64.')
  }

  const archivePath = join(downloadsDirectory, engineAsset.name)
  console.log(`Đang tải ${engineAsset.name}...`)
  await download(engineAsset.browser_download_url, archivePath)

  if (!(await exists(engineDirectory))) {
    await mkdir(engineDirectory, { recursive: true })
    await execFileAsync('powershell.exe', [
      '-NoProfile',
      '-NonInteractive',
      '-Command',
      `Expand-Archive -LiteralPath '${archivePath.replaceAll("'", "''")}' -DestinationPath '${engineDirectory.replaceAll("'", "''")}'`,
    ])
  }

  const [executable, configPath, modelUrl] = await Promise.all([
    findFile(engineDirectory, 'katago.exe'),
    findFile(engineDirectory, 'analysis_example.cfg'),
    getLatestModelUrl(),
  ])
  if (!executable || !configPath)
    throw new Error('Bộ cài KataGo không chứa executable hoặc analysis config.')

  const modelPath = join(modelDirectory, modelUrl.split('/').at(-1))
  console.log(`Đang tải ${modelPath.split('\\').at(-1)}...`)
  await download(modelUrl, modelPath)

  await writeFile(
    pathsFile,
    `set "KATAGO_EXECUTABLE=${executable}"\r\nset "KATAGO_MODEL_PATH=${modelPath}"\r\nset "KATAGO_CONFIG_PATH=${configPath}"\r\n`,
  )
  console.log('Đã cài đặt KataGo. Chạy npm run katago để khởi động engine.')
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : 'Không thể cài đặt KataGo.')
  process.exitCode = 1
})
