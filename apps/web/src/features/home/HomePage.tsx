const API = import.meta.env["VITE_API_URL"] ?? "http://localhost:5000";

export const HomePage = () => (
  <main>
    <h1>Stalk Talk</h1>
    <a href={`${API}/auth/github`}>Sign in with GitHub</a>
    <a href={`${API}/auth/google`}>Sign in with Google</a>
  </main>
);
