import { Address, ipfs, json } from "@graphprotocol/graph-ts";
import {
  ConfirmedAttendee as ConfirmedAttendeeEvent,
  DepositsPaidOut as DepositsPaidOutEvent,
  NewEventCreated as NewEventCreatedEvent,
  NewRSVP as NewRSVPEvent
} from "../generated/Web3RSVP/Web3RSVP"
import {
  Event,
  Account,
  RSVP,
  Confirmation
} from "../generated/schema"
import { integer, metrics } from "@protofire/subgraph-toolkit";

export function handleConfirmedAttendee(event: ConfirmedAttendeeEvent): void {
  let id = event.params.eventId.toHex() + event.params.attendeeAddress.toHex();
  let newConfirmation = Confirmation.load(id);
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (newConfirmation == null && thisEvent != null) {
    newConfirmation = new Confirmation(id);
    newConfirmation.attendee = account.id;
    newConfirmation.event = thisEvent.id;
    newConfirmation.save();

    thisEvent.totalConfirmedAttendee = integer.increment(
      thisEvent.totalConfirmedAttendee
    );
    thisEvent.save();

    account.totalAttendedEvents = integer.increment(
      account.totalAttendedEvents
    );
    account.save();
  }
}

function getOrCreateAccount(address: Address): Account {
  let account = Account.load(address.toHex());
  if (account == null) {
    account = new Account(address.toHex());
    account.totalAttendedEvents = integer.ZERO;
    account.totalRSVPs = integer.ZERO;
    account.save();
  }
  return account;
}

export function handleDepositsPaidOut(event: DepositsPaidOutEvent): void {
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (thisEvent) {
    thisEvent.paidOut = true;
    thisEvent.save();
  }
}

export function handleNewEventCreated(event: NewEventCreatedEvent): void {
  let newEvent = Event.load(event.params.eventId.toHex());
  if (newEvent == null) {
    newEvent = new Event(event.params.eventId.toHex());
    newEvent.eventId = event.params.eventId;
    newEvent.eventTimestamp = event.params.eventTimestamp;
    newEvent.eventOwner = event.params.creatorAddress;
    newEvent.maxCapacity = event.params.maxCapacity;
    newEvent.deposit = event.params.deposit;
    newEvent.paidOut = false;

    newEvent.totalRSVPs = integer.ZERO;
    newEvent.totalConfirmedAttendee = integer.ZERO;

    let metadata = ipfs.cat(event.params.eventDataCID + "/data.json");

    if (metadata) {
      const value = json.fromBytes(metadata).toObject();
      if (value) {
        const name = value.get("name");
        const description = value.get("description");
        const link = value.get("link");
        const imagePath = value.get("imageURL");

        if (name) {
          newEvent.name = name.toString();
        }
        if (description) {
          newEvent.description = description.toString();
        }
        if (link) {
          newEvent.link = link.toString();
        }
        if (imagePath) {
          const imageUrl = "https://ipfs.io/ipfs/" +
            event.params.eventDataCID +
            imagePath.toString();
          newEvent.imageURL = imageUrl;
        }
        else {
          const fallbackurl =
            "https://ipfs.io/ipfs/bafybeibssbrlptcefbqfh4vpw2wlmqfj2kgxt3nil4yujxbmdznau3t5wi/event.png";
          newEvent.imageURL = fallbackurl
        }
      }
    }
    newEvent.save();
  }
}

export function handleNewRSVP(event: NewRSVPEvent): void {
  let id = event.params.eventId.toHex() + event.params.attendeeAddress.toHex();
  let newRSVP = RSVP.load(id);
  let account = getOrCreateAccount(event.params.attendeeAddress);
  let thisEvent = Event.load(event.params.eventId.toHex());
  if (newRSVP == null && thisEvent != null) {
    newRSVP = new RSVP(id);
    newRSVP.attendee = account.id;
    newRSVP.event = thisEvent.id;
    newRSVP.save();

    thisEvent.totalRSVPs = integer.increment(thisEvent.totalRSVPs);
    thisEvent.save();
    account.totalRSVPs = integer.increment(account.totalRSVPs);
    account.save();
  }
}
