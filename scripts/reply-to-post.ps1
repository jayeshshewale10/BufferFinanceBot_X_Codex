$ErrorActionPreference = "Stop"

$repo = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
. (Join-Path $repo "scripts\resolve-node.ps1")
$node = Resolve-NodeExe

$text = $args -join " "

if (-not $text) {
  try {
    $text = Get-Clipboard -Raw
  } catch {
    $text = ""
  }
}

if (-not $text) {
  throw "Copy an X post first, or pass post text like: .\scripts\reply-to-post.ps1 `"post text here`""
}

$env:TARGET_POST_TEXT = $text

Set-Location $repo
& $node src/test/generateContextReplies.js
