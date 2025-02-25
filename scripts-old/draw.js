const c = global.mutl.config,
    tex = global.mutl.tex;

Events.run(Trigger.draw, () => {
    let cx = Math.floor(Core.camera.position.x / 8), cy = Math.floor(Core.camera.position.y / 8);
    let cw = Math.floor(Core.camera.width / 8), ch = Math.floor(Core.camera.height / 8);
    // set position from bottom-left to top-right of the camera.
    let ux = (cx - cw / 2) * 8 - 30, uy = (cy - ch / 2) * 8 - 30;
    let uw = cw * 8 + 30, uh = ch * 8 + 30;
    
    /* Draws a circle with a radius of a turret's range and/or real hit radius for every turret. */
    if (c.turretRange || c.turretHitRadius) {
        Draw.draw(Layer.overlayUI + 0.03, () => {
            for (let tile of Vars.indexer.getEnemy(Team.derelict, BlockFlag.turret).toArray()) {
                if (!tile.block() || !tile.build) continue;
        
                let block = tile.block(), build = tile.build;
                
                if (block.range == null || block.range <= 0 || !(build instanceof Turret.TurretBuild)) continue;
                
                let valid = block instanceof PowerTurret ? build.power.status > 0 : build.hasAmmo(),
                    active = block instanceof PowerTurret ? (build.isActive() && build.power.status > 0) : build.isActive();

                // whether the block's position is within the camera range.
                if (Mathf.dst(cx, cy, tile.x, tile.y) < Mathf.dst(cw, ch)) {
                    Draw.color(build.team.color);
                    Draw.alpha(active ? 0.66 : 0.36);
                    
                    if (c.turretRange) {
                        Lines.circle(build.x, build.y, block.range);
                    }
                    
                    if (c.turretHitRadius && valid) {
                        Lines.circle(build.x, build.y, build.peekAmmo().range());
                    }
                }
            }
        });
    }
    
    /* Draws a circle on every unit with a radius of its range. */
    if (c.unitRange) {
        Draw.draw(Layer.overlayUI + 0.04, () => {
            // iterate every unit that is within the camera.
            for (let unit of Groups.unit.intersect(ux, uy, uw, uh).toArray()) {
                let type = unit.type;
                
                if (unit.dead || !type.range || type.range <= 0) continue;
                
                Draw.color(unit.team.color);
                Draw.alpha(0.36);
                
                Lines.circle(unit.x, unit.y, type.range);
            }
        });
    }
    
    /* Display the status of the controlled entity, */
    if (c.controlledStatus) {
        let unit = Vars.player.unit();
        
        if (!unit || unit == Nulls.unit) return;
        
        let px = Vars.player.x, py = Vars.player.y;
        
        Draw.draw(Layer.overlayUI + 0.08, () => {
            // whether the player is within the camera range.
            if (Mathf.dst(cx, cy, px / 8, py / 8) < Mathf.dst(cw, ch)) {
                tex.drawStatus(px, py, unit);
            }
        });
    }
    
    /* Display the status of all entity except for the player. */
    if (c.allStatus) {
        Draw.draw(Layer.overlayUI + 0.07, () => {
            for (let unit of Groups.unit.intersect(ux, uy, uw, uh).toArray()) {
                if (unit.dead || unit == Vars.player.unit()) continue;
                
                tex.drawStatus(unit.x, unit.y, unit);
            }
        });
    }
});
