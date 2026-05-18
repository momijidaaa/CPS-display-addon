import { world, system } from "@minecraft/server";

const playerClicks = new Map();

function logClick(player) {
    if (!player || !player.id) return;

    const now = Date.now();
    if (!playerClicks.has(player.id)) {
        playerClicks.set(player.id, []);
    }

    const clicks = playerClicks.get(player.id);
    clicks.push(now);
}

system.runInterval(() => {
    const now = Date.now();
    const players = world.getAllPlayers();

    for (const player of players) {
        const input = player.inputInfo;
        if (input) {
            if (input.isAttacking || input.isUsingItem) {
                if (!player.dynamicProperties?.get("is_clicking")) {
                    logClick(player);
                    player.setDynamicProperty("is_clicking", true);
                }
            } else {
                player.setDynamicProperty("is_clicking", false);
            }
        }

        if (!playerClicks.has(player.id)) {
            playerClicks.set(player.id, []);
        }

        let clicks = playerClicks.get(player.id);
        clicks = clicks.filter(time => now - time < 1000);
        playerClicks.set(player.id, clicks);

        const cps = clicks.length;

        player.onScreenDisplay.setActionBar(`§b§lCPS: ${cps}`);
    }
}, 1);
