$path = 'src/pages/MyTestsPage.jsx'
$content = [System.IO.File]::ReadAllText($path)
$start = $content.IndexOf('      <section className="card bg-base-100 border border-base-300 p-4 mb-5">')
$end = $content.IndexOf('      {error &&', $start)
if ($start -lt 0 -or $end -lt 0) { throw 'Could not find the folder panel boundaries.' }
$replacement = @'
      <section className="my-tests-folder-panel relative isolate mb-5 overflow-hidden rounded-2xl border p-4">
        {folderFlashToken > 0 && <div key={folderFlashToken} className="my-tests-folder-lightning" aria-hidden="true" />}
        <div className="relative z-10">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <button className="link link-primary" onClick={() => openFolder(null)}>My folders</button>
              {folderPath.map((folder) => <span key={folder.id} className="flex gap-2 items-center"><span className="opacity-40">/</span><button className="link link-primary" onClick={() => openFolder(folder.id)}>{folder.name}</button></span>)}
            </div>
            <button className="btn btn-sm btn-outline" onClick={() => setFolderDialog("create")}>+ {currentFolder ? "New subfolder" : "New folder"}</button>
          </div>
          {childFolders.length > 0 && <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {childFolders.map((folder) => <button key={folder.id} onClick={() => openFolder(folder.id)} className="my-tests-folder-card rounded-xl border p-3 text-left"><img src={folderIcon} alt="" className="mr-2 inline-block h-5 w-5 object-contain" /><span className="font-medium">{folder.name}</span><span className="block text-xs opacity-70 mt-1">Open folder →</span></button>)}
          </div>}
        </div>
      </section>

'@
$content = $content.Substring(0, $start) + $replacement + $content.Substring($end)
[System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
