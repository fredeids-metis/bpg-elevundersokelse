export default function ErrorMessage({ message }) {
  return (
    <div className="error-container">
      <h2>Noe gikk galt</h2>
      <p>{message}</p>
      <button className="metis-btn metis-btn-primary" onClick={() => window.location.reload()}>
        Prøv igjen
      </button>
    </div>
  )
}
