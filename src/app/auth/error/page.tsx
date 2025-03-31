'use client';

import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Credenciales incorrectas. Inténtalo de nuevo.';
      case 'OAuthSignin':
        return 'Error al iniciar sesión con el proveedor externo.';
      default:
        return 'Ocurrió un error inesperado. Inténtalo de nuevo más tarde.';
    }
  };

  return (
    <div>
      <h1>Error de autenticación</h1>
      <p>{getErrorMessage(error)}</p>
      <a href="/auth/login">Volver al inicio de sesión</a>
    </div>
  );
}