/**
 * Runtime configuration. The API is reached at the host's published port 8080 in both local
 * (`ng serve`) and Docker setups, since the browser always runs on the host.
 */
export const environment = {
  apiUrl: 'http://localhost:8080/api',
};
