import { Weapon } from '../../../shared/types';


const weapons: readonly Weapon[] = [
  { type: 'AR', ammoType: 'Energy',  name: 'HAVOC Rifle', isAirdrop: false, isArenaStart: false },
  { type: 'AR', ammoType: 'Heavy',  name: 'VK-47 Flatline', isAirdrop: false, isArenaStart: false },
  { type: 'AR', ammoType: 'Heavy',  name: 'Hemlok Burst AR', isAirdrop: false, isArenaStart: false },
  { type: 'AR', ammoType: 'Light',  name: 'R-301 Carbine', isAirdrop: false, isArenaStart: false },
  { type: 'SMG', ammoType: 'Light', name: 'Alternator SMG', isAirdrop: false, isArenaStart: false },
  { type: 'SMG', ammoType: 'Light', name: 'R-99 SMG', isAirdrop: false, isArenaStart: false },
  { type: 'SMG', ammoType: 'Energy', name: 'Volt SMG', isAirdrop: false, isArenaStart: false },
  { type: 'SMG', ammoType: 'Light', name: 'RE-45 Auto', isAirdrop: false, isArenaStart: false },
  { type: 'SMG', ammoType: 'Relic', name: 'Prowler Burst PDW', isAirdrop: true, isArenaStart: false },
  { type: 'LMG', ammoType: 'Energy', name: 'Devotion LMG', isAirdrop: false, isArenaStart: false },
  { type: 'LMG', ammoType: 'Heavy', name: 'M600 Spitfire', isAirdrop: false, isArenaStart: false },
  { type: 'LMG', ammoType: 'Energy', name: 'L-STAR EMG', isAirdrop: false, isArenaStart: false },
  { type: 'Marksman', ammoType: 'Light', name: 'G7 Scout', isAirdrop: false, isArenaStart: false },
  { type: 'Marksman', ammoType: 'Heavy', name: '30-30 Repeater', isAirdrop: false, isArenaStart: false },
  { type: 'Marksman', ammoType: 'Arrows', name: 'Bocek Compound Bow', isAirdrop: false, isArenaStart: false },
  { type: 'Marksman', ammoType: 'Relic', name: 'Triple Take', isAirdrop: true, isArenaStart: false },
  { type: 'Shotgun', ammoType: 'Shotgun', name: 'EVA-8 Auto', isAirdrop: false, isArenaStart: false },
  { type: 'Shotgun', ammoType: 'Shotgun', name: 'Mastiff Shotgun', isAirdrop: false, isArenaStart: false },
  { type: 'Shotgun', ammoType: 'Shotgun', name: 'Peacekeeper', isAirdrop: false, isArenaStart: false },
  { type: 'Shotgun', ammoType: 'Shotgun', name: 'Mozambique Shotgun', isAirdrop: false, isArenaStart: true },
  { type: 'Pistol', ammoType: 'Heavy', name: 'Wingman', isAirdrop: false, isArenaStart: false },
  { type: 'Pistol', ammoType: 'Light', name: 'P2020', isAirdrop: false, isArenaStart: true },
  { type: 'Sniper', ammoType: 'Sniper', name: 'Charge Rifle', isAirdrop: false, isArenaStart: false },
  { type: 'Sniper', ammoType: 'Sniper', name: 'Longbow DMR', isAirdrop: false, isArenaStart: false },
  { type: 'Sniper', ammoType: 'Sniper', name: 'Sentinel', isAirdrop: false, isArenaStart: false },
  { type: 'Sniper', ammoType: 'Relic', name: 'Kraber .50-Cal Sniper', isAirdrop: true, isArenaStart: false },
];

export default weapons;
