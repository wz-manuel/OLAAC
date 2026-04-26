// Root layout — pass-through. HTML/body are provided by app/[locale]/layout.tsx.
// API routes (app/api/) don't use any layout wrapper.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children
}
