function Resolve-NodeExe {
  $commands = @(
    (Get-Command node -ErrorAction SilentlyContinue | Select-Object -ExpandProperty Source -First 1),
    (Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"),
    "C:\Program Files\nodejs\node.exe"
  )

  foreach ($command in $commands) {
    if ($command -and (Test-Path $command)) {
      return $command
    }
  }

  throw "Node.js was not found. Install Node.js from https://nodejs.org, then reopen PowerShell and try again."
}
