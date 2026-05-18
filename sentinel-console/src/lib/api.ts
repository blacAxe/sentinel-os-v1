const IDP_URL =
  process.env.NEXT_PUBLIC_IDP_URL || "http://localhost:8081";

const PROXY_URL =
  process.env.NEXT_PUBLIC_PROXY_URL || "http://localhost:8081";

let inFlightUserRequest: Promise<string> | null = null;
let lastRateLimitTime = 0;

function base64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Safe = (base64 + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = atob(base64Safe);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift();
  return undefined;
}

export async function register(username: string) {
  const beginRes = await fetch(`${IDP_URL}/register/begin?username=${username}`);
  if (!beginRes.ok) {
    const errorMsg = await beginRes.text();
    throw new Error(`Registration begin failed: ${errorMsg}`);
  }

  const options = await beginRes.json();

  options.publicKey.challenge = base64ToUint8Array(options.publicKey.challenge);
  options.publicKey.user.id = base64ToUint8Array(options.publicKey.user.id);

  const credential = await navigator.credentials.create({
    publicKey: options.publicKey,
  }) as PublicKeyCredential;

  const response = {
    id: credential.id,
    rawId: bufferToBase64Url(credential.rawId),
    type: credential.type,
    response: {
      attestationObject: bufferToBase64Url((credential.response as AuthenticatorAttestationResponse).attestationObject),
      clientDataJSON: bufferToBase64Url(credential.response.clientDataJSON),
    },
  };

  const finishRes = await fetch(`${IDP_URL}/register/finish?username=${username}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(response),
  });

  if (!finishRes.ok) {
    throw new Error("Registration verification failed on server");
  }

  return await finishRes.text();
}

export async function login(username: string) {
  try {
    const beginRes = await fetch(`${IDP_URL}/login/begin?username=${username}`, {
      method: "GET",
      credentials: "include",
    });

    if (!beginRes.ok) {
      const errorMsg = await beginRes.text();
      console.error("IDP Login Begin Error:", errorMsg);
      throw new Error(`Login begin failed: ${errorMsg}`);
    }

    const options = await beginRes.json();

    if (!options.publicKey) {
      throw new Error("Invalid WebAuthn options from server");
    }

    const publicKey = options.publicKey;

    publicKey.challenge = base64ToUint8Array(publicKey.challenge);

    if (publicKey.allowCredentials) {
      publicKey.allowCredentials = publicKey.allowCredentials.map((cred: any) => ({
        ...cred,
        id: base64ToUint8Array(cred.id),
      }));
    }

    console.log("FINAL PUBLIC KEY:", publicKey);

    const cred = await navigator.credentials.get({
      publicKey,
    }) as PublicKeyCredential | null;

    if (!cred) {
      throw new Error("User cancelled passkey prompt");
    }

    const authResponse = cred.response as AuthenticatorAssertionResponse;

    const finishRes = await fetch(
      `${IDP_URL}/login/finish?username=${username}`,
      {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": typeof document !== "undefined" ? getCookie("csrf_token") || "" : "",
        },
        body: JSON.stringify({
          id: cred.id,
          rawId: bufferToBase64Url(cred.rawId),
          type: cred.type,
          response: {
            clientDataJSON: bufferToBase64Url(authResponse.clientDataJSON),
            authenticatorData: bufferToBase64Url(authResponse.authenticatorData),
            signature: bufferToBase64Url(authResponse.signature),
            userHandle: authResponse.userHandle
              ? bufferToBase64Url(authResponse.userHandle)
              : null,
          },
        }),
      }
    );

    if (!finishRes.ok) {
      const errText = await finishRes.text();
      throw new Error(errText);
    }

    const data = await finishRes.json();

    if (data.access_token) {
      localStorage.setItem("sentinel_token", data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem("sentinel_refresh_token", data.refresh_token);
    }

    console.log("✅ Login Successful");
    return data;

  } catch (err) {
    console.error("Login error:", err);
    throw err;
  }
}

export async function getUserDataSafe(): Promise<string> {
  if (inFlightUserRequest) {
    return inFlightUserRequest;
  }

  const now = Date.now();
  if (now - lastRateLimitTime < 1500) {
    throw new Error("Cooling down after rate limit...");
  }

  const requestPromise: Promise<string> = (async () => {
    try {
      const token = localStorage.getItem("sentinel_token")

      if (!token) {
        throw new Error("No token found. Please login.");
      }

      let res = await fetch(`${PROXY_URL}/api/user`, {
        method: "GET",
        mode: "cors",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        try {
          const newToken = await refreshAccessToken();

          res = await fetch(`${PROXY_URL}/api/user`, {
            method: "GET",
            mode: "cors",
            headers: {
              Authorization: `Bearer ${newToken}`,
            },
          });

          if (res.status === 401) {
            throw new Error("Still unauthorized after refresh");
          }

        } catch {
          localStorage.removeItem("sentinel_token");
          localStorage.removeItem("sentinel_refresh_token");
          throw new Error("Session expired. Please login again.");
        }
      }

      if (res.status === 429) {
        lastRateLimitTime = Date.now();
        throw new Error("Rate limited");
      }

      if (!res.ok) {
        throw new Error("Proxy request failed");
      }

      return await res.text();

    } finally {
      inFlightUserRequest = null;
    }
  })();

  inFlightUserRequest = requestPromise;

  return requestPromise;
}

export const getUserData = getUserDataSafe;

export async function refreshAccessToken(): Promise<string> {
  const refreshToken = localStorage.getItem("sentinel_refresh_token")
  const csrfToken = getCookie("csrf_token");

  if (!refreshToken) {
    throw new Error("No refresh token");
  }

  console.log("Refreshing access token...");

  const res = await fetch(`${IDP_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
    mode: "cors",
    headers: {
      "X-CSRF-Token": csrfToken || "",
      "X-Refresh-Token": refreshToken,
    },
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const data = await res.json();

  localStorage.setItem("sentinel_token", data.access_token);

  console.log("✅ Token refreshed");

  return data.access_token;
}

export async function logout() {
  const refreshToken = localStorage.getItem("sentinel_refresh_token");
  const csrfToken = getCookie("csrf_token");

  try {
    if (refreshToken) {
      await fetch(`${IDP_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        mode: "cors",
        headers: {
          "X-CSRF-Token": csrfToken || "",
          "X-Refresh-Token": refreshToken,
        },
      });
    }
  } catch {
    console.warn("Logout request failed (continuing anyway)");
  }

  localStorage.removeItem("sentinel_token");
  localStorage.removeItem("sentinel_refresh_token");
}