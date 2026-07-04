export function getRealtimeURL(diagramID: number) {
  const apiBaseURL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  const wsBaseURL = apiBaseURL.replace(/^http/, "ws");

  return `${wsBaseURL}/api/ws/diagrams/${diagramID}`;
}