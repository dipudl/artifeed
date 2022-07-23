import axios from "../api/axios";
import useAuth from "./useAuth";

const LOGOUT_URL = '/logout';

const useLogout = () => {
    const { setAuth } = useAuth();

    const logout = async () => {
        try {
            const response = await axios(LOGOUT_URL, {
                withCredentials: true
            });
            setAuth({});
        } catch (err) {
            console.log(err);
            throw(err);
        }
    }

    return logout;
}

export default useLogout;