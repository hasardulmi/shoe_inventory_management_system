import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth';

const login = async (username, password) => {
    const response = await axios.post(`${API_URL}/login`, { username, password });
    return response.data;
};

const register = async (username, password, email, role) => {
    const response = await axios.post(`${API_URL}/register`, {
        username,
        password,
        email,
        role,
    });
    return response.data;
};

export default {
    login,
    register,
};