import { Game_Character } from '.';
import { $gameParty, $gamePlayer, $dataSystem } from '../managers';
import { Game_Actor } from '.';

//-----------------------------------------------------------------------------
// Game_Follower
//
// The game object class for a follower. A follower is an allied character,
// other than the front character, displayed in the party.

export class Game_Follower extends Game_Character {
  _memberIndex = 0

  constructor(memberIndex: number) {
    super();
    this.initialize(...arguments);
  }

  initialize(memberIndex?: number): void {
    // move to super() in constructor
    // Game_CharacterBase.prototype.initialize.call(this);
    this._memberIndex = memberIndex!;
    this.setTransparent($dataSystem.optTransparent);
    this.setThrough(true);
  }

  refresh(): void {
    const characterName = this.isVisible() ? this.actor().characterName() : "";
    const characterIndex = this.isVisible() ? this.actor().characterIndex() : 0;
    this.setImage(characterName, characterIndex);
  }

  actor(): Game_Actor {
    return $gameParty.battleMembers()[this._memberIndex];
  }

  isVisible(): boolean {
    return this.actor() && $gamePlayer.followers().isVisible();
  }

  isGathered(): boolean {
    return !this.isMoving() && this.pos($gamePlayer.x, $gamePlayer.y);
  }

  update(): void {
    super.update();
    this.setMoveSpeed($gamePlayer.realMoveSpeed());
    this.setOpacity($gamePlayer.opacity());
    this.setBlendMode($gamePlayer.blendMode());
    this.setWalkAnime($gamePlayer.hasWalkAnime());
    this.setStepAnime($gamePlayer.hasStepAnime());
    this.setDirectionFix($gamePlayer.isDirectionFixed());
    this.setTransparent($gamePlayer.isTransparent());
  }

  chaseCharacter(character: Game_Character): void {
    const sx = this.deltaXFrom(character.x);
    const sy = this.deltaYFrom(character.y);
    if (sx !== 0 && sy !== 0) {
        this.moveDiagonally(sx > 0 ? 4 : 6, sy > 0 ? 8 : 2);
    } else if (sx !== 0) {
        this.moveStraight(sx > 0 ? 4 : 6);
    } else if (sy !== 0) {
        this.moveStraight(sy > 0 ? 8 : 2);
    }
    this.setMoveSpeed($gamePlayer.realMoveSpeed());
  }
}
