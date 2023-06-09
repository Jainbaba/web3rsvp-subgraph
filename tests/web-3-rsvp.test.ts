import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { Bytes, Address, BigInt } from "@graphprotocol/graph-ts"
import { ConfirmedAttendee } from "../generated/schema"
import { ConfirmedAttendee as ConfirmedAttendeeEvent } from "../generated/Web3RSVP/Web3RSVP"
import { handleConfirmedAttendee } from "../src/web-3-rsvp"
import { createConfirmedAttendeeEvent } from "./web-3-rsvp-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let eventId = Bytes.fromI32(1234567890)
    let attendeeAddress = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newConfirmedAttendeeEvent = createConfirmedAttendeeEvent(
      eventId,
      attendeeAddress
    )
    handleConfirmedAttendee(newConfirmedAttendeeEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("ConfirmedAttendee created and stored", () => {
    assert.entityCount("ConfirmedAttendee", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "ConfirmedAttendee",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "eventId",
      "1234567890"
    )
    assert.fieldEquals(
      "ConfirmedAttendee",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "attendeeAddress",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
