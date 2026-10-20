export type Row = Record<string, any>;
export const API = import.meta.env.VITE_API_URL || "/api";
export async function api<T = Row>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(API + path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
      ...options.headers,
    },
  });
  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem("token");
      window.dispatchEvent(new Event("session-expired"));
    }
    const body = await response.json().catch(() => ({}));
    throw new Error(
      typeof body.detail === "string"
        ? body.detail
        : `Yêu cầu thất bại (${response.status})`,
    );
  }
  return response.json();
}
export async function download() {
  const r = await fetch(API + "/export/submission.csv", {
    headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
  });
  if (!r.ok) throw new Error("Không thể xuất CSV");
  const url = URL.createObjectURL(await r.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = "submission_output.csv";
  a.click();
  URL.revokeObjectURL(url);
}
