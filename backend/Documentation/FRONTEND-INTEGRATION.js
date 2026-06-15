/**
 * Frontend Integration Guide
 * Copy this code to your frontend project
 */

// ==================== api-config.js ====================
// Save this file in your frontend project (e.g., js/api-config.js)

const API_BASE_URL = 'http://localhost:5000/api';

// Store API endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: `${API_BASE_URL}/auth/register`,
  LOGIN: `${API_BASE_URL}/auth/login`,
  LOGOUT: `${API_BASE_URL}/auth/logout`,
  GET_ME: `${API_BASE_URL}/auth/me`,
  UPDATE_PROFILE: `${API_BASE_URL}/auth/updateProfile`,

  // Donors
  GET_DONORS: `${API_BASE_URL}/donors`,
  GET_DONOR: (id) => `${API_BASE_URL}/donors/${id}`,
  CREATE_DONOR: `${API_BASE_URL}/donors`,
  UPDATE_DONOR: (id) => `${API_BASE_URL}/donors/${id}`,
  DELETE_DONOR: (id) => `${API_BASE_URL}/donors/${id}`,
  GET_DONATION_HISTORY: (id) => `${API_BASE_URL}/donors/${id}/history`,
  UPDATE_DONOR_STATUS: (id) => `${API_BASE_URL}/donors/${id}/status`,

  // Inventory
  GET_INVENTORY: `${API_BASE_URL}/inventory`,
  GET_INVENTORY_BY_TYPE: (type) => `${API_BASE_URL}/inventory/${type}`,
  GET_AVAILABLE_BLOOD: `${API_BASE_URL}/inventory/available`,
  ADD_BLOOD_UNIT: `${API_BASE_URL}/inventory`,
  UPDATE_BLOOD_UNIT: (id) => `${API_BASE_URL}/inventory/${id}`,
  DELETE_BLOOD_UNIT: (id) => `${API_BASE_URL}/inventory/${id}`,
  CHECK_EXPIRY: `${API_BASE_URL}/inventory/expiry/check`,

  // Requests
  GET_REQUESTS: `${API_BASE_URL}/requests`,
  GET_REQUEST: (id) => `${API_BASE_URL}/requests/${id}`,
  GET_REQUESTS_BY_STATUS: (status) => `${API_BASE_URL}/requests/status/${status}`,
  CREATE_REQUEST: `${API_BASE_URL}/requests`,
  UPDATE_REQUEST: (id) => `${API_BASE_URL}/requests/${id}`,
  ALLOCATE_BLOOD: (id) => `${API_BASE_URL}/requests/${id}/allocate`,
  CANCEL_REQUEST: (id) => `${API_BASE_URL}/requests/${id}`,

  // Blood Bank
  GET_BANK_INFO: `${API_BASE_URL}/bloodbank/info`,
  UPDATE_BANK_INFO: `${API_BASE_URL}/bloodbank/info`,
  GET_BANK_STATS: `${API_BASE_URL}/bloodbank/stats`,
  GET_CAPACITY: `${API_BASE_URL}/bloodbank/capacity`,
  GET_DASHBOARD: `${API_BASE_URL}/bloodbank/dashboard`,

  // Reports
  DONOR_REPORT: `${API_BASE_URL}/reports/donors`,
  INVENTORY_REPORT: `${API_BASE_URL}/reports/inventory`,
  REQUEST_REPORT: `${API_BASE_URL}/reports/requests`,
  EXPIRY_REPORT: `${API_BASE_URL}/reports/expiry`,
};

export default API_ENDPOINTS;

// ==================== api-helper.js ====================
// Generic API helper function

export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== auth-service.js ====================
// Authentication service functions

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const authService = {
  // Register new user
  async register(userData) {
    const response = await apiCall(API_ENDPOINTS.REGISTER, {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Login user
  async login(email, password) {
    const response = await apiCall(API_ENDPOINTS.LOGIN, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.token) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }

    return response;
  },

  // Logout
  async logout() {
    await apiCall(API_ENDPOINTS.LOGOUT, { method: 'POST' });
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Get current user
  async getMe() {
    return await apiCall(API_ENDPOINTS.GET_ME);
  },

  // Update profile
  async updateProfile(profileData) {
    return await apiCall(API_ENDPOINTS.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  // Check if logged in
  isLoggedIn() {
    return !!localStorage.getItem('token');
  },

  // Get current user data
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
};

// ==================== donor-service.js ====================
// Donor management functions

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const donorService = {
  // Get all donors
  async getAllDonors(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.GET_DONORS}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get single donor
  async getDonor(id) {
    return await apiCall(API_ENDPOINTS.GET_DONOR(id));
  },

  // Create donor profile
  async createDonor(donorData) {
    return await apiCall(API_ENDPOINTS.CREATE_DONOR, {
      method: 'POST',
      body: JSON.stringify(donorData),
    });
  },

  // Update donor
  async updateDonor(id, donorData) {
    return await apiCall(API_ENDPOINTS.UPDATE_DONOR(id), {
      method: 'PUT',
      body: JSON.stringify(donorData),
    });
  },

  // Delete donor
  async deleteDonor(id) {
    return await apiCall(API_ENDPOINTS.DELETE_DONOR(id), {
      method: 'DELETE',
    });
  },

  // Get donation history
  async getDonationHistory(id) {
    return await apiCall(API_ENDPOINTS.GET_DONATION_HISTORY(id));
  },

  // Update donor status
  async updateDonorStatus(id, status, reason = '') {
    return await apiCall(API_ENDPOINTS.UPDATE_DONOR_STATUS(id), {
      method: 'PUT',
      body: JSON.stringify({ status, reason }),
    });
  },
};

// ==================== inventory-service.js ====================
// Blood inventory management

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const inventoryService = {
  // Get all inventory
  async getInventory(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.GET_INVENTORY}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get inventory by blood type
  async getByBloodType(bloodType, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.GET_INVENTORY_BY_TYPE(bloodType)}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get available blood types
  async getAvailableBlood() {
    return await apiCall(API_ENDPOINTS.GET_AVAILABLE_BLOOD);
  },

  // Add blood unit
  async addBloodUnit(unitData) {
    return await apiCall(API_ENDPOINTS.ADD_BLOOD_UNIT, {
      method: 'POST',
      body: JSON.stringify(unitData),
    });
  },

  // Update blood unit
  async updateUnit(id, unitData) {
    return await apiCall(API_ENDPOINTS.UPDATE_BLOOD_UNIT(id), {
      method: 'PUT',
      body: JSON.stringify(unitData),
    });
  },

  // Delete blood unit
  async deleteUnit(id) {
    return await apiCall(API_ENDPOINTS.DELETE_BLOOD_UNIT(id), {
      method: 'DELETE',
    });
  },

  // Check expiry
  async checkExpiry() {
    return await apiCall(API_ENDPOINTS.CHECK_EXPIRY);
  },
};

// ==================== request-service.js ====================
// Blood request management

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const requestService = {
  // Get all requests
  async getAllRequests(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.GET_REQUESTS}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get single request
  async getRequest(id) {
    return await apiCall(API_ENDPOINTS.GET_REQUEST(id));
  },

  // Get requests by status
  async getByStatus(status, filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.GET_REQUESTS_BY_STATUS(status)}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Create request
  async createRequest(requestData) {
    return await apiCall(API_ENDPOINTS.CREATE_REQUEST, {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  },

  // Update request status
  async updateStatus(id, status, options = {}) {
    return await apiCall(API_ENDPOINTS.UPDATE_REQUEST(id), {
      method: 'PUT',
      body: JSON.stringify({ status, ...options }),
    });
  },

  // Allocate blood units
  async allocateBlood(id, inventoryIds) {
    return await apiCall(API_ENDPOINTS.ALLOCATE_BLOOD(id), {
      method: 'PUT',
      body: JSON.stringify({ inventoryIds }),
    });
  },

  // Cancel request
  async cancelRequest(id) {
    return await apiCall(API_ENDPOINTS.CANCEL_REQUEST(id), {
      method: 'DELETE',
    });
  },
};

// ==================== bloodbank-service.js ====================
// Blood bank operations

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const bloodbankService = {
  // Get bank info
  async getBankInfo() {
    return await apiCall(API_ENDPOINTS.GET_BANK_INFO);
  },

  // Update bank info
  async updateBankInfo(bankData) {
    return await apiCall(API_ENDPOINTS.UPDATE_BANK_INFO, {
      method: 'PUT',
      body: JSON.stringify(bankData),
    });
  },

  // Get statistics
  async getStats() {
    return await apiCall(API_ENDPOINTS.GET_BANK_STATS);
  },

  // Get storage capacity
  async getCapacity() {
    return await apiCall(API_ENDPOINTS.GET_CAPACITY);
  },

  // Get dashboard summary
  async getDashboard() {
    return await apiCall(API_ENDPOINTS.GET_DASHBOARD);
  },
};

// ==================== report-service.js ====================
// Reports and analytics

import { apiCall } from './api-helper.js';
import API_ENDPOINTS from './api-config.js';

export const reportService = {
  // Get donor report
  async getDonorReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.DONOR_REPORT}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get inventory report
  async getInventoryReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.INVENTORY_REPORT}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get request report
  async getRequestReport(filters = {}) {
    const params = new URLSearchParams(filters).toString();
    const url = `${API_ENDPOINTS.REQUEST_REPORT}${params ? '?' + params : ''}`;
    return await apiCall(url);
  },

  // Get expiry report
  async getExpiryReport() {
    return await apiCall(API_ENDPOINTS.EXPIRY_REPORT);
  },
};

// ==================== Example HTML Implementation ===================

// <!-- login.html -->
<form id="loginForm">
  <input type="email" id="email" placeholder="Email" required>
    <input type="password" id="password" placeholder="Password" required>
      <button type="submit">Login</button>
    </form>

    <script type="module">
      import {authService} from './js/auth-service.js';

  document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();

      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      try {
      const response = await authService.login(email, password);
      if (response.success) {
        alert('Login successful!');
      window.location.href = '/dashboard.html';
      }
    } catch (error) {
        alert('Login failed: ' + error.message);
    }
  });
    </script>

    {/* <!-- donors.html --> */}
    <table id="donorsTable">
      <thead>
        <tr>
          <th>Name</th>
          <th>Blood Type</th>
          <th>Donations</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>

    <script type="module">
      import {donorService} from './js/donor-service.js';

      async function loadDonors() {
    try {
      const response = await donorService.getAllDonors({limit: 20 });
      const tbody = document.querySelector('#donorsTable tbody');
      
      tbody.innerHTML = response.data.map(donor => `
      <tr>
        <td>${donor.userId.name}</td>
        <td>${donor.bloodType}</td>
        <td>${donor.donationHistory.totalDonations}</td>
        <td>${donor.status}</td>
        <td>
          <button onclick="viewDonor('${donor._id}')">View</button>
          <button onclick="editDonor('${donor._id}')">Edit</button>
        </td>
      </tr>
      `).join('');
    } catch (error) {
        console.error('Error loading donors:', error);
    }
      loadDonors();
    </script>

  }
