// Service Account based Google Sheets integration
// Use this for private sheets that require authentication

interface ServiceAccountCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}

class GoogleSheetsServiceAccount {
  private credentials: ServiceAccountCredentials
  private accessToken: string | null = null
  private tokenExpiry = 0

  constructor(credentials: ServiceAccountCredentials) {
    this.credentials = credentials
  }

  private async getAccessToken(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken
    }

    const jwt = await this.createJWT()
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to get access token: ${response.status}`)
    }

    const data = await response.json()
    this.accessToken = data.access_token
    this.tokenExpiry = Date.now() + (data.expires_in - 60) * 1000 // Refresh 1 minute early

    return this.accessToken
  }

  private async createJWT(): Promise<string> {
    const header = {
      alg: "RS256",
      typ: "JWT",
    }

    const now = Math.floor(Date.now() / 1000)
    const payload = {
      iss: this.credentials.client_email,
      scope: "https://www.googleapis.com/auth/spreadsheets",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    }

    // Note: In a real implementation, you'd need to properly sign this JWT
    // This is a simplified version for demonstration
    const encodedHeader = btoa(JSON.stringify(header))
    const encodedPayload = btoa(JSON.stringify(payload))

    // In production, use a proper JWT library to sign with the private key
    return `${encodedHeader}.${encodedPayload}.signature`
  }

  async readSheet(sheetId: string, range: string): Promise<any> {
    const token = await this.getAccessToken()

    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to read sheet: ${response.status}`)
    }

    return response.json()
  }

  async writeSheet(sheetId: string, range: string, values: any[][]): Promise<any> {
    const token = await this.getAccessToken()

    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values,
        }),
      },
    )

    if (!response.ok) {
      throw new Error(`Failed to write sheet: ${response.status}`)
    }

    return response.json()
  }
}

export default GoogleSheetsServiceAccount
