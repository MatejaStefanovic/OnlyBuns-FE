
import axios from 'axios';

const BASE_URL = 'http://localhost:8080/api'; 

const AdminService = {
  getAll: async (endpoint) => {
    try {
      const response = await axios.get(`${BASE_URL}/${endpoint}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching data", error);
      throw error;
    }
  }
};

export default AdminService;
