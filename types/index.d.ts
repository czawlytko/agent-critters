export type Critter = { id: string; model: string; description: string }

declare module 'claude-code' {
  interface PluginState {
    'agent-critters': { models: Record<string, string>; running: Shaped<Critter[]> }
  }
}
