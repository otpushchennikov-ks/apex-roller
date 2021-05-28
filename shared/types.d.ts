declare module 'roller-types' {
  type AmmoType = 'Light' | 'Heavy' | 'Energy' | 'Shotgun' | 'Sniper' | 'Arrows' | 'Relic'
  
  type WeaponType = 'AR' | 'SMG' | 'LMG' | 'Marksman' | 'Shotgun' | 'Pistol' | 'Sniper'
  
  type Weapon = {
    type: WeaponType
    ammoType: AmmoType
    name: string
    isAirdrop: boolean
    isArenaStart: boolean
  }
  
  type Challenge = {
    name: string
    runFn: (weaponsCount: number, isUnique?: boolean) => Weapon[]
  }
  
  type ChallengeFactory = (name: string, poolFactory: () => Weapon[]) => Challenge
  
  type UserShareableState = {
    challengeIndex: number
    isUnique: boolean
    count: number
    weapons: Weapon[]
  }
}
