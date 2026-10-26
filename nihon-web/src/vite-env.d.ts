/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The API's address, e.g. https://api.example.com/api. Defaults to the local API in development. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
