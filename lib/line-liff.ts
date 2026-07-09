/**
 * LINE LIFF Authentication Service
 * 
 * Provides functions to verify LIFF access tokens and extract user profile information.
 * This service integrates with the LINE Platform API to authenticate users
 * accessing the application through LINE Mini App.
 */

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

/**
 * Verifies a LIFF access token and retrieves the user profile.
 * 
 * Makes a request to LINE's API to verify the provided access token
 * and extracts the user's profile information if successful.
 * 
 * @param accessToken - The LIFF access token to verify
 * @returns LineProfile object with userId, displayName, and pictureUrl if verification succeeds,
 *          null if verification fails
 * 
 * @example
 * ```typescript
 * const profile = await verifyLiffToken(accessToken);
 * if (profile) {
 *   console.log(`User ${profile.displayName} authenticated`);
 * } else {
 *   console.log('Authentication failed');
 * }
 * ```
 */
export async function verifyLiffToken(
  accessToken: string
): Promise<LineProfile | null> {
  const operation = 'VERIFY_LIFF_TOKEN';

  try {
    // Verify token by calling LINE's verify API
    const verifyResponse = await fetch(
      'https://api.line.me/oauth2/v2.1/verify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          access_token: accessToken,
          client_id: process.env.LINE_CHANNEL_ID || '',
        }),
      }
    );

    if (!verifyResponse.ok) {
      // Log LIFF authentication failure (Requirement 12.2)
      console.error('LIFF token verification failed', {
        operation,
        reason: 'Token verification endpoint returned error',
        statusCode: verifyResponse.status,
        timestamp: new Date().toISOString(),
      });
      
      return null;
    }

    // Get user profile using the access token
    const profileResponse = await fetch('https://api.line.me/v2/profile', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!profileResponse.ok) {
      // Log LIFF authentication failure (Requirement 12.2)
      console.error('LIFF profile fetch failed', {
        operation,
        reason: 'Failed to fetch user profile',
        statusCode: profileResponse.status,
        timestamp: new Date().toISOString(),
      });
      
      return null;
    }

    const profileData = await profileResponse.json();

    console.log('LIFF token verified successfully', {
      operation,
      userId: profileData.userId,
      displayName: profileData.displayName,
      timestamp: new Date().toISOString(),
    });

    // Extract and return user profile information
    return {
      userId: profileData.userId,
      displayName: profileData.displayName,
      pictureUrl: profileData.pictureUrl || undefined,
    };
  } catch (error) {
    // Log LIFF authentication failure (Requirement 12.2)
    console.error('LIFF token verification error', {
      operation,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });
    
    return null;
  }
}
