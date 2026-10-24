import { HttpService } from '@nestjs/axios';
import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AxiosRequestConfig, Method } from 'axios';
import * as jose from 'jose';
import { verify } from 'jsonwebtoken';
import { get } from 'lodash';
import { catchError, lastValueFrom, map } from 'rxjs';
import { HttpMethod, KeycloakEndpointType } from '../enums';
import {
  KeycloakClaim,
  KeycloakClientTokenResponse,
  KeycloakExchangeTokenResponse,
  KeycloakOptions,
  KeycloakVerifyTokenResult,
  MapOfKidToPublicKey,
  PublicKey,
  TokenHeader,
} from '../interfaces';
import { KeycloakError } from '../keycloak.error';
import { KEYCLOAK_OPTIONS } from '../keycloak.module-definition';
import { getKeycloakEndpoint } from '../utils';

@Injectable()
export class KeycloakService {
  private readonly _url: string;
  private readonly _realm: string;
  private readonly _clientId: string;
  private readonly _clientSecret: string;
  private readonly _jwtSecretCert?: string;

  constructor(
    @Inject(KEYCLOAK_OPTIONS) private readonly _options: KeycloakOptions,
    private readonly _httpService: HttpService,
  ) {
    this._url = this._options.url;
    this._realm = this._options.realm;
    this._clientId = this._options.client;
    this._clientSecret = this._options.clientSecret;
    this._jwtSecretCert = this._options.jwtSecretCert;
  }

  /** ================================================================ */

  async verifyToken(token: string): Promise<KeycloakVerifyTokenResult> {
    const claim: KeycloakClaim = this._jwtSecretCert
      ? await this._verifyWithSecretCert(token)
      : await this._verifyWithPublicKey(token);

    const roles = claim.resource_access[this._clientId]?.roles;

    return {
      id: claim.sub,
      accessToken: token,
      username: claim.preferred_username,
      roles,
      email: claim.email,
      fullName: claim.name,
      firstName: claim.given_name,
      lastName: claim.family_name,
      scopes: [
        ...get(claim, `realm_access.roles`, []),
        ...get(claim, `resource_access.${this._clientId}.roles`, []),
      ].join(','),
    };
  }

  private async _verifyWithSecretCert(token: string): Promise<KeycloakClaim> {
    try {
      return (await this._verifyAsync(
        token,
        this._jwtSecretCert,
      )) as unknown as KeycloakClaim;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Invalid token');
    }
  }

  private async _verifyWithPublicKey(token: string): Promise<KeycloakClaim> {
    try {
      // Fetch the public keys from the JWKS endpoint
      const publicKeys = await this._getPublicKey(
        getKeycloakEndpoint(this._url, this._realm, KeycloakEndpointType.JWKS),
      );

      // Decode the JWT and grab the kid property from the header.
      const header = this._decodeTokenHeader(token);
      const key = publicKeys[header.kid];

      if (key === undefined) {
        throw new BadRequestException('Unknown kid');
      }

      return (await this._verifyAsync(token, key.pem)) as KeycloakClaim;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Invalid token');
    }
  }

  private async _getPublicKey(url: string): Promise<MapOfKidToPublicKey> {
    const { data } = await lastValueFrom(this._httpService.get(url));

    return data.keys.reduce(async (agg: PublicKey, current) => {
      const pem = await jose.importJWK(current);
      agg[current.kid] = { instance: current, pem };
      return agg;
    }, {} as MapOfKidToPublicKey);
  }

  private _decodeTokenHeader(token: string): TokenHeader {
    const tokenHeader = Buffer.from(token.split('.')[0], 'base64').toString(
      'utf8',
    );
    return JSON.parse(tokenHeader);
  }

  private async _verifyAsync(
    token: string,
    secretOrKey: string | undefined,
    options = {},
  ): Promise<KeycloakClaim> {
    return new Promise((resolve, reject) => {
      verify(token, secretOrKey || '', options, (err, decoded) => {
        if (err) return reject(err);
        resolve(decoded as KeycloakClaim);
      });
    });
  }

  /** ================================================================ */

  /**
   * Obtain client token
   * @returns KeycloakClientTokenResponse
   */
  async getClientToken(
    clientId?: string,
    clientSecret?: string,
  ): Promise<KeycloakClientTokenResponse> {
    const url = getKeycloakEndpoint(
      this._url,
      this._realm,
      KeycloakEndpointType.TOKEN,
    );

    return this._requestToKeycloak({
      url,
      method: HttpMethod.POST,
      data: {
        client_id: clientId ?? this._clientId,
        client_secret: clientSecret ?? this._clientSecret,
        grant_type: 'client_credentials',
      },
    });
  }

  /**
   * Obtain access token using username and password
   * @param username - username
   * @param password - password
   * @returns KeycloakExchangeTokenResponse
   */
  async login(
    username: string,
    password: string,
  ): Promise<KeycloakExchangeTokenResponse> {
    const url = getKeycloakEndpoint(
      this._url,
      this._realm,
      KeycloakEndpointType.TOKEN,
    );

    return this._requestToKeycloak({
      url,
      method: HttpMethod.POST,
      data: {
        client_id: this._clientId,
        username,
        password,
        grant_type: 'password',
        client_secret: this._clientSecret,
      },
    });
  }

  /**
   * Obtain permissions from Keycloak on behalf of the user
   * @param token - access token
   * @returns unknown
   */
  async getPermissions(token: string): Promise<unknown> {
    const url = getKeycloakEndpoint(
      this._url,
      this._realm,
      KeycloakEndpointType.TOKEN,
    );

    return this._requestToKeycloak({
      url,
      method: HttpMethod.POST,
      data: {
        audience: this._clientId,
        grant_type: 'urn:ietf:params:oauth:grant-type:uma-ticket',
        response_mode: 'permissions',
      },
      config: {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    });
  }

  /**
   * Revoke session using access token and refresh token
   * @param token - access token
   * @param refreshToken - refresh token
   * @returns void
   */
  async logout(refreshToken: string): Promise<void> {
    const url = getKeycloakEndpoint(
      this._url,
      this._realm,
      KeycloakEndpointType.LOGOUT,
    );

    await this._requestToKeycloak({
      url,
      method: HttpMethod.POST,
      data: {
        client_id: this._clientId,
        client_secret: this._clientSecret,
        refresh_token: refreshToken,
      },
    });
  }

  /**
   * Refresh access token using refresh token
   * @param refreshToken - refresh token
   * @returns KeycloakExchangeTokenResponse
   */
  async refreshToken(
    refreshToken: string,
  ): Promise<KeycloakExchangeTokenResponse> {
    const url = getKeycloakEndpoint(
      this._url,
      this._realm,
      KeycloakEndpointType.TOKEN,
    );

    return this._requestToKeycloak({
      url,
      method: HttpMethod.POST,
      data: {
        client_id: this._clientId,
        client_secret: this._clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });
  }

  /** ================================================================ */

  async _requestToKeycloak<T>({
    url,
    method,
    data,
    config = {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    },
  }: {
    url: string;
    method: Method | string;
    data?: Record<string, unknown>;
    config?: AxiosRequestConfig | undefined;
  }): Promise<T> {
    return lastValueFrom(
      this._httpService.request({ url, method, data, ...config }).pipe(
        map((response) => response.data),
        catchError((error) => {
          // Logging for debugging purposes
          const status = error?.response?.status || 500;
          const response = error?.response;

          // if response is not available, error is related to network
          if (!response) {
            throw new BadRequestException(error.code, {
              cause: error,
            });
          }

          // if response is available, throw error as KeycloakException
          if (status >= 400 && status < 500) {
            const errorData = response.data;

            throw new KeycloakError(
              errorData.error_description,
              errorData.error,
            );
          }

          // unknown error
          throw error;
        }),
      ),
    );
  }
}
