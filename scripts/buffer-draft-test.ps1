$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. (Join-Path $repo "scripts\resolve-node.ps1")
$node = Resolve-NodeExe

Set-Location $repo
& $node src/buffer/testDraft.js
