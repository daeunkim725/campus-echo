import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token: envToken, functionsVersion, appBaseUrl } = appParams;
const token = envToken || localStorage.getItem('campus_echo_token');

//Create a client with authentication required
export const base44 = createClient({
  appId,
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false,
  appBaseUrl
});
