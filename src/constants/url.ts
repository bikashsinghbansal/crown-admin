type HostType = "localhost" | "";

const hostname: HostType = window.location.hostname as HostType;

export const BASE_URL = "http://localhost:5173";
export const API_URL =
  hostname == "localhost"
    ? "http://127.0.0.1:5001/api/v1"
    : "https://crownlam.com/server/api/v1";

export const FILE_URL =
  hostname == "localhost"
    ? "http://127.0.0.1:5001/uploads"
    : "https://crownlam.com/server/uploads";
