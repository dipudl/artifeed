import { Navigate, Outlet } from "react-router-dom";

const auth = {token: null};

const ProtectedRoutes = () => {
    return auth.token? <Outlet /> : <Navigate to="/login" />
}

export default ProtectedRoutes;