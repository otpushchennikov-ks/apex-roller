import * as T from 'io-ts'

const AmmoTypeCodec = T.union([
  T.literal('Light'),
  T.literal('Heavy'),
  T.literal('Energy'),
  T.literal('Shotgun'),
  T.literal('Sniper'),
  T.literal('Arrows'),
  T.literal('Relic'),
])
export type AmmoType = T.TypeOf<typeof AmmoTypeCodec>

const WeaponTypeCodec = T.union([
  T.literal('AR'),
  T.literal('SMG'),
  T.literal('LMG'),
  T.literal('Marksman'),
  T.literal('Shotgun'),
  T.literal('Pistol'),
  T.literal('Sniper'),
])
export type WeaponType = T.TypeOf<typeof WeaponTypeCodec>

const WeaponCodec = T.type({
  type: WeaponTypeCodec,
  ammoType: AmmoTypeCodec,
  name: T.string,
  isAirdrop: T.boolean,
  isArenaStart: T.boolean,
})
export type Weapon = T.TypeOf<typeof WeaponCodec>

const UserShareableStateCodec = T.type({
  challengeIndex: T.number,
  isUnique: T.boolean,
  count: T.number,
  weapons: T.array(WeaponCodec)
})
export type UserShareableState = T.TypeOf<typeof UserShareableStateCodec>

const RoomIdCodec = T.brand(
  T.string,
  (s): s is T.Branded<string, {readonly RoomId: symbol}> => s.length <= 36,
  'RoomId'
)
export type RoomId = T.TypeOf<typeof RoomIdCodec>
const UserIdCodec = T.brand(
  T.string,
  // TODO do we want to verify that this is a UUID? (probably not)
  (s): s is T.Branded<string, {readonly UserId: symbol}> => s.length == 36,
  'UserId'
)
export type UserId = T.TypeOf<typeof UserIdCodec>

const ConnectEventTypeCodec = T.literal('connect')
const UpdateEventTypeCodec  = T.literal('update')
const EventTypeCodec = T.union([
  ConnectEventTypeCodec,
  UpdateEventTypeCodec
])
export type EventType = T.TypeOf<typeof EventTypeCodec>

export const ConnectMessageCodec = T.type({
  eventType: ConnectEventTypeCodec,
  roomId: RoomIdCodec,
  userId: UserIdCodec,
  state: UserShareableStateCodec,
})
export type ConnectMessage = T.TypeOf<typeof ConnectMessageCodec>

export const UpdateMessageCodec = T.type({
  eventType: UpdateEventTypeCodec,
  roomId: RoomIdCodec,
  state: UserShareableStateCodec,
})
export type UpdateMessage = T.TypeOf<typeof UpdateMessageCodec>

export const MessageCodec = T.union([ConnectMessageCodec, UpdateMessageCodec])
export type Message = T.TypeOf<typeof MessageCodec>

export type Challenge = {
  name: string
  runFn: (weaponsCount: number, isUnique?: boolean) => Weapon[]
}
export type ChallengeFactory = (name: string, poolFactory: () => Weapon[]) => Challenge
