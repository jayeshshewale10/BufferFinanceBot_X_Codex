$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. (Join-Path $repo "scripts\resolve-node.ps1")
$node = Resolve-NodeExe
$bundledNodeModules = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules"

if (Test-Path $bundledNodeModules) {
  $env:NODE_PATH = $bundledNodeModules
}

Set-Location $repo
& $node src/buffer/listChannels.js
