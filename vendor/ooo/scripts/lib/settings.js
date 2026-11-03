// The server's public config (/config.json). The defaults apply when it
// can't be fetched, e.g. with no backend running.
export const settings = {
    features: { solo: true, quickMatch: true, invites: true },
    match: { seconds: 35, startingHealth: 5, minPlayers: 2, maxPlayers: 8 },
    difficulty: { startStep: 16, minStep: 3, rampRounds: 10 },
    nicknameMaxLength: 20,
};

export const hasMultiplayer = () => settings.features.quickMatch || settings.features.invites;

export async function loadSettings() {
    try {
        const response = await fetch('/config.json', { cache: 'no-cache' });
        if (response.ok) Object.assign(settings, await response.json());
    } catch {
        // the defaults stay
    }
}
