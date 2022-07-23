const { useContext } = require("react");
const { default: AuthContext } = require("../context/AuthProvider");

const useAuth = () => {
    return useContext(AuthContext);
}

export default useAuth;