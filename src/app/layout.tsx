import './globals.css'; // Ruta corregida

export const metadata = {
  title: 'Sistema de Seguridad ESP32',
  description: 'Interfaz para el control del ESP32',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
