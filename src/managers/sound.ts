import { AudioManager } from '.';
import { $dataSystem } from '.';

//-----------------------------------------------------------------------------
// SoundManager
//
// The static class that plays sound effects defined in the database.

export class SoundManager {
  constructor() {
    throw new Error("This is a static class");
  }

  static preloadImportantSounds(): void {
    this.loadSystemSound(0);
    this.loadSystemSound(1);
    this.loadSystemSound(2);
    this.loadSystemSound(3);
  };

  static loadSystemSound(n: number): void {
    if ($dataSystem) {
        AudioManager.loadStaticSe($dataSystem.sounds[n]);
    }
  };

  static playSystemSound(n: number): void {
    if ($dataSystem) {
        AudioManager.playStaticSe($dataSystem.sounds[n]);
    }
  };

  static playCursor(): void {
    this.playSystemSound(0);
  };

  static playOk(): void {
    this.playSystemSound(1);
  };

  static playCancel(): void {
    this.playSystemSound(2);
  };

  static playBuzzer(): void {
    this.playSystemSound(3);
  };

  static playEquip(): void {
    this.playSystemSound(4);
  };

  static playSave(): void {
    this.playSystemSound(5);
  };

  static playLoad(): void {
    this.playSystemSound(6);
  };

  static playBattleStart(): void {
    this.playSystemSound(7);
  };

  static playEscape(): void {
    this.playSystemSound(8);
  };

  static playEnemyAttack(): void {
    this.playSystemSound(9);
  };

  static playEnemyDamage(): void {
    this.playSystemSound(10);
  };

  static playEnemyCollapse(): void {
    this.playSystemSound(11);
  };

  static playBossCollapse1(): void {
    this.playSystemSound(12);
  };

  static playBossCollapse2(): void {
    this.playSystemSound(13);
  };

  static playActorDamage(): void {
    this.playSystemSound(14);
  };

  static playActorCollapse(): void {
    this.playSystemSound(15);
  };

  static playRecovery(): void {
    this.playSystemSound(16);
  };

  static playMiss(): void {
    this.playSystemSound(17);
  };

  static playEvasion(): void {
    this.playSystemSound(18);
  };

  static playMagicEvasion(): void {
    this.playSystemSound(19);
  };

  static playReflection(): void {
    this.playSystemSound(20);
  };

  static playShop(): void {
    this.playSystemSound(21);
  };

  static playUseItem(): void {
    this.playSystemSound(22);
  };

  static playUseSkill(): void {
    this.playSystemSound(23);
  };
}
