import NotFoundFallback from "@/components/meals/not-found-fallback";

// Stays a Server Component and delegates to a client child. The prerendered
// 404.html therefore contains the real app's not-found markup, while the child
// can inspect the URL at runtime to recover a meal held in localStorage.
export default function NotFound() {
  return <NotFoundFallback />;
}
