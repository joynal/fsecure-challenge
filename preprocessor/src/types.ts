/* eslint-disable camelcase */
export type NewProcess = {
  cmdl: string
  user: string
}

export type NetworkConnection = {
  source_ip: string
  destination_ip: string
  destination_port: string
}

export type Submission = {
  submission_id: string
  device_id: string
  time_created: string
  events?: {
    new_process?: NewProcess[]
    network_connection?: NetworkConnection[]
  }
}

export type EventMeta = {
  device_id: string
  time_created: string
  event_type: string
}

export type EventAlias = (NewProcess | NetworkConnection)

export type Event = EventMeta & {
  event_data: EventAlias
  event_id: string
}
