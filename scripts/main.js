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

world.afterEvents.entityHitEntity.subscribe((event) => {
    const damagingEntity = event.damagingEntity;
    if (damagingEntity && damagingEntity.typeId === "minecraft:player") {
        logClick(damagingEntity);
    }
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
    logClick(event.player);
});

world.afterEvents.itemUse.subscribe((event) => {
    logClick(event.source);
});

world.afterEvents.entityHitBlock.subscribe((event) => {
    const damagingEntity = event.damagingEntity;
    if (damagingEntity && damagingEntity.typeId === "minecraft:player") {
        logClick(damagingEntity);
    }
});

world.afterEvents.itemUseOn.subscribe((event) => {
    logClick(event.source);
});

system.runInterval(() => {
    const now = Date.now();
    const players = world.getAllPlayers();

    for (const player of players) {
        if (!playerClicks.has(player.id)) {
            playerClicks.set(player.id, []);
        }

        let clicks = playerClicks.get(player.id);

        clicks = clicks.filter(time => now - time < 1000);
        playerClicks.set(player.id, clicks);

        const cps = clicks.length;

        player.onScreenDisplay.setActionBar(`\n\n\n§b§lCPS: ${cps}`);
    }
}, 1);
