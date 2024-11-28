export interface GeneralConfig {
    lang?: string
    autoUpdate?: boolean
    updateCheckPeriod?: string
    theme?: string
    setup?: boolean
    [key: string]: any
}

export interface ServerConfig {
    PORT: number;
    NEXT_PUBLIC_GAUZY_API_SERVER_URL: string;
    GAUZY_API_SERVER_URL: string;
    DESKTOP_WEB_SERVER_HOSTNAME: string;
    [key: string]: any;
}
export interface WebServer {
    server?: ServerConfig;
    general?: GeneralConfig;
}
