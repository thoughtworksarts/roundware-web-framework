import { logger } from "./shims";

var deviceId, clientType, userName, apiClient;
var authToken = "UNKNOWN";
var userName = "(anonymous)";

/** Responsible for identifying the user to the Roundware server and retrieving an auth token 
 * Note: We don't currently use device ID but will eventually want to up a system where users would be able to claim automatically-created anonymous Roundware accounts. 
 * Users do NOT need an account to use Roundware. 
 *
 * @note From Halsey:
 * "Each user obviously has a unique token, but we thought that associating the token with a unique device_id would be helpful so if an app was deleted it wouldn’t change or if a user has multiple RW apps on their phone, they all would use the same user. So this is how things work on iOS at least. The client sends the device_id to the users/ endpoint; if the device_id is found on the server, the associated token is returned for use, but if the device_id isn’t found, a new token is generated along with an associated user and user profile. Once we allow users to claim their accounts, we will use the username/pw to authenticate instead of the device_id.”
 * **/
export class User {
  /** Create a User
   * @param {Object} options - Various configuration parameters for this user
   * @param {apiClient} options.apiClient - the API client object to use for server API calls
   * @param {String} options.deviceId - this value distinguishes a particular user, who may be anonymous, to the server; by default we will fingerprint the browser to get this value, but you can supply your own value (useful if your app has a preexisting authorization scheme)
   * @param {String} [options.clientType = "web"] 
   **/
  constructor(options) {
    apiClient = options.apiClient;

    // TODO need to try to persist deviceId as a random value that can partially serve as "a unique identifier generated by the client" that can 
    // used to claim a anonymous user's contributions. Some ideas for implementation: https://clientjs.org/ and https://github.com/Valve/fingerprintjs2
    deviceId = options.deviceId || "00000000000000"; 
    clientType = options.clientType || "web";
  }

  /** @returns {String} human-readable representation of this user **/
  toString() {
    return `User ${userName} (deviceId ${deviceId})`;
  }

  /** Make an API call to associate the (possibly anonymous) application user with a Roundware user account.
   * Upon success, this function receives an auth token, which is passed onto the apiClient object.
   * @returns {Promise} represents the pending API call **/
  connect() {
    var data = {
      device_id: deviceId,
      client_type: clientType
    };

    // TODO need to also handle auth failures
    return apiClient.post("/users/",data).
      done(function connectionSuccess(data) {
        userName = data.username;
        apiClient.setAuthToken(data.token);
      });
  }
}
