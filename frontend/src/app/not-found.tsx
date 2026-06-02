export default function NotFound() {
  return (
    <main className="shell">
      <div className="card">
        <p className="eyebrow">404</p>
        <h1>Poll not found</h1>
        <p>This poll may not exist or may have been removed.</p>
        <a className="btn" href="/">Create a new poll</a>
      </div>
    </main>
  );
}
