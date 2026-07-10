/**
 * Centralized API configuration for the Insurance Portal.
 * Uses Environment Variables for flexibility across local and AWS environments.
 */

const API_BASE_URL = import.meta.env.VITE_AWS_API_URL || '/api';
const AGENTCORE_URL = import.meta.env.VITE_AGENTCORE_URL || API_BASE_URL; // Fallback to base URL if AgentCore is not set

export const API_ENDPOINTS = {
  // Standard Authentication & Uploads (API Gateway)
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  UPLOAD: `${API_BASE_URL}/upload`,
  SUBMIT_CLAIM: `${API_BASE_URL}/submit-claim`,

  // Advanced AI & Analysis (Bedrock AgentCore)
  TRUTH_ANALYSIS: `${API_BASE_URL}/analyse`,
  CHATBOT: `${API_BASE_URL}/chat`,

  // Health-specific endpoints
  HEALTH_UPLOAD: `${API_BASE_URL}/healthupload`,
  HEALTH_ANALYSIS: `${API_BASE_URL}/healthanalyse`,
};
