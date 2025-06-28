import React from "react";
import { Route, RouteProps, Navigate } from "react-router-dom";
import useSession from "react-session-hook";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export function PrivateRoute({ children, ...rest }: PrivateRouteProps): JSX.Element {
  const session = useSession();

  if (session.isAuthenticated) {
    return <Route {...rest} element={children} />;
  } else {
    return <Navigate to="/login" replace />;
  }
}
