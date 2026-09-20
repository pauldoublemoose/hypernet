export function PreviewPane() {
  return (
    <aside className="chrome-frame chrome-preview" data-shell="preview" aria-label="Preview pane">
      <div className="terminal">
        <div className="term-header">
          <span>HYPERNET // PREVIEW</span>
          <span className="header-right">
            <span className="section-badge dim">[ EMPTY ]</span>
          </span>
        </div>
        <div className="term-body">
          <div className="screen">
            <div className="title">PREVIEW</div>
            <p className="dim">Empty pane. Later views land here.</p>
          </div>
        </div>
        <div className="term-status">
          <span className="mode-chip">◆ PREVIEW</span>
          <span className="hints">STUB</span>
        </div>
      </div>
    </aside>
  )
}
