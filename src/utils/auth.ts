import axios from "axios";

// Frontend: handle login
export async function handleLogin(
  email: string,
  password: string,
  setUser: React.Dispatch<React.SetStateAction<any>>,
  rememberMe: boolean
): Promise<void> {
  try {
    const response = await axios.post(
      'http://localhost:3000/login',
      { email, password, rememberMe },
      { withCredentials: true }
    );
    setUser(response.data);
  } catch (error: any) {
    window.alert(`Error code ${error?.status} - ${error?.response?.statusText}: ${error?.response?.data}`);
  }
}

// Frontend: handle register
export async function handleRegister(
  Fname: string,
  Lname: string,
  email: string,
  password: string,
  setUser: React.Dispatch<React.SetStateAction<any>>
): Promise<void> {
  try {
    const response = await axios.post('http://localhost:3000/register', { Fname, Lname, email, password },{withCredentials: true});
    setUser(response.data);
  } catch (error: any) {
    window.alert(`Error code ${error?.status} - ${error?.response?.statusText}: ${error?.response?.data}`);
  }
}

// Frontend: refresh token (no argument needed)
export async function refreshToken(): Promise<string | null> {
  try {
    const response = await axios.post<{ token: string }>(
      'http://localhost:3000/refresh_token',
      {},
      { withCredentials: true }
    );
    return response.data.token;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return null;
  }
}

export async function getUserInfo(accessToken: string): Promise<any> {
  const response = await axios.get('http://localhost:3000/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
    withCredentials: true
  });
  return response.data;
}