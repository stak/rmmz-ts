declare namespace MZ {
  // foreign keys to point other database entry
  export type ID = number
  export type DataID = ID

  export type ActorID = DataID
  export type ClassID = DataID
  export type SkillID = DataID
  export type ItemID = DataID
  export type WeaponID = DataID
  export type ArmorID = DataID
  export type EnemyID = DataID
  export type TroopID = DataID
  export type TilesetID = DataID
  export type StateID = DataID
  export type AnimationID = DataID
  export type MapID = DataID

  export type SwitchID = ID
  export type VariableID = ID
  export type EquipTypeID = ID
  export type ArmorTypeID = ID
  export type WeaponTypeID = ID
  export type SkillTypeID = ID

  namespace ItemTypeID {
    export type Normal = 1
    export type Key = 2
    export type HiddenA = 3
    export type HiddenB = 4
  }

  export type ItemTypeID = 
    ItemTypeID.Normal |
    ItemTypeID.Key |
    ItemTypeID.HiddenA |
    ItemTypeID.HiddenB

  export type ExpParamArray = [
    base: number,
    extra: number,
    acc_a: number,
    acc_b: number,
  ]

  export type StatusArray = [
    hp: number,
    mp: number,
    atk: number,
    def: number,
    mat: number,
    mdf: number,
    agi: number,
    luk: number
  ]

  export type RGBAColorArray = [
    r: number,
    g: number,
    b: number,
    a: number
  ]

  export interface AudioParam {
      name: string;
      pan: number;
      pitch: number;
      volume: number;
  }

  namespace ItemKind {
    export type Item = 1
    export type Weapon = 2
    export type Armor = 3
  }
  export type ItemKind = ItemKind.Item | ItemKind.Weapon | ItemKind.Armor

  namespace HitType {
    export type Certain = 0
    export type Physical = 1
    export type Magical = 2
  }
  export type HitType = HitType.Certain |  HitType.Physical |  HitType.Magical

  namespace Occasion {
    export type Always = 0
    export type Battle = 1
    export type Menu = 2
    export type Never = 3
  }
  export type Occasion = Occasion.Always | Occasion.Battle | Occasion.Menu | Occasion.Never

  namespace Scope {
    export type None = 0
    export type Enemy = 1
    export type EnemyAll = 2
    export type EnemyRandom1 = 3
    export type EnemyRandom2 = 4
    export type EnemyRandom3 = 5
    export type EnemyRandom4 = 6
    export type ActorAlive = 7
    export type ActorAliveAll = 8
    export type ActorDead = 9
    export type ActorDeadAll = 10
    export type User = 11
    export type Actor = 12
    export type ActorAll = 13
    export type All = 14
  }
  export type Scope =
    Scope.None |
    Scope.Enemy |
    Scope.EnemyAll |
    Scope.EnemyRandom1 |
    Scope.EnemyRandom2 |
    Scope.EnemyRandom3 |
    Scope.EnemyRandom4 |
    Scope.ActorAlive |
    Scope.ActorAliveAll |
    Scope.ActorDead |
    Scope.ActorDeadAll |
    Scope.User |
    Scope.Actor |
    Scope.ActorAll |
    Scope.All

  namespace TroopEventPageSpan {
    export type Battle = 0
    export type Turn = 1
    export type Moment = 2
  }
  export type TroopEventPageSpan =
    TroopEventPageSpan.Battle |
    TroopEventPageSpan.Turn |
    TroopEventPageSpan.Moment

  namespace AutoRemovalTiming {
    export type Never = 0
    export type Action = 1
    export type Turn = 2
  }
  export type AutoRemovalTiming = AutoRemovalTiming.Never | AutoRemovalTiming.Action | AutoRemovalTiming.Turn

  namespace StateMotion {
    export type Normal = 0
    export type Abnormal = 1
    export type Sleep = 2
    export type Dead = 3
  }
  export type StateMotion = StateMotion.Normal | StateMotion.Abnormal | StateMotion.Sleep | StateMotion.Dead

  namespace StateOverlay {
    export type None = 0
    export type State1 = 1
    export type State2 = 2
    export type State3 = 3
    export type State4 = 4
    export type State5 = 5
    export type State6 = 6
    export type State7 = 7
    export type State8 = 8
    export type State9 = 9
    export type State10 = 10
  }
  export type StateOverlay =
    StateOverlay.None |
    StateOverlay.State1 |
    StateOverlay.State2 |
    StateOverlay.State3 |
    StateOverlay.State4 |
    StateOverlay.State5 |
    StateOverlay.State6 |
    StateOverlay.State7 |
    StateOverlay.State8 |
    StateOverlay.State9 |
    StateOverlay.State10
  
  namespace StateRestriction {
    export type None = 0
    export type AttackEnemy = 1
    export type AttackBattler = 2
    export type AttackActor = 3
    export type Skip = 4
  }
  export type StateRestriction = 
    StateRestriction.None | 
    StateRestriction.AttackEnemy |
    StateRestriction.AttackBattler |
    StateRestriction.AttackActor |
    StateRestriction.Skip

  namespace AnimationDisplayType {
    export type Target = 0
    export type CenterOfTargets = 1
    export type CenterOfScreen = 2
  }
  export type AnimationDisplayType =
    AnimationDisplayType.Target |
    AnimationDisplayType.CenterOfTargets |
    AnimationDisplayType.CenterOfScreen

  export interface Trait {
    code: number;
    dataId: number;
    value: number;
  }

  export type EventCommand = {
    code: number;
    indent: number;
    parameters: any[]; // TODO: typing
  }
  export type EventMoveCommand = {
    code : number;
    indent: null;
    parameters?: any[]; // TODO: typing
  }


  export interface Data {
    id: DataID;
    name: string;
  }

  export interface DataWithNote extends Data {
      note: string
  }


  // Items, Weapons, Armors, Skills ==========================================
  export interface DataItemBase extends DataWithNote {
    description: string;
    iconIndex: number;
  }

  export interface DataEquipItem extends DataItemBase {
    etypeId: EquipTypeID;
    traits: Trait[];
    params: StatusArray;
    price: number;
  }

  export interface DataWeapon extends DataEquipItem {
    animationId: AnimationID;
    wtypeId: WeaponTypeID;
    etypeId: 1;
  }

  export interface DataArmor extends DataEquipItem {
    atypeId: ArmorTypeID;
    etypeId: EquipTypeID;
  }

  export interface DataConsumable extends DataItemBase {
    animationId: AnimationID;
    damage: Damage;
    effects: Effect[];
    hitType: HitType;
    occasion: Occasion;
    repeats: number;
    scope: Scope;
    speed: number;
    successRate: number;
    tpGain: number;
  }

  export interface DataSkill extends DataConsumable {
    message1: string;
    message2: string;
    messageType: number;
    mpCost: number;
    requiredWtypeId1: number;
    requiredWtypeId2: number;
    stypeId: SkillTypeID;
    tpCost: number;
  }

  export interface DataItem extends DataConsumable {
    itypeId: ItemTypeID;
    price: number;
  }

  export interface Effect {
    code: number;
    dataId: number;
    value1: number;
    value2: number;
  }
  
  export interface Damage {
    critical: boolean;
    elementId: number;
    formula: string;
    type: number;
    variance: number;
  }

  // Actors, Classes, Enemies, Troops ========================================
  export interface DataActor extends DataWithNote {
    battlerName: string;
    characterIndex: number;
    characterName: string;
    classId: ClassID;
    equips: DataID[];
    faceIndex: number;
    faceName: string;
    traits: Trait[];
    initialLevel: number;
    maxLevel: number;
    nickname: string;
    profile: string;
  }

  export interface DataClass extends DataWithNote {
    expParams: ExpParamArray;
    traits: Trait[];
    learnings: Learning[];
    params: Array<number[]>;
  }

  export interface DataEnemy extends DataWithNote {
    actions: Action[];
    battlerHue: number;
    battlerName: string;
    dropItems: DropItem[];
    exp: number;
    traits: Trait[];
    gold: number;
    params: StatusArray;
  }

  export interface DataTroop extends Data {
    members: TroopMember[];
    pages: TroopEventPage[];
  }

  export interface TroopMember {
    enemyId: number;
    x: number;
    y: number;
    hidden: boolean;
  }
  export interface TroopEventPage {
    conditions: TroopEventConditions;
    list: EventCommand[];
    span: TroopEventPageSpan
  }
  export interface TroopEventConditions {
    actorId: number;
    actorHp: number;
    actorValid: boolean;
    enemyIndex: number;
    enemyHp: number;
    enemyValid: boolean;
    switchId: SwitchID;
    switchValid: boolean;
    turnA: number;
    turnB: number;
    turnEnding: boolean;
    turnValid: boolean;
  }

  export interface Action {
    conditionParam1: number;
    conditionParam2: number;
    conditionType: number;
    rating: number;
    skillId: SkillID;
  }

  export interface DropItem {
      kind: ItemKind;
      dataId: DataID;
      denominator: number;
  }

  export interface Learning {
      level: number;
      note: string;
      skillId: SkillID;
  }


  // States, Animations, System
  export interface DataState extends DataWithNote {
    autoRemovalTiming: AutoRemovalTiming;
    chanceByDamage: number;
    iconIndex: number;
    maxTurns: number;
    message1: string;
    message2: string;
    message3: string;
    message4: string;
    messageType: number;
    minTurns: number;
    motion: StateMotion;
    overlay: StateOverlay;
    priority: number;
    releaseByDamage: boolean;
    removeAtBattleEnd: boolean;
    removeByDamage: boolean;
    removeByRestriction: boolean;
    removeByWalking: boolean;
    restriction: StateRestriction;
    stepsToRemove: number;
    traits: Trait[];
  }

  export interface DataAnimation extends Data {
    displayType: AnimationDisplayType;
    effectName: string;
    flashTimings: FlashTiming[];
    offsetX: number;
    offsetY: number;
    rotation: Rotation;
    scale: number;
    soundTimings: SoundTiming[];
    speed: number;
  }

  export interface FlashTiming {
    frame: number;
    duration: number;
    color: RGBAColorArray;
  }

  export interface Rotation {
      x: number;
      y: number;
      z: number;
  }

  export interface SoundTiming {
      frame: number;
      se: AudioParam;
  }

  export interface DataSystem {
      // basic
      gameTitle: string;
      currencyUnit: string;
      terms: Terms;
      windowTone: RGBAColorArray;
      advanced: Advanced;

      // title
      title1Name: string;
      title2Name: string;
      titleCommandWindow: TitleCommandWindow;
      optDrawTitle: boolean;

      // initial state
      partyMembers: ActorID[];
      startMapId: number;
      startX: number;
      startY: number;
      airship: Vehicle;
      boat: Vehicle;
      ship: Vehicle;

      // audio
      titleBgm: AudioParam;
      battleBgm: AudioParam;
      victoryMe: AudioParam;
      defeatMe: AudioParam;
      gameoverMe: AudioParam;
      sounds: AudioParam[];

      // options
      optAutosave: boolean;
      optDisplayTp: boolean;
      optExtraExp: boolean;
      optFloorDeath: boolean;
      optFollowers: boolean;
      optKeyItemsNumber: boolean;
      optSlipDeath: boolean;
      optTransparent: boolean;
      optSideView: boolean;
      battleSystem: BattleSystem;
      menuCommands: boolean[];
      itemCategories: boolean[];

      // user defined lists
      weaponTypes: SystemTypesArray;
      armorTypes: SystemTypesArray;
      equipTypes: SystemTypesArray;
      skillTypes: SystemTypesArray;
      elements: SystemTypesArray;
      attackMotions: AttackMotion[];
      magicSkills: SkillTypeID[];

      // test battle
      battleback1Name: string;
      battleback2Name: string;
      battlerHue: number;
      battlerName: string;
      testBattlers: TestBattler[];
      testTroopId: TroopID;

      // internal use
      editMapId: MapID;
      locale: string;
      switches: Array<''>;
      variables: Array<''>;
      versionId: number;
  }

  export interface Advanced {
    gameId: number;
    screenWidth: number;
    screenHeight: number;
    uiAreaWidth: number;
    uiAreaHeight: number;
    numberFontFilename: string;
    fallbackFonts: string;
    fontSize: number;
    mainFontFilename: string;
  }

  namespace BattleSystem {
    export type Turn = 0
    export type Active = 1
    export type Wait = 2
  }
  export type BattleSystem = BattleSystem.Turn | BattleSystem.Active | BattleSystem.Wait

  export interface Vehicle {
    bgm: AudioParam;
    characterIndex: number;
    characterName: string;
    startMapId: number;
    startX: number;
    startY: number;
  }

  export type SystemTypesArray = ['', ...string[]];

  namespace AttackMotionType {
    export type Thrust = 0
    export type Swing = 1
    export type Missile = 2
  }
  export type AttackMotionType = AttackMotionType.Thrust | AttackMotionType.Swing | AttackMotionType.Missile

  export interface AttackMotion {
    type: AttackMotionType;
    weaponImageId: number;
  }

  namespace TitleCommandWindowBackground {
    export type Window = 0
    export type DropShadow = 1
    export type Transparent = 2
  }
  export type TitleCommandWindowBackground =
    TitleCommandWindowBackground.Window |
    TitleCommandWindowBackground.DropShadow |
    TitleCommandWindowBackground.Transparent

  export interface TitleCommandWindow {
    background: TitleCommandWindowBackground;
    offsetX: number;
    offsetY: number;
  }

  export interface Terms {
      basic: string[];
      commands: Array<null | string>;
      params: string[];
      messages: { [key: string]: string };
  }

  export interface TestBattler {
      actorId: ActorID;
      level: number;
      equips: DataID[];
  }


  // Tileset, MapInfo, Map, Event, CommonEvent
  namespace TileSetMode {
    export type Field = 0
    export type Area = 1
  }
  export type TileSetMode = TileSetMode.Field | TileSetMode.Area
  export type TileSetFlag = number

  export interface DataTileset extends DataWithNote {
    flags: TileSetFlag[];
    mode: TileSetMode;
    tilesetNames: string[];
  }

  export interface DataMapInfo extends Data {
      expanded: boolean;
      order: number;
      parentId: MapID;
      scrollX: number;
      scrollY: number;
  }

  namespace MapScrollType {
    export type Fixed = 0
    export type ScrollY = 1
    export type ScrollX = 2
    export type ScrollBoth = 3
  }
  export type MapScrollType =
    MapScrollType.Fixed |
    MapScrollType.ScrollY |
    MapScrollType.ScrollX |
    MapScrollType.ScrollBoth

  export interface MapEncount {
    troopId: TroopID;
    weight: number;
    regionSet: number[];
  }
  export type MapEventArray = [null, ...Event[]]

  export interface DataMap {
    displayName: string;
    note: string;
    width: number;
    height: number;
    tilesetId: TilesetID;
    scrollType: MapScrollType;
    disableDashing: boolean;
    encounterStep: number;
    encounterList: MapEncount[];

    specifyBattleback: boolean;
    battleback1Name: string;
    battleback2Name: string;

    bgm: AudioParam;
    bgs: AudioParam;
    autoplayBgm: boolean;
    autoplayBgs: boolean;

    parallaxName: string;
    parallaxShow: boolean;  
    parallaxLoopX: boolean;
    parallaxLoopY: boolean;
    parallaxSx: number;
    parallaxSy: number;

    data: number[];
    events: MapEventArray;
  }

  export interface Event extends DataWithNote {
      x: number;
      y: number;
      pages: EventPage[];
  } 

  export interface EventPage {
      conditions: EventConditions;
      image: EventImage;

      moveType: EventMoveType;
      moveRoute: EventMoveRoute;
      moveSpeed: MoveSpeed;
      moveFrequency: MoveFrequency;

      walkAnime: boolean;
      stepAnime: boolean;
      directionFix: boolean;
      through: boolean;

      priorityType: EventPriorityType;
      trigger: EventTrigger;
      list: EventCommand[];
  }

  namespace EventPriorityType {
    export type Under = 0
    export type Normal = 1
    export type Upper = 2
  }
  export type EventPriorityType =
    EventPriorityType.Under |
    EventPriorityType.Normal |
    EventPriorityType.Upper

  namespace EventTrigger {
    export type Button = 0
    export type TouchFromPlayer = 1
    export type TouchFromEvent = 2
    export type Auto = 3
    export type Parallel = 4
  }
  export type EventTrigger =
    EventTrigger.Button |
    EventTrigger.TouchFromPlayer |
    EventTrigger.TouchFromEvent |
    EventTrigger.Auto |
    EventTrigger.Parallel

  export type SelfSwitchCh = 'A' | 'B' | 'C' | 'D'
  export type MoveSpeed = 1 | 2 | 3 | 4 | 5 | 6
  export type MoveFrequency = 1 | 2 | 3 | 4 | 5
  export interface EventConditions {
      actorValid: boolean;
      actorId: ActorID;

      itemValid: boolean;
      itemId: ItemID;

      selfSwitchValid: boolean;
      selfSwitchCh: SelfSwitchCh;

      switch1Valid: boolean;
      switch1Id: SwitchID;
      switch2Valid: boolean;
      switch2Id: SwitchID;

      variableValid: boolean;
      variableId: VariableID;
      variableValue: number;
  }

  export interface EventImage {
      characterName: string
      characterIndex: number;
      tileId: number;
      direction: number;
      pattern: number;
  }

  namespace EventMoveType {
    export type Stop = 0
    export type Random = 1
    export type TowardPlayer = 2
    export type Custom = 3
  }
  export type EventMoveType =
    EventMoveType.Stop |
    EventMoveType.Random |
    EventMoveType.TowardPlayer |
    EventMoveType.Custom

  export interface EventMoveRoute {
      list: EventMoveCommand[];
      repeat: boolean;
      skippable: boolean;
      wait: boolean;
  }

  namespace CommonEventTrigger {
    export type None = 0
    export type Auto = 1
    export type Parallel = 2
  }
  export type CommonEventTrigger =
    CommonEventTrigger.None |
    CommonEventTrigger.Auto |
    CommonEventTrigger.Parallel

  export interface DataCommonEvent extends Data {
      list: EventCommand[];
      trigger: CommonEventTrigger;
      switchId: SwitchID;
  }
}

export { MZ };
