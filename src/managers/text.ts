import { $dataSystem } from '.';

//-----------------------------------------------------------------------------
// TextManager
//
// The static class that handles terms and messages.

export class TextManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static basic(basicId: number): string {
    return $dataSystem.terms.basic[basicId] || "";
  };

  static param(paramId: number): string {
    return $dataSystem.terms.params[paramId] || "";
  };

  static command(commandId: number): string {
    return $dataSystem.terms.commands[commandId] || "";
  };

  static message(messageId: string): string {
    return $dataSystem.terms.messages[messageId] || "";
  };

  static get currencyUnit(): string {
      return $dataSystem.currencyUnit;
  }

  // NOTE: rmmz-ts don't use this getter() anymore, but plugins may need it
  static getter(method: string, param: number | string): PropertyDescriptor {
    return {
        get: function() {
            return (this as any)[method](param);
        },
        configurable: true
    }
  }

  static get level(): string { return this.basic(0) }
  static get levelA(): string { return this.basic(1) }
  static get hp(): string { return this.basic(2) }
  static get hpA(): string { return this.basic(3) }
  static get mp(): string { return this.basic(4) }
  static get mpA(): string { return this.basic(5) }
  static get tp(): string { return this.basic(6) }
  static get tpA(): string { return this.basic(7) }
  static get exp(): string { return this.basic(8) }
  static get expA(): string { return this.basic(9) }
  static get fight(): string { return this.command(0) }
  static get escape(): string { return this.command(1) }
  static get attack(): string { return this.command(2) }
  static get guard(): string { return this.command(3) }
  static get item(): string { return this.command(4) }
  static get skill(): string { return this.command(5) }
  static get equip(): string { return this.command(6) }
  static get status(): string { return this.command(7) }
  static get formation(): string { return this.command(8) }
  static get save(): string { return this.command(9) }
  static get gameEnd(): string { return this.command(10) }
  static get options(): string { return this.command(11) }
  static get weapon(): string { return this.command(12) }
  static get armor(): string { return this.command(13) }
  static get keyItem(): string { return this.command(14) }
  static get equip2(): string { return this.command(15) }
  static get optimize(): string { return this.command(16) }
  static get clear(): string { return this.command(17) }
  static get newGame(): string { return this.command(18) }
  static get continue_(): string { return this.command(19) }
  static get toTitle(): string { return this.command(21) }
  static get cancel(): string { return this.command(22) }
  static get buy(): string { return this.command(24) }
  static get sell(): string { return this.command(25) }
  static get alwaysDash(): string {return this.message("alwaysDash") }
  static get commandRemember(): string {return this.message("commandRemember") }
  static get touchUI(): string {return this.message("touchUI") }
  static get bgmVolume(): string {return this.message("bgmVolume") }
  static get bgsVolume(): string {return this.message("bgsVolume") }
  static get meVolume(): string {return this.message("meVolume") }
  static get seVolume(): string {return this.message("seVolume") }
  static get possession(): string {return this.message("possession") }
  static get expTotal(): string {return this.message("expTotal") }
  static get expNext(): string {return this.message("expNext") }
  static get saveMessage(): string {return this.message("saveMessage") }
  static get loadMessage(): string {return this.message("loadMessage") }
  static get file(): string {return this.message("file") }
  static get autosave(): string {return this.message("autosave") }
  static get partyName(): string {return this.message("partyName") }
  static get emerge(): string {return this.message("emerge") }
  static get preemptive(): string {return this.message("preemptive") }
  static get surprise(): string {return this.message("surprise") }
  static get escapeStart(): string {return this.message("escapeStart") }
  static get escapeFailure(): string {return this.message("escapeFailure") }
  static get victory(): string {return this.message("victory") }
  static get defeat(): string {return this.message("defeat") }
  static get obtainExp(): string {return this.message("obtainExp") }
  static get obtainGold(): string {return this.message("obtainGold") }
  static get obtainItem(): string {return this.message("obtainItem") }
  static get levelUp(): string {return this.message("levelUp") }
  static get obtainSkill(): string {return this.message("obtainSkill") }
  static get useItem(): string {return this.message("useItem") }
  static get criticalToEnemy(): string {return this.message("criticalToEnemy") }
  static get criticalToActor(): string {return this.message("criticalToActor") }
  static get actorDamage(): string {return this.message("actorDamage") }
  static get actorRecovery(): string {return this.message("actorRecovery") }
  static get actorGain(): string {return this.message("actorGain") }
  static get actorLoss(): string {return this.message("actorLoss") }
  static get actorDrain(): string {return this.message("actorDrain") }
  static get actorNoDamage(): string {return this.message("actorNoDamage") }
  static get actorNoHit(): string {return this.message("actorNoHit") }
  static get enemyDamage(): string {return this.message("enemyDamage") }
  static get enemyRecovery(): string {return this.message("enemyRecovery") }
  static get enemyGain(): string {return this.message("enemyGain") }
  static get enemyLoss(): string {return this.message("enemyLoss") }
  static get enemyDrain(): string {return this.message("enemyDrain") }
  static get enemyNoDamage(): string {return this.message("enemyNoDamage") }
  static get enemyNoHit(): string {return this.message("enemyNoHit") }
  static get evasion(): string {return this.message("evasion") }
  static get magicEvasion(): string {return this.message("magicEvasion") }
  static get magicReflection(): string {return this.message("magicReflection") }
  static get counterAttack(): string {return this.message("counterAttack") }
  static get substitute(): string {return this.message("substitute") }
  static get buffAdd(): string {return this.message("buffAdd") }
  static get debuffAdd(): string {return this.message("debuffAdd") }
  static get buffRemove(): string {return this.message("buffRemove") }
  static get actionFailure(): string {return this.message("actionFailure") }
}
