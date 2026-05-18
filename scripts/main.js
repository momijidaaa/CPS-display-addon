import { world, system } from "@minecraft/server";

const playerClicks = new Map();

function logClick(player) {
    if (!player) return;
    const now = Date.now();
    if (!playerClicks.has(player.id)) playerClicks.set(player.id, []);
    playerClicks.get(player.id).push(now);
}

world.afterEvents.entityHitEntity.subscribe((e) => logClick(e.damagingEntity));
world.afterEvents.playerBreakBlock.subscribe((e) => logClick(e.player));
world.afterEvents.itemUse.subscribe((e) => logClick(e.source));
world.afterEvents.itemUseOn.subscribe((e) => logClick(e.source));

system.runInterval(() => {
    const now = Date.now();
    for (const player of world.getAllPlayers()) {
        if (!playerClicks.has(player.id)) {
            playerClicks.set(player.id, []);
            continue;
        }

        let clicks = playerClicks.get(player.id);
        clicks = clicks.filter(time => now - time < 1000);
        playerClicks.set(player.id, clicks);

        player.onScreenDisplay.setActionBar(`§b§lCPS: ${clicks.length}`);
    }
}, 1);
