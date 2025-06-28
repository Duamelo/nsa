import {RouteProps } from "react-router";
import { Navigate } from 'react-router-dom';
import React from "react";
import useSession from 'react-session-hook';


export function PrivateComponent({ children}: RouteProps): any {
    const session = useSession();
    return (
        session.isAuthenticated ? children : <Navigate  to={"/login"}/>
    );
}