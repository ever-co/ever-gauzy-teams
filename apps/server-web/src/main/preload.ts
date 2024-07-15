// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, IpcRenderer, ipcRenderer, IpcRendererEvent } from 'electron';
import { Channels } from './helpers/interfaces';

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    sendMessageSync(channel: Channels, ...args: unknown[]) {
      ipcRenderer.sendSync(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
    removeEventListener(channel: Channels) {
      ipcRenderer.removeAllListeners(channel)
    }
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);
contextBridge.exposeInMainWorld('languageChange', {
  language: (callback: any) => ipcRenderer.on('languageSignal', (_event, value) => callback(value))
})

export type ElectronHandler = typeof electronHandler;
export type languageChange = {
  language: (callback: any) => void
}
