import * as T from 'io-ts'

const AmmoTypeCodec = T.union([
  T.literal('Light'),
  T.literal('Heavy'),
  T.literal('Energy'),
  T.literal('Shotgun'),
  T.literal('Sniper'),
  T.literal('Arrows'),
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
  name: T.union([
    T.literal('HAVOC Rifle'),
    T.literal('VK-47 Flatline'),
    T.literal('Hemlok Burst AR'),
    T.literal('R-301 Carbine'),
    T.literal('Alternator SMG'),
    T.literal('R-99 SMG'),
    T.literal('Volt SMG'),
    T.literal('RE-45 Auto'),
    T.literal('Prowler Burst PDW'),
    T.literal('Devotion LMG'),
    T.literal('M600 Spitfire'),
    T.literal('L-STAR EMG'),
    T.literal('G7 Scout'),
    T.literal('30-30 Repeater'),
    T.literal('Bocek Compound Bow'),
    T.literal('Triple Take'),
    T.literal('EVA-8 Auto'),
    T.literal('Mastiff Shotgun'),
    T.literal('Peacekeeper'),
    T.literal('Mozambique Shotgun'),
    T.literal('Wingman'),
    T.literal('P2020'),
    T.literal('Charge Rifle'),
    T.literal('Longbow DMR'),
    T.literal('Sentinel'),
    T.literal('Kraber .50-Cal Sniper'),
  ]),
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

export const RoomIdCodec = T.brand(
  T.string,
  (s): s is T.Branded<string, { readonly RoomId: symbol }> => s.length <= 64 && s.length > 0,
  'RoomId'
)
export type RoomId = T.TypeOf<typeof RoomIdCodec>

export const UserIdCodec = T.brand(
  T.string,
  (s): s is T.Branded<string, { readonly UserId: symbol }> => s.length === 36,
  'UserId'
)
export type UserId = T.TypeOf<typeof UserIdCodec>

const ConnectEventTypeCodec = T.literal('connect')
const ConnectedEventTypeCodec = T.literal('connected')
const UpdateEventTypeCodec  = T.literal('update')
const DisconnectEventTypeCodec  = T.literal('disconnect')
const ErrorEventTypeCodec  = T.literal('error')

const EventTypeCodec = T.union([
  ConnectEventTypeCodec,
  ConnectedEventTypeCodec,
  UpdateEventTypeCodec,
  DisconnectEventTypeCodec,
  ErrorEventTypeCodec
])
export type EventType = T.TypeOf<typeof EventTypeCodec>

export const ConnectMessageCodec = T.type({
  eventType: ConnectEventTypeCodec,
  roomId: RoomIdCodec,
  userId: UserIdCodec,
  state: UserShareableStateCodec,
})
export type ConnectMessage = T.TypeOf<typeof ConnectMessageCodec>

export const ConnectedMessageCodec = T.type({
  eventType: ConnectedEventTypeCodec,
  roomId: RoomIdCodec,
  isHost: T.boolean,
  state: UserShareableStateCodec,
})
export type ConnectedMessage = T.TypeOf<typeof ConnectedMessageCodec>

export const UpdateMessageCodec = T.type({
  eventType: UpdateEventTypeCodec,
  roomId: RoomIdCodec,
  state: UserShareableStateCodec,
})
export type UpdateMessage = T.TypeOf<typeof UpdateMessageCodec>

export const DisconnectMessageCodec = T.type({
  eventType: DisconnectEventTypeCodec
})
export type DisconnectMessage = T.TypeOf<typeof DisconnectMessageCodec>

export const ErrorMessageCodec = T.type({
  eventType: ErrorEventTypeCodec,
  message: T.string
})
export type ErrorMessage = T.TypeOf<typeof ErrorMessageCodec>

export const JSONCodec = new T.Type<any, string, string>(
  'JSONCodec',
  (input): input is string => typeof input === 'string',
  (input, context) => {
    try {
      return T.success(JSON.parse(input));
    } catch {
      return T.failure(input, context);
    }
  },
  input => JSON.stringify(input),
)

export const MessageCodec = JSONCodec.pipe(T.union([
  ConnectMessageCodec,
  ConnectedMessageCodec,
  UpdateMessageCodec,
  DisconnectMessageCodec,
  ErrorMessageCodec
]))

export type Message = T.TypeOf<typeof MessageCodec>

export type Challenge = {
  mode: 'BR' | 'ARENA'
  name: string
  getPoolQuantity: () => number
  runFn: (weaponsCount: number, isUnique?: boolean) => Weapon[]
}
export type ChallengeFactory = (
  mode: Challenge['mode'],
  name: Challenge['name'],
  poolFactory: () => Weapon[],
) => Challenge

export const TopRoomsCodec = T.type({
  topRooms: T.array(RoomIdCodec),
})
export type TopRooms = T.TypeOf<typeof TopRoomsCodec>
