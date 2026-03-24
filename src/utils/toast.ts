// utils/toast.ts
type ToastType = "success" | "error";

export function showToast(message: string, type: ToastType = "success") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.className = `
    fixed top-5 right-5 z-50 px-4 py-2 rounded-lg text-white font-medium shadow-lg
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
    transition-opacity duration-300
  `;
  document.body.appendChild(toast);

  // Fade out after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
  }, 2500);

  // Remove from DOM after fade out
  setTimeout(() => {
    document.body.removeChild(toast);
  }, 3000);
}
