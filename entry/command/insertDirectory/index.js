const vscode = require('vscode')
const path = require('path')

const fs = require('fs')

// Recursion and copy directory
function copyDirectory(source, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const entries = fs.readdirSync(source, { withFileTypes: true })

  for (let entry of entries) {
    const sourcePath = path.join(source, entry.name)
    const destPath = path.join(dest, entry.name)

    if (entry.isDirectory()) {
      copyDirectory(sourcePath, destPath)
    } else {
      fs.copyFileSync(sourcePath, destPath)
    }
  }
}

// Get the directory that the current editing
function getActiveDirectory() {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    return null
  }
  const uri = editor.document.uri
  const filePath = vscode.workspace.asRelativePath(vscode.Uri.parse(uri).fsPath)
  const directory = path.dirname(filePath)
  return directory
}

// Entry choose
async function insertDirectory(pageName, sourcePath, folderPath) {
  const rootPath = vscode.workspace.workspaceFolders?.[0].uri.fsPath
  if (!rootPath) {
    vscode.window.showErrorMessage('No folder or workspace opened')
    return false
  }
  // Template Directory
  let sourceDir = path.join(rootPath, sourcePath)

  // Not found the template directory
  if (!fs.existsSync(sourceDir)) {
    vscode.window.showErrorMessage(`No such directory: ${sourcePath}`)
    return false
  }

  // Dest Directory
  let activeDirectory = getActiveDirectory()
  let destDir = ''

  // Specified directory
  if (folderPath) {
    destDir = path.join(folderPath, `${pageName}`)
  }
  // Use the directory that got for the current editing
  else if (activeDirectory) {
    destDir = path.join(rootPath, `${activeDirectory}/${pageName}`)
  }
  // 获取不到当前编辑页面的目录, 则使用src做为目录
  else {
    destDir = path.join(rootPath, `src/${pageName}`)
  }

  console.log(`The directory is detected: \n from "${sourceDir}" \nto "${destDir}:`)
  copyDirectory(sourceDir, destDir)
  return true
}

module.exports = insertDirectory
