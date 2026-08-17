import { useEffect, useState } from 'react'


const App = () => {
  const [backendStatus, setBackendStatus] = useState("Checking....")

  useEffect(() => {
    fetch("http://localhost:8000/api/health")
      .then((response) => response.json())
      .then((data) => setBackendStatus(data.status))
      .catch(() => setBackendStatus("Backend Unavailable"))
  }, [])


  return (
    <div>
      <h1>CodeLens</h1>

      <p>AI-Powered Codebase Intelligence Copilot</p>

      <p>
        Backend status: <strong>{backendStatus}</strong>
      </p>
    </div>
  )
}

export default App